import React from 'react'
import { Link } from 'react-router-dom' // For clickable dates button
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday'; // for getting weekdays
import isToday from 'dayjs/plugin/isToday'; // to check if a date is tday
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';   // For date comparison
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { useState } from 'react';

// Register the plugins to enable their feature
dayjs.extend(weekday);
dayjs.extend(isToday);
dayjs.extend(isSameOrBefore);
dayjs.extend(advancedFormat);

export default function Calendar({ onDateSelect, onClose })
{
    const today = dayjs();
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);

    const currentMonth = currentDate.month();
    const currentYear = currentDate.year();
    const startOfMonth = dayjs(`${currentYear}-${currentMonth + 1}-01`);
    const startWeekday = startOfMonth.day();
    const daysInMonth = startOfMonth.daysInMonth();

    const handleDateClick = (date) =>
    {
        if (onDateSelect)
        {
            onDateSelect(date.format('YYYY-MM-DD'));
        }
    };

    const handlePrevMonth = () =>
    {
        setCurrentDate(currentDate.subtract(1, 'month'));
    };
    const handleNextMonth = () =>
    {
        setCurrentDate(currentDate.add(1, 'month'));
    };

    const generateCalendar = () =>
    {
        const days = [];
        const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

        for (let i = 0; i < totalCells; i++)
        {
            const date = startOfMonth.subtract(startWeekday, 'day').add(i, 'day');
            const isCurrentMonth = date.month() === currentMonth;
            const isPast = date.isBefore(today, 'day');
            const isWeekend = date.day() === 0 || date.day() === 6;
            const isTodayDate = date.isToday();

            // Only disable if it's past date or weekend
            const isDisabled = isPast || isWeekend;

            days.push(
                <div key={i} className="flex items-center justify-center h-12 w-12 mx-auto">
                    {isDisabled ? (
                        <div className={`p-2 w-full h-full flex items-center justify-center rounded-lg ${isWeekend ? 'text-red-300 bg-gray-50' : 'text-gray-400 bg-gray-50'} cursor-not-allowed`}>
                            {date.date()}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleDateClick(date)}
                            className={`block p-2 rounded-lg w-full h-full flex items-center justify-center font-semibold transition-all
                                ${isTodayDate ? 'border-2 border-yellow-500 bg-yellow-100 text-yellow-900' : 'bg-white text-gray-700'}
                                hover:bg-yellow-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                        >
                            {date.date()}
                        </button>
                    )}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="flex flex-col w-full max-w-md m-6 justify-center relative bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
            {/* Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-red-600 font-extrabold z-10 p-2 bg-white rounded-full shadow"
                    aria-label="Close calendar"
                >
                    ×
                </button>
            )}
            {/* Text above calendar */}
            <div className="flex flex-col items-center mb-2">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-yellow-500 text-white px-4 py-2 font-bold text-lg rounded-xl shadow">{currentYear} Calendar</span>
                </div>
                <p className="text-yellow-900 font-bold text-lg mb-2">Pick a date</p>
            </div>

            {/* Calendar */}
            <div>
                {/* Month Navigation */}
                <div className="flex items-center justify-center gap-4 mb-2">
                    <button
                        onClick={handlePrevMonth}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-yellow-400 text-2xl font-bold transition-all border border-gray-300"
                        aria-label="Previous month"
                    >
                        &#8592;
                    </button>
                    <span className="text-xl font-bold text-gray-700">
                        {currentDate.format('MMMM YYYY')}
                    </span>
                    <button
                        onClick={handleNextMonth}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-yellow-400 text-2xl font-bold transition-all border border-gray-300"
                        aria-label="Next month"
                    >
                        &#8594;
                    </button>
                </div>

                {/* Week */}
                <div className="grid grid-cols-7 text-center mb-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-gray-500 font-semibold bg-gray-100 py-1 rounded">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 mt-2">
                    {generateCalendar()}
                </div>
            </div>
        </div>
    )
}
