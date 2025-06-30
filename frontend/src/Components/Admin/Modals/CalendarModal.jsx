import React, { Suspense, useEffect, useRef } from 'react'

export default function CalendarModal(props)
{
    // Lazy load the Calendar component
    const Calendar = React.lazy(() => import('../../Student/ScheduleSelection/Calendar'));
    // Focus trap and Escape key
    const modalRef = useRef(null);
    useEffect(() => {
        if (modalRef.current) {
            modalRef.current.focus();
        }
        function handleKeyDown(e) {
            // Only handle Escape and Tab keys
            if (e.key === 'Escape') {
                e.preventDefault();
                props.setShowCalendar(false);
            } else if (e.key === 'Tab') {
                const focusableEls = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const focusable = Array.prototype.slice.call(focusableEls);
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                } else if (e.shiftKey && document.activeElement === first) {
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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
            <div
                className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center max-w-md w-full mx-2"
                tabIndex={-1}
                ref={modalRef}
                aria-modal="true"
                role="dialog"
            >
                <Suspense fallback={<div className='text-xl font-bold text-gray-600'>Loading calendar...</div>}>
                    <Calendar
                        onDateSelect={date =>
                        {
                            const formatted = new Date(date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            });
                            props.setSlotAdjustmentDate(formatted);
                            props.setShowCalendar(false);
                        }}
                        onClose={() => props.setShowCalendar(false)}
                    />
                </Suspense>
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={() => {
                            props.setShowCalendar(false);
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold border-2 border-green-700 text-sm"
                    >
                        Confirm
                    </button>
                    <button
                        onClick={() => { props.setShowCalendar(false); }}
                        className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold border-2 border-gray-600 text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
// OLD CALENDAR MODAL
/* 
  {
                showCalendar && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
                        <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center max-w-md w-full mx-4">
                            <Suspense fallback={<div className='text-xl font-bold text-gray-600'>Loading calendar...</div>}>
                                <Calendar
                                    onDateSelect={date =>
                                    {
                                        const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                                        if (showRescheduleModal)
                                        {
                                            setRescheduleDate(formattedDate);
                                            setShowCalendar(false);
                                        } else
                                        {
                                            setSelectedCalendarDate(date);
                                            setShowCalendar(false);
                                        }
                                    }}
                                    onClose={() => setShowCalendar(false)}
                                />
                            </Suspense>
                            <button
                                onClick={() => setShowCalendar(false)}
                                className="mt-4 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold border-2 border-gray-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                )}
 */