# Drug-Safety-Explorer [DSX]

**Drug safety and performance insights directly from patient experience**

An AI-powered DSX workbench that listens to patient experiences shared across social channels, FDA adverse event reports, and de-identified pharmacy and medical claims to generate deep, actionable insights on drug performance and safety. A must-have AI tool for pharmaceutical companies developing, manufacturing, and distributing medications.

![Dashboard Preview](assets/dashboard_v2.png)

## Overview

DSX is a tool for Subject Matter Experts (SMEs) to explore social-reported drug experiences to understand safety and performance. It allows SMEs to:
- Explore patient reported drug experiences by keyword (e.g., Zepbound)
- Analyze distribution of reports over time
- Identify prior conditions and other medications used 
- Generate safety and performance reports

## Live Demo (in development)

[https://54-175-252-15.nip.io/](https://54-175-252-15.nip.io/)

## Architecture Overview (in development, only Reddit implemented for public channel reporting)
![DsX-Architecture](https://github.com/user-attachments/assets/6b103dfc-a0f7-4696-835a-f8d23bd69689)


## Technology Stack
- **Frontend**: React (Vite)
- **Backend**: Python (FastAPI, WebHook)
- **Database**: PostgreSQL (RDS)
- **AI**: ChatGPT-4o
- **Automation**: Kognitos Automation (To be implemented)
