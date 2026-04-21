import httpx
import asyncio

async def test_feedback():
    url = "http://localhost:8000/feedback"
    data = {
        "email": "test@example.com",
        "subject": "Test Subject",
        "message": "This is a test message"
    }
    
    # Create a dummy image file
    files = {
        "image": ("test.png", b"fake-image-content", "image/png")
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=data, files=files)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_feedback())
