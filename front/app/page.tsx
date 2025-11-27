"use client";

import { useState, useEffect, KeyboardEvent } from "react";

export default function Home() {
    const [query, setQuery] = useState("");
    const [currentTime, setCurrentTime] = useState("12:00");
    const [timeOfDay, setTimeOfDay] = useState("День");
    const [day, setDay] = useState(24);
    const [month, setMonth] = useState(11);
    const [year, setYear] = useState(2025);
    const [progress, setProgress] = useState(70);
    const [internetSpeed, setInternetSpeed] = useState(23);
    const [avgSpeed, setAvgSpeed] = useState(18);
    const [ping, setPing] = useState(500);
    const [weather, setWeather] = useState(null);
    const [lat, setLat] = useState(50.6167);
    const [lon, setLon] = useState(36.5833);
    const [city, setCity] = useState("Белгород");

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const getTimeOfDay = (hours: number): string => {
        if (hours >= 6 && hours < 12) return "Утро";
        if (hours >= 12 && hours < 18) return "День";
        if (hours >= 18 && hours < 23) return "Вечер";
        return "Ночь";
    };

    const calculateDayProgress = (hours: number, minutes: number): number => {
        const totalMinutes = hours * 60 + minutes;
        const progress = (totalMinutes / (24 * 60)) * 100;
        return Math.min(Math.round(progress), 100);
    };

    const getMonthName = (month: number): string => {
        const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
        return months[month - 1];
    };

    const getTimeClass = (time: string): string => {
        return time === timeOfDay ? "text-base-white" : "text-text-gray";
    };

    const getIcon = (state: string): string => {
        if (state === "fog") return "cloud";
        return state;
    };

    useEffect(() => {
        const update = () => {
            const now = new Date();

            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            setCurrentTime(`${hours}:${minutes}`);

            setDay(now.getDate());
            setMonth(now.getMonth() + 1);
            setYear(now.getFullYear());

            const currentTimeOfDay = getTimeOfDay(now.getHours());
            setTimeOfDay(currentTimeOfDay);

            const currentProgress = calculateDayProgress(now.getHours(), now.getMinutes());
            setProgress(currentProgress);
        };

        update();
        const interval = setInterval(update, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const fetchCityByCoords = async (latitude: number, longitude: number) => {
            try {
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ru`);
                const data = await res.json();
                setCity(data.city || data.locality || "Неизвестно");
            } catch (err) {
                console.error("Failed to fetch city:", err);
                setCity("Неизвестно");
            }
        };

        const fetchCityByIP = async () => {
            try {
                const res = await fetch("https://ipapi.co/json/");
                const data = await res.json();
                setLat(data.latitude || 50.6167);
                setLon(data.longitude || 36.5833);
                setCity(data.city || "Белгород");
            } catch (err) {
                console.error("IP geolocation failed:", err);
                setLat(50.6167);
                setLon(36.5833);
                setCity("Белгород");
            }
        };

        if (!navigator.geolocation) {
            console.warn("Geolocation не поддерживается, используем IP");
            fetchCityByIP();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLat(latitude);
                setLon(longitude);
                fetchCityByCoords(latitude, longitude);
            },
            (err) => {
                console.warn(`Ошибка геолокации: ${err.message}, определяем по IP`);
                fetchCityByIP();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    useEffect(() => {
        async function fetchWeather() {
            try {
                const res = await fetch(`${backendUrl}/weather?lat=${lat}&lon=${lon}`);
                if (res.ok) {
                    const data = await res.json();
                    setWeather(data);
                }
            } catch (e) {
                console.error("Failed to fetch weather:", e);
            }
        }

        fetchWeather();
        const weatherInterval = setInterval(fetchWeather, 600000); // Every 10 minutes

        return () => clearInterval(weatherInterval);
    }, [lat, lon]);

    useEffect(() => {
        async function measureSpeedAndPing() {
            // Measure ping
            let pingStart = performance.now();
            try {
                await fetch(`${backendUrl}/ping`);
            } catch (e) {
                console.error("Failed to measure ping:", e);
                return;
            }
            let pingEnd = performance.now();
            setPing(Math.round(pingEnd - pingStart));

            // Measure speed
            let speedStart = performance.now();
            try {
                await fetch(`${backendUrl}/speed`);
            } catch (e) {
                console.error("Failed to measure speed:", e);
                return;
            }
            let speedEnd = performance.now();
            const duration = (speedEnd - speedStart) / 1000;
            const sizeBytes = 50 * 1024;
            const speedBps = sizeBytes / duration;
            const speedMbps = (speedBps * 8) / 1000000;
            const roundedSpeed = Math.round(speedMbps);
            setInternetSpeed(roundedSpeed);
            setAvgSpeed((prev) => Math.round((prev + roundedSpeed) / 2));
        }

        measureSpeedAndPing();
        const speedInterval = setInterval(measureSpeedAndPing, 5000);

        return () => clearInterval(speedInterval);
    }, []);

    const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            const searchText = query.trim();

            if (!searchText) return;

            if (searchText.includes(".") && !searchText.includes(" ")) {
                const url = searchText.startsWith("http") ? searchText : `https://${searchText}`;
                window.open(url, "_self");
            } else {
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchText)}`;
                window.open(searchUrl, "_self");
            }
        }
    };

    // Вычисляем количество активных полосок на основе скорости (масштаб до 100 мбит/с)
    const speedBars = Math.min(Math.round((internetSpeed / 100) * 9), 9);

    return (
        <div className="px-[270px] py-[220px] h-[100vh] bg-black-deep flex flex-col justify-between">
            {/* Поисковая строка */}
            <div className="w-full rounded-[12px] p-[12px] gap-[12px] flex bg-black-plus text-text-gray">
                <img src="/static/ff.svg" alt="Search icon" />
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Введите поисковый запрос или URL адрес..."
                    className="w-full outline-none text-base-white bg-transparent font-normal"
                />
            </div>

            {/* Контент с временем и погодой */}
            <div className="flex flex-col gap-[12px]">
                <div className="rounded-[6px] p-[12px] bg-black-plus flex flex-col relative z-10 overflow-hidden" style={{ boxShadow: "inset 0 0 0 1px rgba(40, 40, 46, 1)" }}>
                    {/* Свечение */}
                    <div className="absolute left-[-77px] top-1/2 -translate-y-1/2 w-[154px] h-[154px] pointer-events-none">
                        <div className="absolute inset-0 rounded-full bg-mid-gray blur-[125px] opacity-100"></div>
                    </div>
                    <div className="absolute right-[100px] top-[-40px] w-[140px] h-[140px] pointer-events-none">
                        <div className="absolute inset-0 rounded-full bg-[#4B4BFB] blur-[50px] opacity-80"></div>
                    </div>
                    <div className="absolute right-[60px] top-0 w-[100px] h-[100px] pointer-events-none">
                        <div className="absolute inset-0 rounded-full bg-[#0A0A63] blur-[50px] opacity-100"></div>
                    </div>

                    <div className="flex justify-between items-center text-base-white relative z-10">
                        <div className="flex gap-[6px] items-center font-semibold text-[20px]">
                            <span>{currentTime}</span>
                            <span>{timeOfDay}</span>
                        </div>
                        <div className="flex gap-[6px]">
                            <span>{day}</span>
                            <span className="text-text-gray text-[8px]">{month}</span>
                            <span>{getMonthName(month)}</span>
                            <span className="text-text-gray text-[8px]">{year}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-[4px] relative z-10">
                        <div className="flex justify-between text-[8px] text-text-gray">
                            <span className={getTimeClass("Ночь")}>Ночь</span>
                            <span className={getTimeClass("Утро")}>Утро</span>
                            <span className={getTimeClass("День")}>День</span>
                            <span className={getTimeClass("Вечер")}>Вечер</span>
                            <span className={getTimeClass("Ночь")}>Ночь</span>
                        </div>
                        <hr className="border-dashed border border-dark-gray" />
                        <div className="flex justify-between text-text-gray text-[6px]">
                            <span>00</span>
                            <span>3</span>
                            <span>6</span>
                            <span>9</span>
                            <span>12</span>
                            <span>15</span>
                            <span>18</span>
                            <span>21</span>
                            <span>23</span>
                        </div>
                        <div className="rounded-full bg-dark-gray">
                            <div className="rounded-full bg-mid-gray h-[4px] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Виджеты погоды и скорости интернета */}
                <div className="gap-[12px] grid grid-cols-2">
                    {/* Виджет погоды */}
                    <div className="rounded-[6px] p-[12px] gap-[12px] bg-black-plus relative overflow-hidden" style={{ boxShadow: "inset 0 0 0 1px rgba(40, 40, 46, 1)" }}>
                        {/* Свечение */}
                        <div className="absolute left-[-57px] top-1/2 -translate-y-1/2 w-[114px] h-[114px] pointer-events-none">
                            <div className="absolute inset-0 rounded-full bg-[#4B5AFB] blur-[50px] opacity-100"></div>
                        </div>
                        <div className="absolute left-[40px] top-1/2 -translate-y-1/2 w-[88px] h-[88px] pointer-events-none">
                            <div className="absolute inset-0 rounded-full bg-[#A289EE] blur-[50px] opacity-100"></div>
                        </div>

                        <div className="flex justify-between relative z-10">
                            <div className="flex flex-col gap-[4px] text-base-white">
                                <span className="text-[8px]">{city}</span>
                                <div className="flex gap-[6px] text-[20px] font-semibold">
                                    {weather ? (
                                        <>
                                            <img src={`/static/${getIcon(weather.main.state)}.svg`} alt={weather.main.state} className="aspect-square w-[24px]" />
                                            <span>{weather.main.temp} °C</span>
                                        </>
                                    ) : (
                                        <>
                                            <img src="/static/cloud.svg" alt="Cloud" className="aspect-square w-[24px]" />
                                            <span>14 °C</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-[20px] items-center">
                                <div className="flex flex-col gap-[2px]">
                                    <span className="text-[6px] text-text-gray">Утро</span>
                                    {weather ? (
                                        <>
                                            <img src={`/static/${getIcon(weather.day.morning.state)}.svg`} alt="Morning" />
                                            <span className="text-[6px] text-base-white">{weather.day.morning.temp} °C</span>
                                        </>
                                    ) : (
                                        <>
                                            <img src="/static/cloud.svg" alt="Morning" />
                                            <span className="text-[6px] text-base-white">10 °C</span>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-col gap-[2px]">
                                    <span className="text-[6px] text-text-gray">День</span>
                                    {weather ? (
                                        <>
                                            <img src={`/static/${getIcon(weather.day.day.state)}.svg`} alt="Day" />
                                            <span className="text-[6px] text-base-white">{weather.day.day.temp} °C</span>
                                        </>
                                    ) : (
                                        <>
                                            <img src="/static/cloud.svg" alt="Day" />
                                            <span className="text-[6px] text-base-white">14 °C</span>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-col gap-[2px]">
                                    <span className="text-[6px] text-text-gray">Вечер</span>
                                    {weather ? (
                                        <>
                                            <img src={`/static/${getIcon(weather.day.evening.state)}.svg`} alt="Evening" />
                                            <span className="text-[6px] text-base-white">{weather.day.evening.temp} °C</span>
                                        </>
                                    ) : (
                                        <>
                                            <img src="/static/snow.svg" alt="Evening" />
                                            <span className="text-[6px] text-base-white">12 °C</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between relative z-10">
                            <div className="flex flex-col gap-[2px]">
                                <span className="text-[6px] text-text-gray">Пн</span>
                                {weather ? (
                                    <>
                                        <img src={`/static/${getIcon(weather.week.day_1.state)}.svg`} alt="Monday" />
                                        <span className="text-[6px] text-base-white">{weather.week.day_1.max} °C</span>
                                    </>
                                ) : (
                                    <>
                                        <img src="/static/cloud.svg" alt="Monday" />
                                        <span className="text-[6px] text-base-white">18 °C</span>
                                    </>
                                )}
                            </div>
                            <div className="flex flex-col gap-[2px]">
                                <span className="text-[6px] text-text-gray">Вт</span>
                                {weather ? (
                                    <>
                                        <img src={`/static/${getIcon(weather.week.day_2.state)}.svg`} alt="Tuesday" />
                                        <span className="text-[6px] text-base-white">{weather.week.day_2.max} °C</span>
                                    </>
                                ) : (
                                    <>
                                        <img src="/static/rain.svg" alt="Tuesday" />
                                        <span className="text-[6px] text-base-white">16 °C</span>
                                    </>
                                )}
                            </div>
                            <div className="flex flex-col gap-[2px]">
                                <span className="text-[6px] text-text-gray">Ср</span>
                                {weather ? (
                                    <>
                                        <img src={`/static/${getIcon(weather.week.day_3.state)}.svg`} alt="Wednesday" />
                                        <span className="text-[6px] text-base-white">{weather.week.day_3.max} °C</span>
                                    </>
                                ) : (
                                    <>
                                        <img src="/static/snow.svg" alt="Wednesday" />
                                        <span className="text-[6px] text-base-white">12 °C</span>
                                    </>
                                )}
                            </div>
                            <div className="flex flex-col gap-[2px]">
                                <span className="text-[6px] text-text-gray">Чт</span>
                                {weather ? (
                                    <>
                                        <img src={`/static/${getIcon(weather.week.day_4.state)}.svg`} alt="Thursday" />
                                        <span className="text-[6px] text-base-white">{weather.week.day_4.max} °C</span>
                                    </>
                                ) : (
                                    <>
                                        <img src="/static/polosochki.svg" alt="Thursday" />
                                        <span className="text-[6px] text-base-white">12 °C</span>
                                    </>
                                )}
                            </div>
                            <div className="flex flex-col gap-[2px]">
                                <span className="text-[6px] text-text-gray">Пт</span>
                                {weather ? (
                                    <>
                                        <img src={`/static/${getIcon(weather.week.day_5.state)}.svg`} alt="Friday" />
                                        <span className="text-[6px] text-base-white">{weather.week.day_5.max} °C</span>
                                    </>
                                ) : (
                                    <>
                                        <img src="/static/sun.svg" alt="Friday" />
                                        <span className="text-[6px] text-base-white">12 °C</span>
                                    </>
                                )}
                            </div>
                            <div className="flex flex-col gap-[2px]">
                                <span className="text-[6px] text-text-gray">Сб</span>
                                {weather ? (
                                    <>
                                        <img src={`/static/${getIcon(weather.week.day_6.state)}.svg`} alt="Saturday" />
                                        <span className="text-[6px] text-base-white">{weather.week.day_6.max} °C</span>
                                    </>
                                ) : (
                                    <>
                                        <img src="/static/cloud-sun.svg" alt="Saturday" />
                                        <span className="text-[6px] text-base-white">12 °C</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Виджет скорости интернета */}
                    <div className="rounded-[6px] p-[12px] bg-black-plus relative overflow-hidden flex flex-col justify-between" style={{ boxShadow: "inset 0 0 0 1px rgba(40, 40, 46, 1)" }}>
                        {/* Свечение */}
                        <div className="absolute left-[-57px] bottom-0 translate-y-1/2 w-[114px] h-[114px] pointer-events-none">
                            <div className="absolute inset-0 rounded-full bg-[#2BD93A] blur-[50px] opacity-100"></div>
                        </div>
                        <div className="absolute left-[17px] bottom-0 translate-y-1/2 w-[80px] h-[80px] pointer-events-none">
                            <div className="absolute inset-0 rounded-full bg-[#135B19] blur-[25px] opacity-100"></div>
                        </div>

                        {/* Контент */}
                        <div className="flex gap-[12px] items-start w-full relative z-10">
                            <div className="flex-1 flex flex-col gap-[4px]">
                                <span className="text-[8px] text-base-white">Скорость интернета</span>
                                <div className="flex gap-[6px] items-center">
                                    {/* Иконка спидометра */}
                                    <img src="/static/speed.svg" alt="speed" />
                                    <div className="font-semibold text-[20px]">
                                        <span className="text-base-white">{internetSpeed} </span>
                                        <span className="text-text-gray text-[12px]">мбит/с</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-[6px]">
                                <div className="flex flex-col gap-[2px] items-center">
                                    <span className="text-[6px] text-text-gray text-center">Ср. скорость</span>
                                    <span className="text-[6px] text-base-white">{avgSpeed} мбит/с</span>
                                </div>
                                <div className="flex flex-col gap-[2px] items-center">
                                    <span className="text-[6px] text-text-gray text-center">Ping</span>
                                    <span className="text-[6px] text-base-white">{ping} мс</span>
                                </div>
                            </div>
                        </div>

                        {/* График скорости */}
                        <div className="flex gap-[2px] h-[8px] w-full relative z-10">
                            {Array.from({ length: 9 }).map((_, index) => (
                                <div key={index} className={`flex-1 rounded-[2px] transition-all duration-500 ${index < speedBars ? "bg-[#2bd93a]" : "bg-[#2a2a30]"}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
