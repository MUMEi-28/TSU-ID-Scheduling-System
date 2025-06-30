import React from 'react';
import { format } from 'date-fns';

const DownloadListModal = ({ students, onClose }) =>
{
    const handleDownload = () =>
    {
        // Prepare the data with basic fields
        let data = students
            .filter(student => student.id !== 1) // Exclude admin
            .map(student => ({
                'Name': student.fullname,
                'Student Number': student.student_number,
                'Schedule Date': student.schedule_date ? format(new Date(student.schedule_date), 'MMMM dd, yyyy') : 'Not scheduled',
                'Schedule Time': student.schedule_time || 'Not scheduled',
                'Status': student.status || 'pending',
                'Email': student.email || '',
                'Created Date': student.created_at ? format(new Date(student.created_at), 'MMMM dd, yyyy HH:mm') : '',
                'Privacy Agreed': student.privacy_agreed ? 'Yes' : 'No',
                'Updated Date': student.updated_at ? format(new Date(student.updated_at), 'MMMM dd, yyyy HH:mm') : '',
                'ID Reason': student.id_reason || ''
            }));


        /*   data = data.map((student, index) => ({
              ...student,
  'Email': students[index].email || '',
              'Created Date': students[index].created_at ? format(new Date(students[index].created_at), 'MMMM dd, yyyy HH:mm') : '',
              'Privacy Agreed': students[index].privacy_agreed ? 'Yes' : 'No',
              'Updated Date': students[index].updated_at ? format(new Date(students[index].updated_at), 'MMMM dd, yyyy HH:mm') : '',
              'ID Reason': students[index].id_reason || ''
          }));
   */
        // Create CSV content
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','), // header row
            ...data.map(row =>
                headers.map(fieldName =>
                    `"${String(row[fieldName]).replace(/"/g, '""')}"`
                ).join(',')
            )
        ].join('\n');

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `students_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (onClose) onClose();
    };

    return (
        <div className='fixed inset-0 min-h-screen bg-black/40 z-[999] flex items-center justify-center'>
            <div className='bg-white flex items-center justify-center w-full max-w-md flex-col rounded-lg shadow-2xl p-6'>
                <h1 className='text-2xl font-semibold mb-6'>Confirm Download</h1>
                <div className='flex flex-row items-center justify-center gap-5'>
                    <button
                        onClick={() => handleDownload()}
                        className='border py-2 px-4 rounded-lg bg-green-500 hover:bg-green-600 active:bg-green-400 text-white'>Download</button>
                    <button
                        onClick={onClose}
                        className='border py-2 px-4 rounded-lg bg-gray-500 hover:bg-gray-600 active:bg-gray-400 text-white'>Cancel</button>
                </div>
            </div>
        </div>
    );

};

export default DownloadListModal;