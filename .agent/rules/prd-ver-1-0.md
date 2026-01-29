---
trigger: always_on
---

Production Requirements Document (PRD)
Product name

Drug Experience Explorer (DXE) — Social pharmacovigilance signal exploration UI

Target customer

Pharmaceutical companies (Pharmacovigilance, Drug Safety, Medical Affairs, Drug Discovery RWE teams)

Target users

Subject Matter Experts (SMEs): PharmD, MD, epidemiologists, safety scientists, medical reviewers

Safety Ops / PV analysts: triage and reporting support

(Later) Data science: signal detection / clustering

Problem statement

SMEs need a fast, auditable way to:

explore social-reported drug experiences by keyword (e.g., Zepbound)

understand sentiment distribution and key narratives over time

find repeat authors, recurring topics, and high-risk themes

create reproducible “rules” (views/filters/analyses) and share them internally

Current workflows involve manual searching, screenshots, and ad hoc spreadsheets—slow, hard to reproduce, and not auditable.

Goals

Rapid exploration of drug experiences from KWatch-collected Reddit data.

Reproducible analysis via “Rules” (saved analysis templates).

Audit-friendly output: every result traceable back to source URL + timestamps.

Low operational burden: RDS + EC2 services, no manual DB babysitting.

Non-goals (MVP)

No automated regulatory submission generation (FAERS/CIOMS) in MVP.

No diagnosis, treatment advice, or clinical recommendations.

No write-back to social platforms.

No patient identity resolution.

Data & System Overview
Data sources

KWatch.io keyword alerts (Reddit)

Payload fields ingested:

link, query, author, content, datetime, platform, sentiment

Storage

RDS Postgres table: kwatch_alert_results
Columns:

id, date_text, author, url, content, sentiment, received_at, kwatch_query, keyword, raw_payload

Services

EC2 #1: Webhook ingest service (FastAPI) → writes to RDS

EC2 #2: Read API service (FastAPI) → reads from RDS (JSON endpoints)

Nginx in front of each EC2 (HTTPS via nip.io or domain)

UX Requirements (from your UI sketch)

The UI has 7 key elements.

UI Element-01: Keyword dropdown with counts

Function

Dropdown lists all keywords and total count per keyword.

Includes “All” option.

Selecting keyword triggers data refresh across page.

API needs

/api/keywords for list + counts

/api/meta/date-range for available date ranges (optional display)

/api/mentions for retrieval

Acceptance criteria

Dropdown loads < 2 seconds

Shows Keyword (count) format

Selecting keyword refreshes:

user count

post list

output chart

UI Element-02: User count text (dynamic)

Function

Show unique author count for selected keyword (and date range).

Ex: “Medication experiences by users: 187”

API needs

Add endpoint (recommended): /api/stats/unique-authors?keyword=...&start=...&end=...

Or reuse /api/authors?keyword=... and count client-side (not ideal).

Acceptance criteria

Correct unique author count within the selected window

Updates when keyword/date changes

UI Element-03: Post window (selected item)

Fields

Author

URL or post ID

Comment/content

received_at

sentiment

source (Reddit)

API needs

/api/mention?url=... or use selected row from /api/mentions

Acceptance criteria

Clicking any list item populates the detail window

“Open source” link opens Reddit URL in new tab

UI Element-04: Scrollable list window

Function

Infinite scroll / pagination for mentions

Visual highlight for sentiment (optional)

API needs

/api/mentions?keyword=...&start=...&end=...&limit=...

(Recommended next) cursor pagination: cursor=<id or received_at>

Acceptance criteria

Loads first page quickly (<2s)

Scrolling loads more without freezing

Stable ordering (received_at desc)

UI Element-05: Response/output view (charts + computed views)

MVP output examples

Sentiment trend over time (counts-by-day)

Positive vs negative count line chart

Top authors or themes (later)

API needs

/api/stats/counts-by-day

/api/stats/sentiment

/api/stats/top-authors

/api/mentions?include_raw=true (debug)

Acceptance criteria

Chart updates when keyword/date changes

Clear legend and hover tooltips

Export screenshot/image (optional later)

UI Element-06: Rule window (tabs + Apply)

Function

Multiple rules (Rule #1, Rule #2, Rule #3…)

“Apply” runs rule to regenerate UI outputs

After applying, button becomes inactive with “Applied” state until rule changes.

MVP rule concept
Rules are saved analysis templates, not code execution. For MVP:

Rule is a structured config (JSON) that selects:

chart type

sentiment grouping

date aggregation interval

highlight thresholds

filters

Acceptance criteria

Rules can be selected, edited, applied

Apply triggers API calls and updates output panel

Rule state persists (local storage MVP; DB later)

UI Element-07: Rule editor (add/edit/save/delete)

Function

Edit rule title and rule instructions (text) plus structured config (hidden).

Icons: edit, save, delete

Add new rule

Acceptance criteria

Rule can be created/edited/deleted

Unsaved changes are visually indicated

No backend writes required in MVP (store in browser local storage).
(Later: store rule definitions in DB per workspace/user)

MVP Functional Requirements
Filters (MVP)

keyword (required)

date range (start/end)

sentiment filter (optional)

author filter (optional)

free-text search (optional)

Outputs (MVP)

Mentions list

Mention detail view

Sentiment counts

Counts-by-day chart

Top authors list

Repeat authors (>=2)

Export (MVP)

Copy JSON response

CSV export (optional)

“Open in Reddit” link

Non-functional Requirements
Security

Read API is read-only (GET only)

TLS everywhere (HTTPS)

RDS security groups restrict 5432 to EC2 SGs only

No secrets in frontend

Logs must avoid dumping raw payloads unless debug mode

Performance

keyword list: <2s

mentions query: <2s for first page (limit 50–200)

stats queries: <2s typical

handle 100k+ rows without degradation (indexes required)

Reliability

services run under systemd

auto-restart on failure

basic /health endpoint

CloudWatch metrics & logs (later)

Compliance/UX disclaimers

Show disclaimer: “Observational social data; not clinical evidence.”