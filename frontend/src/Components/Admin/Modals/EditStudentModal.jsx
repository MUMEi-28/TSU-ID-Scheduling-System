import React, { useEffect, useRef, useState } from 'react'

export default function EditStudentModal(props)
{
    // Focus trap and Escape key
    const modalRef = useRef(null);
    const formRef = useRef(null);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Normalized id_reason options (should match AdminPage)
    const idReasonOptions = [
        { value: 're_id', label: 'Re-ID' },
        { value: 'lost_id', label: 'Lost ID' },
        { value: 'masters_doctors_law', label: 'Masters/Doctors/School of Law' }
    ];

    // Validation functions (reuse from AddStudentModal)
    const validateStudentNumber = (studentNumber) => {
        if (!studentNumber) return '';
        if (!/^\d{10}$/.test(studentNumber)) {
            return 'Student number must be exactly 10 digits';
        }
        return '';
    };
    const validateEmail = (email) => {
        if (!email) return '';
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return '';
    };
    
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                props.setEditModal({ show: false, student: null, data: {} });
            } else if (e.key === 'Enter') {
                const focusableEls = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const focusable = Array.prototype.slice.call(focusableEls);
                const currentIndex = Array.from(focusable).indexOf(document.activeElement);
                const isLastInput = currentIndex === focusable.length - 1;
                const isButton = e.target.tagName === 'BUTTON';
                if (isButton || isLastInput) {
                    return;
                } else {
                    e.preventDefault();
                    e.stopPropagation();
                }
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
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [props]);
    
    // Field-level validation on change
    const handleChange = (e) => {
        const { name, value } = e.target;
        let normalizedValue = value;
        if (name === 'id_reason') {
            // Normalize id_reason to match backend
            normalizedValue = value;
        }
        props.handleEditChange({ target: { name, value: normalizedValue } });
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
        setError('');
    };

    // Validate all fields before submit
    const validateAll = () => {
        const data = props.editModal.data;
        const errors = {};
        if (!data.fullname) errors.fullname = 'Full name is required';
        if (!data.student_number) errors.student_number = 'Student number is required';
        else if (validateStudentNumber(data.student_number)) errors.student_number = validateStudentNumber(data.student_number);
        if (!data.email) errors.email = 'Email is required';
        else if (validateEmail(data.email)) errors.email = validateEmail(data.email);
        if (!data.id_reason) errors.id_reason = 'ID reason is required';
        return errors;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const errors = validateAll();
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;
        setIsSaving(true);
        try {
            // Normalize id_reason before save and always include id
            const normalizedData = {
                ...props.editModal.data,
                id_reason: props.editModal.data.id_reason,
                id: props.editModal.student.id,
            };
            // Await the result and capture backend error
            const result = await props.handleEditSave(normalizedData, setError);
            console.log('EditStudentModal backend result:', result); // DEBUG LOG
            // Only close modal if backend returns status: 1 (defensive check)
            if (result && typeof result.status !== 'undefined' && result.status === 1) {
                props.setEditModal({ show: false, student: null, data: {} });
            } else {
                // Show error and keep modal open
                // If backend error is about student number or email, show below the field
                const msg = result && result.message ? result.message : 'Failed to update student. Please try again.';
                if (msg.toLowerCase().includes('student number')) {
                    setFieldErrors(prev => ({ ...prev, student_number: msg }));
                    setError('');
                } else if (msg.toLowerCase().includes('email')) {
                    setFieldErrors(prev => ({ ...prev, email: msg }));
                    setError('');
                } else {
                    setError(msg);
                }
            }
        } catch (err) {
            setError('Failed to update student. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div
                className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                ref={modalRef}
                aria-modal="true"
                role="dialog"
                aria-labelledby="edit-student-modal-title"
                aria-describedby={error ? "edit-student-modal-error" : undefined}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 id="edit-student-modal-title" className="text-xl font-bold">Edit Student</h2>
                    <button
                        onClick={() => props.setEditModal({ show: false, student: null, data: {} })}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                        disabled={isSaving}
                    >
                        ✕
                    </button>
                </div>
                {error && <div id="edit-student-modal-error" role="alert" className="mb-4 text-red-600 font-semibold text-center">{error}</div>}
                <form ref={formRef} onSubmit={handleFormSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="fullname"
                                value={props.editModal.data.fullname}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded-lg ${fieldErrors.fullname ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={isSaving}
                            />
                            {fieldErrors.fullname && <p className="text-red-500 text-sm mt-1">{fieldErrors.fullname}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student Number</label>
                            <input
                                type="text"
                                name="student_number"
                                value={props.editModal.data.student_number}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded-lg ${fieldErrors.student_number ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={isSaving}
                            />
                            {fieldErrors.student_number && <p className="text-red-500 text-sm mt-1">{fieldErrors.student_number}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="text"
                                name="email"
                                value={props.editModal.data.email}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded-lg ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={isSaving}
                            />
                            {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Reason</label>
                            <select
                                name="id_reason"
                                value={props.editModal.data.id_reason}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded-lg ${fieldErrors.id_reason ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={isSaving}
                            >
                                <option value="">Select ID Reason</option>
                                {idReasonOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.id_reason && <p className="text-red-500 text-sm mt-1">{fieldErrors.id_reason}</p>}
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-6">
                        <button
                            type="button"
                            onClick={() => props.setEditModal({ show: false, student: null, data: {} })}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-[#E1A500] hover:bg-[#C68C10] text-white px-4 py-2 rounded-lg border-2 border-[#C68C10] transition-all duration-200 font-bold flex items-center justify-center min-w-[120px]"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <span className="loader mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : null}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
