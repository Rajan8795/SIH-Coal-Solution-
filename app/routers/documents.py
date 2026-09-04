from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request
import os
from app.core.deps import get_current_user
from app.core.upload_security import validate_and_save
from app.core.clamav_scan import scan_file
from app.core.limiter import limiter

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
@limiter.limit("10/minute")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
):
    saved = validate_and_save(file, uploaded_by=current_user.id)

    scan_result = scan_file(saved["path"])
    if scan_result["infected"]:
        os.remove(saved["path"])
        raise HTTPException(400, "File failed security scan and was rejected")

    return {"status": "uploaded and scanned clean", **saved}