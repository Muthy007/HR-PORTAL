import { useState, useEffect, useMemo, useCallback } from "react"
import { 
  Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TextField, InputAdornment 
} from "@mui/material";
import { API_BASE_URL } from "../../assets/connection";
import { 
  People as PeopleIcon, 
  AccountBalanceWallet as AccountBalanceWalletIcon, 
  MoneyOff as MoneyOffIcon, 
  Savings as SavingsIcon, 
  Search as SearchIcon, 
  BusinessCenter as BusinessCenterIcon 
} from "@mui/icons-material";


// --- FIELD DEFINITIONS ---
const EARNINGS_FIELDS = [
  { key: 'basicSalary', label: 'Basic Salary', isCommon: true, headId: 1 },
  { key: 'hra', label: 'House Rent Allowance (HRA)', isCommon: false, headId: 2 },
  { key: 'da', label: 'Dearness Allowance (DA)', isCommon: false, headId: 3 },
  { key: 'specialAllowance', label: 'Special Allowance', isCommon: true, headId: 4 },
  { key: 'conveyance', label: 'Conveyance Allowance', isCommon: false, headId: 5 },
  { key: 'medical', label: 'Medical Allowance', isCommon: false, headId: 6 },
  { key: 'lta', label: 'Leave Travel Allowance (LTA)', isCommon: false, headId: 7 },
  { key: 'foodAllowance', label: 'Food / Sodexo', isCommon: false, headId: 8 },
  { key: 'telephone', label: 'Telephone / Internet', isCommon: false, headId: 9 },
  { key: 'uniform', label: 'Uniform Allowance', isCommon: false, headId: 10 },
  { key: 'books', label: 'Books & Periodicals', isCommon: false, headId: 11 },
  { key: 'driver', label: 'Driver Salary Allowance', isCommon: false, headId: 12 },
  { key: 'car', label: 'Car/Fuel Allowance', isCommon: false, headId: 13 },
];

const DEDUCTIONS_FIELDS = [
  { key: 'employeePf', label: 'Employee PF', isCommon: false, headId: 14 },
  { key: 'employeeEsi', label: 'Employee ESI', isCommon: false, headId: 15 },
  { key: 'professionalTax', label: 'Professional Tax', isCommon: false, headId: 16 },
  { key: 'incomeTax', label: 'Income Tax (TDS)', isCommon: false, headId: 17 },
  { key: 'lwf', label: 'Labour Welfare Fund', isCommon: false, headId: 18 },
];

const EMPLOYER_CONT_FIELDS = [
  { key: 'employerPf', label: 'Employer PF', isCommon: false, headId: 19 },
  { key: 'gratuity', label: 'Gratuity', isCommon: false, headId: 20 },
  { key: 'employerEsi', label: 'Employer ESI', isCommon: false, headId: 21 },
  { key: 'superannuation', label: 'Superannuation', isCommon: false, headId: 22 },
  { key: 'nps', label: 'NPS Contribution', isCommon: false, headId: 23 },
  { key: 'insurance', label: 'Group Insurance Premium', isCommon: false, headId: 24 },
];

function Payroll() {
  const [viewMode, setViewMode] = useState("overview")
  const [activeTab, setActiveTab] = useState("structure")

  const [searchQuery, setSearchQuery] = useState("")

  const [employees, setEmployees] = useState({})
  const [selectedEmpId, setSelectedEmpId] = useState("")

  const allOptionalFieldKeys = useMemo(() => [
    ...EARNINGS_FIELDS.filter(f => !f.isCommon),
    ...DEDUCTIONS_FIELDS.filter(f => !f.isCommon),
    ...EMPLOYER_CONT_FIELDS.filter(f => !f.isCommon)
  ].map(f => f.key), []);

  const [addedOptionalFields, setAddedOptionalFields] = useState([]);

  const [elements, setElements] = useState([]);
  const [heads, setHeads] = useState([]);
  const [payrollSummaries, setPayrollSummaries] = useState({});
  const [companyStats, setCompanyStats] = useState({
    monthlyGross: 0,
    totalDeductions: 0,
    netTakeHome: 0,
    totalAnnualCtc: 0
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/EmployeeMaster`);
        if (response.ok) {
          const data = await response.json();
          const empsObj = {};
          data.forEach(emp => {
            empsObj[emp.employeeCode] = {
              id: emp.empId,
              empId: emp.employeeCode,
              name: emp.fullName,
              department: emp.department,
              designation: emp.designation,
              email: emp.emailId,
              doj: emp.dateOfJoining,
              employmentType: emp.employmentType
            };
          });
          setEmployees(empsObj);
        }
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };

    fetchEmployees();

    const fetchPayrollConfig = async () => {
      try {
        const [headsRes, elementsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/EmployeeMaster/heads`),
          fetch(`${API_BASE_URL}/api/EmployeeMaster/elements`)
        ]);
        if (headsRes.ok) {
          const data = await headsRes.json();
          setHeads(data);
        }
        if (elementsRes.ok) {
          const data = await elementsRes.json();
          setElements(data);
        }
      } catch (err) {
        console.error("Failed to fetch payroll config:", err);
      }
    };
    fetchPayrollConfig();
  }, [])

  const initialEarnings = {
    basicSalary: 0,
    hra: 0,
    da: 0,
    specialAllowance: 0,
    conveyance: 0,
    medical: 0,
    lta: 0,
    foodAllowance: 0,
    telephone: 0,
    uniform: 0,
    books: 0,
    driver: 0,
    car: 0
  };

  const initialDeductions = {
    employeePf: 0,
    employeeEsi: 0,
    professionalTax: 0,
    incomeTax: 0,
    lwf: 0
  };

  const initialEmployerCont = {
    employerPf: 0,
    gratuity: 0,
    employerEsi: 0,
    superannuation: 0,
    nps: 0,
    insurance: 0
  };

  const [targetCTC, setTargetCTC] = useState("")

  const [earnings, setEarnings] = useState(initialEarnings)
  const [deductions, setDeductions] = useState(initialDeductions)
  const [employerCont, setEmployerCont] = useState(initialEmployerCont)


  const [totals, setTotals] = useState({
    grossSalary: 0,
    totalDeductions: 0,
    netTakeHome: 0,
    totalCTC: 0
  })


  const calculateStructure = useCallback((ctc, currentOptionals = addedOptionalFields) => {
    if (!elements || elements.length === 0) return;

    const getElementValue = (headId) => {
      const el = elements.find(e => (e.headId || e.head_id) === headId);
      if (!el) return null;

      const type = el.valueType || el.value_type;
      const calculating = el.valueCalculating || el.value_calculating;
      const val = Number(el.elementValue || el.element_value);

      return { type, val, calculating };
    };

    const targetMonthlyCtc = ctc / 12;

    // 1. Calculate Basic Salary (Head ID: 1)
    const basicConfig = getElementValue(1);
    const basicPercent = basicConfig && basicConfig.type === 'Percentage' ? basicConfig.val / 100 : 0.40;
    const rawBasic = Math.round(basicPercent * targetMonthlyCtc);

    /**
     * calcComponent helper
     * Priority for base selection:
     * 1. If el.calculating is 'Gross Salary', use baseGross.
     * 2. If 'Annual CTC', use baseCTC.
     * 3. Otherwise (including 'Basic Salary' or undefined), use baseBasic.
     */
    const calcComponent = (headId, isChecked, fallbackVal, baseBasic, baseGross, baseCTC) => {
      if (!isChecked && headId !== 1) return 0; 
      const el = getElementValue(headId);
      if (!el) return fallbackVal;
      if (el.type === 'Fixed') return el.val;
      if (el.type === 'Percentage') {
        const calculating = el.calculating || '';
        let base = baseBasic; 
        if (calculating === 'Gross Salary') base = baseGross;
        else if (calculating === 'Annual CTC') base = baseCTC;
        
        return (el.val / 100) * base;
      }
      return 0;
    };

    // 2. Identify fixed and Basic-based Employer Contributions (Preliminary)
    // We calculate these early to solve for Gross.
    const erPf = currentOptionals.includes('employerPf') ? calcComponent(19, true, 0, rawBasic, 0, targetMonthlyCtc) : 0;
    const gratuity = currentOptionals.includes('gratuity') ? calcComponent(20, true, 0, rawBasic, 0, targetMonthlyCtc) : 0;
    const superann = currentOptionals.includes('superannuation') ? calcComponent(22, true, 0, rawBasic, 0, targetMonthlyCtc) : 0;
    const nps = currentOptionals.includes('nps') ? calcComponent(23, true, 0, rawBasic, 0, targetMonthlyCtc) : 0;
    const insurance = currentOptionals.includes('insurance') ? calcComponent(24, true, 0, rawBasic, 0, targetMonthlyCtc) : 0;

    const fixedERConts = erPf + gratuity + superann + nps + insurance;

    // 3. Solve for Gross (G)
    // CTC = G + ER_ESI(G) + fixedERConts.
    const esiConfig = getElementValue(21);
    const erEsiRate = (esiConfig && esiConfig.type === 'Percentage' && currentOptionals.includes('employerEsi')) ? (esiConfig.val / 100) : 0;
    
    let remainingBudget = targetMonthlyCtc - fixedERConts;
    let finalGrossRaw = remainingBudget;
    let erEsi = 0;

    // Apply ESI only if field is active. The rate is already 0 if not active.
    if (erEsiRate > 0 && remainingBudget / (1 + erEsiRate) <= 21000) {
        finalGrossRaw = remainingBudget / (1 + erEsiRate);
        erEsi = finalGrossRaw * erEsiRate;
    }

    // 4. Populate Earnings
    const newEarnings = { ...initialEarnings };
    EARNINGS_FIELDS.forEach(field => {
        if (field.headId === 4) return;   
        const isChecked = field.isCommon || currentOptionals.includes(field.key);
        // Important: Basic (headId 1) should be set to rawBasic explicitly to honor the user's configuration
        if (field.headId === 1) {
            newEarnings[field.key] = rawBasic;
        } else {
            newEarnings[field.key] = Math.round(calcComponent(field.headId, isChecked, 0, rawBasic, finalGrossRaw, targetMonthlyCtc));
        }
    });

    // 5. Special Allowance (Balancer) takes EVERY remaining penny to reach 100% CTC
    const currentEarningsSum = Object.keys(newEarnings).reduce((acc, key) => key === 'specialAllowance' ? acc : acc + newEarnings[key], 0);
    newEarnings.specialAllowance = Math.max(0, Math.round(finalGrossRaw - currentEarningsSum));

    setEarnings(newEarnings);

    // 6. Deductions
    const newDeductions = { ...initialDeductions };
    DEDUCTIONS_FIELDS.forEach(field => {
        const isChecked = field.isCommon || currentOptionals.includes(field.key);
        if (field.headId === 15 && finalGrossRaw > 21000) {
            newDeductions[field.key] = 0;
        } else {
            newDeductions[field.key] = Math.round(calcComponent(field.headId, isChecked, 0, rawBasic, finalGrossRaw, targetMonthlyCtc));
        }
    });
    setDeductions(newDeductions);

    // 7. Finalize Employer Contributions in State
    setEmployerCont({
      employerPf: Math.round(erPf),
      gratuity: Math.round(gratuity),
      employerEsi: Math.round(erEsi),
      superannuation: Math.round(superann),
      nps: Math.round(nps),
      insurance: Math.round(insurance)
    });
  }, [elements, addedOptionalFields]);



  useEffect(() => {
    const gross = Object.values(earnings).reduce((acc, val) => acc + (Number(val) || 0), 0);
    const totalDed = Object.values(deductions).reduce((acc, val) => acc + (Number(val) || 0), 0);
    const totalErCont = Object.values(employerCont).reduce((acc, val) => acc + (Number(val) || 0), 0);

    setTotals({
      grossSalary: gross,
      totalDeductions: totalDed,
      netTakeHome: gross - totalDed,
      totalCTC: (gross + totalErCont) * 12 
    });
  }, [earnings, deductions, employerCont])

  const handleEarningsChange = (field, value) => {
    setEarnings(prev => ({ ...prev, [field]: Number(String(value).replace(/[^0-9.]/g, '')) || 0 }))
  }

  const handleDeductionsChange = (field, value) => {
    setDeductions(prev => ({ ...prev, [field]: Number(String(value).replace(/[^0-9.]/g, '')) || 0 }))
  }

  const handleEmployerContChange = (field, value) => {
    setEmployerCont(prev => ({ ...prev, [field]: Number(String(value).replace(/[^0-9.]/g, '')) || 0 }))
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setSelectedEmpId(empId);

    if (empId) {
     
      fetchEmployeePayroll(empId);

   
      const summary = payrollSummaries[empId];
      if (summary && summary.annualCtc) {
        setTargetCTC(summary.annualCtc);
      }
    }
  }

  const toggleOptionalField = (key) => {
    let newOptionals;
    if (addedOptionalFields.includes(key)) {
      newOptionals = addedOptionalFields.filter(k => k !== key);
    } else {
      newOptionals = [...addedOptionalFields, key];
    }
    setAddedOptionalFields(newOptionals);

    if (targetCTC > 0) {
      calculateStructure(targetCTC, newOptionals);
    }
  }

  const handleSaveStructure = async () => {
    if (!selectedEmpId) {
      alert("Please select an employee first!");
      return;
    }

    const payload = {
      payrollMonth: new Date().getMonth() + 1,
      financialYear: "2025-2026",
      elements: []
    };

    const addElements = (fieldsList, valuesObj, typeStr) => {
      fieldsList.forEach(f => {
        if (f.headId && (valuesObj[f.key] > 0 || (f.isCommon || addedOptionalFields.includes(f.key)))) {
          payload.elements.push({
            headId: f.headId,
            amount: Number(valuesObj[f.key]) || 0,
            valueType: typeStr,
            valueCalculating: "Fixed"
          });
        }
      });
    };

    addElements(EARNINGS_FIELDS, earnings, "1");
    addElements(DEDUCTIONS_FIELDS, deductions, "2");

    try {
      const requests = payload.elements.filter(el => el.amount > 0).map(async el => {
        const singlePayload = {
          empId: parseInt(selectedEmpId.replace(/\D/g, '')),
          elementId: el.headId,
          payrollMonth: payload.payrollMonth,
          financialYear: payload.financialYear,
          amount: el.amount
        };

        const response = await fetch(`${API_BASE_URL}/api/EmployeeMaster/add-payroll`, {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(singlePayload)
        });

        if (!response.ok) {
          console.warn(`Failed to save element ${el.headId} for employee ${selectedEmpId}`);
        }
      });

      await Promise.all(requests);

  
      const numericEmpId = parseInt(selectedEmpId.replace(/\D/g, ''));
      const summaryPayload = {
        empId: numericEmpId,
        payrollMonth: payload.payrollMonth, 
        financialYear: payload.financialYear,
        monthlyGross: totals.grossSalary,
        totalDeductions: totals.totalDeductions,
        netTakeHome: totals.netTakeHome,
        annualCtc: targetCTC 
      };

      const summaryResponse = await fetch(`${API_BASE_URL}/api/EmployeeMaster/generate-summary`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(summaryPayload)
      });

      if (summaryResponse.ok) {
        const result = await summaryResponse.json();
        const newSummary = result.summary || result;

        setPayrollSummaries(prev => ({
          ...prev,
          [selectedEmpId]: newSummary
        }));
        setRefreshTrigger(prev => prev + 1);
      } else {
        console.warn(`Failed to generate payroll summary for employee ${selectedEmpId}`);
      }

    } catch (err) {
      console.error("Network error while saving payroll to backend:", err);
    }

    alert(`Payroll Structure saved successfully for ${employees[selectedEmpId]?.name || selectedEmpId}!`);
  }

  const fetchEmployeePayroll = async (empId) => {
    const numericEmpId = parseInt(empId.replace(/\D/g, ''));
    if (isNaN(numericEmpId)) return;

    try {
      const month = new Date().getMonth() + 1;
      const year = "2025-2026"; 
      const res = await fetch(`${API_BASE_URL}/api/EmployeeMaster/payroll-overview?empId=${numericEmpId}&month=${month}&financialYear=${year}`);

      if (res.ok) {
        const data = await res.json();

        const newEarnings = { ...initialEarnings };
        const newDeductions = { ...initialDeductions };
        const newEmployerCont = { ...initialEmployerCont };
        const optionalKeys = [];

        // Mapping logic for the structured response
        const mapToState = (apiList, stateObj, fieldArray) => {
          apiList.forEach(item => {
            const apiName = (item.headName || "").trim().toLowerCase();

            // 1. Try match by headId (most accurate)
            let field = fieldArray.find(f => f.headId === item.headId);

            // 2. Fallback to name matching (handles trailing spaces/missing IDs)
            if (!field) {
              field = fieldArray.find(f => f.label.trim().toLowerCase() === apiName);
            }

            if (field) {
              stateObj[field.key] = item.amount;
              if (!field.isCommon) optionalKeys.push(field.key);
            } else {
              console.warn(`[Payroll] Unmapped head from API: "${item.headName}"`, item);
            }
          });
        };

        if (data.earnings) mapToState(data.earnings, newEarnings, EARNINGS_FIELDS);
        if (data.deductions) mapToState(data.deductions, newDeductions, DEDUCTIONS_FIELDS);
        if (data.employerContributions) mapToState(data.employerContributions, newEmployerCont, EMPLOYER_CONT_FIELDS);

        setEarnings(newEarnings);
        setDeductions(newDeductions);
        setEmployerCont(newEmployerCont);
        setAddedOptionalFields(optionalKeys);
        
        // If we have a summary with annual CTC, handleEmployeeChange already set it.
        // If not, we could calculate it here from the loaded amounts as a fallback, 
        // but it's better to rely on the summary's annualCtc.
      }
    } catch (err) {
      console.error("Error fetching detailed payroll overview:", err);
    }
  };

  const handleViewDetails = (empId) => {
    setSelectedEmpId(empId);
    fetchEmployeePayroll(empId);
    setViewMode('view_details');
  };

  useEffect(() => {
    const fetchSummaries = async () => {
      const month = 3; 
      const year = "2025-2026";

      // 1. Fetch Company-wide Aggregate Totals
      try {
        const statsRes = await fetch(`${API_BASE_URL}/api/EmployeeMaster/company-payroll-overview?month=${month}&financialYear=${year}`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setCompanyStats(statsData);
        }
      } catch (err) {
        console.warn("Could not fetch company aggregate stats", err);
      }

      // 2. Fetch Individual Summaries for the Directory
      const summariesObj = {};
      const empIds = Object.keys(employees);
      const promises = empIds.map(async empId => {
        const numericEmpId = parseInt(empId.replace(/\D/g, ''));
        if (isNaN(numericEmpId)) return;
        try {
          // Changed to employee-payroll-history to fix 404 errors
          const res = await fetch(`${API_BASE_URL}/api/EmployeeMaster/employee-payroll-history/${numericEmpId}?month=${month}&financialYear=${year}`);
          if (res.ok) {
            const data = await res.json();
            if (data) summariesObj[empId] = data;
          }
        } catch (err) {
          console.warn(`Could not fetch history for ${empId}`, err);
        }
      });
      await Promise.all(promises);
      setPayrollSummaries(summariesObj);
    };

    if (Object.keys(employees).length > 0) {
      fetchSummaries();
    }
  }, [employees, refreshTrigger]);

  // Use database-driven Company Stats for Overview
  const companyTotals = useMemo(() => {
    return {
      gross: companyStats.monthlyGross,
      ded: companyStats.totalDeductions,
      net: companyStats.netTakeHome,
      ctc: companyStats.netTakeHome * 12 
    };
  }, [companyStats]);

  const getLabelWithPercent = (item) => {
    if (!item.headId && item.headId !== 0) return item.label;
    const el = elements.find(e => (e.headId || e.head_id) === item.headId);
    if (el && (el.valueType === 'Percentage' || el.value_type === 'Percentage')) {
      const val = el.elementValue || el.element_value;
      const base = el.valueCalculating || el.value_calculating;
      let baseText = base === 'Basic Salary' ? 'Basic' : (base === 'Gross Salary' ? 'Gross' : 'CTC');
      if (item.headId === 1) baseText = 'CTC'; 
      return `${item.label} (${val}% of ${baseText})`;
    }
    return item.label;
  };

  return (
    <Box sx={{ width: '100%', pb: 10, px: { xs: 2, md: 0 }, maxWidth: 'lg', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>

      {viewMode === 'overview' ? (
        <>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'grey.800', letterSpacing: '-0.025em' }}>
                Payroll Overview
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.500', fontWeight: 500, mt: 0.5 }}>
                Company-wide payroll metrics and employee directory.
              </Typography>
            </Box>
          </Box>

          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Paper elevation={0} sx={{ flex: 1, minWidth: 0, p: 3, borderRadius: 4, border: '1px solid', borderColor: 'grey.100', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', right: 0, top: 0, width: 96, height: 96, bgcolor: 'rgba(240, 253, 244, 0.5)', borderBottomLeftRadius: '100%', mr: -2, mt: -2, transition: 'transform 500ms', ...{ '&:hover': { transform: 'scale(1.1)' } } }} />
              <Typography sx={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.1em', color: 'rgba(90, 114, 90, 0.7)', textTransform: 'uppercase', position: 'relative', zIndex: 10, mb: 1 }}>
                Monthly Gross Salary
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'grey.800', position: 'relative', zIndex: 10 }}>
                {formatCurrency(companyTotals.gross)}
              </Typography>
            </Paper>
            
            <Paper elevation={0} sx={{ flex: 1, minWidth: 0, p: 3, borderRadius: 4, border: '1px solid', borderColor: 'grey.100', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', right: 0, top: 0, width: 96, height: 96, bgcolor: 'rgba(255, 241, 242, 0.5)', borderBottomLeftRadius: '100%', mr: -2, mt: -2, transition: 'transform 500ms', ...{ '&:hover': { transform: 'scale(1.1)' } } }} />
              <Typography sx={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.1em', color: 'rgba(244, 63, 94, 0.7)', textTransform: 'uppercase', position: 'relative', zIndex: 10, mb: 1 }}>
                Total Deductions
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'error.main', position: 'relative', zIndex: 10 }}>
                {formatCurrency(companyTotals.ded)}
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ flex: 1, minWidth: 0, p: 3, borderRadius: 4, border: '1px solid', borderColor: 'grey.100', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', right: 0, top: 0, width: 96, height: 96, bgcolor: 'rgba(236, 253, 245, 0.5)', borderBottomLeftRadius: '100%', mr: -2, mt: -2, transition: 'transform 500ms', ...{ '&:hover': { transform: 'scale(1.1)' } } }} />
              <Typography sx={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.1em', color: 'rgba(5, 150, 105, 0.7)', textTransform: 'uppercase', position: 'relative', zIndex: 10, mb: 1 }}>
                Net Take-Home
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#047857', position: 'relative', zIndex: 10 }}>
                {formatCurrency(companyTotals.net)}
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ flex: 1, minWidth: 0, p: 3, borderRadius: 4, border: '1px solid', borderColor: '#566c56', bgcolor: '#657d65', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', right: 0, top: 0, width: 96, height: 96, bgcolor: 'rgba(255, 255, 255, 0.1)', borderBottomLeftRadius: '100%', mr: -2, mt: -2, transition: 'transform 500ms', ...{ '&:hover': { transform: 'scale(1.1)' } } }} />
              <Typography sx={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', position: 'relative', zIndex: 10, mb: 1 }}>
                Total Annual Balance
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', position: 'relative', zIndex: 10 }}>
                {formatCurrency(companyTotals.ctc)}
              </Typography>
            </Paper>
          </Box>

          
          <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'grey.100', overflow: 'hidden', mt: 4 }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'grey.100', bgcolor: 'rgba(249, 250, 251, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: 'rgba(229, 231, 235, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'grey.600' }}>
                  <PeopleIcon fontSize="small" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.800', fontSize: '1.125rem' }}>
                  All Employees Directory
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                <TextField
                  placeholder="Search by name, ID or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  sx={{ width: { xs: '100%', sm: 256 }, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Chip
                  label={`${Object.values(employees).filter(emp => {
                    const id = emp.empId || emp.personal?.employeeId || '';
                    const name = emp.name || `${emp.personal?.firstName || ''} ${emp.personal?.lastName || ''}`;
                    const dept = emp.department || emp.employment?.department || '';
                    const q = searchQuery.toLowerCase();
                    return name.toLowerCase().includes(q) || id.toLowerCase().includes(q) || dept.toLowerCase().includes(q);
                  }).length} Members`}
                  size="small"
                  sx={{ fontWeight: 'bold', bgcolor: 'grey.200', color: 'grey.700', borderRadius: '16px' }}
                />
              </Box>
            </Box>

            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 1000 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'grey.100' }}>
                    <TableCell sx={{ color: 'grey.400', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', py: 2 }}>#</TableCell>
                    <TableCell sx={{ color: 'grey.400', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', py: 2 }}>Employee ID</TableCell>
                    <TableCell sx={{ color: 'grey.400', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', py: 2 }}>Name</TableCell>
                    <TableCell sx={{ color: 'grey.400', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', py: 2 }}>Department</TableCell>
                    <TableCell align="right" sx={{ color: 'grey.400', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', py: 2 }}>Monthly Gross</TableCell>
                    <TableCell align="right" sx={{ color: 'grey.400', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', py: 2 }}>Deductions</TableCell>
                    <TableCell align="right" sx={{ color: 'grey.400', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', py: 2 }}>Net Take-Home</TableCell>
                    <TableCell align="right" sx={{ color: 'grey.400', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', py: 2 }}>Annual Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ '& tr:last-of-type td': { border: 0 } }}>
                  {Object.values(employees).filter(emp => {
                    const id = emp.empId || emp.personal?.employeeId || '';
                    const name = emp.name || `${emp.personal?.firstName || ''} ${emp.personal?.lastName || ''}`;
                    const dept = emp.department || emp.employment?.department || '';
                    const q = searchQuery.toLowerCase();
                    return name.toLowerCase().includes(q) || id.toLowerCase().includes(q) || dept.toLowerCase().includes(q);
                  }).map((emp, index) => {
                    const empId = emp.empId || emp.personal?.employeeId || 'N/A';
                    const summary = payrollSummaries[empId] || {};
                    const hasSummary = Object.keys(summary).length > 0;
                    return (
                      <TableRow key={empId} hover sx={{ '&:hover': { bgcolor: 'rgba(249, 250, 251, 0.5)' }, transition: 'background-color 0.2s' }}>
                        <TableCell sx={{ color: 'grey.500', fontWeight: 500, fontSize: '0.875rem', py: 2 }}>{index + 1}</TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ bgcolor: 'grey.100', color: 'grey.700', fontSize: '0.75rem', fontWeight: 'bold', px: 1, py: 0.5, borderRadius: 1.5, display: 'inline-block' }}>
                            {empId}
                          </Box>
                        </TableCell>
                        <TableCell 
                          onClick={() => handleViewDetails(empId)}
                          sx={{ py: 2, color: '#5A725A', fontWeight: 'bold', fontSize: '0.875rem', cursor: 'pointer', '&:hover': { color: '#4a5f4a', textDecoration: 'underline' } }}
                        >
                          {emp.name || `${emp.personal?.firstName} ${emp.personal?.lastName}`}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: '0.75rem', fontWeight: 600, color: 'grey.600', bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', px: 1.5, py: 0.5, borderRadius: 4 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'grey.400' }} />
                            {emp.department || emp.employment?.department || 'N/A'}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2, fontSize: '0.875rem', fontWeight: 'bold', color: 'grey.700' }}>
                          {hasSummary ? formatCurrency(summary.monthlyGross) : ''}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2, fontSize: '0.875rem', fontWeight: 'bold', color: 'error.main' }}>
                          {hasSummary ? formatCurrency(summary.totalDeductions) : ''}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2, fontSize: '0.875rem', fontWeight: 'bold', color: '#047857' }}>
                          {hasSummary ? formatCurrency(summary.netTakeHome) : ''}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2, fontSize: '0.875rem', fontWeight: 'bold', color: 'grey.800' }}>
                          {hasSummary ? formatCurrency(summary.netTakeHome * 12) : ''}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {Object.keys(employees).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'grey.500', fontSize: '0.875rem' }}>
                        No employees found. Please register employees first.
                      </TableCell>
                    </TableRow>
                  ) : Object.values(employees).filter(emp => {
                    const id = emp.empId || emp.personal?.employeeId || '';
                    const name = emp.name || `${emp.personal?.firstName || ''} ${emp.personal?.lastName || ''}`;
                    const dept = emp.department || emp.employment?.department || '';
                    const q = searchQuery.toLowerCase();
                    return name.toLowerCase().includes(q) || id.toLowerCase().includes(q) || dept.toLowerCase().includes(q);
                  }).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'grey.500', fontSize: '0.875rem' }}>
                        No matching employees found for your search.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      ) : viewMode === 'view_details' ? (
        <>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box
              component="button"
              onClick={() => setViewMode('overview')}
              sx={{ color: 'grey.500', '&:hover': { color: 'grey.800' }, fontWeight: 'bold', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1, transition: 'color 0.2s', bgcolor: 'transparent', border: 'none', cursor: 'pointer', p: 0 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Directory
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component="button"
                onClick={() => setViewMode(viewMode === 'view_details' ? 'view_details_manage' : 'view_details')}
                disabled={!selectedEmpId}
                sx={{
                  fontWeight: 'bold', py: 1.25, px: 2.5, borderRadius: 3, transition: 'all 0.2s', boxShadow: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem', flexShrink: 0, border: 'none', cursor: selectedEmpId ? 'pointer' : 'not-allowed', opacity: selectedEmpId ? 1 : 0.5,
                  ...(viewMode === 'view_details_manage' ? { bgcolor: '#fef3c7', color: '#b45309', '&:hover': { bgcolor: '#fde68a' } } : { bgcolor: '#5A725A', color: 'white', '&:hover': { bgcolor: '#4a5f4a' } })
                }}
              >
                {viewMode === 'view_details_manage' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Cancel Edit
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Edit Payroll
                  </>
                )}
              </Box>
            </Box>
          </Box>

          <Paper elevation={0} sx={{ bgcolor: 'white', p: 3, borderRadius: 4, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid', borderColor: 'grey.100', mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 64, height: 64, bgcolor: '#5A725A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, boxShadow: 3, fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase', overflow: 'hidden' }}>
                {employees[selectedEmpId]?.documents?.["Passport Size Photos"]?.previewUrl ? (
                  <img src={employees[selectedEmpId].documents["Passport Size Photos"].previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (employees[selectedEmpId]?.name || employees[selectedEmpId]?.personal?.firstName || 'E')[0]
                )}
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'grey.800' }}>
                  {employees[selectedEmpId]?.name || `${employees[selectedEmpId]?.personal?.firstName} ${employees[selectedEmpId]?.personal?.lastName}`}
                </Typography>
                <Typography sx={{ color: 'grey.500', fontWeight: 500, mt: 0.5 }}>
                  {employees[selectedEmpId]?.department || employees[selectedEmpId]?.employment?.department || 'N/A'} • ID: {selectedEmpId}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: 'grey.50', px: 3, py: 2, borderRadius: 4, border: '1px solid', borderColor: 'grey.100', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box>
                <Typography sx={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.1em', color: 'rgba(90, 114, 90, 0.7)', textTransform: 'uppercase' }}>Net Take-Home</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'grey.800' }}>{formatCurrency(totals.netTakeHome)}</Typography>
              </Box>
              <Box sx={{ width: '1px', height: 32, bgcolor: 'grey.200' }}></Box>
              <Box>
                <Typography sx={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.1em', color: 'grey.500', textTransform: 'uppercase' }}>Annual Balance</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'grey.800' }}>{formatCurrency(totals.netTakeHome * 12)}</Typography>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3, alignItems: 'start' }}>
            
            <Paper elevation={0} sx={{ bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ bgcolor: 'rgba(236, 253, 245, 0.5)', borderBottom: '1px solid', borderColor: 'grey.100', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'grey.800' }}>Fixed Earnings (Monthly)</Typography>
                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gross Salary Components</Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                {EARNINGS_FIELDS.filter(f => (f.isCommon || addedOptionalFields.includes(f.key)) && (earnings[f.key] > 0)).map(item => (
                  <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, borderBottom: '1px solid', borderColor: 'grey.50', pb: 1, '&:last-child': { borderBottom: 0, pb: 0 } }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'grey.600', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={getLabelWithPercent(item)}>
                      {getLabelWithPercent(item)}
                    </Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ color: 'grey.800', fontWeight: 'bold' }}>{formatCurrency(earnings[item.key] || 0)}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box sx={{ bgcolor: 'rgba(236, 253, 245, 0.3)', p: 2, borderTop: '1px solid', borderColor: 'grey.100', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'grey.600' }}>Total Earnings</Typography>
                <Typography sx={{ color: '#047857', fontWeight: 900 }}>{formatCurrency(totals.grossSalary)}</Typography>
              </Box>
            </Paper>

            
            <Paper elevation={0} sx={{ bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ bgcolor: 'rgba(255, 241, 242, 0.5)', borderBottom: '1px solid', borderColor: 'grey.100', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'grey.800' }}>Employee Deductions (Monthly)</Typography>
                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subtracted from Gross</Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                {DEDUCTIONS_FIELDS.filter(f => (f.isCommon || addedOptionalFields.includes(f.key)) && (deductions[f.key] > 0)).map(item => (
                  <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, borderBottom: '1px solid', borderColor: 'grey.50', pb: 1, '&:last-child': { borderBottom: 0, pb: 0 } }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'grey.600', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={getLabelWithPercent(item)}>
                      {getLabelWithPercent(item)}
                    </Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ color: '#e11d48', fontWeight: 'bold' }}>{formatCurrency(deductions[item.key] || 0)}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box sx={{ bgcolor: 'rgba(255, 241, 242, 0.3)', p: 2, borderTop: '1px solid', borderColor: 'grey.100', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'grey.600' }}>Total Deductions</Typography>
                <Typography sx={{ color: '#be123c', fontWeight: 900 }}>{formatCurrency(totals.totalDeductions)}</Typography>
              </Box>
            </Paper>

            
            <Paper elevation={0} sx={{ bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ bgcolor: 'rgba(238, 242, 255, 0.5)', borderBottom: '1px solid', borderColor: 'grey.100', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'grey.800' }}>Employer Contributions (Monthly)</Typography>
                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Part of CTC</Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                {EMPLOYER_CONT_FIELDS.filter(f => (f.isCommon || addedOptionalFields.includes(f.key)) && (employerCont[f.key] > 0)).map(item => (
                  <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, borderBottom: '1px solid', borderColor: 'grey.50', pb: 1, '&:last-child': { borderBottom: 0, pb: 0 } }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'grey.600', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={getLabelWithPercent(item)}>
                      {getLabelWithPercent(item)}
                    </Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ color: '#4f46e5', fontWeight: 'bold' }}>{formatCurrency(employerCont[item.key] || 0)}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </>
      ) : viewMode === 'view_details_manage' ? (
        <>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box
              component="button"
              onClick={() => setViewMode('overview')}
              sx={{ color: 'grey.500', '&:hover': { color: 'grey.800' }, fontWeight: 'bold', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1, transition: 'color 0.2s', bgcolor: 'transparent', border: 'none', cursor: 'pointer', p: 0 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Directory
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component="button"
                onClick={() => setViewMode('view_details')}
                disabled={!selectedEmpId}
                sx={{
                  fontWeight: 'bold', py: 1.25, px: 2.5, borderRadius: 3, transition: 'all 0.2s', boxShadow: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem', flexShrink: 0, border: 'none', cursor: selectedEmpId ? 'pointer' : 'not-allowed', opacity: selectedEmpId ? 1 : 0.5,
                  bgcolor: '#fef3c7', color: '#b45309', '&:hover': { bgcolor: '#fde68a' }
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Cancel Edit
              </Box>
            </Box>
          </Box>

          <Paper elevation={0} sx={{ bgcolor: 'white', p: 3, borderRadius: 4, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid', borderColor: 'grey.100', mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 3, opacity: 0.75 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 64, height: 64, bgcolor: '#5A725A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, boxShadow: 3, fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase', overflow: 'hidden' }}>
                {employees[selectedEmpId]?.documents?.["Passport Size Photos"]?.previewUrl ? (
                  <img src={employees[selectedEmpId].documents["Passport Size Photos"].previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (employees[selectedEmpId]?.name || employees[selectedEmpId]?.personal?.firstName || 'E')[0]
                )}
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'grey.800' }}>{employees[selectedEmpId]?.name || `${employees[selectedEmpId]?.personal?.firstName} ${employees[selectedEmpId]?.personal?.lastName}`}</Typography>
                <Typography sx={{ color: 'grey.500', fontWeight: 500, mt: 0.5 }}>
                  {employees[selectedEmpId]?.department || employees[selectedEmpId]?.employment?.department || 'N/A'} • ID: {selectedEmpId}
                  <Box component="span" sx={{ color: '#d97706', fontWeight: 'bold', ml: 1 }}>(EDIT MODE)</Box>
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: 'grey.50', px: 3, py: 2, borderRadius: 4, border: '1px solid', borderColor: 'grey.100', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box>
                <Typography sx={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.1em', color: 'rgba(90, 114, 90, 0.7)', textTransform: 'uppercase' }}>Net Take-Home</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'grey.800' }}>{formatCurrency(totals.netTakeHome)}</Typography>
              </Box>
              <Box sx={{ width: '1px', height: 32, bgcolor: 'grey.200' }}></Box>
              <Box>
                <Typography sx={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.1em', color: 'grey.500', textTransform: 'uppercase' }}>Annual Balance</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'grey.800' }}>{formatCurrency(totals.netTakeHome * 12)}</Typography>
              </Box>
            </Box>
          </Paper>

            
          <Paper elevation={0} sx={{ bgcolor: '#fffbeb', borderRadius: 4, p: 3, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid', borderColor: '#fde68a', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 3, justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#78350f' }}>Auto-Calculate Structure</Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(180, 83, 9, 0.8)' }}>Enter a Target Annual CTC to auto-fill standard Indian statutory percentages.</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
              <Box sx={{ position: 'relative', width: { xs: '100%', md: 256 } }}>
                <Box component="span" sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'grey.400', fontWeight: 'bold' }}>₹</Box>
                <Box
                  component="input"
                  type="number"
                  value={targetCTC}
                  onChange={(e) => setTargetCTC(e.target.value.replace(/[^0-9.]/g, ''))}
                  sx={{ width: '100%', pl: 4, pr: 2, py: 1.5, bgcolor: 'white', border: '1px solid', borderColor: '#fde68a', borderRadius: 3, fontWeight: 'bold', color: 'grey.800', outline: 'none', '&:focus': { boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.2)', borderColor: '#f59e0b' }, boxSizing: 'border-box' }}
                />
              </Box>
              <Box
                component="button"
                onClick={() => calculateStructure(targetCTC)}
                sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, color: 'white', fontWeight: 'bold', py: 1.5, px: 3, borderRadius: 3, transition: 'all 0.2s', boxShadow: 1, border: 'none', cursor: 'pointer', flexShrink: 0 }}
              >
                Generate
              </Box>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', xl: 'row' }, gap: 3, alignItems: 'start' }}>
            
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 3, alignItems: 'stretch' }}>
                
                <Paper elevation={0} sx={{ bgcolor: 'white', borderRadius: 4, border: '2px solid', borderColor: '#d1fae5', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ bgcolor: 'rgba(236, 253, 245, 0.5)', borderBottom: '1px solid', borderColor: 'grey.100', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'grey.800' }}>Fixed Earnings (Monthly)</Typography>
                      <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Edit Components</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                    {EARNINGS_FIELDS.filter(f => f.isCommon || addedOptionalFields.includes(f.key)).map(item => (
                      <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'grey.700', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={getLabelWithPercent(item)}>{getLabelWithPercent(item)}</Typography>
                        <Box sx={{ position: 'relative', width: '33.333%', minWidth: 120 }}>
                          <Box component="span" sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'grey.400', fontSize: '0.75rem', fontWeight: 'bold' }}>₹</Box>
                          <Box
                            component="input"
                            type="number"
                            value={earnings[item.key] || ''}
                            onChange={(e) => handleEarningsChange(item.key, e.target.value)}
                            sx={{ width: '100%', pl: 3.5, pr: 1.5, py: 1, bgcolor: 'rgba(236, 253, 245, 0.3)', border: '1px solid', borderColor: 'rgba(167, 243, 208, 0.5)', borderRadius: 2, fontSize: '0.875rem', fontWeight: 'bold', color: 'grey.800', outline: 'none', '&:focus': { boxShadow: '0 0 0 1px #10b981', borderColor: '#10b981' }, textAlign: 'right', transition: 'colors' }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>

                
                <Paper elevation={0} sx={{ bgcolor: 'white', borderRadius: 4, border: '2px solid', borderColor: '#ffe4e6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ bgcolor: 'rgba(255, 241, 242, 0.5)', borderBottom: '1px solid', borderColor: 'grey.100', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'grey.800' }}>Employee Deductions (Monthly)</Typography>
                      <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Edit Components</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                    {DEDUCTIONS_FIELDS.filter(f => f.isCommon || addedOptionalFields.includes(f.key)).map(item => (
                      <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'grey.700', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={getLabelWithPercent(item)}>{getLabelWithPercent(item)}</Typography>
                        <Box sx={{ position: 'relative', width: '33.333%', minWidth: 120 }}>
                          <Box component="span" sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#fb7185', fontSize: '0.75rem', fontWeight: 'bold' }}>₹</Box>
                          <Box
                            component="input"
                            type="number"
                            value={deductions[item.key] || ''}
                            onChange={(e) => handleDeductionsChange(item.key, e.target.value)}
                            sx={{ width: '100%', pl: 3.5, pr: 1.5, py: 1, bgcolor: 'rgba(255, 241, 242, 0.3)', border: '1px solid', borderColor: 'rgba(254, 205, 211, 0.5)', borderRadius: 2, fontSize: '0.875rem', fontWeight: 'bold', color: 'grey.800', outline: 'none', '&:focus': { boxShadow: '0 0 0 1px #f43f5e', borderColor: '#f43f5e' }, textAlign: 'right', transition: 'colors' }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>

                
                <Paper elevation={0} sx={{ bgcolor: 'white', borderRadius: 4, border: '2px solid', borderColor: '#e0e7ff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ bgcolor: 'rgba(238, 242, 255, 0.5)', borderBottom: '1px solid', borderColor: 'grey.100', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'grey.800' }}>Employer Contributions (Monthly)</Typography>
                      <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Edit Components</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                    {EMPLOYER_CONT_FIELDS.filter(f => f.isCommon || addedOptionalFields.includes(f.key)).map(item => (
                      <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'grey.700', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={getLabelWithPercent(item)}>{getLabelWithPercent(item)}</Typography>
                        <Box sx={{ position: 'relative', width: '33.333%', minWidth: 120 }}>
                          <Box component="span" sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#818cf8', fontSize: '0.75rem', fontWeight: 'bold' }}>₹</Box>
                          <Box
                            component="input"
                            type="number"
                            value={employerCont[item.key] || ''}
                            onChange={(e) => handleEmployerContChange(item.key, e.target.value)}
                            sx={{ width: '100%', pl: 3.5, pr: 1.5, py: 1, bgcolor: 'rgba(238, 242, 255, 0.3)', border: '1px solid', borderColor: 'rgba(199, 210, 254, 0.5)', borderRadius: 2, fontSize: '0.875rem', fontWeight: 'bold', color: 'grey.800', outline: 'none', '&:focus': { boxShadow: '0 0 0 1px #6366f1', borderColor: '#6366f1' }, textAlign: 'right', transition: 'colors' }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>

              
              <Paper elevation={0} sx={{ bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                <Box
                  component="button"
                  onClick={() => setViewMode('view_details')}
                  sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'grey.200', color: 'grey.600', fontWeight: 'bold', py: 1.5, px: 3, borderRadius: 3, transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}
                >
                  Cancel
                </Box>
                <Box
                  component="button"
                  onClick={() => {
                    handleSaveStructure();
                    setViewMode('view_details');
                  }}
                  disabled={!selectedEmpId}
                  sx={{
                    fontWeight: 'bold', py: 1.5, px: 4, borderRadius: 3, transition: 'all 0.2s', boxShadow: 1, border: 'none',
                    ...(selectedEmpId ? { bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, color: 'white', cursor: 'pointer' } : { bgcolor: 'grey.300', color: 'grey.500', cursor: 'not-allowed' })
                  }}
                >
                  Save Changes
                </Box>
              </Paper>
            </Box>

            
            <Paper elevation={0} sx={{ width: { xs: '100%', xl: 288 }, flexShrink: 0, bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', p: 3, position: 'sticky', top: 24 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.800', mb: 0.5 }}>Add Subtopics</Typography>
              <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 3 }}>Click to toggle optional fields</Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography sx={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', color: '#059669', mb: 1.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }}></Box>
                    EARNINGS
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {EARNINGS_FIELDS.filter(f => !f.isCommon).map(item => (
                      <Box
                        component="button"
                        key={item.key}
                        onClick={() => toggleOptionalField(item.key)}
                        sx={{
                          fontSize: '13px', fontWeight: 'bold', px: 2, py: 1.25, borderRadius: 3, border: '1px solid', transition: 'all 0.2s', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                          ...(addedOptionalFields.includes(item.key) ? { bgcolor: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' } : { bgcolor: 'white', borderColor: 'grey.200', color: 'grey.400', '&:hover': { bgcolor: 'grey.50' } })
                        }}
                      >
                        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 1 }}>{getLabelWithPercent(item)}</Box>
                        <Box sx={{ width: 20, height: 20, borderRadius: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', transition: 'colors', ...(addedOptionalFields.includes(item.key) ? { bgcolor: '#10b981', borderColor: '#059669', color: 'white' } : { bgcolor: 'white', borderColor: 'grey.200', color: 'grey.300' }) }}>
                          {addedOptionalFields.includes(item.key) ? <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ width: '100%', height: '1px', bgcolor: 'grey.100' }}></Box>

                <Box>
                  <Typography sx={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', color: '#e11d48', mb: 1.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f43f5e' }}></Box>
                    DEDUCTIONS
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {DEDUCTIONS_FIELDS.filter(f => !f.isCommon).map(item => (
                      <Box
                        component="button"
                        key={item.key}
                        onClick={() => toggleOptionalField(item.key)}
                        sx={{
                          fontSize: '13px', fontWeight: 'bold', px: 2, py: 1.25, borderRadius: 3, border: '1px solid', transition: 'all 0.2s', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                          ...(addedOptionalFields.includes(item.key) ? { bgcolor: '#fff1f2', borderColor: '#fecdd3', color: '#be123c', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' } : { bgcolor: 'white', borderColor: 'grey.200', color: 'grey.400', '&:hover': { bgcolor: 'grey.50' } })
                        }}
                      >
                        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 1 }}>{getLabelWithPercent(item)}</Box>
                        <Box sx={{ width: 20, height: 20, borderRadius: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', transition: 'colors', ...(addedOptionalFields.includes(item.key) ? { bgcolor: '#f43f5e', borderColor: '#e11d48', color: 'white' } : { bgcolor: 'white', borderColor: 'grey.200', color: 'grey.300' }) }}>
                          {addedOptionalFields.includes(item.key) ? <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ width: '100%', height: '1px', bgcolor: 'grey.100' }}></Box>

                <Box>
                  <Typography sx={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', color: '#4f46e5', mb: 1.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6366f1' }}></Box>
                    EMPLOYER CONT.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {EMPLOYER_CONT_FIELDS.filter(f => !f.isCommon).map(item => (
                      <Box
                        component="button"
                        key={item.key}
                        onClick={() => toggleOptionalField(item.key)}
                        sx={{
                          fontSize: '13px', fontWeight: 'bold', px: 2, py: 1.25, borderRadius: 3, border: '1px solid', transition: 'all 0.2s', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                          ...(addedOptionalFields.includes(item.key) ? { bgcolor: '#eef2ff', borderColor: '#c7d2fe', color: '#4338ca', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' } : { bgcolor: 'white', borderColor: 'grey.200', color: 'grey.400', '&:hover': { bgcolor: 'grey.50' } })
                        }}
                      >
                        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 1 }}>{getLabelWithPercent(item)}</Box>
                        <Box sx={{ width: 20, height: 20, borderRadius: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', transition: 'colors', ...(addedOptionalFields.includes(item.key) ? { bgcolor: '#6366f1', borderColor: '#4f46e5', color: 'white' } : { bgcolor: 'white', borderColor: 'grey.200', color: 'grey.300' }) }}>
                          {addedOptionalFields.includes(item.key) ? <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>
            <Box
              component="button"
              onClick={() => setViewMode('overview')}
              sx={{ color: 'grey.500', '&:hover': { color: 'grey.800' }, fontWeight: 'bold', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1, transition: 'color 0.2s', bgcolor: 'transparent', border: 'none', cursor: 'pointer', p: 0 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Overview
            </Box>
          </Box>

          {/* Page Header */}
          <Paper elevation={0} sx={{ bgcolor: 'white', p: 4, borderRadius: 4, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid', borderColor: 'grey.100', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 3, position: 'relative', overflow: 'hidden', mb: 4 }}>
            <Box sx={{ position: 'absolute', top: 0, right: 0, width: 256, height: 256, bgcolor: 'rgba(90, 114, 90, 0.1)', borderRadius: '50%', filter: 'blur(40px)', mr: -16, mt: -16, pointerEvents: 'none' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative' }}>
              <Box sx={{ width: 64, height: 64, bgcolor: '#5A725A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, boxShadow: 3 }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'grey.800', letterSpacing: '-0.025em' }}>Payroll Management</Typography>
                <Typography sx={{ color: 'grey.500', fontWeight: 500, mt: 0.5 }}>Configure complex salary structures and compliance tracking.</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', bgcolor: 'rgba(243, 244, 246, 0.8)', p: 0.75, borderRadius: 3, border: '1px solid', borderColor: 'rgba(229, 231, 235, 0.5)', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)' }}>
              <Box
                component="button"
                onClick={() => setActiveTab('structure')}
                sx={{
                  px: 3, py: 1.25, borderRadius: 2, fontWeight: 'bold', fontSize: '0.875rem', transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                  ...(activeTab === 'structure' ? { bgcolor: 'white', color: '#5A725A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' } : { bgcolor: 'transparent', color: 'grey.500', '&:hover': { color: 'grey.700' } })
                }}
              >
                Salary Structure
              </Box>
              <Box
                component="button"
                onClick={() => setActiveTab('payslips')}
                sx={{
                  px: 3, py: 1.25, borderRadius: 2, fontWeight: 'bold', fontSize: '0.875rem', transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                  ...(activeTab === 'payslips' ? { bgcolor: 'white', color: '#5A725A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' } : { bgcolor: 'transparent', color: 'grey.500', '&:hover': { color: 'grey.700' } })
                }}
              >
                Monthly Payslips
              </Box>
            </Box>
          </Paper>

          {/* Employee Selector */}
          <Paper elevation={0} sx={{ bgcolor: 'white', p: 3, borderRadius: 4, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid', borderColor: 'grey.100', mb: 4 }}>
            <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: 'grey.700', mb: 1, textTransform: 'uppercase', letterSpacing: '0.025em' }}>Select Employee for Payroll Configuration</Typography>
            <Box sx={{ position: 'relative', width: '100%', maxWidth: 448 }}>
              <Box
                component="select"
                sx={{
                  width: '100%', appearance: 'none', bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', color: 'grey.700', py: 1.5, pl: 2, pr: 5, borderRadius: 3, fontWeight: 600, outline: 'none', transition: 'all 0.2s',
                  '&:focus': { bgcolor: 'white', borderColor: '#5A725A', boxShadow: '0 0 0 2px rgba(90, 114, 90, 0.2)' }
                }}
                value={selectedEmpId}
                onChange={handleEmployeeChange}
              >
                <option value="">-- Choose Employee --</option>
                {Object.values(employees).map(emp => (
                  <option key={emp.empId || emp.personal?.employeeId} value={emp.empId || emp.personal?.employeeId}>
                    {emp.name || `${emp.personal?.firstName} ${emp.personal?.lastName}`} - {emp.department || emp.employment?.department}
                  </option>
                ))}
              </Box>
              <Box sx={{ pointerEvents: 'none', position: 'absolute', right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', px: 2, color: 'grey.500' }}>
                <svg className="fill-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </Box>
            </Box>
            {!selectedEmpId && (
              <Typography sx={{ mt: 1, fontSize: '0.875rem', color: '#b45309', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Please select an employee to assign or configure their payroll structure.
              </Typography>
            )}
          </Paper>

          {activeTab === 'structure' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Paper elevation={0} sx={{ flex: 1, minWidth: 0, p: 3, borderRadius: 4, border: '1px solid', borderColor: '#bbf7d0', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s', '&:hover': { '.bg-round': { transform: 'scale(1.1)' } } }}>
                  <Box className="bg-round" sx={{ position: 'absolute', right: -16, top: -16, width: 96, height: 96, bgcolor: '#f0fdf4', borderRadius: '50%', transition: 'transform 500ms' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.1em', color: 'rgba(90, 114, 90, 0.7)', textTransform: 'uppercase', position: 'relative', zIndex: 10, mb: 1 }}>
                    Monthly Gross Salary
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'grey.800', position: 'relative', zIndex: 10 }}>
                    {formatCurrency(totals.grossSalary)}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ flex: 1, minWidth: 0, p: 3, borderRadius: 4, border: '1px solid', borderColor: '#ffe4e6', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s', '&:hover': { '.bg-round': { transform: 'scale(1.1)' } } }}>
                  <Box className="bg-round" sx={{ position: 'absolute', right: -16, top: -16, width: 96, height: 96, bgcolor: '#fff1f2', borderRadius: '50%', transition: 'transform 500ms' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.1em', color: 'rgba(244, 63, 94, 0.7)', textTransform: 'uppercase', position: 'relative', zIndex: 10, mb: 1 }}>
                    Total Deductions
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'error.main', position: 'relative', zIndex: 10 }}>
                    {formatCurrency(totals.totalDeductions)}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ flex: 1, minWidth: 0, p: 3, borderRadius: 4, border: '1px solid', borderColor: '#d1fae5', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(to bottom right, rgba(236, 253, 245, 0.5), white)', transition: 'transform 0.2s', '&:hover': { '.bg-round': { transform: 'scale(1.1)' } } }}>
                  <Box className="bg-round" sx={{ position: 'absolute', right: -16, top: -16, width: 96, height: 96, bgcolor: 'rgba(209, 250, 229, 0.5)', borderRadius: '50%', transition: 'transform 500ms' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.1em', color: 'rgba(5, 150, 105, 0.7)', textTransform: 'uppercase', position: 'relative', zIndex: 10, mb: 1 }}>
                    Net Take-Home
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#047857', position: 'relative', zIndex: 10 }}>
                    {formatCurrency(totals.netTakeHome)}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ flex: 1, minWidth: 0, p: 3, borderRadius: 4, border: '1px solid', borderColor: '#4a5f4a', bgcolor: '#5A725A', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s', '&:hover': { '.bg-round': { transform: 'scale(1.1)' } } }}>
                  <Box className="bg-round" sx={{ position: 'absolute', right: -40, top: -40, width: 128, height: 128, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', transition: 'transform 500ms' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', position: 'relative', zIndex: 10, mb: 1 }}>
                    Total Annual CTC
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', position: 'relative', zIndex: 10 }}>
                    {formatCurrency(totals.totalCTC)}
                  </Typography>
                </Paper>
              </Box>

              
              <Paper elevation={0} sx={{ bgcolor: 'white', borderRadius: 4, p: 3, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid', borderColor: 'grey.100', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 3, justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.800' }}>Auto-Calculate Structure</Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'grey.500' }}>Enter a Target Annual CTC to auto-fill standard Indian statutory percentages.</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
                  <Box sx={{ position: 'relative', width: { xs: '100%', md: 256 } }}>
                    <Box component="span" sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'grey.400', fontWeight: 'bold' }}>₹</Box>
                    <Box
                      component="input"
                      type="number"
                      value={targetCTC}
                      onChange={(e) => setTargetCTC(e.target.value.replace(/[^0-9.]/g, ''))}
                      sx={{ width: '100%', pl: 4, pr: 2, py: 1.5, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 3, fontWeight: 'bold', color: 'grey.800', outline: 'none', '&:focus': { boxShadow: '0 0 0 2px rgba(90, 114, 90, 0.2)', borderColor: '#5A725A' }, boxSizing: 'border-box' }}
                    />
                  </Box>
                  <Box
                    component="button"
                    onClick={() => calculateStructure(targetCTC)}
                    sx={{ bgcolor: '#5A725A', '&:hover': { bgcolor: '#4a5f4a' }, color: 'white', fontWeight: 'bold', py: 1.5, px: 3, borderRadius: 3, transition: 'all 0.2s', boxShadow: 1, border: 'none', cursor: 'pointer', flexShrink: 0 }}
                  >
                    Generate
                  </Box>
                </Box>
              </Paper>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', xl: 'row' }, gap: 3, alignItems: 'flex-start' }}>

                
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, width: '100%' }}>

                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 3, alignItems: 'stretch' }}>
                  
                    
                            
                            <Paper elevation={0} sx={{ bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ bgcolor: 'rgba(236, 253, 245, 0.5)', borderBottom: '1px solid', borderColor: 'grey.100', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                </Box>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'grey.800' }}>Fixed Earnings</Typography>
                                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gross Salary Components</Typography>
                                </Box>
                              </Box>
                              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                                {EARNINGS_FIELDS.filter(f => f.isCommon || addedOptionalFields.includes(f.key)).map(item => (
                                  <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'grey.700', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.label}>
                                        {item.headId === 4 ? item.label : getLabelWithPercent(item)}
                                    </Typography>
                                    <Box sx={{ position: 'relative', width: '33.333%', minWidth: 120 }}>
                                      <Box component="span" sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'grey.400', fontSize: '0.75rem', fontWeight: 'bold' }}>₹</Box>
                                      <Box
                                        component="input"
                                        type="number"
                                        value={earnings[item.key] || ''}
                                        onChange={(e) => handleEarningsChange(item.key, e.target.value)}
                                        sx={{ width: '100%', pl: 3.5, pr: 1.5, py: 1, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 2, fontSize: '0.875rem', fontWeight: 'bold', color: 'grey.800', outline: 'none', '&:focus': { boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.5)', borderColor: '#10b981' }, textAlign: 'right', transition: 'colors' }}
                                      />
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            </Paper>

                            
                            <Paper elevation={0} sx={{ bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ bgcolor: 'rgba(255, 241, 242, 0.5)', borderBottom: '1px solid', borderColor: 'grey.100', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
                                </Box>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'grey.800' }}>Employee Deductions</Typography>
                                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subtracted from Gross</Typography>
                                </Box>
                              </Box>
                              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                                {DEDUCTIONS_FIELDS.filter(f => f.isCommon || addedOptionalFields.includes(f.key)).map(item => (
                                  <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'grey.700', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.label}>
                                        {getLabelWithPercent(item)}
                                    </Typography>
                                    <Box sx={{ position: 'relative', width: '33.333%', minWidth: 120 }}>
                                      <Box component="span" sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#fb7185', fontSize: '0.75rem', fontWeight: 'bold' }}>₹</Box>
                                      <Box
                                        component="input"
                                        type="number"
                                        value={deductions[item.key] || ''}
                                        onChange={(e) => handleDeductionsChange(item.key, e.target.value)}
                                        sx={{ width: '100%', pl: 3.5, pr: 1.5, py: 1, bgcolor: 'grey.50', border: '1px solid', borderColor: 'rgba(229, 231, 235, 0.8)', borderRadius: 2, fontSize: '0.875rem', fontWeight: 'bold', color: 'rgba(190, 18, 60, 0.8)', outline: 'none', '&:focus': { boxShadow: '0 0 0 1px rgba(244, 63, 94, 0.5)', borderColor: '#f43f5e' }, textAlign: 'right', transition: 'colors' }}
                                      />
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            </Paper>

                            
                            <Paper elevation={0} sx={{ bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ bgcolor: 'rgba(238, 242, 255, 0.5)', borderBottom: '1px solid', borderColor: 'grey.100', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </Box>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'grey.800' }}>Employer Contributions</Typography>
                                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Part of CTC</Typography>
                                </Box>
                              </Box>
                              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                                {EMPLOYER_CONT_FIELDS.filter(f => f.isCommon || addedOptionalFields.includes(f.key)).map(item => (
                                  <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'grey.700', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.label}>
                                        {getLabelWithPercent(item)}
                                    </Typography>
                                    <Box sx={{ position: 'relative', width: '33.333%', minWidth: 120 }}>
                                      <Box component="span" sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#818cf8', fontSize: '0.75rem', fontWeight: 'bold' }}>₹</Box>
                                      <Box
                                        component="input"
                                        type="number"
                                        value={employerCont[item.key] || ''}
                                        onChange={(e) => handleEmployerContChange(item.key, e.target.value)}
                                        sx={{ width: '100%', pl: 3.5, pr: 1.5, py: 1, bgcolor: 'grey.50', border: '1px solid', borderColor: 'rgba(229, 231, 235, 0.8)', borderRadius: 2, fontSize: '0.875rem', fontWeight: 'bold', color: 'rgba(67, 56, 202, 0.8)', outline: 'none', '&:focus': { boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.5)', borderColor: '#6366f1' }, textAlign: 'right', transition: 'colors' }}
                                      />
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            </Paper>
                  </Box>

                  
                  <Paper elevation={0} sx={{ bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Box
                      component="button"
                      onClick={handleSaveStructure}
                      disabled={!selectedEmpId}
                      sx={{
                        fontWeight: 'bold', py: 1.5, px: 4, borderRadius: 3, transition: 'all 0.2s', boxShadow: 1, width: { xs: '100%', sm: 'auto' }, border: 'none',
                        ...(selectedEmpId ? { bgcolor: '#5A725A', '&:hover': { bgcolor: '#4a5f4a' }, color: 'white', cursor: 'pointer' } : { bgcolor: 'grey.300', color: 'grey.500', cursor: 'not-allowed' })
                      }}
                    >
                      Save Structure to Profile
                    </Box>
                  </Paper>

                </Box>

                
                <Paper elevation={0} sx={{ width: { xs: '100%', xl: 288 }, flexShrink: 0, bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', p: 3, position: 'sticky', top: 24 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.800', mb: 0.5 }}>Add Subtopics</Typography>
                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 3 }}>Click to toggle optional fields</Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                   
                            <>
                                <Box>
                                <Typography sx={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', color: '#059669', mb: 1.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }}></Box>
                                    EARNINGS
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {EARNINGS_FIELDS.filter(f => !f.isCommon).map(item => (
                                    <Box
                                        component="button"
                                        key={item.key}
                                        onClick={() => toggleOptionalField(item.key)}
                                        sx={{
                                            fontSize: '12px', fontWeight: 'bold', px: 2, py: 1.25, borderRadius: 3, border: '1px solid', transition: 'all 0.2s', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                                            ...(addedOptionalFields.includes(item.key) ? { bgcolor: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' } : { bgcolor: 'white', borderColor: 'grey.200', color: 'grey.400', '&:hover': { bgcolor: 'grey.50' } })
                                        }}
                                    >
                                        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 1 }}>{item.headId === 4 ? item.label : getLabelWithPercent(item)}</Box>
                                        <Box sx={{ width: 20, height: 20, borderRadius: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', transition: 'colors', ...(addedOptionalFields.includes(item.key) ? { bgcolor: '#10b981', borderColor: '#059669', color: 'white' } : { bgcolor: 'white', borderColor: 'grey.200', color: 'grey.300' }) }}>
                                        {addedOptionalFields.includes(item.key) ? <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>}
                                        </Box>
                                    </Box>
                                    ))}
                                </Box>
                                </Box>

                                <Box sx={{ width: '100%', height: '1px', bgcolor: 'grey.100' }}></Box>

                                <Box>
                                <Typography sx={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', color: '#e11d48', mb: 1.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f43f5e' }}></Box>
                                    DEDUCTIONS
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {DEDUCTIONS_FIELDS.filter(f => !f.isCommon).map(item => (
                                    <Box
                                        component="button"
                                        key={item.key}
                                        onClick={() => toggleOptionalField(item.key)}
                                        sx={{
                                            fontSize: '12px', fontWeight: 'bold', px: 2, py: 1.25, borderRadius: 3, border: '1px solid', transition: 'all 0.2s', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                                            ...(addedOptionalFields.includes(item.key) ? { bgcolor: '#fff1f2', borderColor: '#fecdd3', color: '#be123c', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' } : { bgcolor: 'white', borderColor: 'grey.200', color: 'grey.400', '&:hover': { bgcolor: 'grey.50' } })
                                        }}
                                    >
                                        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 1 }}>{getLabelWithPercent(item)}</Box>
                                        <Box sx={{ width: 20, height: 20, borderRadius: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', transition: 'colors', ...(addedOptionalFields.includes(item.key) ? { bgcolor: '#f43f5e', borderColor: '#e11d48', color: 'white' } : { bgcolor: 'white', borderColor: 'grey.200', color: 'grey.300' }) }}>
                                        {addedOptionalFields.includes(item.key) ? <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>}
                                        </Box>
                                    </Box>
                                    ))}
                                </Box>
                                </Box>

                                <Box sx={{ width: '100%', height: '1px', bgcolor: 'grey.100' }}></Box>

                                <Box>
                                <Typography sx={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', color: '#4f46e5', mb: 1.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6366f1' }}></Box>
                                    EMPLOYER CONT.
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {EMPLOYER_CONT_FIELDS.filter(f => !f.isCommon).map(item => (
                                    <Box
                                        component="button"
                                        key={item.key}
                                        onClick={() => toggleOptionalField(item.key)}
                                        sx={{
                                            fontSize: '12px', fontWeight: 'bold', px: 2, py: 1.25, borderRadius: 3, border: '1px solid', transition: 'all 0.2s', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                                            ...(addedOptionalFields.includes(item.key) ? { bgcolor: '#eef2ff', borderColor: '#c7d2fe', color: '#4338ca', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' } : { bgcolor: 'white', borderColor: 'grey.200', color: 'grey.400', '&:hover': { bgcolor: 'grey.50' } })
                                        }}
                                    >
                                        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 1 }}>{getLabelWithPercent(item)}</Box>
                                        <Box sx={{ width: 20, height: 20, borderRadius: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', transition: 'colors', ...(addedOptionalFields.includes(item.key) ? { bgcolor: '#6366f1', borderColor: '#4f46e5', color: 'white' } : { bgcolor: 'white', borderColor: 'grey.200', color: 'grey.300' }) }}>
                                        {addedOptionalFields.includes(item.key) ? <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>}
                                        </Box>
                                    </Box>
                                    ))}
                                </Box>
                                </Box>
                            </>
                  </Box>
                </Paper>

              </Box>
            </Box>
          )}

          {activeTab === 'payslips' && (
            <Paper elevation={0} sx={{ bgcolor: 'white', p: 5, borderRadius: 4, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid', borderColor: 'grey.100', textAlign: 'center' }}>
              <Box sx={{ width: 96, height: 96, bgcolor: 'grey.50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, border: '1px solid', borderColor: 'grey.100' }}>
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.800' }}>Monthly Payslips Setup Module</Typography>
              <Typography sx={{ color: 'grey.500', mt: 1, maxWidth: 450, mx: 'auto' }}>This module will allow HR to generate, review, and lock monthly payslips based on the configured salary structure and attendance inputs.</Typography>
            </Paper>
          )}
        </>
      )}

    </Box>
  )
}

export default Payroll
