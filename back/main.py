from fastapi import FastAPI
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import httpx

# uvicorn main:app --reload

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------
# 1. РОУТ ПОГОДЫ
# ----------------------------
@app.get("/weather")
async def get_weather(lat: float, lon: float):
    """
    Пример вызова:
    /weather?lat=55.75&lon=37.61
    """

    # API запроса к Open-Meteo
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&current_weather=true"
        "&daily=weathercode,temperature_2m_max,temperature_2m_min"
        "&timezone=auto"
    )

    async with httpx.AsyncClient() as client:
        r = await client.get(url)
        data = r.json()

    # Маппинг weathercode → состояние
    def decode(code: int) -> str:
        if code in [0]:
            return "sun"
        if code in [1, 2]:
            return "cloud-sun"
        if code in [3]:
            return "cloud"
        if code in [45, 48]:
            return "fog"
        if code in [51, 53, 55, 61, 63, 65, 80, 81, 82]:
            return "rain"
        if code in [71, 73, 75, 77, 85, 86]:
            return "snow"
        if code in [95, 96, 99]:
            return "lighting"
        return "cloud"

    current_temp = data["current_weather"]["temperature"]
    current_code = decode(data["current_weather"]["weathercode"])

    # День недели (пн–вс)
    daily = data["daily"]
    temps_min = daily["temperature_2m_min"]
    temps_max = daily["temperature_2m_max"]
    codes = [decode(c) for c in daily["weathercode"]]

    # Формируем week (пн–сб, 6 дней)
    week = {}
    for i in range(6):
        week[f"day_{i+1}"] = {
            "min": temps_min[i],
            "max": temps_max[i],
            "state": codes[i],
        }

    # Упрощённый day: утро / день / вечер
    # Берём:
    #    утро = мин температура
    #    день = макс температура
    #    вечер = среднее между ними
    today_min = temps_min[0]
    today_max = temps_max[0]
    today_mid = round((today_min + today_max) / 2, 1)

    day = {
        "morning": {"temp": today_min, "state": codes[0]},
        "day": {"temp": today_mid, "state": codes[0]},
        "evening": {"temp": today_max, "state": codes[0]},
    }

    return {
        "main": {
            "temp": current_temp,
            "state": current_code,
        },
        "day": day,
        "week": week,
    }


# ----------------------------
# 2. РОУТ СКОРОСТИ ИНТЕРНЕТА
# ----------------------------
@app.get("/speed")
async def download_test():
    size = 50 * 1024  # 50KB
    data = bytes(size)
    return Response(content=data, media_type="application/octet-stream")


# ----------------------------
# 3. РОУТ ПИНГА
# ----------------------------
@app.get("/ping")
async def ping():
    return {"pong": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)