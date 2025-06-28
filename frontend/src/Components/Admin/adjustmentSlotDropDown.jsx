import React from 'react';

const AdjustmentCustomDropdown = ({ selectedTime, setSelectedTime, getTime, date }) => {
    const timeOptions = [
        "No Time Chosen",
        "8:00am - 9:00am",
        "9:00am -10:00am", 
        "10:00am-11:00am",
        "11:00am-12:00pm",
        "1:00pm - 2:00pm",
        "2:00pm - 3:00pm",
        "3:00pm - 4:00pm",
        "4:00pm - 5:00pm"
    ];

    const handleChange = (e) => {
        console.log(e.target.value)
        setSelectedTime(e.target.value);
        if (e.target.value !== "No Time Chosen" && date) {
            getTime(date, e.target.value);
        }
    };

    return (
        <select
            value={selectedTime || "No Time Chosen"}
            onChange={handleChange}
            className="w-full text-center bg-gray-200 text-gray-700 rounded-md font-semibold text-lg border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:border-[#AC0000]">
            {timeOptions.map((time) => (
                <option key={time} value={time}>
                    {time}
                </option>
            ))}
        </select>
    );
};

export default AdjustmentCustomDropdown;
