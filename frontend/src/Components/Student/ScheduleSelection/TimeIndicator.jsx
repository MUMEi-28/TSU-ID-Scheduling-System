import React from 'react'
import { Link, useParams, Routes, Route } from 'react-router-dom'
import TimeSlotContainer from './TimeSlotContainer'

export default function TimeIndicator()
{
    const { date } = useParams();

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-6 w-full max-w-3/4 mx-auto">
            <div className='flex items-center justify-center flex-col '>
                <span className='text-red-800 font-bold text-3xl'>Choose your</span>
                <span className='text-red-800 font-bold text-4xl'>AVAILABILITY</span>
            </div>

            <nav className="">
                <ul className="flex">
                    <Link
                        to={`/schedule/${date}/AM`} >
                        <li
                            className="px-6 py-3 bg-yellow-600 text-white hover:bg-yellow-800 transition-colors"
                        >AM</li>
                    </Link>
                    <Link
                        to={`/schedule/${date}/PM`}>
                        <li
                            className="px-6 py-3 bg-yellow-600 text-white hover:bg-yellow-800 transition-colors"
                        >PM</li>
                    </Link>
                </ul>
            </nav>

            <TimeSlotContainer />
        </div>
    );
}