import re
from typing import Dict

LANDMARKS = ["first bank", "gtbank", "gtb", "access bank", "zenith", "uba", "shoprite", "spar", "market", "mosque", "church", "school", "hospital", "police station", "filling station"]

PHONE_RE = re.compile(r"^(?:\+234|0)[789][01]\d{8}$")

def parse_freeform_address(text: str) -> Dict:
    t = text.lower()
    found_landmarks = [lm for lm in LANDMARKS if lm in t]
    # Detect building type
    if any(x in t for x in ["bank","shop","store","market","mall"]):
        btype = "commercial"
    elif any(x in t for x in ["estate","apartment","flat","house","bq"]):
        btype = "residential"
    else:
        btype = "mixed"
    # Extract floor/bus-stop hints
    hints = []
    if "beside" in t: hints.append("beside landmark")
    if "opposite" in t: hints.append("opposite landmark")
    if "junction" in t or "bus stop" in t: hints.append("near bus-stop")
    
    return {
        "cleaned_street": text.strip(),
        "detected_landmark": found_landmarks[0] if found_landmarks else "",
        "all_landmarks": found_landmarks,
        "building_type": btype,
        "hints": hints,
        "confidence": 0.88 if found_landmarks else 0.65
    }

def validate_nigerian_phone(phone: str) -> bool:
    return bool(PHONE_RE.match(phone.replace(" ", "").replace("-", "")))

def structure_address(free_text: str, state="", lga="", town=""):
    ai = parse_freeform_address(free_text)
    return {
        "state": state,
        "lga": lga,
        "town": town,
        "street": ai["cleaned_street"],
        "landmark": ai["detected_landmark"],
        "ai": ai
    }
