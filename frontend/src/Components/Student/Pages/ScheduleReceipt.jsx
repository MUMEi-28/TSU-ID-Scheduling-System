import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ScheduleReceipt = (props) =>
{
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [isViewingExisting, setIsViewingExisting] = useState(false);

  useEffect(() => {
    // Check if we're viewing existing student data
    const viewingData = localStorage.getItem('viewing_student_data');
    if (viewingData) {
      setStudentData(JSON.parse(viewingData));
      setIsViewingExisting(true);
      setConfirmed(true); // Auto-confirm for viewing existing data
    }
  }, []);

  const handleBack = () => {
    if (confirmed || isViewingExisting) {
      localStorage.removeItem('confirmedSlot');
      localStorage.removeItem('viewing_student_data');
      localStorage.removeItem('viewing_student_id');
      localStorage.removeItem('done_view_token');
      localStorage.removeItem('pending_view_token');
      if (props.handleLogout) {
        props.handleLogout();
      } else {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('registrationInputs');
        localStorage.removeItem('selectedTime');
        localStorage.removeItem('selectedDate');
        navigate('/');
      }
    } else {
      navigate('/schedule');
    }
  };

  const handleConfirm = () => {
    setConfirmed(true);
    localStorage.setItem('confirmedSlot', 'true');
    // Optionally call props.handleSubmit();
  };

  // Remove confirmedSlot flag when leaving the page or logging out
  useEffect(() => {
    return () => {
      localStorage.removeItem('confirmedSlot');
    };
  }, []);

  // Use studentData if available, otherwise use props.registrationInputs
  const displayData = studentData || props.registrationInputs;

  return (
    <div className="relative flex justify-center items-center h-screen bg-[url('Components\\public\\students-with-unif-tb.png')] bg-cover bg-center px-4">
      <div className="absolute inset-0 bg-black opacity-70 z-0"></div>
      <div className="relative flex flex-col items-center justify-center gap-6 w-full max-w-sm shm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-md 2xl:max-w-md z-10">
        {(confirmed || isViewingExisting) && (
          <div className="w-14 sm:w-11 md:w-13 lg:w-14">
            <img src="src\\Components\\public\\check.png" alt="check" className="w-full h-auto" />
          </div>
        )}
        <div className="poppins-font text-[#ECECEC] text-center font-medium text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-3xl px-4 whitespace-nowrap">
          {isViewingExisting ? 'Your Appointment Information' : 
           confirmed ? 'Your slot has been confirmed!' : 'Please confirm your slot to continue.'}
        </div>
        <div className="poppins-font bg-gray-200 text-center rounded-4xl shadow-xl w-85 max-w-md px-0 pb-6 text-sm sm:text-base md:text-lg lg:text-xl flex flex-col items-center justify-center overflow-hidden">
          <div className="w-full h-8 bg-[#5C0101] text-[#ECECEC] flex items-center justify-center rounded-t-4xl text-lg font-semibold"></div>
          <div className="h-6" />
          <h1 className="text-4xl tracking-tighter font-semibold underline text-[#5B0000] ">Slot Information</h1>
          <br></br>
          <h2 className="mt-2 mb-3 font-medium underline text-[#656565]">Date and Time:</h2>
          <h3 className="mb-6 font-light text-[#656565]">{displayData.schedule_date},<br></br>{displayData.schedule_time}</h3>
          <h2 className="mb-3 font-medium underline text-[#656565]">Your Details:</h2>
          <h3 className="mb-2 font-light text-[#656565]">Student Number: {displayData.student_number} </h3>
          <h3 className="mb-17 font-light text-[#656565]">Student Name: {displayData.fullname}</h3>
          <div className="flex w-full justify-center gap-2 mb-2">
            <button
              onClick={handleBack}
              className="bg-[#CE9D31] hover:bg-[#b88a1a] text-white font-bold py-2 px-4 rounded-xl shadow-lg"
            >
              {confirmed || isViewingExisting ? 'Back to Home' : 'Back'}
            </button>
            {!confirmed && !isViewingExisting && (
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
        <h1 className=" text-center italic poppins-font font-extralight text-[#D9D9D9] ">
          {isViewingExisting ? 'Note: This is your current appointment information.' : 
           'Note: Please take a screenshot of the receipt and close the website as soon as you finished your slot confirmation.'}
        </h1>
      </div >
    </div >
  );
};

export default ScheduleReceipt;
