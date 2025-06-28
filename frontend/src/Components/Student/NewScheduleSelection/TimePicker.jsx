import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import kuruKuru from '../../public/kurukuru-kururing.gif';
import { buildApiUrl, API_ENDPOINTS } from '../../../config/api';

const TimePicker = (props) =>
{
    const navigate = useNavigate();
    const [isAM, setIsAm] = useState(true);
    const [slotCounts, setSlotCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const timeSlots = [
        "8:00am - 9:00am", "9:00am -10:00am",
        "10:00am-11:00am", "11:00am-12:00pm",
        "1:00pm - 2:00pm", "2:00pm - 3:00pm",
        "3:00pm - 4:00pm", "4:00pm - 5:00pm"
    ];

    const handleChangePeriod = () =>
    {
        setIsAm(!isAM);
        props.setSelectedTime(null);
    };

    const handleChooseTime = (e) =>
    {
        const selected = e.target.value;
        if (props.selectedTime === selected) {
            props.setSelectedTime(null);
        } else {
            props.setSelectedTime(selected);
        }
    };

    const getSlotAvailability = (time) =>
    {
        return slotCounts[time];
    };

    useEffect(() => {
        if (!props.selectedDate) {
            props.setSelectedTime(null);
            setLoading(false);
            return;
        }
        setErrorMsg("");
        setLoading(true);
        const cacheKey = `slot_counts_${props.selectedDate}`;
        const cache = localStorage.getItem(cacheKey);
        let shouldFetch = true;
        if (cache) {
            const { data, timestamp } = JSON.parse(cache);
            if (Date.now() - timestamp < 30000) { // 30 seconds
                setSlotCounts(data);
                setLoading(false);
                shouldFetch = false;
            }
        }
        if (shouldFetch) {
            const fetchCounts = async () => {
                const counts = {};
                const formattedDate = format(new Date(props.selectedDate), "MMMM d, yyyy");
                for (const time of timeSlots) {
                    try {
                        const res = await axios.get(`${buildApiUrl(API_ENDPOINTS.getSlotCount)}`, {
                            params: {
                                schedule_date: formattedDate,
                                schedule_time: time
                            }
                        });
                        counts[time] = res.data.count || 0;
                    } catch (e) {
                        counts[time] = 0;
                    }
                }
                setSlotCounts(counts);
                localStorage.setItem(cacheKey, JSON.stringify({ data: counts, timestamp: Date.now() }));
                setLoading(false);
            };
            fetchCounts();
        }
    }, [props.selectedDate]);

    const handleSchedule = async () => {
        if (!props.selectedTime) {
            return;
        }
        const slotsLeft = getSlotAvailability(props.selectedTime);
        if (slotsLeft >= 12) {
            setErrorMsg('Selected slot is already full. Please choose another slot.');
            const formattedDate = format(new Date(props.selectedDate), "MMMM d, yyyy");
            const counts = {};
            for (const time of timeSlots) {
                try {
                    const res = await axios.get(`${buildApiUrl(API_ENDPOINTS.getSlotCount)}`, {
                        params: {
                            schedule_date: formattedDate,
                            schedule_time: time
                        }
                    });
                    counts[time] = res.data.count || 0;
                } catch (e) {
                    counts[time] = 0;
                }
            }
            setSlotCounts(counts);
            localStorage.setItem(`slot_counts_${props.selectedDate}`, JSON.stringify({ data: counts, timestamp: Date.now() }));
            return;
        }
        setErrorMsg("");
        try {
            props.setRegistrationInputs(prev => ({
                ...prev,
                schedule_time: props.selectedTime
            }));
            props.handlingDataObjectsTest();
            navigate('/receipt');
            const formattedDate = format(new Date(props.selectedDate), "MMMM d, yyyy");
            const counts = {};
            for (const time of timeSlots) {
                try {
                    const res = await axios.get(`${buildApiUrl(API_ENDPOINTS.getSlotCount)}`, {
                        params: {
                            schedule_date: formattedDate,
                            schedule_time: time
                        }
                    });
                    counts[time] = res.data.count || 0;
                } catch (e) {
                    counts[time] = 0;
                }
            }
            setSlotCounts(counts);
            localStorage.setItem(`slot_counts_${props.selectedDate}`, JSON.stringify({ data: counts, timestamp: Date.now() }));
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setErrorMsg(err.response.data.message);
            } else if (err.message) {
                setErrorMsg(`Scheduling error: ${err.message}`);
            } else {
                setErrorMsg("An error occurred while scheduling. Please try again.");
            }
        }
    };

    const renderButton = (time) =>
    {
        const slotsLeft = getSlotAvailability(time);
        const isSelected = props.selectedTime === time;
        const isFull = slotsLeft >= 12;

        return (
            <button
                key={time}
                value={time}
                onClick={handleChooseTime}
                disabled={isFull}
                className={`
                    ${isFull ? 'opacity-50 cursor-not-allowed' : ''}
                    shadow-md rounded-lg transition-all py-5 p-2 sm:px-10 duration-200 border-2
                    ${isSelected
                        ? isAM
                            ? 'bg-[#E1A500] border-[#C68C10] text-white'
                            : 'text-white bg-purple-400 border-purple-500'
                        : 'bg-[#EBEBEB] text-[#7B7B7B] border-[#D4D4D4]'
                    }`}
            >
                <p className='pointer-events-none'>{time}</p>
                {isFull ? (
                    <p className='pointer-events-none text-red-600 font-bold text-sm mt-1'>Slots are Full!</p>
                ) : (
                    <p className={`pointer-events-none  ${getSlotAvailability(props.selectedTime) >= 8 ? 'text-[#b11616]' : getSlotAvailability(props.selectedTime) >= 4 ? 'text-[#d7e427]' : isSelected ? 'text-white' : 'text-[#27732A]'} text-sm mt-1`}>Slots: {slotsLeft}/12</p>
                )}
            </button >
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
                    <h1 className='league-font text-[#686868] text-2xl sm:text-3xl font-medium mb-6'>
                        Choose your Availability
                    </h1>
                    {errorMsg ? (
                        <div className="text-red-600 font-semibold text-center mb-4">
                            {errorMsg}
                        </div>
                    ) :
                        !props.selectedTime && (
                            <div className="text-red-600 font-semibold text-center mb-4">
                                Please select a slot before scheduling.
                            </div>
                        )
                    }
                    <div className='flex h-fit league-font w-full justify-center text-sm sm:text-md mb-6'>
                        <button onClick={handleChangePeriod} className='bg-[#BDBDBD] flex transition-all duration-300 rounded-lg shadow-md'>
                            <div className={`font-bold rounded-l-lg px-4 pt-2 ${isAM ? 'bg-[#E1A500] text-white' : 'bg-[#BDBDBD] text-[#BDBDBD]'}`}>AM</div>
                            <div className={`font-bold rounded-r-lg px-4 pt-2 ${!isAM ? 'bg-purple-400 text-white' : 'bg-[#BDBDBD] text-[#BDBDBD]'}`}>PM</div>
                        </button>
                    </div>
                    <div className='flex-col flex gap-y-6 text-xs md:text-lg lg:text-xl mb-6'>
                        <div className='flex martian-font gap-x-4 sm:gap-x-8'>
                            {renderButton(displayedTimes[0])}
                            {renderButton(displayedTimes[1])}
                        </div>
                        <div className='flex martian-font gap-x-4 sm:gap-x-8'>
                            {renderButton(displayedTimes[2])}
                            {renderButton(displayedTimes[3])}
                        </div>
                    </div>
                    <button
                        className='bg-[#E1A500] border-[#C68C10] league-font text-lg sm:text-2xl px-8 sm:px-13 py-3 font-bold border-2 text-white rounded-lg hover:bg-amber-600 duration-200'
                        onClick={handleSchedule}
                        disabled={!props.selectedTime}
                    >
                        Schedule
                    </button>
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
