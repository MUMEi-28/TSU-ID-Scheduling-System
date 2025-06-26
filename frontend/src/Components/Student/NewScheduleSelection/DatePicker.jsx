import React, { useState, useEffect, useCallback } from 'react';
import { addDays, subDays, format, nextTuesday, previousTuesday, isToday } from 'date-fns';
import axios from 'axios';

function DatePicker(props)
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
  const [fullDates, setFullDates] = useState([]);

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
  }, [currentWeekStart, props.selectedDate]);

  // Recalculate dates whenever currentWeekStart changes
  useEffect(() =>
  {
    calculateWeekDays();
  }, [currentWeekStart, calculateWeekDays]);

  useEffect(() => {
    // Check which dates are fully booked
    const cacheKey = `full_dates_${availableDates.map(d => format(d, 'yyyy-MM-dd')).join('_')}`;
    const cache = localStorage.getItem(cacheKey);
    let shouldFetch = true;
    if (cache) {
      const { data, timestamp } = JSON.parse(cache);
      if (Date.now() - timestamp < 30000) { // 30 seconds
        setFullDates(data);
        shouldFetch = false;
      }
    }
    const checkFullDates = async () => {
      const results = [];
      for (const date of availableDates) {
        const formattedDate = format(date, 'MMMM d, yyyy');
        let allFull = true;
        for (const time of [
          "8:00am - 9:00am", "9:00am -10:00am",
          "10:00am-11:00am", "11:00am-12:00am",
          "1:00pm - 2:00pm", "2:00pm - 3:00pm",
          "3:00pm - 4:00pm", "4:00pm - 5:00pm"
        ]) {
          try {
            const res = await axios.get(`http://localhost/Projects/TSU-ID-Scheduling-System/backend/get_slot_count.php`, {
              params: {
                schedule_date: formattedDate,
                schedule_time: time
              }
            });
            if ((res.data.count || 0) < 12) {
              allFull = false;
              break;
            }
          } catch (e) {
            allFull = false;
            break;
          }
        }
        if (allFull) results.push(formattedDate);
      }
      setFullDates(results);
      localStorage.setItem(cacheKey, JSON.stringify({ data: results, timestamp: Date.now() }));
    };
    if (availableDates.length > 0 && shouldFetch) checkFullDates();
  }, [availableDates]);

  const handleNextWeek = () =>
  {
    setCurrentWeekStart(prevDate => addDays(prevDate, 7)); // Add 7 days 
  };

  const handlePrevWeek = () =>
  {
    setCurrentWeekStart(prevDate => subDays(prevDate, 7)); // Subtract 7 days 
  };

  const handleDateSelect = (date) => {
    const dateAsString = format(date, "MMMM d, yyyy");
    if (props.selectedDate === dateAsString) {
      // If already selected, unselect
      props.setSelectedDate(null);
      props.setRegistrationInputs(prev => ({
        ...prev,
        schedule_date: null
      }));
    } else {
      props.setSelectedDate(dateAsString);
      props.setRegistrationInputs(prev => ({
        ...prev,
        schedule_date: dateAsString
      }));
    }
  };


  return (
    <div className='flex-col flex justify-bet items-center h-4/12 w-full lg:w-fit '>

      <h1 className='font-bold text-4xl text-gray-600 league-font'>
        Pick a date
      </h1>

      <div className="flex items-center justify-center space-x-2 sm:space-x-4 w-full lg:w-fit">

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
        <div className="flex flex-wrap justify-center sm:justify-start shadow-lg shadow-gray-300 w-full sm:w-full xl:h-4/4 ">
          {availableDates.map((date) => 
          {
            const dayOfWeek = format(date, 'EEE');
            const dayOfMonth = format(date, 'dd');
            const month = format(date, 'MMM');

            const year = format(date, "yyyy")
            const isSelected = props.selectedDate && format(props.selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
            const isCurrentDay = isToday(date);
            const formattedDate = format(date, 'MMMM d, yyyy');
            const isFull = fullDates.includes(formattedDate);

            return (
              <button
                key={format(date, 'yyyy-MM-dd')}
                className={`league-font flex flex-col items-center justify-between w-1/4 sm:h-35 md:h-45 lg:w-40 xl:h-60 transition-all duration-200 ease-in-out
                  border-4
                  ${isSelected ? 'border-red-700 bg-red-50' : 'border-gray-300 bg-gray-100'}
                  ${isFull ? 'opacity-40 cursor-not-allowed' : ''}`}
                onClick={() => !isFull && handleDateSelect(date)}
                disabled={isFull}
              >
                <div className='text-md sm:text-xl pt-3 font-semibold text-gray-600 mb-3 border-gray-400 w-full h-4/12 flex justify-center items-center bg-neutral-200'>
                  {dayOfWeek}
                </div>
                <div className={`text-3xl md:text-4xl lg:text-5xl font-bold flex items-end h-5/12 ${isSelected ? 'text-red-900' : 'text-neutral-500'}`}>
                  {dayOfMonth}
                </div>
                <div className={`text-sm md:text-xl lg:text-2xl font-mono uppercase h-3/12 ${isSelected ? 'text-red-900' : 'text-gray-500'}`}>
                  {month}
                </div>
                <div className={`text-sm md:text-lg lg:text-xl font-mono uppercase h-3/12 ${isSelected ? 'text-red-900' : 'text-gray-400'}`}>
                  {year}
                </div>
                {isFull && <div className="text-xs text-red-700 font-bold mt-1">All slots full</div>}
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