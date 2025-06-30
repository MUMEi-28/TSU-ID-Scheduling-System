import React, { useEffect, useRef } from 'react'

export default function EditStudentModal(props)
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
                props.setEditModal({ show: false, student: null, data: {} });
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
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Student</h2>
                    <button
                        onClick={() => props.setEditModal({ show: false, student: null, data: {} })}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); props.handleEditSave(); }}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="fullname"
                                value={props.editModal.data.fullname}
                                onChange={props.handleEditChange}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student Number</label>
                            <input
                                type="text"
                                name="student_number"
                                value={props.editModal.data.student_number}
                                onChange={props.handleEditChange}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={props.editModal.data.email}
                                onChange={props.handleEditChange}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Reason</label>
                            <select
                                name="id_reason"
                                value={props.editModal.data.id_reason}
                                onChange={props.handleEditChange}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            >
                                {props.idReasonOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-6">
                        <button
                            type="button"
                            onClick={() => props.setEditModal({ show: false, student: null, data: {} })}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-[#E1A500] hover:bg-[#C68C10] text-white px-4 py-2 rounded-lg border-2 border-[#C68C10] transition-all duration-200 font-bold"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
