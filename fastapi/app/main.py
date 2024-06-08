from fastapi import FastAPI, Query, HTTPException
from starlette.middleware.cors import CORSMiddleware
import asyncpg
from typing import List
from pydantic import BaseModel
from datetime import datetime

# Model dla danych waluty
class CurrencyRate(BaseModel):
    id: int = None
    znak_waluty: str
    data: str
    kurs: str

# Inicjalizacja FastAPI
app = FastAPI()

# Dodanie CORS aby umożliwić zapytania z każdego adresu
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Połączenie do bazy danych
async def polacz_do_bd():
    return await asyncpg.connect(user='administrator', password='admin_password',
    database='nbp', host='postgres')

async def stworz_tabele_jezeli_nie_ma():
    conn = await polacz_do_bd()
    query = """
    CREATE TABLE IF NOT EXISTS kursy (
        id SERIAL PRIMARY KEY,
        znak_waluty TEXT NOT NULL,
        data TEXT NOT NULL,
        kurs TEXT NOT NULL
    );
    """
    await conn.execute(query)
    await conn.close()

# Invoke startup event to create table for new instances
@app.on_event("startup")
async def on_startup():
    await stworz_tabele_jezeli_nie_ma()

async def pobierz_dane_z_bd(currency_type: str = Query('pln')):
    conn = await polacz_do_bd()
    query = f"SELECT * FROM kursy WHERE znak_waluty=UPPER('{currency_type}');"
    rows = await conn.fetch(query)
    await conn.close()
    return rows

async def zapisz_dane_do_bd(data: List[dict]):
    conn = await polacz_do_bd()
    try:
        for record in data:
            await conn.execute("DELETE FROM kursy WHERE znak_waluty = $1", record['znak_waluty'])

        query = """
            INSERT INTO kursy (znak_waluty, data, kurs)
            VALUES ($1, $2, $3);
        """
        for record in data:
            await conn.execute(query, record['znak_waluty'], record['data'],
            record['kurs'])
    except Exception as e:
        await conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    await conn.close()

@app.get("/data/")
async def get_data(currency_type: str = Query('pln')):
    data = await pobierz_dane_z_bd(currency_type)
    return data

@app.post("/data/")
async def post_data(data: List[CurrencyRate]):
    await zapisz_dane_do_bd([record.dict() for record in data])
    return {"status": "success"}
