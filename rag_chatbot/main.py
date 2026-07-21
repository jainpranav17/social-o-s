import os
import sys

# Ensure parent directory is in path to allow absolute/relative imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rag_chatbot.chatbot_engine.core import RAGChatbotEngine
from rag_chatbot.config import config

def main():
    print("=" * 60)
    print("[RAG Chatbot] SocialOS Production RAG Chatbot Engine CLI")
    print("=" * 60)
    print("Commands:")
    print("  /upload <file_path>  - Ingest, split, embed, and index a document")
    print("  /list                - List metadata of all ingested documents")
    print("  /delete <doc_id>     - Delete document from vector database")
    print("  /clear               - Clear current session chat history")
    print("  /history             - Show conversation log history")
    print("  /exit                - Exit the CLI")
    print("  <any query text>     - Ask a RAG question directly")
    print("-" * 60)
    
    # Initialize engine
    try:
        engine = RAGChatbotEngine()
    except Exception as e:
        print(f"Initialization Error: {e}")
        print("Please check your configuration or credentials.")
        return

    session_id = "default_cli_session"
    
    while True:
        try:
            user_input = input("\n[RAG Assistant] > ").strip()
            if not user_input:
                continue
                
            if user_input.lower() == "/exit":
                print("Exiting RAG assistant. Goodbye!")
                break
                
            elif user_input.startswith("/upload"):
                parts = user_input.split(" ", 1)
                if len(parts) < 2:
                    print("Error: Please provide a file path. Example: /upload C:/docs/manual.pdf")
                    continue
                filepath = parts[1].strip()
                if not os.path.exists(filepath):
                    print(f"Error: File path does not exist: {filepath}")
                    continue
                print(f"Uploading and parsing file: {filepath} ...")
                res = engine.upload_document(filepath)
                print(res)
                
            elif user_input.lower() == "/list":
                docs = engine.store.list_documents()
                if not docs:
                    print("No documents ingested yet.")
                else:
                    print(f"\nIngested Documents ({len(docs)}):")
                    for d in docs:
                        print(f"  • ID: {d['doc_id']} | File: {d['filename']} | Size: {d['size_bytes']} bytes")
                        
            elif user_input.startswith("/delete"):
                parts = user_input.split(" ", 1)
                if len(parts) < 2:
                    print("Error: Please provide a document ID. Example: /delete doc_123abc456def")
                    continue
                doc_id = parts[1].strip()
                print(f"Deleting document chunks for ID: {doc_id} ...")
                engine.store.delete_document(doc_id)
                print("Deleted successfully.")
                
            elif user_input.lower() == "/clear":
                engine.memory.clear(session_id)
                print("Conversation history cleared.")
                
            elif user_input.lower() == "/history":
                history = engine.memory.get_history(session_id)
                if not history:
                    print("No chat history in this session.")
                else:
                    print(f"\nConversation History ({len(history) // 2} turns):")
                    for turn in history:
                        role_label = "User" if turn["role"] == "user" else "Bot"
                        print(f"{role_label}: {turn['content']}")
                        
            elif user_input.startswith("/"):
                print(f"Unknown command: {user_input}. Type /exit to close, or ask a question directly.")
                
            else:
                # Process as a direct RAG query
                print("Thinking ...")
                reply, chunks = engine.ask(user_input, session_id=session_id)
                print("-" * 40)
                print(reply)
                print("-" * 40)
                
        except KeyboardInterrupt:
            print("\nExiting RAG assistant. Goodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
