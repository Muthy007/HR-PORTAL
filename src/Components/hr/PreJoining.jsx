import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

const initialEmployeeList = []

const documentList = []

function PreJoining() {

  const navigate = useNavigate()
  const [employees, setEmployees] = useState(initialEmployeeList)
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    department: '',
    role: '',
    email: '',
    doj: '',
    employmentType: ''
  })
  const [deptOption, setDeptOption] = useState('')
  const [showRegisterPopup, setShowRegisterPopup] = useState(false)

  const [showDocsPopup, setShowDocsPopup] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [documents, setDocuments] = useState([])

  const [showColumnFilter, setShowColumnFilter] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState({
    role: false,
    email: false,
    employmentType: false
  })
  const filterRef = useRef(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("https://localhost:7134/api/EmployeeMaster");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Convert backend fields to frontend format
        const savedProfiles = JSON.parse(localStorage.getItem('employee_profiles') || '{}');
        const formattedData = data.map(emp => {
          const empCode = emp.employeeCode;
          const localProfile = savedProfiles[empCode];
          const displayName = localProfile?.personal?.fullNameAadharPan || localProfile?.name || emp.fullName;

          return {
            id: emp.empId,
            empId: empCode,
            name: displayName,
            department: emp.department,
            role: emp.designation,
            email: emp.emailId,
            doj: emp.dateOfJoining,
            employmentType: emp.employmentType
          }
        });

        setEmployees(formattedData);

      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (filterRef.current && !filterRef.current.contains(event.target)) {
  //       setShowColumnFilter(false)
  //     }
  //   }

  //   if (showColumnFilter) {
  //     document.addEventListener("mousedown", handleClickOutside)
  //   }

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside)
  //   }
  // }, [showColumnFilter])

  const nextEmpId = employees.length > 0
    ? `EMP${String(Math.max(...employees.map(e => parseInt(e.empId.replace(/[^0-9]/g, '') || 0))) + 1).padStart(3, '0')}`
    : "EMP001"

  const handleRegisterEmployee = async (e) => {
    e.preventDefault()
    if (!newEmployee.name || !newEmployee.department) return

    // Prepare data for backend
    const registerData = {
      employeeCode: nextEmpId,
      fullName: newEmployee.name,
      emailId: newEmployee.email || "",
      phone: "0000000000",
      emergencyContact: "0000000000",
      department: newEmployee.department,
      designation: newEmployee.role || "",
      dateOfJoining: newEmployee.doj || new Date().toISOString().split('T')[0],
      employmentType: newEmployee.employmentType || "Full-time"
    };

    try {
      const response = await fetch("https://localhost:7134/api/EmployeeMaster/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "*/*"
        },
        body: JSON.stringify(registerData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend Error Details:", errorText);
        throw new Error(`Failed to register employee: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log("Backend Registration Response:", responseData);

      // Create new employee object for frontend state
      const newId = responseData.empId || (employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1);
      const addedEmployee = {
        id: newId,
        empId: nextEmpId,
        ...newEmployee
      };

      setEmployees([...employees, addedEmployee]);
      console.log("Newly Registered Employee Details:", JSON.stringify(addedEmployee, null, 2));

      // Sync the registered data to employee_profiles for the EmployeeProfile page
      const savedProfiles = JSON.parse(localStorage.getItem('employee_profiles') || '{}');
      savedProfiles[nextEmpId] = {
        empId: nextEmpId,
        name: newEmployee.name,
        department: newEmployee.department,
        personal: {
          fullNameAadharPan: newEmployee.name,
          personalEmail: newEmployee.email || "",
        },
        employment: {
          employeeId: nextEmpId,
          department: newEmployee.department,
          designation: newEmployee.role || "",
          employmentType: newEmployee.employmentType || "",
          reportingManager: "",
          dateOfJoining: newEmployee.doj || "",
          probationPeriod: "",
          confirmationDate: "",
          employeeGradeLevel: ""
        }
      };
      localStorage.setItem('employee_profiles', JSON.stringify(savedProfiles));

      // Reset form
      setNewEmployee({ name: '', department: '', role: '', email: '', doj: '', employmentType: '' });
      setDeptOption('');
      setShowRegisterPopup(false);

      alert("Employee registered successfully!");

    } catch (error) {
      console.error("Error registering employee:", error);
      alert("Failed to register employee on the server. Please try again.");
    }
  }

  const handleOpenDocs = (emp, e) => {
    e.stopPropagation()
    setSelectedEmployee(emp)

    const savedDocs = JSON.parse(localStorage.getItem('employee_documents') || '{}')
    const empDocs = savedDocs[emp.empId] || {}

    const defaultDocs = [
      "Resume / CV",
      "Offer Letter",
      "Appointment Letter",
      "ID Proof (Aadhar / PAN / Passport)",
      "Address Proof",
      "Educational Certificates",
      "Experience Letters",
      "Passport Size Photos",
      "Bank Account Details",
      "Signed NDA"
    ];

    const keysToUse = Object.keys(empDocs).length > 0 ? Object.keys(empDocs) : defaultDocs;

    setDocuments(
      keysToUse.map(name => {
        const docData = empDocs[name]
        return {
          name,
          file: null,
          isSaved: docData ? (typeof docData === 'object' ? docData.isSaved : docData) : false,
          previewUrl: docData && typeof docData === 'object' ? docData.previewUrl : null
        }
      })
    )
    setShowDocsPopup(true)
  }

  const handleFileUpload = (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    const updatedDocs = [...documents]
    updatedDocs[index].file = file


    if (updatedDocs[index].name === "Passport Size Photos") {
      const reader = new FileReader()
      reader.onloadend = () => {
        updatedDocs[index].previewUrl = reader.result
        setDocuments([...updatedDocs])
      }
      reader.readAsDataURL(file)
    } else {
      setDocuments(updatedDocs)
    }
  }

  const handleView = (file) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    window.open(url)
  }

  const handleSubmitDocs = () => {
    if (!selectedEmployee) return

    const existingDocs = JSON.parse(localStorage.getItem('employee_documents') || '{}')
    const savedDocsForEmp = existingDocs[selectedEmployee.empId] || {}

    const documentStatusMap = {}
    documents.forEach(doc => {
      documentStatusMap[doc.name] = {
        isSaved: !!doc.file || doc.isSaved,
        previewUrl: doc.previewUrl || (doc.isSaved && savedDocsForEmp[doc.name]?.previewUrl) || null
      }
    })

    existingDocs[selectedEmployee.empId] = documentStatusMap
    localStorage.setItem('employee_documents', JSON.stringify(existingDocs))

    setDocuments(documents.map(doc => ({
      ...doc,
      isSaved: !!doc.file || doc.isSaved
    })))

    alert(`Documents submitted for ${selectedEmployee.name}`)
    setShowDocsPopup(false)
    setSelectedEmployee(null)
  }

  const getEmployeeDocStatus = (empId) => {
    const savedDocs = JSON.parse(localStorage.getItem('employee_documents') || '{}')
    const empDocs = savedDocs[empId] || {}
    const docKeys = Object.keys(empDocs);
    const totalDocs = docKeys.length;

    if (totalDocs === 0) return { label: 'Pending', color: 'red' }

    const savedCount = docKeys.filter(name => {
      const docData = empDocs[name]
      return docData && (typeof docData === 'object' ? docData.isSaved : docData === true)
    }).length

    if (savedCount === 0) return { label: 'Pending', color: 'red' }
    if (savedCount === totalDocs) return { label: 'Completed', color: 'green' }
    return { label: `${savedCount}/${totalDocs}`, color: 'yellow' }
  }

  const uploadedCount = documents.filter(doc => doc.file || doc.isSaved).length

  return (
    <div className="space-y-6 relative">

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#5A725A]">
          Pre-Joining / Onboarding Documents
        </h2>
        <button
          onClick={() => setShowRegisterPopup(true)}
          className="bg-[#5A725A] text-white p-2 rounded-full hover:bg-[#4a5f4a] transition-colors shadow-sm flex justify-center items-center h-10 w-10"
          title="Add Employee"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </button>
      </div>

      {/* Employee Register Popup */}
      {showRegisterPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl relative my-auto">
            <button
              onClick={() => setShowRegisterPopup(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center gap-3 mb-6 relative">
              <div className="bg-[#5A725A]/10 p-3 rounded-xl">
                <svg className="w-6 h-6 text-[#5A725A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Employee Register</h3>
            </div>

            <form onSubmit={handleRegisterEmployee} className="space-y-5 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-[#5A725A]/20 focus:border-[#5A725A] outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email ID <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    placeholder="e.g. jane@company.com"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-[#5A725A]/20 focus:border-[#5A725A] outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Employee ID <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nextEmpId}
                      readOnly
                      className="w-full border border-gray-200 px-4 py-2.5 rounded-xl bg-gray-50 text-gray-500 font-mono text-sm cursor-not-allowed"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 bg-gray-200 rounded-full">
                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department <span className="text-red-500">*</span></label>
                  <select
                    value={deptOption}
                    onChange={(e) => {
                      setDeptOption(e.target.value)
                      if (e.target.value !== 'Other') {
                        setNewEmployee({ ...newEmployee, department: e.target.value })
                      } else {
                        setNewEmployee({ ...newEmployee, department: '' })
                      }
                    }}
                    className={`w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-[#5A725A]/20 focus:border-[#5A725A] outline-none transition-all cursor-pointer appearance-none bg-gray-50 hover:bg-white ${deptOption === 'Other' ? 'mb-3' : ''}`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                    required
                  >
                    <option value="" disabled>Select Department</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Trainee">Trainee</option>
                    <option value="Other">Other</option>
                  </select>
                  {deptOption === 'Other' && (
                    <input
                      type="text"
                      placeholder="Enter Custom Department"
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                      className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-[#5A725A]/20 focus:border-[#5A725A] outline-none transition-all placeholder:text-gray-400"
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Designation / Role <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-[#5A725A]/20 focus:border-[#5A725A] outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Joining (DOJ) <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={newEmployee.doj}
                    onChange={(e) => setNewEmployee({ ...newEmployee, doj: e.target.value })}
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-[#5A725A]/20 focus:border-[#5A725A] outline-none transition-all text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Employment Type <span className="text-red-500">*</span></label>
                  <select
                    value={newEmployee.employmentType}
                    onChange={(e) => setNewEmployee({ ...newEmployee, employmentType: e.target.value })}
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-[#5A725A]/20 focus:border-[#5A725A] outline-none transition-all cursor-pointer appearance-none bg-gray-50 hover:bg-white"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                    required
                  >
                    <option value="" disabled>Select Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#5A725A] text-white px-4 py-3 rounded-xl hover:bg-[#4a5f4a] transition-colors font-bold shadow-sm flex justify-center items-center gap-2 mt-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Add New Employee
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Documents Popup Modal */}
      {showDocsPopup && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDocsPopup(false)}></div>

          {/* Modal Content */}
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden transform transition-all">

            {/* Modal Header */}
            <div className="pt-6 pb-6 px-8 border-b border-gray-100 flex items-center justify-between bg-white relative">
              {/* Left Details with Profile Box */}
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 shrink-0 bg-gray-50 text-gray-400 rounded-3xl flex items-center justify-center text-5xl font-bold font-serif shadow-sm border border-gray-100 overflow-hidden ring-4 ring-gray-50/50">
                  {/* Check if passport photo exists in memory or storage via the documents state */}
                  {(() => {
                    const passportDoc = documents.find(d => d.name === "Passport Size Photos")
                    if (passportDoc && passportDoc.previewUrl) {
                      return <img src={passportDoc.previewUrl} alt="Profile" className="w-full h-full object-cover" />
                    }
                    return <span className="uppercase text-[#5A725A] bg-gradient-to-br from-[#5A725A]/10 to-[#5A725A]/20 w-full h-full flex items-center justify-center">{selectedEmployee.name.charAt(0)}</span>
                  })()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-[26px] font-black text-gray-800 tracking-tight leading-none">{selectedEmployee.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md border border-gray-200">Documents Verification</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="text-sm font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm">{selectedEmployee.empId}</span>
                    <span className="text-sm font-bold text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-lg">{selectedEmployee.department} Dept</span>
                  </div>
                </div>
              </div>

              {/* Right Close */}
              <div className="flex items-start h-full self-start">
                <button
                  onClick={() => setShowDocsPopup(false)}
                  className="text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 p-2.5 rounded-full transition-colors border border-gray-200 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">

              {/* Stats row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <span className="text-xl">📊</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Docs</p>
                    <p className="text-xl font-bold text-gray-800">{documents.length}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded</p>
                    <p className="text-xl font-bold text-green-600">{uploadedCount}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending</p>
                    <p className="text-xl font-bold text-red-500">{documents.length - uploadedCount}</p>
                  </div>
                </div>
              </div>

              {/* Documents Table inside Modal */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">Document Name</th>
                      <th className="p-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="p-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">File</th>
                      <th className="p-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {documents.map((doc, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-3 px-5 font-medium text-gray-800 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          <span className="text-sm">{doc.name}</span>
                        </td>

                        <td className="p-3 px-5">
                          {(doc.file || doc.isSaved) ? (
                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              UPLOADED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              PENDING
                            </span>
                          )}
                        </td>

                        <td className="p-3 px-5">
                          {doc.file ? (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md w-max">
                              <svg className="w-3 h-3 text-[#5A725A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                              <span className="truncate max-w-[120px]">{doc.file.name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No file selected</span>
                          )}
                        </td>

                        <td className="p-3 px-5 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleView(doc.file); }}
                            disabled={!doc.file}
                            className="text-xs font-semibold text-[#5A725A] hover:text-[#4a5f4a] disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            Preview
                          </button>

                          <label className="cursor-pointer inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm text-xs font-medium">
                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Upload
                            <input
                              type="file"
                              accept={doc.name === "Passport Size Photos" ? "image/*" : "application/pdf,image/*"}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleFileUpload(e, index)}
                              className="hidden"
                            />
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end items-center gap-3">
              <button
                onClick={() => setShowDocsPopup(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSubmitDocs()
                }}
                className="bg-[#5A725A] text-white px-6 py-2.5 rounded-xl hover:bg-[#4a5f4a] transition-all text-sm font-bold shadow-md hover:shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Save & Submit Files
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Employees List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-2">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 overflow-visible">
          <div className="flex items-center gap-3">
            <div className="bg-[#5A725A]/10 p-2.5 rounded-lg">
              <svg className="w-5 h-5 text-[#5A725A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">All Employees Directory</h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{employees.length} Members</span>

            {/* Column Filter Dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowColumnFilter(!showColumnFilter)}
                className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filters
              </button>

              {showColumnFilter && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-2">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Toggle Columns</span>
                  </div>
                  <label className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 transition-colors group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={visibleColumns.role}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, role: e.target.checked })}
                        className="peer appearance-none w-4 h-4 border-2 border-gray-300 rounded checked:bg-[#5A725A] checked:border-[#5A725A] transition-all cursor-pointer"
                      />
                      <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    Designation / Role
                  </label>
                  <label className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 transition-colors group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={visibleColumns.email}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, email: e.target.checked })}
                        className="peer appearance-none w-4 h-4 border-2 border-gray-300 rounded checked:bg-[#5A725A] checked:border-[#5A725A] transition-all cursor-pointer"
                      />
                      <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    Email ID
                  </label>
                  <label className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 transition-colors group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={visibleColumns.employmentType}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, employmentType: e.target.checked })}
                        className="peer appearance-none w-4 h-4 border-2 border-gray-300 rounded checked:bg-[#5A725A] checked:border-[#5A725A] transition-all cursor-pointer"
                      />
                      <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    Employment Type
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="p-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="p-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="p-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                {visibleColumns.email && <th className="p-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left transition-all duration-300">Email ID</th>}
                <th className="p-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                {visibleColumns.role && <th className="p-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left transition-all duration-300">Designation</th>}
                <th className="p-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date of Joining</th>
                {visibleColumns.employmentType && <th className="p-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left transition-all duration-300">Employment Type</th>}
                <th className="p-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider pr-2">Documents</th>
                <th className="p-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right pl-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-gray-500 font-medium italic">
                    No employee data available
                  </td>
                </tr>
              ) : (
                employees.map((emp, index) => (
                  <tr
                    key={emp.id}
                    onClick={() => navigate(`/hr/employee/${emp.empId}`, { state: { name: emp.name, department: emp.department } })}
                    className="hover:bg-[#5A725A]/5 cursor-pointer transition-colors group"
                  >
                    <td className="p-4 px-6 text-gray-500 text-sm">{index + 1}</td>
                    <td className="p-4 px-6">
                      <span className="font-mono text-sm font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md group-hover:bg-white group-hover:border group-hover:border-gray-200 transition-colors">
                        {emp.empId}
                      </span>
                    </td>
                    <td className="p-4 px-6 font-semibold text-gray-800 text-sm whitespace-nowrap">{emp.name}</td>

                    {visibleColumns.email && (
                      <td className="p-4 px-6 text-sm text-gray-600 transition-all duration-300">
                        {emp.email}
                      </td>
                    )}

                    <td className="p-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full bg-gray-50 group-hover:bg-white transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5A725A]"></span>
                        {emp.department}
                      </span>
                    </td>

                    {visibleColumns.role && (
                      <td className="p-4 px-6 text-sm text-gray-600 whitespace-nowrap transition-all duration-300">
                        {emp.role}
                      </td>
                    )}

                    <td className="p-4 px-6 text-sm">
                      <span className="text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md whitespace-nowrap w-max group-hover:bg-white transition-colors inline-block">
                        {emp.doj ? new Date(emp.doj).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                      </span>
                    </td>

                    {visibleColumns.employmentType && (
                      <td className="p-4 px-6 text-sm transition-all duration-300">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border ${emp.employmentType === 'Full-time' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          emp.employmentType === 'Contract' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                            emp.employmentType === 'Intern' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                          {emp.employmentType}
                        </span>
                      </td>
                    )}

                    <td className="p-4 px-6 pr-2">
                      {(() => {
                        const status = getEmployeeDocStatus(emp.empId)
                        return (
                          <button
                            onClick={(e) => handleOpenDocs(emp, e)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide transition-colors ${status.color === 'red' ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 group-hover:bg-red-100' :
                              status.color === 'green' ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 group-hover:bg-green-100' :
                                'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 group-hover:bg-yellow-100'
                              }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${status.color === 'red' ? 'bg-red-500' :
                              status.color === 'green' ? 'bg-green-500' :
                                'bg-yellow-500'
                              }`}></span>
                            {status.label}
                          </button>
                        )
                      })()}
                    </td>
                    <td className="p-4 px-6 text-right pl-2">
                      <button className="text-[#5A725A] hover:text-[#4a5f4a] font-medium text-sm flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        View Profile
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default PreJoining
