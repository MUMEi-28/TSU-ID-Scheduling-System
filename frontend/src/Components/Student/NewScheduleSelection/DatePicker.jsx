import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import { addDays, subDays, format, nextTuesday, previousTuesday, isToday, isBefore, isEqual } from 'date-fns'; // Added isEqual, isBefore
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../../config/api';
import { getCanonicalTimeSlots } from '../../../utils/timeUtils';

function DatePicker(props) {
  // Normalize 'today' to the start of the day for consistent comparisons
  const todayNormalized = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Calculate the earliest allowed 'currentWeekStart' (the Tuesday of the current week or today if today is Tuesday)
  const initialCurrentWeekStart = useMemo(() => {
    const dayOfWeek = todayNormalized.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

    if (dayOfWeek === 2) { // Tuesday (Tarlac City might have different start of week, but JS getDay() is consistent)
      return todayNormalized;
    } else if (dayOfWeek < 2 || dayOfWeek === 6) { // Monday (1) or Sunday (0) or Saturday (6)
      return nextTuesday(todayNormalized);
    } else { // Wednesday (3), Thursday (4), Friday (5)
      return previousTuesday(todayNormalized);
    }
  }, [todayNormalized]);

  const [currentWeekStart, setCurrentWeekStart] = useState(initialCurrentWeekStart); // Initialize with the calculated earliest start

  const [availableDates, setAvailableDates] = useState([]);
  const [fullDates, setFullDates] = useState([]);

  const calculateWeekDays = useCallback(() => {
    const dates = [];
    let currentDate = currentWeekStart;
    // Ensure currentWeekStart is valid before adding days
    if (!(currentDate instanceof Date) || isNaN(currentDate.getTime())) {
      console.error("Invalid currentWeekStart detected in calculateWeekDays, resetting to initialCurrentWeekStart.");
      currentDate = initialCurrentWeekStart; // Fallback to a valid date
    }

    for (let i = 0; i < 4; i++) { // Loop 4 times
      dates.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }
    setAvailableDates(dates);
  }, [currentWeekStart, initialCurrentWeekStart]); // Added initialCurrentWeekStart to dependencies

  // Recalculate dates whenever currentWeekStart changes
  useEffect(() => {
    calculateWeekDays();
  }, [currentWeekStart, calculateWeekDays]);

  useEffect(() => {
    // Check which dates are fully booked
    const validDatesForCache = availableDates.filter(d => d instanceof Date && !isNaN(d.getTime()));
    const cacheKey = `full_dates_${validDatesForCache.map(d => format(d, 'yyyy-MM-dd')).join('_')}`;
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
        // Validate date before formatting
        if (!(date instanceof Date) || isNaN(date.getTime())) {
          console.error("Skipping invalid date in checkFullDates loop:", date);
          continue;
        }
        const formattedDate = format(date, 'yyyy-MM-dd');
        let allFull = true;
        for (const time of getCanonicalTimeSlots()) {
          try {
            const res = await axios.get(buildApiUrl(API_ENDPOINTS.GET_SLOT_COUNT), {
              params: {
                schedule_date: formattedDate,
                schedule_time: time
              }
            });
            if ((res.data.count || 0) < (res.data.max_capacity || 12)) {
              allFull = false;
              break;
            }
          } catch (e) {
            allFull = false;
            break;
          }
        }
        if (allFull) results.push(format(date, 'MMMM d,yyyy'));
      }
      setFullDates(results);
      localStorage.setItem(cacheKey, JSON.stringify({ data: results, timestamp: Date.now() }));
    };
    if (availableDates.length > 0 && shouldFetch) checkFullDates();
  }, [availableDates]);

  const handleNextWeek = () => {
    setCurrentWeekStart(prevDate => {
      // Validate prevDate before using addDays
      if (!(prevDate instanceof Date) || isNaN(prevDate.getTime())) {
        console.error("Invalid 'prevDate' in handleNextWeek, using initialCurrentWeekStart as base:", prevDate);
        return addDays(initialCurrentWeekStart, 7); // Use a valid base if 'prevDate' is invalid
      }
      return addDays(prevDate, 7);
    });
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(prevDate => {
      // Validate prevDate before using subDays
      if (!(prevDate instanceof Date) || isNaN(prevDate.getTime())) {
        console.error("Invalid 'prevDate' in handlePrevWeek, using initialCurrentWeekStart as base:", prevDate);
        return initialCurrentWeekStart; // Use a valid base if 'prevDate' is invalid
      }
      const newDate = subDays(prevDate, 7);
      // Prevent going before the earliest allowed week start
      if (isBefore(newDate, initialCurrentWeekStart)) {
        return initialCurrentWeekStart;
      }
      return newDate;
    });
  };

  const handleDateSelect = (date) => {
    // Validate date before use
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Attempted to select an invalid date:", date);
      return;
    }
    const dateAsString = format(date, "MMMM d,yyyy");
    if (props.selectedDate === dateAsString) {
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

  // Disable previous button if currentWeekStart is the earliest allowed week start
  const isPrevDisabled = isEqual(currentWeekStart, initialCurrentWeekStart);


  return (
    <div className='flex flex-col justify-center items-center w-full'>
      <h1 className='font-bold text-3xl sm:text-4xl text-gray-600 league-font mb-6'>
        Pick a date
      </h1>

      <div className="flex items-center justify-center space-x-2 sm:space-x-4 w-full">
        <button
          onClick={handlePrevWeek}
          className={`p-2 sm:p-3 text-gray-500 transition-colors duration-200 ease-in-out rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300
                    ${isPrevDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-700 hover:bg-gray-200'}`}
          disabled={isPrevDisabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Date Display */}
        <div className="flex flex-wrap justify-center sm:justify-start shadow-lg shadow-gray-300 w-full">
          {availableDates.map((date) => {
            // Validate date before rendering
            if (!(date instanceof Date) || isNaN(date.getTime())) {
              console.error("Invalid date found in availableDates map during render:", date);
              return null; // Skip rendering this invalid date entry
            }

            const dayOfWeek = format(date, 'EEE');
            const dayOfMonth = format(date, 'dd');
            const month = format(date, 'MMM');
            const year = format(date, "yyyy");
            const isSelected = props.selectedDate && format(props.selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
            const isCurrentDay = isToday(date);
            const formattedDate = format(date, 'yyyy-MM-dd');
            const isFull = fullDates.includes(format(date, 'MMMM d,yyyy'));

            return (
              <button
                key={format(date, 'yyyy-MM-dd')}
                className={`league-font flex flex-col items-center justify-between w-1/4 sm:w-1/4 md:w-1/4 lg:w-1/4 h-24 sm:h-28 md:h-32 lg:h-36 transition-all duration-200 ease-in-out
                  border-4 rounded-lg
                  ${isSelected ? 'border-red-700 bg-red-50' : 'border-gray-300 bg-gray-100'}
                  ${isFull ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-lg'}`}
                onClick={() => !isFull && handleDateSelect(date)}
                disabled={isFull}
              >
                <div className='text-xs sm:text-sm md:text-lg pt-2 font-semibold text-gray-600 mb-1 border-gray-400 w-full flex justify-center items-center bg-neutral-200 rounded-t-sm'>
                  {dayOfWeek}
                </div>
                <div className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold flex items-end ${isSelected ? 'text-red-900' : 'text-neutral-500'}`}>
                  {dayOfMonth}
                </div>
                <div className={`text-xs sm:text-sm md:text-base lg:text-lg font-mono uppercase ${isSelected ? 'text-red-900' : 'text-gray-500'}`}>
                  {month}
                </div>
                <div className={`text-xs sm:text-xs md:text-sm lg:text-base font-mono uppercase ${isSelected ? 'text-red-900' : 'text-gray-400'}`}>
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