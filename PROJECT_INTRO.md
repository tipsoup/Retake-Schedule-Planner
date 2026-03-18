# Project Introduction

## Name
Retake Schedule Planner

## Purpose
This project helps students who are applying for retake/exemption courses and still want to attend classes in person.

In many schools, retake application pages do not provide a complete real-time timetable view. This tool bridges that gap by using official timetable exports and generating conflict-free, ranked plans.

## Target Users
- Students preparing for graduation credit risk control
- Students applying for retake or exemption but needing practical class attendance
- Students who want fast, local, private timetable planning

## Core Features
- Parse official timetable files saved by browser Ctrl+S
- Normalize complex time rules (odd/even week, split ranges, multiple time blocks)
- Build all conflict-free combinations
- Score and rank plans
- Real-time web preview with week switch

## Why It Is Reusable
- Local deployment only
- Input-driven: just replace files in input folder
- Output and UI are auto-generated from new source data
- No hardcoded personal identity data

## Typical Workflow
1. Save official timetable pages as mhtml files.
2. Put files in input folder.
3. Run build script.
4. Open local web UI and review ranked plans.
5. Choose feasible classes and submit application.

## Notes
This project is built for practical decision support, not as an official enrollment system.
