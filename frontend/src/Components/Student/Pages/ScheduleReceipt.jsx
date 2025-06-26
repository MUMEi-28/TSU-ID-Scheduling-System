import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ScheduleReceipt = (props) =>
{
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);

  const handleBack = () => {
    if (confirmed) {
      localStorage.removeItem('admin_token');
      navigate('/');
    } else {
      navigate('/schedule');
    }
  };

  const handleConfirm = () => {
    setConfirmed(true);
    // Optionally call props.handleSubmit();
  };

  return (
    <div className="relative flex justify-center items-center h-screen bg-[url('Components\\public\\students-with-unif-tb.png')] bg-cover bg-center px-4">
      <div className="absolute inset-0 bg-black opacity-70 z-0"></div>
      <div className="relative flex flex-col items-center justify-center gap-6 w-full max-w-sm shm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-md 2xl:max-w-md z-10">
        {confirmed && (
          <div className="w-14 sm:w-11 md:w-13 lg:w-14">
            <img src="src\\Components\\public\\check.png" alt="check" className="w-full h-auto" />
          </div>
        )}
        <div className="poppins-font text-[#ECECEC] text-center font-medium text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-3xl px-4 whitespace-nowrap">
          {confirmed ? 'Your slot has been confirmed!' : 'Please confirm your slot to continue.'}
        </div>
        <div className="poppins-font bg-gray-200 text-center rounded-4xl shadow-xl w-85 max-w-md px-0 pb-6 text-sm sm:text-base md:text-lg lg:text-xl flex flex-col items-center justify-center overflow-hidden">
          <div className="w-full h-8 bg-[#5C0101] text-[#ECECEC] flex items-center justify-center rounded-t-4xl text-lg font-semibold"></div>
          <div className="h-6" />
          <h1 className="text-4xl tracking-tighter font-semibold underline text-[#5B0000] ">Slot Information</h1>
          <br></br>
          <h2 className="mt-2 mb-3 font-medium underline text-[#656565]">Date and Time:</h2>
          <h3 className="mb-6 font-light text-[#656565]">{props.registrationInputs.schedule_date},<br></br>{props.registrationInputs.schedule_time}</h3>
          <h2 className="mb-3 font-medium underline text-[#656565]">Your Details:</h2>
          <h3 className="mb-2 font-light text-[#656565]">Student Number: {props.registrationInputs.fullname} </h3>
          <h3 className="mb-17 font-light text-[#656565]">Student Name: {props.registrationInputs.student_number}</h3>
          <div className="flex w-full justify-center gap-2 mb-2">
            <button
              onClick={handleBack}
              className="bg-[#CE9D31] hover:bg-[#b88a1a] text-white font-bold py-2 px-4 rounded-xl shadow-lg"
            >
              {confirmed ? 'Back to Home' : 'Back'}
            </button>
            {!confirmed && (
              <button
                id="downloadBtn"
                className="px-6 rounded-lg' bg-[#CE9D31] hover:bg-[#5d4e2e] self-center py-3 text-sm sm:text-base md:text-lg istok-font text-white font-bold rounded-xl shadow-lg"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            )}
          </div>
        </div>
        <h1 className=" text-center italic poppins-font font-extralight text-[#D9D9D9] ">Note:  Please take a screenshot of the  receipt
          and close the website as soon as you finished your slot confirmation.</h1>
      </div >
    </div >
  );
};

export default ScheduleReceipt;
