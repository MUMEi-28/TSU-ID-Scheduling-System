import React from 'react';

const CustomDropdown = ({ selectedTime, setSelectedTime }) => {
    const timeOptions = [
        "No Time Chosen",
        "8:00am - 9:00am",
        "9:00am - 10:00am", 
        "10:00am - 11:00am",
        "11:00am - 12:00pm",
        "1:00pm - 2:00pm",
        "2:00pm - 3:00pm",
        "3:00pm - 4:00pm",
        "4:00pm - 5:00pm"
    ];

    return (
        <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold text-lg border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:border-[#AC0000]"
        >
            {timeOptions.map((time) => (
                <option key={time} value={time}>
                    {time}
                </option>
            ))}
        </select>
    );
};

export default CustomDropdown;
