import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"

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

        const savedProfiles = JSON.parse(localStorage.getItem('employee_profiles') || '{}')
        const existingData = savedProfiles[empId]


        const fallbackName = location.state?.name || "Employee Name"
        const fallbackDept = location.state?.department || "N/A"

        let profileData = existingData

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

            if (!profileData.personal.hasOwnProperty('firstName')) {
                const migratedName = profileData.personal.fullName || profileData.name || fallbackName;
                profileData.personal = {
                    firstName: migratedName.split(' ')[0] || "",
                    lastName: migratedName.split(' ').slice(1).join(' ') || "",
                    mobileNumber: profileData.personal.mobileNumber || "",
                    personalEmail: profileData.personal.personalEmail || "",
                    alternateContactNumber: profileData.personal.alternateContactNumber || "",
                    fullNameAadharPan: migratedName || "",
                    religion: profileData.personal.religion || "",
                    age: profileData.personal.age || "",
                    dob: profileData.personal.dob || "",
                    bloodGroup: profileData.personal.bloodGroup || "",
                    maritalStatus: profileData.personal.maritalStatus || "",
                    gender: profileData.personal.gender || "",
                    nationality: profileData.personal.nationality || ""
                }

                if (profileData.personal.dob) {
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
            if (!profileData.contact.hasOwnProperty('currentAddress')) {
                profileData.contact = {
                    currentAddress: { doorNo: "", street: "", area: "", city: profileData.contact.address || "", state: "", pincode: "", country: "" },
                    permanentAddress: { doorNo: "", street: "", area: "", city: "", state: "", pincode: "", country: "" },
                    sameAsCurrentAddress: false
                };
            }
            if (!profileData.employment.hasOwnProperty('designation') && !profileData.employment.hasOwnProperty('employeeId')) {
                profileData.employment = {
                    employeeId: empId,
                    department: profileData.employment.department || "",
                    designation: profileData.employment.jobTitle || "",
                    employmentType: profileData.employment.type || "",
                    reportingManager: profileData.employment.supervisor || "",
                    dateOfJoining: profileData.employment.startDate || "",
                    probationPeriod: "",
                    confporm: "",
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

            const savedDocs = JSON.parse(localStorage.getItem('employee_documents') || '{}')
            if (savedDocs[empId]) {
                profileData.documents = savedDocs[empId]
            } else if (!profileData.documents || Object.keys(profileData.documents).length === 0) {
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

        // Fetch Employee data from backend to populate addresses
        const numericId = String(empId).replace(/[^0-9]/g, '') || empId;
        fetch(`https://localhost:7134/api/EmployeeMaster/${numericId}`)
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("API response not ok: " + res.status);
            })
            .then(data => {
                console.log("Backend Employee Data:", data);
                if (data) {
                    const current = data.currentAddress;
                    const permanent = data.permanentAddress;

                    console.log("Current Address:", current);
                    console.log("Permanent Address:", permanent);

                    setFormData(prev => {
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
                            personal: updatedPersonal,
                            contact: {
                                ...prev.contact,
                                currentAddress: current ? { ...prev.contact.currentAddress, ...current } : prev.contact.currentAddress,
                                permanentAddress: permanent ? { ...prev.contact.permanentAddress, ...permanent } : prev.contact.permanentAddress
                            },
                            employment: {
                                ...prev.employment,
                                department: data.department || prev.employment?.department || "",
                                designation: data.designation || prev.employment?.designation || "",
                                employmentType: data.employmentType || prev.employment?.employmentType || "",
                                dateOfJoining: data.dateOfJoining ? data.dateOfJoining.split('T')[0] : prev.employment?.dateOfJoining || ""
                            }
                        };
                    });

                    setEmployee(prev => {
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

                        if (updatedPersonal.dob) {
                            const today = new Date();
                            const birthDate = new Date(updatedPersonal.dob);
                            let age = today.getFullYear() - birthDate.getFullYear();
                            if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
                                age--;
                            }
                            updatedPersonal.age = age >= 0 ? age.toString() : "0";
                        }

                        return {
                            ...prev,
                            name: data.fullName || prev.name,
                            personal: updatedPersonal,
                            contact: {
                                ...prev.contact,
                                currentAddress: current ? { ...prev.contact.currentAddress, ...current } : prev.contact.currentAddress,
                                permanentAddress: permanent ? { ...prev.contact.permanentAddress, ...permanent } : prev.contact.permanentAddress
                            },
                            employment: {
                                ...prev.employment,
                                department: data.department || prev.employment?.department || "",
                                designation: data.designation || prev.employment?.designation || "",
                                employmentType: data.employmentType || prev.employment?.employmentType || "",
                                dateOfJoining: data.dateOfJoining ? data.dateOfJoining.split('T')[0] : prev.employment?.dateOfJoining || ""
                            }
                        };
                    });
                }
            })
            .catch(err => console.error("Error fetching backend data:", err));

        // Fetch Employee Education Data
        fetch(`https://localhost:7134/api/EmployeeMaster/${numericId}/education`)
            .then(res => {
                if (res.ok) return res.json();
                return [];
            })
            .then(data => {
                if (data && Array.isArray(data) && data.length > 0) {
                    const formattedEducation = data.map(edu => ({
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
            })
            .catch(err => console.error("Error fetching education backend data:", err));

        // Fetch Employee Compensation Data
        fetch(`https://localhost:7134/api/EmployeeMaster/${numericId}/compensation`)
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
        fetch(`https://localhost:7134/api/EmployeeMaster/${numericId}/previous-employment`)
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


        const savedProfiles = JSON.parse(localStorage.getItem('employee_profiles') || '{}')
        savedProfiles[empId] = updatedFormData
        localStorage.setItem('employee_profiles', JSON.stringify(savedProfiles))


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

            const personalResponse = await fetch(`https://localhost:7134/api/EmployeeMaster/${numericId}/personal-details`, {
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

            const addressResponse = await fetch(`https://localhost:7134/api/EmployeeMaster/${numericId}/address`, {
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
                educationResponse = await fetch(`https://localhost:7134/api/EmployeeMaster/${numericId}/education/bulk`, {
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

                compensationResponse = await fetch(`https://localhost:7134/api/EmployeeMaster/${numericId}/compensation`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(compensationData)
                });
            }

            // 5. Save Previous Employment Details
            let previousEmploymentResponse = null;
            const previousEmploymentData = (formData.previousEmployment?.employmentHistory || [])
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

            if (previousEmploymentData.length > 0) {
                // Assuming backend expects an array for bulk insert/update
                previousEmploymentResponse = await fetch(`https://localhost:7134/api/EmployeeMaster/${numericId}/previous-employment`, {
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
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="bg-[#5A725A]/10 p-2.5 rounded-xl text-[#5A725A]">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        if (sectionKey === 'personal') {
                            if (['alternateContactNumber', 'age', 'gender', 'bloodGroup', 'nationality', 'religion'].includes(key)) return null;

                            const renderInputHelper = (sec, fKey, val, type) => (
                                <input
                                    type={type}
                                    value={val || ''}
                                    readOnly={fKey === 'age'}
                                    onChange={(e) => handleChange(sec, fKey, e.target.value)}
                                    className={`w-full border px-3 py-2 rounded-sm text-sm outline-none transition-all placeholder:text-gray-400 ${fKey === 'age' ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' : 'border-gray-600 bg-white text-gray-800 focus:ring-1 focus:ring-gray-800 focus:border-gray-800 shadow-sm'}`}
                                />
                            );
                            const renderSelectHelper = (sec, fKey, val, options) => (
                                <div className="relative">
                                    <select
                                        value={val || ''}
                                        onChange={(e) => handleChange(sec, fKey, e.target.value)}
                                        className="w-full border border-gray-600 px-3 py-2 rounded-sm text-sm outline-none transition-all appearance-none cursor-pointer bg-white text-gray-800 hover:bg-gray-50/50 focus:ring-1 focus:ring-gray-800 focus:border-gray-800 shadow-sm"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                                    >
                                        <option value="" disabled>Select {formatLabel(fKey)}</option>
                                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            );
                            const renderDisplayHelper = (v) => (
                                <div className="w-full border border-gray-600 px-3 py-2 rounded-sm text-sm bg-white text-gray-800 min-h-[38px] flex items-center break-words">
                                    {v || <span className="text-gray-400 italic font-normal">Not provided</span>}
                                </div>
                            );

                            if (key === 'mobileNumber') {
                                return (
                                    <div key={key} className="">
                                        <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">
                                            Mobile / Alternate Contact
                                        </label>
                                        <div className="flex items-center gap-2">
                                            {isEditing ? (
                                                <>
                                                    {renderInputHelper('personal', 'mobileNumber', formData.personal.mobileNumber, 'text')}
                                                    <span className="text-gray-400 font-bold shrink-0">/</span>
                                                    {renderInputHelper('personal', 'alternateContactNumber', formData.personal.alternateContactNumber, 'text')}
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex-1 border border-gray-600 px-3 py-2 rounded-sm text-sm bg-white text-gray-800 flex items-center min-h-[38px]">{formData.personal.mobileNumber || <span className="text-gray-400 italic font-normal">N/A</span>}</div>
                                                    <span className="text-gray-400 font-bold shrink-0">/</span>
                                                    <div className="flex-1 border border-gray-600 px-3 py-2 rounded-sm text-sm bg-white text-gray-800 flex items-center min-h-[38px]">{formData.personal.alternateContactNumber || <span className="text-gray-400 italic font-normal">N/A</span>}</div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            if (key === 'dob') {
                                return (
                                    <div key={key} className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">{formatLabel('dob')}</label>
                                            {isEditing ? renderInputHelper('personal', 'dob', formData.personal.dob, 'date') : renderDisplayHelper(formData.personal.dob)}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">{formatLabel('age')}</label>
                                            {isEditing ? renderInputHelper('personal', 'age', formData.personal.age, 'text') : renderDisplayHelper(formData.personal.age)}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">{formatLabel('gender')}</label>
                                            {isEditing ? renderSelectHelper('personal', 'gender', formData.personal.gender, ['Male', 'Female', 'Other']) : renderDisplayHelper(formData.personal.gender)}
                                        </div>
                                    </div>
                                );
                            }

                            if (key === 'maritalStatus') {
                                return (
                                    <div key={key} className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">{formatLabel('maritalStatus')}</label>
                                            {isEditing ? renderSelectHelper('personal', 'maritalStatus', formData.personal.maritalStatus, ['Single', 'Married']) : renderDisplayHelper(formData.personal.maritalStatus)}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">{formatLabel('bloodGroup')}</label>
                                            {isEditing ? renderInputHelper('personal', 'bloodGroup', formData.personal.bloodGroup, 'text') : renderDisplayHelper(formData.personal.bloodGroup)}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">{formatLabel('nationality')}</label>
                                            {isEditing ? renderSelectHelper('personal', 'nationality', formData.personal.nationality, ['Indian', 'American', 'British', 'Canadian', 'Australian', 'Other']) : renderDisplayHelper(formData.personal.nationality)}
                                        </div>
                                    </div>
                                );
                            }

                            if (key === 'fullNameAadharPan') {
                                return (
                                    <div key={key} className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">{formatLabel('fullNameAadharPan')}</label>
                                            {isEditing ? renderInputHelper('personal', 'fullNameAadharPan', formData.personal.fullNameAadharPan, 'text') : renderDisplayHelper(formData.personal.fullNameAadharPan)}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">{formatLabel('religion')}</label>
                                            {isEditing ? renderSelectHelper('personal', 'religion', formData.personal.religion, ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other']) : renderDisplayHelper(formData.personal.religion)}
                                        </div>
                                    </div>
                                );
                            }
                        }

                        if (sectionKey === 'employment') {
                            if (['department', 'employmentType', 'reportingManager', 'dateOfJoining'].includes(key)) return null;

                            const renderInputHelper = (sec, fKey, val, type) => (
                                <input
                                    type={type}
                                    value={val || ''}
                                    readOnly={fKey === 'employeeId'}
                                    onChange={(e) => handleChange(sec, fKey, e.target.value)}
                                    className={`w-full border px-3 py-2 rounded-sm text-sm outline-none transition-all placeholder:text-gray-400 ${fKey === 'employeeId' ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' : 'border-gray-600 bg-white text-gray-800 focus:ring-1 focus:ring-gray-800 focus:border-gray-800 shadow-sm'}`}
                                />
                            );
                            const renderSelectHelper = (sec, fKey, val, options) => (
                                <div className="relative">
                                    <select
                                        value={val || ''}
                                        onChange={(e) => handleChange(sec, fKey, e.target.value)}
                                        className="w-full border border-gray-600 px-3 py-2 rounded-sm text-sm outline-none transition-all appearance-none cursor-pointer bg-white text-gray-800 hover:bg-gray-50/50 focus:ring-1 focus:ring-gray-800 focus:border-gray-800 shadow-sm"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                                    >
                                        <option value="" disabled>Select {formatLabel(fKey)}</option>
                                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            );
                            const renderDisplayHelper = (v) => (
                                <div className="w-full border border-gray-600 px-3 py-2 rounded-sm text-sm bg-white text-gray-800 min-h-[38px] flex items-center break-words">
                                    {v || <span className="text-gray-400 italic font-normal">Not provided</span>}
                                </div>
                            );

                            if (key === 'employeeId') {
                                return (
                                    <div key={key} className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">{formatLabel('employeeId')}</label>
                                            {isEditing ? renderInputHelper('employment', 'employeeId', formData.employment.employeeId, 'text') : renderDisplayHelper(formData.employment.employeeId)}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">{formatLabel('department')}</label>
                                            {isEditing ? renderInputHelper('employment', 'department', formData.employment.department, 'text') : renderDisplayHelper(formData.employment.department)}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">{formatLabel('employmentType')}</label>
                                            {isEditing ? renderSelectHelper('employment', 'employmentType', formData.employment.employmentType, ['Full-Time', 'Part-Time', 'Contract', 'Intern']) : renderDisplayHelper(formData.employment.employmentType)}
                                        </div>
                                    </div>
                                );
                            }

                            if (key === 'designation') {
                                return (
                                    <div key={key} className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">{formatLabel('designation')}</label>
                                            {isEditing ? renderInputHelper('employment', 'designation', formData.employment.designation, 'text') : renderDisplayHelper(formData.employment.designation)}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">{formatLabel('reportingManager')}</label>
                                            {isEditing ? renderInputHelper('employment', 'reportingManager', formData.employment.reportingManager, 'text') : renderDisplayHelper(formData.employment.reportingManager)}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">{formatLabel('dateOfJoining')}</label>
                                            {isEditing ? renderInputHelper('employment', 'dateOfJoining', formData.employment.dateOfJoining, 'date') : renderDisplayHelper(formData.employment.dateOfJoining)}
                                        </div>
                                    </div>
                                );
                            }
                        }

                        if (key === 'currentAddress' || key === 'permanentAddress') {
                            const addressTypeDisplay = key === 'currentAddress' ? 'Current Address' : 'Permanent Address';
                            const isPermanent = key === 'permanentAddress';
                            const disabledPermanent = isPermanent && formData.contact.sameAsCurrentAddress && isEditing;

                            return (
                                <div key={key} className="col-span-1 md:col-span-2 space-y-4 bg-gray-50/50 p-6 rounded-xl border border-gray-200 mb-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                        <h4 className="text-base font-bold text-[#5A725A] flex items-center gap-2">
                                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {addressTypeDisplay}
                                        </h4>
                                        {isPermanent && isEditing && (
                                            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors w-max">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#5A725A] rounded border-gray-300 focus:ring-[#5A725A]"
                                                    checked={formData.contact.sameAsCurrentAddress}
                                                    onChange={handleSameAsCurrent}
                                                />
                                                Same as Current Address
                                            </label>
                                        )}
                                        {isPermanent && !isEditing && formData.contact.sameAsCurrentAddress && (
                                            <span className="text-xs font-semibold bg-[#5A725A]/10 text-[#5A725A] px-3 py-1.5 rounded-lg border border-[#5A725A]/20 w-max">Same as Current</span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {['doorNo', 'street', 'area', 'city', 'state', 'pincode', 'country'].map(subField => {
                                            const subLabel = subField.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
                                            return (
                                                <div key={subField}>
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1">{subLabel}</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={value[subField] || ''}
                                                            onChange={(e) => handleAddressChange(key, subField, e.target.value)}
                                                            disabled={disabledPermanent}
                                                            placeholder={`Enter ${subLabel}`}
                                                            className={`w-full border px-3 py-2 rounded-sm text-sm outline-none transition-all placeholder:text-gray-400 ${disabledPermanent ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' : 'border-gray-600 bg-white text-gray-800 focus:ring-1 focus:ring-gray-800 focus:border-gray-800 shadow-sm'}`}
                                                        />
                                                    ) : (
                                                        <div className="w-full border border-gray-600 px-3 py-2 rounded-sm text-sm bg-white text-gray-800 min-h-[38px] flex items-center break-words">
                                                            {value[subField] || <span className="text-gray-400 italic font-normal text-xs">N/A</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }

                        if (key === 'qualifications') {
                            const qualifications = value;
                            return (
                                <div key={key} className="col-span-1 md:col-span-2 space-y-6">
                                    <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">
                                        Qualifications List
                                    </label>
                                    {qualifications.map((qual, idx) => (
                                        <div key={idx} className="bg-gray-50/50 p-6 rounded-xl border border-gray-200 relative mb-4">
                                            {isEditing && qualifications.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleChange(sectionKey, key, qualifications.filter((_, i) => i !== idx))}
                                                    className="absolute top-4 right-4 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors z-10"
                                                    title="Remove Qualification"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {Object.entries(qual).map(([qKey, qVal]) => {
                                                    let displayLabel = qKey.replace(/([A-Z])/g, ' $1').trim();
                                                    displayLabel = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1);
                                                    if (qKey === 'percentageCgpa') displayLabel = 'Percentage / CGPA';
                                                    if (qKey === 'universityCollege') displayLabel = 'University / College';

                                                    return (
                                                        <div key={qKey} className={qKey === 'certifications' ? 'col-span-1 md:col-span-2' : ''}>
                                                            <label className="block text-sm font-semibold text-gray-600 mb-1">
                                                                {displayLabel}
                                                            </label>
                                                            {isEditing ? (
                                                                qKey === 'yearOfPassing' ? (
                                                                    <div className="relative">
                                                                        <select
                                                                            value={qVal}
                                                                            onChange={(e) => {
                                                                                const newVal = [...qualifications];
                                                                                newVal[idx] = { ...newVal[idx], [qKey]: e.target.value };
                                                                                handleChange(sectionKey, key, newVal);
                                                                            }}
                                                                            className="w-full border border-gray-600 px-3 py-2 rounded-sm text-sm outline-none transition-all appearance-none cursor-pointer bg-white text-gray-800 focus:ring-1 focus:ring-gray-800 focus:border-gray-800 shadow-sm"
                                                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                                                                        >
                                                                            <option value="" disabled>Select Year</option>
                                                                            {Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                                                                <option key={year} value={year}>{year}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                ) : (
                                                                    <input
                                                                        type="text"
                                                                        value={qVal}
                                                                        onChange={(e) => {
                                                                            const newVal = [...qualifications];
                                                                            newVal[idx] = { ...newVal[idx], [qKey]: e.target.value };
                                                                            handleChange(sectionKey, key, newVal);
                                                                        }}
                                                                        placeholder={`Enter ${displayLabel}`}
                                                                        className="w-full border border-gray-600 px-3 py-2 rounded-sm text-sm outline-none transition-all placeholder:text-gray-400 bg-white text-gray-800 focus:ring-1 focus:ring-gray-800 focus:border-gray-800 shadow-sm"
                                                                    />
                                                                )
                                                            ) : (
                                                                <div className="w-full border border-gray-600 px-3 py-2 rounded-sm text-sm bg-white text-gray-800 flex items-center break-words min-h-[38px]">
                                                                    {qVal || <span className="text-gray-400 italic font-normal">Not provided</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => handleChange(sectionKey, key, [...qualifications, {
                                                Qualification: "",
                                                degreeName: "",
                                                universityCollege: "",
                                                yearOfPassing: "",
                                                percentageCgpa: "",
                                                certifications: ""
                                            }])}
                                            className="text-sm text-[#5A725A] font-semibold flex items-center justify-center gap-1.5 hover:text-[#4a5f4a] transition-colors bg-[#5A725A]/10 px-4 py-3 rounded-xl w-full border border-[#5A725A]/20 border-dashed"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            Add Another Education
                                        </button>
                                    )}
                                </div>
                            )
                        }

                        if (key === 'employmentHistory') {
                            const employmentHistory = value;
                            return (
                                <div key={key} className="col-span-1 md:col-span-2 space-y-6">
                                    <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">
                                        Employment History List
                                    </label>
                                    {employmentHistory.map((emp, idx) => (
                                        <div key={idx} className="bg-gray-50/50 p-6 rounded-xl border border-gray-200 relative mb-4">
                                            {isEditing && employmentHistory.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleChange(sectionKey, key, employmentHistory.filter((_, i) => i !== idx))}
                                                    className="absolute top-4 right-4 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors z-10"
                                                    title="Remove Employment"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {Object.entries(emp).map(([eKey, eVal]) => {
                                                    let displayLabel = eKey.replace(/([A-Z])/g, ' $1').trim();
                                                    displayLabel = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1);
                                                    if (eKey === 'experienceYearsMonths') displayLabel = 'Experience (Years / Months)';

                                                    const isDateInput = eKey === 'dateOfJoining' || eKey === 'dateOfRelieving';

                                                    return (
                                                        <div key={eKey} className={eKey === 'reasonForLeaving' ? 'col-span-1 md:col-span-2' : ''}>
                                                            <label className="block text-sm font-semibold text-gray-600 mb-1">
                                                                {displayLabel}
                                                            </label>
                                                            {isEditing ? (
                                                                <input
                                                                    type={isDateInput ? 'date' : (eKey === 'lastDrawnSalary' ? 'number' : 'text')}
                                                                    value={eVal}
                                                                    onChange={(e) => {
                                                                        const newVal = [...employmentHistory];
                                                                        newVal[idx] = { ...newVal[idx], [eKey]: e.target.value };
                                                                        handleChange(sectionKey, key, newVal);
                                                                    }}
                                                                    placeholder={`Enter ${displayLabel}`}
                                                                    className="w-full border border-gray-600 px-3 py-2 rounded-sm text-sm outline-none transition-all placeholder:text-gray-400 bg-white text-gray-800 focus:ring-1 focus:ring-gray-800 focus:border-gray-800 shadow-sm"
                                                                />
                                                            ) : (
                                                                <div className="w-full border border-gray-600 px-3 py-2 rounded-sm text-sm bg-white text-gray-800 flex items-center break-words min-h-[38px]">
                                                                    {eVal || <span className="text-gray-400 italic font-normal">Not provided</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    {isEditing && (
                                        <button
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
                                            className="text-sm text-[#5A725A] font-semibold flex items-center justify-center gap-1.5 hover:text-[#4a5f4a] transition-colors bg-[#5A725A]/10 px-4 py-3 rounded-xl w-full border border-[#5A725A]/20 border-dashed"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            Add Another Employment
                                        </button>
                                    )}
                                </div>
                            )
                        }

                        return (
                            <div key={key} className={isArray ? "col-span-1 md:col-span-2" : ""}>
                                <label className="block text-sm font-semibold text-gray-600 capitalize mb-2">
                                    {formatLabel(key)}
                                </label>

                                {isEditing ? (
                                    isArray ? (
                                        <div className="space-y-3">
                                            {value.map((v, idx) => (
                                                <div key={idx} className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        value={v}
                                                        onChange={(e) => {
                                                            const newArr = [...value]
                                                            newArr[idx] = e.target.value
                                                            handleChange(sectionKey, key, newArr)
                                                        }}
                                                        placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`}
                                                        className="flex-1 w-full border border-gray-600 px-3 py-2 rounded-sm text-sm outline-none transition-all placeholder:text-gray-400 focus:ring-1 focus:ring-gray-800 focus:border-gray-800 bg-white text-gray-800 shadow-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newArr = value.filter((_, i) => i !== idx)
                                                            handleChange(sectionKey, key, newArr)
                                                        }}
                                                        className="bg-red-50 text-red-500 px-4 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center font-bold"
                                                        title="Remove"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => handleChange(sectionKey, key, [...value, ""])}
                                                className="text-sm text-[#5A725A] font-semibold flex items-center gap-1.5 mt-2 hover:text-[#4a5f4a] transition-colors bg-[#5A725A]/10 px-4 py-2.5 rounded-xl w-max"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                                Add Another {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </button>
                                        </div>
                                    ) : isCert ? (
                                        <div className="w-full">
                                            <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors w-full justify-center shadow-sm">
                                                <svg className="w-5 h-5 text-[#5A725A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                <span className="font-semibold">{value ? "Update Certification File" : "Upload Certification"}</span>
                                                <input
                                                    type="file"
                                                    accept="application/pdf,image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0]
                                                        if (file) handleChange(sectionKey, key, file)
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                            {value && (
                                                <div className="mt-2 text-sm text-gray-600 flex items-center gap-2 bg-[#5A725A]/5 px-3 py-2 rounded-lg break-all">
                                                    <svg className="w-4 h-4 text-[#5A725A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                    {value.name || "Uploaded Document"}
                                                </div>
                                            )}
                                        </div>
                                    ) : (

                                        (key === 'gender' || key === 'maritalStatus' || key === 'nationality' || key === 'employmentType') ? (
                                            <div className="relative">
                                                <select
                                                    value={value}
                                                    onChange={(e) => handleChange(sectionKey, key, e.target.value)}
                                                    className="w-full border border-gray-600 px-3 py-2 rounded-sm text-sm outline-none transition-all appearance-none cursor-pointer bg-white text-gray-800 hover:bg-gray-50/50 focus:ring-1 focus:ring-gray-800 focus:border-gray-800 shadow-sm"
                                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
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
                                                </select>
                                            </div>
                                        ) : (
                                            <input
                                                type={(key === 'dob' || key === 'dateOfJoining' || key === 'confirmationDate') ? 'date' : 'text'}
                                                value={value}
                                                onChange={(e) => handleChange(sectionKey, key, e.target.value)}
                                                readOnly={key === 'employeeId' || key === 'age'}
                                                className={`w-full border px-3 py-2 rounded-sm text-sm outline-none transition-all placeholder:text-gray-400 ${key === 'employeeId' || key === 'age' ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' : 'border-gray-600 bg-white text-gray-800 focus:ring-1 focus:ring-gray-800 focus:border-gray-800'}`}
                                            />
                                        )
                                    )
                                ) : (
                                    isArray ? (
                                        <div className="space-y-2">
                                            {value.length > 0 ? value.map((v, idx) => (
                                                <div key={idx} className="w-full border border-gray-600 px-3 py-2 rounded-sm text-sm bg-white text-gray-800 min-h-[38px] flex items-center break-words">
                                                    {v || <span className="text-gray-400 italic font-normal">Not provided</span>}
                                                </div>
                                            )) : (
                                                <div className="w-full border border-gray-600 px-3 py-2 rounded-sm text-sm bg-gray-50 text-gray-500 min-h-[38px] flex items-center break-words">
                                                    <span className="text-gray-400 italic font-normal">None</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : isCert ? (
                                        <div className="flex items-center justify-between group py-2">
                                            {value ? (
                                                <>
                                                    <span className="text-gray-800 font-medium text-sm flex items-center gap-2 truncate">
                                                        <svg className="w-5 h-5 text-[#5A725A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                        <span className="truncate max-w-[150px]">{value?.name || "Certification Document"}</span>
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            if (value instanceof File) {
                                                                const url = URL.createObjectURL(value)
                                                                window.open(url, '_blank')
                                                            } else {
                                                                alert("View functionality requires a real file backend or URL.")
                                                            }
                                                        }}
                                                        className="bg-white border border-gray-200 text-[#5A725A] hover:bg-[#5A725A] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                                    >
                                                        View
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-gray-400 italic font-normal text-sm py-2">No certification uploaded</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full border border-gray-600 px-3 py-2 rounded-sm text-sm bg-white text-gray-800 min-h-[38px] flex items-center break-words">
                                            {value || <span className="text-gray-400 italic font-normal">Not provided</span>}
                                        </div>
                                    )
                                )}
                            </div>
                        );
                    })}
            </div>
        </div>
    )


    const getCompletionStats = () => {
        let totalFields = 0;
        let filledFields = 0;

        if (employee) {
            const sectionsToCount = ['personal', 'contact', 'employment', 'education', 'previousEmployment', 'compensation'];

            sectionsToCount.forEach(section => {
                if (employee[section]) {
                    Object.entries(employee[section]).forEach(([key, val]) => {
                        // Skip checking auto-generated or array root fields directly if complex
                        if (key === 'employeeId' || key === 'age' || key === 'sameAsCurrentAddress') return;

                        if (key === 'currentAddress' || key === 'permanentAddress') {
                            Object.entries(val).forEach(([subKey, subVal]) => {
                                totalFields++;
                                if (subVal && subVal.toString().trim() !== '') filledFields++;
                            });
                            return;
                        }

                        if (Array.isArray(val)) {
                            // Quick check for array content
                            val.forEach(item => {
                                if (typeof item === 'object') {
                                    Object.entries(item).forEach(([subKey, subVal]) => {
                                        if (subKey === 'certifications') return; // skip certs for base calculation
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
        <div className="w-full space-y-8 pb-10 px-4 md:px-0">

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#5A725A]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="flex items-center gap-6 relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-[#5A725A] to-[#4a5f4a] text-white flex items-center justify-center rounded-3xl shadow-lg font-bold text-6xl overflow-hidden shrink-0">
                        {employee?.documents?.["Passport Size Photos"]?.previewUrl ? (
                            <img src={employee.documents["Passport Size Photos"].previewUrl} alt={`${employee.name} Photo`} className="w-full h-full object-cover" />
                        ) : (
                            employee.name ? employee.name.charAt(0) : "E"
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-bold text-gray-800">{employee.name}</h2>

                            {/* Completion Circle */}
                            <div className="relative flex items-center justify-center group" title={`${percentage}% Profile Completed`}>
                                <svg className="w-12 h-12 transform -rotate-90">
                                    <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="transparent"
                                        className="text-gray-200"
                                    />
                                    <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="transparent"
                                        strokeDasharray={`${2 * Math.PI * 20}`}
                                        strokeDashoffset={`${2 * Math.PI * 20 - (percentage / 100) * (2 * Math.PI * 20)}`}
                                        className={`${percentage === 100 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-in-out`}
                                    />
                                </svg>
                                <span className="absolute text-[11px] font-bold text-gray-700">{percentage}%</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-gray-500 font-medium">
                            <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-mono border border-gray-200">{employee.empId}</span>
                            <span className="flex items-center gap-1.5 text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#5A725A]"></span>
                                {employee.department} Department
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 relative z-10 w-full md:w-auto">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => {
                                    setFormData(employee)
                                    setIsEditing(false)
                                }}
                                className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-sm w-full md:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-[#5A725A] text-white px-8 py-2.5 rounded-xl hover:bg-[#4a5f4a] transition-colors font-bold shadow-md hover:shadow-lg w-full md:w-auto flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate(-1)}
                                className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-sm w-full md:w-auto flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Directory
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-[#5A725A] text-white px-8 py-2.5 rounded-xl hover:bg-[#4a5f4a] transition-colors font-bold shadow-md hover:shadow-lg w-full md:w-auto flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                Edit Profile
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Main Content Area */}
                <div className="flex-1 w-full">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="space-y-8">
                            {activeFilters.personal?._show && (
                                renderSectionCard(
                                    "Personal Details",
                                    "personal",
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                )
                            )}
                            {activeFilters.contact?._show && (
                                renderSectionCard(
                                    "Contact Information",
                                    "contact",
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                )
                            )}
                            {activeFilters.compensation?._show && (
                                renderSectionCard(
                                    "Compensation & Benefits",
                                    "compensation",
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                )
                            )}
                        </div>
                        <div className="space-y-8">
                            {activeFilters.employment?._show && (
                                renderSectionCard(
                                    "Employment Information",
                                    "employment",
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                )
                            )}
                            {activeFilters.education?._show && (
                                renderSectionCard(
                                    "Educational Qualifications",
                                    "education",
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                                )
                            )}
                            {activeFilters.previousEmployment?._show && (
                                renderSectionCard(
                                    "Previous Employment Details",
                                    "previousEmployment",
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                )
                            )}

                            {/* Special Custom Render for Payroll */}
                            {activeFilters.payroll?._show && employee?.payroll?.totals && !isEditing && (
                                <div className="bg-white rounded-2xl shadow-sm border border-[#5A725A]/20 overflow-hidden relative group transition-all duration-300 hover:shadow-md">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#5A725A]/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                                    <div className="border-b border-gray-100 bg-[#5A725A]/5 px-6 py-4 flex justify-between items-center relative z-10">
                                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#5A725A]/20 text-[#5A725A] flex items-center justify-center shadow-sm">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
                                            </div>
                                            Assigned Salary Structure
                                        </h3>
                                        <button onClick={() => navigate('/hr/payroll')} className="text-sm font-bold text-[#5A725A] hover:text-[#4a5f4a] bg-white px-3 py-1 rounded shadow-sm border border-gray-100">Configure</button>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl">
                                                <p className="text-xs font-bold text-gray-500 uppercase">Monthly Gross</p>
                                                <p className="text-xl font-black text-[#5A725A]">
                                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(employee.payroll.totals.grossSalary)}
                                                </p>
                                            </div>
                                            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                                                <p className="text-xs font-bold text-gray-500 uppercase">Net Take-Home</p>
                                                <p className="text-xl font-black text-emerald-600">
                                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(employee.payroll.totals.netTakeHome)}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl col-span-2 flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase">Annual Target CTC</p>
                                                    <p className="text-2xl font-black text-gray-800">
                                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(employee.payroll.totals.totalCTC)}
                                                    </p>
                                                </div>
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-[#5A725A]">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeFilters.payroll?._show && (!employee?.payroll?.totals || isEditing) && (
                                renderSectionCard(
                                    "Payroll Status",
                                    "payroll",
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmployeeProfile
