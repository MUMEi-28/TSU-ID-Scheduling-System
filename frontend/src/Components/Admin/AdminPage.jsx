import React, { useEffect, useState } from 'react';
import Calendar from '../Student/ScheduleSelection/Calendar';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import CustomDropdown from './CustomDropdown';

const AdminPage = () =>
{
    const location = useLocation();
    const [showCalendar, setShowCalendar] = useState(false);
    const [showList, setShowList] = useState(false);
    const [currentScheduleDate, setCurrentScheduleDate] = useState("No Date Chosen");
    const [placeHolderDate, setPlaceHolderDate] = useState("No Date Chosen");
    const [selectedTime, setSelectedTime] = useState("8:00 - 9:00am");
    const [students, setStudents] = useState([]); // 📌 This will hold the fetched data
    const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

    // Fetch students from backend on mount
    useEffect(() =>
    {
        axios.get('http://localhost/Projects/TSU-ID-Scheduling-System/backend/get_students.php')
            .then(response =>
            {
                setStudents(response.data);
            })
            .catch(error =>
            {
                console.error('Failed to fetch students:', error);
            });
    }, []);

    const HandleChangeDate = () => setShowCalendar(true);
    const HandleShowList = () => setShowList(true);

    const handleDownloadList = () =>
    {
        setShowList(false);
        if (currentScheduleDate === "No Date Chosen")
        {
            alert("NO DATE SELECTED");
        } else
        {
            alert(`Downloading list for ${currentScheduleDate}, ${selectedTime}`);
        }
    };

    const HandleDateReplace = () =>
    {
        setShowCalendar(false);
        if (!selectedCalendarDate) return;
        const realDate = new Date(selectedCalendarDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        setCurrentScheduleDate(realDate);
    };

    useEffect(() =>
    {
        const urlSegments = location.pathname.split('/');
        const dateNumerical = urlSegments[urlSegments.length - 1];
        const dateObject = new Date(dateNumerical);
        const realDate = dateObject.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        setPlaceHolderDate(realDate);
    }, [location.pathname]);

    // Filter students based on selected date and time
    const filteredStudents = students.filter(student =>
        student.schedule_date === currentScheduleDate && student.schedule_time === selectedTime
    );

    return (
        <div className="w-screen h-screen flex">
            {/* Sidebar */}
            <div className="w-3/12 h-screen relative flex flex-col justify-center items-center gap-5">
                <h1 className="absolute border-2 left-0 top-10 text-2xl px-14 py-1 bg-[#971212] text-white">Admin</h1>
                <h1 className="text-3xl ml-12 font-bold">Scheduled Time</h1>
                <CustomDropdown selectedTime={selectedTime} setSelectedTime={setSelectedTime} />

                {/* Change Date Button */}
                <div className="flex flex-col items-center gap-2 mt-45 ml-12">
                    <p className="text-xl">Change Date</p>
                    <button
                        onClick={HandleChangeDate}
                        className="w-fit text-center duration-150 border-2 text-white bg-[#AC0000] hover:border-[#AC0000] hover:text-[#AC0000] hover:bg-[#f5f5f5] 
                        px-25 py-2 text-lg rounded-md"
                    >
                        {currentScheduleDate}
                    </button>
                </div>

                {/* Generate List Button */}
                <div className="flex flex-col items-center gap-2 mt-0 ml-12">
                    <button
                        onClick={HandleShowList}
                        className="w-fit text-center duration-150 text-white rounded-md hover:border-2 border-2 hover:text-bold
                         hover:border-[#AC0000] hover:text-[#AC0000] hover:bg-[#f5f5f5] bg-[#AC0000] px-25 py-2 text-lg"
                    >
                        Generate List
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-9/12 h-screen flex justify-center items-center relative">

                {/* Calendar Popup */}
                {showCalendar && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-20">
                        <div className="bg-white p-6 opacity-100 rounded-lg shadow-xl h-fit flex flex-col justify-center items-center text-2xl">
                            <Calendar onDateSelect={setSelectedCalendarDate} />
                            <hr />
                            <button
                                onClick={HandleDateReplace}
                                className="w-full p-5 text-2xl bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Change Date to: {selectedCalendarDate ? new Date(selectedCalendarDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No Date Selected'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Generate List Popup */}
                {showList && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-20">
                        <div className="bg-white p-6 opacity-100 shadow-xl w-3/12 h-5/12 flex flex-col justify-evenly items-center border-4">
                            <h1 className="text-5xl mb-1">Generate List</h1>
                            <hr className="w-full" />
                            <h1 className="text-black text-4xl">Date</h1>
                            <h1 className="text-black text-4xl">{currentScheduleDate}</h1>
                            <h1 className="text-black text-3xl">Time</h1>
                            <h1 className="text-black text-3xl">{selectedTime}</h1>
                            <button
                                onClick={handleDownloadList}
                                className="w-fit p-5 text-2xl border-2 text-black rounded-md hover:bg-gray-600"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                )}

                {/* 📌 Table */}
                <div className="w-10/12 h-[80%] overflow-y-auto bg-white rounded-lg shadow-lg p-5">
                    <table className="w-full text-center border border-gray-300">
                        <thead className="bg-[#971212] text-white text-lg">
                            <tr>
                                <th className="py-3 border">Name</th>
                                <th className="py-3 border">Student Number</th>
                                <th className="py-3 border">Date</th>
                                <th className="py-3 border">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(currentScheduleDate !== "No Date Chosen" && filteredStudents.length > 0) ? (
                                filteredStudents.map((student, index) => (
                                    <tr key={index} className="hover:bg-gray-100">
                                        <td className="py-2 border">{student.fullname}</td>
                                        <td className="py-2 border">{student.student_number}</td>
                                        <td className="py-2 border">{student.schedule_date}</td>
                                        <td className="py-2 border">{student.schedule_time}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-4 text-gray-400">
                                        No data found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
