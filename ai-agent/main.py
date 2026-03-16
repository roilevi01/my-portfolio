import os
import re
import json
import uuid
import time
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from groq import Groq
 
load_dotenv()
 
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL   = os.getenv("GROQ_MODEL", "llama3-8b-8192")
 
client = Groq(api_key=GROQ_API_KEY)
 
app = FastAPI(title="Portfolio AI Agent – Roi Levi (Groq)")
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
# =========================
# Models
# =========================
class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: Optional[str] = None
 
class ChatResponse(BaseModel):
    reply: str
    actions: Optional[List[str]] = None
    session_id: Optional[str] = None
 
 
# =========================
# Facts
# =========================
ABOUT_FACTS = {
    "שם": "רועי לוי",
    "תפקיד": "מפתח Full Stack",
    "מיקוד": ["חשיבה מערכתית", "קוד נקי", "חוויית משתמש"],
    "טכנולוגיות": {
        "צד לקוח": ["Angular", "React"],
        "צד שרת": [".NET"],
        "מסדי נתונים": ["SQL", "MongoDB"],
        "כללי": ["REST", "אוטומציה"],
    },
    "פרויקטים בולטים": [
        {
            "שם": "Freelance4U",
            "מה זה": "פלטפורמה לפרילנסרים עם הרשאות, פרופילים ותהליכים מלאים",
            "דגשים": ["ניהול משתמשים והרשאות", "תהליכים מקצה לקצה", "קוד נקי ותחזוקה"],
        },
        {
            "שם": "בוט התראות למניות",
            "מה זה": "בוט שמעדכן דרך Telegram על תזוזות/אירועים בשוק בזמן אמת",
            "דגשים": ["חיבור לנתונים בזמן אמת", "התראות נקיות", "מיקוד במה שחשוב למשתמש"],
        },
        {
            "שם": "פורטפוליו אישי",
            "מה זה": "אתר פורטפוליו עם עיצוב מודרני וצ'אט AI",
            "דגשים": ["חוויית משתמש", "רספונסיביות", "נראות מקצועית למגייסים"],
        },
    ],
    "סגנון עבודה": [
        "מסודר ואחראי",
        "אוהב פתרונות ברורים",
        "מסתכל על התמונה הגדולה ולא רק על משימה נקודתית",
    ],
    "יצירת קשר": {
        "טלפון": "0527051756",
        "לינקדאין": "www.linkedin.com/in/roi-levi01",
    },
}
ABOUT_FACTS_JSON = json.dumps(ABOUT_FACTS, ensure_ascii=False)
PROJECTS_BY_NAME = {p["שם"]: p for p in ABOUT_FACTS["פרויקטים בולטים"]}
 
# =========================
# System Prompt
# =========================
SYSTEM_PROMPT = """
אתה סוכן ה-AI של הפורטפוליו של רועי לוי.
 
חוקים מחייבים:
- ענה בעברית תקנית בלבד.
- אל תכתוב באנגלית בכלל. חריג: שמות טכנולוגיות/מותגים נשארים כפי שהם (Angular, React, .NET, MongoDB, SQL, REST, Telegram).
- אל תכתוב את השם "Roi" או "Levi" באנגלית — תמיד "רועי" / "רועי לוי".
- אל תמציא מידע שלא מופיע בעובדות.
- תן תשובות קריאות, מסודרות, עם ריווח ושורות.
- אל תחזור על אותה תשובה שוב ושוב.
- אם מבקשים משהו שלא קשור לרועי/לפורטפוליו: החזר בעדינות לנושא.
- אם המשתמש מקלל/תוקף: השב בקצרה ובאדיבות, בקש שפה מכבדת והצע להמשיך.
 
מטרה:
להציג את רועי בצורה מקצועית למגייסים/לקוחות ולהניע לפעולה.
""".strip()
 
# =========================
# Session state
# =========================
SESSION_TTL_SECONDS = 15 * 60
_sessions: Dict[str, Dict[str, Any]] = {}
 
def get_session_id(req: ChatRequest) -> str:
    if req.session_id and req.session_id.strip():
        return req.session_id.strip()
    return str(uuid.uuid4())
 
def get_state(session_id: str) -> Dict[str, Any]:
    now = time.time()
    expired = [k for k, v in _sessions.items() if now - v.get("ts", now) > SESSION_TTL_SECONDS]
    for k in expired:
        _sessions.pop(k, None)
 
    if session_id not in _sessions:
        _sessions[session_id] = {
            "ts": now, "last_intent": None, "last_topic": None,
            "last_project": None, "warnings": 0, "cooldown_until": 0,
        }
    else:
        _sessions[session_id]["ts"] = now
    return _sessions[session_id]
 
def reset_to_menu_state(state: Dict[str, Any]) -> None:
    state["last_intent"] = "recruiter"
    state["last_topic"] = None
    state["last_project"] = None
 
# =========================
# Helpers
# =========================
BAD_LANGUAGE = ["זין", "בן זונה", "מניאק", "חרא", "אפס", "טמבל", "מטומטם", "כוס", "שרמוטה"]
 
def has_bad_language(text: str) -> bool:
    t = text.lower()
    return any(w in t for w in BAD_LANGUAGE)
 
def is_confused_reply(text: str) -> bool:
    t = text.strip().lower()
    return t in {"מה", "מה?", "לא הבנתי", "הבנתי", "אוקי", "??", "?", "איך", "למה"} or len(t) <= 2
 
def normalize_spaced_letters(text: str) -> str:
    t = text or ""
    t = re.sub(r"(?<=\w)-(?=\w)", "", t)
    return t
 
def clean_reply(text: str) -> str:
    t = (text or "").strip()
    t = re.sub(r"\n{3,}", "\n\n", t)
    replacements = {"Roi": "רועי", "Levi": "לוי", "Backend": "צד שרת", "Frontend": "צד לקוח"}
    for k, v in replacements.items():
        t = t.replace(k, v)
    if len(t) < 25:
        return "בטח. מה מעניין אותך יותר—פרויקטים, טכנולוגיות או יצירת קשר?"
    return t
 
def is_back_to_menu(text: str) -> bool:
    return text.strip().lower() in {"חזרה לתפריט", "תפריט", "חזרה", "התחלה", "בית"}
 
# =========================
# Intent detection
# =========================
def detect_intent(text: str) -> str:
    t = text.strip().lower()
    if re.search(r"(תודה|תודה רבה|אחלה|מעולה|סבבה|תותח|מלך)", t): return "smalltalk_thanks"
    if re.search(r"(שלום|היי|הי|מה נשמע|מה קורה)", t): return "smalltalk_hello"
    if re.search(r"(צור קשר|יצירת קשר|טלפון|אימייל|לינקדאין)", t): return "contact"
    if re.search(r"(פרויקטים|פרויקט|עבודות|מה בנית|תיק עבודות)", t): return "projects"
    if re.search(r"(טכנולוגיות|סטאק|כלים|שפות|במה אתה משתמש)", t): return "stack"
    if re.search(r"(מי אתה|מי זה|ספר על רועי|על עצמך|תקציר)", t): return "about"
    if re.search(r"(מגייס|ראיון|למה לבחור|למה כדאי|התאמה|משרה)", t): return "recruiter"
    if re.search(r"(נסח|לנסח|ניסוח|הודעה|פנייה|מכתב)", t): return "compose"
    if re.search(r"(freelance4u|בוט|מניות|פורטפוליו)", t): return "project_detail"
    return "general"
 
# =========================
# Actions
# =========================
MAIN_ACTIONS     = ["פרויקטים מרכזיים", "טכנולוגיות", "יצירת קשר"]
RECRUITER_ACTIONS = ["תקציר על רועי", "פרויקטים מרכזיים", "טכנולוגיות", "למה כדאי לגייס את רועי", "יצירת קשר"]
COMPOSE_ACTIONS  = ["לנסח הודעה ללינקדאין", "לנסח הודעה בוואטסאפ", "לנסח מייל קצר", "חזרה לתפריט"]
 
def recruiter_menu_response(session_id: str) -> ChatResponse:
    return ChatResponse(reply="כדי שיהיה לך קל ומהיר, בחר אחת מהאפשרויות:", actions=RECRUITER_ACTIONS, session_id=session_id)
 
def normalize_choice(text: str) -> str:
    mapping = {"1": "תקציר על רועי", "2": "פרויקטים מרכזיים", "3": "טכנולוגיות", "4": "למה כדאי לגייס את רועי", "5": "יצירת קשר"}
    t = text.strip()
    return mapping.get(t, re.sub(r"\s+", " ", t).strip())
 
# =========================
# Quick replies
# =========================
def quick_contact() -> str:
    c = ABOUT_FACTS["יצירת קשר"]
    return f"בשמחה! הנה פרטי יצירת קשר עם רועי:\n\n• טלפון: {c['טלפון']}\n• לינקדאין: {c['לינקדאין']}\n\nרוצה שאנסח הודעה קצרה לשליחה?"
 
def quick_about() -> str:
    return "רועי לוי הוא מפתח Full Stack עם חשיבה מערכתית ודגש חזק על קוד נקי וחוויית משתמש.\nהוא עובד מסודר, אוהב פתרונות ברורים, ורואה את התמונה הגדולה.\n\nמה תרצה לראות עכשיו?"
 
def quick_projects() -> str:
    ps = ABOUT_FACTS["פרויקטים בולטים"][:3]
    lines = ["הנה כמה פרויקטים מרכזיים של רועי:\n"]
    for p in ps:
        lines.append(f"• {p['שם']} – {p['מה זה']}")
        for d in p["דגשים"][:2]:
            lines.append(f"  - {d}")
        lines.append("")
    lines.append("רוצה להעמיק בפרויקט מסוים? כתוב את שם הפרויקט.")
    return "\n".join(lines).strip()
 
def quick_project_detail(name: str) -> Optional[str]:
    p = PROJECTS_BY_NAME.get(name)
    if not p: return None
    lines = [f"מעולה. הנה פירוט על הפרויקט: {p['שם']}\n", f"{p['מה זה']}\n", "דגשים:"]
    for d in p["דגשים"]:
        lines.append(f"• {d}")
    lines.append("\nרוצה לשמוע על הטכנולוגיות או ליצור קשר?")
    return "\n".join(lines).strip()
 
def quick_stack() -> str:
    tech = ABOUT_FACTS["טכנולוגיות"]
    return (f"הטכנולוגיות המרכזיות של רועי:\n\n• צד לקוח: {', '.join(tech['צד לקוח'])}\n"
            f"• צד שרת: {', '.join(tech['צד שרת'])}\n• מסדי נתונים: {', '.join(tech['מסדי נתונים'])}\n"
            f"• כללי: {', '.join(tech['כללי'])}\n\nרוצה לראות איך זה בא לידי ביטוי באחד הפרויקטים?")
 
def quick_recruiter_pitch() -> str:
    return ("אם אתה מגייס, הנה למה כדאי לשקול את רועי:\n\n"
            "• חשיבה מערכתית – בונה פתרונות שאפשר לתחזק לאורך זמן.\n"
            "• קוד נקי – סדר, אחריות, ושמירה על יציבות.\n"
            "• חוויית משתמש – חשוב לו שהמוצר יהיה ברור ונעים.\n"
            "• ניסיון בפרויקטים מקצה לקצה.\n\nרוצה פרטי קשר או סקירה של הפרויקטים?")
 
def compose_linkedin_message() -> str:
    return "בטח. הנה הודעה קצרה ומכבדת ללינקדאין:\n\nהיי רועי,\nראיתי את הפרופיל והפרויקטים שלך והם ממש עניינו אותי.\nאשמח לשוחח על התאמה לתפקיד ועל הניסיון שלך בעבודה מקצה לקצה.\nנוח לך שנקבע שיחה קצרה?\n"
 
def compose_whatsapp_message() -> str:
    return "בטח. הנה הודעת וואטסאפ קצרה:\n\nהיי רועי, מה נשמע?\nראיתי את הפורטפוליו והפרויקטים שלך והם ממש הרשימו אותי.\nאשמח לשוחח על התאמה לתפקיד / שיתוף פעולה. נוח לך שנדבר?\n"
 
def compose_email_message() -> str:
    return "בטח. הנה מייל קצר ומקצועי:\n\nנושא: פנייה לגבי תפקיד / שיתוף פעולה\n\nהיי רועי,\nעברתי על הפורטפוליו והפרויקטים שלך והתרשמתי מהעבודה ומהסדר.\nאשמח לשוחח על התאמה לתפקיד.\nמתי נוח לך לשיחה קצרה?\n\nתודה,\n[השם שלך]\n"
 
# =========================
# Menu choice handling
# =========================
def handle_menu_choice(text: str, state: Dict[str, Any], session_id: str) -> Optional[ChatResponse]:
    choice = normalize_choice(text)
 
    if choice in {"חזרה לתפריט", "תפריט", "התחלה", "בית", "חזרה"}:
        reset_to_menu_state(state)
        return recruiter_menu_response(session_id)
    if choice in {"תקציר על רועי", "תקציר", "על רועי"}:
        return ChatResponse(reply=quick_about(), actions=MAIN_ACTIONS, session_id=session_id)
    if choice in {"פרויקטים מרכזיים", "פרויקטים", "פרויקט"}:
        return ChatResponse(reply=quick_projects(), actions=["Freelance4U", "בוט התראות למניות", "פורטפוליו אישי", "יצירת קשר", "חזרה לתפריט"], session_id=session_id)
    if choice in {"טכנולוגיות", "סטאק", "כלים"}:
        return ChatResponse(reply=quick_stack(), actions=["פרויקטים מרכזיים", "יצירת קשר", "חזרה לתפריט"], session_id=session_id)
    if choice in {"למה כדאי לגייס את רועי", "למה לגייס", "למה לבחור", "התאמה"}:
        return ChatResponse(reply=quick_recruiter_pitch(), actions=["יצירת קשר", "פרויקטים מרכזיים", "חזרה לתפריט"], session_id=session_id)
    if choice in {"יצירת קשר", "צור קשר", "טלפון", "לינקדאין"}:
        return ChatResponse(reply=quick_contact(), actions=COMPOSE_ACTIONS, session_id=session_id)
    if choice in {"לנסח הודעה ללינקדאין", "הודעה ללינקדאין"}:
        return ChatResponse(reply=compose_linkedin_message(), actions=["יצירת קשר", "חזרה לתפריט"], session_id=session_id)
    if choice in {"לנסח הודעה בוואטסאפ", "הודעה בוואטסאפ"}:
        return ChatResponse(reply=compose_whatsapp_message(), actions=["יצירת קשר", "חזרה לתפריט"], session_id=session_id)
    if choice in {"לנסח מייל קצר", "מייל קצר"}:
        return ChatResponse(reply=compose_email_message(), actions=["יצירת קשר", "חזרה לתפריט"], session_id=session_id)
    if choice in PROJECTS_BY_NAME:
        detail = quick_project_detail(choice)
        return ChatResponse(reply=detail or "רוצה פרויקטים, טכנולוגיות או יצירת קשר?", actions=["טכנולוגיות", "יצירת קשר", "חזרה לתפריט"], session_id=session_id)
    return None
 
# =========================
# Groq fallback
# =========================
def call_groq(user_message: str) -> str:
    try:
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": f"{SYSTEM_PROMPT}\n\nעובדות על רועי:\n{ABOUT_FACTS_JSON}"
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            temperature=0.2,
            max_tokens=300,
        )
        reply = completion.choices[0].message.content.strip()
        return clean_reply(reply) if reply else "לא הצלחתי לנסח תשובה כרגע."
    except Exception as e:
        return "יש בעיה זמנית. נסה שוב בעוד רגע."
 
# =========================
# Health
# =========================
@app.get("/health")
def health():
    return {"status": "ok", "model": GROQ_MODEL}
 
# =========================
# Endpoint
# =========================
@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    session_id = get_session_id(req)
    state = get_state(session_id)
 
    msg = normalize_spaced_letters((req.message or "").strip())
    if not msg:
        return ChatResponse(reply="תכתוב הודעה קצרה ונמשיך 🙂", actions=MAIN_ACTIONS, session_id=session_id)
 
    if is_back_to_menu(msg):
        reset_to_menu_state(state)
        return recruiter_menu_response(session_id)
 
    now = time.time()
    if state.get("cooldown_until", 0) > now:
        return ChatResponse(reply="רגע קטן 🙂 נסה שוב בעוד שנייה.", actions=MAIN_ACTIONS, session_id=session_id)
    state["cooldown_until"] = now + 0.35
 
    if has_bad_language(msg):
        state["warnings"] = int(state.get("warnings", 0)) + 1
        if state["warnings"] >= 3:
            return ChatResponse(reply="אני כאן כדי לעזור, אבל אם ממשיכים בשפה לא מכבדת לא אוכל להמשיך.", actions=MAIN_ACTIONS, session_id=session_id)
        return ChatResponse(reply="אני כאן כדי לעזור, אבל בוא נשמור על שפה מכבדת 🙂 מה תרצה?", actions=MAIN_ACTIONS, session_id=session_id)
 
    picked = handle_menu_choice(msg, state, session_id)
    if picked:
        return picked
 
    intent = detect_intent(msg)
 
    if is_confused_reply(msg):
        reset_to_menu_state(state)
        return recruiter_menu_response(session_id)
 
    if intent == "recruiter":
        reset_to_menu_state(state)
        return recruiter_menu_response(session_id)
    if intent == "smalltalk_thanks":
        return ChatResponse(reply="בשמחה 🙂 מה תרצה לעשות עכשיו?", actions=MAIN_ACTIONS, session_id=session_id)
    if intent == "smalltalk_hello":
        return ChatResponse(reply="היי 👋 מה מעניין אותך?", actions=MAIN_ACTIONS, session_id=session_id)
    if intent == "contact":
        return ChatResponse(reply=quick_contact(), actions=COMPOSE_ACTIONS, session_id=session_id)
    if intent == "about":
        return ChatResponse(reply=quick_about(), actions=MAIN_ACTIONS, session_id=session_id)
    if intent == "projects":
        return ChatResponse(reply=quick_projects(), actions=["Freelance4U", "בוט התראות למניות", "פורטפוליו אישי", "יצירת קשר", "חזרה לתפריט"], session_id=session_id)
    if intent == "project_detail":
        for name in PROJECTS_BY_NAME.keys():
            if name.lower() in msg.lower():
                detail = quick_project_detail(name)
                return ChatResponse(reply=detail or "רוצה פרויקטים, טכנולוגיות או יצירת קשר?", actions=["טכנולוגיות", "יצירת קשר", "חזרה לתפריט"], session_id=session_id)
        return ChatResponse(reply="רוצה לבחור פרויקט?", actions=["Freelance4U", "בוט התראות למניות", "פורטפוליו אישי", "חזרה לתפריט"], session_id=session_id)
    if intent == "stack":
        return ChatResponse(reply=quick_stack(), actions=["פרויקטים מרכזיים", "יצירת קשר", "חזרה לתפריט"], session_id=session_id)
    if intent == "compose":
        return ChatResponse(reply="בטח. מה תרצה שאנסח?", actions=COMPOSE_ACTIONS, session_id=session_id)
 
    # Groq fallback
    reply = call_groq(msg)
    return ChatResponse(reply=reply, actions=MAIN_ACTIONS + ["חזרה לתפריט"], session_id=session_id)
