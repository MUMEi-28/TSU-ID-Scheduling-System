import { useState } from 'react';

export default function CustomDropdown({ selectedTime, setSelectedTime })
{
    const [isOpen, setIsOpen] = useState(false);

    const times = [
        '8:00am - 9:00am',
        '9:00am -10:00am',
        '10:00am-11:00am',
        '11:00am-12:00am',
        '1:00pm - 2:00pm',
        '2:00pm - 3:00pm',
        '3:00pm - 4:00pm',
        '4:00pm - 5:00pm',
    ];

    return (
        <div className="relative w-64">

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-[clamp(1rem,2cqw,1.5rem)] rounded-lg py-3 pr-5 pl-5 mt-1 px-3
                duration-100 text-center bg-[#D9D9D9] hover:bg-[#971212] hover:text-white ml-6"
            >
                {selectedTime}
            </button>


            {isOpen && (
                <ul className="absolute w-full bg-[#f7f7f7] border-0 rounded-lg mt-2 z-10 ml-6">
                    {times.map((time) => (
                        <li
                            key={time}
                            onClick={() =>
                            {
                                setSelectedTime(time);
                                setIsOpen(false);
                            }}
                            className="px-5 py-3 hover:bg-[#971212] hover:text-white cursor-pointer"
                        >
                            {time}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
