import React, { useState } from 'react'

import { idReasonOptions } from '../../constants/IdReasonOptions';
import { buildApiUrl, API_ENDPOINTS } from '../../../config/api';
import axios from 'axios';

export default function AddStudentModal(props)
{
    const [student, setStudent] = useState(
        {
            fullname: '',
            student_number: '',
            email: '',
            id_reason: '',
            data_privacy_agreed: true
        }
    )
    const [error, setError] = useState('');

    function handleChange(e)
    {
        const { name, value, type, checked } = e.target;

        setStudent(prev => (
            {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }
        ));

        console.log(student);
    }
    async function handleSubmit(e)
    {
        e.preventDefault();

        if (!student.fullname || !student.student_number || !student.email || !student.id_reason)
        {
            setError("All fields are required.");
            return;
        }

        try
        {
            await axios.post(buildApiUrl(API_ENDPOINTS.REGISTER), student, {
                headers: { 'Content-Type': 'application/json' }
            })
            props.onClose();
            props.onSuccess();
        } catch (err)
        {
            setError(err.response?.data?.message || 'Failed to add student.');
        }


        console.log("SUBMMITED WITHOUT ERRORS");
    }
    return (
        <div className='bg-black/50 fixed inset-0 z-[9999] flex items-center justify-center'>


            <div className='bg-white rounded-lg p-6 w-full mx-4 max-w-md flex-col shadow-2xl'>
                <h2 className='text-xl font-black mb-4 text-slate-700 text-center border-b'>Add Student</h2>
                <form action="POST" onSubmit={handleSubmit}>
                    <p className='mb-2'>
                        <label
                            className='block text-md '>Fullname</label>
                        <input
                            value={student.fullname}
                            name='fullname'
                            onChange={handleChange}
                            required
                            className='border p-2 rounded-md w-full'
                            type="text"
                            placeholder='Fullname' />
                    </p>
                    <p className='mb-2'>
                        <label
                            className='block text-md '>Student Number</label>
                        <input
                            value={student.student_number}
                            name='student_number'
                            onChange={handleChange}
                            required
                            className='border p-2 rounded-md w-full'
                            type="text"
                            placeholder='Student Number' />
                    </p>
                    <p className='mb-2'>
                        <label
                            className='block text-md '>Email</label>
                        <input
                            value={student.email}
                            name='email'
                            onChange={handleChange}
                            required
                            className='border p-2 rounded-md w-full'
                            type="email"
                            placeholder='Email' />
                    </p>

                    <p className='mb-2'>
                        <label className="block text-sm font-medium text-gray-700">ID Reason</label>
                        <select name="id_reason" className='border w-full p-2 rounded-md'
                            required
                            value={student.id_reason}
                            onChange={handleChange}>
                            <option value="">Select ID Reason</option>
                            {idReasonOptions.map(options => (
                                <option key={options.value}
                                    value={options.value}>
                                    {options.label}</option>
                            ))}
                        </select>
                    </p>


                    {error && <p className='text-red-700 font-semibold'>{error}</p>}
                    <div className='flex items-center justify-center gap-2'>
                        <button
                            className='bg-green-500 px-4 hover:bg-green-600 active:bg-green-400 py-2 text-white rounded-lg'>
                            Add Student
                        </button>

                        <button
                            onClick={props.onClose}
                            className='bg-gray-500 hover:bg-gray-600 active:bg-gray-400 px-4 py-2 text-white rounded-lg'>
                            Cancel
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
