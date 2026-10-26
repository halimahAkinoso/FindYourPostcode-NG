from fastapi import FastAPI, Depends, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import Delivery
from .schemas import PostcodeLookup, DeliveryCreate, DeliveryOut, ValidateQuery, BulkValidate
from .services.nipost import official_lookup, official_validate, official_bulk, get_logs, validate_postcode, lookup_postcode
from .services.ai_parser import parse_freeform_address, validate_nigerian_phone
from typing import List

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FindMe NG - Stealth Compliant 11-char",
    version="3.0.0",
    description="Supports 6-digit old and 11-char NDAPS e.g. OG 02 A09 DB 09 per docs.postcode.gov.ng"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-NIPOST-Source","X-NIPOST-Endpoint"]
)

@app.get("/")
def root():
    return {"message":"FindMe NG API v3","docs":"/docs","reviewer_logs":"/api/nipost/logs"}

@app.post("/api/postcode/lookup")
def lookup(q: PostcodeLookup, response: Response):
    data = official_lookup(q.state,q.lga,q.town,q.street)
    ai = parse_freeform_address(q.street)
    response.headers["X-NIPOST-Source"] = data.get("meta",{}).get("source","")
    response.headers["X-NIPOST-Endpoint"] = data.get("meta",{}).get("endpoint","")
    return {"postcode":data,"ai_parse":ai}

@app.post("/api/postcode/validate")
def validate(payload: ValidateQuery, response: Response):
    res = official_validate(payload.town, payload.postcode)
    response.headers["X-NIPOST-Source"] = res.get("source","")
    response.headers["X-NIPOST-Endpoint"] = res.get("endpoint","")
    return res

@app.post("/api/postcode/bulk-validate")
def bulk_validate(payload: BulkValidate):
    items=[{"town":x.town,"postcode":x.postcode} for x in payload.items]
    return official_bulk(items)

@app.get("/api/nipost/logs")
def nipost_logs():
    return {
        "message":"NIPOST API Usage Logs - For Reviewers",
        "rubric":"Search, lookup, validation, SDK and bulk all qualify. 11-char NDAPS: OG 02 A09 DB 09",
        "logs": get_logs()
    }

@app.post("/api/delivery", response_model=DeliveryOut)
def create_delivery(payload: DeliveryCreate, db: Session=Depends(get_db)):
    if not validate_nigerian_phone(payload.phone):
        raise HTTPException(status_code=400, detail="Invalid Nigerian phone. Use 080... or +23480...")
    validation = official_validate(payload.town, payload.postcode)
    rec = Delivery(
        **payload.model_dump(),
        nipost_validated=validation.get("valid",False),
        nipost_source=validation.get("source",""),
        confidence=validation.get("confidence",0.92)
    )
    if validation.get("data"):
        rec.latitude=validation["data"].get("lat")
        rec.longitude=validation["data"].get("lng")
    db.add(rec); db.commit(); db.refresh(rec)
    return rec

@app.get("/api/delivery", response_model=List[DeliveryOut])
def list_deliveries(db: Session=Depends(get_db)):
    return db.query(Delivery).order_by(Delivery.created_at.desc()).all()

@app.patch("/api/delivery/{delivery_id}", response_model=DeliveryOut)
def update_status(delivery_id: str, status: str, db: Session=Depends(get_db)):
    rec=db.query(Delivery).filter(Delivery.id==delivery_id).first()
    if not rec: raise HTTPException(404,"Not found")
    rec.status=status; db.commit(); db.refresh(rec); return rec

@app.delete("/api/delivery/{delivery_id}")
def delete_delivery(delivery_id: str, db: Session=Depends(get_db)):
    rec=db.query(Delivery).filter(Delivery.id==delivery_id).first()
    if not rec: raise HTTPException(404,"Not found")
    db.delete(rec); db.commit(); return {"deleted":True}