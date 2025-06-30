import React, { useState, useEffect, useRef, Suspense } from 'react'

import { idReasonOptions } from '../../constants/IdReasonOptions';
import { buildApiUrl, API_ENDPOINTS } from '../../../config/api';
import axios from 'axios';
import { displayToCanonical } from '../../../utils/timeUtils';

// Lazy load the Calendar component
const Calendar = React.lazy(() => import('../../Student/ScheduleSelection/Calendar'));

export default function AddStudentModal(props)
{
    const [student, setStudent] = useState(
        {
            fullname: '',
            student_number: '',
            email: '',
            id_reason: '',
            schedule_date: '',
            schedule_time: '',
            status: 'pending',
            data_privacy_agreed: true
        }
    )
    const [error, setError] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);

    // Focus trap and Escape key
    const modalRef = useRef(null);
    const formRef = useRef(null);
    
    // Status options for the dropdown
    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    useEffect(() => {
        function handleKeyDown(e) {
            // Only handle Escape, Tab, and Enter keys
            if (e.key === 'Escape') {
                e.preventDefault();
                props.onClose();
            } else if (e.key === 'Enter') {
                // Only submit on Enter if focused on a button or the last input field
                const focusableEls = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const focusable = Array.prototype.slice.call(focusableEls);
                const currentIndex = Array.from(focusable).indexOf(document.activeElement);
                const isLastInput = currentIndex === focusable.length - 1;
                const isButton = e.target.tagName === 'BUTTON';
                
                if (isButton || isLastInput) {
                    // Allow submission
                    return; // Let the form submit naturally
                } else {
                    // Prevent form submission for other inputs
                    e.preventDefault();
                    e.stopPropagation();
                }
            } else if (e.key === 'Tab') {
                // Focus trap
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

    function handleChange(e)
    {
        const { name, value, type, checked } = e.target;

        setStudent(prev => (
            {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }
        ));

        console.log(student);
    }
    async function handleSubmit(e)
    {
        e.preventDefault();

        if (!student.fullname || !student.student_number || !student.email || !student.id_reason || !student.schedule_date || !student.schedule_time || !student.status)
        {
            setError("All fields are required.");
            return;
        }

        // Convert time from display format to canonical format for backend
        const submissionData = {
            ...student,
            schedule_time: displayToCanonical(student.schedule_time)
        };

        try
        {
            await axios.post(buildApiUrl(API_ENDPOINTS.REGISTER), submissionData, {
                headers: { 'Content-Type': 'application/json' }
            })
            props.onClose();
            props.onSuccess();
        } catch (err)
        {
            setError(err.response?.data?.message || 'Failed to add student.');
        }


        console.log("SUBMMITED WITHOUT ERRORS");
    }
    return (
        <div className='bg-black/50 fixed inset-0 z-[9999] flex items-center justify-center'>
            <div
                className='bg-white rounded-lg p-6 w-full mx-4 max-w-md flex-col shadow-2xl'
                ref={modalRef}
                aria-modal="true"
                role="dialog"
            >
                <h2 className='text-xl font-black mb-4 text-slate-700 text-center border-b'>Add Student</h2>
                <form ref={formRef} action="POST" onSubmit={handleSubmit}>
                    <p className='mb-2'>
                        <label
                            className='block text-md '>Fullname</label>
                        <input
                            value={student.fullname}
                            name='fullname'
                            onChange={handleChange}
                            required
                            className='border p-2 rounded-md w-full'
                            type="text"
                            placeholder='Fullname' />
                    </p>
                    <p className='mb-2'>
                        <label
                            className='block text-md '>Student Number</label>
                        <input
                            value={student.student_number}
                            name='student_number'
                            onChange={handleChange}
                            required
                            className='border p-2 rounded-md w-full'
                            type="text"
                            placeholder='Student Number' />
                    </p>
                    <p className='mb-2'>
                        <label
                            className='block text-md '>Email</label>
                        <input
                            value={student.email}
                            name='email'
                            onChange={handleChange}
                            required
                            className='border p-2 rounded-md w-full'
                            type="email"
                            placeholder='Email' />
                    </p>

                    <p className='mb-2'>
                        <label className="block text-sm font-medium text-gray-700">ID Reason</label>
                        <select name="id_reason" className='border w-full p-2 rounded-md'
                            required
                            value={student.id_reason}
                            onChange={handleChange}>
                            <option value="">Select ID Reason</option>
                            {idReasonOptions.map(options => (
                                <option key={options.value}
                                    value={options.value}>
                                    {options.label}</option>
                            ))}
                        </select>
                    </p>

                    <p className='mb-2'>
                        <label className="block text-sm font-medium text-gray-700">Appointment Date</label>
                        <div className="flex items-center gap-2">
                            <input
                                value={student.schedule_date}
                                readOnly
                                className="border p-2 rounded-md w-full bg-gray-50"
                                placeholder="No Date Chosen"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCalendar(true)}
                                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-bold border-2 border-blue-600 text-sm whitespace-nowrap"
                            >
                                Pick Date
                            </button>
                        </div>
                    </p>

                    <p className='mb-2'>
                        <label className="block text-sm font-medium text-gray-700">Appointment Time</label>
                        <select
                            value={student.schedule_time}
                            onChange={(e) => setStudent(prev => ({ ...prev, schedule_time: e.target.value }))}
                            required
                            className="border p-2 rounded-md w-full"
                        >
                            <option value="">Select Time</option>
                            <option value="8:00am - 9:00am">8:00am - 9:00am</option>
                            <option value="9:00am - 10:00am">9:00am - 10:00am</option>
                            <option value="10:00am - 11:00am">10:00am - 11:00am</option>
                            <option value="11:00am - 12:00pm">11:00am - 12:00pm</option>
                            <option value="1:00pm - 2:00pm">1:00pm - 2:00pm</option>
                            <option value="2:00pm - 3:00pm">2:00pm - 3:00pm</option>
                            <option value="3:00pm - 4:00pm">3:00pm - 4:00pm</option>
                            <option value="4:00pm - 5:00pm">4:00pm - 5:00pm</option>
                        </select>
                    </p>

                    <p className='mb-2'>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select name="status" className='border w-full p-2 rounded-md'
                            required
                            value={student.status}
                            onChange={handleChange}>
                            {statusOptions.map(options => (
                                <option key={options.value}
                                    value={options.value}>
                                    {options.label}</option>
                            ))}
                        </select>
                    </p>

                    {error && <p className='text-red-700 font-semibold'>{error}</p>}
                    <div className='flex items-center justify-center gap-2'>
                        <button
                            className='bg-green-500 px-4 hover:bg-green-600 active:bg-green-400 py-2 text-white rounded-lg'>
                            Add Student
                        </button>

                        <button
                            onClick={props.onClose}
                            className='bg-gray-500 hover:bg-gray-600 active:bg-gray-400 px-4 py-2 text-white rounded-lg'>
                            Cancel
                        </button>
                    </div>

                </form>
            </div>
            
            {/* Calendar Modal */}
            {showCalendar && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
                    <div
                        className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center max-w-md w-full mx-2"
                        tabIndex={-1}
                        aria-modal="true"
                        role="dialog"
                    >
                        <Suspense fallback={<div className='text-xl font-bold text-gray-600'>Loading calendar...</div>}>
                            <Calendar
                                onDateSelect={date => {
                                    const formatted = new Date(date).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    });
                                    setStudent(prev => ({ ...prev, schedule_date: formatted }));
                                    setShowCalendar(false);
                                }}
                                onClose={() => setShowCalendar(false)}
                            />
                        </Suspense>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => setShowCalendar(false)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold border-2 border-green-700 text-sm"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setShowCalendar(false)}
                                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold border-2 border-gray-600 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
