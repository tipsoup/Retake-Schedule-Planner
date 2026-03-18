# Retake Schedule Planner (CQUPT-Friendly)

[中文说明 / Chinese](README.zh-CN.md) | [English](README.md)

A reusable local project for students who need to choose take/retake classes based on official timetable exports.

Tested against Chongqing University of Posts and Telecommunications (CQUPT) course selection timetable pages.

This project is designed for scenarios like:
- The normal class timetable is visible in the official system.
- Retake/exemption application pages do not provide a complete timetable view.
- You want to attend classes in person and need a realistic weekly preview before submitting selections.

## What It Does

- Reads timetable files saved directly from browser (Ctrl+S) as .mhtml.
- Also supports .xlsx input if needed.
- Parses complex class time fields:
  - multi time blocks for one class
  - odd/even week patterns
  - segmented week ranges
- Cleans and normalizes data.
- Generates all conflict-free combinations and ranks them by score.
- Provides a local web UI with:
  - ranked plans list
  - one-click plan preview
  - real-time weekly timetable panel
  - week switcher (ALL / week N)
  - settings panel: dark mode, two demo obfuscation modes (deterministic / random), and language switch (zh/en)

## VibeCoding Note

This project is a VibeCoding-style practical tool, focused on "usable first" local deployment and iterative improvement.

It also follows an AI Agent Coding workflow to speed up implementation, validation, and iteration.

Demo mode can optionally use a third-party glyph font (for example, HoYo-Glyphs); design rights and ownership belong to their respective rights holders.

## Disclaimer

- This tool is for planning assistance only, not an official school system.
- Final enrollment results, class capacity, and policy interpretation depend on your university's official platform.
- Users are responsible for verifying critical decisions in official channels.

## Folder Structure

- input: place your timetable files here (.mhtml preferred)
- scripts/build_data.py: parse and build data
- scripts/serve.py: start local web server
- web/index.html: UI
- web/app.js: UI logic
- web/styles.css: styles
- web/data/data.json: generated frontend data
- output/class_blocks.csv: normalized long-table data
- output/validation_report.json: audit report
- output/classes_normalized.json: normalized classes JSON

## Quick Start

1) Install Python packages

pip install -r requirements.txt

2) Put your files in input

Use browser Ctrl+S from official timetable pages and save .mhtml files into input.

3) Build data

python scripts/build_data.py

4) Start web app

python scripts/serve.py --port 8016

5) Open in browser

http://127.0.0.1:8016

## Preview

![Final UI Preview](images/example.png)

## Rebuild Command (Custom Path)

python scripts/build_data.py --input-dir input --web-json web/data/data.json --audit-dir output --min-week 1 --max-week 16

## Data Formats (Recommended)

For reliable reuse, keep three layers:
- Raw source: local .mhtml files in input
- Normalized compute format: output/class_blocks.csv
- Audit format: output/validation_report.json

## Troubleshooting

- If web page says data load failed:
  - ensure web/data/data.json exists
  - run python scripts/build_data.py again
- If no valid combos found:
  - check output/validation_report.json
  - verify week range and course files

## License

MIT
