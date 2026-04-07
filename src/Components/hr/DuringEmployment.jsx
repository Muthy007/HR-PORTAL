import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import * as XLSX from 'xlsx'
import { API_BASE_URL } from "../../assets/connection"
import {
    Box,
    Paper,
    Typography,
    Grid,
    InputAdornment,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    Select,
    Modal,
    IconButton,
    InputBase,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined"

function DuringEmployment() {
    const navigate = useNavigate()
    const [employees, setEmployees] = useState({})
    const [selectedEmpId, setSelectedEmpId] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [shiftFilter, setShiftFilter] = useState("All Shift")
    const itemsPerPage = 8

    const fetchData = async () => {
        try {
            const empResponse = await fetch(`${API_BASE_URL}/api/EmployeeMaster`);
            if (!empResponse.ok) throw new Error(`HTTP error! Status: ${empResponse.status}`);
            const empData = await empResponse.json();

            const attResponse = await fetch(`${API_BASE_URL}/api/EmployeeMaster/attendance`);
            let attData = [];
            if (attResponse.ok) {
                attData = await attResponse.json();
            }

            const mergedEmployees = {};
            empData.forEach(emp => {
                const empCode = emp.employeeCode;
                mergedEmployees[empCode] = {
                    id: emp.empId,
                    empId: empCode,
                    name: emp.fullName || "Unknown",
                    department: emp.department || "N/A",
                    jobTitle: emp.designation || "N/A",
                    leaveAndAttendance: {
                        attendanceLog: {},
                        dailyDetails: {}
                    }
                };
            });

            const formatTime = (timeStr) => {
                if (!timeStr) return null;
                const parts = timeStr.split(':');
                if (parts.length < 2) return timeStr;
                let hours = parseInt(parts[0], 10);
                const minutes = parts[1];
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12 || 12;
                return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
            };

            attData.forEach(record => {
                const empCode = record.employeeCode;
                if (mergedEmployees[empCode]) {
                    const dateObj = new Date(record.attendanceDate);
                    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                    
                    const inTime = formatTime(record.checkIn);
                    const outTime = formatTime(record.checkOut);
                    
                    let status = "Absent";
                    if (inTime) status = "Present";

                    mergedEmployees[empCode].leaveAndAttendance.attendanceLog[dateStr] = status;
                    mergedEmployees[empCode].leaveAndAttendance.dailyDetails[dateStr] = {
                        inTime: inTime || "--:--",
                        outTime: outTime || "--:--",
                        shift: record.shift?.shiftName || "Day Shift"
                    };
                }
            });

            setEmployees(mergedEmployees);
        } catch (error) {
            console.error("Error fetching data:", error);
            setEmployees({});
        }
    };

    useEffect(() => {
        fetchData();
    }, [])

    useEffect(() => {
        if (selectedEmpId && employees[selectedEmpId]) {
            const empData = employees[selectedEmpId]
            setFormData({
                ...empData,
                leaveAndAttendance: {
                    ...empData.leaveAndAttendance,
                    inOutTiming: empData.leaveAndAttendance?.inOutTiming || "",
                    totalWorkingDays: empData.leaveAndAttendance?.totalWorkingDays || "",
                    monthWorkingDays: empData.leaveAndAttendance?.monthWorkingDays || "",
                    leaveDaysTaken: empData.leaveAndAttendance?.leaveDaysTaken || "",
                    leaveRecords: empData.leaveAndAttendance?.leaveRecords || [],
                    dailyDetails: empData.leaveAndAttendance?.dailyDetails || {},
                    attendanceLog: empData.leaveAndAttendance?.attendanceLog || {}
                }
            })
            setSelectedDayDetails(null)
        } else {
            setFormData(null)
            setIsEditing(false)
        }
    }, [selectedEmpId, employees])

    const [selectedDate, setSelectedDate] = useState(new Date())

    const getSelectedDateString = () => {
        const year = selectedDate.getFullYear()
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
        const day = String(selectedDate.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const selectedDateStr = getSelectedDateString()

    // Aggregate stats for the selected date
    const totalEmployees = Object.keys(employees).length
    let presentCount = 0
    let absentCount = 0
    let onLeaveCount = 0

    Object.values(employees).forEach(emp => {
        const status = emp.leaveAndAttendance?.attendanceLog?.[selectedDateStr]
        if (status === 'Present' || status === 'Late' || status === 'Half Day') presentCount++
        else if (status === 'Absent') absentCount++
        else if (status === 'On Leave') onLeaveCount++
    })

    const handleSave = () => {
        if (!formData) return
        const updatedEmployees = { ...employees, [selectedEmpId]: formData }
        setEmployees(updatedEmployees)
        setIsEditing(false)
        alert("Leave & Attendance updated successfully!")
    }

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, leaveAndAttendance: { ...prev.leaveAndAttendance, [key]: value } }))
    }

    const handleDailyDetailChange = (dateStr, field, value) => {
        setFormData(prev => {
            const currentDaily = prev.leaveAndAttendance.dailyDetails || {};
            const currentDateDetails = currentDaily[dateStr] || {};
            return {
                ...prev,
                leaveAndAttendance: {
                    ...prev.leaveAndAttendance,
                    dailyDetails: { ...currentDaily, [dateStr]: { ...currentDateDetails, [field]: value } }
                }
            };
        });
    }

    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDayDetails, setSelectedDayDetails] = useState(null)

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

    const yearCalendar = currentDate.getFullYear()
    const monthCalendar = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(yearCalendar, monthCalendar)
    const firstDay = getFirstDayOfMonth(yearCalendar, monthCalendar)

    const prevMonth = () => setCurrentDate(new Date(yearCalendar, monthCalendar - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(yearCalendar, monthCalendar + 1, 1))
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    const handleDayClick = (dayStr) => {
        setSelectedDayDetails(dayStr);
        setIsModalOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Absent': return 'bg-red-100 text-red-700 border-red-200';
            case 'Late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Half Day': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'On Leave': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100';
        }
    };

    const handleDownloadAttendance = () => { alert("Export feature coming soon"); };

    const parseExcelTime = (timeVal) => {
        if (!timeVal && timeVal !== 0) return "--:--";
        if (typeof timeVal === 'number') {
            const totalSeconds = Math.round(timeVal * 86400);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
        }
        return String(timeVal);
    };

    const calculateWorkingHours = (inTime, outTime) => {
        if (!inTime || !outTime || inTime === '--:--' || outTime === '--:--') return "Not Recorded";

        const parseTime = (timeStr) => {
            const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM|am|pm)/i);
            if (!match) return null;
            let [, hours, minutes, modifier] = match;
            hours = parseInt(hours, 10);
            minutes = parseInt(minutes, 10);
            if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes; 
        };

        const inMins = parseTime(inTime);
        const outMins = parseTime(outTime);

        if (inMins === null || outMins === null) return "Not Recorded";

        let diffMins = outMins - inMins;
        if (diffMins < 0) {
            diffMins += 24 * 60; 
        }

        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hrs} hrs ${mins} min`;
    };

    const handleUploadAttendance = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/api/EmployeeMaster/import`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert("Attendance Imported Successfully!");
                fetchData(); 
            } else {
                alert("Failed to import attendance data.");
            }
        } catch (error) {
            console.error("Error uploading attendance:", error);
            alert("Error importing the file.");
        }
        
        e.target.value = null;
    };

    useEffect(() => {
        setCurrentPage(1);
        setShiftFilter("All Shift");
    }, [selectedEmpId, currentDate])

    const filteredAttendanceRows = Array.from({ length: daysInMonth }).map((_, i) => {
        const day = i + 1;
        const dateObj = new Date(yearCalendar, monthCalendar, day);
        const isFuture = dateObj > new Date();
        if (isFuture) return null;

        const dateStr = `${yearCalendar}-${String(monthCalendar + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const status = formData?.leaveAndAttendance?.attendanceLog?.[dateStr];
        const details = formData?.leaveAndAttendance?.dailyDetails?.[dateStr] || {};
        const shift = status ? (details.shift || "Day Shift") : "Not Recorded";

        if (shiftFilter !== "All Shift" && shift !== shiftFilter) return null;

        return { dateStr, displayDate, status, details, shift };
    }).filter(Boolean).reverse();

    return (
        <Box sx={{ width: '100%', pb: 10, px: { xs: 2, xl: 4 }, mx: 'auto', mt: { xs: 1, md: 2 }, display: 'flex', flexDirection: 'column', gap: 3 }}>

            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: '0.75rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                    border: '1px solid #f3f4f6',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 3,
                    bgcolor: 'white'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box sx={{
                        width: 64, height: 64, bgcolor: '#5A725A', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '14px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    }}>
                        <svg style={{ width: 32, height: 32 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#1F2937', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                            During Employment
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: '#6B7280', fontWeight: 500, mt: 0.5, letterSpacing: '0.025em' }}>
                            Manage leave and attendance records for active employees.
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {!selectedEmpId ? (
                // ------------------------- GLOBAL DASHBOARD (Appears when no employee is selected) -------------------------
                <Paper elevation={0} sx={{ borderRadius: '0.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid #f3f4f6', bgcolor: 'rgba(249, 250, 251, 0.5)' }}>
                        <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <svg style={{ width: 20, height: 20, color: '#5A725A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            Global Attendance Dashboard
                        </Typography>
                    </Box>
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                            {[
                                { title: "Total Employees", val: totalEmployees.toString(), c: "#6b7280", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
                                { title: "Present", val: presentCount.toString(), c: "#10b981", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
                                { title: "Absent", val: absentCount.toString(), c: "#f43f5e", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
                                { title: "On Leave", val: onLeaveCount.toString(), c: "#3b82f6", icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" }
                            ].map((stat, i) => (
                                <Box key={i} sx={{ flex: 1, minWidth: 0 }}>
                                    <Paper elevation={0} sx={{
                                        p: 2.5,
                                        height: '100%',
                                        borderRadius: '0.75rem',
                                        border: '1px solid #e5e7eb',
                                        bgcolor: 'white',
                                        transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                                        '&:hover': { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                            <Box sx={{
                                                width: 40, height: 40, bgcolor: '#f9fafb', border: '1px solid #f3f4f6',
                                                borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: stat.c
                                            }}>
                                                <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                                            </Box>
                                        </Box>
                                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.025em', mb: 0.5, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {stat.title}
                                        </Typography>
                                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#1f2937' }}>
                                            {stat.val}
                                        </Typography>
                                    </Paper>
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2, mt: 4, mb: 2 }}>
                            <Box sx={{ display: 'flex', width: { xs: '100%', sm: 'auto' }, gap: 1.5 }}>
                                <TextField
                                    placeholder="Search by name, role..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size="small"
                                    sx={{
                                        width: { xs: '100%', sm: 256 },
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '0.5rem',
                                            bgcolor: 'white',
                                            fontSize: '0.875rem',
                                            '& fieldset': { borderColor: '#e5e7eb' },
                                            '&:hover fieldset': { borderColor: '#d1d5db' },
                                            '&.Mui-focused fieldset': { borderColor: '#5A725A', borderWidth: '1px' }
                                        }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: '#9ca3af', width: 20, height: 20 }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <Button
                                    variant="outlined"
                                    startIcon={<FilterListIcon sx={{ width: 18, height: 18 }} />}
                                    sx={{
                                        color: '#374151',
                                        borderColor: '#e5e7eb',
                                        bgcolor: 'white',
                                        borderRadius: '0.5rem',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        px: 2,
                                        '&:hover': { bgcolor: '#f9fafb', borderColor: '#e5e7eb' }
                                    }}
                                >
                                    Filter
                                </Button>
                            </Box>
                            
                            <Box sx={{ display: 'flex', width: { xs: '100%', sm: 'auto' }, gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 1 }}>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#4b5563' }}>
                                        Select Date:
                                    </Typography>
                                    <InputBase
                                        type="date"
                                        value={selectedDateStr}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const parts = e.target.value.split('-');
                                                setSelectedDate(new Date(parts[0], parts[1] - 1, parts[2]));
                                            }
                                        }}
                                        sx={{
                                            bgcolor: 'rgba(90, 114, 90, 0.05)',
                                            color: '#5A725A',
                                            fontWeight: 700,
                                            px: 2,
                                            py: 0.75,
                                            borderRadius: '0.5rem',
                                            border: '1px solid #5A725A',
                                            fontSize: '1rem',
                                            cursor: 'pointer',
                                            transition: 'background-color 200ms ease',
                                            '&:hover': { bgcolor: 'rgba(90, 114, 90, 0.1)' },
                                            '& input::-webkit-calendar-picker-indicator': { cursor: 'pointer' }
                                        }}
                                    />
                                </Box>

                                <Button
                                    component="label"
                                    variant="contained"
                                    startIcon={<FileUploadOutlinedIcon sx={{ width: 16, height: 16 }} />}
                                    sx={{
                                        bgcolor: '#5A725A',
                                        color: 'white',
                                        borderRadius: '0.5rem',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        px: 2,
                                        py: 1,
                                        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                                        '&:hover': { bgcolor: '#4a5f4a', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }
                                    }}
                                >
                                    Import File
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls, .csv"
                                        onChange={handleUploadAttendance}
                                        hidden
                                    />
                                </Button>
                            </Box>
                        </Box>

                        <TableContainer sx={{ border: '1px solid #f3f4f6', borderRadius: '0.75rem', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                            <Table sx={{ minWidth: 800 }} aria-label="global attendance table">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f9fafb', '& th': { borderBottom: '1px solid #f3f4f6' } }}>
                                        <TableCell sx={{ px: 3, py: 2, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee</TableCell>
                                        <TableCell sx={{ px: 3, py: 2, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</TableCell>
                                        <TableCell align="center" sx={{ px: 3, py: 2, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</TableCell>
                                        <TableCell align="center" sx={{ px: 3, py: 2, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check In</TableCell>
                                        <TableCell align="center" sx={{ px: 3, py: 2, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check Out</TableCell>
                                        <TableCell align="right" sx={{ px: 3, py: 2, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.values(employees)
                                        .filter(emp =>
                                            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            (emp.jobTitle?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                            (emp.department?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                            emp.empId.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((emp) => {
                                            
                                            const status = emp.leaveAndAttendance?.attendanceLog?.[selectedDateStr] || "Not Marked";

                                            const getBg = (s) =>
                                                s === 'Present' ? { bgcolor: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' } :
                                                s === 'Absent' ? { bgcolor: '#fef2f2', color: '#e11d48', borderColor: '#fecdd3' } :
                                                s === 'Late' ? { bgcolor: '#fefce8', color: '#d97706', borderColor: '#fde047' } :
                                                s === 'Half Day' ? { bgcolor: '#fffbeb', color: '#d97706', borderColor: '#fde68a' } :
                                                s === 'On Leave' ? { bgcolor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' } :
                                                { bgcolor: '#f9fafb', color: '#6b7280', borderColor: '#e5e7eb' };

                                            const badgeStyle = getBg(status);

                                        
                                            const details = emp.leaveAndAttendance?.dailyDetails?.[selectedDateStr] || {};
                                            const inTime = details.inTime || "--:--";
                                            const outTime = details.outTime || "--:--";

                                            return (
                                                <TableRow key={emp.empId} hover sx={{ '& td': { borderBottom: '1px solid #f9fafb' }, '&:hover': { bgcolor: 'rgba(90, 114, 90, 0.05)' }, transition: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms' }}>
                                                    <TableCell sx={{ px: 3, py: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                                                                {emp.name.substring(0, 2)}
                                                            </Box>
                                                            <Box>
                                                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1f2937' }}>{emp.name}</Typography>
                                                                <Typography sx={{ fontSize: '0.625rem', color: '#9ca3af', fontWeight: 500 }}>ID: {emp.empId}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ px: 3, py: 2, fontSize: '0.875rem', fontWeight: 500, color: '#4b5563' }}>{emp.jobTitle || emp.department || 'N/A'}</TableCell>
                                                    <TableCell align="center" sx={{ px: 3, py: 2 }}>
                                                        <Box component="span" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem', fontWeight: 700, border: '1px solid', borderRadius: '0.5rem', display: 'inline-block', minWidth: '90px', textAlign: 'center', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', ...badgeStyle }}>
                                                            {status}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ px: 3, py: 2, fontSize: '0.875rem', fontWeight: 700, color: '#374151' }}>{inTime}</TableCell>
                                                    <TableCell align="center" sx={{ px: 3, py: 2, fontSize: '0.875rem', fontWeight: 700, color: '#374151' }}>{outTime}</TableCell>
                                                    <TableCell align="right" sx={{ px: 3, py: 2 }}>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => setSelectedEmpId(emp.empId)}
                                                            sx={{
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700,
                                                                color: '#5A725A',
                                                                borderColor: '#5A725A',
                                                                px: 2,
                                                                py: 0.5,
                                                                borderRadius: '0.5rem',
                                                                textTransform: 'none',
                                                                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                                                                '&:hover': { bgcolor: '#5A725A', color: 'white', borderColor: '#5A725A' }
                                                            }}
                                                        >
                                                            View Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    {Object.keys(employees).length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#9ca3af', fontWeight: 500, bgcolor: 'rgba(249, 250, 251, 0.5)' }}>
                                                No employees registered yet. Go to Employees &gt; Add Employee.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Paper>
            ) : (
                // ------------------------- DETAIL VIEW (Employee Selected) -------------------------
                <Box>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 4 },
                            borderRadius: '0.75rem',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                            border: '1px solid #f3f4f6',
                            bgcolor: 'white',
                        }}
                    >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4, pb: 3, borderBottom: '1px solid #f3f4f6' }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start', gap: 3, width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                                <Box sx={{
                                    width: 80, height: 80, borderRadius: '0.75rem', bgcolor: '#f3f4f6', border: '1px solid #e5e7eb',
                                    display: 'flex', flexShrink: 0, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                                }}>
                                    {(() => {
                                        const finalImage = formData?.documentUploads?.profileImage || formData?.profileImage;

                                        if (finalImage) {
                                            return <img src={finalImage} alt={formData?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                                        }
                                        return <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase' }}>{formData?.name?.substring(0, 2) || "EMP"}</Typography>;
                                    })()}
                                </Box>

                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 1.5, mb: 1.5 }}>
                                        <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#1f2937', letterSpacing: '-0.025em' }}>
                                            {formData?.personal?.firstName || formData?.name || "Employee Name"} {formData?.personal?.lastName || ""}
                                        </Typography>
                                        <Box component="span" sx={{ bgcolor: '#EBa01e', color: 'white', fontSize: '11px', fontWeight: 700, px: 1, py: 0.25, borderRadius: '0.25rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', letterSpacing: '0.025em', display: 'inline-block' }}>
                                            {formData?.employment?.designation || formData?.jobTitle || "Job Title"}
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 3, rowGap: 1, fontSize: '13px', fontWeight: 500, color: '#6b7280' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <svg style={{ width: 16, height: 16, color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            {formData?.personal?.personalEmail || formData?.email || formData?.contactInfo?.email || "No Email"}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <svg style={{ width: 16, height: 16, color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            {formData?.personal?.mobileNumber || formData?.phone || formData?.mobileNo || formData?.contactInfo?.phoneNumber || "No Phone"}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <svg style={{ width: 16, height: 16, color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {formData?.contact?.currentAddress?.city || formData?.location || "Chennai, Tamilnadu"}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            <Button
                                onClick={() => setSelectedEmpId(null)}
                                variant="outlined"
                                startIcon={<svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>}
                                sx={{
                                    flexShrink: 0,
                                    bgcolor: '#f9fafb',
                                    color: '#374151',
                                    borderColor: '#e5e7eb',
                                    fontSize: '0.875rem',
                                    fontWeight: 700,
                                    borderRadius: '0.5rem',
                                    textTransform: 'none',
                                    px: 2,
                                    py: 1,
                                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                                    whiteSpace: 'nowrap',
                                    '&:hover': { bgcolor: '#f3f4f6', borderColor: '#e5e7eb' }
                                }}
                            >
                                Go to Dashboard
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', columnGap: 5, rowGap: 2, pt: 2, borderTop: '1px solid rgba(249, 250, 251, 0.8)' }}>
                            <Box>
                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', mb: 0.5 }}>Employee ID</Typography>
                                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#1f2937' }}>{formData?.empId || "N/A"}</Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', mb: 0.5 }}>Experience</Typography>
                                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#1f2937' }}>{formData?.experience || "N/A"}</Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', mb: 0.5 }}>On time</Typography>
                                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#1f2937' }}>{formData?.onTime || "N/A"}</Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', mb: 0.5 }}>Department</Typography>
                                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#1f2937' }}>{formData?.employment?.department || formData?.department || "N/A"}</Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', mb: 0.5 }}>Attendance Updated Date Time (IST)</Typography>
                                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#1f2937' }}>{(() => {
                                    const now = new Date();
                                    return now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + " at " + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                })()}</Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', mb: 0.5 }}>Available leave counts</Typography>
                                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#1f2937' }}>{formData?.leaveAndAttendance?.leaveCount || "0"}</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 5 }}>
                        <Box sx={{ flex: 1, minWidth: '220px', maxWidth: { xs: '100%', md: '30%' } }}>
                            <Paper elevation={0} sx={{
                                p: 2.5, borderRadius: '0.75rem', border: '1px solid #e5e7eb', bgcolor: 'white',
                                transition: 'colors 200ms ease-in-out', '&:hover': { borderColor: '#c7d2fe' }, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                            }}>
                                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 0.75, opacity: 0.8 }}>Timing Schedule</Typography>
                                {isEditing ? (
                                    <input type="text" value={formData?.leaveAndAttendance?.inOutTiming} onChange={(e) => handleChange("inOutTiming", e.target.value)} style={{ width: '100%', backgroundColor: '#f9fafb', border: '1px solid #c7d2fe', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontWeight: 700, color: '#1f2937', outline: 'none' }} />
                                ) : (
                                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#1f2937' }}>{formData?.leaveAndAttendance?.inOutTiming}</Typography>
                                )}
                            </Paper>
                        </Box>
                        {[
                            { label: "Month Working Days", key: "monthWorkingDays", color: "#3b82f6", borderHover: "#bfdbfe" },
                            { label: "Leaves Taken", key: "leaveDaysTaken", color: "#f43f5e", borderHover: "#fecdd3" }
                        ].map(item => (
                            <Box sx={{ flex: 1, minWidth: '220px', maxWidth: { xs: '100%', md: '30%' } }} key={item.key}>
                                <Paper elevation={0} sx={{
                                    p: 2.5, borderRadius: '0.75rem', border: '1px solid #e5e7eb', bgcolor: 'white',
                                    transition: 'colors 200ms ease-in-out', '&:hover': { borderColor: item.borderHover }, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                                }}>
                                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 0.75, opacity: 0.8 }}>{item.label}</Typography>
                                    {isEditing ? (
                                        <input type="text" value={formData?.leaveAndAttendance?.[item.key]} onChange={(e) => handleChange(item.key, e.target.value.replace(/[^0-9.]/g, ''))} style={{ width: '100%', backgroundColor: '#f9fafb', border: `1px solid ${item.borderHover}`, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontWeight: 700, color: '#1f2937', outline: 'none' }} />
                                    ) : (
                                        <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#1f2937' }}>{formData?.leaveAndAttendance?.[item.key]}</Typography>
                                    )}
                                </Paper>
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, alignItems: 'stretch' }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ width: '100%', height: '100%' }}>
                                <Paper elevation={0} sx={{
                                    height: '100%', bgcolor: 'white', borderRadius: '1rem', border: '1px solid #f3f4f6', boxShadow: '0 2px 15px rgba(0,0,0,0.03)', overflow: 'hidden', display: 'flex', flexDirection: 'column'
                                }}>
                                <Box sx={{ p: 2.5, borderBottom: '1px solid #f3f4f6', bgcolor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography sx={{ fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <svg style={{ width: 20, height: 20, color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Attendance Calendar
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Button
                                            onClick={prevMonth}
                                            sx={{ minWidth: 0, p: 0.75, color: '#4b5563', borderRadius: '0.375rem', '&:hover': { bgcolor: '#e5e7eb' }, transition: 'background-color 200ms ease' }}
                                        >
                                            <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </Button>
                                        <Typography sx={{ fontWeight: 700, color: '#1f2937', minWidth: '130px', textAlign: 'center', letterSpacing: '0.025em' }}>
                                            {monthNames[monthCalendar]} {yearCalendar}
                                        </Typography>
                                        <Button
                                            onClick={nextMonth}
                                            sx={{ minWidth: 0, p: 0.75, color: '#4b5563', borderRadius: '0.375rem', '&:hover': { bgcolor: '#e5e7eb' }, transition: 'background-color 200ms ease' }}
                                        >
                                            <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </Button>
                                    </Box>
                                </Box>

                                <Box sx={{ p: 3 }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1.5, mb: 1.5 }}>
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                            <Typography key={d} sx={{ textAlign: 'center', fontSize: '11px', fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{d}</Typography>
                                        ))}
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1.5 }}>
                                        {Array.from({ length: firstDay }).map((_, i) => <Box key={`empty-${i}`} sx={{ height: 88, bgcolor: 'rgba(249, 250, 251, 0.3)', borderRadius: '0.75rem' }}></Box>)}
                                        {Array.from({ length: daysInMonth }).map((_, i) => {
                                            const day = i + 1;
                                            const dateStr = `${yearCalendar}-${String(monthCalendar + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                            const status = formData?.leaveAndAttendance?.attendanceLog?.[dateStr];
                                            const isSelected = selectedDayDetails === dateStr;

                                            // Determine getStatusColor equivalents via sx
                                            let statusStyling = {};
                                            if (status === 'Present') statusStyling = { bgcolor: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' };
                                            else if (status === 'Absent') statusStyling = { bgcolor: '#fef2f2', color: '#e11d48', borderColor: '#fecdd3' };
                                            else if (status === 'Late') statusStyling = { bgcolor: '#fefce8', color: '#d97706', borderColor: '#fde047' };
                                            else if (status === 'On Leave') statusStyling = { bgcolor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' };
                                            else statusStyling = { bgcolor: 'white', color: '#374151', borderColor: '#e5e7eb' };

                                            const hoverStyle = isSelected ? {
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', transform: 'scale(1.05)', zIndex: 10, outline: '2px solid #5A725A', outlineOffset: '2px'
                                            } : {
                                                '&:hover': { transform: 'scale(1.05)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }
                                            };

                                            return (
                                                <Box
                                                    key={day}
                                                    onClick={() => handleDayClick(dateStr)}
                                                    sx={{
                                                        height: 88, p: 1, border: '1px solid', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                                        cursor: 'pointer', transition: 'all 200ms ease', ...statusStyling, ...hoverStyle
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <Box component="span" sx={{
                                                            fontSize: '0.875rem', fontWeight: 700, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.375rem',
                                                            ...(isSelected && !status ? { bgcolor: '#1f2937', color: 'white' } : isSelected ? { bgcolor: 'white', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' } : {}),
                                                            ...(status ? { color: 'inherit', opacity: 0.9 } : { color: '#6b7280' })
                                                        }}>
                                                            {day}
                                                        </Box>
                                                    </Box>
                                                    {status && <Box component="span" sx={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.6)', borderRadius: '0.25rem', py: 0.25, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', mt: 1 }}>{status}</Box>}
                                                </Box>
                                            )
                                        })}
                                    </Box>
                                </Box>
                                <Box sx={{ bgcolor: '#f9fafb', borderTop: '1px solid #f3f4f6', p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                                    {[
                                        { label: 'Present', color: '#34d399' },
                                        { label: 'Absent', color: '#f87171' },
                                        { label: 'Late', color: '#facc15' },
                                        { label: 'On Leave', color: '#60a5fa' }
                                    ].map(st => (
                                        <Box key={st.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: st.color, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}></Box>
                                            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{st.label}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>
                            </Box>
                        </Box>

              
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Paper elevation={0} sx={{
                                height: '100%', bgcolor: 'white', borderRadius: '1rem', border: '1px solid #f3f4f6', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column'
                            }}>
                                <Box sx={{ p: 2.5, borderBottom: '1px solid #f3f4f6', bgcolor: 'rgba(249, 250, 251, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 1, letterSpacing: '0.025em' }}>
                                        <svg style={{ width: 20, height: 20, color: '#5A725A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                        Attendance Log
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Select
                                            value={shiftFilter}
                                            onChange={(e) => {
                                                setShiftFilter(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            size="small"
                                            sx={{
                                                fontSize: '0.875rem', fontWeight: 500, color: '#374151', bgcolor: 'white', borderRadius: '0.375rem',
                                                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#5A725A' }
                                            }}
                                        >
                                            <MenuItem value="All Shift">All Shift</MenuItem>
                                            <MenuItem value="Day Shift">Day Shift</MenuItem>
                                            <MenuItem value="Night Shift">Night Shift</MenuItem>
                                        </Select>
                                        <TextField
                                            type="month"
                                            value={`${yearCalendar}-${String(monthCalendar + 1).padStart(2, '0')}`}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    const [year, month] = e.target.value.split('-');
                                                    setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, 1));
                                                }
                                            }}
                                            size="small"
                                            sx={{
                                                bgcolor: 'white', borderRadius: '0.375rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                                                '& .MuiInputBase-input': { fontSize: '0.875rem', fontWeight: 500, color: '#374151', py: 1 },
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#5A725A' }
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%' }}>
                                    <Table sx={{ width: '100%', minWidth: 800 }} aria-label="attendance log table">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#f9fafb', '& th': { borderBottom: '1px solid #f3f4f6' } }}>
                                                <TableCell sx={{ px: 3, py: 2, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</TableCell>
                                                <TableCell sx={{ px: 3, py: 2, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shift</TableCell>
                                                <TableCell align="center" sx={{ px: 3, py: 2, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check In</TableCell>
                                                <TableCell align="center" sx={{ px: 3, py: 2, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check Out</TableCell>
                                                <TableCell align="center" sx={{ px: 3, py: 2, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Working Hours</TableCell>
                                                <TableCell align="center" sx={{ px: 3, py: 2, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody sx={{ '& tr': { borderBottom: '1px solid #f3f4f6' } }}>
                                            {(() => {
                                                const totalItems = filteredAttendanceRows.length;
                                                const totalPages = Math.ceil(totalItems / itemsPerPage);
                                                const indexOfLastItem = currentPage * itemsPerPage;
                                                const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                                                const currentItems = filteredAttendanceRows.slice(indexOfFirstItem, indexOfLastItem);

                                                if (currentItems.length === 0) {
                                                    return (
                                                        <TableRow>
                                                            <TableCell colSpan={6} align="center" sx={{ px: 3, py: 4, fontSize: '0.875rem', color: '#9ca3af', fontWeight: 500 }}>
                                                                No attendance records found for this criteria.
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }

                                                return (
                                                    <>
                                                        {currentItems.map((row) => {
                                                            const { dateStr, displayDate, status, details, shift } = row;

                                                            // Default values mapping
                                                            const inTime = details.inTime || "--:--";
                                                            const outTime = details.outTime || "--:--";

                                                            // Calculate actual working hours
                                                            let workingHours = calculateWorkingHours(inTime, outTime);

                                                            const getBg = (s) =>
                                                                s === 'Present' ? { bgcolor: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' } :
                                                                s === 'Absent' ? { bgcolor: '#fef2f2', color: '#e11d48', borderColor: '#fecdd3' } :
                                                                s === 'Late' ? { bgcolor: '#fefce8', color: '#d97706', borderColor: '#fde047' } :
                                                                s === 'Half Day' ? { bgcolor: '#fffbeb', color: '#d97706', borderColor: '#fde68a' } :
                                                                s === 'On Leave' ? { bgcolor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' } :
                                                                { bgcolor: '#fef2f2', color: '#f87171', borderColor: '#fee2e2', opacity: 0.8 }; // styling for Not Recorded

                                                            const badgeStyle = getBg(status || 'Not Marked');

                                                            return (
                                                                <TableRow key={dateStr} hover sx={{ transition: 'background-color 200ms ease', ...( !status ? { opacity: 0.6 } : {} ) }}>
                                                                    <TableCell sx={{ px: 3, py: 2, fontSize: '0.875rem', fontWeight: 700, color: '#1f2937' }}>{displayDate}</TableCell>
                                                                    <TableCell sx={{ px: 3, py: 2, fontSize: '0.875rem', fontWeight: 500, color: shift === 'Not Recorded' ? '#d1d5db' : '#4b5563' }}>{shift}</TableCell>
                                                                    <TableCell align="center" sx={{ px: 3, py: 2, fontSize: '0.875rem', fontWeight: 700, color: inTime === '--:--' ? '#d1d5db' : '#374151' }}>{inTime}</TableCell>
                                                                    <TableCell align="center" sx={{ px: 3, py: 2, fontSize: '0.875rem', fontWeight: 700, color: outTime === '--:--' ? '#d1d5db' : '#374151' }}>{outTime}</TableCell>
                                                                    <TableCell align="center" sx={{ px: 3, py: 2, fontSize: '0.875rem', fontWeight: 700, color: workingHours === 'Not Recorded' ? '#d1d5db' : '#374151' }}>{workingHours}</TableCell>
                                                                    <TableCell align="center" sx={{ px: 3, py: 2 }}>
                                                                        <Box component="span" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem', fontWeight: 700, border: '1px solid', borderRadius: '0.5rem', display: 'inline-block', minWidth: '90px', textAlign: 'center', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', ...badgeStyle }}>
                                                                            {status || 'Not Marked'}
                                                                        </Box>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        })}
                                                    </>
                                                );
                                            })()}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                
                                {(() => {
                                    const totalItems = filteredAttendanceRows.length;
                                    const totalPages = Math.ceil(totalItems / itemsPerPage);

                                    if (totalItems === 0) return null;

                                    const startItem = (currentPage - 1) * itemsPerPage + 1;
                                    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', bgcolor: 'white', px: 3, py: 2 }}>
                                            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box>
                                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280' }}>
                                                        Showing <Box component="span" sx={{ fontWeight: 700, color: '#374151' }}>{startItem}</Box> to <Box component="span" sx={{ fontWeight: 700, color: '#374151' }}>{endItem}</Box> of <Box component="span" sx={{ fontWeight: 700, color: '#374151' }}>{totalItems}</Box> entries
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Box component="nav" sx={{ display: 'inline-flex', borderRadius: '0.375rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} aria-label="Pagination">
                                                        <Box
                                                            component="button"
                                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                            disabled={currentPage === 1}
                                                            sx={{
                                                                position: 'relative', display: 'inline-flex', alignItems: 'center', px: 1.5, py: 1, borderTopLeftRadius: '0.375rem', borderBottomLeftRadius: '0.375rem', border: '1px solid #e5e7eb', bgcolor: currentPage === 1 ? '#f9fafb' : 'white', color: '#9ca3af',
                                                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, transition: 'background-color 200ms ease', '&:hover': { bgcolor: '#f9fafb' }
                                                            }}
                                                        >
                                                            <span className="sr-only">Previous</span>
                                                            <svg style={{ width: 16, height: 16 }} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                            </svg>
                                                        </Box>

                                                        {Array.from({ length: totalPages }).map((_, idx) => (
                                                            <Box
                                                                component="button"
                                                                key={idx + 1}
                                                                onClick={() => setCurrentPage(idx + 1)}
                                                                sx={{
                                                                    position: 'relative', display: 'inline-flex', alignItems: 'center', px: 2, py: 1, fontSize: '0.875rem', fontWeight: 600, borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', borderLeft: idx === 0 ? 'none' : '1px solid #e5e7eb', borderRight: idx === totalPages - 1 ? 'none' : '1px solid #e5e7eb',
                                                                    ...(currentPage === idx + 1 ? { zIndex: 10, bgcolor: '#5A725A', color: 'white', borderColor: '#5A725A' } : { color: '#374151', bgcolor: 'white', cursor: 'pointer', transition: 'background-color 200ms ease', '&:hover': { bgcolor: '#f9fafb' } })
                                                                }}
                                                            >
                                                                {idx + 1}
                                                            </Box>
                                                        ))}

                                                        <Box
                                                            component="button"
                                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                            disabled={currentPage === totalPages}
                                                            sx={{
                                                                position: 'relative', display: 'inline-flex', alignItems: 'center', px: 1.5, py: 1, borderTopRightRadius: '0.375rem', borderBottomRightRadius: '0.375rem', border: '1px solid #e5e7eb', bgcolor: currentPage === totalPages ? '#f9fafb' : 'white', color: '#9ca3af',
                                                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, transition: 'background-color 200ms ease', '&:hover': { bgcolor: '#f9fafb' }
                                                            }}
                                                        >
                                                            <span className="sr-only">Next</span>
                                                            <svg style={{ width: 16, height: 16 }} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                            </svg>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )
                                })()}
                            </Paper>
                        </Box>
                    </Box>
                    </Paper>
                </Box>
            )}

            
            <Dialog 
                open={isModalOpen && !!selectedDayDetails} 
                onClose={() => setIsModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', overflow: 'hidden' }
                }}
            >
                <DialogTitle sx={{ p: 3, borderBottom: '1px solid #f3f4f6', bgcolor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <svg style={{ width: 20, height: 20, color: '#5A725A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {selectedDayDetails ? new Date(selectedDayDetails).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                    </Typography>
                    <IconButton onClick={() => setIsModalOpen(false)} sx={{ p: 1, color: '#9ca3af', '&:hover': { color: '#4b5563', bgcolor: '#e5e7eb' }, borderRadius: '0.5rem', transition: 'colors 200ms ease' }}>
                        <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ mt: 2 }}>
                        <Typography component="label" sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 1 }}>Attendance Status</Typography>
                        {isEditing ? (
                            <Select
                                value={formData?.leaveAndAttendance?.attendanceLog?.[selectedDayDetails] || ""}
                                onChange={(e) => {
                                    const newLog = { ...(formData.leaveAndAttendance.attendanceLog || {}) };
                                    if (e.target.value) newLog[selectedDayDetails] = e.target.value;
                                    else delete newLog[selectedDayDetails];
                                    handleChange("attendanceLog", newLog);
                                }}
                                displayEmpty
                                fullWidth
                                sx={{
                                    bgcolor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', fontWeight: 700, color: '#374151',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9ca3af' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#5A725A', borderWidth: '2px' }
                                }}
                            >
                                <MenuItem value=""><em>-- Clear Status --</em></MenuItem>
                                <MenuItem value="Present">Present</MenuItem>
                                <MenuItem value="Absent">Absent</MenuItem>
                                <MenuItem value="Late">Late</MenuItem>
                                <MenuItem value="Half Day">Half Day</MenuItem>
                                <MenuItem value="On Leave">On Leave</MenuItem>
                            </Select>
                        ) : (
                            <Box sx={{
                                px: 2.5, py: 1.5, borderRadius: '0.75rem', border: '1px solid', display: 'inline-block', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', fontWeight: 900, fontSize: '0.875rem',
                                ...(() => {
                                    const s = formData?.leaveAndAttendance?.attendanceLog?.[selectedDayDetails];
                                    if (s === 'Present') return { bgcolor: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' };
                                    if (s === 'Absent') return { bgcolor: '#fef2f2', color: '#e11d48', borderColor: '#fecdd3' };
                                    if (s === 'Late') return { bgcolor: '#fefce8', color: '#d97706', borderColor: '#fde047' };
                                    if (s === 'Half Day') return { bgcolor: '#fffbeb', color: '#d97706', borderColor: '#fde68a' };
                                    if (s === 'On Leave') return { bgcolor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' };
                                    return { bgcolor: 'white', color: '#374151', borderColor: '#e5e7eb' };
                                })()
                            }}>
                                {formData?.leaveAndAttendance?.attendanceLog?.[selectedDayDetails] || "NOT MARKED"}
                            </Box>
                        )}
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <Typography component="label" sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 1 }}>Check In Time</Typography>
                            {isEditing ? (
                                <TextField
                                    type="time"
                                    value={formData?.leaveAndAttendance?.dailyDetails?.[selectedDayDetails]?.inTime || ""}
                                    onChange={(e) => handleDailyDetailChange(selectedDayDetails, "inTime", e.target.value)}
                                    fullWidth
                                    sx={{
                                        bgcolor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', 
                                        '& .MuiInputBase-input': { fontWeight: 700, color: '#374151', py: 1.5 },
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db', borderRadius: '0.75rem' },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#5A725A', borderWidth: '2px' }
                                    }}
                                />
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f9fafb', px: 2.5, py: 1.5, border: '1px solid #f3f4f6', borderRadius: '0.75rem', fontWeight: 700, color: '#1f2937' }}>
                                    <svg style={{ width: 16, height: 16, color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                    {formData?.leaveAndAttendance?.dailyDetails?.[selectedDayDetails]?.inTime || "--:--"}
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            <Typography component="label" sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 1 }}>Check Out Time</Typography>
                            {isEditing ? (
                                <TextField
                                    type="time"
                                    value={formData?.leaveAndAttendance?.dailyDetails?.[selectedDayDetails]?.outTime || ""}
                                    onChange={(e) => handleDailyDetailChange(selectedDayDetails, "outTime", e.target.value)}
                                    fullWidth
                                    sx={{
                                        bgcolor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', 
                                        '& .MuiInputBase-input': { fontWeight: 700, color: '#374151', py: 1.5 },
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db', borderRadius: '0.75rem' },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#5A725A', borderWidth: '2px' }
                                    }}
                                />
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f9fafb', px: 2.5, py: 1.5, border: '1px solid #f3f4f6', borderRadius: '0.75rem', fontWeight: 700, color: '#1f2937' }}>
                                    <svg style={{ width: 16, height: 16, color: '#f43f5e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                    {formData?.leaveAndAttendance?.dailyDetails?.[selectedDayDetails]?.outTime || "--:--"}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3, bgcolor: '#f9fafb', borderTop: '1px solid #f3f4f6', justifyContent: 'flex-end' }}>
                    <Button
                        onClick={() => setIsModalOpen(false)}
                        sx={{
                            px: 4, py: 1.25, bgcolor: '#5A725A', color: 'white', borderRadius: '0.75rem', fontWeight: 700,
                            boxShadow: '0 10px 15px -3px rgba(90, 114, 90, 0.2)', '&:hover': { bgcolor: '#465a46' }, textTransform: 'none'
                        }}
                    >
                        Close View
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default DuringEmployment
