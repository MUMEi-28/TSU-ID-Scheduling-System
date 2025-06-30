import React, { useEffect, useState, lazy, Suspense, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import CustomDropdown from './CustomDropdown';
import kuruKuru from '../public/kurukuru-kururing.gif';
import { displayToCanonical, normalizeDate, getDisplayTimeSlots } from '../../utils/timeUtils';

import { format } from 'date-fns'


//Modals
const AddStudentModal = React.lazy(() => import('./Modals/AddStudentModal'));/* [AYAW GUMANA E - _ - FIX LATER] */
import SlotAdjustmentPanel from './Modals/SlotAdjustmentPanel';
import RescheduleModal from './Modals/RescheduleModal';
import CalendarModal from './Modals/CalendarModal'
import StudentDetailModal from './Modals/StudentDetailModal';
import EditStudentModal from './Modals/EditStudentModal';
import AdminHeader from './Components/AdminHeader';
import AdminFilters from './Components/AdminFilters';
import AdminTable from './Components/AdminTable';
import AdminPagination from './Components/AdminPagination';
import DownloadListModal from './Modals/DownloadListModal';

// Toast component
function Toast({ message, type, onClose })
{
    return (
        <div className={`fixed top-8 right-8 z-[9999] px-6 py-4 rounded-lg shadow-lg text-lg font-bold transition-all duration-300 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-600 text-white'}`}
            style={{ minWidth: '220px', maxWidth: '90vw' }}>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-2xl font-bold text-white/80 hover:text-white">&times;</button>
        </div>
    );
}

const AdminPage = (props) =>
{
    const location = useLocation();
    const [showCalendar, setShowCalendar] = useState(false);
    const [showList, setShowList] = useState(true);
    const [placeHolderDate, setPlaceHolderDate] = useState("No Date Chosen");
    const [selectedTime, setSelectedTime] = useState("No Time Chosen");
    const [students, setStudents] = useState([]);
    const [showChangeCredentials, setShowChangeCredentials] = useState(false);
    const [adminFullname, setAdminFullname] = useState("");
    const [adminStudentNumber, setAdminStudentNumber] = useState("");
    const [changeStatus, setChangeStatus] = useState("");
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [editRowId, setEditRowId] = useState(null);
    const [editData, setEditData] = useState({});
    const [slotAdjustmentPanel, setSlotAdjustmentPanel] = useState(false);
    const [selectedTimeforAdjustment, setSelectedTimeForAdjustment] = useState("No Time Chosen");
    const [slotAdjustmentDate, setSlotAdjustmentDate] = useState(null);
    const [currentMaxCapacity, setCurrentMaxCapacity] = useState(null);

    // New state for modals
    const [detailModal, setDetailModal] = useState({ show: false, student: null });
    const [editModal, setEditModal] = useState({ show: false, student: null, data: {} });

    // Toast state
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    // Confirmation modal state
    const [confirmModal, setConfirmModal] = useState({ show: false, action: null, payload: null, message: '' });
    // Search/filter/pagination state
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(1);
    const perPage = 10;
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [rescheduleStudent, setRescheduleStudent] = useState(null);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTime, setRescheduleTime] = useState('8:00am - 9:00am');
    const [showAllStudents, setShowAllStudents] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);

    // Header state
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // ID reason options for editing
    const idReasonOptions = [
        { value: 're_id', label: 'Re-ID' },
        { value: 'lost_id', label: 'Lost ID' },
        { value: 'masters_doctors_law', label: 'Masters/Doctors/School of Law' }
    ];

    const toggleMenu = () =>
    {
        setIsMenuOpen(!isMenuOpen);
    };

    // Add sorting state
    const [sortBy, setSortBy] = useState('fullname');
    const [sortDirection, setSortDirection] = useState('asc');

    // Sorting function
    const sortStudents = (studentsArr) =>
    {
        // Helper to convert time slot to minutes since midnight
        const timeToMinutes = (timeStr) =>
        {
            if (!timeStr || timeStr === 'Not scheduled') return null;
            // Example: '8:00am - 9:00am' => 480
            const match = timeStr.match(/(\d{1,2}):(\d{2})(am|pm)/i);
            if (!match) return null;
            let [_, hour, minute, period] = match;
            hour = parseInt(hour, 10);
            minute = parseInt(minute, 10);
            if (period.toLowerCase() === 'pm' && hour !== 12) hour += 12;
            if (period.toLowerCase() === 'am' && hour === 12) hour = 0;
            return hour * 60 + minute;
        };
        return [...studentsArr].sort((a, b) =>
        {
            let aValue = a[sortBy] || '';
            let bValue = b[sortBy] || '';
            // Always put 'Not scheduled' or empty at the bottom for date/time columns
            if (sortBy === 'schedule_date' || sortBy === 'schedule_time')
            {
                const isANotScheduled = !aValue || aValue === 'Not scheduled';
                const isBNotScheduled = !bValue || bValue === 'Not scheduled';
                if (isANotScheduled && !isBNotScheduled) return 1;
                if (!isANotScheduled && isBNotScheduled) return -1;
                if (isANotScheduled && isBNotScheduled) return 0;
                // For date, compare as Date
                if (sortBy === 'schedule_date')
                {
                    aValue = new Date(aValue);
                    bValue = new Date(bValue);
                } else if (sortBy === 'schedule_time')
                {
                    aValue = timeToMinutes(aValue);
                    bValue = timeToMinutes(bValue);
                } else
                {
                    aValue = aValue.toString().toLowerCase();
                    bValue = bValue.toString().toLowerCase();
                }
            } else
            {
                aValue = aValue.toString().toLowerCase();
                bValue = bValue.toString().toLowerCase();
            }
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    // Fetch students from backend on mount
    useEffect(() =>
    {
        setIsLoading(true);
        const cacheKey = 'admin_students_cache';
        const cache = localStorage.getItem(cacheKey);
        let shouldFetch = true;

        if (cache)
        {
            const { data, timestamp } = JSON.parse(cache);
            if (Date.now() - timestamp < 30000)
            { // 30 seconds
                setStudents(data);
                shouldFetch = false;
                setTimeout(() => setIsLoading(false), 0); // IBALIK SA 5000 LATER
            }
        }

        if (shouldFetch)
        {
            axios.get(buildApiUrl(API_ENDPOINTS.GET_STUDENTS))
                .then(response =>
                {
                    setStudents(response.data);
                    localStorage.setItem(cacheKey, JSON.stringify({ data: response.data, timestamp: Date.now() }));
                    setTimeout(() => setIsLoading(false), 0); // IBALIK SA 5000 LATER
                })
                .catch(error =>
                {
                    console.error('Failed to fetch students:', error);
                    setToast({ show: true, message: 'Failed to fetch students', type: 'error' });
                    setTimeout(() => setIsLoading(false), 0); // IBALIK SA 5000 LATER
                });
        }
    }, []);

    // Auto-dismiss toast after 3 seconds
    useEffect(() =>
    {
        if (toast.show)
        {
            const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // Modal functions
    const showStudentDetails = (student) =>
    {
        setDetailModal({ show: true, student });
    };

    const showEditModal = (student) =>
    {
        setEditModal({
            show: true,
            student,
            data: {
                fullname: student.fullname,
                student_number: student.student_number,
                email: student.email || '',
                id_reason: student.id_reason || 're_id',
                status: student.status || 'pending'
            }
        });
    };

    const handleEditChange = (e) =>
    {
        const { name, value, type, checked } = e.target;
        setEditModal(prev => ({
            ...prev,
            data: {
                ...prev.data,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    const handleEditSave = async (data, setError) =>
    {
        setIsLoading(true);
        try
        {
            const response = await axios.put(buildApiUrl(API_ENDPOINTS.INDEX), data, {
                headers: { 'Content-Type': 'application/json' }
            });
            // Refresh the students list if successful
            if (response.data && response.data.status === 1)
            {
                invalidateStudentCache();
                const studentsRes = await axios.get(buildApiUrl(API_ENDPOINTS.GET_STUDENTS));
                setStudents(studentsRes.data);
                localStorage.setItem('admin_students_cache', JSON.stringify({
                    data: studentsRes.data,
                    timestamp: Date.now()
                }));
            }
            return response.data;
        } catch (err)
        {
            if (err.response && err.response.data && err.response.data.message)
            {
                setError(err.response.data.message);
                return err.response.data;
            } else
            {
                setError('Failed to update student. Please try again.');
                return { status: 0, message: 'Failed to update student. Please try again.' };
            }
        } finally
        {
            setIsLoading(false);
        }
    };

    // Existing functions (keep all your existing functions here)
    const HandleShowList = () => setShowList(true);
    const HandleShowAddStudent = () =>
    {
        setShowAddStudent(true);
        console.log("Add Student Pressed");
    }

    const handleDownloadList = () =>
    {
        setShowList(false);

        if (showAllStudents)
        {
            setToast({ show: true, message: 'Generating complete student list...', type: 'success' });
            downloadAllStudentsData();
        } else
        {
            const monthName = new Date(0, currentScheduleMonth).toLocaleString('en-US', { month: 'long' });
            setToast({ show: true, message: `Generating list for ${monthName} ${currentScheduleYear}${currentScheduleTime !== 'all' ? ', ' + currentScheduleTime : ''}`, type: 'success' });
            downloadFilteredStudentsData();
        }
    };

    const downloadAllStudentsData = () =>
    {

        console.log("PRESSED DOWNLOAD LIST");

        const allStudents = students.filter(student => student.id !== 1);
        const csvData = [
            ['Name', 'Student Number', 'Email', 'ID Reason', 'Date', 'Time', 'Status'],
            ...allStudents.map(student => [
                student.fullname,
                student.student_number,
                student.email || 'N/A',
                student.id_reason || 'N/A',
                student.schedule_date || 'Not scheduled',
                student.schedule_time || 'Not scheduled',
                student.status || 'pending'
            ])
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all_students_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };


    const downloadFilteredStudentsData = () =>
    {
        const filteredData = students.filter(student =>
        {
            if (student.id === 1) return false;
            if (!student.schedule_date) return false;
            const dateObj = new Date(student.schedule_date);
            const matchesMonth = dateObj.getMonth() === currentScheduleMonth && dateObj.getFullYear() === currentScheduleYear;
            const matchesTime = currentScheduleTime === 'all' || student.schedule_time === currentScheduleTime;
            return matchesMonth && matchesTime;
        });
        const monthName = new Date(0, currentScheduleMonth).toLocaleString('en-US', { month: 'long' });
        const csvData = [
            ['Name', 'Student Number', 'Email', 'ID Reason', 'Date', 'Time', 'Status'],
            ...filteredData.map(student => [
                student.fullname,
                student.student_number,
                student.email || 'N/A',
                student.id_reason || 'N/A',
                student.schedule_date,
                student.schedule_time,
                student.status || 'pending'
            ])
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${monthName}_${currentScheduleYear}${currentScheduleTime !== 'all' ? '_' + currentScheduleTime.replace(/\s+/g, '') : ''}_students.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const HandleDateReplace = () =>
    {
        setShowCalendar(false);
        const realDate = new Date(selectedCalendarDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        setCurrentScheduleDate(realDate);
        setIsFiltering(true);
        setTimeout(() => setIsFiltering(false), 2000);
    };

    useEffect(() =>
    {
        const urlSegments = location.pathname.split('/');
        const dateNumerical = urlSegments[urlSegments.length - 1];
        const dateObject = new Date(dateNumerical);
        const realDate = dateObject.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        setPlaceHolderDate(realDate);
    }, [location.pathname]);

    // Add month/year state for filtering
    const [currentScheduleMonth, setCurrentScheduleMonth] = useState(new Date().getMonth()); // 0-indexed
    const [currentScheduleYear, setCurrentScheduleYear] = useState(new Date().getFullYear());
    const [currentScheduleDay, setCurrentScheduleDay] = useState(new Date().getDate());
    const [currentScheduleTime, setCurrentScheduleTime] = useState('all');



    // DITO OR YUNG FILTERED DATA PAG IEEDIT YUNG NOT SCHEDULED PROBLEM
    // Update filteredStudents to filter by month/year if not showing all students
    // Update filteredStudents to filter by month/year/day if not showing all students
    const filteredStudents = students.filter(student =>
    {
        if (
            student.id === 1 ||
            (adminFullname && student.fullname === adminFullname) ||
            (adminStudentNumber && student.student_number === adminStudentNumber)
        ) return false;
        // Exclude students with "Not scheduled" or empty/null schedule_date
        if (!student.schedule_date || student.schedule_date === 'Not scheduled')
        {
            return false;
        }

        const matchesSearch = student.fullname.toLowerCase().includes(search.toLowerCase()) ||
            student.student_number.includes(search) ||
            (student.email && student.email.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
        let matchesMonth = true;
        let matchesYear = true;
        let matchesDay = true;
        let matchesTime = true;

        // DATE COMPARISON
        if (!showAllStudents && student.schedule_date)
        {
            const dateObj = new Date(student.schedule_date);

            matchesMonth = currentScheduleMonth === 'all' || dateObj.getMonth() === Number(currentScheduleMonth);
            matchesYear = currentScheduleYear === 'all' || dateObj.getFullYear() === Number(currentScheduleYear);
            if (currentScheduleDay !== 'all')
            {
                matchesDay = dateObj.getDate() === Number(currentScheduleDay);
            }

        }

        // TIME COMPARISON
        const normalizedCurrentTime = currentScheduleTime.replace(/\s+/g, '');
        if (!showAllStudents && student.schedule_time)
        {
            matchesTime = currentScheduleTime === 'all' || student.schedule_time === normalizedCurrentTime;
        }
        //   console.log("SELECTED: " + normalizedCurrentTime + "  COMPARE: " + student.schedule_time);
        return matchesSearch && matchesStatus && matchesMonth && matchesYear && matchesDay && matchesTime;
    });

    // Apply sorting before pagination
    const sortedFilteredStudents = sortStudents(filteredStudents);
    const sortedAllStudentsList = sortStudents(students.filter(student => student.id !== 1));

    const totalPages = Math.ceil(sortedFilteredStudents.length / perPage);
    const startIndex = (page - 1) * perPage;
    const paginatedStudents = sortedFilteredStudents.slice(startIndex, startIndex + perPage);

    const totalAllPages = Math.ceil(sortedAllStudentsList.length / perPage);
    const studentsToShow = showAllStudents
        ? sortedAllStudentsList.slice((page - 1) * perPage, (page - 1) * perPage + perPage)
        : paginatedStudents;
    const totalPagesToShow = showAllStudents ? totalAllPages : totalPages;

    // Sorting handler
    const handleSort = (column) =>
    {
        if (sortBy === column)
        {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else
        {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    // Existing CRUD functions (keep all your existing functions)
    const handleOpenChangeCredentials = () =>
    {
        setShowChangeCredentials(true);
        setChangeStatus("");
    };

    const handleCloseChangeCredentials = () =>
    {
        setShowChangeCredentials(false);
        setChangeStatus("");
    };

    const handleChangeCredentials = async (e) =>
    {
        e.preventDefault();
        setChangeStatus("");
        try
        {
            const response = await axios.post(buildApiUrl(API_ENDPOINTS.UPDATE_ADMIN), {
                fullname: adminFullname,
                student_number: adminStudentNumber
            });
            if (response.data.status === 1)
            {
                setChangeStatus("Credentials updated successfully!");
                setShowSuccessPopup(true);
                setTimeout(() =>
                {
                    setShowSuccessPopup(false);
                    handleCloseChangeCredentials();
                }, 2000);
                setToast({ show: true, message: 'Admin credentials updated!', type: 'success' });
            } else
            {
                setChangeStatus(response.data.message || "Failed to update credentials.");
                setToast({ show: true, message: response.data.message || 'Failed to update credentials', type: 'error' });
            }
        } catch (err)
        {
            setChangeStatus("Error updating credentials.");
            setToast({ show: true, message: 'Error updating credentials', type: 'error' });
        }
    };

    const handleLogoutClick = () =>
    {
        setConfirmModal({
            show: true,
            action: () =>
            {
                setToast({ show: true, message: 'You have been logged out.', type: 'success' });
                if (props.handleLogout) props.handleLogout();
            },
            payload: null,
            message: 'Are you sure you want to log out?'
        });
    };

    const handleEditClick = (student) =>
    {
        setEditRowId(student.id);
        setEditData({ ...student });
    };

    const handleEditChangeOld = (e) =>
    {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleEditSaveOld = async () =>
    {
        setConfirmModal({
            show: true,
            action: async () =>
            {
                setIsLoading(true);
                try
                {
                    const updateData = {
                        id: editData.id,
                        fullname: editData.fullname,
                        student_number: editData.student_number
                    };

                    await axios.put(buildApiUrl(API_ENDPOINTS.INDEX), updateData, {
                        headers: { 'Content-Type': 'application/json' }
                    });
                    setEditRowId(null);
                    setToast({ show: true, message: 'Student updated successfully!', type: 'success' });
                    invalidateStudentCache();
                    axios.get(buildApiUrl(API_ENDPOINTS.GET_STUDENTS))
                        .then(response =>
                        {
                            setStudents(response.data);
                            localStorage.setItem('admin_students_cache', JSON.stringify({ data: response.data, timestamp: Date.now() }));
                            setTimeout(() => setIsLoading(false), 2000);
                        });
                } catch (err)
                {
                    setToast({ show: true, message: 'Failed to update student', type: 'error' });
                    setTimeout(() => setIsLoading(false), 2000);
                }
            },
            payload: null,
            message: 'Are you sure you want to save these changes?'
        });
    };

    const handleEditCancel = () =>
    {
        setEditRowId(null);
        setEditData({});
    };

    const handleDelete = (id) =>
    {
        setConfirmModal({
            show: true,
            action: async () =>
            {
                setIsLoading(true);
                try
                {
                    await axios.delete(buildApiUrl(API_ENDPOINTS.INDEX), {
                        data: { id },
                        headers: { 'Content-Type': 'application/json' }
                    });
                    setToast({ show: true, message: 'Student deleted successfully!', type: 'success' });
                    invalidateStudentCache();
                    axios.get(buildApiUrl(API_ENDPOINTS.GET_STUDENTS))
                        .then(response =>
                        {
                            setStudents(response.data);
                            localStorage.setItem('admin_students_cache', JSON.stringify({ data: response.data, timestamp: Date.now() }));
                            setTimeout(() => setIsLoading(false), 2000);
                        });
                } catch (err)
                {
                    setToast({ show: true, message: 'Failed to delete student', type: 'error' });
                    setTimeout(() => setIsLoading(false), 2000);
                }
            },
            payload: null,
            message: 'Are you sure you want to delete this student? This action cannot be undone.'
        });
    };

    const handleToggleStatus = async (student) =>
    {
        // Always normalize before API calls
        const canonicalDate = normalizeDate(student.schedule_date);
        const canonicalTime = displayToCanonical(student.schedule_time);
        const newStatus = student.status === 'done' ? 'pending' : 'done';
        await axios.put(buildApiUrl(API_ENDPOINTS.INDEX), { ...student, schedule_date: canonicalDate, schedule_time: canonicalTime, status: newStatus }, {
            headers: { 'Content-Type': 'application/json' }
        });
        invalidateStudentCache();
        axios.get(buildApiUrl(API_ENDPOINTS.GET_STUDENTS))
            .then(response =>
            {
                setStudents(response.data);
                localStorage.setItem('admin_students_cache', JSON.stringify({ data: response.data, timestamp: Date.now() }));
            });
        setToast({ show: true, message: `Student marked as ${newStatus}`, type: 'success' });
    };

    const handleMarkCancelled = async (student) =>
    {
        setConfirmModal({
            show: true,
            action: async () =>
            {
                try
                {
                    // Always normalize before API calls
                    const canonicalDate = normalizeDate(student.schedule_date);
                    const canonicalTime = displayToCanonical(student.schedule_time);
                    await axios.put(buildApiUrl(API_ENDPOINTS.INDEX), { ...student, schedule_date: canonicalDate, schedule_time: canonicalTime, status: 'cancelled' }, {
                        headers: { 'Content-Type': 'application/json' }
                    });
                    setToast({ show: true, message: 'Student marked as cancelled', type: 'success' });
                    invalidateStudentCache();
                    axios.get(buildApiUrl(API_ENDPOINTS.GET_STUDENTS))
                        .then(response =>
                        {
                            setStudents(response.data);
                            localStorage.setItem('admin_students_cache', JSON.stringify({ data: response.data, timestamp: Date.now() }));
                        });
                } catch (err)
                {
                    setToast({ show: true, message: 'Failed to mark student as cancelled', type: 'error' });
                }
            },
            payload: null,
            message: 'Are you sure you want to mark this student as cancelled?'
        });
    };

    const handleReschedule = (student) =>
    {
        setRescheduleStudent(student);
        setRescheduleDate(student.schedule_date || '');
        setRescheduleTime(student.schedule_time || '8:00am - 9:00am');
        setShowRescheduleModal(true);
    };

    const handleRescheduleSave = async () =>
    {
        if (!rescheduleDate || !rescheduleTime)
        {
            setToast({ show: true, message: 'Please select both date and time', type: 'error' });
            return;
        }

        try
        {
            // Always normalize before API calls
            const canonicalDate = normalizeDate(rescheduleDate);
            const canonicalTime = displayToCanonical(rescheduleTime);
            // Check slot availability first
            const slotResponse = await axios.get(buildApiUrl(API_ENDPOINTS.GET_SLOT_COUNT), {
                params: {
                    schedule_date: canonicalDate,
                    schedule_time: canonicalTime
                }
            });

            if (slotResponse.data.count >= (slotResponse.data.max_capacity || 12))
            {
                setToast({ show: true, message: 'Selected slot is already full. Please choose another slot.', type: 'error' });
                return;
            }

            // Proceed with rescheduling
            await axios.put(buildApiUrl(API_ENDPOINTS.INDEX), {
                ...rescheduleStudent,
                schedule_date: canonicalDate,
                schedule_time: canonicalTime,
                status: 'pending'
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            setToast({ show: true, message: 'Student rescheduled successfully', type: 'success' });
            setShowRescheduleModal(false);
            setRescheduleStudent(null);
            setRescheduleDate('');
            setRescheduleTime('8:00am - 9:00am');

            invalidateStudentCache();
            axios.get(buildApiUrl(API_ENDPOINTS.GET_STUDENTS))
                .then(response =>
                {
                    setStudents(response.data);
                    localStorage.setItem('admin_students_cache', JSON.stringify({ data: response.data, timestamp: Date.now() }));
                });
        } catch (err)
        {
            const errorMessage = err.response?.data?.message || 'Failed to reschedule student';
            setToast({ show: true, message: errorMessage, type: 'error' });
        }
    };

    const handleRescheduleCancel = () =>
    {
        setShowRescheduleModal(false);
        setRescheduleStudent(null);
        setRescheduleDate('');
        setRescheduleTime('8:00am - 9:00am');
    };

    const handleDateChange = (e) =>
    {
        const date = new Date(e.target.value);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        setRescheduleDate(formattedDate);

        console.log("HANDLE DATE CHANGE: " + formattedDate);
    };

    const invalidateStudentCache = () =>
    {
        localStorage.removeItem('admin_students_cache');
    };

    // Confirmation Modal
    const ConfirmModal = ({ show, message, onConfirm, onCancel }) => show ? (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.15)' }}>
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-4 text-center">Confirmation</h2>
                <p className="mb-6 text-center text-lg">{message}</p>
                <div className="flex gap-6 justify-center">
                    <button onClick={onConfirm} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-lg hover:bg-green-800">Yes</button>
                    <button onClick={onCancel} className="bg-gray-400 text-white px-6 py-2 rounded-lg font-bold text-lg hover:bg-gray-600">No</button>
                </div>
            </div>
        </div>
    ) : null;

    // Calculate pagination with sliding window
    const getPaginationRange = () =>
    {
        const windowSize = 5;
        const halfWindow = Math.floor(windowSize / 2);

        let startPage = Math.max(1, page - halfWindow);
        let endPage = Math.min(totalPages, startPage + windowSize - 1);

        if (endPage - startPage < windowSize - 1)
        {
            startPage = Math.max(1, endPage - windowSize + 1);
        }

        return { startPage, endPage };
    };

    const { startPage, endPage } = getPaginationRange();

    const handleMonthChange = (e) =>
    {
        setCurrentScheduleMonth(Number(e.target.value));
        setShowAllStudents(false);
    };
    const handleYearChange = (e) =>
    {
        setCurrentScheduleYear(Number(e.target.value));
        setShowAllStudents(false);
    };

    const handleOpenSlotAdjustmentPanel = () =>
    {
        setSlotAdjustmentPanel(true);
    }

    const handleCloseSlotAdjustmentPanel = () =>
    {
        setSlotAdjustmentDate(null);
        setSelectedTimeForAdjustment("No Time Chosen");
        setCurrentMaxCapacity(null);
        setSlotAdjustmentPanel(false);
    }

    const formatDateLocal = (date) =>
    {
        if (typeof date === 'string') date = new Date(date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchMaxCapacity = async (slotAdjustmentDate, selectedTimeforAdjustment) =>
    {
        if (!slotAdjustmentDate || !selectedTimeforAdjustment || selectedTimeforAdjustment === 'No Time Chosen')
        {
            setCurrentMaxCapacity(null);
            return null;
        }
        let formattedDate = slotAdjustmentDate;
        if (slotAdjustmentDate instanceof Date || (typeof slotAdjustmentDate === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(slotAdjustmentDate)))
        {
            formattedDate = formatDateLocal(slotAdjustmentDate);
        }
        try
        {
            const response = await axios.get(buildApiUrl(API_ENDPOINTS.GET_MAX_SLOT_COUNT), {
                params: {
                    schedule_date: formattedDate,
                    schedule_time: displayToCanonical(selectedTimeforAdjustment) // Send canonical format to backend
                }
            });
            console.log('[DEBUG] fetchMaxCapacity API response:', response.data);
            setCurrentMaxCapacity(response.data.max_capacity); // <-- set state here
            return response.data.max_capacity;
        } catch (error)
        {
            console.error('[DEBUG] fetchMaxCapacity API error:', error);
            setCurrentMaxCapacity(null); // clear on error
            return null;
        }
    };

    const handleSlotAdjustment = async (action) =>
    {
        if (!slotAdjustmentDate || !selectedTimeforAdjustment || selectedTimeforAdjustment === 'No Time Chosen')
        {
            setToast({ show: true, message: 'Please select both date and time', type: 'error' });
            return;
        }
        let formattedDate = slotAdjustmentDate;
        if (slotAdjustmentDate instanceof Date || (typeof slotAdjustmentDate === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(slotAdjustmentDate)))
        {
            formattedDate = formatDateLocal(slotAdjustmentDate);
        }
        let timeString = selectedTimeforAdjustment;
        console.log('[DEBUG] handleSlotAdjustment called with:', { formattedDate, timeString, action });
        try
        {
            const response = await axios.post(buildApiUrl(API_ENDPOINTS.ADJUST_SLOT_LIMIT), {
                schedule_date: formattedDate,
                schedule_time: displayToCanonical(timeString), // Send canonical format to backend
                action: action // 'increase' or 'decrease'
            });
            console.log('[DEBUG] handleSlotAdjustment API response:', response.data);
            if (response.data.success)
            {
                // Refetch the new max capacity
                fetchMaxCapacity(formattedDate, selectedTimeforAdjustment);
                setToast({ show: true, message: `Slot capacity ${action === 'increase' ? 'increased' : 'decreased'}!`, type: 'success' });
            } else
            {
                setToast({ show: true, message: response.data.error || 'Failed to update slot capacity', type: 'error' });
            }
        } catch (error)
        {
            console.error('[DEBUG] handleSlotAdjustment API error:', error);
            setToast({ show: true, message: 'Server error adjusting slot capacity', type: 'error' });
        }
    };

    // Bulk selection state
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    // Handler to select/deselect a single student
    const handleSelectStudent = (id) =>
    {
        setSelectedStudentIds((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };
    // Handler to select/deselect all students on current page
    const handleSelectAll = (studentsOnPage) =>
    {
        const pageIds = studentsOnPage.map((s) => s.id);
        const allSelected = pageIds.every((id) => selectedStudentIds.includes(id));
        if (allSelected)
        {
            setSelectedStudentIds((prev) => prev.filter((id) => !pageIds.includes(id)));
        } else
        {
            setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...pageIds])));
        }
    };
    // Handler to clear selection
    const clearSelection = () => setSelectedStudentIds([]);

    // Bulk action handlers
    const handleBulkDelete = async () =>
    {
        if (!selectedStudentIds.length) return;
        setIsLoading(true);
        try
        {
            await Promise.all(selectedStudentIds.map(id =>
                axios.delete(buildApiUrl(API_ENDPOINTS.INDEX), {
                    data: { id },
                    headers: { 'Content-Type': 'application/json' }
                })
            ));
            setToast({ show: true, message: 'Selected students deleted!', type: 'success' });
            clearSelection();
            invalidateStudentCache();
            const response = await axios.get(buildApiUrl(API_ENDPOINTS.GET_STUDENTS));
            setStudents(response.data);
            localStorage.setItem('admin_students_cache', JSON.stringify({ data: response.data, timestamp: Date.now() }));
        } catch (err)
        {
            setToast({ show: true, message: 'Failed to delete selected students', type: 'error' });
        } finally
        {
            setIsLoading(false);
        }
    };
    const handleBulkMarkDone = async () =>
    {
        if (!selectedStudentIds.length) return;
        setIsLoading(true);
        try
        {
            await Promise.all(selectedStudentIds.map(id =>
            {
                const student = students.find(s => s.id === id);
                return axios.put(buildApiUrl(API_ENDPOINTS.INDEX), { ...student, status: 'done' }, { headers: { 'Content-Type': 'application/json' } });
            }));
            setToast({ show: true, message: 'Selected students marked as done!', type: 'success' });
            clearSelection();
            invalidateStudentCache();
            const response = await axios.get(buildApiUrl(API_ENDPOINTS.GET_STUDENTS));
            setStudents(response.data);
            localStorage.setItem('admin_students_cache', JSON.stringify({ data: response.data, timestamp: Date.now() }));
        } catch (err)
        {
            setToast({ show: true, message: 'Failed to mark selected students as done', type: 'error' });
        } finally
        {
            setIsLoading(false);
        }
    };
    const handleBulkMarkCancelled = async () =>
    {
        if (!selectedStudentIds.length) return;
        setIsLoading(true);
        try
        {
            await Promise.all(selectedStudentIds.map(id =>
            {
                const student = students.find(s => s.id === id);
                return axios.put(buildApiUrl(API_ENDPOINTS.INDEX), { ...student, status: 'cancelled' }, { headers: { 'Content-Type': 'application/json' } });
            }));
            setToast({ show: true, message: 'Selected students marked as cancelled!', type: 'success' });
            clearSelection();
            invalidateStudentCache();
            const response = await axios.get(buildApiUrl(API_ENDPOINTS.GET_STUDENTS));
            setStudents(response.data);
            localStorage.setItem('admin_students_cache', JSON.stringify({ data: response.data, timestamp: Date.now() }));
        } catch (err)
        {
            setToast({ show: true, message: 'Failed to mark selected students as cancelled', type: 'error' });
        } finally
        {
            setIsLoading(false);
        }
    };

    // BulkActionBar component
    const BulkActionBar = ({ count, onDelete, onDone, onCancel, onClear }) => (
        <div className="mb-2 flex flex-wrap items-center justify-between bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-2 shadow">
            <span className="font-bold text-yellow-900">Bulk Actions: {count} selected</span>
            <div className="flex gap-2 ml-auto">
                <button onClick={onDelete} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded font-bold">Delete</button>
                <button onClick={onDone} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-bold">Mark as Done</button>
                <button onClick={onCancel} className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded font-bold">Mark as Cancelled</button>
                <button onClick={onClear} className="bg-yellow-300 hover:bg-yellow-400 text-yellow-900 px-3 py-1 rounded font-bold border border-yellow-500">Clear</button>
            </div>
        </div>
    );

    // Add state for bulk confirm modal
    const [bulkConfirm, setBulkConfirm] = useState({ show: false, action: null, message: '' });

    // Wrap bulk actions with confirmation
    const confirmBulkDelete = () => setBulkConfirm({ show: true, action: handleBulkDelete, message: `Are you sure you want to delete ${selectedStudentIds.length} selected students? This action cannot be undone.` });
    const confirmBulkMarkCancelled = () => setBulkConfirm({ show: true, action: handleBulkMarkCancelled, message: `Are you sure you want to mark ${selectedStudentIds.length} selected students as cancelled?` });

    // Add this function to reset filters and show all students
    const handleShowAllStudents = () =>
    {
        setSearch('');
        setFilterStatus('all');
        setCurrentScheduleMonth('all');
        setCurrentScheduleYear('all');
        setCurrentScheduleDay('all');
        setCurrentScheduleTime('all');
        setShowAllStudents(true);
    };

    const rescheduleModalRef = useRef();

    // When a date is picked in the calendar modal for reschedule, update date and fetch slot data
    const handleRescheduleDatePicked = (dateString) =>
    {
        setRescheduleDate(dateString);
        if (rescheduleModalRef.current && rescheduleModalRef.current.fetchSlotCounts)
        {
            rescheduleModalRef.current.fetchSlotCounts(dateString);
        }
    };

    return (
        <div className="min-h-screen w-full overflow-x-hidden flex flex-col "> {/* TANGGLAIN BG BLACK LATER */}

            <AdminHeader
                HandleShowAddStudent={HandleShowAddStudent}
                HandleShowList={HandleShowList}
                handleLogoutClick={handleLogoutClick}
                toggleMenu={toggleMenu}
                isMenuOpen={isMenuOpen}
            /*  HandleChangeDate={} */ // ERROR FIX LATER NAWAWALA YUNG FUCNTION -_-
            />

            {/* Loading Overlay - Initial Load */}
            {
                isLoading && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-12 flex flex-col items-center shadow-xl">
                            <img src={kuruKuru} alt="Loading..." className="w-24 h-24 mb-6" />
                            <p className="text-2xl font-semibold text-gray-700 mb-2">Loading students...</p>
                            <p className="text-sm text-gray-500">Please wait while we fetch the data</p>
                        </div>
                    </div>
                )
            }

            {/* Filtering Overlay - When changing date/time */}
            {
                isFiltering && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
                        <div className="bg-white rounded-lg p-10 flex flex-col items-center shadow-xl">
                            <img src={kuruKuru} alt="Filtering..." className="w-20 h-20 mb-4" />
                            <p className="text-xl font-semibold text-gray-700 mb-2">Filtering students...</p>
                            <p className="text-base text-gray-500">
                                {currentScheduleDate !== "No Date Chosen"
                                    ? `${currentScheduleDate}, ${currentScheduleTime}`
                                    : 'Loading all students...'}
                            </p>
                        </div>
                    </div>
                )
            }

            {/* Toast Notification */}
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

            {/* Confirmation Modal */}
            <ConfirmModal
                show={confirmModal.show}
                message={confirmModal.message}
                onConfirm={async () =>
                {
                    setConfirmModal({ ...confirmModal, show: false });
                    if (typeof confirmModal.action === 'function') await confirmModal.action();
                }}
                onCancel={() => setConfirmModal({ ...confirmModal, show: false })}
            />
            {showList && (
                <DownloadListModal
                    students={students}
                    onClose={() => setShowList(false)}
                />
            )}

            {showAddStudent && (
                <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 text-white text-xl z-[9999]">Loading Add Form...</div>}>
                    <AddStudentModal
                        onClose={() => setShowAddStudent(false)}
                        onSuccess={() =>
                        {
                            invalidateStudentCache();
                            axios.get(buildApiUrl(API_ENDPOINTS.GET_STUDENTS))
                                .then(response =>
                                {
                                    setStudents(response.data);
                                    localStorage.setItem('admin_students_cache', JSON.stringify({
                                        data: response.data,
                                        timestamp: Date.now()
                                    }));
                                    setToast({ show: true, message: 'Student added successfully', type: 'success' });
                                })
                                .catch(() => setToast({ show: true, message: 'Failed to refresh student list', type: 'error' }));
                        }}
                    />
                </Suspense>
            )}


            {/* Detail Modal */}
            {
                detailModal.show && (
                    <StudentDetailModal
                        setDetailModal={setDetailModal}
                        detailModal={detailModal}
                        showEditModal={showEditModal}
                    />
                )
            }

            {/* Edit Modal */}
            {
                editModal.show && (
                    <EditStudentModal
                        setEditModal={setEditModal}
                        handleEditSave={handleEditSave}
                        editModal={editModal}
                        handleEditChange={handleEditChange}
                        idReasonOptions={idReasonOptions}
                    />
                )
            }

            {slotAdjustmentPanel && (
                <SlotAdjustmentPanel
                    setShowCalendar={setShowCalendar}  // Fixed from setShowAddStudent to setShowCalendar
                    handleCloseSlotAdjustmentPanel={handleCloseSlotAdjustmentPanel}  // Fixed typo "andle" to "handle"
                    slotAdjustmentDate={slotAdjustmentDate}
                    selectedTimeforAdjustment={selectedTimeforAdjustment}
                    setSelectedTimeForAdjustment={setSelectedTimeForAdjustment}
                    fetchMaxCapacity={fetchMaxCapacity}
                    handleSlotAdjustment={handleSlotAdjustment}
                    currentMaxCapacity={currentMaxCapacity}
                />
            )}

            {/* Reschedule Modal */}
            {showRescheduleModal && (
                <RescheduleModal
                    innerRef={rescheduleModalRef}
                    rescheduleDate={rescheduleDate}
                    setRescheduleDate={setRescheduleDate}
                    setShowCalendar={setShowCalendar}
                    rescheduleTime={rescheduleTime}
                    setRescheduleTime={setRescheduleTime}
                    handleRescheduleCancel={handleRescheduleCancel}
                    handleRescheduleSave={handleRescheduleSave}
                />
            )}

            {/* Calendar Modal (shared for both normal and reschedule usage) */}
            {showCalendar && (
                <CalendarModal
                    setSlotAdjustmentDate={setSlotAdjustmentDate}
                    setRescheduleDate={showRescheduleModal ? handleRescheduleDatePicked : undefined}
                    setShowCalendar={setShowCalendar}
                    handleDateChange={handleDateChange}
                />
            )}

            {/* Main content */}
            <div className="flex-1 p-6">
                <AdminFilters
                    handleOpenSlotAdjustmentPanel={handleOpenSlotAdjustmentPanel}
                    handleShowAllStudents={handleShowAllStudents}
                    setCurrentScheduleMonth={setCurrentScheduleMonth}
                    setCurrentScheduleYear={setCurrentScheduleYear}
                    setShowAllStudents={setShowAllStudents}
                    search={search}
                    setSearch={setSearch}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    currentScheduleMonth={currentScheduleMonth}
                    currentScheduleYear={currentScheduleYear}
                    currentScheduleDay={currentScheduleDay}
                    setCurrentScheduleDay={setCurrentScheduleDay}
                    currentScheduleTime={currentScheduleTime}
                    setCurrentScheduleTime={setCurrentScheduleTime}
                />

                {/* Bulk Action Bar */}
                {selectedStudentIds.length > 0 && (
                    <BulkActionBar
                        count={selectedStudentIds.length}
                        onDelete={confirmBulkDelete}
                        onDone={handleBulkMarkDone}
                        onCancel={confirmBulkMarkCancelled}
                        onClear={clearSelection}
                    />
                )}

                {/* Table logic: show all students if showAllStudents is true, else paginatedStudents */}
                <AdminTable
                    showAllStudents={showAllStudents}
                    allStudentsList={sortedAllStudentsList}
                    paginatedStudents={paginatedStudents}
                    page={page}
                    perPage={perPage}
                    showStudentDetails={showStudentDetails}
                    showEditModal={showEditModal}
                    handleDelete={handleDelete}
                    handleToggleStatus={handleToggleStatus}
                    handleMarkCancelled={handleMarkCancelled}
                    handleReschedule={handleReschedule}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                    selectedStudentIds={selectedStudentIds}
                    handleSelectStudent={handleSelectStudent}
                    handleSelectAll={handleSelectAll}
                    studentsToShow={studentsToShow}
                />


                {/* Hide pagination if showAllStudents is true */}

                <AdminPagination
                    showAllStudents={showAllStudents}
                    totalPagesToShow={totalPagesToShow}
                    startIndex={startIndex}
                    perPage={perPage}
                    filteredStudents={filteredStudents}
                    page={page}
                    setPage={setPage}
                    startPage={startPage}
                    endPage={endPage}
                />
            </div>




            {/* Confirmation Modal for bulk actions */}
            <ConfirmModal
                show={bulkConfirm.show}
                message={bulkConfirm.message}
                onConfirm={async () =>
                {
                    setBulkConfirm({ ...bulkConfirm, show: false });
                    if (typeof bulkConfirm.action === 'function') await bulkConfirm.action();
                }}
                onCancel={() => setBulkConfirm({ ...bulkConfirm, show: false })}
            />
        </div >
    );
};

export default AdminPage;