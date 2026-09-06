import json, base64

with open("mfa_response.json") as f:
    data = json.load(f)

qr_base64 = data["qr_code_base64"]
with open("mfa_qr.png", "wb") as img_file:
    img_file.write(base64.b64decode(qr_base64))

print("QR code saved as mfa_qr.png")