import React from 'react';
import { getDisplayTimeSlots } from '../../utils/timeUtils';

const AdjustmentCustomDropdown = ({ selectedTime, setSelectedTime, getTime, date }) => {
    const timeOptions = [
        "No Time Chosen",
        ...getDisplayTimeSlots()
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
