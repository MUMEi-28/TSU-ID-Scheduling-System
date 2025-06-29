import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import CustomDropdown from './CustomDropdown';
import kuruKuru from '../public/kurukuru-kururing.gif';
import { displayToCanonical, normalizeDate } from '../../utils/timeUtils';


//Modals
const AddStudentModal = React.lazy(() => import('./Modals/AddStudentModal'));/* [AYAW GUMANA E - _ - FIX LATER] */
import SlotAdjustmentPanel from './Modals/SlotAdjustmentPanel';
import RescheduleModal from './Modals/RescheduleModal';

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

// Lazy load the Calendar component
const Calendar = React.lazy(() => import('../Student/ScheduleSelection/Calendar'));

const AdminPage = (props) =>
{
    const location = useLocation();
    const [showCalendar, setShowCalendar] = useState(false);
    const [showList, setShowList] = useState(false);
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
    const [showRescheduleModal, setShowRescheduleModal] = useState(true);
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

    // Add loading when date/time changes

    useEffect(() =>
    {
        if (!isLoading && selectedTime !== "No Time Chosen")
        {
            setIsFiltering(true);
            setTimeout(() => setIsFiltering(false), 2000);
        }
    }, [selectedTime, isLoading]);

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

    const handleEditSave = async () =>
    {
        setIsLoading(true);
        try
        {
            const updateData = {
                id: editModal.student.id,
                fullname: editModal.data.fullname,
                student_number: editModal.data.student_number,
                email: editModal.data.email,
                id_reason: editModal.data.id_reason,
                status: editModal.data.status
            };

            await axios.put(buildApiUrl(API_ENDPOINTS.INDEX), updateData, {
                headers: { 'Content-Type': 'application/json' }
            });

            setEditModal({ show: false, student: null, data: {} });
            setToast({ show: true, message: 'Student updated successfully!', type: 'success' });
            invalidateStudentCache();

            // Refresh the students list
            const response = await axios.get(buildApiUrl(API_ENDPOINTS.GET_STUDENTS));
            setStudents(response.data);
            localStorage.setItem('admin_students_cache', JSON.stringify({
                data: response.data,
                timestamp: Date.now()
            }));
        } catch (err)
        {
            setToast({ show: true, message: 'Failed to update student', type: 'error' });
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
            setToast({ show: true, message: `Generating list for ${monthName} ${currentScheduleYear}${selectedTime !== 'No Time Chosen' ? ', ' + selectedTime : ''}`, type: 'success' });
            downloadFilteredStudentsData();
        }
    };

    const downloadAllStudentsData = () =>
    {
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
            const matchesTime = selectedTime === 'No Time Chosen' || student.schedule_time === selectedTime;
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
        a.download = `${monthName}_${currentScheduleYear}${selectedTime !== 'No Time Chosen' ? '_' + selectedTime.replace(/\s+/g, '') : ''}_students.csv`;
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

    // Update filteredStudents to filter by month/year if not showing all students
    const filteredStudents = students.filter(student =>
    {
        if (
            student.id === 1 ||
            (adminFullname && student.fullname === adminFullname) ||
            (adminStudentNumber && student.student_number === adminStudentNumber)
        ) return false;
        const matchesSearch = student.fullname.toLowerCase().includes(search.toLowerCase()) ||
            student.student_number.includes(search) ||
            (student.email && student.email.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
        let matchesMonth = true;
        if (!showAllStudents && student.schedule_date)
        {
            const dateObj = new Date(student.schedule_date);
            matchesMonth = dateObj.getMonth() === currentScheduleMonth && dateObj.getFullYear() === currentScheduleYear;
        }
        return matchesSearch && matchesStatus && matchesMonth;
    });

    const totalPages = Math.ceil(filteredStudents.length / perPage);
    const startIndex = (page - 1) * perPage;
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + perPage);

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
        const newStatus = student.status === 'done' ? 'pending' : 'done';
        await axios.put(buildApiUrl(API_ENDPOINTS.INDEX), { ...student, status: newStatus }, {
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
                    await axios.put(buildApiUrl(API_ENDPOINTS.INDEX), { ...student, status: 'cancelled' }, {
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
            await axios.put(buildApiUrl(API_ENDPOINTS.INDEX), {
                ...rescheduleStudent,
                schedule_date: rescheduleDate,
                schedule_time: rescheduleTime,
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
            setToast({ show: true, message: 'Failed to reschedule student', type: 'error' });
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

    const handleTimeChange = (newTime) =>
    {
        setSelectedTime(newTime);
        if (currentScheduleDate !== "No Date Chosen" && newTime !== "No Time Chosen")
        {
            setIsFiltering(true);
            setTimeout(() => setIsFiltering(false), 1500);
        }
    };

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

    const allStudentsList = students.filter(student =>
        student.id !== 1 &&
        (!adminFullname || student.fullname !== adminFullname) &&
        (!adminStudentNumber || student.student_number !== adminStudentNumber)
    );
    const totalAllPages = Math.ceil(allStudentsList.length / perPage);
    const studentsToShow = showAllStudents
        ? allStudentsList.slice((page - 1) * perPage, (page - 1) * perPage + perPage)
        : paginatedStudents;
    const totalPagesToShow = showAllStudents ? totalAllPages : totalPages;

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

    return (
        <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-black"> {/* TANGGLAIN BG BLACK LATER */}
            {/* Header */}
            <header className='w-full bg-gradient-to-bl from-[#641500] from-100% to-[#CA2A00] to-0% py-4 px-6 shadow-lg relative z-40'>
                <div className='flex justify-between items-center'>
                    {/* Logo/Title */}
                    <div className='flex items-center space-x-4'>
                        <div className='text-white league-font'>
                            <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold m-0'>2025</h1>
                            <h2 className='text-sm sm:text-lg md:text-xl font-bold m-0'>Calendar</h2>
                            <h3 className='text-xs sm:text-sm md:text-base font-sans m-0'>TSU ID</h3>
                            <h4 className='text-xs sm:text-sm md:text-base font-sans m-0'>Scheduling</h4>
                            <h5 className='text-xs sm:text-sm md:text-base font-sans m-0'>System</h5>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className='hidden sm:flex items-center space-x-4'>

                        <button
                            className='bg-blue-500 hover:bg-blue-600 border-2 border-[#107ac6] active:bg-blue-400 text-white px-4 py-2 rounded-lg'

                            onClick={HandleShowAddStudent}
                        >
                            Add Student
                        </button>
                        <button
                            onClick={HandleShowList}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                            Download List
                        </button>
                        <button
                            onClick={handleLogoutClick}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                            Logout
                        </button>

                    </div>

                    {/* Mobile Hamburger Menu */}
                    <div className='sm:hidden'>
                        <button
                            onClick={toggleMenu}
                            className='text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200'
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {
                    isMenuOpen && (
                        <div className='sm:hidden absolute top-full left-0 right-0 bg-gradient-to-bl from-[#641500] from-100% to-[#CA2A00] to-0% shadow-lg border-t border-white/20'>
                            <div className='flex flex-col space-y-3 p-4'>
                                <button
                                    onClick={HandleChangeDate}
                                    className="bg-[#E1A500] hover:bg-[#C68C10] text-white px-4 py-3 rounded-lg border-2 border-[#C68C10] transition-all duration-200 font-bold w-full text-center"
                                >
                                    Change Date
                                </button>
                                <button
                                    onClick={HandleShowList}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg w-full text-center"
                                >
                                    Download List
                                </button>
                                <button
                                    onClick={handleLogoutClick}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg w-full text-center"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )
                }
            </header >

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
                                    ? `${currentScheduleDate}, ${selectedTime}`
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
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Student Details</h2>
                                <button
                                    onClick={() => setDetailModal({ show: false, student: null })}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div><strong>Name:</strong> {detailModal.student.fullname}</div>
                                <div><strong>Student Number:</strong> {detailModal.student.student_number}</div>
                                <div><strong>Email:</strong> {detailModal.student.email || 'N/A'}</div>
                                <div><strong>ID Reason:</strong> {detailModal.student.id_reason || 'N/A'}</div>
                                <div><strong>Schedule Date:</strong> {detailModal.student.schedule_date || 'Not scheduled'}</div>
                                <div><strong>Schedule Time:</strong> {detailModal.student.schedule_time || 'Not scheduled'}</div>
                                <div><strong>Status:</strong>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${detailModal.student.status === 'done' ? 'bg-green-100 text-green-800' :
                                        detailModal.student.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {detailModal.student.status}
                                    </span>
                                </div>
                                <div><strong>Privacy Agreed:</strong> {detailModal.student.data_privacy_agreed ? 'Yes' : 'No'}</div>
                                <div><strong>Created:</strong> {detailModal.student.created_at ? new Date(detailModal.student.created_at).toLocaleDateString() : 'N/A'}</div>
                                <div><strong>Updated:</strong> {detailModal.student.updated_at ? new Date(detailModal.student.updated_at).toLocaleDateString() : 'N/A'}</div>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() =>
                                    {
                                        setDetailModal({ show: false, student: null });
                                        showEditModal(detailModal.student);
                                    }}
                                    className="bg-[#E1A500] hover:bg-[#C68C10] text-white px-4 py-2 rounded-lg border-2 border-[#C68C10] transition-all duration-200 font-bold"
                                >
                                    Edit Student
                                </button>
                                <button
                                    onClick={() => setDetailModal({ show: false, student: null })}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Modal */}
            {
                editModal.show && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Edit Student</h2>
                                <button
                                    onClick={() => setEditModal({ show: false, student: null, data: {} })}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handleEditSave(); }}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullname"
                                            value={editModal.data.fullname}
                                            onChange={handleEditChange}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Student Number</label>
                                        <input
                                            type="text"
                                            name="student_number"
                                            value={editModal.data.student_number}
                                            onChange={handleEditChange}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editModal.data.email}
                                            onChange={handleEditChange}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Reason</label>
                                        <select
                                            name="id_reason"
                                            value={editModal.data.id_reason}
                                            onChange={handleEditChange}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            required
                                        >
                                            {idReasonOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setEditModal({ show: false, student: null, data: {} })}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-[#E1A500] hover:bg-[#C68C10] text-white px-4 py-2 rounded-lg border-2 border-[#C68C10] transition-all duration-200 font-bold"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Calendar Modal (reworked for both normal and reschedule usage) */}
            {
                showCalendar && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
                        <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center max-w-md w-full mx-4">
                            <Suspense fallback={<div className='text-xl font-bold text-gray-600'>Loading calendar...</div>}>
                                <Calendar
                                    onDateSelect={date =>
                                    {
                                        const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                                        if (showRescheduleModal)
                                        {
                                            setRescheduleDate(formattedDate);
                                            setShowCalendar(false);
                                        } else
                                        {
                                            setSelectedCalendarDate(date);
                                            setShowCalendar(false);
                                        }
                                    }}
                                    onClose={() => setShowCalendar(false)}
                                />
                            </Suspense>
                            <button
                                onClick={() => setShowCalendar(false)}
                                className="mt-4 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold border-2 border-gray-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                )}

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
                    rescheduleDate={rescheduleDate}
                    setShowCalendar={setShowCalendar}
                    rescheduleTime={rescheduleTime}
                    setRescheduleTime={setRescheduleTime}
                    handleRescheduleCancel={handleRescheduleCancel}
                    handleRescheduleSave={handleRescheduleSave}
                />
            )}

            {/* Calendar Modal (shared for both normal and reschedule usage) */}
            {showCalendar && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
                    <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center max-w-md w-full mx-2">
                        <Suspense fallback={<div className='text-xl font-bold text-gray-600'>Loading calendar...</div>}>
                            <Calendar
                                onDateSelect={date =>
                                {
                                    const formatted = new Date(date).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    });
                                    setSlotAdjustmentDate(formatted);
                                    setShowCalendar(false);
                                }}
                                onClose={() => setShowCalendar(false)}
                            />
                        </Suspense>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() =>
                                {
                                    setShowCalendar(false);
                                }}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold border-2 border-green-700 text-sm"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => { setShowCalendar(false); }}
                                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold border-2 border-gray-600 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 p-6">
                {/* Move the Show All Students button above the filters */}
                <div className="flex flex-col sm:flex-row justify-end mb-4">
                    <button onClick={handleOpenSlotAdjustmentPanel}
                        className="bg-blue-300 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold border-2 border-blue-600 transition-all duration-150 mb-2 sm:mb-0 sm:mr-2">

                        Adjust Slots
                    </button>
                    <button
                        onClick={() =>
                        {
                            setCurrentScheduleMonth(new Date().getMonth());
                            setCurrentScheduleYear(new Date().getFullYear());
                            setShowAllStudents(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold border-2 border-blue-700 transition-all duration-150"
                    >
                        Show All Students
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                placeholder="Search by name, student number, or email..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setShowAllStudents(false); }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => { setFilterStatus(e.target.value); setShowAllStudents(false); }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="done">Done</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                            <select
                                value={currentScheduleMonth}
                                onChange={e => { setCurrentScheduleMonth(Number(e.target.value)); setShowAllStudents(false); }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i} value={i}>{new Date(0, i).toLocaleString('en-US', { month: 'long' })}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                            <select
                                value={currentScheduleYear}
                                onChange={e => { setCurrentScheduleYear(Number(e.target.value)); setShowAllStudents(false); }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                {Array.from({ length: 5 }, (_, i) =>
                                {
                                    const year = new Date().getFullYear() - 2 + i;
                                    return <option key={year} value={year}>{year}</option>;
                                })}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table logic: show all students if showAllStudents is true, else paginatedStudents */}
                {(() =>
                {
                    const studentsToShow = showAllStudents
                        ? allStudentsList.slice((page - 1) * perPage, (page - 1) * perPage + perPage)
                        : paginatedStudents;
                    return (
                        <div className="bg-white border border-gray-200 overflow-x-auto">
                            <table className="table-auto w-full">
                                <thead className="bg-gray-100 border-b border-gray-300">
                                    <tr>
                                        <th className="py-2 px-2 text-left font-semibold text-gray-700 border-r">Name</th>
                                        <th className="py-2 px-2 text-left font-semibold text-gray-700 border-r">Student Number</th>
                                        <th className="py-2 px-2 text-left font-semibold text-gray-700 border-r">Schedule Date</th>
                                        <th className="py-2 px-2 text-left font-semibold text-gray-700 border-r">Schedule Time</th>
                                        <th className="py-2 px-2 text-left font-semibold text-gray-700 border-r">Status</th>
                                        <th className="py-2 px-2 text-left font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsToShow.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="border-b hover:bg-gray-50 cursor-pointer"
                                            onClick={() => showStudentDetails(student)}
                                        >
                                            <td className="py-2 px-2 border-r">{student.fullname}</td>
                                            <td className="py-2 px-2 border-r">{student.student_number}</td>
                                            <td className="py-2 px-2 border-r">{student.schedule_date || 'Not scheduled'}</td>
                                            <td className="py-2 px-2 border-r">{student.schedule_time || 'Not scheduled'}</td>
                                            <td className="py-2 px-2 border-r">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${student.status === 'done' ? 'bg-green-100 text-green-800' :
                                                    student.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="py-2 px-2">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={(e) =>
                                                        {
                                                            e.stopPropagation();
                                                            showEditModal(student);
                                                        }}
                                                        className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow-sm text-sm font-medium transition-all duration-150"
                                                        title="Edit"
                                                    >
                                                        <span className="mr-1">✏️</span> Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) =>
                                                        {
                                                            e.stopPropagation();
                                                            handleDelete(student.id);
                                                        }}
                                                        className="flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm text-sm font-medium transition-all duration-150"
                                                        title="Delete"
                                                    >
                                                        <span className="mr-1">🗑️</span> Delete
                                                    </button>
                                                    <button
                                                        onClick={(e) =>
                                                        {
                                                            e.stopPropagation();
                                                            handleToggleStatus(student);
                                                        }}
                                                        className={`flex items-center px-3 py-1 rounded shadow-sm text-sm font-medium transition-all duration-150 ${student.status === 'done'
                                                            ? 'bg-gray-400 hover:bg-gray-500 text-white'
                                                            : 'bg-green-500 hover:bg-green-600 text-white'
                                                            }`}
                                                        title={student.status === 'done' ? 'Mark Pending' : 'Mark Done'}
                                                    >
                                                        <span className="mr-1">{student.status === 'done' ? '⏳' : '✅'}</span> {student.status === 'done' ? 'Pending' : 'Done'}
                                                    </button>
                                                    {student.status !== 'cancelled' && (
                                                        <button
                                                            onClick={(e) =>
                                                            {
                                                                e.stopPropagation();
                                                                handleMarkCancelled(student);
                                                            }}
                                                            className="flex items-center bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded shadow-sm text-sm font-medium transition-all duration-150"
                                                            title="Mark Cancelled"
                                                        >
                                                            <span className="mr-1">❌</span> Cancel
                                                        </button>
                                                    )}
                                                    {student.status === 'cancelled' && (
                                                        <button
                                                            onClick={(e) =>
                                                            {
                                                                e.stopPropagation();
                                                                handleReschedule(student);
                                                            }}
                                                            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow-sm text-sm font-medium transition-all duration-150"
                                                            title="Reschedule"
                                                        >
                                                            <span className="mr-1">📅</span> Resched
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })()}

                {/* Hide pagination if showAllStudents is true */}
                {!showAllStudents && totalPagesToShow > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {startIndex + 1} to {Math.min(startIndex + perPage, filteredStudents.length)} of {filteredStudents.length} results
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(pageNum => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`px-3 py-1 border rounded-md text-sm transition-all duration-200 ${pageNum === page
                                            ? 'bg-[#E1A500] text-white border-[#C68C10]'
                                            : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPagesToShow}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default AdminPage;