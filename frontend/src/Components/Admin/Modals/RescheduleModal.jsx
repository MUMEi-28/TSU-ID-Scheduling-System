import React, { useEffect, useRef } from 'react'

export default function RescheduleModal(props)
{
    // Focus trap and Escape key
    const modalRef = useRef(null);
    useEffect(() => {
        if (modalRef.current) {
            modalRef.current.focus();
        }
        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                props.handleRescheduleCancel();
            }
            if (e.key === 'Tab') {
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
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [props]);
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div
                className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                tabIndex={-1}
                ref={modalRef}
                aria-modal="true"
                role="dialog"
            >
                <h2 className="text-xl font-bold mb-4">Reschedule Student</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="flex items-center gap-2">
                        <span className="p-2 border border-gray-300 rounded-lg bg-gray-50 min-w-[140px]">
                            {props.rescheduleDate ? props.rescheduleDate : 'No Date Chosen'}
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
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <select
                        value={props.rescheduleTime}
                        onChange={e => props.setRescheduleTime(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                        <option value="8:00am - 9:00am">8:00am - 9:00am</option>
                        <option value="9:00am -10:00am">9:00am -10:00am</option>
                        <option value="10:00am-11:00am">10:00am-11:00am</option>
                        <option value="11:00am-12:00pm">11:00am-12:00pm</option>
                        <option value="1:00pm - 2:00pm">1:00pm - 2:00pm</option>
                        <option value="2:00pm - 3:00pm">2:00pm - 3:00pm</option>
                        <option value="3:00pm - 4:00pm">3:00pm - 4:00pm</option>
                        <option value="4:00pm - 5:00pm">4:00pm - 5:00pm</option>
                    </select>
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
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}
