import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

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

    useEffect(() => {
        const savedProfiles = JSON.parse(localStorage.getItem('employee_profiles') || '{}')
        setEmployees(savedProfiles)
    }, [])

    useEffect(() => {
        if (selectedEmpId && employees[selectedEmpId]) {
            const empData = employees[selectedEmpId]
            empData.leaveAndAttendance = {
                ...empData.leaveAndAttendance,
                inOutTiming: empData.leaveAndAttendance?.inOutTiming || "09:00 AM - 06:30 PM",
                totalWorkingDays: empData.leaveAndAttendance?.totalWorkingDays || "22 Days",
                monthWorkingDays: empData.leaveAndAttendance?.totalWorkingDays || "26 days",
                leaveDaysTaken: empData.leaveAndAttendance?.leaveDaysTaken || "0 Days",
                leaveRecords: empData.leaveAndAttendance?.leaveRecords || [],
                dailyDetails: empData.leaveAndAttendance?.dailyDetails || {},
                attendanceLog: empData.leaveAndAttendance?.attendanceLog || {}
            }
            setFormData(empData)
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
        localStorage.setItem('employee_profiles', JSON.stringify(updatedEmployees))
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
    const handleUploadAttendance = (e) => { e.target.value = null; alert("Import feature coming soon"); };

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
        <div className="w-full space-y-6 pb-10 px-4 xl:px-8 mx-auto mt-2">

            {/* Header matching original Screenshot 1 */}
            <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-[#5A725A] text-white flex items-center justify-center rounded-[14px] shadow-sm">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h2 className="text-[26px] font-bold text-[#1F2937] tracking-tight">
                            During Employment
                        </h2>
                        <p className="text-sm text-[#6B7280] font-medium mt-0.5 tracking-wide">
                            Manage leave and attendance records for active employees.
                        </p>
                    </div>
                </div>
            </div>

            {!selectedEmpId ? (
                // ------------------------- GLOBAL DASHBOARD (Appears when no employee is selected) -------------------------
                <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#5A725A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            Global Attendance Dashboard
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Global Top Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { title: "Total Employees", val: totalEmployees.toString(), c: "gray", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
                                { title: "Present", val: presentCount.toString(), c: "emerald", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
                                { title: "Absent", val: absentCount.toString(), c: "rose", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
                                { title: "On Leave", val: onLeaveCount.toString(), c: "blue", icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-${stat.c}-500`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                                        </div>
                                    </div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 opacity-80">{stat.title}</h4>
                                    <div className="text-2xl font-black text-gray-800">{stat.val}</div>
                                </div>
                            ))}
                        </div>

                        {/* Filter Actions & Date Selection */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 mb-4">
                            <div className="flex w-full sm:w-auto gap-3">
                                <div className="relative w-full sm:w-64">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by name, role..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5A725A]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700">
                                    Filter <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                </button>
                            </div>
                            <div className="flex w-full sm:w-auto gap-3 flex-wrap justify-end">
                                {/* The 'Select Date' Input replacing the employee dropdown role */}
                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-bold text-gray-600">Select Date:</label>
                                    <input
                                        type="date"
                                        value={selectedDateStr}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const parts = e.target.value.split('-');
                                                setSelectedDate(new Date(parts[0], parts[1] - 1, parts[2]));
                                            }
                                        }}
                                        className="px-4 py-2 font-bold text-[#5A725A] border border-[#5A725A] bg-[#5A725A]/5 rounded-lg outline-none cursor-pointer hover:bg-[#5A725A]/10 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Global List Table */}
                        <div className="border border-gray-100 rounded-xl overflow-x-auto shadow-sm">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Check In</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Check Out</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.values(employees)
                                        .filter(emp =>
                                            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            (emp.jobTitle?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                            (emp.department?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                            emp.empId.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((emp) => {
                                            // Use actual status for the selected date
                                            const status = emp.leaveAndAttendance?.attendanceLog?.[selectedDateStr] || "Not Marked";

                                            const getBg = (s) =>
                                                s === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                    s === 'Absent' ? 'bg-red-50 text-red-600 border-red-200' :
                                                        s === 'Late' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                            s === 'Half Day' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                                s === 'On Leave' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                                    'bg-gray-50 text-gray-500 border-gray-200';

                                            // Get actual checkin checkout times
                                            const details = emp.leaveAndAttendance?.dailyDetails?.[selectedDateStr] || {};
                                            const inTime = details.inTime || "--:--";
                                            const outTime = details.outTime || "--:--";

                                            return (
                                                <tr key={emp.empId} className="border-b border-gray-50 hover:bg-green-50/30 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-800 flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs uppercase shadow-sm">
                                                            {emp.name.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            {emp.name}
                                                            <div className="text-[10px] text-gray-400 font-medium">ID: {emp.empId}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{emp.jobTitle || emp.department || 'N/A'}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-3 py-1 text-xs font-bold border rounded-lg inline-block min-w-[90px] text-center shadow-sm ${getBg(status)}`}>{status}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-700 text-center">{inTime}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-700 text-center">{outTime}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button onClick={() => setSelectedEmpId(emp.empId)} className="text-xs font-bold text-[#5A725A] hover:bg-[#5A725A] hover:text-white border border-[#5A725A] px-4 py-1.5 rounded-lg transition-colors shadow-sm">
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    {Object.keys(employees).length === 0 && (
                                        <tr><td colSpan="6" className="text-center py-12 text-gray-400 font-medium bg-gray-50/50">No employees registered yet. Go to Employees &gt; Add Employee.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                // ------------------------- DETAIL VIEW (Employee Selected) -------------------------
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 animate-in fade-in zoom-in-95 duration-200 mb-10">
                    <div className="flex flex-col gap-6 mb-8 pb-6 border-b border-gray-100">
                        {/* Top row: Profile Image and Primary Details */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 w-full">
                            <div className="flex items-start gap-6">
                                {/* Profile Image */}
                                <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 flex flex-shrink-0 items-center justify-center overflow-hidden shadow-sm">
                                    {(() => {
                                        const allDocs = JSON.parse(localStorage.getItem('employee_documents') || '{}');
                                        const passportPhoto = allDocs[formData?.empId]?.['Passport Size Photos']?.previewUrl;
                                        const finalImage = passportPhoto || formData?.documentUploads?.profileImage || formData?.profileImage;

                                        if (finalImage) {
                                            return <img src={finalImage} alt={formData?.name} className="w-full h-full object-cover" />;
                                        }
                                        return <span className="text-2xl font-black text-gray-400 uppercase">{formData?.name?.substring(0, 2) || "EMP"}</span>;
                                    })()}
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                                        <h3 className="text-[22px] font-bold text-gray-800 tracking-tight">{formData?.personal?.firstName || formData?.name || "Employee Name"} {formData?.personal?.lastName || ""}</h3>
                                        <span className="bg-[#EBa01e] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm tracking-wide">{formData?.employment?.designation || formData?.jobTitle || "Job Title"}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            {formData?.personal?.personalEmail || formData?.email || formData?.contactInfo?.email || "No Email"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            {formData?.personal?.mobileNumber || formData?.phone || formData?.mobileNo || formData?.contactInfo?.phoneNumber || "No Phone"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {formData?.contact?.currentAddress?.city || formData?.location || "Chennai, Tamilnadu"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedEmpId(null)}
                                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-lg border border-gray-200 transition-colors shadow-sm whitespace-nowrap"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Go to Dashboard
                            </button>
                        </div>

                        {/* Bottom Row: Stats grid */}
                        <div className="flex flex-wrap items-start gap-x-10 gap-y-4 pt-4 border-t border-gray-50/80">
                            <div>
                                <div className="text-[11px] font-bold text-gray-400 mb-0.5">Employee ID</div>
                                <div className="text-[13px] font-bold text-gray-800">{formData?.empId || "N/A"}</div>
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-gray-400 mb-0.5">Experience</div>
                                <div className="text-[13px] font-bold text-gray-800">{formData?.experience || "4+ Years"}</div>
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-gray-400 mb-0.5">On time</div>
                                <div className="text-[13px] font-bold text-gray-800">{formData?.onTime || "80%"}</div>
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-gray-400 mb-0.5">Department</div>
                                <div className="text-[13px] font-bold text-gray-800">{formData?.employment?.department || formData?.department || "N/A"}</div>
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-gray-400 mb-0.5">Attendance Updated Date Time (IST)</div>
                                <div className="text-[13px] font-bold text-gray-800">{(() => {
                                    const now = new Date();
                                    return now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + " at " + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                })()}</div>
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-gray-400 mb-0.5">Available leave counts</div>
                                <div className="text-[13px] font-bold text-gray-800">{formData?.leaveAndAttendance?.leaveCount || "05"}</div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                        {/* Timing */}
                        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1.5 opacity-80">Timing Schedule</span>
                            {isEditing ? (
                                <input type="text" value={formData?.leaveAndAttendance?.inOutTiming} onChange={(e) => handleChange("inOutTiming", e.target.value)} className="w-full bg-gray-50 border border-indigo-200 px-3 py-2 rounded-lg font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-100" />
                            ) : (
                                <div className="text-xl font-black text-gray-800">{formData?.leaveAndAttendance?.inOutTiming}</div>
                            )}
                        </div>
                        {/* Status Days */}
                        {[
                            { label: "Month Working Days", key: "monthWorkingDays", color: "blue" },
                            { label: "Leaves Taken", key: "leaveDaysTaken", color: "rose" }
                        ].map(item => (
                            <div key={item.key} className={`bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:border-${item.color}-200 transition-colors`}>
                                <span className={`text-[10px] font-bold text-${item.color}-500 uppercase tracking-widest block mb-1.5 opacity-80`}>{item.label}</span>
                                {isEditing ? (
                                    <input type="text" value={formData?.leaveAndAttendance?.[item.key]} onChange={(e) => handleChange(item.key, e.target.value)} className={`w-full bg-gray-50 border border-${item.color}-200 px-3 py-2 rounded-lg font-bold text-gray-800 outline-none focus:ring-2 focus:ring-${item.color}-100`} />
                                ) : (
                                    <div className="text-xl font-black text-gray-800">{formData?.leaveAndAttendance?.[item.key]}</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Two Column Layout: Calendar & Details */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                        {/* Calendar Component */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] overflow-hidden">
                            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <h4 className="font-bold text-gray-700 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Attendance Calendar
                                </h4>
                                <div className="flex items-center gap-3">
                                    <button onClick={prevMonth} className="p-1.5 hover:bg-gray-200 rounded-md text-gray-600 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                                    <span className="font-bold text-gray-800 min-w-[130px] text-center tracking-wide">{monthNames[monthCalendar]} {yearCalendar}</span>
                                    <button onClick={nextMonth} className="p-1.5 hover:bg-gray-200 rounded-md text-gray-600 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-7 gap-3 mb-3">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-3">
                                    {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="h-20 bg-gray-50/30 rounded-xl"></div>)}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const dateStr = `${yearCalendar}-${String(monthCalendar + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        const status = formData?.leaveAndAttendance?.attendanceLog?.[dateStr];
                                        const isSelected = selectedDayDetails === dateStr;

                                        return (
                                            <div
                                                key={day}
                                                onClick={() => handleDayClick(dateStr)}
                                                className={`h-22 p-2 border rounded-xl flex flex-col justify-between cursor-pointer transition-all duration-200
                                                    ${getStatusColor(status)} 
                                                    ${isSelected ? 'ring-2 ring-offset-2 ring-[#5A725A] shadow-md scale-105 z-10' : 'hover:scale-105 hover:shadow-md'}
                                                `}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-md ${isSelected ? 'bg-white shadow-sm' : ''} ${!status && isSelected ? 'bg-gray-800 text-white' : ''} ${status ? 'text-inherit opacity-90' : 'text-gray-500'}`}>{day}</span>
                                                </div>
                                                {status && <span className="text-[10px] uppercase font-black text-center bg-white/60 rounded py-1 shadow-sm mt-2">{status}</span>}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            {/* Legend */}
                            <div className="bg-gray-50 border-t border-gray-100 p-4 flex flex-wrap items-center justify-center gap-6">
                                {[
                                    { label: 'Present', color: 'bg-emerald-400' },
                                    { label: 'Absent', color: 'bg-red-400' },
                                    { label: 'Late', color: 'bg-yellow-400' },
                                    { label: 'On Leave', color: 'bg-blue-400' }
                                ].map(st => (
                                    <div key={st.label} className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${st.color} shadow-sm`}></div>
                                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{st.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Detailed Attendance Log Table */}
                        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 text-sm tracking-wide">
                                    <svg className="w-5 h-5 text-[#5A725A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                    Attendance Log
                                </h3>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={shiftFilter}
                                        onChange={(e) => {
                                            setShiftFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="text-sm font-medium text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-[#5A725A] focus:border-transparent cursor-pointer"
                                    >
                                        <option value="All Shift">All Shift</option>
                                        <option value="Day Shift">Day Shift</option>
                                        <option value="Night Shift">Night Shift</option>
                                    </select>
                                    <input
                                        type="month"
                                        value={`${yearCalendar}-${String(monthCalendar + 1).padStart(2, '0')}`}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const [year, month] = e.target.value.split('-');
                                                setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, 1));
                                            }
                                        }}
                                        className="text-sm font-medium text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-[#5A725A] focus:border-transparent cursor-pointer [color-scheme:light]"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Shift</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Check In</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Check Out</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Working Hours</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(() => {
                                            const totalItems = filteredAttendanceRows.length;
                                            const totalPages = Math.ceil(totalItems / itemsPerPage);
                                            const indexOfLastItem = currentPage * itemsPerPage;
                                            const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                                            const currentItems = filteredAttendanceRows.slice(indexOfFirstItem, indexOfLastItem);

                                            if (currentItems.length === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-400 font-medium">
                                                            No attendance records found for this criteria.
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            return (
                                                <>
                                                    {currentItems.map((row) => {
                                                        const { dateStr, displayDate, status, details, shift } = row;

                                                        // Default values mapping
                                                        const inTime = details.inTime || "--:--";
                                                        const outTime = details.outTime || "--:--";

                                                        // Calculate working hours mock
                                                        let workingHours = "Not Recorded";
                                                        if (status === 'Present' || status === 'Late') {
                                                            workingHours = "8 hrs 0 min";
                                                        } else if (status === 'Half Day') {
                                                            workingHours = "4 hrs 0 min";
                                                        }

                                                        const getBg = (s) =>
                                                            s === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                                s === 'Absent' ? 'bg-red-50 text-red-600 border-red-200' :
                                                                    s === 'Late' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                                        s === 'Half Day' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                                            s === 'On Leave' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                                                'bg-red-50 text-red-400 border-red-100 opacity-80'; // styling for Not Recorded

                                                        return (
                                                            <tr key={dateStr} className={`hover:bg-gray-50/50 transition-colors ${!status ? 'opacity-60' : ''}`}>
                                                                <td className="px-6 py-4 text-sm font-bold text-gray-800">{displayDate}</td>
                                                                <td className={`px-6 py-4 text-sm font-medium ${shift === 'Not Recorded' ? 'text-gray-300' : 'text-gray-600'}`}>{shift}</td>
                                                                <td className={`px-6 py-4 text-sm font-bold text-center ${inTime === '--:--' ? 'text-gray-300' : 'text-gray-700'}`}>{inTime}</td>
                                                                <td className={`px-6 py-4 text-sm font-bold text-center ${outTime === '--:--' ? 'text-gray-300' : 'text-gray-700'}`}>{outTime}</td>
                                                                <td className={`px-6 py-4 text-sm font-bold text-center ${workingHours === 'Not Recorded' ? 'text-gray-300' : 'text-gray-700'}`}>{workingHours}</td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <span className={`px-3 py-1 text-xs font-bold border rounded-lg inline-block min-w-[90px] text-center shadow-sm ${getBg(status || 'Casual Leave')}`}>
                                                                        {status || 'Casual Leave'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                </>
                                            );
                                        })()}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {(() => {
                                const totalItems = filteredAttendanceRows.length;
                                const totalPages = Math.ceil(totalItems / itemsPerPage);

                                if (totalItems === 0) return null;

                                const startItem = (currentPage - 1) * itemsPerPage + 1;
                                const endItem = Math.min(currentPage * itemsPerPage, totalItems);

                                return (
                                    <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
                                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">
                                                    Showing <span className="font-bold text-gray-700">{startItem}</span> to <span className="font-bold text-gray-700">{endItem}</span> of{' '}
                                                    <span className="font-bold text-gray-700">{totalItems}</span> entries
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                        className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-200 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 bg-white'}`}
                                                    >
                                                        <span className="sr-only">Previous</span>
                                                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>

                                                    {Array.from({ length: totalPages }).map((_, idx) => (
                                                        <button
                                                            key={idx + 1}
                                                            onClick={() => setCurrentPage(idx + 1)}
                                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${currentPage === idx + 1 ? 'z-10 bg-[#5A725A] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A725A]' : 'text-gray-700 bg-white ring-1 ring-inset ring-gray-200 hover:bg-gray-50'}`}
                                                        >
                                                            {idx + 1}
                                                        </button>
                                                    ))}

                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={currentPage === totalPages}
                                                        className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-200 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 bg-white'}`}
                                                    >
                                                        <span className="sr-only">Next</span>
                                                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* DAY DETAILS POPUP MODAL */}
            {isModalOpen && selectedDayDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#5A725A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {new Date(selectedDayDetails).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Attendance Status</label>
                                {isEditing ? (
                                    <select
                                        value={formData?.leaveAndAttendance?.attendanceLog?.[selectedDayDetails] || ""}
                                        onChange={(e) => {
                                            const newLog = { ...(formData.leaveAndAttendance.attendanceLog || {}) };
                                            if (e.target.value) newLog[selectedDayDetails] = e.target.value;
                                            else delete newLog[selectedDayDetails];
                                            handleChange("attendanceLog", newLog);
                                        }}
                                        className="w-full bg-white border border-gray-300 font-bold text-gray-700 px-4 py-3 rounded-xl shadow-sm focus:border-[#5A725A] focus:ring-2 focus:ring-[#5A725A]/20 outline-none transition-all"
                                    >
                                        <option value="">-- Clear Status --</option>
                                        <option value="Present">Present</option>
                                        <option value="Absent">Absent</option>
                                        <option value="Late">Late</option>
                                        <option value="Half Day">Half Day</option>
                                        <option value="On Leave">On Leave</option>
                                    </select>
                                ) : (
                                    <div className={`font-black text-sm px-5 py-3 rounded-xl border inline-block shadow-sm ${getStatusColor(formData?.leaveAndAttendance?.attendanceLog?.[selectedDayDetails])}`}>
                                        {formData?.leaveAndAttendance?.attendanceLog?.[selectedDayDetails] || "NOT MARKED"}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Check In Time</label>
                                    {isEditing ? (
                                        <input
                                            type="time"
                                            value={formData?.leaveAndAttendance?.dailyDetails?.[selectedDayDetails]?.inTime || ""}
                                            onChange={(e) => handleDailyDetailChange(selectedDayDetails, "inTime", e.target.value)}
                                            className="w-full bg-white border border-gray-300 font-bold text-gray-700 px-4 py-3 rounded-xl shadow-sm outline-none focus:border-[#5A725A] focus:ring-2 focus:ring-[#5A725A]/20"
                                        />
                                    ) : (
                                        <div className="font-bold text-gray-800 bg-gray-50 px-5 py-3 border border-gray-100 rounded-xl flex items-center gap-2">
                                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                            {formData?.leaveAndAttendance?.dailyDetails?.[selectedDayDetails]?.inTime || "--:--"}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Check Out Time</label>
                                    {isEditing ? (
                                        <input
                                            type="time"
                                            value={formData?.leaveAndAttendance?.dailyDetails?.[selectedDayDetails]?.outTime || ""}
                                            onChange={(e) => handleDailyDetailChange(selectedDayDetails, "outTime", e.target.value)}
                                            className="w-full bg-white border border-gray-300 font-bold text-gray-700 px-4 py-3 rounded-xl shadow-sm outline-none focus:border-[#5A725A] focus:ring-2 focus:ring-[#5A725A]/20"
                                        />
                                    ) : (
                                        <div className="font-bold text-gray-800 bg-gray-50 px-5 py-3 border border-gray-100 rounded-xl flex items-center gap-2">
                                            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                            {formData?.leaveAndAttendance?.dailyDetails?.[selectedDayDetails]?.outTime || "--:--"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-8 py-2.5 bg-[#5A725A] text-white rounded-xl font-bold shadow-lg shadow-[#5A725A]/20 hover:bg-[#465a46] transition-all active:scale-95"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DuringEmployment
