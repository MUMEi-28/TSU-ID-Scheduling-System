import React from 'react';
import { getDisplayTimeSlots } from '../../utils/timeUtils';

const CustomDropdown = ({ selectedTime, setSelectedTime }) => {
    const timeOptions = [
        "No Time Chosen",
        ...getDisplayTimeSlots()
    ];

    return (
        <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full sm:w-[250px] ml-0 lg:ml-13 px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-semibold text-lg border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:border-[#AC0000]">
            {timeOptions.map((time) => (
                <option key={time} value={time}>
                    {time}
                </option>
            ))}
        </select>
    );
};

export default CustomDropdown;
