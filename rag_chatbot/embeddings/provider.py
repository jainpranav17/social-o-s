import os
import hashlib
from typing import List
from openai import OpenAI
from rag_chatbot.config import config

class BaseEmbeddingProvider:
    def get_embedding(self, text: str) -> List[float]:
        raise NotImplementedError
    
    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError

class OpenAIEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or config.openai_api_key
        self.model = model or config.embedding_model
        
        self.is_mock = not self.api_key
        if not self.is_mock:
            self.client = OpenAI(api_key=self.api_key)

    def _generate_mock_vector(self, text: str) -> List[float]:
        """Generates a deterministic 1536-dimension pseudo-embedding vector for offline testing, correlated by words."""
        words = [w.strip(".,!?\"'()").lower() for w in text.split()]
        words = [w for w in words if len(w) > 3]
        if not words:
            words = ["default"]
            
        vector = [0.0] * 1536
        for word in words:
            h = hashlib.md5(word.encode('utf-8')).hexdigest()
            for i in range(1536):
                val = float(int(h[i % len(h)], 16)) / 15.0 - 0.5
                vector[i] += val
                
        # Normalize to unit length
        magnitude = sum(x*x for x in vector) ** 0.5
        if magnitude > 0:
            vector = [x / magnitude for x in vector]
            
        return vector

    def get_embedding(self, text: str) -> List[float]:
        if self.is_mock:
            return self._generate_mock_vector(text)
            
        res = self.client.embeddings.create(
            input=[text],
            model=self.model
        )
        return res.data[0].embedding

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        if self.is_mock:
            return [self._generate_mock_vector(t) for t in texts]
            
        res = self.client.embeddings.create(
            input=texts,
            model=self.model
        )
        return [item.embedding for item in res.data]

def get_embedding_provider() -> BaseEmbeddingProvider:
    return OpenAIEmbeddingProvider()
