from typing import Optional

from pydantic import BaseModel, ConfigDict


class OfficerRef(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    name: str
    avatar: Optional[str] = None
    initials: Optional[str] = None
