import React from 'react';

const ScheduleReceipt = () => {
  return (
    <div className="relative flex justify-center items-center min-h-screen bg-[url('Components\public\students-with-unif-tb.png')] bg-cover bg-center px-4">

     
      <div className="absolute inset-0 bg-black opacity-70 z-0"></div>

      
      <div className="relative flex flex-col items-center justify-center gap-6 w-full max-w-sm shm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-md 2xl:max-w-md z-10">


        
        <div className="w-14 sm:w-11 md:w-13 lg:w-14">
        <img src="src\Components\public\check.png" alt="check" className="w-full h-auto" />
        </div>


       
        <div className="poppins-font text-[#ECECEC] text-center font-medium text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-3xl px-4 whitespace-nowrap">
         Your slot has been confirmed!
        </div>



        
        <div className="poppins-font bg-gray-200 text-center rounded-4xl shadow-xl w-85 max-w-md px-0 pb-6 text-sm sm:text-base md:text-lg lg:text-xl flex flex-col items-center justify-center overflow-hidden">

         
          <div className="w-full h-8 bg-[#5C0101] text-[#ECECEC] flex items-center justify-center rounded-t-4xl text-lg font-semibold">
            
          </div>

         
          <div className="h-6" />

          <h1 className="text-4xl tracking-tighter font-semibold underline text-[#5B0000] ">Slot Information</h1>
          <br></br>
         
          <h2 className="mt-2 mb-3 font-medium underline text-[#656565]">Date and Time:</h2>
          <h3 className="mb-6 font-light text-[#656565]">Jan 1, 2025, 
            <br>
            </br>10am–12pm</h3>

          <h2 className="mb-3 font-medium underline text-[#656565]">Your Details:</h2>
          <h3 className="mb-2 font-light text-[#656565]">Student Number: </h3>
          <h3 className="mb-17 font-light text-[#656565]">Student Name: </h3>

          <button
            id="downloadBtn"
            className=" px-6 rounded-lg' bg-[#CE9D31] hover:bg-[#5d4e2e] self-center w-8/12 sm:w-6/12 md:w-5/12 py-3 text-sm sm:text-base md:text-lg
                                istok-font text-white font-bold rounded-xl shadow-lg mt-4">
            Print
          </button>
        </div>
        <h1 className=" justify-self-center italic poppins-font font-extralight text-[#D9D9D9] content-center">Note:  Please take a screenshot of the  receipt 
and close the website as soon as you finished your slot confirmation.</h1>
      </div>
    </div>
  );
};

export default ScheduleReceipt;
