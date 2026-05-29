from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add backend root to path so we can import app modules
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app

def main():
    client = TestClient(app)
    print("Testing /problems endpoint...")
    try:
        response = client.get("/problems")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
