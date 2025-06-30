import React, { useEffect, useRef } from 'react'

export default function StudentDetailModal(props)
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
                props.setDetailModal({ show: false, student: null });
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
                className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                tabIndex={-1}
                ref={modalRef}
                aria-modal="true"
                role="dialog"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Student Details</h2>
                    <button
                        onClick={() => props.setDetailModal({ show: false, student: null })}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div><strong>Name:</strong> {props.detailModal.student.fullname}</div>
                    <div><strong>Student Number:</strong> {props.detailModal.student.student_number}</div>
                    <div><strong>Email:</strong> {props.detailModal.student.email || 'N/A'}</div>
                    <div><strong>ID Reason:</strong> {props.detailModal.student.id_reason || 'N/A'}</div>
                    <div><strong>Schedule Date:</strong> {props.detailModal.student.schedule_date || 'Not scheduled'}</div>
                    <div><strong>Schedule Time:</strong> {props.detailModal.student.schedule_time || 'Not scheduled'}</div>
                    <div><strong>Status:</strong>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${props.detailModal.student.status === 'done' ? 'bg-green-100 text-green-800' :
                            props.detailModal.student.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {props.detailModal.student.status}
                        </span>
                    </div>
                    <div><strong>Privacy Agreed:</strong> {props.detailModal.student.data_privacy_agreed ? 'Yes' : 'No'}</div>
                    <div><strong>Created:</strong> {props.detailModal.student.created_at ? new Date(props.detailModal.student.created_at).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>Updated:</strong> {props.detailModal.student.updated_at ? new Date(props.detailModal.student.updated_at).toLocaleDateString() : 'N/A'}</div>
                </div>

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() =>
                        {
                            props.setDetailModal({ show: false, student: null });
                            props.showEditModal(props.detailModal.student);
                        }}
                        className="bg-[#E1A500] hover:bg-[#C68C10] text-white px-4 py-2 rounded-lg border-2 border-[#C68C10] transition-all duration-200 font-bold"
                    >
                        Edit Student
                    </button>
                    <button
                        onClick={() => props.setDetailModal({ show: false, student: null })}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
