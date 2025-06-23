import React, { useState, useEffect, useCallback } from 'react';
import { addDays, subDays, format, nextTuesday, previousTuesday, isToday } from 'date-fns';

function FourDayDatePicker() {
  // State to hold the first day of the current *displayed* week (Tuesday)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Initialize to the current week's Tuesday based on today's date
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

    if (dayOfWeek === 2) { // Tuesday
      return today;
    } else if (dayOfWeek < 2) { // Monday or Sunday
      return nextTuesday(today);
    } else { // Wednesday, Thursday, Friday, Saturday
      return previousTuesday(today);
    }
  });

  const [availableDates, setAvailableDates] = useState([]); // Array to hold the 4 dates (Tue, Wed, Thu, Fri)
  const [selectedDate, setSelectedDate] = useState(null); // State for the currently selected date

  // Function to calculate the four days (Tuesday to Friday) based on currentWeekStart
  const calculateWeekDays = useCallback(() => {
    const dates = [];
    let currentDate = currentWeekStart;
    for (let i = 0; i < 4; i++) { // Loop 4 times for Tue, Wed, Thu, Fri
      dates.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }
    setAvailableDates(dates);
  }, [currentWeekStart, selectedDate]);

  // Recalculate dates whenever currentWeekStart changes
  useEffect(() => {
    calculateWeekDays();
  }, [currentWeekStart, calculateWeekDays]);

  // Handler for navigating to the next week
  const handleNextWeek = () => {
    setCurrentWeekStart(prevDate => addDays(prevDate, 7)); // Add 7 days to get next Tuesday
  };

  // Handler for navigating to the previous week
  const handlePrevWeek = () => {
    setCurrentWeekStart(prevDate => subDays(prevDate, 7)); // Subtract 7 days to get previous Tuesday
  };

  // Handler for selecting a date
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // You can add a prop here if you want to pass the selected date up to a parent component
    // Example: if (onDateChange) onDateChange(date);
  };

  return (
    <div className='flex-col flex justify-center items-center gap-y-8 '>

        <h1 className='font-bold text-4xl text-gray-600'>
            Pick a date
        </h1>

    <div className="flex items-center justify-center space-x-2 sm:space-x-4">
      {/* Previous Week Button */}
      <button
        onClick={handlePrevWeek}
        className="p-2 sm:p-3 text-gray-500 hover:text-gray-700 transition-colors duration-200 ease-in-out rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Date Display */}
      <div className="flex flex-wrap justify-center sm:justify-start shadow-md shadow-gray-600 w-full sm:w-fit">
        {availableDates.map((date) => {
          const dayOfWeek = format(date, 'EEE'); // e.g., "Tue"
          const dayOfMonth = format(date, 'dd'); // e.g., "13"
          const month = format(date, 'MMM');   // e.g., "Aug"
          const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
          const isCurrentDay = isToday(date); // Check if the date is today

          return (
            <button
              key={format(date, 'yyyy-MM-dd')} // Unique key for React list rendering
              className='
                flex flex-col items-center justify-between
                w-1/4 h-28 sm:w-30 sm:h-50 bg-gray-100
                transition-all duration-200 ease-in-out border border-gray-200' 

              onClick={() => handleDateSelect(date)}    
            >
              <div className='text-md sm:text-2xl font-semibold text-gray-600  border-gray-400 w-full h-4/12 flex justify-center items-center bg-gray-300'>
                {dayOfWeek}
              </div>
              <div className={`text-4xl sm:text-6xl font-bold flex items-center mt-3 h-fit ${isSelected ? 'text-red-900' : 'text-gray-500'}`}>
                {dayOfMonth}
              </div>
              <div className={`text-xs sm:text-xl uppercase h-4/12 mt-1 ${isSelected ? 'text-red-900'  : 'text-gray-500'}`}>
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

export default FourDayDatePicker;