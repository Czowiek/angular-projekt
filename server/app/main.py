from fastapi import FastAPI, Query, HTTPException
from starlette.middleware.cors import CORSMiddleware
import asyncpg
from typing import List
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

# Added CORS allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

async def connect_to_db():
    return await asyncpg.connect(user='postgres', password='db_password',
    database='nbp_viewer', host='postgres')

async def create_table_if_not_exists():
    conn = await connect_to_db()
    query = """
    CREATE TABLE IF NOT EXISTS kursy (
        id SERIAL PRIMARY KEY,
        nazwa_waluty TEXT NOT NULL,
        data_synchronizacji TEXT NOT NULL,
        kurs TEXT NOT NULL
    );
    """
    await conn.execute(query)
    await conn.close()

# Invoke startup event to create table for new instances
@app.on_event("startup")
async def on_startup():
    await create_table_if_not_exists()

async def get_data_from_db(currency_type: str = Query('pln')):
    conn = await connect_to_db()
    query = f"SELECT * FROM kursy WHERE nazwa_waluty=UPPER('{currency_type}');"
    rows = await conn.fetch(query)
    await conn.close()
    return rows

async def save_data_to_db(data: List[dict]):
    conn = await connect_to_db()
    try:
        for record in data:
            await conn.execute("DELETE FROM kursy WHERE nazwa_waluty = $1", record['nazwa_waluty'])

        query = """
            INSERT INTO kursy (nazwa_waluty, data_synchronizacji, kurs)
            VALUES ($1, $2, $3);
        """
        for record in data:
            await conn.execute(query, record['nazwa_waluty'], record['data_synchronizacji'],
            record['kurs'])
    except Exception as e:
        await conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    await conn.close()

# Class for currency model
class CurrencyRate(BaseModel):
    id: int = None  # Optional ID field for existing records
    nazwa_waluty: str
    data_synchronizacji: str
    kurs: str

# GET
@app.get("/data/")
async def get_data(currency_type: str = Query('pln')):
    data = await get_data_from_db(currency_type)
    return data

# SET
@app.post("/data/")
async def post_data(data: List[CurrencyRate]):
    await save_data_to_db([record.dict() for record in data])
    return {"status": "success"}
