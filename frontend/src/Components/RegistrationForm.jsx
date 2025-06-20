import React from 'react';

export default function RegistrationForm()
{
    return (
        <div className='flex min-h-screen'>
            {/* Left Panel Form */}
            <div className='bg-gray-100 w-1/2 flex items-center justify-center'>
                <form action=""
                    className='p-8 shadow-lg bg-white w-3/4 max-w-md '>
                    <h1 className='font-bold text-3xl text-center mb-8'>Student Access</h1>

                    <div className='mb-4'>
                        <label htmlFor="" className='block font-medium'>Full Name</label>
                        <input type="text"
                            placeholder='Juan Dela Cruz'
                            className='border w-full border-gray-500 rounded-md px-3 py-2' />
                    </div>

                    <div className='mb-8'>
                        <label htmlFor="" className='block font-medium'>Student Number</label>
                        <input type="text"
                            placeholder='2025300123'
                            className='border w-full px-2 py-3' />
                    </div>

                    <div className="flex justify-center">
                        <button type='submit' className='bg-blue-500 text-white py-2 px-12 rounded-2xl hover:bg-blue-600'>
                            Submit
                        </button>
                    </div>

                </form>
            </div>
            {/* Right Panel Form */}
            <div className='bg-gray-200 w-1/2 flex items-center justify-center '>

                <div className='bg-white p-6 rounded-md shadow-lg w-2/6 text-center'>
                    <h2 className='text-xl font-bold mb-6'>Notice</h2>

                    <p className='mb-2'>Lorem Ipsum</p>
                    <p className='mb-2'>Lorem Ipsum</p>
                    <p className='mb-2'>Lorem Ipsum</p>
                </div>
            </div>
        </div>
    );
}
