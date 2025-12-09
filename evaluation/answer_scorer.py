import os
from openai import AzureOpenAI

def score_answer(query: str, answer: str, result_count: int) -> dict:
    """
    Score an answer using LLM-as-judge (reference-free).
    Returns relevance, groundedness, completeness scores (1-5).
    """
    
    client = AzureOpenAI(
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        api_key=os.getenv("AZURE_OPENAI_KEY"),
        api_version="2024-10-21"
    )
    
    prompt = f"""You are an expert evaluator for a data center AI assistant.

Score this response on three dimensions (1-5 scale):

QUERY: {query}
ANSWER: {answer}
DOCUMENTS RETRIEVED: {result_count}

Score each dimension:
1. RELEVANCE: Does the answer address what was asked? (1=off-topic, 5=perfectly relevant)
2. GROUNDEDNESS: Does the answer seem based on retrieved documents, not hallucinated? (1=made up, 5=well-grounded)
3. COMPLETENESS: Is the answer thorough enough? (1=too brief, 5=comprehensive)

Respond in this exact JSON format only:
{{"relevance": X, "groundedness": X, "completeness": X, "reasoning": "brief explanation"}}
"""

    try:
        response = client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1"),
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=200
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        print(f"Scoring error: {e}")
        return {"relevance": 0, "groundedness": 0, "completeness": 0, "reasoning": f"Error: {e}"}