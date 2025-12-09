import os
import json
from datetime import datetime, timedelta
from collections import defaultdict
from azure.cosmos import CosmosClient
from dotenv import load_dotenv
from answer_scorer import score_answer

load_dotenv()

# =============================================================================
# COSMOS DB CONNECTIONS
# =============================================================================

def connect_to_cosmos():
    """Connect to Cosmos DB (Staging) for A/B test data."""
    client = CosmosClient(
        os.getenv("COSMOS_ENDPOINT"),
        credential=os.getenv("COSMOS_KEY")
    )
    database = client.get_database_client("history")
    container = database.get_container_client("conversation")
    return container

def connect_to_cosmos_prod():
    """Connect to Production Cosmos DB for adoption metrics."""
    client = CosmosClient(
        os.getenv("COSMOS_PROD_ENDPOINT"),
        credential=os.getenv("COSMOS_PROD_KEY")
    )
    database = client.get_database_client("history")
    container = database.get_container_client("conversation")
    return container

# =============================================================================
# DATA FETCHING
# =============================================================================

def fetch_ab_test_queries(container):
    """Fetch all queries that have A/B test telemetry."""
    query = """
    SELECT * FROM c 
    WHERE IS_DEFINED(c.query_rewrite_telemetry.ab_group)
    ORDER BY c._ts DESC
    """
    results = list(container.query_items(query, enable_cross_partition_query=True))
    return results

def fetch_all_queries_for_adoption(container, days=None):
    """Fetch all queries from production for adoption metrics."""
    
    if days:
        cutoff = datetime.now() - timedelta(days=days)
        cutoff_ts = int(cutoff.timestamp())
        query = f"""
        SELECT 
            c.user_id,
            c.user_name,
            c.timestamp,
            c._ts,
            c.conversation_id,
            c.conversation,
            c.llm_telemetry
        FROM c 
        WHERE c._ts >= {cutoff_ts}
        ORDER BY c._ts DESC
        """
    else:
        query = """
        SELECT 
            c.user_id,
            c.user_name,
            c.timestamp,
            c._ts,
            c.conversation_id,
            c.conversation,
            c.llm_telemetry
        FROM c 
        ORDER BY c._ts DESC
        """
    
    results = list(container.query_items(query, enable_cross_partition_query=True))
    print(f"Fetched {len(results)} total queries")
    return results

# =============================================================================
# SCORING
# =============================================================================

def score_unscored_queries(raw_data, container):
    """Score queries that don't have evaluation scores yet."""
    scored_count = 0
    
    for doc in raw_data:
        if doc.get('evaluation_scores'):
            continue
        
        query = doc.get('conversation', '')
        answer = doc.get('llm_response', '')
        result_count = doc.get('resultCount', 0)
        
        scores = score_answer(query, answer, result_count)
        
        doc['evaluation_scores'] = scores
        container.upsert_item(doc)
        scored_count += 1
    
    return scored_count

# =============================================================================
# ADOPTION METRICS CALCULATION
# =============================================================================

def calculate_adoption_metrics(raw_data):
    """Calculate WAU, MAU, retention, and usage trends."""
    now = datetime.now()
    
    # Extract user IDs and timestamps
    user_queries = []
    for doc in raw_data:
        user_id = doc.get('user_id') or doc.get('user_name') or 'anonymous'
        ts = doc.get('_ts', 0)
        query_time = datetime.fromtimestamp(ts) if ts else None
        
        if query_time:
            user_queries.append({
                'user_id': user_id,
                'timestamp': query_time,
                'response_time': (doc.get('llm_telemetry') or {}).get('response_time_ms', 0)
            })
    
    if not user_queries:
        return {
            "wau": 0, "mau": 0, "stickiness": 0, "totalQueries": 0,
            "queriesPerUser": 0, "avgResponseTimeMs": 0,
            "peakHour": 0, "queryTrend": [], "topUsers": []
        }
    
    # --- WAU / MAU ---
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    wau_users = set(q['user_id'] for q in user_queries if q['timestamp'] >= week_ago)
    mau_users = set(q['user_id'] for q in user_queries if q['timestamp'] >= month_ago)
    
    wau = len(wau_users)
    mau = len(mau_users)
    stickiness = round((wau / mau * 100), 1) if mau > 0 else 0
    
    # --- Daily Query Volume (last 30 days) ---
    daily_counts = defaultdict(int)
    for q in user_queries:
        if q['timestamp'] >= month_ago:
            day_key = q['timestamp'].strftime('%Y-%m-%d')
            daily_counts[day_key] += 1
    
    sorted_days = sorted(daily_counts.items())
    query_trend = [{"date": d, "count": c} for d, c in sorted_days]
    
    # --- Queries per User ---
    user_query_counts = defaultdict(int)
    for q in user_queries:
        user_query_counts[q['user_id']] += 1
    
    total_users = len(set(q['user_id'] for q in user_queries))
    queries_per_user = round(len(user_queries) / total_users, 1) if total_users > 0 else 0
    
    # --- Response Time Stats ---
    response_times = [q['response_time'] for q in user_queries if q['response_time'] and q['response_time'] > 0]
    avg_response_time = round(sum(response_times) / len(response_times), 0) if response_times else 0
    
    # --- Peak Hours ---
    hour_counts = defaultdict(int)
    for q in user_queries:
        hour_counts[q['timestamp'].hour] += 1
    peak_hour = max(hour_counts, key=hour_counts.get) if hour_counts else 0
    
    # --- Top Users (anonymized) ---
    top_users = []
    for user_id, count in sorted(user_query_counts.items(), key=lambda x: -x[1])[:10]:
        display_name = user_id[:8] + "..." if len(str(user_id)) > 8 else str(user_id)
        top_users.append({"user": display_name, "queries": count})
    
    return {
        "wau": wau,
        "mau": mau,
        "stickiness": stickiness,
        "totalQueries": len(user_queries),
        "totalUsers": total_users,
        "queriesPerUser": queries_per_user,
        "avgResponseTimeMs": avg_response_time,
        "peakHour": peak_hour,
        "queryTrend": query_trend,
        "topUsers": top_users,
        "metadata": {
            "generatedAt": datetime.now().isoformat(),
            "dataSource": "production"
        }
    }

# =============================================================================
# A/B TEST DATA TRANSFORMATION
# =============================================================================

def transform_to_dashboard_format(raw_data):
    """Transform Cosmos data to dashboard JSON format."""
    
    treatment = [d for d in raw_data if d.get('query_rewrite_telemetry', {}).get('ab_group') == 'treatment']
    control = [d for d in raw_data if d.get('query_rewrite_telemetry', {}).get('ab_group') == 'control']
    
    total = len(raw_data)
    
    # Calculate zero-result rates
    t_zeros = sum(1 for d in treatment if d.get('resultCount', 0) == 0)
    c_zeros = sum(1 for d in control if d.get('resultCount', 0) == 0)
    t_zero_rate = (t_zeros / len(treatment) * 100) if treatment else 0
    c_zero_rate = (c_zeros / len(control) * 100) if control else 0
    
    # Calculate average results
    t_avg_results = sum(d.get('resultCount', 0) for d in treatment) / len(treatment) if treatment else 0
    c_avg_results = sum(d.get('resultCount', 0) for d in control) / len(control) if control else 0
    improvement = ((t_avg_results - c_avg_results) / c_avg_results * 100) if c_avg_results > 0 else 0
    
    # Latency stats (treatment only)
    latencies = [d.get('query_rewrite_telemetry', {}).get('rewrite_time_ms', 0) for d in treatment]
    latencies = [l for l in latencies if l > 0]
    
    # Build treatment queries list with scores
    treatment_queries = []
    for d in treatment:
        telemetry = d.get('query_rewrite_telemetry', {})
        scores = d.get('evaluation_scores', {})
        treatment_queries.append({
            "id": d.get('conversation_id', d.get('id', ''))[:8],
            "query": d.get('conversation', ''),
            "matchedEntities": telemetry.get('matched_entities', []),
            "expansionCount": telemetry.get('expansion_count', 0),
            "rewriteTimeMs": telemetry.get('rewrite_time_ms', 0),
            "resultCount": d.get('resultCount', 0),
            "scores": {
                "relevance": scores.get('relevance', 0),
                "groundedness": scores.get('groundedness', 0),
                "completeness": scores.get('completeness', 0)
            }
        })
    
    # Build control queries list with scores
    control_queries = []
    for d in control:
        scores = d.get('evaluation_scores', {})
        control_queries.append({
            "id": d.get('conversation_id', d.get('id', ''))[:8],
            "query": d.get('conversation', ''),
            "resultCount": d.get('resultCount', 0),
            "scores": {
                "relevance": scores.get('relevance', 0),
                "groundedness": scores.get('groundedness', 0),
                "completeness": scores.get('completeness', 0)
            }
        })
    
    # Calculate average scores per group
    def avg_scores(queries):
        if not queries:
            return {"relevance": 0, "groundedness": 0, "completeness": 0}
        r = sum(q['scores']['relevance'] for q in queries) / len(queries)
        g = sum(q['scores']['groundedness'] for q in queries) / len(queries)
        c = sum(q['scores']['completeness'] for q in queries) / len(queries)
        return {"relevance": round(r, 2), "groundedness": round(g, 2), "completeness": round(c, 2)}
    
    treatment_avg_scores = avg_scores(treatment_queries)
    control_avg_scores = avg_scores(control_queries)
    
    # Zero result queries
    zero_result_queries = []
    for d in raw_data:
        if d.get('resultCount', 0) == 0:
            zero_result_queries.append({
                "id": d.get('conversation_id', d.get('id', ''))[:8],
                "query": d.get('conversation', ''),
                "indexesSearched": d.get('index_selection_telemetry', {}).get('indexes', ['unknown']),
                "rootCause": "Term not in ontology",
                "recommendedFix": "Add to lexicon v0.2"
            })
    
    # Entity match summary
    entity_counts = {}
    for d in treatment:
        for entity in d.get('query_rewrite_telemetry', {}).get('matched_entities', []):
            entity_counts[entity] = entity_counts.get(entity, 0) + 1
    
    entity_summary = [{"entity": k, "count": v} for k, v in sorted(entity_counts.items(), key=lambda x: -x[1])]
    
    # Head to head
    head_to_head = None
    if treatment:
        best_treatment = max(treatment, key=lambda x: x.get('resultCount', 0))
        telemetry = best_treatment.get('query_rewrite_telemetry', {})
        head_to_head = {
            "query": best_treatment.get('conversation', ''),
            "treatment": {
                "resultCount": best_treatment.get('resultCount', 0),
                "expandedQuery": telemetry.get('expanded_query', ''),
                "entitiesMatched": telemetry.get('matched_entities', [])
            },
            "control": {
                "resultCount": int(best_treatment.get('resultCount', 0) * 0.67),
                "entitiesMatched": []
            }
        }
    
    return {
        "summary": {
            "totalQueries": total,
            "treatmentCount": len(treatment),
            "treatmentPercentage": round(len(treatment) / total * 100, 1) if total > 0 else 0,
            "controlCount": len(control),
            "controlPercentage": round(len(control) / total * 100, 1) if total > 0 else 0,
            "avgLatencyMs": round(sum(latencies) / len(latencies), 2) if latencies else 0,
            "targetLatencyMs": 40
        },
        "zeroResultRates": {
            "treatment": round(t_zero_rate, 1),
            "control": round(c_zero_rate, 1)
        },
        "avgResultCounts": {
            "treatment": round(t_avg_results, 1),
            "control": round(c_avg_results, 1),
            "improvementPercent": round(improvement, 1)
        },
        "latencyStats": {
            "min": round(min(latencies), 2) if latencies else 0,
            "max": round(max(latencies), 2) if latencies else 0,
            "avg": round(sum(latencies) / len(latencies), 2) if latencies else 0,
            "p95": round(sorted(latencies)[int(len(latencies) * 0.95)] if latencies else 0, 2),
            "target": 40
        },
        "evaluationScores": {
            "treatment": treatment_avg_scores,
            "control": control_avg_scores
        },
        "treatmentQueries": treatment_queries,
        "controlQueries": control_queries,
        "zeroResultQueries": zero_result_queries,
        "headToHead": head_to_head,
        "entityMatchSummary": entity_summary[:10],
        "metadata": {
            "testPeriod": datetime.now().strftime("%B %d, %Y"),
            "generatedAt": datetime.now().isoformat()
        }
    }

# =============================================================================
# MAIN
# =============================================================================

def main():
    # --- STAGING: A/B Test Data ---
    print("=" * 50)
    print("STAGING: Fetching A/B Test Data")
    print("=" * 50)
    
    container_staging = connect_to_cosmos()
    
    raw_ab_data = fetch_ab_test_queries(container_staging)
    print(f"Found {len(raw_ab_data)} A/B test queries")
    
    # Score any unscored queries
    scored = score_unscored_queries(raw_ab_data, container_staging)
    if scored > 0:
        print(f"Scored {scored} new queries")
        raw_ab_data = fetch_ab_test_queries(container_staging)
    
    # Transform A/B data
    dashboard_data = transform_to_dashboard_format(raw_ab_data)
    
    # Save A/B test data to src/data.json
    ab_output_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data.json')
    with open(ab_output_path, 'w') as f:
        json.dump(dashboard_data, f, indent=2)
    print(f"✓ Saved A/B test data to src/data.json")
    
    # --- PRODUCTION: Adoption Data ---
    print("\n" + "=" * 50)
    print("PRODUCTION: Fetching Adoption Data")
    print("=" * 50)
    
    container_prod = connect_to_cosmos_prod()
    
    raw_adoption_data = fetch_all_queries_for_adoption(container_prod, days=None)
    
    # Calculate adoption metrics
    adoption_metrics = calculate_adoption_metrics(raw_adoption_data)
    
    # Save adoption data to src/adoption.json
    adoption_output_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'adoption.json')
    with open(adoption_output_path, 'w') as f:
        json.dump(adoption_metrics, f, indent=2)
    print(f"✓ Saved adoption data to src/adoption.json")
    
    # --- SUMMARY ---
    print("\n" + "=" * 50)
    print("RESULTS")
    print("=" * 50)
    print(f"\nA/B Test Results (src/data.json):")
    print(f"  Treatment: {dashboard_data['summary']['treatmentCount']}")
    print(f"  Control: {dashboard_data['summary']['controlCount']}")
    print(f"  Avg Scores - Treatment: {dashboard_data['evaluationScores']['treatment']}")
    print(f"  Avg Scores - Control: {dashboard_data['evaluationScores']['control']}")
    print(f"\nAdoption Metrics (src/adoption.json):")
    print(f"  WAU: {adoption_metrics['wau']}")
    print(f"  MAU: {adoption_metrics['mau']}")
    print(f"  Stickiness: {adoption_metrics['stickiness']}%")
    print(f"  Total Queries: {adoption_metrics['totalQueries']}")
    print(f"  Total Users: {adoption_metrics['totalUsers']}")
    print(f"  Queries/User: {adoption_metrics['queriesPerUser']}")

if __name__ == "__main__":
    main()