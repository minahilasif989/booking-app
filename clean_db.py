import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def clear_appointments():
    # Aapka connection string (settings se dekh kar yahan likhein)
    client = AsyncIOMotorClient("mongodb://localhost:27017") 
    db = client["booking_app"] # Apne DB ka sahi naam likhein
    
    print("Deleting all appointments...")
    result = await db.appointments.delete_many({})
    print(f"Done! Deleted {result.deleted_count} appointments.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(clear_appointments())