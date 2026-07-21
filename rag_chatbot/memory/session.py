from typing import Dict, List, Any

class ChatSessionMemory:
    def __init__(self):
        # Maps session_id -> list of message logs
        self.sessions: Dict[str, List[Dict[str, str]]] = {}

    def get_history(self, session_id: str) -> List[Dict[str, str]]:
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        return self.sessions[session_id]

    def add_message(self, session_id: str, role: str, content: str) -> None:
        history = self.get_history(session_id)
        history.append({"role": role, "content": content})
        # Keep sliding memory window of last 10 turns to stay within token boundaries
        if len(history) > 20:
            self.sessions[session_id] = history[-20:]

    def clear(self, session_id: str) -> None:
        self.sessions[session_id] = []

_global_memory = ChatSessionMemory()

def get_session_memory() -> ChatSessionMemory:
    return _global_memory
