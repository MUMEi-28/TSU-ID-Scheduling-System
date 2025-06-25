import React, { useState, useEffect, useCallback } from 'react';
import { addDays, subDays, format, nextTuesday, previousTuesday, isToday } from 'date-fns';

function DatePicker()
{
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
  {

    const today = new Date();
    const dayOfWeek = today.getDay();

    if (dayOfWeek === 2)
    { // Tuesday
      return today;
    } else if (dayOfWeek < 2)
    { // Monday or Sunday
      return nextTuesday(today);
    } else
    { // Wednesday, Thursday, Friday, Saturday
      return previousTuesday(today);
    }
  });

  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // Function to calculate the four days (Tuesday to Friday)
  const calculateWeekDays = useCallback(() =>
  {
    const dates = [];
    let currentDate = currentWeekStart;
    for (let i = 0; i < 4; i++)
    { // Loop 4 times 
      dates.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }
    setAvailableDates(dates);
  }, [currentWeekStart, selectedDate]);

  // Recalculate dates whenever currentWeekStart changes
  useEffect(() =>
  {
    calculateWeekDays();
  }, [currentWeekStart, calculateWeekDays]);

  const handleNextWeek = () =>
  {
    setCurrentWeekStart(prevDate => addDays(prevDate, 7)); // Add 7 days 
  };

  const handlePrevWeek = () =>
  {
    setCurrentWeekStart(prevDate => subDays(prevDate, 7)); // Subtract 7 days 
  };

  const handleDateSelect = (date) =>
  {
    setSelectedDate(date);
  };

  return (
    <div className='flex-col flex justify-center items-center gap-y-8 w-full sm:w-fit'>

      <h1 className='font-bold text-4xl text-gray-600 league-font'>
        Pick a date
      </h1>

      <div className="flex items-center justify-center space-x-2 sm:space-x-4 w-full sm:w-fit">

        <button
          onClick={handlePrevWeek}
          className="p-2 sm:p-3 text-gray-500 hover:text-gray-700 
        transition-colors duration-200 ease-in-out rounded-full hover:bg-gray-200 
        focus:outline-none focus:ring-2 focus:ring-gray-300">

          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>

        </button>

        {/* Date Display */}
        <div className="flex flex-wrap justify-center sm:justify-start shadow-md shadow-gray-600 w-full sm:w-fit bg-red-100">
          {availableDates.map((date) =>
          {
            const dayOfWeek = format(date, 'EEE');
            const dayOfMonth = format(date, 'dd');
            const month = format(date, 'MMM');
            const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
            const isCurrentDay = isToday(date);

            return (
              <button
                key={format(date, 'yyyy-MM-dd')}
                className=' league-font
                flex flex-col items-center justify-between
                w-1/4 h-28 sm:w-30 sm:h-47 bg-gray-100
                transition-all duration-200 ease-in-out border border-gray-300'

                onClick={() => handleDateSelect(date)}
              >
                <div className='text-md sm:text-xl font-semibold text-gray-600 mb-3 border-gray-400 w-full h-3/12 flex justify-center items-center bg-neutral-200'>
                  {dayOfWeek}
                </div>
                <div className={`text-3xl sm:text-5xl font-bold flex items-end h-5/12 ${isSelected ? 'text-red-900' : 'text-neutral-500'}`}>
                  {dayOfMonth}
                </div>
                <div className={`text-sm sm:text-2xl font-mono uppercase h-3/12 ${isSelected ? 'text-red-900' : 'text-gray-500'}`}>
                  {month}
                </div>
              </button>
            );
          })}
        </div>

        {/* Next Week Button */}
        <button
          onClick={handleNextWeek}
          className="p-2 sm:p-3 text-gray-500 hover:text-gray-700 transition-colors duration-200 ease-in-out rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default DatePicker;