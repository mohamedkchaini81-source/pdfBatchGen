import threading
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Optional


class JobStatus(str, Enum):
    QUEUED     = "queued"
    PROCESSING = "processing"
    COMPLETED  = "completed"
    CANCELLED  = "cancelled"
    FAILED     = "failed"


@dataclass
class ExportJob:
    job_id:            str
    status:            JobStatus       = JobStatus.QUEUED
    total_records:     int             = 0
    completed_records: int             = 0
    current_name:      str             = ""
    error:             Optional[str]   = None
    output_path:       Optional[Path]  = None
    output_filename:   str             = "export.pdf"
    created_at:        datetime        = field(default_factory=datetime.utcnow)
    # Thread-safe cancellation flag
    _cancel_event:     threading.Event = field(default_factory=threading.Event)

    @property
    def percentage(self) -> int:
        if self.total_records == 0:
            return 0
        return round(self.completed_records / self.total_records * 100)

    def request_cancel(self) -> None:
        self._cancel_event.set()

    def is_cancelled(self) -> bool:
        return self._cancel_event.is_set()

    def to_dict(self) -> dict:
        return {
            "jobId":            self.job_id,
            "status":           self.status.value,
            "completedRecords": self.completed_records,
            "totalRecords":     self.total_records,
            "percentage":       self.percentage,
            "currentName":      self.current_name,
            "error":            self.error,
        }
