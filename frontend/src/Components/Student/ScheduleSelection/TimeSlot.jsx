import React from 'react'
import { Link } from 'react-router-dom';

export default function TimeSlot({ time, indicator, availableSlots })
{
    let maxSlot = 12;
    // Determine color based on availability
    let circleColor = 'bg-red-500'; // Default red for low availability
    if (availableSlots < 6)
    {
        circleColor = 'bg-green-500'; // Green for high availability
    } else if (availableSlots > 9)
    {
        circleColor = 'bg-yellow-500'; // Yellow for medium availability
    }

    return (
        <div className='flex flex-col w-full'>
            {/* Time header */}

            <Link to='/receipt'>
                <div className='bg-gray-200 shadow-lg rounded-lg mb-3 border-gray-500 py-4 px-5 text-nowrap text-center flex justify-between items-center hover:bg-gray-300'>
                    <span className='font-bold text-2xl'>
                        {time}
                    </span>
                    <span className='font-bold text-xl text-red-800'>
                        {indicator}
                    </span>
                </div>
            </Link>

            {/* Availability info */}
            <div className='flex flex-row justify-between items-center'>
                <div className='bg-gray-200 rounded-lg p-3 flex-1 mr-3'>
                    <p className='text-center'>
                        <span className='font-medium'>Available Slots: </span>
                        <span className='font-bold'>{availableSlots}/{maxSlot}</span>
                    </p>
                </div>

                {/* Circular indicator */}
                <div className={`flex-shrink-0 w-4 h-12 rounded-md ${circleColor} flex items-center justify-center text-white font-bold`}>
                </div>
            </div>
        </div>
    )
}