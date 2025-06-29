import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../../config/api';
import { getCanonicalTimeSlots, canonicalToDisplay } from '../../../utils/timeUtils';
import TimeSlot from './TimeSlot';

export default function TimeSlotContainer()
{
    const { date, timePeriod } = useParams();
    const [slotData, setSlotData] = useState({});
    const [loading, setLoading] = useState(true);

    // Get canonical time slots and filter by period
    const allTimeSlots = getCanonicalTimeSlots();
    const amSlots = allTimeSlots.slice(0, 4);
    const pmSlots = allTimeSlots.slice(4, 8);
    const timeSlots = timePeriod === 'AM' ? amSlots : pmSlots;

    useEffect(() => {
        const fetchSlotData = async () => {
            if (!date) {
                setLoading(false);
                return;
            }

            const data = {};
            for (const time of timeSlots) {
                try {
                    const res = await axios.get(`${buildApiUrl(API_ENDPOINTS.GET_SLOT_COUNT)}`, {
                        params: {
                            schedule_date: date,
                            schedule_time: time
                        }
                    });
                    data[time] = {
                        count: res.data.count || 0,
                        max_capacity: res.data.max_capacity || 12
                    };
                } catch (e) {
                    data[time] = { count: 0, max_capacity: 12 };
                }
            }
            setSlotData(data);
            setLoading(false);
        };

        fetchSlotData();
    }, [date, timePeriod, timeSlots]);

    if (loading) {
        return (
            <div className="p-4 w-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading slots...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 w-full flex items-center justify-center">
            {/*   <h1 className="text-xl font-bold mb-4">Available Time Slots</h1> */}
            {/*         <h2 className="text-2xl mb-6">
                {date} - {timePeriod === 'AM' ? 'AM' : 'PM'}
            </h2> */}

            <div className="grid grid-cols-2 gap-4 min-w-[50%] ">
                {timeSlots.map((time, index) => {
                    const slotInfo = slotData[time] || { count: 0, max_capacity: 12 };
                    const availableSlots = Math.max(0, slotInfo.max_capacity - slotInfo.count);
                    
                    return (
                        <TimeSlot 
                            key={time}
                            time={canonicalToDisplay(time)} 
                            availableSlots={availableSlots} 
                            maxCapacity={slotInfo.max_capacity}
                            indicator={timePeriod} 
                        />
                    );
                })}
            </div>
        </div>
    );
}