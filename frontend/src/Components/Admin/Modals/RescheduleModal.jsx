import React, { useRef, useState } from 'react'
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../../config/api';

import { format } from 'date-fns';
import { getDisplayTimeSlots, displayToCanonical } from '../../../utils/timeUtils';

const TIME_SLOTS = [
    { canonical: '08:00:00', display: '8:00am - 9:00am' },
    { canonical: '09:00:00', display: '9:00am - 10:00am' },
    { canonical: '10:00:00', display: '10:00am - 11:00am' },
    { canonical: '11:00:00', display: '11:00am - 12:00pm' },
    { canonical: '13:00:00', display: '1:00pm - 2:00pm' },
    { canonical: '14:00:00', display: '2:00pm - 3:00pm' },
    { canonical: '15:00:00', display: '3:00pm - 4:00pm' },
    { canonical: '16:00:00', display: '4:00pm - 5:00pm' },
];

export default function RescheduleModal(props)
{
    const [slotData, setSlotData] = useState({}); // Object keyed by canonical time
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const requestIdRef = useRef(0);
    // Focus trap and Escape key
    const modalRef = useRef(null);
    const [isAM, setIsAM] = useState(true);
    // Use canonical time slots from utility
    const timeSlots = getDisplayTimeSlots ? getDisplayTimeSlots() : [
        '8:00am - 9:00am', '9:00am - 10:00am', '10:00am - 11:00am', '11:00am - 12:00pm',
        '1:00pm - 2:00pm', '2:00pm - 3:00pm', '3:00pm - 4:00pm', '4:00pm - 5:00pm'
    ];
    const handleChangePeriod = () => {
        setIsAM(prev => {
            props.setRescheduleTime(null);
            return !prev;
        });
    };
    const handleChooseTime = (time) => {
        if (props.rescheduleTime === time) {
            props.setRescheduleTime(null);
        } else {
            props.setRescheduleTime(time);
        }
    };
    const displayedTimes = isAM ? timeSlots.slice(0, 4) : timeSlots.slice(4, 8);

    // Called by parent after picking a date
    const fetchSlotCounts = async (dateString, autoRefresh = false) =>
    {
        if (!dateString) return;
        setLoading(true);
        setFetchError(null);
        const thisRequestId = ++requestIdRef.current;
        try
        {
            console.log('[DEBUG] fetchSlotCounts called with dateString:', dateString);
            const date = new Date(dateString);
            const formattedDate = date.toISOString().split('T')[0];
            console.log('[DEBUG] formattedDate for API:', formattedDate);
            const promises = TIME_SLOTS.map(slot => {
                const params = {
                    schedule_date: formattedDate,
                    schedule_time: slot.canonical
                };
                console.log('[DEBUG] API params:', params);
                return axios.get(buildApiUrl(API_ENDPOINTS.GET_SLOT_COUNT), { params });
            });
            const responses = await Promise.all(promises);
            console.log('[DEBUG] API responses:', responses.map(r => r.data));
            // Only update if this is the latest request
            if (thisRequestId !== requestIdRef.current) return;
            const slotObj = {};
            TIME_SLOTS.forEach((slot, i) => {
                slotObj[slot.canonical] = {
                    display: slot.display,
                    count: responses[i].data.count || 0,
                    max: responses[i].data.max_capacity || 12
                };
            });
            setSlotData(slotObj);
        } catch (err)
        {
            if (thisRequestId !== requestIdRef.current) return;
            console.error('[DEBUG] fetchSlotCounts error:', err);
            setFetchError('Failed to load slot data. Please try again.');
            setSlotData({});
        }
        setLoading(false);
    };

    // Called by parent after picking a date
    React.useImperativeHandle(props.innerRef, () => ({
        fetchSlotCounts
    }));

    React.useEffect(() =>
    {
        function handleKeyDown(e)
        {
            // Only handle Escape, Tab, and Enter keys
            if (e.key === 'Escape')
            {
                e.preventDefault();
                props.handleRescheduleCancel();
            } else if (e.key === 'Enter')
            {
                // Only submit on Enter if focused on a button or the last input field
                const focusableEls = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const focusable = Array.prototype.slice.call(focusableEls);
                const currentIndex = Array.from(focusable).indexOf(document.activeElement);
                const isLastInput = currentIndex === focusable.length - 1;
                const isButton = e.target.tagName === 'BUTTON';

                if (isButton || isLastInput)
                {
                    e.preventDefault();
                    props.handleRescheduleSave();
                }
                // If not on button or last input, let Enter work normally
            } else if (e.key === 'Tab')
            {
                const focusableEls = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const focusable = Array.prototype.slice.call(focusableEls);
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (!e.shiftKey && document.activeElement === last)
                {
                    e.preventDefault();
                    first.focus();
                } else if (e.shiftKey && document.activeElement === first)
                {
                    e.preventDefault();
                    last.focus();
                }
            }
            // Don't handle other keys - let them pass through normally
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [props]);

    // Remove the manual Refresh button and add auto-refresh logic
    const autoRefreshInterval = useRef(null);
    React.useEffect(() => {
        if (props.rescheduleDate) {
            // Clear any existing interval
            if (autoRefreshInterval.current) {
                clearInterval(autoRefreshInterval.current);
            }
            // Set up auto-refresh every 10 seconds
            autoRefreshInterval.current = setInterval(() => {
                fetchSlotCounts(props.rescheduleDate, true);
            }, 10000);
        }
        // Cleanup on unmount or when date changes
        return () => {
            if (autoRefreshInterval.current) {
                clearInterval(autoRefreshInterval.current);
            }
        };
    }, [props.rescheduleDate]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div
                className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                ref={modalRef}
                aria-modal="true"
                role="dialog"
            >
                <h2 className="text-xl font-bold mb-4">Reschedule Student</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="flex items-center gap-2">
                        <span className="p-2 border border-gray-300 rounded-lg bg-gray-50 min-w-[140px]">
                            {
                                props.rescheduleDate ? props.rescheduleDate : 'No Date Chosen'
                            }

                        </span>
                        <button
                            type="button"
                            onClick={() =>
                            {
                                props.setShowCalendar(true);
                            }}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold border-2 border-blue-600 text-sm"
                        >
                            Pick Date
                        </button>


                        {/* REMOVE THIS LATER - TESTING PURPOSES ONLY */}
                        <button className='border'
                            onClick={() =>
                            {
                                console.log(props.rescheduleDate);

                                const formattedDate = format(props.rescheduleDate, 'yyyy-MM-dd');
                                props.setRescheduleDate(formattedDate);
                                console.log(formattedDate);

                                /*  () => props.handleDateChange(); */
                            }}
                        >TEST BUTTON</button>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <div className='flex h-fit w-full justify-center text-sm mb-3'>
                        <button
                            onClick={() => { setIsAM(true); props.setRescheduleTime(null); }}
                            className={`font-bold rounded-l-lg px-4 pt-2 transition-all duration-300 border-none focus:outline-none ${isAM ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-yellow-200'}`}
                            style={{ borderTopLeftRadius: '0.75rem', borderBottomLeftRadius: '0.75rem', cursor: 'pointer' }}
                            type="button"
                        >
                            AM
                        </button>
                        <button
                            onClick={() => { setIsAM(false); props.setRescheduleTime(null); }}
                            className={`font-bold rounded-r-lg px-4 pt-2 transition-all duration-300 border-none focus:outline-none ${!isAM ? 'bg-purple-400 text-white' : 'bg-gray-200 text-gray-700 hover:bg-purple-200'}`}
                            style={{ borderTopRightRadius: '0.75rem', borderBottomRightRadius: '0.75rem', cursor: 'pointer' }}
                            type="button"
                        >
                            PM
                        </button>
                    </div>
                    <div className='flex-col flex gap-y-3 text-xs md:text-lg lg:text-xl mb-3'>
                        <div className='flex gap-x-4 sm:gap-x-8'>
                            {displayedTimes.slice(0,2).map(time => {
                                const canonical = displayToCanonical(time);
                                const slot = slotData[canonical] || { display: time, count: 0, max: 12 };
                                const slotsLeft = slot.max - slot.count;
                                const isSelected = props.rescheduleTime === time;
                                const isFull = slotsLeft <= 0;
                                return (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => handleChooseTime(time)}
                                        disabled={isFull || loading || !props.rescheduleDate}
                                        className={`w-44 sm:w-56 md:w-64 lg:w-72 flex flex-col items-center justify-center border-2 rounded-xl shadow-md mb-2 py-4 px-2 transition-all duration-200 font-bold
                                            ${isSelected ? 'border-yellow-500 bg-yellow-400 text-white shadow-lg' : 'border-gray-200 text-gray-700 bg-white'}
                                            ${isFull ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:border-yellow-400'}
                                        `}
                                        style={{ minHeight: 90 }}
                                    >
                                        <span className="text-lg sm:text-xl font-semibold tracking-tight mb-1">{time}</span>
                                        <span className={`font-medium text-base ${slotsLeft === 0 ? 'text-red-600' : 'text-green-700'}`}>Slots: {slotsLeft}/{slot.max}</span>
                                        {isFull && <span className="mt-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">Full</span>}
                                    </button>
                                );
                            })}
                        </div>
                        <div className='flex gap-x-4 sm:gap-x-8'>
                            {displayedTimes.slice(2,4).map(time => {
                                const canonical = displayToCanonical(time);
                                const slot = slotData[canonical] || { display: time, count: 0, max: 12 };
                                const slotsLeft = slot.max - slot.count;
                                const isSelected = props.rescheduleTime === time;
                                const isFull = slotsLeft <= 0;
                                return (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => handleChooseTime(time)}
                                        disabled={isFull || loading || !props.rescheduleDate}
                                        className={`w-44 sm:w-56 md:w-64 lg:w-72 flex flex-col items-center justify-center border-2 rounded-xl shadow-md mb-2 py-4 px-2 transition-all duration-200 font-bold
                                            ${isSelected ? 'border-yellow-500 bg-yellow-400 text-white shadow-lg' : 'border-gray-200 text-gray-700 bg-white'}
                                            ${isFull ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:border-yellow-400'}
                                        `}
                                        style={{ minHeight: 90 }}
                                    >
                                        <span className="text-lg sm:text-xl font-semibold tracking-tight mb-1">{time}</span>
                                        <span className={`font-medium text-base ${slotsLeft === 0 ? 'text-red-600' : 'text-green-700'}`}>Slots: {slotsLeft}/{slot.max}</span>
                                        {isFull && <span className="mt-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">Full</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {loading && (
                        <p className="text-sm text-gray-500 mt-1">Loading slot availability...</p>
                    )}
                    {fetchError && (
                        <p className="text-sm text-red-500 mt-1">{fetchError}</p>
                    )}
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={props.handleRescheduleCancel}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold border-2 border-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={props.handleRescheduleSave}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold border-2 border-yellow-600"
                        disabled={loading || !props.rescheduleDate}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}
