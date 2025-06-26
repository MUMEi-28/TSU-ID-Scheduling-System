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

export default function Calendar({ onDateSelect })
{
    const today = dayjs();
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);


    const currentMonth = currentDate.month();
    const currentYear = currentDate.year();
    const startOfMonth = dayjs(`${currentYear}-${currentMonth + 1}-01`);
    const startWeekday = startOfMonth.day();
    const daysInMonth = startOfMonth.daysInMonth();

    const handleDateClick = (date) => {
        if (onDateSelect) {
            onDateSelect(date.format('YYYY-MM-DD'));
        }
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

            // Only disable if it's past date or weekend
            const isDisabled = isPast || isWeekend;

            days.push(
                <div key={i} className="text-center">
                    {isDisabled ? (
                        isWeekend ?
                            <div className={`p-2 text-red-400 cursor-not-allowed`}>
                                {date.date()}
                            </div> :
                            <div className={`p-2 text-gray-400 cursor-not-allowed`}>
                                {date.date()}
                            </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleDateClick(date)}
                            className="block p-2 rounded-lg transition-all hover:bg-orange-500 hover:text-white"
                        >
                            {date.date()}
                        </button>
                    )}
                </div >
            );
        }
        return days;
    };


    return (
        <div className='flex flex-col w-full m-6 justify-center'>
            {/* Text above calendar */}
            <div className=''>
                <h2
                    className='bg-red-600 text-white p-4 font-semibold text-xl w-1/4 rounded-2xl mb-5'>{new Date().getFullYear()} Calendar</h2>
                <p className='text-red-900 font-bold text-xl'>Pick a date</p>
            </div>


            {/* Calendar */}
            <div>
                <h1 className='text-2xl'>{new Date().toLocaleString('default', { month: 'long' })}</h1>

                {/* Week */}
                <div className='grid grid-cols-7 text-center'>
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                        <div key={day} className="text-gray-400 border">
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
