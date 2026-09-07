import re

with open("../PROJECT_STATUS.md", "r") as f:
    ps = f.read()

ps = ps.replace("Current Milestone: 1 — Foundation", "Current Milestone: 2 — Database Models & Core Meetings API")
ps = re.sub(r"\*\*Status: COMPLETE\*\*", "**Status: COMPLETE**", ps)

# Add to completed work
completed_work = """
### Milestone 2: Backend Core
- [x] Database Models (Meetings, Tags, Action Items, Chapters, Summary, Transcripts, Participants)
- [x] Pydantic Schemas
- [x] Repositories & Services layer implemented
- [x] API endpoints for Meetings CRUD, Tags, Action Items, Chapters, Transcripts, Summaries
- [x] Pytest suite covering all CRUD endpoints and pagination/filtering
- [x] Seed data script (`seed.py`) with realistic business meetings
"""

ps = ps.replace("## Next Milestone: 2 — Database Models & Core Meetings API", completed_work + "\n\n## Next Milestone: 3 — Transcription & Features")
with open("../PROJECT_STATUS.md", "w") as f:
    f.write(ps)

with open("../README.md", "r") as f:
    rmd = f.read()

rmd = rmd.replace("Milestone 1: Complete", "Milestone 1: Complete\nMilestone 2: Complete")

with open("../README.md", "w") as f:
    f.write(rmd)
