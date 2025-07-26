from typing import Optional
import os
import logging
from langchain.chains import RetrievalQA
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.vectorstores import Chroma
from app.utils.transcript import get_transcript # Ensure this is imported

MAX_QUESTION_LENGTH = 500

logger = logging.getLogger(__name__)

def get_answer(video_id: str, question: str) -> Optional[str]:
    """
    Answers a user question using:
    - Buddy Mode (general knowledge only, no transcript)
    - Default Mode (transcript-based only)
    - Beyond Mode (special case: transcript answer + general knowledge supplement if transcript is lacking)
    """

    try:
        logger.info(f"Starting QA processing for video {video_id}")

        # Validate inputs
        if not video_id or len(video_id) > 100:
            logger.error(f"Invalid video ID: {video_id}")
            raise ValueError("Invalid video ID")
            
        if not question or len(question) > MAX_QUESTION_LENGTH:
            logger.error(f"Invalid question length: {len(question)}")
            raise ValueError("Question too long or empty")

        # Initialize LLM (used in all modes)
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-lite",
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.3
        )

        # --------------------------
        # 1) BUDDY MODE (general knowledge, no transcript)
        # --------------------------
        if "buddy" in question.lower():
            try:
                logger.info("Buddy Mode activated (no transcript)")
                response = llm.invoke(
                    f"You are Buddy Mode AI. Ignore any video transcript. "
                    f"Answer naturally using your general knowledge only.\n\n"
                    f"User Question: {question}"
                )
                return f"Answer: {response.content.strip()}"
            except Exception as e:
                logger.error(f"Buddy mode error: {str(e)}", exc_info=True)
                return "I couldn't answer your question in Buddy mode right now."

        # --------------------------
        # 2) DEFAULT + BEYOND MODES (transcript-based answers)
        # --------------------------
        # Setup embeddings and Chroma for transcript-based retrieval
        embedding_function = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=os.getenv("GEMINI_API_KEY")
        )
        chroma_path = f"chroma_db/{video_id}"

        if not os.path.exists(chroma_path):
            # This is where the transcript is fetched and stored
            # get_transcript now returns (transcript_text, language)
            transcript_text, _ = get_transcript(video_id) 
            if not transcript_text:
                return "No transcript available for this video"
            Chroma.from_texts(
                [transcript_text], # Use the extracted text
                embedding=embedding_function,
                persist_directory=chroma_path
            )

        vectorstore = Chroma(
            persist_directory=chroma_path,
            embedding_function=embedding_function
        )

        # Prompt template for transcript-based QA
        prompt_template = """
# GOAL
Answer the user's question strictly based on the provided video transcript.
Start your answer with "Based on the video:".
If no relevant answer is found, clearly state: "The transcript does not contain an answer to this question."

CONTEXT:
<transcript>
{context}
</transcript>

USER QUESTION:
{question}

<thinking>
Reason step by step privately here.
</thinking>

FINAL ANSWER:
"""
        prompt = ChatPromptTemplate.from_template(prompt_template)

        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vectorstore.as_retriever(),
            chain_type_kwargs={"prompt": prompt, "document_variable_name": "context"}
        )

        # --------------------------
        # Run transcript-based QA
        # --------------------------
        logger.info(f"Processing question: {question[:50]}...")
        try:
            result = qa_chain.invoke({"query": question})
            transcript_answer = result.get("result", "").strip()

            if not transcript_answer:
                transcript_answer = "The transcript does not contain an answer to this question."

            # --------------------------
            # 3) BEYOND (special case)
            # --------------------------
            if question.lower().startswith("beyond the transcript"):
                # Only add general knowledge if transcript lacks info
                if transcript_answer.startswith("The transcript does not contain") or \
                   "i don't know" in transcript_answer.lower() or \
                   "i'm not sure" in transcript_answer.lower():
                    try:
                        general_resp = llm.invoke(
                            f"Provide a helpful, factual answer using only general knowledge for this question: {question}"
                        )
                        general_answer = general_resp.content.strip()
                        return f"Based on the video: {transcript_answer}\n\nBeyond the video: {general_answer}"
                    except Exception as e:
                        logger.error(f"Beyond supplement error: {str(e)}", exc_info=True)
                        return transcript_answer
                else:
                    return f"Based on the video: {transcript_answer}"

            # --------------------------
            # Normal Default Mode
            # --------------------------
            if any(x in transcript_answer.lower() for x in ["i don't know", "i'm not sure"]):
                return "The video doesn't specifically mention this, but it discusses: " + transcript_answer

            return f"Answer: {transcript_answer}"

        except Exception as e:
            logger.error(f"QA chain error: {str(e)}", exc_info=True)
            return "I couldn't process your question at this time"

    except Exception as e:
        logger.error(f"QA system error: {str(e)}", exc_info=True)
        return "System Error: Please try again later"