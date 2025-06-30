import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import kuruKuru from '../../public/kurukuru-kururing.gif';
import { buildApiUrl, API_ENDPOINTS } from '../../../config/api';
import { getDisplayTimeSlots, displayToCanonical, normalizeDate } from '../../../utils/timeUtils';

const TimePicker = (props) =>
{
    const navigate = useNavigate();
    const [isAM, setIsAM] = useState(true);
    const [slotData, setSlotData] = useState({});
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const autoRefreshInterval = useRef(null);

    // Use canonical time slots from utility
    const timeSlots = getDisplayTimeSlots();

    // Debug: Log AM/PM state and displayed times
    useEffect(() => {
        const displayedTimes = isAM ? timeSlots.slice(0, 4) : timeSlots.slice(4, 8);
        console.log('[DEBUG] isAM:', isAM);
        console.log('[DEBUG] displayedTimes:', displayedTimes);
        console.log('[DEBUG] selectedTime:', props.selectedTime);
    }, [isAM, props.selectedTime, timeSlots]);

    const handleChangePeriod = () =>
    {
        console.log('[DEBUG] Toggle AM/PM. Current isAM:', isAM);
        setIsAM(prev => {
            props.setSelectedTime(null);
            return !prev;
        });
    };

    const handleChooseTime = (e) =>
    {
        const selected = e.currentTarget.value;
        if (props.selectedTime === selected)
        {
            props.setSelectedTime(null);
        } else
        {
            props.setSelectedTime(selected);
        }
    };

    const getSlotAvailability = (time) =>
    {
        const canonicalTime = displayToCanonical(time);
        const slotInfo = slotData[canonicalTime];
        if (!slotInfo) return 0;
        return Math.max(0, slotInfo.max_capacity - slotInfo.count);
    };

    const getSlotMaxCapacity = (time) =>
    {
        const canonicalTime = displayToCanonical(time);
        return slotData[canonicalTime]?.max_capacity || 12;
    };

    // Function to fetch slot data
    const fetchSlotData = async (date, forceRefresh = false) => {
        if (!date) {
            setLoading(false);
            return;
        }

        // Always normalize the date for cache and API
        const normalizedDate = normalizeDate(date);

        if (forceRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        
        setErrorMsg("");
        const cacheKey = `slot_data_${normalizedDate}`;
        
        // Check cache unless force refresh is requested
        if (!forceRefresh) {
            const cache = localStorage.getItem(cacheKey);
            if (cache) {
                const { data, timestamp } = JSON.parse(cache);
                if (Date.now() - timestamp < 30000) { // 30 seconds
                    setSlotData(data);
                    setLoading(false);
                    return;
                }
            }
        }

        const data = {};
        for (const time of timeSlots) {
            const canonicalTime = displayToCanonical(time);
            try {
                const res = await axios.get(`${buildApiUrl(API_ENDPOINTS.GET_SLOT_COUNT)}`, {
                    params: {
                        schedule_date: normalizedDate,
                        schedule_time: canonicalTime
                    }
                });
                data[canonicalTime] = {
                    count: res.data.count || 0,
                    max_capacity: res.data.max_capacity || 12
                };
            } catch (e) {
                data[canonicalTime] = { count: 0, max_capacity: 12 };
            }
        }
        setSlotData(data);
        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
        setLoading(false);
        setRefreshing(false);
    };

    // Auto-refresh mechanism
    useEffect(() => {
        if (props.selectedDate) {
            // Clear any existing interval
            if (autoRefreshInterval.current) {
                clearInterval(autoRefreshInterval.current);
            }
            // Set up auto-refresh every 10 seconds
            autoRefreshInterval.current = setInterval(() => {
                fetchSlotData(props.selectedDate, true);
            }, 10000);
        }
        // Cleanup on unmount or when date changes
        return () => {
            if (autoRefreshInterval.current) {
                clearInterval(autoRefreshInterval.current);
            }
        };
    }, [props.selectedDate]);

    useEffect(() =>
    {
        if (!props.selectedDate)
        {
            props.setSelectedTime(null);
            setLoading(false);
            return;
        }
        // Always normalize the date before passing
        fetchSlotData(normalizeDate(props.selectedDate));
    }, [props.selectedDate]);

    const handleSchedule = async () =>
    {
        if (!props.selectedTime)
        {
            return;
        }
        
        const slotsLeft = getSlotAvailability(props.selectedTime);
        if (slotsLeft <= 0)
        {
            setErrorMsg('Selected slot is already full. Please choose another slot.');
            // Refresh slot data to get latest counts
            await fetchSlotData(props.selectedDate, true);
            return;
        }
        
        setErrorMsg("");
        try
        {
            props.setRegistrationInputs(prev => ({
                ...prev,
                schedule_time: displayToCanonical(props.selectedTime) // Store canonical format
            }));
            props.handlingDataObjectsTest();
            navigate('/receipt');
        } catch (err)
        {
            if (err.response && err.response.data && err.response.data.message)
            {
                setErrorMsg(err.response.data.message);
            } else if (err.message)
            {
                setErrorMsg(`Scheduling error: ${err.message}`);
            } else
            {
                setErrorMsg("An error occurred while scheduling. Please try again.");
            }
        }
    };

    const renderButton = (time) =>
    {
        const slotsLeft = getSlotAvailability(time);
        const maxCapacity = getSlotMaxCapacity(time);
        const isSelected = props.selectedTime === time;
        const isFull = slotsLeft <= 0;

        return (
            <button
                key={time}
                value={time}
                onClick={handleChooseTime}
                disabled={isFull}
                className={`
                    w-44 sm:w-56 md:w-64 lg:w-72
                    flex flex-col items-center justify-center
                    bg-white border-2
                    ${isSelected ? 'border-yellow-500 bg-yellow-400 text-white font-bold shadow-lg' : 'border-gray-200 text-gray-700'}
                    rounded-xl shadow-md mb-2 py-4 px-2 transition-all duration-200
                    ${isFull ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:border-yellow-400'}
                `}
                style={{ minHeight: 90 }}
            >
                <span className="text-lg sm:text-xl font-semibold tracking-tight mb-1">{time}</span>
                <span className={`font-medium text-base ${slotsLeft === 0 ? 'text-red-600' : 'text-green-700'}`}>Slots: {slotsLeft}/{maxCapacity}</span>
                {isFull && <span className="mt-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">Full</span>}
            </button>
        );
    };

    const displayedTimes = isAM
        ? timeSlots.slice(0, 4)
        : timeSlots.slice(4, 8);

    return (
        <div className='flex flex-col justify-center items-center w-full'>
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <img src={kuruKuru} alt="Loading..." className="w-24 h-24 mx-auto" />
                    <p className="text-lg text-gray-500 mt-4 font-bold">Loading slots...</p>
                </div>
            ) : props.selectedDate ? (
                <>
                    <h1 className='league-font text-[#686868] text-2xl sm:text-3xl font-medium mb-0 mt-4'>
                        Choose your Availability
                    </h1>
                    {refreshing && (
                        <div className="text-blue-600 font-semibold text-center mb-2 mt-1 text-sm">
                            🔄 Updating slot availability...
                        </div>
                    )}
                    {errorMsg ? (
                        <div className="text-red-600 font-semibold text-center mt-1 text-base">
                            {errorMsg}
                        </div>
                    ) :
                        !props.selectedTime && (
                            <div className="text-red-600 font-semibold text-center mt-1 text-base">
                                Please select a slot before scheduling.
                            </div>
                        )
                    }
                    <div className='flex h-fit league-font w-full justify-center text-sm sm:text-md mb-3'>
                        <button
                            onClick={() => { setIsAM(true); props.setSelectedTime(null); }}
                            className={`font-bold rounded-l-lg px-4 pt-2 transition-all duration-300 border-none focus:outline-none ${isAM ? 'bg-[#E1A500] text-white' : 'bg-[#D1D1D1] text-gray-700 hover:bg-[#FFD54F]'}`}
                            style={{ borderTopLeftRadius: '0.75rem', borderBottomLeftRadius: '0.75rem', cursor: 'pointer' }}
                            type="button"
                        >
                            AM
                        </button>
                        <button
                            onClick={() => { setIsAM(false); props.setSelectedTime(null); }}
                            className={`font-bold rounded-r-lg px-4 pt-2 transition-all duration-300 border-none focus:outline-none ${!isAM ? 'bg-purple-400 text-white' : 'bg-[#D1D1D1] text-gray-700 hover:bg-purple-200'}`}
                            style={{ borderTopRightRadius: '0.75rem', borderBottomRightRadius: '0.75rem', cursor: 'pointer' }}
                            type="button"
                        >
                            PM
                        </button>
                    </div>
                    <div className='flex-col flex gap-y-3 text-xs md:text-lg lg:text-xl mb-3'>
                        <div className='flex martian-font gap-x-4 sm:gap-x-8'>
                            {renderButton(displayedTimes[0])}
                            {renderButton(displayedTimes[1])}
                        </div>
                        <div className='flex martian-font gap-x-4 sm:gap-x-8'>
                            {renderButton(displayedTimes[2])}
                            {renderButton(displayedTimes[3])}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className='bg-[#E1A500] border-[#C68C10] league-font text-base px-6 py-2 font-bold border-2 text-white rounded-md hover:bg-amber-600 duration-200 mt-2'
                            onClick={handleSchedule}
                            disabled={!props.selectedTime}
                        >
                            Schedule
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center py-12">
                    <h2 className='text-gray-500 text-lg'>Please select a date to view available slots.</h2>
                </div>
            )}
        </div>
    );
};

export default TimePicker;
