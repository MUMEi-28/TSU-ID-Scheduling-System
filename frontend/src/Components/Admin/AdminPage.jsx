import React, { useState, useEffect } from 'react';
import Calendar from '../Student/ScheduleSelection/Calendar';
import { useLocation } from 'react-router-dom';

const AdminPage = () => {
    const location = useLocation();
    const [showCalendar, setShowCalendar] = useState(false);
    const [showList, setShowList] = useState(false);
    const [currentScheduleDate, setCurrentScheduleDate] = useState("No Date Chosen");
    const [placeHolderDate, setPlaceHolderDate] = useState("No Date Chosen");
    const [selectedTime, setSelectedTime] = useState("8:00-9:00am");

    const HandleChangeDate = () => {
        setShowCalendar(true);
    };

    const HandleShowList = () => {
        setShowList(true);
    };

    const handleDownloadList = () => {
        setShowList(false);
        if (currentScheduleDate === "No Date Chosen") {
            alert("NO DATE SELECTED");
        } else {
            alert(`Downloading list for ${currentScheduleDate}, ${selectedTime}`);
        }
    };

    const HandleDateReplace = () => {
        setShowCalendar(false);

        const Url = window.location.pathname;
        const urlSegments = Url.split('/');
        const dateNumerical = urlSegments[urlSegments.length - 1];
        const dateObject = new Date(dateNumerical);

        const realDate = dateObject.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        setCurrentScheduleDate(realDate);
    };

    useEffect(() => {
        const Url = window.location.pathname;
        const urlSegments = Url.split('/');
        const dateNumerical = urlSegments[urlSegments.length - 1];
        const dateObject = new Date(dateNumerical);

        const realDate = dateObject.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        setPlaceHolderDate(realDate);
    }, [location.pathname]);

    return (
        <div className="w-screen h-screen flex">
            {/* Sidebar */}
            <div className="w-3/12 h-screen relative flex flex-col justify-center items-center gap-5">
                <h1 className="absolute border-2 left-0 top-10 text-2xl px-10 py-1">Admin</h1>

                <h1 className="text-4xl">Scheduled Time</h1>
                
                {/* Dropdown Time Selector */}
                <select
                    className="text-[clamp(1.25rem,3cqw,2rem)] border-4 rounded-lg py-4 px-6 duration-300 hover:bg-pink-200 text-center"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                >
                    <option value="8:00-9:00am">8:00 - 9:00am</option>
                    <option value="9:00-10:00am">9:00 - 10:00am</option>
                    <option value="10:00-11:00am">10:00 - 11:00am</option>
                    <option value="11:00-12:00am">11:00 - 12:00am</option>
                </select>

                {/* Change Date Button */}
                <div className="flex flex-col items-center gap-2 mt-4">
                    <p className="text-xl">Change Date</p>
                    <button
                        onClick={HandleChangeDate}
                        className="w-fit text-center duration-300 border-2 hover:border-amber-400 hover:text-amber-400 px-6 py-2 text-2xl"
                    >
                        {currentScheduleDate}
                    </button>
                </div>

                {/* Generate List Button */}
                <div className="flex flex-col items-center gap-2 mt-4">
                    <button
                        onClick={HandleShowList}
                        className="w-fit text-center duration-300 hover:border-amber-400 hover:text-amber-400 border-2 px-6 py-2 text-2xl"
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
                            <Calendar />
                            <hr />
                            <button
                                onClick={HandleDateReplace}
                                className="w-full p-5 text-2xl bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Change Date to: {placeHolderDate}
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

                {/* Table */}
                <div className="w-10/12 h-8/12 bg-white flex">
                    <div className="h-full w-2/6 border-2 self-end">
                        <div className="w-full h-1/12 border-b-2 text-2xl text-center bg-gray-300">
                            <h1>Name</h1>
                        </div>
                    </div>

                    <div className="h-full w-2/6 border-2 self-end">
                        <div className="w-full h-1/12 border-b-2 text-2xl text-center bg-gray-300">
                            <h1>Student Number</h1>
                        </div>
                    </div>

                    <div className="h-full w-2/6 border-2 self-end">
                        <div className="w-full h-1/12 border-b-2 text-2xl text-center bg-gray-300">
                            <h1>Date/Time</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
