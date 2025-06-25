import React from 'react'
import { useState } from 'react'

import { Link, useNavigate } from 'react-router-dom';
const TimePicker = (props) =>
{

    const navigate = useNavigate();

    const [isAM, setIsAm] = useState(true);
    const [slotNumber, setSlotNumber] = useState(9) // number of slots left

    const handleChangePeriod = () =>
    {
        setIsAm(!isAM)
        props.setSelectedTime(null)
    }

    const handleChooseTime = (e) =>
    {
        props.setSelectedTime(e.target.value);
    }

    const handleSubmitSchedule = () =>
    {

        alert("Your Schedule is " + props.selectedTime + " someday idk when")
    }

    return (
        <div className='flex flex-col justify-between items-center h-6/12 w-fit md:mx-10'>

            <h1 className='league-font text-[#686868] text-3xl font-medium'>
                Choose your Availability
            </h1>

            <div className='flex h-fit league-font w-full justify-between text-sm sm:text-lg'>

                <button onClick={handleChangePeriod} className='bg-[#BDBDBD] flex transition-all duration-300 rounded-lg shadow-md'>
                    <div className={`font-bold rounded-l-lg px-4 pt-2 transition-all duration-200 ${isAM ? 'bg-[#CE9D31] text-white' : 'bg-[#BDBDBD] text-[#BDBDBD]  '}`}>
                        AM
                    </div>
                    <div className={`font-bold rounded-r-lg px-4 pt-2 transition-all duration-300 ${!isAM ? 'bg-purple-400 text-white' : 'bg-[#BDBDBD] text-[#BDBDBD] '}`}>
                        PM
                    </div>
                </button>

                <div className='text-lg sm:text-2xl border rounded-lg  border-[#A3A3A3] shadow-md flex justify-between w-fit'>
                    <div className={`w-3 h-full rounded-l-lg ${slotNumber <= 4 ? 'bg-[#b11616]' : slotNumber > 4 && slotNumber <= 8 ? 'bg-[#d7e427]' : 'bg-[#27732A]'} `}>

                    </div>
                    <h1 className='mx-2'>Slots {slotNumber}/12</h1>
                </div>
            </div>

            <div className='flex-col flex gap-y-5 text-xs md:text-lg lg:text-xl'>

                <div className='flex martian-font gap-x-8'>

                    <button value={isAM ? "8:00am - 9:00am" : "1:00pm - 2:00pm"}
                        onClick={(e) => handleChooseTime(e)}
                        className={` shadow-md rounded-lg transition-all py-5 p-2 sm:px-10 duration-200 border-2 ${props.selectedTime === (isAM ? "8:00am - 9:00am" : "1:00pm - 2:00pm")
                            ? isAM ? 'bg-[#E1A500] border-[#C68C10] text-white' : ' text-white bg-purple-400 border-purple-500' :
                            'bg-[#EBEBEB] text-[#7B7B7B] border-[#D4D4D4]'}`}>

                        {isAM ? "8:00am - 9:00am" : "1:00pm - 2:00pm"}
                    </button>

                    <button value={isAM ? "9:00am -10:00am" : "2:00pm - 3:00pm"}
                        onClick={(e) => handleChooseTime(e)}
                        className={`shadow-md rounded-lg transition-all duration-200 py-5 p-2 sm:px-10 border-2 ${props.selectedTime === (isAM ? "9:00am -10:00am" : "2:00pm - 3:00pm")
                            ? isAM ? 'bg-[#E1A500] border-[#C68C10] text-white' : ' text-white bg-purple-400 border-purple-500' :
                            'bg-[#EBEBEB] text-[#7B7B7B] border-[#D4D4D4]'}`}>

                        {isAM ? "9:00am -10:00am" : "2:00pm - 3:00pm"}
                    </button>

                </div>

                <div className='flex martian-font gap-x-8'>

                    <button value={isAM ? "10:00am-11:00am" : "3:00pm - 4:00pm"}
                        onClick={(e) => handleChooseTime(e)}
                        className={`shadow-md rounded-lg transition-all py-5 p-2 sm:px-10 duration-200 border-2 ${props.selectedTime === (isAM ? "10:00am-11:00am" : "3:00pm - 4:00pm")
                            ? isAM ? 'bg-[#E1A500] border-[#C68C10] text-white' : ' text-white bg-purple-400 border-purple-500' :
                            'bg-[#EBEBEB] text-[#7B7B7B] border-[#D4D4D4]'}`}>

                        {isAM ? "10:00am-11:00am" : "3:00pm - 4:00pm"}
                    </button>

                    <button value={isAM ? "11:00am-12:00am" : "4:00pm - 5:00pm"}
                        onClick={(e) => handleChooseTime(e)}
                        className={`shadow-md rounded-lg transition-all duration-200 py-5 p-2 sm:px-10 border-2 ${props.selectedTime === (isAM ? "11:00am-12:00am" : "4:00pm - 5:00pm")
                            ? isAM ? 'bg-[#E1A500] border-[#C68C10] text-white' : ' text-white bg-purple-400 border-purple-500' :
                            'bg-[#EBEBEB] text-[#7B7B7B] border-[#D4D4D4]'}`}>

                        {isAM ? "11:00am-12:00am" : "4:00pm - 5:00pm"}
                    </button>

                </div>

            </div>

            <button className='bg-[#E1A500] border-[#C68C10] league-font text-lg sm:text-2xl px-13 py-3 font-bold border-2 text-white rounded-lg hover:bg-amber-600 duration-200'

                onClick={() =>
                {

                    props.setRegistrationInputs(prev => (
                        {
                            ...prev,
                            schedule_time: props.selectedTime
                        }
                    ));

                    navigate('/receipt');


                    props.handlingDataObjectsTest();
                }}

            >
                Schedule

            </button>

        </div>
    )
}

export default TimePicker
