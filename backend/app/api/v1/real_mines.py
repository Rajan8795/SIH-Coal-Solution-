from fastapi import APIRouter

from app.services.real_mines import get_real_mines

router = APIRouter()


@router.get("/")
def list_real_mines() -> list[dict]:
    return get_real_mines()