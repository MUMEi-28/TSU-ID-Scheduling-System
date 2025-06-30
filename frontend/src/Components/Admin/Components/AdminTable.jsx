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
    handleReschedule,
    sortBy,
    sortDirection,
    handleSort,
    selectedStudentIds = [],
    handleSelectStudent = () => { },
    handleSelectAll = () => { },
    studentsToShow = []
})
{
    // Keyboard handler for table rows
    const handleRowKeyDown = (e, student) =>
    {
        if (e.key === 'Enter' || e.key === ' ')
        {
            e.preventDefault();
            showStudentDetails(student);
        }
        // Blur row on Escape
        if (e.key === 'Escape')
        {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };
    return (
        <div>
            {/* Table logic: show all students if showAllStudents is true, else paginatedStudents */}
            {(() =>
            {
                const studentsToShowLocal = studentsToShow.length > 0 ? studentsToShow : (showAllStudents
                    ? allStudentsList.slice((page - 1) * perPage, (page - 1) * perPage + perPage)
                    : paginatedStudents);
                const getSortIcon = (column) =>
                {
                    if (sortBy !== column) return '';
                    return sortDirection === 'asc' ? '▲' : '▼';
                };
                const allSelected = studentsToShowLocal.length > 0 && studentsToShowLocal.every(s => selectedStudentIds.includes(s.id));
                return (
                    <div className="bg-white border border-gray-200 overflow-x-auto">
                        <table className="table-auto w-full" role="table" aria-label="Student List">
                            <thead className="bg-gray-100 border-b border-gray-300">
                                <tr>
                                    <th scope="col" className="py-2 px-2 text-left font-semibold text-gray-700 border-r">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={() => handleSelectAll(studentsToShowLocal)}
                                            aria-label="Select all students on this page"
                                        />
                                    </th>
                                    <th scope="col" className="py-2 px-2 text-left font-semibold text-gray-700 border-r cursor-pointer select-none" onClick={() => handleSort('fullname')} tabIndex={0} aria-sort={sortBy === 'fullname' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} aria-label="Sort by Name" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { handleSort('fullname'); } }}>
                                        Name <span className="ml-1">{getSortIcon('fullname')}</span>
                                    </th>
                                    <th scope="col" className="py-2 px-2 text-left font-semibold text-gray-700 border-r cursor-pointer select-none" onClick={() => handleSort('student_number')} tabIndex={0} aria-sort={sortBy === 'student_number' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} aria-label="Sort by Student Number" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { handleSort('student_number'); } }}>
                                        Student Number <span className="ml-1">{getSortIcon('student_number')}</span>
                                    </th>
                                    <th scope="col" className="py-2 px-2 text-left font-semibold text-gray-700 border-r cursor-pointer select-none" onClick={() => handleSort('schedule_date')} tabIndex={0} aria-sort={sortBy === 'schedule_date' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} aria-label="Sort by Schedule Date" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { handleSort('schedule_date'); } }}>
                                        Schedule Date <span className="ml-1">{getSortIcon('schedule_date')}</span>
                                    </th>
                                    <th scope="col" className="py-2 px-2 text-left font-semibold text-gray-700 border-r cursor-pointer select-none" onClick={() => handleSort('schedule_time')} tabIndex={0} aria-sort={sortBy === 'schedule_time' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} aria-label="Sort by Schedule Time" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { handleSort('schedule_time'); } }}>
                                        Schedule Time <span className="ml-1">{getSortIcon('schedule_time')}</span>
                                    </th>
                                    <th scope="col" className="py-2 px-2 text-left font-semibold text-gray-700 border-r cursor-pointer select-none" onClick={() => handleSort('status')} tabIndex={0} aria-sort={sortBy === 'status' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} aria-label="Sort by Status" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { handleSort('status'); } }}>
                                        Status <span className="ml-1">{getSortIcon('status')}</span>
                                    </th>
                                    <th scope="col" className="py-2 px-2 text-left font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentsToShowLocal.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="border-b hover:bg-gray-50 cursor-pointer focus:bg-blue-100"
                                        onClick={() => showStudentDetails(student)}
                                        tabIndex={0}
                                        aria-label={`View details for ${student.fullname}`}
                                        onKeyDown={e => handleRowKeyDown(e, student)}
                                    >
                                        <td className="py-2 px-2 border-r" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedStudentIds.includes(student.id)}
                                                onChange={() => handleSelectStudent(student.id)}
                                                aria-label={`Select student ${student.fullname}`}
                                            />
                                        </td>
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
                                                    className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow-sm text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                    title="Edit"
                                                    aria-label={`Edit ${student.fullname}`}
                                                >
                                                    <span className="mr-1">✏️</span> Edit
                                                </button>
                                                <button
                                                    onClick={(e) =>
                                                    {
                                                        e.stopPropagation();
                                                        handleDelete(student.id);
                                                    }}
                                                    className="flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                                                    title="Delete"
                                                    aria-label={`Delete ${student.fullname}`}
                                                >
                                                    <span className="mr-1">🗑️</span> Delete
                                                </button>
                                                <button
                                                    onClick={(e) =>
                                                    {
                                                        e.stopPropagation();
                                                        handleToggleStatus(student);
                                                    }}
                                                    className={`flex items-center px-3 py-1 rounded shadow-sm text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 ${student.status === 'done'
                                                        ? 'bg-gray-400 hover:bg-gray-500 text-white focus:ring-gray-400'
                                                        : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400'
                                                        }`}
                                                    title={student.status === 'done' ? 'Mark Pending' : 'Mark Done'}
                                                    aria-label={student.status === 'done' ? `Mark ${student.fullname} as pending` : `Mark ${student.fullname} as done`}
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
                                                        className="flex items-center bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded shadow-sm text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-700"
                                                        title="Mark Cancelled"
                                                        aria-label={`Mark ${student.fullname} as cancelled`}
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
                                                        className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow-sm text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        title="Reschedule"
                                                        aria-label={`Reschedule ${student.fullname}`}
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
