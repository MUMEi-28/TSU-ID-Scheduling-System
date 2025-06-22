import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Calendar from '../ScheduleSelection/Calendar'
import ScheduleSelelectionFooter from '../ScheduleSelection/ScheduleSelelectionFooter'
import TimeIndicator from '../ScheduleSelection/TimeIndicator'

export default function ScheduleSelection()
{
    return (
        <div className='flex min-h-screen flex-col justify-between bg-gray-100'>
            <div className='flex flex-row'>
                <Calendar />
                <Routes>
                    <Route path="/schedule/" element={<TimeIndicator />} />
                    <Route path="/schedule/:date" element={<TimeIndicator />} />
                    <Route path="/schedule/:date/:timePeriod" element={<TimeIndicator />} />
                </Routes>

            </div>

            <ScheduleSelelectionFooter />
        </div>
    )
}