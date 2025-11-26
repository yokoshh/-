'use client';

import { useState, useEffect, KeyboardEvent } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('16:48');
  const [timeOfDay, setTimeOfDay] = useState('День');
  const [day, setDay] = useState(24);
  const [month, setMonth] = useState(11);
  const [year, setYear] = useState(2025);
  const [progress, setProgress] = useState(70);

  // Функция обновления времени, даты и прогресса
  const updateDateTime = () => {
    const now = new Date();
    
    // Время
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setCurrentTime(`${hours}:${minutes}`);
    
    // Дата
    setDay(now.getDate());
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
    
    // Время суток
    const currentTimeOfDay = getTimeOfDay(now.getHours());
    setTimeOfDay(currentTimeOfDay);
    
    // Прогресс дня
    const currentProgress = calculateDayProgress(now.getHours(), now.getMinutes());
    setProgress(currentProgress);
  };

  // Функция определения времени суток
  const getTimeOfDay = (hours: number): string => {
    if (hours >= 6 && hours < 12) return 'Утро';
    if (hours >= 12 && hours < 18) return 'День';
    if (hours >= 18 && hours < 23) return 'Вечер';
    return 'Ночь';
  };

  // Функция расчета прогресса дня
  const calculateDayProgress = (hours: number, minutes: number): number => {
    const totalMinutes = hours * 60 + minutes;
    const progress = (totalMinutes / (24 * 60)) * 100;
    return Math.min(Math.round(progress), 100);
  };

  // Функция получения названия месяца
  const getMonthName = (month: number): string => {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[month - 1];
  };

  // Функция определения активного класса для времени суток
  const getTimeClass = (time: string): string => {
    return time === timeOfDay ? 'text-[#E2E2EB]' : 'text-[#72727A]';
  };

// Запускаем обновление каждую секунду
useEffect(() => {
  const update = () => {
    const now = new Date();
    
    // Время
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setCurrentTime(`${hours}:${minutes}`);
    
    // Дата
    setDay(now.getDate());
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
    
    // Время суток
    const currentTimeOfDay = getTimeOfDay(now.getHours());
    setTimeOfDay(currentTimeOfDay);
    
    // Прогресс дня
    const currentProgress = calculateDayProgress(now.getHours(), now.getMinutes());
    setProgress(currentProgress);
  };

  update(); // Запускаем сразу
  const interval = setInterval(update, 1000);
  return () => clearInterval(interval);
}, []);

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const searchText = query.trim();
      
      if (!searchText) return;
      
      if (searchText.includes('.') && !searchText.includes(' ')) {
        const url = searchText.startsWith('http') ? searchText : `https://${searchText}`;
        window.open(url, '_self');
      } else {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchText)}`;
        window.open(searchUrl, '_self');
      }
    }
  };

  return (
    <div className="px-[270px] py-[220px] h-[100vh] bg-[#000103] flex flex-col justify-between">
      {/* Поисковая строка */}
      <div className="w-full rounded-[12px] p-[12px] gap-[12px] flex bg-[#0D0D0F] text-[#72727A]">
        <img src="/static/ff.svg" alt="Search icon" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Введите поисковый запрос или URL адрес..."
          className="w-full outline-none text-[#E2E2EB] bg-transparent"
        />
      </div>

      {/* Контент с временем и погодой */}
      <div className="flex flex-col gap-[12px]">
        <div className="border border-[#28282E] gap-[12px] rounded-[6px] p-[12px] bg-gradient-to-br from-[#0D0D0F] via-[#1a1a2e] to-[#16213e] flex flex-col relative z-10">
          <div className="flex justify-between items-center text-[#E2E2EB]">
            <div className="flex gap-[6px] items-center font-semibold text-[20px]">
              <span>{currentTime}</span>
              <span>{timeOfDay}</span>
            </div>
            <div className="flex gap-[6px]">
              <span>{day}</span>
              <span className="text-[#72727A] text-[8px]">{month}</span>
              <span>{getMonthName(month)}</span>
              <span className="text-[#72727A] text-[8px]">{year}</span>
            </div>
          </div>
          <div className="flex flex-col gap-[4px]">
            <div className="flex justify-between text-[8px] text-[#72727A]">
              <span className={getTimeClass('Ночь')}>Ночь</span>
              <span className={getTimeClass('Утро')}>Утро</span>
              <span className={getTimeClass('День')}>День</span>
              <span className={getTimeClass('Вечер')}>Вечер</span>
              <span className={getTimeClass('Ночь')}>Ночь</span>
            </div>
            <hr className="border-dashed border border-[#2A2A30]"/>
            <div className="flex justify-between text-[#72727A] text-[6px]">
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
            <div className="rounded-full bg-[#2A2A30]">
              <div 
                className="rounded-full bg-[#757580] h-[4px] transition-all duration-1000"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Виджеты погоды */}
        <div className="gap-[12px] grid grid-cols-3">
          <div className="border border-[#28282E] rounded-[6px] p-[12px] gap-[12px] bg-gradient-to-br from-[#0D0D0F] via-[#1a1a2e] to-[#16213e] relative">
            <div className="flex justify-between ">
              <div className="flex flex-col gap-[4px] text-[#E2E2EB]">
                <span className="text-[8px]">Белгород</span>
                <div className="flex gap-[6px] text-[20px] font-semibold">
                  <img src="/static/oblako.svg" alt="Cloud"/>
                  <span>14 °C</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-[12px] items-center">
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[6px] text-[#72727A]">Утро</span>
                  <img src="/static/oblako.svg" alt="Morning"/>
                  <span className="text-[6px] text-[#E2E2EB]">10 °C</span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[6px] text-[#72727A]">День</span>
                  <img src="/static/oblako.svg" alt="Day"/>
                  <span className="text-[6px] text-[#E2E2EB]">14 °C</span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[6px] text-[#72727A]">Вечер</span>
                  <img src="/static/osadki.svg" alt="Evening"/>
                  <span className="text-[6px] text-[#E2E2EB]">12 °C</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex flex-col gap-[2px]">
                <span className="text-[6px] text-[#72727A]">Пн</span>
                <img src="/static/oblako.svg" alt="Monday"/>
                <span className="text-[6px] text-[#E2E2EB]">18 °C</span>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="text-[6px] text-[#72727A]">Вт</span>
                <img src="/static/rain.svg" alt="Tuesday"/>
                <span className="text-[6px] text-[#E2E2EB]">16 °C</span>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="text-[6px] text-[#72727A]">Ср</span>
                <img src="/static/osadki.svg" alt="Wednesday"/>
                <span className="text-[6px] text-[#E2E2EB]">12 °C</span>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="text-[6px] text-[#72727A]">Чт</span>
                <img src="/static/polosochki.svg" alt="Thursday"/>
                <span className="text-[6px] text-[#E2E2EB]">12 °C</span>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="text-[6px] text-[#72727A]">Пт</span>
                <img src="/static/sun.svg" alt="Friday"/>
                <span className="text-[6px] text-[#E2E2EB]">12 °C</span>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="text-[6px] text-[#72727A]">Сб</span>
                <img src="/static/sunwind.svg" alt="Saturday"/>
                <span className="text-[6px] text-[#E2E2EB]">12 °C</span>
              </div>
            </div>
          </div>
          
          {/* Остальные виджеты погоды */}
          <div className="border border-[#28282E] rounded-[6px] p-[12px] gap-[12px] bg-[#0D0D0F]">
            <div className="flex justify-between ">
              <div className="flex flex-col gap-[4px] text-[#E2E2EB]">
                <span className="text-[8px]">Белгород</span>
                <div className="flex gap-[6px] text-[20px] font-semibold">
                  <img src="/static/oblako.svg" alt="Cloud"/>
                  <span>14 °C</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex flex-col gap-[2px]">
                <span className="text-[6px] text-[#72727A]">Пн</span>
                <img src="/static/oblako.svg" alt="Monday"/>
                <span className="text-[6px] text-[#E2E2EB]">18 °C</span>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="text-[6px] text-[#72727A]">Вт</span>
                <img src="/static/rain.svg" alt="Tuesday"/>
                <span className="text-[6px] text-[#E2E2EB]">16 °C</span>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="text-[6px] text-[#72727A]">Ср</span>
                <img src="/static/osadki.svg" alt="Wednesday"/>
                <span className="text-[6px] text-[#E2E2EB]">12 °C</span>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="text-[6px] text-[#72727A]">Чт</span>
                <img src="/static/polosochki.svg" alt="Thursday"/>
                <span className="text-[6px] text-[#E2E2EB]">12 °C</span>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="text-[6px] text-[#72727A]">Пт</span>
                <img src="/static/sun.svg" alt="Friday"/>
                <span className="text-[6px] text-[#E2E2EB]">12 °C</span>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="text-[6px] text-[#72727A]">Сб</span>
                <img src="/static/sunwind.svg" alt="Saturday"/>
                <span className="text-[6px] text-[#E2E2EB]">12 °C</span>
              </div>
            </div>
          </div>
          
          <div className="border border-[#28282E] rounded-[6px] p-[12px] gap-[12px] bg-[#0D0D0F]">
            <div className="flex justify-between ">
              <div className="flex flex-col gap-[4px] text-[#E2E2EB]">
                <span className="text-[8px]">Белгород</span>
                <div className="flex gap-[6px] text-[20px] font-semibold">
                  <img src="/static/oblako.svg" alt="Cloud"/>
                  <span>14 °C</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-[12px] items-center">
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[6px] text-[#72727A]">Утро</span>
                  <img src="/static/oblako.svg" alt="Morning"/>
                  <span className="text-[6px] text-[#E2E2EB]">10 °C</span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[6px] text-[#72727A]">День</span>
                  <img src="/static/oblako.svg" alt="Day"/>
                  <span className="text-[6px] text-[#E2E2EB]">14 °C</span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[6px] text-[#72727A]">Вечер</span>
                  <img src="/static/osadki.svg" alt="Evening"/>
                  <span className="text-[6px] text-[#E2E2EB]">12 °C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}