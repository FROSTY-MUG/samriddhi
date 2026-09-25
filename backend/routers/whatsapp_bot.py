"""
routers/whatsapp_bot.py — WhatsApp Conversational Bot via Twilio Webhook
=========================================================================
Receives incoming WhatsApp messages from Twilio's webhook, parses the
citizen's intent using keyword matching, and replies with scheme
recommendations using TwiML (Twilio Markup Language).

Endpoint: POST /api/v1/whatsapp/webhook
Content-Type: application/x-www-form-urlencoded (Twilio's format)
"""
from fastapi import APIRouter, Request, Form
from fastapi.responses import Response
import re

router = APIRouter(prefix="/api/v1/whatsapp", tags=["WhatsApp Bot"])


# ========================= Scheme Knowledge Base =========================

SCHEME_KB = {
    "tailor": {
        "scheme": "Micro Finance Scheme (MFS)",
        "code": "NSFDC-MFS",
        "rate": "6.5% (5.5% for women)",
        "max": "₹1,40,000",
        "moratorium": "6 months",
    },
    "dairy": {
        "scheme": "Mahila Kisan Yojana (MKY)",
        "code": "NSFDC-MKY",
        "rate": "5.0%",
        "max": "₹2,00,000",
        "moratorium": "6 months",
    },
    "shop": {
        "scheme": "Term Loan Scheme (Small)",
        "code": "NSFDC-TLS-S",
        "rate": "6.5% (6.0% for women)",
        "max": "₹5,00,000",
        "moratorium": "6 months",
    },
    "solar": {
        "scheme": "Green Business Scheme (GBS)",
        "code": "NSFDC-GBS",
        "rate": "6.5%",
        "max": "₹30,00,000",
        "moratorium": "9 months",
    },
    "education": {
        "scheme": "Educational Loan Scheme (Inland)",
        "code": "NSFDC-ELS-IN",
        "rate": "6.5% (6.0% for women)",
        "max": "₹20,00,000",
        "moratorium": "Course duration + 6 months",
    },
    "rickshaw": {
        "scheme": "Green Business Scheme (GBS)",
        "code": "NSFDC-GBS",
        "rate": "6.5%",
        "max": "₹30,00,000",
        "moratorium": "9 months",
    },
}

# Hindi keyword mappings
HINDI_KEYWORDS = {
    "सिलाई": "tailor", "दर्जी": "tailor", "कपड़ा": "tailor",
    "गाय": "dairy", "भैंस": "dairy", "दूध": "dairy", "डेयरी": "dairy",
    "दुकान": "shop", "किराना": "shop",
    "सोलर": "solar", "ऊर्जा": "solar",
    "पढ़ाई": "education", "शिक्षा": "education",
    "रिक्शा": "rickshaw", "ऑटो": "rickshaw",
}


# ========================= Intent Parser =========================

def parse_citizen_intent(message: str) -> dict:
    """
    Parse the incoming WhatsApp message to extract:
      - Sector/trade (what business the citizen wants to start)
      - Amount (if mentioned)
      - Language (Hindi or English)
    """
    msg_lower = message.lower().strip()
    result = {"sector": None, "amount": None, "language": "en"}

    # Detect Hindi
    if any(hindi_word in message for hindi_word in HINDI_KEYWORDS):
        result["language"] = "hi"
        for hindi_word, english_key in HINDI_KEYWORDS.items():
            if hindi_word in message:
                result["sector"] = english_key
                break

    # Detect English keywords
    if not result["sector"]:
        for keyword in SCHEME_KB:
            if keyword in msg_lower:
                result["sector"] = keyword
                break

    # Extract amount (e.g., "1 lakh", "2,00,000", "50000")
    amount_match = re.search(r'(\d+)\s*(?:lakh|lac|लाख)', msg_lower)
    if amount_match:
        result["amount"] = int(amount_match.group(1)) * 100000
    else:
        amount_match = re.search(r'₹?\s*([\d,]+)', msg_lower)
        if amount_match:
            result["amount"] = int(amount_match.group(1).replace(',', ''))

    return result


def generate_reply(intent: dict, sender: str) -> str:
    """Generate the bot's reply based on the parsed intent."""

    if not intent["sector"]:
        # No recognizable intent — send help menu
        if intent["language"] == "hi":
            return (
                "🙏 *समृद्धि AI* में आपका स्वागत है!\n\n"
                "अपना व्यवसाय बताएं:\n"
                "1️⃣ सिलाई / दर्जी\n"
                "2️⃣ डेयरी / गाय-भैंस\n"
                "3️⃣ किराना दुकान\n"
                "4️⃣ सोलर / ई-रिक्शा\n"
                "5️⃣ शिक्षा ऋण\n\n"
                "उदाहरण: _मुझे सिलाई दुकान के लिए 1 लाख चाहिए_"
            )
        return (
            "🙏 Welcome to *SamriddhiAI*!\n\n"
            "Tell us your trade:\n"
            "1️⃣ Tailoring / Garments\n"
            "2️⃣ Dairy / Cattle\n"
            "3️⃣ Small Shop / Kirana\n"
            "4️⃣ Solar / E-Rickshaw\n"
            "5️⃣ Education Loan\n\n"
            "Example: _I need 1 lakh for a tailoring shop_"
        )

    # Found a matching scheme
    scheme = SCHEME_KB[intent["sector"]]
    amount_str = f"₹{intent['amount']:,}" if intent["amount"] else scheme["max"]

    if intent["language"] == "hi":
        return (
            f"✅ *योजना मिली!*\n\n"
            f"📋 *{scheme['scheme']}*\n"
            f"🏷️ कोड: {scheme['code']}\n"
            f"💰 अधिकतम: {scheme['max']}\n"
            f"📊 ब्याज दर: {scheme['rate']}\n"
            f"⏳ मोरेटोरियम: {scheme['moratorium']}\n"
            f"💵 आपकी राशि: {amount_str}\n\n"
            f"निकटतम बैंक खोजने के लिए *'हाँ'* लिखें।\n"
            f"दूसरी योजना देखने के लिए *'मेनू'* लिखें।"
        )

    return (
        f"✅ *Scheme Found!*\n\n"
        f"📋 *{scheme['scheme']}*\n"
        f"🏷️ Code: {scheme['code']}\n"
        f"💰 Max Limit: {scheme['max']}\n"
        f"📊 Interest Rate: {scheme['rate']}\n"
        f"⏳ Moratorium: {scheme['moratorium']}\n"
        f"💵 Your Amount: {amount_str}\n\n"
        f"Reply *'YES'* to route to the nearest eligible bank.\n"
        f"Reply *'MENU'* to see other schemes."
    )


# ========================= Twilio Webhook Endpoint =========================

@router.post("/webhook")
async def whatsapp_webhook(request: Request):
    """
    Receives incoming WhatsApp messages from Twilio's webhook.
    Parses the citizen's intent and replies with scheme recommendations.
    
    Twilio sends: application/x-www-form-urlencoded
    Fields: Body, From, To, MessageSid, etc.
    """
    # Parse Twilio's form-encoded payload
    form_data = await request.form()
    message_body = form_data.get("Body", "")
    sender = form_data.get("From", "unknown")
    
    print(f"[WhatsApp] From: {sender} | Message: {message_body}")

    # Parse the citizen's intent
    intent = parse_citizen_intent(str(message_body))

    # Generate the reply
    reply_text = generate_reply(intent, str(sender))

    # Format as TwiML (Twilio Markup Language) for WhatsApp response
    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{reply_text}</Message>
</Response>"""

    return Response(content=twiml_response, media_type="application/xml")
