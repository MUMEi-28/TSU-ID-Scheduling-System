import React from 'react'
import Calendar from './ScheduleSelection/Calendar'
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AdminPage = () => {

  const location = useLocation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showList, setShowList] = useState(false);
  const [currentScheduleDate, setCurrentScheduleDate] = useState("No Date Chosen");
  const [placeHolderDate, setPlaceHolderDate] = useState("No Date Chosen")

    const HandleChangeDate = () => {
        setShowCalendar(true); 
        console.log("CALLLLLEDNDARR");
    };

    const HandleShowList = () =>{
         setShowList(true);
         console.log("LISSSTTTDONWNLOAD");
    }
    const handleDownloadList = () =>{
        setShowList(false);
        if(currentScheduleDate ==="No Date Chosen"){
            alert("NO DATE BRUH")
        } else{
        alert("DOWNLOADING FILE KUNWARI")
        }

    }

    function HandleDateReplace(){
        setShowCalendar(false);

        const Url = window.location.pathname;
        const urlSegments = Url.split('/');
        const dateNumerical = urlSegments[urlSegments.length - 1];
        const dateObject = new Date(dateNumerical);

        const realDate = dateObject.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
        });
        setCurrentScheduleDate(realDate);

        console.log(realDate)
    }

    useEffect(() => {

    console.log('boy aint no way boy');
     const Url = window.location.pathname;
        const urlSegments = Url.split('/');
        const dateNumerical = urlSegments[urlSegments.length - 1];
        const dateObject = new Date(dateNumerical);

        const realDate = dateObject.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
        });
        setPlaceHolderDate(realDate)

  }, [location.pathname]);


  return (
    <div className='w-screen h-screen flex'>
        
        <div className='w-3/12 h-screen relative flex flex-col justify-center items-center gap-y-15'>

            <h1 className='absolute border-2 left-0 top-10 text-2xl px-10 py-1'>Admin</h1>

            <h1 className=' text-4xl'>Scheduled Time</h1>
            <button className='text-[clamp(1.25rem,3cqw,2rem)] border-4 rounded-lg py-4 px-12 duration-300 hover:bg-pink-200'>8:00 am - 9:00 am</button>
            <button className='text-[clamp(1.25rem,3cqw,2rem)] border-4 rounded-lg py-4 px-10 duration-300 hover:bg-pink-200'>9:00 am - 10:00 am</button>
            <button className='text-[clamp(1.25rem,3cqw,2rem)] border-4 rounded-lg py-4 px-8 duration-300 hover:bg-pink-200'>10:00 am - 11:00 am</button>
            <button className='text-[clamp(1.25rem,3cqw,2rem)] border-4 rounded-lg py-4 px-8 duration-300 hover:bg-pink-200'>11:00 am - 12:00 am</button>

        </div>

        <div className='w-9/12 h-screen flex justify-center items-center relative'>

            <div className='absolute right-30 top-10  py-1'>

                <p >Change Date</p>
                <button onClick={HandleChangeDate} className='w-full text-center duration-300 border-2 hover:border-amber-400 hover:text-amber-400'> 
                    <h1 className='text-2xl px-10'>{currentScheduleDate}</h1>
                </button>

            </div>

             <div className='absolute right-30 bottom-20 py-1'>

                <button onClick={HandleShowList} className='w-full text-center duration-300 hover:border-amber-400 hover:text-amber-400 border-2'> 
                    <h1 className='text-2xl px-10'>Generate List</h1>
                </button>

            </div>

             {showCalendar && (

                <div className='fixed inset-0 bg-black/50 flex justify-center items-center z-20'>
                    <div className=' bg-white p-6 opacity-100 rounded-lg shadow-xl h-fit flex flex-col justify-center items-center text-2xl'> 
                        <Calendar />
                        <hr />
                        <button onClick={() => HandleDateReplace()} className='w-full p-5 text-2xl bg-red-500 text-white rounded-md hover:bg-red-600 '>
                             Change Date to: {placeHolderDate}
                        </button>
                    </div>
                </div>
            )}

             {showList && (

                <div className='fixed inset-0 bg-black/50 flex justify-center items-center z-20'>
                    <div className=' bg-white p-6 opacity-100 shadow-xl w-3/12 h-5/12 flex flex-col justify-evenly items-center border-4'> 
                        <h1 className='text-5xl mb-1'>Generate List</h1>
                        <hr className='w-full' />
                        <h1 className='text-black text-4xl '>Date</h1>
                        <h1 className='text-black text-4xl'>{currentScheduleDate}</h1>
                        <button onClick={handleDownloadList} className='w-fit p-5 text-2xl border-2 text-black rounded-md hover:bg-gray-600 '>
                             Download
                        </button>
                    </div>
                </div>
            )}

            <div className='w-10/12 h-8/12 bg-white flex'>
                <div className='h-full w-2/6 border-2 self-end'>
                    <div className='w-full h-1/12 border-b-2 text-2xl text-center  bg-gray-300'>
                        <h1>Name</h1>
                    </div>

                </div>

                 <div className='h-full w-2/6 border-2 self-end'>
                    <div className='w-full h-1/12 border-b-2 text-2xl text-center  bg-gray-300'>
                        <h1>Student Number</h1>
                    </div>
                    
                </div>

                <div className='h-full w-2/6 border-2 self-end'>
                    <div className='w-full h-1/12 border-b-2 text-2xl text-center bg-gray-300'>
                        <h1>Date/Time</h1>
                    </div>
                    
                </div>

            </div>

        </div>

    </div>
  )
}

export default AdminPage
