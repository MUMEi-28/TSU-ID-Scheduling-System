import React from 'react'

export default function AdminPagination({
    showAllStudents,
    totalPagesToShow,
    startIndex,
    perPage,
    filteredStudents,
    page,
    setPage,
    startPage,
    endPage
})
{
    return (
        < div >
            {/* Hide pagination if showAllStudents is true */}
            {!showAllStudents && totalPagesToShow > 1 && (
                <div className="px-4 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {startIndex + 1} to {Math.min(startIndex + perPage, filteredStudents.length)} of {filteredStudents.length} results
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>

                            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`px-3 py-1 border rounded-md text-sm transition-all duration-200 ${pageNum === page
                                        ? 'bg-[#E1A500] text-white border-[#C68C10]'
                                        : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPagesToShow}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )
            }</div >
    )
}
