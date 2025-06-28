import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import checkImg from '../../public/check.png';
import { buildApiUrl, API_ENDPOINTS } from '../../../config/api';

const ScheduleReceipt = (props) =>
{
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [isViewingExisting, setIsViewingExisting] = useState(false);

  useEffect(() => {
    // Check if we're viewing existing student data
    const viewingData = localStorage.getItem('viewing_student_data');
    const existingUserToken = localStorage.getItem('existing_user_token');
    
    if (viewingData) {
        setStudentData(JSON.parse(viewingData));
        setIsViewingExisting(true);
        setConfirmed(true); // Auto-confirm for viewing existing data
    }
    
    // Handle existing user token
    if (existingUserToken) {
        setIsViewingExisting(true);
        setConfirmed(true);
    }
  }, []);

  const handleBack = () => {
    if (confirmed || isViewingExisting) {
        localStorage.removeItem('confirmedSlot');
        localStorage.removeItem('viewing_student_data');
        localStorage.removeItem('viewing_student_id');
        localStorage.removeItem('done_view_token');
        localStorage.removeItem('pending_view_token');
        localStorage.removeItem('existing_user_token');
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

  const handleConfirm = async () => {
    try {
      let id = displayData.id;
      if (!id) {
        const storedId = localStorage.getItem('student_id');
        id = storedId ? parseInt(storedId, 10) : undefined;
      }
      const payload = {
        id,
        fullname: displayData.fullname,
        student_number: displayData.student_number,
        schedule_date: displayData.schedule_date,
        schedule_time: displayData.schedule_time,
        email: displayData.email,
        id_reason: displayData.id_reason,
        data_privacy_agreed: displayData.data_privacy_agreed,
        status: 'pending',
      };
      console.log('Payload sent to confirm_slot:', payload);
      const response = await axios.put(buildApiUrl(API_ENDPOINTS.CONFIRM_SLOT), JSON.stringify(payload), {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.data.status === 1) {
        setConfirmed(true);
        localStorage.setItem('confirmedSlot', 'true');
      } else {
        alert(response.data.message || 'Failed to confirm slot');
      }
    } catch (err) {
      alert('Error confirming slot: ' + (err.response?.data?.message || err.message));
    }
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
    <div className="relative flex justify-center items-center min-h-screen bg-[url('Components\\public\\students-with-unif-tb.png')] bg-cover bg-center px-4 py-8">
      <div className="absolute inset-0 bg-black opacity-70 z-0"></div>
      <div className="relative flex flex-col items-center justify-center gap-4 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg z-10">
        {(confirmed || isViewingExisting) && (
          <div className="w-12 sm:w-14 md:w-16 lg:w-18">
            <img src={checkImg} alt="check" className="w-full h-auto" />
          </div>
        )}
        <div className="poppins-font text-[#ECECEC] text-center font-medium text-lg sm:text-xl md:text-2xl lg:text-3xl px-4">
          {isViewingExisting ? 'Your Appointment Information' : 
           confirmed ? 'Your slot has been confirmed!' : 'Please confirm your slot to continue.'}
        </div>
        <div className="poppins-font bg-gray-200 text-center rounded-3xl shadow-xl w-full max-w-sm sm:max-w-md md:max-w-lg px-4 pb-6 text-sm sm:text-base md:text-lg flex flex-col items-center justify-center overflow-hidden">
          <div className="w-full h-6 bg-[#5C0101] text-[#ECECEC] flex items-center justify-center rounded-t-3xl text-sm sm:text-base font-semibold"></div>
          <div className="h-4" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl tracking-tighter font-semibold underline text-[#5B0000]">Slot Information</h1>
          <div className="h-3" />
          <h2 className="mt-2 mb-2 font-medium underline text-[#656565] text-sm sm:text-base">Date and Time:</h2>
          <h3 className="mb-4 font-light text-[#656565] text-sm sm:text-base">{displayData.schedule_date},<br></br>{displayData.schedule_time}</h3>
          <h2 className="mb-2 font-medium underline text-[#656565] text-sm sm:text-base">Your Details:</h2>
          <h3 className="mb-2 font-light text-[#656565] text-sm sm:text-base">Student Number: {displayData.student_number} </h3>
          <h3 className="mb-6 font-light text-[#656565] text-sm sm:text-base">Student Name: {displayData.fullname}</h3>
          <div className="flex w-full justify-center gap-2 mb-2">
            <button
              onClick={handleBack}
              className="bg-[#E1A500] hover:bg-[#C68C10] text-white font-bold py-2 px-3 sm:px-4 rounded-lg shadow-lg border-2 border-[#C68C10] transition-all duration-200 text-xs sm:text-sm"
            >
              {confirmed || isViewingExisting ? 'Back to Home' : 'Back'}
            </button>
            {!confirmed && !isViewingExisting && (
              <button
                id="downloadBtn"
                className="px-4 sm:px-6 rounded-lg bg-[#E1A500] hover:bg-[#C68C10] self-center py-2 sm:py-3 text-xs sm:text-sm md:text-base istok-font text-white font-bold rounded-lg shadow-lg border-2 border-[#C68C10] transition-all duration-200"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            )}
          </div>
        </div>
        <h1 className="text-center italic poppins-font font-extralight text-[#D9D9D9] text-xs sm:text-sm md:text-base px-4">
          {isViewingExisting ? 'Note: This is your current appointment information.' : 
           'Note: Please take a screenshot of the receipt and close the website as soon as you finished your slot confirmation.'}
        </h1>
      </div >
    </div >
  );
};

export default ScheduleReceipt;
