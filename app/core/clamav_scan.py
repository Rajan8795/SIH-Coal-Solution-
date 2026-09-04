import pyclamd

def get_clamd_client():
    cd = pyclamd.ClamdNetworkSocket(host="127.0.0.1", port=3310)
    cd.ping()
    return cd

def scan_file(filepath: str) -> dict:
    cd = get_clamd_client()
    result = cd.scan_file(filepath)
    if result is None:
        return {"infected": False, "detail": "clean"}
    status, virus_name = list(result.values())[0]
    return {"infected": status == "FOUND", "detail": virus_name}