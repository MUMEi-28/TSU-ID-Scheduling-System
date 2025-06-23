import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RegistrationForm()
{
    const [registrationInputs, setRegistrationInputs] = useState({});

    function handleChange(event) 
    {
        const name = event.target.name;
        const value = event.target.value;

        console.log(name);
        console.log(value);

        setRegistrationInputs(values => ({ ...values, [name]: value }));
    }

    function handleSubmit(event)
    {
        event.preventDefault();

        // AXIOS PUT CODE HERE

        console.log(registrationInputs);
    }

    return (
        <div className='flex min-h-screen'>
            {/* Left Panel Form */}
            <div className='bg-gray-100 w-1/2 flex items-center justify-center'>
                <form action=""
                    onSubmit={handleSubmit}
                    className='p-8 shadow-lg bg-white w-3/4 max-w-md '>
                    <h1 className='font-bold text-3xl text-center mb-8'>Student Access</h1>

                    <div className='mb-4'>
                        <label htmlFor="" className='block font-medium'>Full Name</label>
                        <input type="text"
                            onChange={handleChange}
                            name="fullname"
                            placeholder='Marc Jersey Castro' /* AM LIVING MY MARK HERE :D */
                            className='border w-full border-gray-500 rounded-md px-3 py-2' />
                    </div>

                    <div className='mb-8'>
                        <label htmlFor="" className='block font-medium'>Student Number</label>
                        <input type="text"
                            onChange={handleChange}
                            name="student_number"
                            placeholder='2022300766' /* THIS IS LEGIT NUMBER */
                            className='border w-full px-2 py-3' />
                    </div>

                    <div className="flex justify-center">
                        {/*   <Link to='/schedule'> */}
                        <button type='submit' className='bg-blue-500 text-white py-2 px-12 rounded-2xl hover:bg-blue-600'>
                            Submit
                        </button>
                        {/* </Link> */}
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
