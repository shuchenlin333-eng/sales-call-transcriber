from pydantic import BaseModel
from typing import Optional


class Sentiment(BaseModel):
    sales_rep: str  # positive | neutral | negative
    customer: str


class ActionItem(BaseModel):
    owner: str
    task: str
    due: Optional[str] = None


class NextStep(BaseModel):
    priority: int
    action: str
    rationale: str


class SalesforceTask(BaseModel):
    Subject: str
    Description: str
    CallDisposition: str
    DurationInMinutes: int


class SalesforceOpportunity(BaseModel):
    NextStep: Optional[str] = None
    StageName: Optional[str] = None


class SalesforceContact(BaseModel):
    FirstName: Optional[str] = None
    LastName: Optional[str] = None
    Email: Optional[str] = None
    Phone: Optional[str] = None


class SalesforceFollowUpTask(BaseModel):
    Subject: str
    ActivityDate: Optional[str] = None
    Priority: str  # High | Normal | Low


class SalesforcePayload(BaseModel):
    Task: SalesforceTask
    Opportunity: SalesforceOpportunity
    Contact: SalesforceContact
    FollowUpTasks: list[SalesforceFollowUpTask]


class AnalysisResult(BaseModel):
    summary: str
    sentiment: Optional[Sentiment] = None
    key_moments: list[str]
    action_items: list[ActionItem]
    next_steps: list[NextStep]
    salesforce: SalesforcePayload


class TranscriptResponse(BaseModel):
    transcript: str
    duration_seconds: Optional[float] = None


class AnalyzeRequest(BaseModel):
    transcript: str
    duration_seconds: Optional[float] = None
