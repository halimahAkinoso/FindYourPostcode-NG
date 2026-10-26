from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PostcodeLookup(BaseModel):
    state: str
    lga: str
    town: str
    street: str

class ValidateQuery(BaseModel):
    town: str
    postcode: str  # Now accepts both: 120101 (6-digit) and OG 02 A09 DB 09 (11-char)

class BulkValidate(BaseModel):
    items: List[ValidateQuery]

class DeliveryCreate(BaseModel):
    customer_name: str
    phone: str
    state: str
    lga: str
    town: str
    street: str
    postcode: str  # No min/max limit - allows OG 02 A09 DB 09 with spaces
    landmark: str
    building_desc: Optional[str] = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class DeliveryOut(DeliveryCreate):
    id: str
    nipost_validated: bool
    nipost_source: str
    confidence: float
    status: str
    created_at: datetime
    class Config:
        from_attributes = True