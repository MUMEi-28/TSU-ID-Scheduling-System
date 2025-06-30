import React, { useRef, useState } from 'react'
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../../config/api';

import { format } from 'date-fns';

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
    const [slotData, setSlotData] = useState([]); // Array of { canonical, display, count, max }
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const requestIdRef = useRef(0);
    // Focus trap and Escape key
    const modalRef = useRef(null);

    // Called by parent after picking a date
    const fetchSlotCounts = async (dateString) =>
    {
        if (!dateString) return;
        setLoading(true);
        setFetchError(null);
        const thisRequestId = ++requestIdRef.current;
        try
        {
            const date = new Date(dateString);
            const formattedDate = date.toISOString().split('T')[0];
            const promises = TIME_SLOTS.map(slot =>
                axios.get(buildApiUrl(API_ENDPOINTS.GET_SLOT_COUNT), {
                    params: {
                        schedule_date: formattedDate,
                        schedule_time: slot.canonical
                    }
                })
            );
            const responses = await Promise.all(promises);
            // Only update if this is the latest request
            if (thisRequestId !== requestIdRef.current) return;
            const normalized = TIME_SLOTS.map((slot, i) => ({
                canonical: slot.canonical,
                display: slot.display,
                count: responses[i].data.count || 0,
                max: responses[i].data.max_capacity || 12
            }));
            setSlotData(normalized);
        } catch (err)
        {
            if (thisRequestId !== requestIdRef.current) return;
            setFetchError('Failed to load slot data. Please try again.');
            setSlotData([]);
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
                    <select
                        value={props.rescheduleTime}
                        onChange={e => props.setRescheduleTime(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-gray-400"
                        disabled={loading || !props.rescheduleDate}
                    >
                        {slotData.map(slot =>
                        {
                            const isFull = slot.count >= slot.max;
                            return (
                                <option
                                    key={slot.canonical}
                                    value={slot.display}
                                    disabled={isFull}
                                >
                                    {slot.display} ({slot.count}/{slot.max}){isFull ? ' - Full' : ''}
                                </option>
                            );
                        })}
                    </select>
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
