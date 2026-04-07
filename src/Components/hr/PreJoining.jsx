import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../assets/connection"
import { 
  Box, Typography, Button, IconButton, TextField, 
  Select, MenuItem, Dialog, DialogTitle, DialogContent, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Avatar, InputAdornment, Chip, Tooltip,
  Menu, Checkbox
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import FilterListIcon from '@mui/icons-material/FilterList';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LockClockIcon from '@mui/icons-material/LockClock';

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
  const [docStatuses, setDocStatuses] = useState({})

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
        const response = await fetch(`${API_BASE_URL}/api/EmployeeMaster`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Convert backend fields to frontend format
        const formattedData = data.map(emp => {
          const empCode = emp.employeeCode;
          const displayName = emp.fullName;

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

        // Fetch document statuses for all employees
        const statuses = {};
        await Promise.all(formattedData.map(async (emp) => {
          const numericId = String(emp.empId).replace(/[^0-9]/g, '') || emp.empId;
          try {
            const docRes = await fetch(`${API_BASE_URL}/api/EmployeeMaster/${numericId}/documents`);
            if (docRes.ok) {
              const dbDocs = await docRes.json();
              if (dbDocs) {
                const keysToCheck = [
                  'resume', 'offerLetter', 'appointmentLetter', 'idProof', 'addressProof',
                  'educationalCertificates', 'experienceLetters', 'passportPhotos',
                  'bankAccountDetails', 'signedNda'
                ];
                let count = 0;
                keysToCheck.forEach(key => {
                  if (dbDocs[key]) count++;
                });
                statuses[emp.empId] = count;
              } else {
                statuses[emp.empId] = 0;
              }
            } else {
              statuses[emp.empId] = 0;
            }
          } catch (e) {
            console.error("Error fetching docs for", emp.empId, e);
            statuses[emp.empId] = 0;
          }
        }));
        setDocStatuses(statuses);

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
    ? `ET${String(Math.max(...employees.map(e => parseInt(e.empId.replace(/[^0-9]/g, '') || 0))) + 1).padStart(3, '0')}`
    : "ET001"

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
      const response = await fetch(`${API_BASE_URL}/api/EmployeeMaster/register`, {
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

  const handleOpenDocs = async (emp, e) => {
    e.stopPropagation();
    setSelectedEmployee(emp);

    const numericId = String(emp.empId).replace(/[^0-9]/g, '') || emp.empId;
    const defaultDocs = [
      "Resume / CV", "Offer Letter", "Appointment Letter",
      "ID Proof (Aadhar / PAN / Passport)", "Address Proof",
      "Educational Certificates", "Experience Letters",
      "Passport Size Photos", "Bank Account Details", "Signed NDA"
    ];

    try {
      const res = await fetch(`${API_BASE_URL}/api/EmployeeMaster/${numericId}/documents`);
      let dbDocs = null;
      if (res.ok) {
        dbDocs = await res.json();
      }

      let mappedDocs = {};
      if (dbDocs) {
        if (dbDocs.resume) mappedDocs["Resume / CV"] = { isSaved: true, previewUrl: `data:application/pdf;base64,${dbDocs.resume}` };
        if (dbDocs.offerLetter) mappedDocs["Offer Letter"] = { isSaved: true, previewUrl: `data:application/pdf;base64,${dbDocs.offerLetter}` };
        if (dbDocs.appointmentLetter) mappedDocs["Appointment Letter"] = { isSaved: true, previewUrl: `data:application/pdf;base64,${dbDocs.appointmentLetter}` };
        if (dbDocs.idProof) mappedDocs["ID Proof (Aadhar / PAN / Passport)"] = { isSaved: true, previewUrl: `data:application/octet-stream;base64,${dbDocs.idProof}` };
        if (dbDocs.addressProof) mappedDocs["Address Proof"] = { isSaved: true, previewUrl: `data:application/octet-stream;base64,${dbDocs.addressProof}` };
        if (dbDocs.educationalCertificates) mappedDocs["Educational Certificates"] = { isSaved: true, previewUrl: `data:application/pdf;base64,${dbDocs.educationalCertificates}` };
        if (dbDocs.experienceLetters) mappedDocs["Experience Letters"] = { isSaved: true, previewUrl: `data:application/pdf;base64,${dbDocs.experienceLetters}` };
        if (dbDocs.passportPhotos) mappedDocs["Passport Size Photos"] = { isSaved: true, previewUrl: `data:image/jpeg;base64,${dbDocs.passportPhotos}` };
        if (dbDocs.bankAccountDetails) mappedDocs["Bank Account Details"] = { isSaved: true, previewUrl: `data:application/pdf;base64,${dbDocs.bankAccountDetails}` };
        if (dbDocs.signedNda) mappedDocs["Signed NDA"] = { isSaved: true, previewUrl: `data:application/pdf;base64,${dbDocs.signedNda}` };
      }

      setDocuments(
        defaultDocs.map(name => {
          const docData = mappedDocs[name];
          return {
            name,
            file: null,
            isSaved: docData ? true : false,
            previewUrl: docData ? docData.previewUrl : null
          }
        })
      );

      // Update the local docStatus to reflect the reality
      let count = 0;
      Object.keys(mappedDocs).forEach(k => {
        if (mappedDocs[k]) count++;
      });
      setDocStatuses(prev => ({ ...prev, [emp.empId]: count }));

      setShowDocsPopup(true);
    } catch (err) {
      console.error("Failed to load documents", err);
      // Fallback to empty docs if error
      setDocuments(
        defaultDocs.map(name => ({
          name,
          file: null,
          isSaved: false,
          previewUrl: null
        }))
      );
      setShowDocsPopup(true);
    }
  }

  const handleFileUpload = (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    const updatedDocs = [...documents]
    updatedDocs[index].file = file

    // Always generate previewUrl for UI display
    const reader = new FileReader()
    reader.onloadend = () => {
      updatedDocs[index].previewUrl = reader.result
      setDocuments([...updatedDocs])
    }
    reader.readAsDataURL(file)
  }

  const handleView = (doc) => {
    if (doc.file) {
      const url = URL.createObjectURL(doc.file)
      window.open(url)
    } else if (doc.previewUrl) {
      // For browsers that block large data URI popups, try to convert to a Blob first
      try {
        if (doc.previewUrl.startsWith('data:')) {
          const arr = doc.previewUrl.split(',');
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });
          const url = URL.createObjectURL(blob);
          window.open(url);
        } else {
          window.open(doc.previewUrl);
        }
      } catch (e) {
        window.open(doc.previewUrl);
      }
    }
  }

  const handleResetDocs = () => {
    if (!selectedEmployee) return;
    if (!window.confirm(`Are you sure you want to reset and delete all uploaded files from current screen for ${selectedEmployee.name}?`)) return;

    // Reset state locally
    setDocuments(documents.map(doc => ({
      ...doc,
      file: null,
      isSaved: false,
      previewUrl: null
    })));
  }

  const handleSubmitDocs = async () => {
    if (!selectedEmployee) return

    const formData = new FormData();
    formData.append("EmployeeId", selectedEmployee.id);

    const docNameMapping = {
      "Resume / CV": "Resume",
      "Offer Letter": "OfferLetter",
      "Appointment Letter": "AppointmentLetter",
      "ID Proof (Aadhar / PAN / Passport)": "IdProof",
      "Address Proof": "AddressProof",
      "Educational Certificates": "EducationalCertificates",
      "Experience Letters": "ExperienceLetters",
      "Passport Size Photos": "PassportPhotos",
      "Bank Account Details": "BankAccountDetails",
      "Signed NDA": "SignedNda"
    };

    let hasFilesToUpload = false;

    documents.forEach(doc => {
      if (doc.file) {
        const fieldName = docNameMapping[doc.name];
        if (fieldName) {
          formData.append(fieldName, doc.file);
          hasFilesToUpload = true;
        }
      }
    });

    try {
      if (hasFilesToUpload) {
        const response = await fetch(`${API_BASE_URL}/api/EmployeeMaster/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }
      }

      setDocuments(documents.map(doc => ({
        ...doc,
        isSaved: !!doc.file || doc.isSaved
      })))

      // Update the known docStatus count
      const newCount = documents.filter(d => d.file || d.isSaved).length;
      setDocStatuses(prev => ({ ...prev, [selectedEmployee.empId]: newCount }));

      alert(`Documents submitted successfully for ${selectedEmployee.name}`)
      setShowDocsPopup(false)
      setSelectedEmployee(null)
    } catch (error) {
      console.error("Error uploading documents:", error);
      alert("Failed to upload documents to server. Please try again.");
    }
  }

  const getEmployeeDocStatus = (empId) => {
    const totalDocs = 10;
    const savedCount = docStatuses[empId] !== undefined ? docStatuses[empId] : 0;

    if (savedCount === 0) return { label: 'Pending', color: 'red' }
    if (savedCount === totalDocs) return { label: 'Completed', color: 'green' }
    return { label: `${savedCount}/${totalDocs}`, color: 'yellow' }
  }

  const uploadedCount = documents.filter(doc => doc.file || doc.isSaved).length

  return (
    <Box sx={{ p: 0, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#5A725A' }}>
          Pre-Joining / Onboarding Documents
        </Typography>
        <Tooltip title="Add Employee">
          <IconButton 
            onClick={() => setShowRegisterPopup(true)} 
            sx={{ 
              bgcolor: '#5A725A', 
              color: 'white', 
              width: 40,
              height: 40,
              '&:hover': { bgcolor: '#4a5f4a' },
              boxShadow: 1
            }}
          >
            <PersonAddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

        
      <Dialog 
        open={showRegisterPopup} 
        onClose={() => setShowRegisterPopup(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle component="div" sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ bgcolor: 'rgba(90, 114, 90, 0.1)', p: 1, borderRadius: 2, display: 'inline-flex' }}>
            <DescriptionIcon sx={{ color: '#5A725A' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Employee Register
          </Typography>
          <IconButton
            onClick={() => setShowRegisterPopup(false)}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: 'grey.500',
              bgcolor: 'grey.50',
              '&:hover': { bgcolor: 'grey.100', color: 'grey.700' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderBottom: 'none' }}>
          <form onSubmit={handleRegisterEmployee}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 3, mt: 1 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                  Full Name <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField 
                  size="small"
                  fullWidth
                  placeholder="e.g. Jane Doe"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                  Email ID <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField 
                  size="small"
                  fullWidth
                  type="email"
                  placeholder="e.g. jane@company.com"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                  Employee ID <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField 
                  size="small"
                  fullWidth
                  value={nextEmpId}
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ bgcolor: 'grey.200', borderRadius: '50%', p: 0.5, display: 'flex' }}>
                            <LockClockIcon sx={{ fontSize: 14, color: 'grey.500' }} />
                          </Box>
                        </InputAdornment>
                      ),
                    }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2, 
                      bgcolor: 'grey.50',
                      '& input': { color: 'grey.500', fontFamily: 'monospace' }
                    } 
                  }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                  Department <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Select
                  size="small"
                  fullWidth
                  displayEmpty
                  value={deptOption}
                  onChange={(e) => {
                    setDeptOption(e.target.value)
                    if (e.target.value !== 'Other') {
                      setNewEmployee({ ...newEmployee, department: e.target.value })
                    } else {
                      setNewEmployee({ ...newEmployee, department: '' })
                    }
                  }}
                  required
                  sx={{ borderRadius: 2, bgcolor: 'grey.50', mb: deptOption === 'Other' ? 1.5 : 0 }}
                >
                  <MenuItem value="" disabled>Select Department</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="Trainee">Trainee</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {deptOption === 'Other' && (
                  <TextField 
                    size="small"
                    fullWidth
                    placeholder="Enter Custom Department"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                  Designation / Role <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField 
                  size="small"
                  fullWidth
                  placeholder="e.g. Software Engineer"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                  Date of Joining (DOJ) <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField 
                  size="small"
                  fullWidth
                  type="date"
                  value={newEmployee.doj}
                  onChange={(e) => setNewEmployee({ ...newEmployee, doj: e.target.value })}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                  Employment Type <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Select
                  size="small"
                  fullWidth
                  displayEmpty
                  value={newEmployee.employmentType}
                  onChange={(e) => setNewEmployee({ ...newEmployee, employmentType: e.target.value })}
                  required
                  sx={{ borderRadius: 2, bgcolor: 'grey.50' }}
                >
                  <MenuItem value="" disabled>Select Type</MenuItem>
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Intern">Intern</MenuItem>
                </Select>
              </Box>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              startIcon={<PersonAddIcon />}
              sx={{ 
                bgcolor: '#5A725A', 
                color: 'white', 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: 1,
                '&:hover': { bgcolor: '#4a5f4a', boxShadow: 2 }
              }}
            >
              Add New Employee
            </Button>
          </form>
        </DialogContent>
      </Dialog>

        
      <Dialog 
        open={showDocsPopup && selectedEmployee !== null} 
        onClose={() => setShowDocsPopup(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, maxHeight: '90vh' }
        }}
      >
        {selectedEmployee && (
          <>
            
            <DialogTitle component="div" sx={{ p: 0 }}>
              <Box sx={{ pt: 3, pb: 3, px: 4, borderBottom: '1px solid', borderColor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar 
                    variant="rounded" 
                    src={(() => {
                      const passportDoc = documents.find(d => d.name === "Passport Size Photos")
                      return (passportDoc && passportDoc.previewUrl) ? passportDoc.previewUrl : undefined;
                    })()}
                    sx={{ 
                      width: 128, 
                      height: 128, 
                      borderRadius: 4,
                      bgcolor: 'rgba(90, 114, 90, 0.1)',
                      color: '#5A725A',
                      fontSize: '3rem',
                      fontWeight: 'bold',
                      fontFamily: 'serif',
                      boxShadow: 1,
                      border: '1px solid',
                      borderColor: 'grey.100',
                    }}
                  >
                    {!documents.find(d => d.name === "Passport Size Photos" && d.previewUrl) && selectedEmployee.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ fontSize: 26, fontWeight: 900, color: 'grey.800', letterSpacing: '-0.025em', lineHeight: 1 }}>
                        {selectedEmployee.name}
                      </Typography>
                      <Chip 
                        label="Documents Verification" 
                        size="small" 
                        sx={{ 
                          fontSize: '10px', 
                          fontWeight: 'bold', 
                          letterSpacing: '0.1em', 
                          bgcolor: 'grey.100', 
                          color: 'grey.600', 
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'grey.200'
                        }} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
                      <Chip label={selectedEmployee.empId} size="small" sx={{ fontWeight: 'bold', bgcolor: 'white', color: 'grey.600', border: '1px solid', borderColor: 'grey.200', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} />
                      <Chip label={`${selectedEmployee.department} Dept`} size="small" sx={{ fontWeight: 'bold', bgcolor: 'success.50', color: 'success.700', border: '1px solid', borderColor: 'success.100' }} />
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ alignSelf: 'flex-start' }}>
                  <IconButton onClick={() => setShowDocsPopup(false)} sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'grey.200', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', '&:hover': { bgcolor: 'error.50', color: 'error.main' } }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </DialogTitle>

            
            <DialogContent sx={{ p: 3, bgcolor: 'white' }}>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'grey.100', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: 'info.50', p: 1.5, borderRadius: 3, border: '1px solid', borderColor: 'info.100' }}>
                    <AssessmentIcon color="info" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Docs</Typography>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'grey.800' }}>{documents.length}</Typography>
                  </Box>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'grey.100', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: 'success.50', p: 1.5, borderRadius: 3, border: '1px solid', borderColor: 'success.100' }}>
                    <CheckCircleOutlineIcon color="success" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Uploaded</Typography>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'success.main' }}>{uploadedCount}</Typography>
                  </Box>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'grey.100', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: 'error.50', p: 1.5, borderRadius: 3, border: '1px solid', borderColor: 'error.100' }}>
                    <ErrorOutlineIcon color="error" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</Typography>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'error.main' }}>{documents.length - uploadedCount}</Typography>
                  </Box>
                </Paper>
              </Box>

              
              <TableContainer sx={{ border: '1px solid', borderColor: 'grey.100', borderRadius: 3, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'grey.500', textTransform: 'uppercase', borderColor: 'grey.200', width: '33%' }}>Document Name</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'grey.500', textTransform: 'uppercase', borderColor: 'grey.200' }}>Status</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'grey.500', textTransform: 'uppercase', borderColor: 'grey.200' }}>File</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'grey.500', textTransform: 'uppercase', borderColor: 'grey.200' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.map((doc, index) => (
                      <TableRow key={index} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 500, color: 'grey.800', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon sx={{ fontSize: 16, color: 'grey.400' }} />
                          <Typography variant="body2">{doc.name}</Typography>
                        </TableCell>
                        <TableCell>
                          {(doc.file || doc.isSaved) ? (
                            <Chip 
                              icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main', ml: 1 }} />}
                              label="UPLOADED" 
                              size="small" 
                              sx={{ bgcolor: 'success.50', color: 'success.800', border: '1px solid', borderColor: 'success.200', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.025em' }} 
                            />
                          ) : (
                            <Chip 
                              icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main', ml: 1 }} />}
                              label="PENDING" 
                              size="small" 
                              sx={{ bgcolor: 'error.50', color: 'error.main', border: '1px solid', borderColor: 'error.100', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.025em' }} 
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {doc.file ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.75rem', color: 'grey.600', bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1, width: 'max-content' }}>
                              <CheckCircleOutlineIcon sx={{ fontSize: 12, color: '#5A725A' }} />
                              <Typography noWrap sx={{ maxWidth: 120, fontSize: '0.75rem' }}>{doc.file.name}</Typography>
                            </Box>
                          ) : (
                            <Typography sx={{ fontSize: '0.75rem', color: 'grey.400', fontStyle: 'italic' }}>No file selected</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <Button 
                              size="small"
                              onClick={(e) => { e.stopPropagation(); handleView(doc); }}
                              disabled={!doc.file && !doc.previewUrl}
                              sx={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 600, 
                                color: '#5A725A', 
                                textTransform: 'none',
                                minWidth: 'auto',
                                '&:hover': { color: '#4a5f4a', bgcolor: 'transparent' },
                                '&.Mui-disabled': { color: 'grey.300' }
                              }}
                            >
                              Preview
                            </Button>
                            <Button
                              component="label"
                              variant="outlined"
                              size="small"
                              startIcon={<UploadFileIcon />}
                              sx={{
                                color: 'grey.700',
                                borderColor: 'grey.200',
                                bgcolor: 'white',
                                textTransform: 'none',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                '&:hover': { bgcolor: 'grey.50', borderColor: 'grey.300' }
                              }}
                            >
                              Upload
                              <input
                                type="file"
                                accept={doc.name === "Passport Size Photos" ? "image/*" : "application/pdf,image/*"}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleFileUpload(e, index)}
                                hidden
                              />
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>

            
            <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'grey.100', bgcolor: 'rgba(249, 250, 251, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ErrorOutlineIcon />}
                onClick={handleResetDocs}
                sx={{ borderRadius: 3, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: 'error.50' } }}
              >
                Reset Documents
              </Button>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowDocsPopup(false)}
                  sx={{ borderRadius: 3, color: 'grey.700', borderColor: 'grey.200', fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: 'grey.100' } }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={handleSubmitDocs}
                  sx={{ 
                    borderRadius: 3, 
                    bgcolor: '#5A725A', 
                    color: 'white', 
                    fontWeight: 'bold', 
                    textTransform: 'none', 
                    boxShadow: 2,
                    '&:hover': { bgcolor: '#4a5f4a', boxShadow: 3 }
                  }}
                >
                  Save & Submit Files
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Dialog>

      
      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'grey.100', overflow: 'hidden', mt: 1 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'grey.100', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(249, 250, 251, 0.5)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ bgcolor: 'rgba(90, 114, 90, 0.1)', p: 1.25, borderRadius: 2 }}>
              <WorkIcon sx={{ color: '#5A725A', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.800' }}>
              All Employees Directory
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={`${employees.length} Members`} 
              size="small" 
              sx={{ fontWeight: 500, color: 'grey.500', bgcolor: 'grey.100' }} 
            />

            
            <Box sx={{ position: 'relative' }} ref={filterRef}>
              <Button
                onClick={() => setShowColumnFilter(!showColumnFilter)}
                variant="outlined"
                size="small"
                startIcon={<FilterListIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{ 
                  bgcolor: 'white', 
                  color: 'grey.700', 
                  borderColor: 'grey.200', 
                  textTransform: 'none',
                  fontWeight: 500,
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  '&:hover': { bgcolor: 'grey.50' }
                }}
              >
                Filters
              </Button>

              {showColumnFilter && (
                <Paper 
                  elevation={3} 
                  sx={{ 
                    position: 'absolute', 
                    right: 0, 
                    top: '100%', 
                    mt: 1, 
                    width: 220, 
                    zIndex: 20, 
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'grey.100',
                    py: 1
                  }}
                >
                  <Box sx={{ px: 2, py: 1, mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'grey.400', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Toggle Columns
                    </Typography>
                  </Box>
                  <MenuItem onClick={() => setVisibleColumns({ ...visibleColumns, role: !visibleColumns.role })} sx={{ px: 2, gap: 1.5 }}>
                    <Checkbox checked={visibleColumns.role} size="small" sx={{ p: 0, color: 'grey.300', '&.Mui-checked': { color: '#5A725A' } }} />
                    <Typography variant="body2" sx={{ color: 'grey.700' }}>Designation / Role</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => setVisibleColumns({ ...visibleColumns, email: !visibleColumns.email })} sx={{ px: 2, gap: 1.5 }}>
                    <Checkbox checked={visibleColumns.email} size="small" sx={{ p: 0, color: 'grey.300', '&.Mui-checked': { color: '#5A725A' } }} />
                    <Typography variant="body2" sx={{ color: 'grey.700' }}>Email ID</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => setVisibleColumns({ ...visibleColumns, employmentType: !visibleColumns.employmentType })} sx={{ px: 2, gap: 1.5 }}>
                    <Checkbox checked={visibleColumns.employmentType} size="small" sx={{ p: 0, color: 'grey.300', '&.Mui-checked': { color: '#5A725A' } }} />
                    <Typography variant="body2" sx={{ color: 'grey.700' }}>Employment Type</Typography>
                  </MenuItem>
                </Paper>
              )}
            </Box>
          </Box>
        </Box>

        <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%' }}>
          <Table sx={{ width: '100%', minWidth: 1000 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'white' }}>
                <TableCell sx={{ color: 'grey.500', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>#</TableCell>
                <TableCell sx={{ color: 'grey.500', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Employee ID</TableCell>
                <TableCell sx={{ color: 'grey.500', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Name</TableCell>
                {visibleColumns.email && <TableCell sx={{ color: 'grey.500', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Email ID</TableCell>}
                <TableCell sx={{ color: 'grey.500', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Department</TableCell>
                {visibleColumns.role && <TableCell sx={{ color: 'grey.500', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Designation</TableCell>}
                <TableCell sx={{ color: 'grey.500', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Date of Joining</TableCell>
                {visibleColumns.employmentType && <TableCell sx={{ color: 'grey.500', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Employment Type</TableCell>}
                <TableCell sx={{ color: 'grey.500', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Documents</TableCell>
                <TableCell align="right" sx={{ color: 'grey.500', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: 'grey.500', fontStyle: 'italic', fontWeight: 500 }}>
                      No employee data available
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp, index) => (
                  <TableRow
                    key={emp.id}
                    hover
                    onClick={() => navigate(`/hr/employee/${emp.empId}`, { state: { name: emp.name, department: emp.department } })}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(90, 114, 90, 0.05)' },
                      '&:last-child td': { border: 0 }
                    }}
                  >
                    <TableCell sx={{ color: 'grey.500', fontSize: '0.875rem' }}>{index + 1}</TableCell>
                    <TableCell>
                      <Chip 
                        label={emp.empId} 
                        size="small" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          fontWeight: 500, 
                          bgcolor: 'grey.100', 
                          color: 'grey.700',
                          borderRadius: 1.5,
                          '&:hover': { bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'grey.800', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      {emp.name}
                    </TableCell>

                    {visibleColumns.email && (
                      <TableCell sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                        {emp.email}
                      </TableCell>
                    )}

                    <TableCell>
                      <Chip 
                        icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#5A725A', ml: 1 }} />}
                        label={emp.department} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'grey.50', 
                          color: 'grey.600', 
                          border: '1px solid', 
                          borderColor: 'grey.200',
                          '&:hover': { bgcolor: 'white' }
                        }} 
                      />
                    </TableCell>

                    {visibleColumns.role && (
                      <TableCell sx={{ color: 'grey.600', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                        {emp.role}
                      </TableCell>
                    )}

                    <TableCell>
                      <Chip 
                        label={emp.doj ? new Date(emp.doj).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "-"} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'grey.50', 
                          color: 'grey.600', 
                          border: '1px solid', 
                          borderColor: 'grey.100',
                          borderRadius: 1.5,
                          '&:hover': { bgcolor: 'white' }
                        }} 
                      />
                    </TableCell>

                    {visibleColumns.employmentType && (
                      <TableCell>
                        <Chip 
                          label={emp.employmentType} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 'bold', 
                            letterSpacing: '0.025em',
                            ...(emp.employmentType === 'Full-time' ? { bgcolor: 'info.50', color: 'info.700', border: '1px solid', borderColor: 'info.100' } :
                                emp.employmentType === 'Contract' ? { bgcolor: 'secondary.50', color: 'secondary.700', border: '1px solid', borderColor: 'secondary.100' } :
                                emp.employmentType === 'Intern' ? { bgcolor: 'warning.50', color: 'warning.700', border: '1px solid', borderColor: 'warning.100' } :
                                { bgcolor: 'grey.50', color: 'grey.700', border: '1px solid', borderColor: 'grey.200' })
                          }} 
                        />
                      </TableCell>
                    )}

                    <TableCell>
                      {(() => {
                        const status = docStatuses[emp.empId] !== undefined ? getEmployeeDocStatus(emp.empId) : { label: 'Loading...', color: 'gray' };
                        return (
                          <Chip 
                            icon={
                              <Box sx={{ 
                                width: 6, height: 6, borderRadius: '50%', ml: 1,
                                bgcolor: status.color === 'green' ? 'success.500' :
                                         status.color === 'red' ? 'error.500' :
                                         status.color === 'gray' ? 'grey.400' : 'warning.500'
                              }} />
                            }
                            label={status.label} 
                            size="small"
                            onClick={(e) => handleOpenDocs(emp, e)}
                            sx={{
                              fontSize: '11px',
                              fontWeight: 'bold',
                              letterSpacing: '0.025em',
                              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                              cursor: 'pointer',
                              '&:active': { transform: 'scale(0.95)' },
                              ...(status.color === 'green' ? { bgcolor: 'success.50', color: 'success.700', border: '1px solid', borderColor: 'success.200', '&:hover': { bgcolor: 'success.100' } } :
                                  status.color === 'red' ? { bgcolor: 'error.50', color: 'error.600', border: '1px solid', borderColor: 'error.200', '&:hover': { bgcolor: 'error.100' } } :
                                  status.color === 'gray' ? { bgcolor: 'grey.50', color: 'grey.500', border: '1px solid', borderColor: 'grey.200', '&:hover': { bgcolor: 'grey.100' } } :
                                  { bgcolor: 'warning.50', color: 'warning.700', border: '1px solid', borderColor: 'warning.200', '&:hover': { bgcolor: 'warning.100' } })
                            }}
                          />
                        );
                      })()}
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        endIcon={
                          <Box component="svg" sx={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </Box>
                        }
                        sx={{ 
                          color: '#5A725A', 
                          fontWeight: 500, 
                          textTransform: 'none',
                          opacity: 0.5,
                          '&:hover': { opacity: 1, color: '#4a5f4a', bgcolor: 'transparent' }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default PreJoining
