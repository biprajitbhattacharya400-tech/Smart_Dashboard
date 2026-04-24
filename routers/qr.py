from fastapi import APIRouter
import qrcode
from io import BytesIO
from fastapi.responses import StreamingResponse

router = APIRouter()

# -------------------------------
# Generate QR Code
# -------------------------------
@router.get("/")
def generate_qr(data: str):
    # Create QR image
    qr = qrcode.make(data)

    # Save image to memory (not file)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="image/png")