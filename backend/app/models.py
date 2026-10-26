from sqlalchemy import Column, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
import uuid
from .database import Base

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Customer info
    customer_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    
    # Location - supports both 6-digit and 11-char OG 02 A09 DB 09
    state = Column(String, nullable=False)
    lga = Column(String, nullable=False)
    town = Column(String, nullable=False)
    street = Column(String, nullable=False)
    postcode = Column(String(20), nullable=False)  # FIXED: was 6, now 20 for "OG 02 A09 DB 09"
    landmark = Column(String, nullable=False)
    building_desc = Column(String, default="")
    
    # Coordinates
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # NIPOST validation - FIXED: added missing fields
    nipost_validated = Column(Boolean, default=False)
    nipost_source = Column(String, default="")  # THIS WAS MISSING - causes your 500 error
    confidence = Column(Float, default=0.0)
    
    # Status
    status = Column(String, default="pending")  # pending, out_for_delivery, delivered
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())