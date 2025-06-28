import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import { addDays, subDays, format, nextTuesday, previousTuesday, isToday, isBefore, isEqual } from 'date-fns'; // Added isEqual, isBefore

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
        const formattedDate = format(date, 'MMMM d,yyyy');
        let allFull = true;
        for (const time of [
          "8:00am - 9:00am", "9:00am -10:00am",
          "10:00am-11:00am", "11:00am-12:00pm",
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
    <div className='flex-col flex justify-bet items-center h-4/12 w-full lg:w-fit '>
      <h1 className='font-bold text-4xl text-gray-600 league-font'>
        Pick a date
      </h1>

      <div className="flex items-center justify-center space-x-2 sm:space-x-4 w-full lg:w-fit">
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
        <div className="flex flex-wrap justify-center sm:justify-start shadow-lg shadow-gray-300 w-full sm:w-full xl:h-4/4 ">
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
            const formattedDate = format(date, 'MMMM d,yyyy');
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