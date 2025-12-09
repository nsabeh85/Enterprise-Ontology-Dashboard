def score_unscored_queries(raw_data, container):
    """Score queries that don't have evaluation_scores yet"""
    scored_count = 0
    
    for doc in raw_data:
        if 'evaluation_scores' not in doc:
            scores = score_answer(
                query=doc.get('conversation', ''),
                answer=doc.get('llm_response', ''),
                result_count=doc.get('resultCount', 0)
            )
            doc['evaluation_scores'] = scores
            
            # Update Cosmos
            try:
                container.upsert_item(doc)
                scored_count += 1
            except Exception as e:
                print(f"Failed to update {doc.get('id')}: {e}")
    
    print(f"Scored {scored_count} new queries")
    return raw_data