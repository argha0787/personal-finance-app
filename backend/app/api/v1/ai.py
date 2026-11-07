import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.config import settings
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.api.v1.dashboard import dashboard

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["AI assistant"])


class QuestionRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1200)


@router.post("/ask")
async def ask_assistant(
    payload: QuestionRequest,
    user: User = Depends(get_current_user),
    db=Depends(get_db),
) -> dict[str, str]:
    if not settings.gemini_api_key:
        raise HTTPException(status_code=503, detail="AI assistant is not configured. Set GEMINI_API_KEY on the backend.")
    summary = dashboard(user=user, db=db)
    context = summary["summary"]
    prompt = (
        "You are a financial information assistant. Explain only the supplied summary, state uncertainty, "
        "and never claim to execute transactions or give guaranteed outcomes. Do not request account numbers, "
        "passwords, or identity documents. This is general information, not professional financial advice.\n\n"
        f"Period: {summary['period']}\n"
        f"Currency: {summary['currency']}\n"
        f"Verified summary: {context}\n\n"
        f"User question: {payload.question}"
    )
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent"
    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(
                endpoint,
                headers={"x-goog-api-key": settings.gemini_api_key},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.3, "maxOutputTokens": 700},
                },
            )
            response.raise_for_status()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="The AI provider took too long to respond.") from None
    except httpx.HTTPStatusError as exc:
        logger.warning("Gemini request failed with status %s", exc.response.status_code)
        raise HTTPException(status_code=502, detail="The AI provider could not complete this request.") from None
    except httpx.RequestError:
        logger.exception("Could not reach Gemini provider")
        raise HTTPException(status_code=502, detail="The AI provider is currently unreachable.") from None

    try:
        answer = response.json()["candidates"][0]["content"]["parts"][0]["text"]
    except (ValueError, KeyError, IndexError, TypeError):
        logger.error("Gemini response did not contain generated text")
        raise HTTPException(status_code=502, detail="The AI provider returned an unusable response.") from None
    return {"answer": answer, "source": "Gemini; figures are limited to the verified summary above."}