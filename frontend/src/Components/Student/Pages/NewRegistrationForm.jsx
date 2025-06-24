import React from 'react'

const NewRegistrationForm = () => {
  return (
    <div className='flex bg-[url(./Components/public/students-with-unif-tb.png)]'>

        <div className=' h-screen flex justify-center items-center sm:w-6/12'>

            <div className='w-7/12 h-3/6 rounded-xl flex-col flex justify-center items-center gap-y-7 relative '>
                <div className='w-full h-full bg-[#ECECEC] absolute z-10 rounded-xl opacity-[.83]'> </div>
                <div className='h-8 w-full bg-[#5C0101] rounded-t-xl absolute top-0 z-20 opacity-[.87]'>  </div>

                <div className='poppins-font text-[#5B0000] text-5xl font-medium tracking-[.001vw] mt-2 z-20'>
                        Student Access
                </div>
                <form action="" className='flex flex-col gap-y-6 w-10/12 justify-center items-center z-20'>
                    <div className='w-full'>
                    <label htmlFor="FullName" className=''>Full Name</label>
                    <input id="FullName" type="text" placeholder='Marc Jersey Castrorice' className='p-4 bg-[#BABABA] w-full ' />
                    </div>
                    
                    <div className='w-full'>
                    <label htmlFor="StudentNum" className=''>Student Number</label>
                    <input id='StudentNum' type="text" placeholder='2022300766' className='p-4 bg-[#BABABA] w-full' />
                    </div>
                     
                     <button type='submit' className='py-4 shadow-lg bg-[#CE9D31] w-4/12 istok-font text-white font-bold text-xl rounded-xl'>Enter</button>
                </form>

            </div>

        </div>

        <div className='sm:w-6/12 h-screen bg-[#4F0303] rounded-tl-[11vw] relative flex justify-center items-center'>

            <div className='flex flex-col justify-evenly items-center h-full w-6/8 text-white poppins-font z-20'>

                <div className='text-6xl font-bold'>
                    <h1>Welcome to TSU</h1>
                    <h1 className='text-[#CC9318]'>ID Scheduling System!</h1>
                </div>
                
                <div className='w-full flex items-start justify-start flex-col gap-y-10'>
                    <h1 className='text-4xl tracking-[.001vw]'>NOTICE</h1>
                    <p className='text-3xl text-[#AAAAAA]'> Lorem ipsum dolor sit amet, consectetur adipiscing elit,<u> Hugo is the best character in ZZZ and Lighter and Lycaon </u> et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    <p className='opacity-[.34] italic'>06-21-2025</p>
                </div>


            </div>

            <div className=' w-full h-full bg-linear-98 from-[#580000] from-13% via-[#95561C] via-80% to-[#3B0000] to-97% rounded-tl-[10vw] rounded-br-[17vw] hidden sm:block absolute z-10'></div>

        </div>
        
    </div>
  )
}

export default NewRegistrationForm
