import React, { useState, useEffect } from 'react';
import Calendar from '../Student/ScheduleSelection/Calendar';
import { useLocation } from 'react-router-dom';
import CustomDropdown from './CustomDropdown';

const AdminPage = () => {
    const location = useLocation();
    const [showCalendar, setShowCalendar] = useState(false);
    const [showList, setShowList] = useState(false);
    const [currentScheduleDate, setCurrentScheduleDate] = useState("No Date Chosen");
    const [placeHolderDate, setPlaceHolderDate] = useState("No Date Chosen");
    const [selectedTime, setSelectedTime] = useState("8:00 - 9:00am");

    const HandleChangeDate = () => setShowCalendar(true);
    const HandleShowList = () => setShowList(true);

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
        <div className="w-screen h-screen flex flex-col sm:flex-row">
            
            <div className="w-full sm:w-3/12 min-w-[250px] h-auto sm:h-screen relative flex flex-col justify-center items-center gap-5 p-5 sm:p-0">
                <h1 className="border-2 sm:absolute left-0 sm:left-0 top-0 sm:top-10 text-2xl px-14 py-1 bg-[#971212] text-white">
                    Admin
                </h1>

                <h1 className="text-4xl ml-12 font-bold text-[#232323] sm:mt-0 mt-20 text-center sm:text-left">
                    <u>Scheduled Time</u>
                </h1>

                <CustomDropdown selectedTime={selectedTime} setSelectedTime={setSelectedTime} />

                <div className="flex flex-col items-center gap-2 mt-12 sm:mt-45 ml-12">
                    <p className="text-xl">Change Date</p>
                    <button
                        onClick={HandleChangeDate}
                        className="w-fit text-center duration-150 border-2 text-white bg-[#AC0000] hover:border-[#AC0000] hover:text-[#AC0000] hover:bg-[#f5f5f5] px-25 py-2 text-lg rounded-md"
                    >
                        {currentScheduleDate}
                    </button>
                </div>

                <div className="flex flex-col items-center gap-2 mt-5 ml-12">
                    <button
                        onClick={HandleShowList}
                        className="w-fit text-center duration-150 text-white rounded-md hover:border-2 border-2 hover:text-bold hover:border-[#AC0000] hover:text-[#AC0000] hover:bg-[#f5f5f5] bg-[#AC0000] px-25 py-2 text-lg"
                    >
                        Generate List
                    </button>
                </div>
            </div>

           
            <div className="w-full sm:w-9/12 h-auto sm:h-screen flex justify-center items-start sm:items-center relative p-4">
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[600px] w-full h-auto sm:h-8/12 bg-white">
                        
                        <div className="flex">
                            <div className="w-1/3 border border-[#c9c9c9] bg-[#f3f3f3]">
                                <div className="w-full h-12 text-center bg-[#971212] flex items-center justify-center">
                                    <h1 className="text-white text-xl">Name</h1>
                                </div>
                            </div>
                            <div className="w-1/3 border border-[#c9c9c9] bg-[#f3f3f3]">
                                <div className="w-full h-12 text-center bg-[#971212] flex items-center justify-center">
                                    <h1 className="text-white text-xl">Student Number</h1>
                                </div>
                            </div>
                            <div className="w-1/3 border border-[#c9c9c9] bg-[#f3f3f3]">
                                <div className="w-full h-12 text-center bg-[#971212] flex items-center justify-center">
                                    <h1 className="text-white text-xl">Date/Time</h1>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex">
                            <div className="w-1/3 border border-[#c9c9c9] p-3 text-center text-gray-400">No Data</div>
                            <div className="w-1/3 border border-[#c9c9c9] p-3 text-center text-gray-400">No Data</div>
                            <div className="w-1/3 border border-[#c9c9c9] p-3 text-center text-gray-400">No Data</div>
                        </div>
                    </div>
                </div>
            </div>

            
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

           
            {showList && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-20">
                    <div className="bg-white p-6 opacity-100 shadow-xl w-11/12 sm:w-3/12 h-fit flex flex-col justify-evenly items-center border-4">
                        <h1 className="text-4xl sm:text-5xl mb-1 text-center">Generate List</h1>
                        <hr className="w-full" />
                        <h1 className="text-black text-2xl sm:text-4xl">Date</h1>
                        <h1 className="text-black text-2xl sm:text-4xl">{currentScheduleDate}</h1>
                        <h1 className="text-black text-xl sm:text-3xl">Time</h1>
                        <h1 className="text-black text-xl sm:text-3xl">{selectedTime}</h1>
                        <button
                            onClick={handleDownloadList}
                            className="w-fit p-5 text-xl sm:text-2xl border-2 text-black rounded-md hover:bg-gray-600"
                        >
                            Download
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
