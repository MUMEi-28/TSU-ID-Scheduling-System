import React, { useEffect, useRef } from 'react';
import AdjustmentCustomDropdown from '../adjustmentSlotDropDown'; // Adjust import path as needed

export default function SlotAdjustmentPanel(props)
{
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
                props.handleCloseSlotAdjustmentPanel();
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div
                className="bg-white rounded-lg p-10 max-w-md w-full mx-4 relative flex-col"
                tabIndex={-1}
                ref={modalRef}
                aria-modal="true"
                role="dialog"
            >
                <h2 className="text-xl font-bold mb-4">Adjust Slots</h2>
                <div className="mb-4 absolute top-4 right-4">
                    <button
                        onClick={props.handleCloseSlotAdjustmentPanel}
                        className="block text-xl rounded font-medium text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                <button
                    className='w-full border rounded py-1 font-medium bg-gray-200 border-gray-300 text-gray-700'
                    onClick={() => props.setShowCalendar(true)}
                >
                    Choose Date
                </button>
                <div className='my-2 w-full text-center mt-2'>
                    Date: <b className='text-lg text-center'>{props.slotAdjustmentDate}</b>
                </div>
                <AdjustmentCustomDropdown
                    selectedTime={props.selectedTimeforAdjustment}
                    setSelectedTime={props.setSelectedTimeForAdjustment}
                    getTime={props.fetchMaxCapacity}
                    date={props.slotAdjustmentDate}
                />
                <div className='w-full text-center mt-2'>
                    Time: <b className='text-lg text-center'>{props.selectedTimeforAdjustment}</b>
                </div>
                <div className='mt-4 text-center'>Current Maximum Slots:</div>
                <div className='flex w-full justify-between md:justify-evenly mt-4'>
                    <button
                        className='text-4xl border-2 border-gray-300 rounded-full p-1 pb-3'
                        onClick={() => props.handleSlotAdjustment('decrease')}
                    >
                        -
                    </button>
                    <div className='text-3xl font-bold text-gray-700'>
                        {props.currentMaxCapacity !== null ? props.currentMaxCapacity : 'Loading...'}
                    </div>
                    <button
                        className='text-2xl border-2 border-gray-300 rounded-full p-1 pb-3'
                        onClick={() => props.handleSlotAdjustment('increase')}
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
}