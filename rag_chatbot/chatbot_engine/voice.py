import os
from openai import OpenAI
from rag_chatbot.config import config
from rag_chatbot.utilities.logger import log_error

class RAGVoiceHandler:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or config.openai_api_key
        self.is_mock = not self.api_key
        if not self.is_mock:
            self.client = OpenAI(api_key=self.api_key)

    def synthesize_text(self, text: str, output_path: str = "response.mp3") -> str:
        """
        Synthesizes text into spoken audio (Text-to-Speech).
        Saves output file to output_path.
        """
        if self.is_mock:
            # Simulation: Create a dummy text file describing the synthesized text
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(f"[Mock TTS Audio Response]\nInput Text: {text}")
            return f"Mock TTS output saved to '{output_path}'"

        try:
            response = self.client.audio.speech.create(
                model=config.tts_model,
                voice=config.tts_voice,
                input=text
            )
            response.write_to_file(output_path)
            return f"Audio output saved to '{output_path}'"
        except Exception as e:
            log_error(f"TTS Speech synthesis failed: {e}")
            raise e

    def transcribe_audio(self, audio_path: str) -> str:
        """
        Transcribes spoken audio file into text (Speech-to-Text).
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        if self.is_mock:
            # Simulation: Match keywords in the filename or return a default query
            filename = os.path.basename(audio_path).lower()
            if "instagram" in filename:
                return "How do I link an Instagram profile?"
            elif "score" in filename or "virality" in filename:
                return "What is the virality score?"
            else:
                return "What is SocialOS?"

        try:
            with open(audio_path, "rb") as audio_file:
                transcription = self.client.audio.transcriptions.create(
                    model=config.stt_model,
                    file=audio_file
                )
            return transcription.text
        except Exception as e:
            log_error(f"STT Audio transcription failed: {e}")
            raise e
