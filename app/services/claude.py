import json
import os
from typing import Optional

import anthropic

client = anthropic.AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

ANALYSIS_SCHEMA = """
{
  "summary": "string — 2-4 sentence overview of the call",
  "sentiment": {
    "sales_rep": "positive | neutral | negative",
    "customer": "positive | neutral | negative"
  },
  "key_moments": ["array of strings — notable moments: objections, pricing discussions, competitor mentions, buying signals"],
  "action_items": [
    { "owner": "string — who is responsible", "task": "string — what they need to do", "due": "string date or null" }
  ],
  "next_steps": [
    { "priority": 1, "action": "string — specific next step for the sales rep", "rationale": "string — why this is important" }
  ],
  "salesforce": {
    "Task": {
      "Subject": "string — call subject line",
      "Description": "string — brief call description",
      "CallDisposition": "string — e.g. Connected, Left Voicemail, No Answer",
      "DurationInMinutes": 0
    },
    "Opportunity": {
      "NextStep": "string or null",
      "StageName": "string or null — only if stage change detected"
    },
    "Contact": {
      "FirstName": "string or null",
      "LastName": "string or null",
      "Email": "string or null",
      "Phone": "string or null"
    },
    "FollowUpTasks": [
      { "Subject": "string", "ActivityDate": "YYYY-MM-DD or null", "Priority": "High | Normal | Low" }
    ]
  }
}
"""

SYSTEM_PROMPT = """You are an expert sales analyst. Analyze sales call transcripts and extract structured insights.
Always respond with valid JSON only — no markdown, no explanation, just the JSON object.
Use null for any fields you cannot confidently extract from the transcript.
Next steps should be specific, actionable, and grounded in sales best practices."""


async def analyze_transcript(transcript: str, duration_seconds: Optional[float] = None) -> dict:
    """
    Send transcript to Claude for analysis.
    Returns parsed dict matching the analysis schema.
    Raises ValueError if Claude returns unparseable output.
    """
    duration_hint = ""
    if duration_seconds:
        minutes = round(duration_seconds / 60, 1)
        duration_hint = f"\nCall duration: {minutes} minutes."

    user_message = f"""Analyze this sales call transcript and return a JSON object matching exactly this schema:

{ANALYSIS_SCHEMA}

Transcript:{duration_hint}
{transcript}"""

    message = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    raw = message.content[0].text.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        lines = raw.splitlines()
        raw = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Claude returned invalid JSON: {e}. Raw output: {raw[:200]}")


async def analyze_memo(transcript: str, duration_seconds: Optional[float] = None) -> dict:
    """
    Analyze a post-call voice memo (single speaker — no customer sentiment needed).
    Reuses analyze_transcript but hints that this is a rep's memo, not a full call.
    """
    memo_prefix = "[POST-CALL VOICE MEMO — single speaker, sales rep recapping their own thoughts]\n\n"
    return await analyze_transcript(memo_prefix + transcript, duration_seconds)
