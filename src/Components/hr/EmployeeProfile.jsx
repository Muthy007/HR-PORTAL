import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    Avatar,
    Stack,
    Divider,
    TextField,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel
} from "@mui/material"
import { API_BASE_URL } from "../../assets/connection"

function EmployeeProfile() {
    const { empId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    const [employee, setEmployee] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState(null)

    const filterOptions = [
        { id: 'personal', label: 'Personal Details', fields: ['firstName', 'lastName', 'fullNameAadharPan', 'religion', 'mobileNumber', 'personalEmail', 'alternateContactNumber', 'age', 'dob', 'bloodGroup', 'maritalStatus', 'gender', 'nationality'] },
        { id: 'contact', label: 'Contact Information', fields: ['currentAddress', 'permanentAddress', 'sameAsCurrentAddress'] },
        { id: 'employment', label: 'Employment Information', fields: ['employeeId', 'department', 'employmentType', 'designation', 'reportingManager', 'dateOfJoining', 'probationPeriod', 'confirmationDate', 'employeeGradeLevel'] },
        { id: 'education', label: 'Educational Qualifications', fields: ['qualifications'] },
        { id: 'previousEmployment', label: 'Previous Employment Details', fields: ['employmentHistory'] },
        { id: 'compensation', label: 'Compensation & Benefits', fields: ['bankAccountHolderName', 'bankName', 'branchName', 'accountNumber', 'ifscCode', 'accountType', 'taxInfo', 'benefits'] },
        { id: 'payroll', label: 'Payroll & Salary Structure', fields: ['payrollInfo'] }
    ]

    const [activeFilters, setActiveFilters] = useState(() => {
        const initial = {};
        filterOptions.forEach(opt => {
            initial[opt.id] = { _show: true };
            if (opt.fields) {
                opt.fields.forEach(field => {
                    initial[opt.id][field] = true;
                });
            }
        });
        return initial;
    })



    useEffect(() => {
        const fallbackName = location.state?.name || "Employee Name"
        const fallbackDept = location.state?.department || "N/A"

        let profileData = null

        if (!profileData) {

            profileData = {
                empId: empId,
                name: fallbackName,
                department: fallbackDept,

                personal: {
                    firstName: fallbackName !== "Employee Name" ? fallbackName.split(' ')[0] : "",
                    lastName: fallbackName !== "Employee Name" && fallbackName.split(' ').length > 1 ? fallbackName.split(' ').slice(1).join(' ') : "",
                    mobileNumber: "",
                    personalEmail: "",
                    alternateContactNumber: "",
                    fullNameAadharPan: fallbackName !== "Employee Name" ? fallbackName : "",
                    religion: "",
                    age: "",
                    dob: "",
                    bloodGroup: "",
                    maritalStatus: "",
                    gender: "",
                    nationality: ""
                },

                contact: {
                    currentAddress: { doorNo: "", street: "", area: "", city: "", state: "", pincode: "", country: "" },
                    permanentAddress: { doorNo: "", street: "", area: "", city: "", state: "", pincode: "", country: "" },
                    sameAsCurrentAddress: false
                },

                employment: {
                    employeeId: empId,
                    department: fallbackDept !== "N/A" ? fallbackDept : "",
                    designation: "",
                    employmentType: "",
                    reportingManager: "",
                    dateOfJoining: "",
                    probationPeriod: "",
                    confirmationDate: "",
                    employeeGradeLevel: ""
                },

                education: {
                    qualifications: [
                        {
                            Qualification: "",
                            degreeName: "",
                            universityCollege: "",
                            yearOfPassing: "",
                            percentageCgpa: "",
                            certifications: ""
                        }
                    ]
                },

                previousEmployment: {
                    employmentHistory: [
                        {
                            previousCompanyName: "",
                            designation: "",
                            experienceYearsMonths: "",
                            dateOfJoining: "",
                            dateOfRelieving: "",
                            reasonForLeaving: "",
                            lastDrawnSalary: ""
                        }
                    ]
                },

                compensation: {
                    salary: "",
                    bankAccountHolderName: "",
                    bankName: "",
                    branchName: "",
                    accountNumber: "",
                    ifscCode: "",
                    accountType: "",
                    taxInfo: "",
                    benefits: ""
                },
                documents: {},
                payroll: {
                    payrollInfo: "Not yet configured"
                }
            }
        } else {
            if (profileData.personal && profileData.personal.hasOwnProperty('employeeId')) {
                if (!profileData.employment) profileData.employment = {};
                profileData.employment.employeeId = profileData.personal.employeeId;
                delete profileData.personal.employeeId;
            }
            if (!profileData.employment?.hasOwnProperty('employeeId')) {
                if (!profileData.employment) profileData.employment = {};
                profileData.employment.employeeId = empId;
            }

            if (!profileData.personal?.hasOwnProperty('firstName')) {
                const migratedName = profileData.personal?.fullName || profileData.name || fallbackName;
                profileData.personal = {
                    firstName: migratedName.split(' ')[0] || "",
                    lastName: migratedName.split(' ').slice(1).join(' ') || "",
                    mobileNumber: profileData.personal?.mobileNumber || "",
                    personalEmail: profileData.personal?.personalEmail || "",
                    alternateContactNumber: profileData.personal?.alternateContactNumber || "",
                    fullNameAadharPan: migratedName || "",
                    religion: profileData.personal?.religion || "",
                    age: profileData.personal?.age || "",
                    dob: profileData.personal?.dob || "",
                    bloodGroup: profileData.personal?.bloodGroup || "",
                    maritalStatus: profileData.personal?.maritalStatus || "",
                    gender: profileData.personal?.gender || "",
                    nationality: profileData.personal?.nationality || ""
                }

                if (profileData.personal?.dob) {
                    const today = new Date();
                    const birthDate = new Date(profileData.personal.dob);
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    profileData.personal.age = age >= 0 ? age.toString() : "0";
                }
            }

            if (!profileData.contact?.hasOwnProperty('currentAddress')) {
                profileData.contact = {
                    currentAddress: { doorNo: "", street: "", area: "", city: profileData.contact?.address || "", state: "", pincode: "", country: "" },
                    permanentAddress: { doorNo: "", street: "", area: "", city: "", state: "", pincode: "", country: "" },
                    sameAsCurrentAddress: false
                };
            }
            if (!profileData.employment?.hasOwnProperty('designation') && !profileData.employment?.hasOwnProperty('employeeId')) {
                profileData.employment = {
                    employeeId: empId,
                    department: profileData.employment?.department || "",
                    designation: profileData.employment?.jobTitle || "",
                    employmentType: profileData.employment?.type || "",
                    reportingManager: profileData.employment?.supervisor || "",
                    dateOfJoining: profileData.employment?.startDate || "",
                    probationPeriod: "",
                    confirmationDate: "",
                    employeeGradeLevel: ""
                }
            }
            if (!profileData.education) {
                profileData.education = {
                    qualifications: [
                        {
                            Qualification: "",
                            degreeName: profileData.professional?.degrees?.[0] || "",
                            universityCollege: "",
                            yearOfPassing: "",
                            percentageCgpa: "",
                            certifications: ""
                        }
                    ]
                }
            }
            if (!profileData.previousEmployment) {
                profileData.previousEmployment = {
                    employmentHistory: [
                        {
                            previousCompanyName: "",
                            designation: "",
                            experienceYearsMonths: "",
                            dateOfJoining: "",
                            dateOfRelieving: "",
                            reasonForLeaving: "",
                            lastDrawnSalary: ""
                        }
                    ]
                }
            }

            if (!profileData.compensation) {
                profileData.compensation = {
                    salary: "",
                    bankAccountHolderName: "",
                    bankName: "",
                    branchName: "",
                    accountNumber: "",
                    ifscCode: "",
                    accountType: "",
                    taxInfo: "",
                    benefits: ""
                }
            } else if (!profileData.compensation.hasOwnProperty('accountNumber')) {
                profileData.compensation = {
                    ...profileData.compensation,
                    bankAccountHolderName: "",
                    bankName: "",
                    branchName: "",
                    accountNumber: profileData.compensation.bankDetails || "",
                    ifscCode: "",
                    accountType: ""
                }
                delete profileData.compensation.bankDetails;
            }

            if (!profileData.documents || Object.keys(profileData.documents).length === 0) {
                const defaultDocs = [
                    "Resume / CV", "Offer Letter", "Appointment Letter",
                    "ID Proof (Aadhar / PAN / Passport)", "Address Proof",
                    "Educational Certificates", "Experience Letters",
                    "Passport Size Photos", "Bank Account Details", "Signed NDA"
                ]
                profileData.documents = {};
                defaultDocs.forEach(doc => {
                    profileData.documents[doc] = null;
                })
            }
            if (!profileData.payroll) {
                profileData.payroll = {
                    payrollInfo: "Not yet configured"
                }
            }
        }

        setEmployee(profileData)
        setFormData(profileData)


        const numericId = String(empId).replace(/[^0-9]/g, '') || empId;
        fetch(`${API_BASE_URL}/api/EmployeeMaster/${numericId}/personal-details`)
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("API response not ok: " + res.status);
            })
            .then(data => {
                console.log("Backend Employee Personal Data:", data);
                if (data) {
                    const updateState = (prev) => {
                        if (!prev) return prev;
                        const updatedPersonal = { ...prev.personal };
                        if (data.firstName) updatedPersonal.firstName = data.firstName;
                        if (data.lastName) updatedPersonal.lastName = data.lastName;
                        if (data.fullName) updatedPersonal.fullNameAadharPan = data.fullName;
                        if (data.religion) updatedPersonal.religion = data.religion;
                        if (data.mobile) updatedPersonal.mobileNumber = data.mobile;
                        if (data.alternateContact) updatedPersonal.alternateContactNumber = data.alternateContact;
                        if (data.dateOfBirth) {
                            updatedPersonal.dob = data.dateOfBirth.split('T')[0];
                        }
                        if (data.maritalStatus) updatedPersonal.maritalStatus = data.maritalStatus;
                        if (data.bloodGroup) updatedPersonal.bloodGroup = data.bloodGroup;
                        if (data.nationality) updatedPersonal.nationality = data.nationality;
                        if (data.gender) updatedPersonal.gender = data.gender;

                        if (updatedPersonal.dob) {
                            const today = new Date();
                            const birthDate = new Date(updatedPersonal.dob);
                            let age = today.getFullYear() - birthDate.getFullYear();
                            const m = today.getMonth() - birthDate.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                age--;
                            }
                            updatedPersonal.age = age >= 0 ? age.toString() : "0";
                        }

                        return {
                            ...prev,
                            name: data.fullName || prev.name,
                            personal: updatedPersonal
                        };
                    };

                    setFormData(updateState);
                    setEmployee(updateState);
                }
            })
            .catch(err => console.error("Error fetching personal backend data:", err));

        // Fetch Employee Address Data
        fetch(`${API_BASE_URL}/api/EmployeeMaster/${numericId}/address`)
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data) {
                    const updateAddressState = (prev) => {
                        if (!prev) return prev;

                        const currentAddress = {
                            doorNo: data.currentDoorNo || "",
                            street: data.currentStreet || "",
                            area: data.currentArea || "",
                            city: data.currentCity || "",
                            state: data.currentState || "",
                            pincode: data.currentPincode || "",
                            country: data.currentCountry || ""
                        };

                        const permanentAddress = {
                            doorNo: data.permanentDoorNo || "",
                            street: data.permanentStreet || "",
                            area: data.permanentArea || "",
                            city: data.permanentCity || "",
                            state: data.permanentState || "",
                            pincode: data.permanentPincode || "",
                            country: data.permanentCountry || ""
                        };

                        return {
                            ...prev,
                            contact: {
                                ...prev.contact,
                                currentAddress: { ...prev.contact.currentAddress, ...currentAddress },
                                permanentAddress: { ...prev.contact.permanentAddress, ...permanentAddress }
                            }
                        };
                    };

                    setFormData(updateAddressState);
                    setEmployee(updateAddressState);
                }
            })
            .catch(err => console.error("Error fetching address backend data:", err));


        // Fetch Employee Education Data
        fetch(`${API_BASE_URL}/api/EmployeeMaster/${numericId}/education`)
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data) {
                    const dataArray = Array.isArray(data) ? data : [data];
                    const validData = dataArray.filter(edu => edu.qualification || edu.degreeName || edu.university);
                    if (validData.length > 0) {
                        const formattedEducation = validData.map(edu => ({
                            Qualification: edu.qualification || "",
                            degreeName: edu.degreeName || "",
                            universityCollege: edu.university || "",
                            yearOfPassing: edu.yearOfPassing ? edu.yearOfPassing.toString() : "",
                            percentageCgpa: edu.percentage || "",
                            certifications: edu.certifications || ""
                        }));

                        setFormData(prev => ({
                            ...prev,
                            education: {
                                ...prev.education,
                                qualifications: formattedEducation
                            }
                        }));
                        setEmployee(prev => ({
                            ...prev,
                            education: {
                                ...prev.education,
                                qualifications: formattedEducation
                            }
                        }));
                    }
                }
            })
            .catch(err => console.error("Error fetching education backend data:", err));

        // Fetch Employee Compensation Data
        fetch(`${API_BASE_URL}/api/EmployeeMaster/${numericId}/compensation`)
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data) {
                    const mappedCompensation = {
                        bankAccountHolderName: data.accountHolderName || "",
                        bankName: data.bankName || "",
                        branchName: data.branchName || "",
                        accountNumber: data.accountNumber || "",
                        ifscCode: data.ifscCode || "",
                        accountType: data.accountType || "",
                        taxInfo: data.taxInfo || "",
                        benefits: data.benefits || ""
                    };

                    setFormData(prev => ({
                        ...prev,
                        compensation: {
                            ...prev.compensation,
                            ...mappedCompensation
                        }
                    }));
                    setEmployee(prev => ({
                        ...prev,
                        compensation: {
                            ...prev.compensation,
                            ...mappedCompensation
                        }
                    }));
                }
            })
            .catch(err => console.error("Error fetching compensation backend data:", err));

        // Fetch Employee Previous Employment Data
        fetch(`${API_BASE_URL}/api/EmployeeMaster/${numericId}/previous-employment`)
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data && Array.isArray(data) && data.length > 0) {
                    const mappedHistory = data.map(job => ({
                        previousCompanyName: job.companyName || "",
                        designation: job.designation || "",
                        experienceYearsMonths: job.experience || "",
                        dateOfJoining: job.dateOfJoining ? job.dateOfJoining.split('T')[0] : "",
                        dateOfRelieving: job.dateOfRelieving ? job.dateOfRelieving.split('T')[0] : "",
                        reasonForLeaving: job.reasonForLeaving || "",
                        lastDrawnSalary: job.lastDrawnSalary ? job.lastDrawnSalary.toString() : ""
                    }));

                    setFormData(prev => ({
                        ...prev,
                        previousEmployment: {
                            ...prev.previousEmployment,
                            employmentHistory: mappedHistory
                        }
                    }));
                    setEmployee(prev => ({
                        ...prev,
                        previousEmployment: {
                            ...prev.previousEmployment,
                            employmentHistory: mappedHistory
                        }
                    }));
                }
            })
            .catch(err => console.error("Error fetching previous employment backend data:", err));

        // Fetch Employee Documents Data
        fetch(`${API_BASE_URL}/api/EmployeeMaster/${numericId}/documents`)
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data) {
                    const mappedDocs = {
                        "Resume / CV": data.resume ? { name: "resume.pdf", previewUrl: `data:application/pdf;base64,${data.resume}` } : null,
                        "Offer Letter": data.offerLetter ? { name: "offer_letter.pdf", previewUrl: `data:application/pdf;base64,${data.offerLetter}` } : null,
                        "Appointment Letter": data.appointmentLetter ? { name: "appointment_letter.pdf", previewUrl: `data:application/pdf;base64,${data.appointmentLetter}` } : null,
                        "ID Proof (Aadhar / PAN / Passport)": data.idProof ? { name: "id_proof", previewUrl: `data:application/octet-stream;base64,${data.idProof}` } : null,
                        "Address Proof": data.addressProof ? { name: "address_proof", previewUrl: `data:application/octet-stream;base64,${data.addressProof}` } : null,
                        "Educational Certificates": data.educationalCertificates ? { name: "educational_certificates.pdf", previewUrl: `data:application/pdf;base64,${data.educationalCertificates}` } : null,
                        "Experience Letters": data.experienceLetters ? { name: "experience_letters.pdf", previewUrl: `data:application/pdf;base64,${data.experienceLetters}` } : null,
                        "Passport Size Photos": data.passportPhotos ? { name: "passport_photo.jpeg", previewUrl: `data:image/jpeg;base64,${data.passportPhotos}` } : null
                    };

                    setFormData(prev => ({
                        ...prev,
                        documents: {
                            ...prev?.documents,
                            ...mappedDocs
                        }
                    }));
                    setEmployee(prev => ({
                        ...prev,
                        documents: {
                            ...prev?.documents,
                            ...mappedDocs
                        }
                    }));
                }
            })
            .catch(err => console.error("Error fetching documents backend data:", err));
    }, [empId, location.state])

    const handleSave = async () => {
        // Sync name to fullNameAadharPan
        const updatedFormData = { ...formData };
        if (updatedFormData.personal?.fullNameAadharPan) {
            updatedFormData.name = updatedFormData.personal.fullNameAadharPan;
        }

        setEmployee(updatedFormData)
        setIsEditing(false)
        console.log("Saved Employee Details:", JSON.stringify(updatedFormData, null, 2))


        try {
            const numericId = parseInt(String(empId).replace(/[^0-9]/g, ''), 10) || empId;


            const personalData = {
                firstName: formData.personal.firstName || "",
                lastName: formData.personal.lastName || "",
                fullName: formData.personal.fullNameAadharPan || "",
                religion: formData.personal.religion || "",
                mobile: formData.personal.mobileNumber || "",
                alternateContact: formData.personal.alternateContactNumber || "",
                dateOfBirth: formData.personal.dob ? formData.personal.dob : null,
                maritalStatus: formData.personal.maritalStatus || "",
                bloodGroup: formData.personal.bloodGroup || "",
                nationality: formData.personal.nationality || "",
                gender: formData.personal.gender || ""
            };

            const personalResponse = await fetch(`${API_BASE_URL}/api/EmployeeMaster/${numericId}/personal-details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(personalData)
            });

            // 2. Save Address Details
            const addressData = {
                currentDoorNo: formData.contact.currentAddress.doorNo || "",
                currentStreet: formData.contact.currentAddress.street || "",
                currentArea: formData.contact.currentAddress.area || "",
                currentCity: formData.contact.currentAddress.city || "",
                currentState: formData.contact.currentAddress.state || "",
                currentPincode: formData.contact.currentAddress.pincode || "",
                currentCountry: formData.contact.currentAddress.country || "",

                permanentDoorNo: formData.contact.permanentAddress.doorNo || "",
                permanentStreet: formData.contact.permanentAddress.street || "",
                permanentArea: formData.contact.permanentAddress.area || "",
                permanentCity: formData.contact.permanentAddress.city || "",
                permanentState: formData.contact.permanentAddress.state || "",
                permanentPincode: formData.contact.permanentAddress.pincode || "",
                permanentCountry: formData.contact.permanentAddress.country || ""
            };

            const addressResponse = await fetch(`${API_BASE_URL}/api/EmployeeMaster/${numericId}/address`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addressData)
            });

            // 3. Save Education Details
            let educationResponse = null;
            const educationData = (formData.education?.qualifications || [])
                .filter(q => q.Qualification || q.degreeName)
                .map(q => ({
                    qualification: q.Qualification || "",
                    degreeName: q.degreeName || "",
                    university: q.universityCollege || "",
                    yearOfPassing: parseInt(q.yearOfPassing, 10) || 0,
                    percentage: q.percentageCgpa || "",
                    certifications: q.certifications || ""
                }));

            if (educationData.length > 0) {
                educationResponse = await fetch(`${API_BASE_URL}/api/EmployeeMaster/${numericId}/education/bulk`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(educationData)
                });
            }

            // 4. Save Compensation Details
            let compensationResponse = null;
            const hasCompensationData = formData.compensation && Object.values(formData.compensation).some(val => val !== "");
            if (hasCompensationData) {
                const compensationData = {
                    accountHolderName: formData.compensation.bankAccountHolderName || "",
                    bankName: formData.compensation.bankName || "",
                    branchName: formData.compensation.branchName || "",
                    accountNumber: formData.compensation.accountNumber || "",
                    ifscCode: formData.compensation.ifscCode || "",
                    accountType: formData.compensation.accountType || "",
                    taxInfo: formData.compensation.taxInfo || "",
                    benefits: formData.compensation.benefits || ""
                };

                compensationResponse = await fetch(`${API_BASE_URL}/api/EmployeeMaster/${numericId}/compensation`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(compensationData)
                });
            }

            // 5. Save Previous Employment Details
            let previousEmploymentResponse = null;
            const fullHistory = (formData.previousEmployment?.employmentHistory || [])
                .filter(job => job.previousCompanyName || job.designation)
                .map(job => ({
                    companyName: job.previousCompanyName || "",
                    designation: job.designation || "",
                    experience: job.experienceYearsMonths || "",
                    dateOfJoining: job.dateOfJoining ? job.dateOfJoining : null,
                    dateOfRelieving: job.dateOfRelieving ? job.dateOfRelieving : null,
                    reasonForLeaving: job.reasonForLeaving || "",
                    lastDrawnSalary: parseFloat(job.lastDrawnSalary) || 0
                }));

            // Deduplication: Only send NEW or MODIFIED records compared to initially fetched data
            const existingHistory = (employee.previousEmployment?.employmentHistory || [])
                .map(job => ({
                    companyName: job.previousCompanyName || "",
                    designation: job.designation || "",
                    experience: job.experienceYearsMonths || "",
                    dateOfJoining: job.dateOfJoining ? job.dateOfJoining : null,
                    dateOfRelieving: job.dateOfRelieving ? job.dateOfRelieving : null,
                    reasonForLeaving: job.reasonForLeaving || "",
                    lastDrawnSalary: parseFloat(job.lastDrawnSalary) || 0
                }));

            const previousEmploymentData = fullHistory.filter(newJob => {
                // Check if this exact job record already exists in the fetched employee state
                return !existingHistory.some(existingJob =>
                    existingJob.companyName === newJob.companyName &&
                    existingJob.designation === newJob.designation &&
                    existingJob.dateOfJoining === newJob.dateOfJoining &&
                    existingJob.dateOfRelieving === newJob.dateOfRelieving &&
                    existingJob.experience === newJob.experience &&
                    existingJob.reasonForLeaving === newJob.reasonForLeaving &&
                    existingJob.lastDrawnSalary === newJob.lastDrawnSalary
                );
            });

            if (previousEmploymentData.length > 0) {
                // Assuming backend expects an array for bulk insert/update
                previousEmploymentResponse = await fetch(`${API_BASE_URL}/api/EmployeeMaster/${numericId}/previous-employment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(previousEmploymentData)
                });
            }

            const personalOk = personalResponse.ok;
            const addressOk = addressResponse.ok;
            const educationOk = educationResponse ? educationResponse.ok : true;
            const compensationOk = compensationResponse ? compensationResponse.ok : true;
            const previousEmploymentOk = previousEmploymentResponse ? previousEmploymentResponse.ok : true;

            if (personalOk && addressOk && educationOk && compensationOk && previousEmploymentOk) {
                alert("Employee details updated successfully!");
            } else {
                let msg = "Some updates failed to save to the server:\n";
                if (!personalOk) msg += "- Personal details failed to save\n";
                if (!addressOk) msg += "- Address failed to save\n";
                if (educationResponse && !educationOk) msg += "- Education details failed to save\n";
                if (compensationResponse && !compensationOk) msg += "- Compensation details failed to save\n";
                if (previousEmploymentResponse && !previousEmploymentOk) msg += "- Previous employment details failed to save\n";

                console.error("Failed to save to backend completely. Statuses - Personal:", personalResponse.status, "Address:", addressResponse.status, "Education:", educationResponse ? educationResponse.status : 'N/A', "Compensation:", compensationResponse ? compensationResponse.status : 'N/A', "PreviousEmployment:", previousEmploymentResponse ? previousEmploymentResponse.status : 'N/A');
                alert(msg);
            }
        } catch (error) {
            console.error("Error saving data to backend:", error);
            alert("Employee details updated locally, but encountered an error saving to server.");
        }
    }

    const handleAddressChange = (type, field, value) => {
        setFormData(prev => {
            const newContact = { ...prev.contact };
            newContact[type] = { ...newContact[type], [field]: value };

            if (type === 'currentAddress' && newContact.sameAsCurrentAddress) {
                newContact.permanentAddress = { ...newContact.currentAddress };
            }

            return {
                ...prev,
                contact: newContact
            };
        });
    }

    const handleSameAsCurrent = (e) => {
        const isChecked = e.target.checked;
        setFormData(prev => {
            const newContact = { ...prev.contact, sameAsCurrentAddress: isChecked };
            if (isChecked) {
                newContact.permanentAddress = { ...newContact.currentAddress };
            }
            return { ...prev, contact: newContact };
        });
    }

    const handleChange = (section, key, value) => {
        setFormData(prev => {
            const updatedSection = {
                ...prev[section],
                [key]: value
            }

            if (section === 'personal' && key === 'dob') {
                if (value) {
                    const today = new Date();
                    const birthDate = new Date(value);
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    updatedSection.age = age >= 0 ? age.toString() : "0";
                } else {
                    updatedSection.age = "";
                }
            }

            return {
                ...prev,
                name: (section === 'personal' && key === 'fullNameAadharPan') ? value : prev.name,
                [section]: updatedSection
            }
        })
    }

    if (!employee || !formData) return <div className="p-6">Loading...</div>

    const formatLabel = (key) => {
        const labels = {
            employeeId: "Employee ID",
            firstName: "First Name",
            lastName: "Last Name",
            fullNameAadharPan: "Full Name (as per Aadhar/PAN)",
            dob: "Date of Birth",
            age: "Age (auto-calculated)",
            personalEmail: "Personal Email",
            mobileNumber: "Mobile Number",
            alternateContactNumber: "Alternate Contact Number",
            bloodGroup: "Blood Group",
            maritalStatus: "Marital Status",
            department: "Department",
            designation: "Designation",
            employmentType: "Employment Type",
            reportingManager: "Reporting Manager",
            dateOfJoining: "Date of Joining",
            probationPeriod: "Probation Period",
            confirmationDate: "Confirmation Date",
            employeeGradeLevel: "Employee Grade / Level",
            bankAccountHolderName: "Bank Account Holder Name (as per bank)",
            bankName: "Bank Name",
            branchName: "Branch Name",
            accountNumber: "Account Number",
            ifscCode: "IFSC Code",
            accountType: "Account Type"
        }
        if (labels[key]) return labels[key];
        return key.replace(/([A-Z])/g, ' $1').trim();
    }

    const renderSectionCard = (title, sectionKey, icon) => (
        <Paper elevation={0} sx={{ p: 4, borderRadius: '1rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', border: '1px solid #f3f4f6', position: 'relative', overflow: 'hidden', '&:hover': { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.1)' }, transition: 'box-shadow 300ms', bgcolor: 'white' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3, borderBottom: '1px solid #f3f4f6', pb: 2 }}>
                <Box sx={{ bgcolor: 'rgba(90, 114, 90, 0.1)', p: 1.25, borderRadius: '0.75rem', color: '#5A725A', display: 'flex' }}>
                    {icon}
                </Box>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937' }}>{title}</Typography>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
                {Object.entries(formData[sectionKey])
                    .sort(([a], [b]) => {
                        const opt = filterOptions.find(o => o.id === sectionKey);
                        if (!opt || !opt.fields) return 0;
                        const idxA = opt.fields.indexOf(a);
                        const idxB = opt.fields.indexOf(b);
                        if (idxA === -1 && idxB === -1) return 0;
                        if (idxA === -1) return 1;
                        if (idxB === -1) return -1;
                        return idxA - idxB;
                    })
                    .filter(([key]) => {
                        const opt = filterOptions.find(o => o.id === sectionKey);
                        if (opt && opt.fields && !opt.fields.includes(key)) return false;
                        return activeFilters[sectionKey]?.[key] !== false;
                    })
                    .map(([key, value]) => {
                        const isCert = key === 'certifications';
                        const isArray = Array.isArray(value);

                        if (key === 'sameAsCurrentAddress') return null;

                        const renderInputHelper = (sec, fKey, val, type) => (
                            <Box component="input"
                                type={type}
                                value={val || ''}
                                readOnly={fKey === 'age' || fKey === 'employeeId'}
                                onChange={(e) => {
                                    let newVal = e.target.value;
                                    const numFields = ['mobileNumber', 'alternateContactNumber', 'accountNumber'];
                                    if (numFields.includes(fKey)) newVal = newVal.replace(/[^0-9]/g, '');
                                    handleChange(sec, fKey, newVal);
                                }}
                                sx={{
                                    width: '100%', border: '1px solid', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', outline: 'none', transition: 'all', '&::placeholder': { color: '#9ca3af' },
                                    ...(fKey === 'age' || fKey === 'employeeId' ? { bgcolor: '#f3f4f6', borderColor: '#d1d5db', color: '#6b7280', cursor: 'not-allowed' } : { borderColor: '#4b5563', bgcolor: 'white', color: '#1f2937', '&:focus': { boxShadow: '0 0 0 1px #1f2937', borderColor: '#1f2937' }, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' })
                                }}
                            />
                        );
                        const renderSelectHelper = (sec, fKey, val, options) => (
                            <Box sx={{ position: 'relative' }}>
                                <Box component="select"
                                    value={val || ''}
                                    onChange={(e) => handleChange(sec, fKey, e.target.value)}
                                    sx={{
                                        width: '100%', border: '1px solid #4b5563', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', outline: 'none', transition: 'all', appearance: 'none', cursor: 'pointer', bgcolor: 'white', color: '#1f2937', '&:hover': { bgcolor: 'rgba(249, 250, 251, 0.5)' }, '&:focus': { boxShadow: '0 0 0 1px #1f2937', borderColor: '#1f2937' }, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem`
                                    }}
                                >
                                    <option value="" disabled>Select {formatLabel(fKey)}</option>
                                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                                </Box>
                            </Box>
                        );
                        const renderDisplayHelper = (v) => (
                            <Box sx={{ width: '100%', border: '1px solid #4b5563', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', bgcolor: 'white', color: '#1f2937', minHeight: '38px', display: 'flex', alignItems: 'center', wordBreak: 'break-word' }}>
                                {v ? v : <Typography component="span" sx={{ color: '#9ca3af', fontStyle: 'italic', fontWeight: 400, fontSize: 'inherit' }}>Not provided</Typography>}
                            </Box>
                        );

                        if (sectionKey === 'personal') {
                            if (['alternateContactNumber', 'age', 'gender', 'bloodGroup', 'nationality', 'religion'].includes(key)) return null;

                            if (key === 'mobileNumber') {
                                return (
                                    <Box key={key} sx={{ gridColumn: { xs: 'span 12', lg: 'span 12', xl: 'span 6' } }}>
                                        <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', textTransform: 'capitalize', mb: 1 }}>
                                            Mobile / Alternate Contact
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {isEditing ? (
                                                <>
                                                    {renderInputHelper('personal', 'mobileNumber', formData.personal.mobileNumber, 'text')}
                                                    <Typography sx={{ color: '#9ca3af', fontWeight: 700, flexShrink: 0 }}>/</Typography>
                                                    {renderInputHelper('personal', 'alternateContactNumber', formData.personal.alternateContactNumber, 'text')}
                                                </>
                                            ) : (
                                                <>
                                                    <Box sx={{ flex: 1, border: '1px solid #4b5563', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', bgcolor: 'white', color: '#1f2937', display: 'flex', alignItems: 'center', minHeight: '38px' }}>
                                                        {formData.personal.mobileNumber || <Typography component="span" sx={{ color: '#9ca3af', fontStyle: 'italic', fontWeight: 400, fontSize: 'inherit' }}>N/A</Typography>}
                                                    </Box>
                                                    <Typography sx={{ color: '#9ca3af', fontWeight: 700, flexShrink: 0 }}>/</Typography>
                                                    <Box sx={{ flex: 1, border: '1px solid #4b5563', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', bgcolor: 'white', color: '#1f2937', display: 'flex', alignItems: 'center', minHeight: '38px' }}>
                                                        {formData.personal.alternateContactNumber || <Typography component="span" sx={{ color: '#9ca3af', fontStyle: 'italic', fontWeight: 400, fontSize: 'inherit' }}>N/A</Typography>}
                                                    </Box>
                                                </>
                                            )}
                                        </Stack>
                                    </Box>
                                );
                            }

                            if (key === 'dob') {
                                return (
                                    <Box key={key} sx={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 3 }}>
                                        <Box>
                                            <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', textTransform: 'capitalize', mb: 1 }}>{formatLabel('dob')}</Typography>
                                            {isEditing ? renderInputHelper('personal', 'dob', formData.personal.dob, 'date') : renderDisplayHelper(formData.personal.dob)}
                                        </Box>
                                        <Box>
                                            <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', textTransform: 'capitalize', mb: 1 }}>{formatLabel('age')}</Typography>
                                            {isEditing ? renderInputHelper('personal', 'age', formData.personal.age, 'text') : renderDisplayHelper(formData.personal.age)}
                                        </Box>
                                        <Box>
                                            <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', textTransform: 'capitalize', mb: 1 }}>{formatLabel('gender')}</Typography>
                                            {isEditing ? renderSelectHelper('personal', 'gender', formData.personal.gender, ['Male', 'Female', 'Other']) : renderDisplayHelper(formData.personal.gender)}
                                        </Box>
                                    </Box>
                                );
                            }

                            if (key === 'maritalStatus') {
                                return (
                                    <Box key={key} sx={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 3 }}>
                                        <Box>
                                            <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', textTransform: 'capitalize', mb: 1 }}>{formatLabel('maritalStatus')}</Typography>
                                            {isEditing ? renderSelectHelper('personal', 'maritalStatus', formData.personal.maritalStatus, ['Single', 'Married']) : renderDisplayHelper(formData.personal.maritalStatus)}
                                        </Box>
                                        <Box>
                                            <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', textTransform: 'capitalize', mb: 1 }}>{formatLabel('bloodGroup')}</Typography>
                                            {isEditing ? renderInputHelper('personal', 'bloodGroup', formData.personal.bloodGroup, 'text') : renderDisplayHelper(formData.personal.bloodGroup)}
                                        </Box>
                                        <Box>
                                            <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', textTransform: 'capitalize', mb: 1 }}>{formatLabel('nationality')}</Typography>
                                            {isEditing ? renderSelectHelper('personal', 'nationality', formData.personal.nationality, ['Indian', 'American', 'British', 'Canadian', 'Australian', 'Other']) : renderDisplayHelper(formData.personal.nationality)}
                                        </Box>
                                    </Box>
                                );
                            }

                            if (key === 'fullNameAadharPan') {
                                return (
                                    <Box key={key} sx={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, 1fr)' }, gap: 3 }}>
                                        <Box>
                                            <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', textTransform: 'capitalize', mb: 1 }}>{formatLabel('fullNameAadharPan')}</Typography>
                                            {isEditing ? renderInputHelper('personal', 'fullNameAadharPan', formData.personal.fullNameAadharPan, 'text') : renderDisplayHelper(formData.personal.fullNameAadharPan)}
                                        </Box>
                                        <Box>
                                            <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', textTransform: 'capitalize', mb: 1 }}>{formatLabel('religion')}</Typography>
                                            {isEditing ? renderSelectHelper('personal', 'religion', formData.personal.religion, ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other']) : renderDisplayHelper(formData.personal.religion)}
                                        </Box>
                                    </Box>
                                );
                            }
                        }


                        if (key === 'currentAddress' || key === 'permanentAddress') {
                            const addressTypeDisplay = key === 'currentAddress' ? 'Current Address' : 'Permanent Address';
                            const isPermanent = key === 'permanentAddress';
                            const disabledPermanent = isPermanent && formData.contact.sameAsCurrentAddress && isEditing;

                            return (
                                <Box key={key} sx={{ gridColumn: 'span 12', bgcolor: 'rgba(249, 250, 251, 0.5)', p: 3, borderRadius: '0.75rem', border: '1px solid #e5e7eb', mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 1 }}>
                                        <Typography component="h4" sx={{ fontSize: '1rem', fontWeight: 700, color: '#5A725A', display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <svg style={{ width: 20, height: 20, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {addressTypeDisplay}
                                        </Typography>
                                        {isPermanent && isEditing && (
                                            <Typography component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#374151', bgcolor: 'white', px: 1.5, py: 0.75, borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', '&:hover': { bgcolor: '#f9fafb' }, transition: 'colors', width: 'max-content' }}>
                                                <Box component="input" type="checkbox" sx={{ width: 16, height: 16, accentColor: '#5A725A', cursor: 'pointer' }} checked={formData.contact.sameAsCurrentAddress} onChange={handleSameAsCurrent} />
                                                Same as Current Address
                                            </Typography>
                                        )}
                                        {isPermanent && !isEditing && formData.contact.sameAsCurrentAddress && (
                                            <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, bgcolor: 'rgba(90, 114, 90, 0.1)', color: '#5A725A', px: 1.5, py: 0.75, borderRadius: '0.5rem', border: '1px solid rgba(90, 114, 90, 0.2)', width: 'max-content' }}>Same as Current</Box>
                                        )}
                                    </Stack>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>
                                        {['doorNo', 'street', 'area', 'city', 'state', 'pincode', 'country'].map(subField => {
                                            const subLabel = subField.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
                                            return (
                                                <Box key={subField} sx={{ gridColumn: subField === 'country' ? { xs: 'span 1', md: 'span 2' } : 'span 1' }}>
                                                    <Typography component="label" sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', mb: 0.5 }}>{subLabel}</Typography>
                                                    {isEditing ? (
                                                        <Box component="input" type="text" value={value[subField] || ''} onChange={(e) => {
                                                            let newVal = e.target.value;
                                                            if (subField === 'pincode') newVal = newVal.replace(/[^0-9]/g, '');
                                                            handleAddressChange(key, subField, newVal);
                                                        }} disabled={disabledPermanent} placeholder={`Enter ${subLabel}`}
                                                            sx={{ width: '100%', border: '1px solid', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', outline: 'none', transition: 'all', '&::placeholder': { color: '#9ca3af' }, ...(disabledPermanent ? { bgcolor: '#f3f4f6', borderColor: '#d1d5db', color: '#6b7280', cursor: 'not-allowed' } : { borderColor: '#4b5563', bgcolor: 'white', color: '#1f2937', '&:focus': { boxShadow: '0 0 0 1px #1f2937', borderColor: '#1f2937' }, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }) }} />
                                                    ) : (
                                                        <Box sx={{ width: '100%', border: '1px solid #4b5563', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', bgcolor: 'white', color: '#1f2937', minHeight: '38px', display: 'flex', alignItems: 'center', wordBreak: 'break-word' }}>
                                                            {value[subField] || <Typography component="span" sx={{ color: '#9ca3af', fontStyle: 'italic', fontWeight: 400, fontSize: '0.75rem' }}>N/A</Typography>}
                                                        </Box>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Box>
                            );
                        }

                        if (key === 'qualifications') {
                            const qualifications = value;
                            return (
                                <Box key={key} sx={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', textTransform: 'capitalize' }}>
                                        Qualifications List
                                    </Typography>
                                    {qualifications.map((qual, idx) => (
                                        <Box key={idx} sx={{ bgcolor: 'rgba(249, 250, 251, 0.5)', p: 3, borderRadius: '0.75rem', border: '1px solid #e5e7eb', position: 'relative' }}>
                                            {isEditing && qualifications.length > 1 && (
                                                <Button
                                                    type="button"
                                                    onClick={() => handleChange(sectionKey, key, qualifications.filter((_, i) => i !== idx))}
                                                    sx={{
                                                        position: 'absolute', top: 16, right: 16, color: '#ef4444', bgcolor: '#fef2f2', minWidth: 40, width: 40, height: 40, borderRadius: '0.5rem', p: 0,
                                                        '&:hover': { bgcolor: '#fee2e2', color: '#dc2626' }, transition: 'colors', zIndex: 10
                                                    }}
                                                    title="Remove Qualification"
                                                >
                                                    <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </Button>
                                            )}

                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2.5 }}>
                                                {Object.entries(qual).map(([qKey, qVal]) => {
                                                    let displayLabel = qKey.replace(/([A-Z])/g, ' $1').trim();
                                                    displayLabel = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1);
                                                    if (qKey === 'percentageCgpa') displayLabel = 'Percentage / CGPA';
                                                    if (qKey === 'universityCollege') displayLabel = 'University / College';

                                                    const qSpan = (qKey === 'certifications' || qKey === 'percentageCgpa') ? 'span 12' : 'span 6';

                                                    return (
                                                        <Box key={qKey} sx={{ gridColumn: qSpan }}>
                                                            <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', mb: 0.5 }}>
                                                                {displayLabel}
                                                            </Typography>
                                                            {isEditing ? (
                                                                qKey === 'yearOfPassing' ? (
                                                                    <Box sx={{ position: 'relative' }}>
                                                                        <Box component="select"
                                                                            value={qVal}
                                                                            onChange={(e) => {
                                                                                const newVal = [...qualifications];
                                                                                newVal[idx] = { ...newVal[idx], [qKey]: e.target.value };
                                                                                handleChange(sectionKey, key, newVal);
                                                                            }}
                                                                            sx={{
                                                                                width: '100%', border: '1px solid #4b5563', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', outline: 'none', transition: 'all', appearance: 'none', cursor: 'pointer', bgcolor: 'white', color: '#1f2937', '&:focus': { boxShadow: '0 0 0 1px #1f2937', borderColor: '#1f2937' }, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                                                                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem`
                                                                            }}
                                                                        >
                                                                            <option value="" disabled>Select Year</option>
                                                                            {Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                                                                <option key={year} value={year}>{year}</option>
                                                                            ))}
                                                                        </Box>
                                                                    </Box>
                                                                ) : (
                                                                    <Box component="input"
                                                                        type="text"
                                                                        value={qVal}
                                                                        onChange={(e) => {
                                                                            let newValText = e.target.value;
                                                                            if (qKey === 'percentageCgpa') newValText = newValText.replace(/[^0-9.]/g, '');
                                                                            const newVal = [...qualifications];
                                                                            newVal[idx] = { ...newVal[idx], [qKey]: newValText };
                                                                            handleChange(sectionKey, key, newVal);
                                                                        }}
                                                                        placeholder={`Enter ${displayLabel}`}
                                                                        sx={{ width: '100%', border: '1px solid #4b5563', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', outline: 'none', transition: 'all', '&::placeholder': { color: '#9ca3af' }, bgcolor: 'white', color: '#1f2937', '&:focus': { boxShadow: '0 0 0 1px #1f2937', borderColor: '#1f2937' }, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                                                                    />
                                                                )
                                                            ) : (
                                                                <Box sx={{ width: '100%', border: '1px solid #4b5563', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', bgcolor: 'white', color: '#1f2937', borderStyle: 'solid', display: 'flex', alignItems: 'center', wordBreak: 'break-word', minHeight: '38px' }}>
                                                                    {qVal || <Typography component="span" sx={{ color: '#9ca3af', fontStyle: 'italic', fontWeight: 400, fontSize: 'inherit' }}>Not provided</Typography>}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )
                                                })}
                                            </Box>
                                        </Box>
                                    ))}

                                    {isEditing && (
                                        <Button
                                            type="button"
                                            onClick={() => handleChange(sectionKey, key, [...qualifications, {
                                                Qualification: "",
                                                degreeName: "",
                                                universityCollege: "",
                                                yearOfPassing: "",
                                                percentageCgpa: "",
                                                certifications: ""
                                            }])}
                                            sx={{
                                                fontSize: '0.875rem', color: '#5A725A', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5,
                                                '&:hover': { color: '#4a5f4a', bgcolor: 'rgba(90, 114, 90, 0.15)' }, transition: 'colors', bgcolor: 'rgba(90, 114, 90, 0.1)',
                                                px: 2, py: 1.5, borderRadius: '0.75rem', width: '100%', border: '1px dashed rgba(90, 114, 90, 0.2)', textTransform: 'none'
                                            }}
                                        >
                                            <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            Add Another Education
                                        </Button>
                                    )}
                                </Box>
                            )
                        }

                        if (key === 'employmentHistory') {
                            const employmentHistory = value;
                            return (
                                <Box key={key} sx={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', textTransform: 'capitalize' }}>
                                        Employment History List
                                    </Typography>
                                    {employmentHistory.map((emp, idx) => (
                                        <Box key={idx} sx={{ bgcolor: 'rgba(249, 250, 251, 0.5)', p: 3, borderRadius: '0.75rem', border: '1px solid #e5e7eb', position: 'relative' }}>
                                            {isEditing && employmentHistory.length > 1 && (
                                                <Button
                                                    type="button"
                                                    onClick={() => handleChange(sectionKey, key, employmentHistory.filter((_, i) => i !== idx))}
                                                    sx={{
                                                        position: 'absolute', top: 16, right: 16, color: '#ef4444', bgcolor: '#fef2f2', minWidth: 40, width: 40, height: 40, borderRadius: '0.5rem', p: 0,
                                                        '&:hover': { bgcolor: '#fee2e2', color: '#dc2626' }, transition: 'colors', zIndex: 10
                                                    }}
                                                    title="Remove Employment"
                                                >
                                                    <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </Button>
                                            )}

                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2.5 }}>
                                                {Object.entries(emp).map(([eKey, eVal]) => {
                                                    let displayLabel = eKey.replace(/([A-Z])/g, ' $1').trim();
                                                    displayLabel = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1);
                                                    if (eKey === 'experienceYearsMonths') displayLabel = 'Experience (Years / Months)';

                                                    const isDateInput = eKey === 'dateOfJoining' || eKey === 'dateOfRelieving';
                                                    const eSpan = (eKey === 'reasonForLeaving' || eKey === 'previousCompanyName' || eKey === 'lastDrawnSalary') ? 'span 12' : 'span 6';

                                                    return (
                                                        <Box key={eKey} sx={{ gridColumn: eSpan }}>
                                                            <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', mb: 0.5 }}>
                                                                {displayLabel}
                                                            </Typography>
                                                            {isEditing ? (
                                                                <Box component="input"
                                                                    type={isDateInput ? 'date' : (eKey === 'lastDrawnSalary' ? 'number' : 'text')}
                                                                    value={eVal}
                                                                    onChange={(e) => {
                                                                        let newValText = e.target.value;
                                                                        if (eKey === 'lastDrawnSalary' || eKey === 'experienceYearsMonths') newValText = newValText.replace(/[^0-9.]/g, '');
                                                                        const newVal = [...employmentHistory];
                                                                        newVal[idx] = { ...newVal[idx], [eKey]: newValText };
                                                                        handleChange(sectionKey, key, newVal);
                                                                    }}
                                                                    placeholder={`Enter ${displayLabel}`}
                                                                    sx={{ width: '100%', border: '1px solid #4b5563', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', outline: 'none', transition: 'all', '&::placeholder': { color: '#9ca3af' }, bgcolor: 'white', color: '#1f2937', '&:focus': { boxShadow: '0 0 0 1px #1f2937', borderColor: '#1f2937' }, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                                                                />
                                                            ) : (
                                                                <Box sx={{ width: '100%', border: '1px solid #4b5563', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', bgcolor: 'white', color: '#1f2937', borderStyle: 'solid', display: 'flex', alignItems: 'center', wordBreak: 'break-word', minHeight: '38px' }}>
                                                                    {eVal || <Typography component="span" sx={{ color: '#9ca3af', fontStyle: 'italic', fontWeight: 400, fontSize: 'inherit' }}>Not provided</Typography>}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )
                                                })}
                                            </Box>
                                        </Box>
                                    ))}

                                    {isEditing && (
                                        <Button
                                            type="button"
                                            onClick={() => handleChange(sectionKey, key, [...employmentHistory, {
                                                previousCompanyName: "",
                                                designation: "",
                                                experienceYearsMonths: "",
                                                dateOfJoining: "",
                                                dateOfRelieving: "",
                                                reasonForLeaving: "",
                                                lastDrawnSalary: ""
                                            }])}
                                            sx={{
                                                fontSize: '0.875rem', color: '#5A725A', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5,
                                                '&:hover': { color: '#4a5f4a', bgcolor: 'rgba(90, 114, 90, 0.15)' }, transition: 'colors', bgcolor: 'rgba(90, 114, 90, 0.1)',
                                                px: 2, py: 1.5, borderRadius: '0.75rem', width: '100%', border: '1px dashed rgba(90, 114, 90, 0.2)', textTransform: 'none'
                                            }}
                                        >
                                            <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            Add Another Employment
                                        </Button>
                                    )}
                                </Box>
                            )
                        }

                        return (
                            <Box key={key} sx={{ gridColumn: (isArray || key === 'employeeGradeLevel') ? 'span 12' : { xs: 'span 12', xl: 'span 6' } }}>
                                <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', textTransform: 'capitalize', mb: 1 }}>
                                    {formatLabel(key)}
                                </Typography>

                                {isEditing ? (
                                    isArray ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            {value.map((v, idx) => (
                                                <Stack key={idx} direction="row" spacing={1.5}>
                                                    <Box component="input"
                                                        type="text"
                                                        value={v}
                                                        onChange={(e) => {
                                                            const newArr = [...value]
                                                            newArr[idx] = e.target.value
                                                            handleChange(sectionKey, key, newArr)
                                                        }}
                                                        placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`}
                                                        sx={{ flex: 1, width: '100%', border: '1px solid #4b5563', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', outline: 'none', transition: 'all', '&::placeholder': { color: '#9ca3af' }, bgcolor: 'white', color: '#1f2937', '&:focus': { boxShadow: '0 0 0 1px #1f2937', borderColor: '#1f2937' }, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            const newArr = value.filter((_, i) => i !== idx)
                                                            handleChange(sectionKey, key, newArr)
                                                        }}
                                                        sx={{ bgcolor: '#fef2f2', color: '#ef4444', px: 2, borderRadius: '0.75rem', '&:hover': { bgcolor: '#fee2e2' }, transition: 'colors', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', minWidth: '40px' }}
                                                        title="Remove"
                                                    >
                                                        <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </Button>
                                                </Stack>
                                            ))}
                                            <Button
                                                type="button"
                                                onClick={() => handleChange(sectionKey, key, [...value, ""])}
                                                sx={{
                                                    fontSize: '0.875rem', color: '#5A725A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mt: 1,
                                                    '&:hover': { color: '#4a5f4a', bgcolor: 'rgba(90, 114, 90, 0.15)' }, transition: 'colors', bgcolor: 'rgba(90, 114, 90, 0.1)',
                                                    px: 2, py: 1.25, borderRadius: '0.75rem', width: 'max-content', textTransform: 'none'
                                                }}
                                            >
                                                <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                                Add Another {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </Button>
                                        </Box>
                                    ) : isCert ? (
                                        <Box sx={{ width: '100%' }}>
                                            <Typography component="label" sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: 'white', border: '1px solid #e5e7eb', color: '#374151', px: 2, py: 1.25, borderRadius: '0.75rem', '&:hover': { bgcolor: '#f9fafb' }, transition: 'colors', width: '100%', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', fontWeight: 600 }}>
                                                <svg style={{ width: 20, height: 20, color: '#5A725A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                <span>{value ? "Update Certification File" : "Upload Certification"}</span>
                                                <Box component="input"
                                                    type="file"
                                                    accept="application/pdf,image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0]
                                                        if (file) handleChange(sectionKey, key, file)
                                                    }}
                                                    sx={{ display: 'none' }}
                                                />
                                            </Typography>
                                            {value && (
                                                <Box sx={{ mt: 1, fontSize: '0.875rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(90, 114, 90, 0.05)', px: 1.5, py: 1, borderRadius: '0.5rem', wordBreak: 'break-all' }}>
                                                    <svg style={{ width: 16, height: 16, color: '#5A725A', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                    {value.name || "Uploaded Document"}
                                                </Box>
                                            )}
                                        </Box>
                                    ) : (

                                        (key === 'gender' || key === 'maritalStatus' || key === 'nationality' || key === 'employmentType') ? (
                                            <Box sx={{ position: 'relative' }}>
                                                <Box component="select"
                                                    value={value}
                                                    onChange={(e) => handleChange(sectionKey, key, e.target.value)}
                                                    sx={{
                                                        width: '100%', border: '1px solid #4b5563', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', outline: 'none', transition: 'all', appearance: 'none', cursor: 'pointer', bgcolor: 'white', color: '#1f2937', '&:hover': { bgcolor: 'rgba(249, 250, 251, 0.5)' }, '&:focus': { boxShadow: '0 0 0 1px #1f2937', borderColor: '#1f2937' }, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem`
                                                    }}
                                                >
                                                    <option value="" disabled>Select {formatLabel(key)}</option>
                                                    {key === 'gender' && (
                                                        <>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                            <option value="Other">Other</option>
                                                        </>
                                                    )}
                                                    {key === 'maritalStatus' && (
                                                        <>
                                                            <option value="Single">Single</option>
                                                            <option value="Married">Married</option>
                                                        </>
                                                    )}
                                                    {key === 'nationality' && (
                                                        <>
                                                            <option value="Indian">Indian</option>
                                                            <option value="American">American</option>
                                                            <option value="British">British</option>
                                                            <option value="Canadian">Canadian</option>
                                                            <option value="Australian">Australian</option>
                                                            <option value="Other">Other</option>
                                                        </>
                                                    )}
                                                    {key === 'employmentType' && (
                                                        <>
                                                            <option value="Full-Time">Full-Time</option>
                                                            <option value="Part-Time">Part-Time</option>
                                                            <option value="Contract">Contract</option>
                                                            <option value="Intern">Intern</option>
                                                        </>
                                                    )}
                                                    {key === 'accountType' && (
                                                        <>
                                                            <option value="Savings">Savings</option>
                                                            <option value="Current">Current</option>
                                                            <option value="Salary">Salary</option>
                                                        </>
                                                    )}
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Box component="input"
                                                type={(key === 'dob' || key === 'dateOfJoining' || key === 'confirmationDate') ? 'date' : 'text'}
                                                value={value}
                                                onChange={(e) => {
                                                    let newVal = e.target.value;
                                                    const numFields = ['mobileNumber', 'alternateContactNumber', 'accountNumber'];
                                                    if (numFields.includes(key)) newVal = newVal.replace(/[^0-9]/g, '');
                                                    handleChange(sectionKey, key, newVal);
                                                }}
                                                readOnly={key === 'employeeId' || key === 'age'}
                                                sx={{ width: '100%', border: '1px solid', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', outline: 'none', transition: 'all', '&::placeholder': { color: '#9ca3af' }, ...(key === 'employeeId' || key === 'age' ? { bgcolor: '#f3f4f6', borderColor: '#d1d5db', color: '#6b7280', cursor: 'not-allowed' } : { borderColor: '#4b5563', bgcolor: 'white', color: '#1f2937', '&:focus': { boxShadow: '0 0 0 1px #1f2937', borderColor: '#1f2937' }, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }) }}
                                            />
                                        )
                                    )
                                ) : (
                                    isArray ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {value.length > 0 ? value.map((v, idx) => (
                                                <Box key={idx} sx={{ width: '100%', border: '1px solid #4b5563', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', bgcolor: 'white', color: '#1f2937', minHeight: '38px', display: 'flex', alignItems: 'center', wordBreak: 'break-word' }}>
                                                    {v || <Typography component="span" sx={{ color: '#9ca3af', fontStyle: 'italic', fontWeight: 400, fontSize: 'inherit' }}>Not provided</Typography>}
                                                </Box>
                                            )) : (
                                                <Box sx={{ width: '100%', border: '1px solid #4b5563', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', bgcolor: '#f9fafb', color: '#6b7280', minHeight: '38px', display: 'flex', alignItems: 'center', wordBreak: 'break-word' }}>
                                                    <Typography component="span" sx={{ color: '#9ca3af', fontStyle: 'italic', fontWeight: 400, fontSize: 'inherit' }}>None</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    ) : isCert ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
                                            {value ? (
                                                <>
                                                    <Typography component="span" sx={{ color: '#1f2937', fontWeight: 500, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        <svg style={{ width: 20, height: 20, color: '#5A725A', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{value?.name || "Certification Document"}</span>
                                                    </Typography>
                                                    <Button
                                                        onClick={() => {
                                                            if (value instanceof File) {
                                                                const url = URL.createObjectURL(value)
                                                                window.open(url, '_blank')
                                                            } else {
                                                                alert("View functionality requires a real file backend or URL.")
                                                            }
                                                        }}
                                                        sx={{ bgcolor: 'white', border: '1px solid #e5e7eb', color: '#5A725A', '&:hover': { bgcolor: '#5A725A', color: 'white' }, px: 1.5, py: 0.75, borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, transition: 'colors', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', textTransform: 'none' }}
                                                    >
                                                        View
                                                    </Button>
                                                </>
                                            ) : (
                                                <Typography component="span" sx={{ color: '#9ca3af', fontStyle: 'italic', fontWeight: 400, fontSize: '0.875rem', py: 1 }}>No certification uploaded</Typography>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box sx={{ width: '100%', border: '1px solid #4b5563', px: 1.5, py: 1, borderRadius: '0.125rem', fontSize: '0.875rem', bgcolor: 'white', color: '#1f2937', minHeight: '38px', display: 'flex', alignItems: 'center', wordBreak: 'break-word' }}>
                                            {value || <Typography component="span" sx={{ color: '#9ca3af', fontStyle: 'italic', fontWeight: 400, fontSize: 'inherit' }}>Not provided</Typography>}
                                        </Box>
                                    )
                                )}
                            </Box>
                        );
                    })}
            </Box>
        </Paper>
    )


    const getCompletionStats = () => {
        let totalFields = 0;
        let filledFields = 0;

        if (employee) {
            const sectionsToCount = ['personal', 'contact', 'employment', 'education', 'previousEmployment', 'compensation'];

            sectionsToCount.forEach(section => {
                if (employee[section]) {
                    Object.entries(employee[section]).forEach(([key, val]) => {

                        if (key === 'employeeId' || key === 'age' || key === 'sameAsCurrentAddress') return;

                        if (key === 'currentAddress' || key === 'permanentAddress') {
                            Object.entries(val).forEach(([subKey, subVal]) => {
                                totalFields++;
                                if (subVal && subVal.toString().trim() !== '') filledFields++;
                            });
                            return;
                        }

                        if (Array.isArray(val)) {
                            val.forEach(item => {
                                if (typeof item === 'object') {
                                    Object.entries(item).forEach(([subKey, subVal]) => {
                                        if (subKey === 'certifications') return;
                                        totalFields++;
                                        if (subVal && subVal.toString().trim() !== '') filledFields++;
                                    })
                                } else {
                                    totalFields++;
                                    if (item && item.toString().trim() !== '') filledFields++;
                                }
                            })
                        } else {
                            totalFields++;
                            if (val && val.toString().trim() !== '') filledFields++;
                        }
                    })
                }
            })
        }

        const percentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
        return { percentage, filledFields, totalFields };
    }

    const { percentage } = getCompletionStats();

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, '& > * + *': { mt: 4 }, pb: 5 }}>

            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    p: 4,
                    borderRadius: '1rem',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                    border: '1px solid #f3f4f6',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: 'white'
                }}
            >
                <Box sx={{
                    position: 'absolute', top: 0, right: 0, width: 256, height: 256,
                    bgcolor: 'rgba(90, 114, 90, 0.05)', borderRadius: '50%', filter: 'blur(40px)',
                    mr: '-8rem', mt: '-8rem', pointerEvents: 'none'
                }} />

                <Stack direction="row" spacing={3} alignItems="center" sx={{ position: 'relative' }}>
                    <Box sx={{
                        width: 128, height: 128,
                        background: 'linear-gradient(to bottom right, #5A725A, #4a5f4a)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '1.5rem', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                        fontWeight: 'bold', fontSize: '3.75rem', overflow: 'hidden', flexShrink: 0
                    }}>
                        {employee?.documents?.["Passport Size Photos"]?.previewUrl ? (
                            <Box component="img" src={employee.documents["Passport Size Photos"].previewUrl} alt={`${employee.name} Photo`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            employee.name ? employee.name.charAt(0) : "E"
                        )}
                    </Box>
                    <Box>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography sx={{ fontSize: '1.875rem', fontWeight: 700, color: '#1f2937' }}>{employee.name}</Typography>

                            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { cursor: 'pointer' } }} title={`${percentage}% Profile Completed`}>
                                <svg style={{ width: '3rem', height: '3rem', transform: 'rotate(-90deg)' }}>
                                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" style={{ color: '#e5e7eb' }} />
                                    <circle
                                        cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent"
                                        strokeDasharray={`${2 * Math.PI * 20}`}
                                        strokeDashoffset={`${2 * Math.PI * 20 - (percentage / 100) * (2 * Math.PI * 20)}`}
                                        style={{
                                            color: percentage === 100 ? '#22c55e' : percentage >= 50 ? '#eab308' : '#ef4444',
                                            transition: 'all 1s ease-in-out'
                                        }}
                                    />
                                </svg>
                                <Typography sx={{ position: 'absolute', fontSize: '0.6875rem', fontWeight: 700, color: '#374151' }}>{percentage}%</Typography>
                            </Box>
                        </Stack>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1, color: '#6b7280', fontWeight: 500 }}>
                            <Box sx={{ bgcolor: '#f3f4f6', color: '#374151', px: 1.5, py: 0.75, borderRadius: '0.5rem', fontSize: '0.875rem', fontFamily: 'monospace', border: '1px solid #e5e7eb' }}>
                                {employee.empId}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.875rem' }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#5A725A' }} />
                                {employee.department} Department
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ position: 'relative', zIndex: 10, width: { xs: '100%', md: 'auto' } }}>
                    {isEditing ? (
                        <>
                            <Button
                                onClick={() => {
                                    setFormData(employee)
                                    setIsEditing(false)
                                }}
                                sx={{
                                    bgcolor: 'white', border: '1px solid #e5e7eb', color: '#374151', px: 3, py: 1.25, borderRadius: '0.75rem',
                                    '&:hover': { bgcolor: '#f9fafb' }, transition: 'colors', fontWeight: 600, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                                    width: { xs: '100%', md: 'auto' }, textTransform: 'none'
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                sx={{
                                    bgcolor: '#5A725A', color: 'white', px: 4, py: 1.25, borderRadius: '0.75rem',
                                    '&:hover': { bgcolor: '#4a5f4a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
                                    transition: 'colors', fontWeight: 700, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.1)',
                                    width: { xs: '100%', md: 'auto' }, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, textTransform: 'none'
                                }}
                            >
                                <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={() => navigate(-1)}
                                sx={{
                                    bgcolor: 'white', border: '1px solid #e5e7eb', color: '#374151', px: 3, py: 1.25, borderRadius: '0.75rem',
                                    '&:hover': { bgcolor: '#f9fafb' }, transition: 'colors', fontWeight: 600, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                                    width: { xs: '100%', md: 'auto' }, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, textTransform: 'none'
                                }}
                            >
                                <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Directory
                            </Button>
                            <Button
                                onClick={() => setIsEditing(true)}
                                sx={{
                                    bgcolor: '#5A725A', color: 'white', px: 4, py: 1.25, borderRadius: '0.75rem',
                                    '&:hover': { bgcolor: '#4a5f4a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
                                    transition: 'colors', fontWeight: 700, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.1)',
                                    width: { xs: '100%', md: 'auto' }, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, textTransform: 'none'
                                }}
                            >
                                <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                Edit Profile
                            </Button>
                        </>
                    )}
                </Stack>
            </Paper>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', flex: 1 }}>
                
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) minmax(400px, 1fr)', gap: 3, width: '100%', minWidth: '800px' }}>
                        
                        <Box sx={{ flexShrink: 0 }}>
                            <Stack spacing={4}>
                                {activeFilters.personal?._show && (
                                    renderSectionCard(
                                        "Personal Details",
                                        "personal",
                                        <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    )
                                )}
                                {activeFilters.contact?._show && (
                                    renderSectionCard(
                                        "Contact Information",
                                        "contact",
                                        <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    )
                                )}
                                {activeFilters.compensation?._show && (
                                    renderSectionCard(
                                        "Compensation & Benefits",
                                        "compensation",
                                        <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    )
                                )}
                            </Stack>
                        </Box>

                        
                        <Box sx={{ flexShrink: 0 }}>
                            <Stack spacing={4}>
                                {activeFilters.employment?._show && (
                                    renderSectionCard(
                                        "Employment Information",
                                        "employment",
                                        <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    )
                                )}
                                {activeFilters.education?._show && (
                                    renderSectionCard(
                                        "Educational Qualifications",
                                        "education",
                                        <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                                    )
                                )}
                                {activeFilters.previousEmployment?._show && (
                                    renderSectionCard(
                                        "Previous Employment Details",
                                        "previousEmployment",
                                        <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    )
                                )}

                                
                                {activeFilters.payroll?._show && employee?.payroll?.totals && !isEditing && (
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 4, bgcolor: 'white', borderRadius: '1rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                                            border: '1px solid #f3f4f6', overflow: 'hidden', position: 'relative',
                                            transition: 'all 0.3s', '&:hover': { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.1)' }
                                        }}
                                    >
                                        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 128, height: 128, bgcolor: 'rgba(90, 114, 90, 0.05)', borderRadius: '0 0 0 100%', pointerEvents: 'none', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.1)' } }} />
                                        <Box sx={{ borderBottom: '1px solid #f3f4f6', bgcolor: 'transparent', pb: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                                            <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ bgcolor: 'rgba(90, 114, 90, 0.1)', p: 1.25, borderRadius: '0.75rem', color: '#5A725A', display: 'flex' }}>
                                                    <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
                                                </Box>
                                                Assigned Salary Structure
                                            </Typography>
                                            <Button
                                                onClick={() => navigate('/hr/payroll')}
                                                sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#5A725A', bgcolor: 'white', px: 2, py: 1, borderRadius: '0.25rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', '&:hover': { color: '#4a5f4a', bgcolor: '#f9fafb' }, textTransform: 'none' }}
                                            >
                                                Configure
                                            </Button>
                                        </Box>
                                        <Box sx={{ p: 0 }}>
                                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                                <Grid item xs={6}>
                                                    <Box sx={{ bgcolor: 'rgba(240, 253, 244, 0.5)', border: '1px solid #dcfce7', p: 2, borderRadius: '0.75rem' }}>
                                                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Monthly Gross</Typography>
                                                        <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#5A725A' }}>
                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(employee.payroll.totals.grossSalary)}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Box sx={{ bgcolor: 'rgba(236, 253, 245, 0.5)', border: '1px solid #d1fae5', p: 2, borderRadius: '0.75rem' }}>
                                                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Net Take-Home</Typography>
                                                        <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>
                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(employee.payroll.totals.netTakeHome)}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Box sx={{ bgcolor: '#f9fafb', border: '1px solid #f3f4f6', p: 2, borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Box>
                                                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Annual Target CTC</Typography>
                                                            <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#1f2937' }}>
                                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(employee.payroll.totals.totalCTC)}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ width: 48, height: 48, bgcolor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', border: '1px solid #f3f4f6', color: '#5A725A' }}>
                                                            <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Paper>
                                )}

                                {activeFilters.payroll?._show && (!employee?.payroll?.totals || isEditing) && (
                                    renderSectionCard(
                                        "Payroll Status",
                                        "payroll",
                                        <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
                                    )
                                )}
                            </Stack>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default EmployeeProfile
