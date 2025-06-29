import React from 'react'

export default function AdminTable({
    showAllStudents,
    allStudentsList,
    paginatedStudents,
    page,
    perPage,
    showStudentDetails,
    showEditModal,
    handleDelete,
    handleToggleStatus,
    handleMarkCancelled,
    handleReschedule
})
{
    return (
        <div>
            {/* Table logic: show all students if showAllStudents is true, else paginatedStudents */}
            {(() =>
            {
                const studentsToShow = showAllStudents
                    ? allStudentsList.slice((page - 1) * perPage, (page - 1) * perPage + perPage)
                    : paginatedStudents;
                return (
                    <div className="bg-white border border-gray-200 overflow-x-auto">
                        <table className="table-auto w-full">
                            <thead className="bg-gray-100 border-b border-gray-300">
                                <tr>
                                    <th className="py-2 px-2 text-left font-semibold text-gray-700 border-r">Name</th>
                                    <th className="py-2 px-2 text-left font-semibold text-gray-700 border-r">Student Number</th>
                                    <th className="py-2 px-2 text-left font-semibold text-gray-700 border-r">Schedule Date</th>
                                    <th className="py-2 px-2 text-left font-semibold text-gray-700 border-r">Schedule Time</th>
                                    <th className="py-2 px-2 text-left font-semibold text-gray-700 border-r">Status</th>
                                    <th className="py-2 px-2 text-left font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentsToShow.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="border-b hover:bg-gray-50 cursor-pointer"
                                        onClick={() => showStudentDetails(student)}
                                    >
                                        <td className="py-2 px-2 border-r">{student.fullname}</td>
                                        <td className="py-2 px-2 border-r">{student.student_number}</td>
                                        <td className="py-2 px-2 border-r">{student.schedule_date || 'Not scheduled'}</td>
                                        <td className="py-2 px-2 border-r">{student.schedule_time || 'Not scheduled'}</td>
                                        <td className="py-2 px-2 border-r">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${student.status === 'done' ? 'bg-green-100 text-green-800' :
                                                student.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-2">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={(e) =>
                                                    {
                                                        e.stopPropagation();
                                                        showEditModal(student);
                                                    }}
                                                    className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow-sm text-sm font-medium transition-all duration-150"
                                                    title="Edit"
                                                >
                                                    <span className="mr-1">✏️</span> Edit
                                                </button>
                                                <button
                                                    onClick={(e) =>
                                                    {
                                                        e.stopPropagation();
                                                        handleDelete(student.id);
                                                    }}
                                                    className="flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm text-sm font-medium transition-all duration-150"
                                                    title="Delete"
                                                >
                                                    <span className="mr-1">🗑️</span> Delete
                                                </button>
                                                <button
                                                    onClick={(e) =>
                                                    {
                                                        e.stopPropagation();
                                                        handleToggleStatus(student);
                                                    }}
                                                    className={`flex items-center px-3 py-1 rounded shadow-sm text-sm font-medium transition-all duration-150 ${student.status === 'done'
                                                        ? 'bg-gray-400 hover:bg-gray-500 text-white'
                                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                                        }`}
                                                    title={student.status === 'done' ? 'Mark Pending' : 'Mark Done'}
                                                >
                                                    <span className="mr-1">{student.status === 'done' ? '⏳' : '✅'}</span> {student.status === 'done' ? 'Pending' : 'Done'}
                                                </button>
                                                {student.status !== 'cancelled' && (
                                                    <button
                                                        onClick={(e) =>
                                                        {
                                                            e.stopPropagation();
                                                            handleMarkCancelled(student);
                                                        }}
                                                        className="flex items-center bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded shadow-sm text-sm font-medium transition-all duration-150"
                                                        title="Mark Cancelled"
                                                    >
                                                        <span className="mr-1">❌</span> Cancel
                                                    </button>
                                                )}
                                                {student.status === 'cancelled' && (
                                                    <button
                                                        onClick={(e) =>
                                                        {
                                                            e.stopPropagation();
                                                            handleReschedule(student);
                                                        }}
                                                        className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow-sm text-sm font-medium transition-all duration-150"
                                                        title="Reschedule"
                                                    >
                                                        <span className="mr-1">📅</span> Resched
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            })()}
        </div>
    )
}
