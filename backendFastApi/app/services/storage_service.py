from pathlib import Path
from uuid import uuid4

import aiofiles
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


class StorageService:
    def __init__(self, base_dir: Path = settings.UPLOAD_DIR) -> None:
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    async def save_upload(self, upload: UploadFile, folder: str) -> tuple[str, str | None, str]:
        safe_name = Path(upload.filename or "archivo").name
        target_dir = self.base_dir / folder
        target_dir.mkdir(parents=True, exist_ok=True)
        file_name = f"{uuid4().hex}_{safe_name}"
        target_path = target_dir / file_name
        total = 0
        async with aiofiles.open(target_path, "wb") as out_file:
            while chunk := await upload.read(1024 * 1024):
                total += len(chunk)
                if total > settings.MAX_UPLOAD_SIZE_BYTES:
                    target_path.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="El archivo supera el tamaño máximo permitido",
                    )
                await out_file.write(chunk)
        return str(target_path), upload.content_type, safe_name


storage_service = StorageService()
