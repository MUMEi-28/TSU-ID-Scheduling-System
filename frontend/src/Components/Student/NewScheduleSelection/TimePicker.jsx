import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const TimePicker = (props) =>
{
    const navigate = useNavigate();
    const [isAM, setIsAm] = useState(true);
    const [slotCounts, setSlotCounts] = useState({});
    const [loading, setLoading] = useState(true);

    const timeSlots = [
        "8:00am - 9:00am", "9:00am -10:00am",
        "10:00am-11:00am", "11:00am-12:00am",
        "1:00pm - 2:00pm", "2:00pm - 3:00pm",
        "3:00pm - 4:00pm", "4:00pm - 5:00pm"
    ];

    const handleChangePeriod = () =>
    {
        setIsAm(!isAM);
        props.setSelectedTime(null);
    };

    const handleChooseTime = (e) =>
    {
        const selected = e.target.value;
        props.setSelectedTime(selected);

        const dateFormatted = props.selectedDate
            ? format(new Date(props.selectedDate), "MMMM d, yyyy")
            : "No date selected";


        const slotsLeft = getSlotAvailability(selected);

        console.log(`📅 Date: ${dateFormatted}`);
        console.log(`🕒 Time: ${selected}`);
        console.log(`✅ Slots Available: ${slotsLeft}/12`);
    };


    const getSlotAvailability = (time) =>
    {

        console.log(`✅ Slots Available: ${slotCounts[time]}/12`);
        return slotCounts[time];
    };

    useEffect(() =>
    {
        if (!props.selectedDate) return;

        const fetchCounts = async () =>
        {
            const counts = {};
            const formattedDate = format(new Date(props.selectedDate), "MMMM d, yyyy");

            for (const time of timeSlots)
            {
                try
                {
                    const res = await axios.get(`http://localhost/Projects/TSU-ID-Scheduling-System/backend/get_slot_count.php`, {
                        params: {
                            schedule_date: formattedDate,
                            schedule_time: time
                        }
                    });
                    counts[time] = res.data.count || 0;
                } catch (e)
                {
                    counts[time] = 0;
                }
            }

            setSlotCounts(counts);
            setLoading(false);
        };

        fetchCounts();
    }, [props.selectedDate]);

    const renderButton = (time) =>
    {
        const slotsLeft = getSlotAvailability(time);
        const isSelected = props.selectedTime === time;

        return (
            <button
                key={time}
                value={time}
                onClick={handleChooseTime}
                disabled={slotsLeft >= 12}
                className={`
                    ${slotsLeft >= 12 ? 'opacity-50 cursor-not-allowed' : ''}
                    shadow-md rounded-lg transition-all py-5 p-2 sm:px-10 duration-200 border-2
                    ${isSelected
                        ? isAM
                            ? 'bg-[#E1A500] border-[#C68C10] text-white'
                            : 'text-white bg-purple-400 border-purple-500'
                        : 'bg-[#EBEBEB] text-[#7B7B7B] border-[#D4D4D4]'
                    }`}
            >
                <p className='pointer-events-none'>{time}</p>
                <p className={` pointer-events-none  ${getSlotAvailability(props.selectedTime) >= 8 ? 'text-[#b11616]' : getSlotAvailability(props.selectedTime) >= 4 ? 'text-[#d7e427]' : isSelected ? 'text-white' : 'text-[#27732A]'} text-sm mt-1`}>Slots: {slotsLeft}/12</p>
            </button >
        );
    };

    const displayedTimes = isAM
        ? timeSlots.slice(0, 4)
        : timeSlots.slice(4, 8);

    return (
        <div className='flex flex-col justify-evenly items-center h-6/12 w-fit md:mx-10'>
            <h1 className='league-font text-[#686868] text-3xl font-medium'>
                Choose your Availability
            </h1>

            <div className='flex h-fit league-font w-full justify-between text-sm sm:text-md'>
                <button onClick={handleChangePeriod} className='bg-[#BDBDBD] flex transition-all duration-300 rounded-lg shadow-md'>
                    <div className={`font-bold rounded-l-lg px-4 pt-2 ${isAM ? 'bg-[#CE9D31] text-white' : 'bg-[#BDBDBD] text-[#BDBDBD]'}`}>AM</div>
                    <div className={`font-bold rounded-r-lg px-4 pt-2 ${!isAM ? 'bg-purple-400 text-white' : 'bg-[#BDBDBD] text-[#BDBDBD]'}`}>PM</div>
                </button>

                {/*  <div className='text-lg sm:text-2xl border rounded-lg border-[#A3A3A3] shadow-md flex justify-between w-fit'>
                    <div className={`w-3 h-full rounded-l-lg ${getSlotAvailability(props.selectedTime) <= 4 ? 'bg-[#b11616]' : getSlotAvailability(props.selectedTime) <= 8 ? 'bg-[#d7e427]' : 'bg-[#27732A]'}`} />
                    <h1 className='mx-2'>Slots {getSlotAvailability(props.selectedTime)}/12</h1>
                </div> */}
            </div>

            <div className='flex-col flex gap-y-8 text-xs md:text-lg lg:text-xl'>
                <div className='flex martian-font gap-x-8'>
                    {renderButton(displayedTimes[0])}
                    {renderButton(displayedTimes[1])}
                </div>
                <div className='flex martian-font gap-x-8'>
                    {renderButton(displayedTimes[2])}
                    {renderButton(displayedTimes[3])}
                </div>
            </div>

            <button
                className='bg-[#E1A500] border-[#C68C10] league-font text-lg sm:text-2xl px-13 py-3 font-bold border-2 text-white rounded-lg hover:bg-amber-600 duration-200'
                onClick={() =>
                {
                    props.setRegistrationInputs(prev => ({
                        ...prev,
                        schedule_time: props.selectedTime
                    }));
                    props.handlingDataObjectsTest();
                    navigate('/receipt');
                }}
                disabled={!props.selectedTime}
            >
                Schedule
            </button>
        </div>
    );
};

export default TimePicker;
