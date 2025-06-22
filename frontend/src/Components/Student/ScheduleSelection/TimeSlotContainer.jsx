import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import TimeSlot from './TimeSlot';

export default function TimeSlotContainer()
{
    const { date, timePeriod } = useParams();

    const [morningSlot, setMorningSlot] = useState({})

    return (
        <div className="p-4 w-full flex items-center justify-center">
            {/*   <h1 className="text-xl font-bold mb-4">Available Time Slots</h1> */}
            {/*         <h2 className="text-2xl mb-6">
                {date} - {timePeriod === 'AM' ? 'AM' : 'PM'}
            </h2> */}

            <div className="grid grid-cols-2 gap-4 min-w-[50%] ">
                {timePeriod === 'AM' ? (
                    <>
                        <TimeSlot time='8:00 - 9:00' availableSlots={6} indicator='AM' />
                        <TimeSlot time='8:00 - 9:00' availableSlots={7} indicator='AM' />
                        <TimeSlot time='8:00 - 9:00' availableSlots={10} indicator='AM' />
                        <TimeSlot time='8:00 - 9:00' availableSlots={3} indicator='AM' />
                    </>
                ) : (
                    <>
                        <TimeSlot time='8:00 - 9:00' availableSlots={5} indicator='PM' />
                        <TimeSlot time='8:00 - 9:00' availableSlots={6} indicator='PM' />
                        <TimeSlot time='8:00 - 9:00' availableSlots={7} indicator='PM' />
                        <TimeSlot time='8:00 - 9:00' availableSlots={10} indicator='PM' />
                    </>
                )}
            </div>
        </div>
    );
}