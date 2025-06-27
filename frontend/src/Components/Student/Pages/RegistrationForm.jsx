import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'

export default function RegistrationForm(props)
{

    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [showDoneMessage, setShowDoneMessage] = useState(false);
    const [doneStudentData, setDoneStudentData] = useState(null);
    const [showPendingMessage, setShowPendingMessage] = useState(false);
    const [pendingStudentData, setPendingStudentData] = useState(null);

    /*  const [registrationInputs, setRegistrationInputs] = useState({});
 
     function handleChange(event)
     {
         const name = event.target.name;
         const value = event.target.value;
         setRegistrationInputs(values => ({ ...values, [name]: value }));
     }
 
     function handleSubmit(event)
     {
         event.preventDefault();
         axios.post(`http://localhost/Projects/TSU-ID-Scheduling-System/backend/register.php`, registrationInputs);
         console.log(registrationInputs);
     } */

    async function handleNextButton(event)
    {
        event.preventDefault();
        setError("");
        setShowDoneMessage(false);
        setDoneStudentData(null);
        setShowPendingMessage(false);
        setPendingStudentData(null);

        try {
            // Try login first
            const loginResponse = await axios.post(
                "http://localhost/Projects/TSU-ID-Scheduling-System/backend/login.php",
                props.registrationInputs
            );
            if (loginResponse.data.status === 1) {
                let tokenSet = false;
                // Admin login
                if (loginResponse.data.admin_token) {
                    localStorage.setItem('admin_token', loginResponse.data.admin_token);
                    tokenSet = true;
                    if (loginResponse.data.is_admin) {
                        navigate('/admin');
                        return;
                    }
                }
                // Student login
                if (loginResponse.data.student_token) {
                    localStorage.setItem('admin_token', loginResponse.data.student_token);
                    tokenSet = true;
                }
                if (tokenSet) {
                    navigate('/schedule');
                } else {
                    setError('Login failed: No token received.');
                }
                return;
            } else if (loginResponse.data.status === 2) {
                // Pending student with existing schedule
                setPendingStudentData(loginResponse.data.student_data);
                setShowPendingMessage(true);
                return;
            } else {
                // Handle special cases for done/cancelled status
                if (loginResponse.data.student_status === 'done') {
                    // Show message with button instead of auto-redirecting
                    setDoneStudentData(loginResponse.data.student_data);
                    setShowDoneMessage(true);
                    return;
                }
                setError(loginResponse.data.message);
            }
        } catch (err) {
            // Handle network errors or server errors
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(`Connection error: ${err.message}`);
            } else {
                setError("An error occurred. Please try again.");
            }
        }
    }

    const handleViewReceipt = () => {
        // Store student data for receipt view with a special "done" token
        localStorage.setItem('viewing_student_data', JSON.stringify(doneStudentData));
        localStorage.setItem('viewing_student_id', doneStudentData.id);
        localStorage.setItem('done_view_token', doneStudentData.id); // Special token for done students
        navigate('/receipt');
    };

    const handleViewPendingReceipt = () => {
        // Store student data for receipt view with a special "pending" token
        localStorage.setItem('viewing_student_data', JSON.stringify(pendingStudentData));
        localStorage.setItem('viewing_student_id', pendingStudentData.id);
        localStorage.setItem('pending_view_token', pendingStudentData.id); // Special token for pending students
        navigate('/receipt');
    };

    const handleReschedulePending = () => {
        // Store student data and navigate to schedule with reschedule mode
        localStorage.setItem('reschedule_student_data', JSON.stringify(pendingStudentData));
        localStorage.setItem('reschedule_student_id', pendingStudentData.id);
        localStorage.setItem('admin_token', 'reschedule_token'); // Special token for rescheduling
        navigate('/schedule');
    };

    const handleBackToHome = () => {
        setShowDoneMessage(false);
        setDoneStudentData(null);
        setShowPendingMessage(false);
        setPendingStudentData(null);
        setError("");
    };

    const isFormEmpty = !props.registrationInputs.fullname || !props.registrationInputs.student_number;

    return (
        <div className='flex flex-col lg:flex-row bg-[url(./Components/public/students-with-unif-tb.png)] min-h-screen'>

            {/* Left Panel Form */}
            <div className='w-full lg:w-3/6 min-h-screen flex justify-center items-center px-6'>
                <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl rounded-xl flex flex-col justify-center items-center gap-y-6 px-6 sm:px-10 pt-16 pb-1">
                    <div className='w-full h-full bg-[#ECECEC] absolute z-10 rounded-xl opacity-[.83] pb-10'></div>
                    <div className="h-8 w-full bg-[#5C0101] rounded-t-xl absolute top-0 z-10 mt-3"></div>
                    
                    {/* Done Status Message */}
                    {showDoneMessage ? (
                        <div className="poppins-font text-[#5B0000] text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight z-20 text-center">
                            ID Processing Complete
                        </div>
                    ) : showPendingMessage ? (
                        <div className="poppins-font text-[#5B0000] text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight z-20 text-center">
                            Existing Appointment Found
                        </div>
                    ) : (
                        <div className="poppins-font text-[#5B0000] text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight z-20 text-center">
                            Student Access
                        </div>
                    )}

                    {showDoneMessage ? (
                        // Done Status UI
                        <div className="flex flex-col gap-y-6 w-full px-6 sm:px-10 z-20">
                            <div className="text-center text-[#5B0000] mb-4">
                                <p className="text-lg">
                                    Your ID has already been processed and completed. If you need assistance, please visit the Business Center.
                                </p>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={handleViewReceipt}
                                    className="bg-[#CE9D31] hover:bg-[#b88a1a] text-white font-bold py-3 px-6 rounded-xl shadow-lg"
                                >
                                    View My Receipt
                                </button>
                                <button
                                    onClick={handleBackToHome}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    ) : showPendingMessage ? (
                        // Pending with Schedule Status UI
                        <div className="flex flex-col gap-y-6 w-full px-6 sm:px-10 z-20">
                            <div className="text-center text-[#5B0000] mb-4">
                                <p className="text-lg">
                                    You already have a scheduled appointment. You can view your details or reschedule if needed.
                                </p>
                                <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
                                    <p className="text-sm font-semibold">Current Appointment:</p>
                                    <p className="text-sm">{pendingStudentData?.schedule_date}</p>
                                    <p className="text-sm">{pendingStudentData?.schedule_time}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={handleViewPendingReceipt}
                                    className="bg-[#CE9D31] hover:bg-[#b88a1a] text-white font-bold py-3 px-6 rounded-xl shadow-lg"
                                >
                                    View My Appointment
                                </button>
                                <button
                                    onClick={handleReschedulePending}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
                                >
                                    Reschedule
                                </button>
                                <button
                                    onClick={handleBackToHome}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Regular Login Form
                        <form
                            onSubmit={handleNextButton}
                            className="flex flex-col gap-y-6 w-full px-6 sm:px-10 z-20">
                            <div className='w-full'>
                                <label htmlFor="FullName" className='block'>Full Name</label>
                                <input
                                    id="FullName"
                                    type="text"
                                    name="fullname"
                                    onChange={props.handleChange}
                                    placeholder='Marc Jersey Castro'
                                    className='p-4 bg-[#BABABA] w-full'
                                />
                            </div>

                            <div className='w-full'>
                                <label htmlFor="StudentNum" className='block'>Student Number</label>
                                <input
                                    id='StudentNum'
                                    type="text"
                                    name="student_number"
                                    onChange={props.handleChange}
                                    placeholder='2022300766'
                                    className='p-4 bg-[#BABABA] w-full'
                                /> </div>

                            {error && (
                                <div className="text-red-600 text-center font-semibold">{error}</div>
                            )}

                            <button
                                type="submit"
                                disabled={isFormEmpty}
                                /* onClick={() => { handleNextButton }} */
                                className={`self-center w-8/12 sm:w-6/12 md:w-5/12 py-3 text-sm sm:text-base md:text-lg
                                    istok-font text-white font-bold rounded-xl shadow-lg mt-4
                                    ${isFormEmpty ? 'bg-[#CE9D31]/50 cursor-not-allowed' : 'bg-[#CE9D31] hover:bg-[#CE9D31]/90'}`}>
                                {/*  <Link to="/schedule">Submit</Link> */}
                                Next
                            </button>

                        </form>
                    )}
                </div>
            </div>

            {/* Right Panel Form */}
            <div className='w-full lg:w-1/2 min-h-[100vh] max-w-screen bg-[#4F0303] 
            rounded-bl-[10vw] lg:rounded-bl-none 
            lg:rounded-tl-[11vw] 
            relative flex justify-evenly items-center'>
                <div className='flex flex-col justify-center  h-full w-6/8 text-white poppins-font z-20'>
                    <div className='text-4xl sm:text-4xl md:text-4xl lg:text-4xl xl:text-4xl 2xl:text-6xl font-bold'>
                        <h1>Welcome to TSU</h1>
                        <h1 className='text-[#CC9318] mb-10'>ID Scheduling System!</h1>
                    </div>

                    <div className='w-full flex items-start justify-start flex-col gap-y-2'>
                        <h1 className='text-3xl sm:text-2xl md:text-3xl tracking-[.001vw] mt-0 font-medium'>Notice</h1>
                        <p className='text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-[#AAAAAA]'>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                            <u> I love Ju fufu, she the best Cat Thiren in ZZZ, smash must pull</u> et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <p className='opacity-[.34] italic'>06-21-2025</p>
                    </div>
                </div>

                <div className='w-full h-full bg-linear-98 from-[#580000] from-13% via-[#95561c] via-80% to-[#3B0000] to-97% rounded-tl-[10vw] sm:rounded-tl-[0vw] rounded-br-[0vw] sm:block absolute z-10'></div>
            </div>
        </div >
    );
}