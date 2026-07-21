from pydantic import BaseModel, Field


class RulerBox(BaseModel):
    left:   float = Field(ge=0, le=1)
    right:  float = Field(ge=0, le=1)
    top:    float = Field(ge=0, le=1)
    bottom: float = Field(ge=0, le=1)


class TextFieldConfig(BaseModel):
    ruler:       RulerBox
    maxFontSize: int   = Field(default=48, ge=8, le=500)
    colorHex:    str   = "#111111"
    rotation:    float = Field(default=0, ge=-180, le=180)
    fontWeight:  int   = 400
    fontStyle:   str   = "normal"   # "normal" | "italic"


class ExportSettings(BaseModel):
    textMode:      str   = "auto"       # auto | ar | en
    exportMethod:  str   = "individual" # individual | zip | merged
    pageIndex:     int   = 0
    pageWidth:     float = 0
    pageHeight:    float = 0
    hasRoleColumn: bool  = False
    pdfFileName:   str   = "export"
