from pydantic import BaseModel


class Participant(BaseModel):
    id:   str
    name: str
    role: str = ""
