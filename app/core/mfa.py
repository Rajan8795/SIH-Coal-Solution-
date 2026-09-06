import pyotp
import qrcode
import io
import base64

def generate_mfa_secret() -> str:
    return pyotp.random_base32()

def get_totp_uri(secret: str, email: str, issuer: str = "Mining Compliance App") -> str:
    return pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name=issuer)

def generate_qr_code_base64(uri: str) -> str:
    img = qrcode.make(uri)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode()

def verify_totp_code(secret: str, code: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)
