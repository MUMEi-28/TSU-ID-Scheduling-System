import React from 'react'
import { getDisplayTimeSlots } from "../../../utils/timeUtils";

export default function AdminFilters(props)
{
    return (
        <div>
            {/* Move the Show All Students button above the filters */}
            <div className="flex flex-col sm:flex-row justify-end mb-4">
                <button
                    onClick={props.handleOpenSlotAdjustmentPanel}
                    className="bg-blue-300 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold border-2 border-blue-600 transition-all duration-150 mb-2 sm:mb-0 sm:mr-2">

                    Adjust Slots
                </button>
                <button
                    onClick={props.handleShowAllStudents}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold border-2 border-blue-700 transition-all duration-150"
                >
                    Show All Students
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name, student number, or email..."
                            value={props.search}
                            onChange={(e) => { props.setSearch(e.target.value); props.setShowAllStudents(false); }}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                        <select
                            value={props.filterStatus}
                            onChange={(e) => { props.setFilterStatus(e.target.value); props.setShowAllStudents(false); }}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="done">Done</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                        <select
                            value={props.currentScheduleMonth}
                            onChange={e => { props.setCurrentScheduleMonth(e.target.value); props.setShowAllStudents(false); props.setCurrentScheduleDay('all'); }}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">All Months</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{new Date(0, i).toLocaleString('en-US', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                        <select
                            value={props.currentScheduleDay}
                            onChange={e => { props.setCurrentScheduleDay(e.target.value); props.setShowAllStudents(false); }}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">All Days</option>
                            {props.currentScheduleMonth !== 'all' && props.currentScheduleYear !== 'all' && (() =>
                            {
                                const daysInMonth = new Date(Number(props.currentScheduleYear), Number(props.currentScheduleMonth) + 1, 0).getDate();
                                return Array.from({ length: daysInMonth }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ));
                            })()}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <select
                            value={props.currentScheduleYear}
                            onChange={e => { props.setCurrentScheduleYear(e.target.value); props.setShowAllStudents(false); props.setCurrentScheduleDay('all'); }}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">All Years</option>
                            {Array.from({ length: 5 }, (_, i) =>
                            {
                                const year = new Date().getFullYear() - 2 + i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                        <select
                            value={props.currentScheduleTime}
                            onChange={e => { props.setCurrentScheduleTime(e.target.value); props.setShowAllStudents(false); }}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">All Times</option>
                            {getDisplayTimeSlots().map(time => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}
