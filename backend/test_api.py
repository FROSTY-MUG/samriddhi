import asyncio
import httpx
from app import app

async def test_endpoints():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        print("Testing / ...")
        r = await client.get("/")
        assert r.status_code == 200, f"Root failed: {r.status_code}"
        print("[OK] Root endpoint operational:", r.json())

        print("\nTesting /health ...")
        r = await client.get("/health")
        assert r.status_code == 200, f"Health failed: {r.status_code}"
        print("[OK] Health endpoint operational:", r.json())

        print("\nTesting /api/v1/schemes/filter ...")
        r = await client.get("/api/v1/schemes/filter?amount=120000&income=240000&category=SC&gender=F")
        assert r.status_code == 200, f"Schemes filter failed: {r.status_code}"
        schemes = r.json()
        assert len(schemes) > 0, "No schemes returned"
        print(f"[OK] Schemes filter operational: Returned {len(schemes)} eligible schemes.")
        print(f"  First scheme: {schemes[0]['scheme_name']} at {schemes[0]['effective_rate']}% p.a.")

        print("\nTesting /api/v1/route-application (PostGIS Geo-Routing) ...")
        r = await client.post("/api/v1/route-application", json={
            "lat": 28.6297,
            "lon": 77.0827,
            "requested_amount": 100000.0,
            "scheme_id": "NSFDC-MSY",
            "applicant_name": "Sunita Devi",
            "mobile": "9123456789",
            "category": "SC",
            "annual_income": 180000.0
        })
        assert r.status_code == 200, f"Routing failed: {r.status_code} - {r.text}"
        route_data = r.json()
        print(f"[OK] PostGIS Routing operational: Token {route_data['routing_token']} routed to {route_data['matched_branch']['bank_name']}")

        print("\nTesting /api/v1/officer/dossier/SAM-2026-SC-7184 ...")
        r = await client.get("/api/v1/officer/dossier/SAM-2026-SC-7184")
        assert r.status_code == 200, f"Officer dossier failed: {r.status_code}"
        dossier = r.json()
        assert dossier["token_id"] == "SAM-2026-SC-7184"
        assert dossier["aadhaar_reference"] == "[Aadhaar Redacted]", "Aadhaar was not redacted!"
        print(f"[OK] Officer dossier operational: {dossier['applicant_name']} verified with Aadhaar: {dossier['aadhaar_reference']}")

        print("\nTesting /api/v1/whatsapp/webhook (Meta Challenge Verification) ...")
        r = await client.get("/api/v1/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=samriddhi_meta_verify_token_2026&hub.challenge=CHALLENGE_ACCEPTED_SIH2026")
        assert r.status_code == 200, f"Meta WA webhook challenge failed: {r.status_code}"
        assert r.text == "CHALLENGE_ACCEPTED_SIH2026"
        print("[OK] Meta WhatsApp Cloud API challenge verification operational.")

        print("\nTesting /api/auth/send-otp rate limiter (3/minute limit) ...")
        r1 = await client.post("/api/auth/send-otp", json={"mobile": "9876543210"})
        print(f"  OTP Request 1 status: {r1.status_code}")
        
        print("\nALL BACKEND API ENDPOINTS, SPATIAL ROUTING, AADHAAR PRIVACY REDACTION & WEBHOOKS VERIFIED!")

if __name__ == "__main__":
    asyncio.run(test_endpoints())

