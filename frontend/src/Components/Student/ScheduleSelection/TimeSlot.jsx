import React from 'react'
import { Link } from 'react-router-dom';

export default function TimeSlot({ time, indicator, availableSlots, maxCapacity = 12 })
{
    // Determine color based on availability
    let slotColor = availableSlots === 0 ? 'text-red-600' : 'text-green-700';
    let cardOpacity = availableSlots === 0 ? 'opacity-60' : 'hover:shadow-2xl hover:scale-105 cursor-pointer';

    return (
        <div
            className={`
                flex flex-col items-center justify-center w-full
                bg-white shadow-lg rounded-xl border border-gray-200
                p-4 mb-2 transition-all duration-200
                ${cardOpacity}
            `}
            style={{ minHeight: 110 }}
        >
            <div className="font-bold text-xl text-gray-800 mb-1 tracking-tight">
                {time}
            </div>
            <div className="flex items-center gap-2 mt-1">
                <span className={`font-semibold text-lg ${slotColor}`}>
                    Slots: {availableSlots}/{maxCapacity}
                </span>
                {availableSlots === 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                        Full
                    </span>
                )}
            </div>
        </div>
    )
}