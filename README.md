# Drug-Safety-Explorer [DsX]

**Drug safety and performance insights directly from patient experience**

An AI-powered DsX workbench that listens to patient experiences shared across social channels, FDA adverse event reports, and de-identified pharmacy and medical claims to generate deep, actionable insights on drug performance and safety. 
**A must-have AI tool for pharmaceutical companies developing, manufacturing, and distributing medications.
**
![Dashboard Preview](assets/dashboard_v2.png)

**(Demo on Youtube)** [https://youtu.be/GelhO3k6O1M]

## Overview

DSX is an AI-powered tool for Subject Matter Experts (SMEs) to explore medication experiences reported by patients (social, adverse events, insurance claims). 
It is designed to enable SMEs to:
- Explore patient reported drug experiences by keyword (e.g., Zepbound, Wegovy)
- Analyze medication safety and effectiveness distribution over time
- Monitor clinical or post-market medication surveillance for FDA reporting
- Identify prior conditions and other medications used 
- Generate safety and performance reports
- Use insights for drug discovery and durg repurposing

## Live Demo (in development)

[https://54-175-252-15.nip.io/](https://54-175-252-15.nip.io/)

## Architecture Overview (in development, only Reddit implemented for public channel reporting)
![DsX-Architecture](https://github.com/user-attachments/assets/6b103dfc-a0f7-4696-835a-f8d23bd69689)

## API
The API documentation (Swagger UI) is available at (https://54-175-252-15.nip.io/api/docs)[https://54-175-252-15.nip.io/api/docs]
## Technology Stack
- **Frontend**: React (Vite)
- **Backend**: Python (FastAPI, WebHook)
- **Database**: PostgreSQL (RDS)
- **AI**: ChatGPT-4o
- **Automation**: Kognitos Automation (To be implemented)
