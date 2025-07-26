#embed_store.py
import os
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
import logging

MAX_TRANSCRIPT_LENGTH = 100000  # ~100k characters

def store_embeddings(video_id: str, transcript: str):
    try:
        if not video_id or len(video_id) > 100:
            raise ValueError("Invalid video ID")
        if not transcript or len(transcript) > MAX_TRANSCRIPT_LENGTH:
            raise ValueError("Transcript too long or empty")
            
        documents = [Document(page_content=chunk) for chunk in RecursiveCharacterTextSplitter(
            chunk_size=500, chunk_overlap=100).split_text(transcript)]

        Chroma.from_documents(
            documents=documents,
            embedding=GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=os.getenv("GEMINI_API_KEY")
            ),
            persist_directory=f"chroma_db/{video_id}"
        )
    except Exception as e:
        logging.error(f"Failed to store embeddings: {str(e)}")
        raise
