#!/usr/bin/env python3
from __future__ import annotations

import argparse
import glob
import itertools
import json
import os
import quopri
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from email import policy
from email.parser import BytesParser
from io import StringIO
from typing import Dict, List, Sequence, Set, Tuple

import pandas as pd

COL_CLASS = "教学班"
COL_TIME = "上课时间"
COL_TEACHER = "教师"
ODD = "单周"
EVEN = "双周"


def normalize_col(name: str) -> str:
    return str(name).replace("\n", "").replace("\r", "").replace(" ", "").strip()


def parse_weeks(part: str, min_week: int, max_week: int) -> Set[int]:
    text = part.strip()
    has_odd = ODD in text
    has_even = EVEN in text
    text = text.replace(ODD, "").replace(EVEN, "").replace("周", "").strip()

    weeks: Set[int] = set()
    if not text:
        return weeks

    m = re.fullmatch(r"(\d+)\s*-\s*(\d+)", text)
    if m:
        a, b = map(int, m.groups())
        weeks.update(range(min(a, b), max(a, b) + 1))
    elif re.fullmatch(r"\d+", text):
        weeks.add(int(text))
    else:
        for a, b in re.findall(r"(\d+)\s*-\s*(\d+)", text):
            start = min(int(a), int(b))
            end = max(int(a), int(b))
            weeks.update(range(start, end + 1))
        for x in re.findall(r"(?<!-)\b(\d+)\b(?!-)", text):
            weeks.add(int(x))

    in_range_weeks = {w for w in weeks if min_week <= w <= max_week}
    # Keep original weeks as a fallback if all parsed weeks are outside the configured range.
    # This prevents valid rows (e.g. week 19) from being dropped entirely.
    weeks = in_range_weeks if in_range_weeks else weeks
    if has_odd and not has_even:
        weeks = {w for w in weeks if w % 2 == 1}
    if has_even and not has_odd:
        weeks = {w for w in weeks if w % 2 == 0}
    return weeks


def split_segments(text: str) -> List[str]:
    normalized = text.replace("，", ",").replace("；", ";").replace("+", ";").replace("＋", ";").replace(" ", "")
    segs = re.findall(r"星期[1-7天日].*?(?=星期[1-7天日]|$)", normalized)
    if segs:
        return segs
    rough = [x for x in normalized.split(";") if x]
    return rough if rough else [normalized]


def parse_time_blocks(raw: str, min_week: int, max_week: int) -> Tuple[List[dict], List[str]]:
    text = str(raw or "").strip()
    if not text:
        return [], ["EMPTY_TIME"]

    blocks: List[dict] = []
    warnings: List[str] = []

    for segment in split_segments(text):
        day_match = re.search(r"星期([1-7天日])", segment)
        period_match = re.search(r"第(\d+)-(\d+)节", segment)
        if not day_match or not period_match:
            warnings.append(f"BAD_SEGMENT:{segment}")
            continue

        day_map = {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "天": 7, "日": 7}
        day = day_map[day_match.group(1)]
        p1, p2 = map(int, period_match.groups())
        periods = list(range(min(p1, p2), max(p1, p2) + 1))

        tail = segment[period_match.end() :]
        week_parts = [x for x in tail.split(",") if x] or [f"{min_week}-{max_week}周"]

        flags: Set[str] = set()
        weeks: Set[int] = set()
        for part in week_parts:
            weeks.update(parse_weeks(part, min_week, max_week))
            if ODD in part:
                flags.add(ODD)
            if EVEN in part:
                flags.add(EVEN)

        if not weeks:
            warnings.append(f"EMPTY_WEEKS:{segment}")
            continue

        blocks.append({"day": day, "periods": periods, "weeks": sorted(weeks), "flags": sorted(flags)})

    return blocks, warnings


def read_mhtml_html(path: str) -> str:
    with open(path, "rb") as f:
        msg = BytesParser(policy=policy.default).parse(f)

    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                charset = part.get_content_charset() or "utf-8"
                raw_payload = part.get_payload(decode=False)
                raw_bytes = raw_payload.encode("utf-8", errors="ignore") if isinstance(raw_payload, str) else (raw_payload or b"")
                decoded = quopri.decodestring(raw_bytes)
                return decoded.decode(charset, errors="ignore")

    decoded = quopri.decodestring(msg.as_bytes())
    return decoded.decode("utf-8", errors="ignore")


def read_mhtml_table(path: str) -> pd.DataFrame:
    html = read_mhtml_html(path)
    tables = pd.read_html(StringIO(html))
    if not tables:
        raise RuntimeError(f"No table found in {path}")

    picked = None
    for t in tables:
        cols = [normalize_col(c) for c in t.columns]
        if COL_CLASS in cols and COL_TIME in cols:
            picked = t.copy()
            picked.columns = cols
            break

    if picked is None:
        raise RuntimeError(f"Cannot find target columns in {path}")

    for col in ["教学班分类", "课程号-课程名", COL_CLASS, "类别", "班级/专业", "学生名单", "备注"]:
        if col in picked.columns:
            picked[col] = picked[col].replace("", pd.NA).ffill().fillna("")

    for col in [COL_CLASS, COL_TIME, COL_TEACHER]:
        if col not in picked.columns:
            picked[col] = ""

    return picked.fillna("")


def discover_sources(input_dir: str) -> Tuple[str, List[str]]:
    mhtml = sorted(glob.glob(os.path.join(input_dir, "*.mhtml")))
    xlsx = sorted(glob.glob(os.path.join(input_dir, "*.xlsx")))
    if mhtml:
        return "mhtml", mhtml
    if xlsx:
        return "xlsx", xlsx
    raise RuntimeError(f"No .mhtml or .xlsx found in {input_dir}")


def load_course_df(path: str, source_type: str) -> pd.DataFrame:
    if source_type == "mhtml":
        return read_mhtml_table(path)
    return pd.read_excel(path).fillna("")


@dataclass(frozen=True)
class ClassItem:
    course: str
    class_id: str
    teacher: str
    time_raw: str
    blocks: Tuple[dict, ...]
    slots: frozenset[Tuple[int, int, int]]
    odd_even: bool
    has_late: bool
    has_fri_afternoon: bool
    active_days: Tuple[int, ...]
    non_continuous_weeks: bool


def dedupe_blocks(blocks: Sequence[dict]) -> List[dict]:
    seen = set()
    out = []
    for b in blocks:
        key = (b["day"], tuple(b["periods"]), tuple(b["weeks"]), tuple(b["flags"]))
        if key in seen:
            continue
        seen.add(key)
        out.append(b)
    return out


def choose_teacher(teachers: Sequence[str]) -> str:
    c = Counter([t for t in teachers if t])
    if not c:
        return ""
    return c.most_common(1)[0][0]


def build_item(course: str, class_id: str, teacher: str, time_raw: str, blocks: Sequence[dict]) -> ClassItem:
    slots: Set[Tuple[int, int, int]] = set()
    odd_even = False
    has_late = False
    has_fri_afternoon = False
    days = set()
    non_continuous = False

    for block in blocks:
        day = block["day"]
        periods = block["periods"]
        weeks = block["weeks"]
        days.add(day)

        if ODD in block["flags"] or EVEN in block["flags"]:
            odd_even = True
        if any(p >= 7 for p in periods):
            has_late = True
        if day == 5 and any(p >= 5 for p in periods):
            has_fri_afternoon = True

        if weeks:
            w_first, w_last = weeks[0], weeks[-1]
            if len(weeks) != (w_last - w_first + 1):
                non_continuous = True

        for week in weeks:
            for period in periods:
                slots.add((week, day, period))

    return ClassItem(
        course=course,
        class_id=class_id,
        teacher=teacher,
        time_raw=time_raw,
        blocks=tuple(blocks),
        slots=frozenset(slots),
        odd_even=odd_even,
        has_late=has_late,
        has_fri_afternoon=has_fri_afternoon,
        active_days=tuple(sorted(days)),
        non_continuous_weeks=non_continuous,
    )


def score_combo(items: Sequence[ClassItem]) -> dict:
    all_days = sorted({d for x in items for d in x.active_days})
    occupied_days = len(all_days)
    day_span = (max(all_days) - min(all_days)) if all_days else 6

    fri = sum(1 for x in items if x.has_fri_afternoon)
    late = sum(1 for x in items if x.has_late)
    odd_even = sum(1 for x in items if x.odd_even)
    non_continuous = sum(1 for x in items if x.non_continuous_weeks)

    non_day_penalty = sum(1 for x in items if any(slot[2] >= 9 for slot in x.slots)) + late
    outside_123 = sum(1 for x in items if not any(d in (1, 2, 3) for d in x.active_days))

    s1 = 100 - 20 * fri - 12 * non_day_penalty - 3 * odd_even - 2 * late - 2 * non_continuous
    s2 = 100 - 25 * outside_123 - 6 * occupied_days - 3 * day_span - 1 * non_continuous
    s3 = 100 - 10 * odd_even - 8 * late - 4 * fri - 3 * occupied_days - 2 * non_continuous
    total = round(0.5 * s1 + 0.3 * s2 + 0.2 * s3, 2)

    return {
        "s1": s1,
        "s2": s2,
        "s3": s3,
        "total": total,
        "stats": {
            "occupiedDays": occupied_days,
            "daySpan": day_span,
            "friAfternoon": fri,
            "lateClasses": late,
            "oddEvenClasses": odd_even,
            "nonContinuousClasses": non_continuous,
        },
    }


def safe_mkdir(path: str) -> None:
    if not os.path.exists(path):
        os.makedirs(path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Build conflict-free ranked schedules from local files")
    parser.add_argument("--input-dir", default="input", help="Folder containing course tables (.mhtml or .xlsx)")
    parser.add_argument("--web-json", default="web/data/data.json", help="Output JSON for web frontend")
    parser.add_argument("--audit-dir", default="output", help="Output folder for audit reports")
    parser.add_argument("--min-week", type=int, default=1)
    parser.add_argument("--max-week", type=int, default=16)
    args = parser.parse_args()

    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    input_dir = os.path.join(root, args.input_dir)
    web_json = os.path.join(root, args.web_json)
    audit_dir = os.path.join(root, args.audit_dir)

    source_type, source_files = discover_sources(input_dir)

    courses: Dict[str, List[ClassItem]] = {}
    quality = {
        "sourceType": source_type,
        "sourceFileCount": len(source_files),
        "totalRows": 0,
        "emptyClassRows": 0,
        "emptyTimeRows": 0,
        "parseWarningRows": 0,
        "fullParseFailedRows": 0,
        "mergedClassRows": 0,
        "droppedCourseFiles": 0,
    }

    class_block_rows = []
    validation_rows = []

    for path in source_files:
        source_file = os.path.basename(path)
        course_name = os.path.splitext(source_file)[0]
        df = load_course_df(path, source_type).fillna("")
        quality["totalRows"] += len(df)

        if COL_CLASS not in df.columns:
            raise KeyError(f"Missing column {COL_CLASS} in {path}")

        class_agg = defaultdict(lambda: {"teachers": [], "raws": [], "blocks": [], "warnings": [], "sourceRows": []})

        for row_idx, row in df.iterrows():
            class_id = str(row.get(COL_CLASS, "")).strip()
            teacher = str(row.get(COL_TEACHER, "")).strip()
            time_raw = str(row.get(COL_TIME, "")).strip()

            if not class_id:
                quality["emptyClassRows"] += 1
                continue
            if not time_raw:
                quality["emptyTimeRows"] += 1
                continue

            blocks, warnings = parse_time_blocks(time_raw, args.min_week, args.max_week)
            if warnings:
                quality["parseWarningRows"] += 1
            if not blocks:
                quality["fullParseFailedRows"] += 1
                validation_rows.append(
                    {
                        "course": course_name,
                        "classId": class_id,
                        "sourceFile": source_file,
                        "sourceRow": int(row_idx) + 2,
                        "timeRaw": time_raw,
                        "warnings": warnings,
                        "status": "dropped_no_valid_blocks",
                    }
                )
                continue

            agg = class_agg[class_id]
            agg["teachers"].append(teacher)
            agg["raws"].append(time_raw)
            agg["blocks"].extend(blocks)
            agg["warnings"].extend(warnings)
            agg["sourceRows"].append(int(row_idx) + 2)

        rows: List[ClassItem] = []
        for class_id, agg in class_agg.items():
            if len(agg["sourceRows"]) > 1:
                quality["mergedClassRows"] += len(agg["sourceRows"]) - 1

            merged_blocks = dedupe_blocks(agg["blocks"])
            teacher = choose_teacher(agg["teachers"])

            raw_uniq = []
            seen_raw = set()
            for raw in agg["raws"]:
                if raw in seen_raw:
                    continue
                seen_raw.add(raw)
                raw_uniq.append(raw)
            merged_raw = " || ".join(raw_uniq)

            item = build_item(course_name, class_id, teacher, merged_raw, merged_blocks)
            rows.append(item)

            validation_rows.append(
                {
                    "course": course_name,
                    "classId": class_id,
                    "sourceFile": source_file,
                    "sourceRows": agg["sourceRows"],
                    "timeRawMerged": merged_raw,
                    "blockCount": len(merged_blocks),
                    "warnings": sorted(set(agg["warnings"])),
                    "status": "kept",
                }
            )

            for block in merged_blocks:
                class_block_rows.append(
                    {
                        "course": course_name,
                        "classId": class_id,
                        "teacher": teacher,
                        "day": block["day"],
                        "periodStart": block["periods"][0],
                        "periodEnd": block["periods"][-1],
                        "weeks": ",".join(str(w) for w in block["weeks"]),
                        "flags": "/".join(block["flags"]),
                    }
                )

        if not rows:
            quality["droppedCourseFiles"] += 1
            validation_rows.append(
                {
                    "course": course_name,
                    "classId": "*",
                    "sourceFile": source_file,
                    "status": "dropped_course_no_valid_rows",
                    "reason": "all rows dropped after cleaning/parsing",
                }
            )
            continue

        rows.sort(key=lambda x: x.class_id)
        courses[course_name] = rows

    if len(courses) < 1:
        raise RuntimeError("No valid course files after cleaning")

    course_names = list(courses.keys())
    all_combos = []

    for combo in itertools.product(*[courses[name] for name in course_names]):
        all_slot_sets = [x.slots for x in combo]
        has_conflict = False
        for i in range(len(all_slot_sets)):
            for j in range(i + 1, len(all_slot_sets)):
                if all_slot_sets[i] & all_slot_sets[j]:
                    has_conflict = True
                    break
            if has_conflict:
                break
        if has_conflict:
            continue

        score = score_combo(combo)
        all_combos.append({"pick": {x.course: x.class_id for x in combo}, "score": score})

    if not all_combos:
        raise RuntimeError("No conflict-free combos after cleaning")

    all_combos.sort(key=lambda x: (-x["score"]["total"], -x["score"]["s1"], -x["score"]["s2"], -x["score"]["s3"]))

    top_by_s1 = max(all_combos, key=lambda x: x["score"]["s1"])
    top_by_s2 = max(all_combos, key=lambda x: x["score"]["s2"])
    base = top_by_s1["pick"]

    def diff_count(combo_pick: dict) -> int:
        return sum(1 for c in course_names if combo_pick[c] != base[c])

    top_by_s3_diverse = None
    for combo in sorted(all_combos, key=lambda x: (-x["score"]["s3"], -x["score"]["total"])):
        if diff_count(combo["pick"]) >= min(2, len(course_names)):
            top_by_s3_diverse = combo
            break
    if top_by_s3_diverse is None:
        top_by_s3_diverse = max(all_combos, key=lambda x: x["score"]["s3"])

    out_courses = []
    for course_name, items in courses.items():
        out_courses.append(
            {
                "name": course_name,
                "classes": [
                    {
                        "id": it.class_id,
                        "teacher": it.teacher,
                        "timeRaw": it.time_raw,
                        "blocks": list(it.blocks),
                        "flags": {
                            "oddEven": it.odd_even,
                            "late": it.has_late,
                            "friAfternoon": it.has_fri_afternoon,
                            "nonContinuousWeeks": it.non_continuous_weeks,
                        },
                    }
                    for it in items
                ],
            }
        )

    output = {
        "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "assumptions": {
            "weekRange": f"{args.min_week}-{args.max_week}",
            "scoreWeights": {"s1": 0.5, "s2": 0.3, "s3": 0.2},
            "sorting": "total desc, then s1/s2/s3 desc",
        },
        "quality": quality,
        "courseNames": course_names,
        "courses": out_courses,
        "combos": [{"rank": i + 1, "pick": c["pick"], "score": c["score"]} for i, c in enumerate(all_combos)],
        "presets": {
            "plan1": {"name": "Plan 1: Pass Assurance", "pick": top_by_s1["pick"]},
            "plan2": {"name": "Plan 2: Thesis Friendly", "pick": top_by_s2["pick"]},
            "plan3": {"name": "Plan 3: Fallback", "pick": top_by_s3_diverse["pick"]},
        },
    }

    safe_mkdir(os.path.dirname(web_json))
    with open(web_json, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False)

    safe_mkdir(audit_dir)
    with open(os.path.join(audit_dir, "classes_normalized.json"), "w", encoding="utf-8") as f:
        json.dump(out_courses, f, ensure_ascii=False, indent=2)

    report = {
        "generatedAt": output["generatedAt"],
        "quality": quality,
        "notes": [
            "sourceRows is derived row index in parsed table.",
            "status=dropped_no_valid_blocks rows are excluded from optimization.",
            f"weekRange for conflict checks is fixed to {args.min_week}-{args.max_week}.",
        ],
        "validationRows": validation_rows,
    }

    with open(os.path.join(audit_dir, "validation_report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    pd.DataFrame(class_block_rows).to_csv(os.path.join(audit_dir, "class_blocks.csv"), index=False, encoding="utf-8-sig")

    print(
        json.dumps(
            {
                "sourceType": source_type,
                "sourceFiles": [os.path.basename(x) for x in source_files],
                "courseCount": len(out_courses),
                "comboCount": len(all_combos),
                "quality": quality,
                "webJson": web_json,
                "auditDir": audit_dir,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
