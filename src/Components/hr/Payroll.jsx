import { useState, useEffect, useMemo } from "react"

// --- FIELD DEFINITIONS ---
const EARNINGS_FIELDS = [
  { key: 'basicSalary', label: 'Basic Salary', isCommon: true },
  { key: 'hra', label: 'House Rent Allowance (HRA)', isCommon: true },
  { key: 'da', label: 'Dearness Allowance (DA)', isCommon: true },
  { key: 'specialAllowance', label: 'Special Allowance', isCommon: true },
  { key: 'conveyance', label: 'Conveyance Allowance', isCommon: true },
  { key: 'medical', label: 'Medical Allowance', isCommon: true },
  { key: 'lta', label: 'Leave Travel Allowance (LTA)', isCommon: false },
  { key: 'foodAllowance', label: 'Food / Sodexo', isCommon: false },
  { key: 'telephone', label: 'Telephone / Internet', isCommon: false },
  { key: 'uniform', label: 'Uniform Allowance', isCommon: false },
  { key: 'books', label: 'Books & Periodicals', isCommon: false },
  { key: 'driver', label: 'Driver Salary Allowance', isCommon: false },
  { key: 'car', label: 'Car/Fuel Allowance', isCommon: false },
];

const DEDUCTIONS_FIELDS = [
  { key: 'employeePf', label: 'Employee PF (12%)', isCommon: true },
  { key: 'employeeEsi', label: 'Employee ESI (0.75%)', isCommon: true },
  { key: 'professionalTax', label: 'Professional Tax', isCommon: true },
  { key: 'incomeTax', label: 'Income Tax (TDS)', isCommon: true },
  { key: 'lwf', label: 'Labour Welfare Fund', isCommon: false },
];

const EMPLOYER_CONT_FIELDS = [
  { key: 'employerPf', label: 'Employer PF (12%)', isCommon: true },
  { key: 'gratuity', label: 'Gratuity (4.81%)', isCommon: true },
  { key: 'employerEsi', label: 'Employer ESI (3.25%)', isCommon: true },
  { key: 'superannuation', label: 'Superannuation', isCommon: false },
  { key: 'nps', label: 'NPS Contribution', isCommon: false },
  { key: 'insurance', label: 'Group Insurance Premium', isCommon: false },
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

  const [addedOptionalFields, setAddedOptionalFields] = useState(allOptionalFieldKeys);

  useEffect(() => {
    const savedProfiles = JSON.parse(localStorage.getItem('employee_profiles') || '{}')

    // Cleanup unwanted testing employee
    if (savedProfiles['EMP007']) {
      delete savedProfiles['EMP007']
      localStorage.setItem('employee_profiles', JSON.stringify(savedProfiles))
    }

    setEmployees(savedProfiles)
  }, [])


  const [targetCTC, setTargetCTC] = useState(600000)


  const [earnings, setEarnings] = useState({
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
  })


  const [deductions, setDeductions] = useState({
    employeePf: 0,
    employeeEsi: 0,
    professionalTax: 0,
    incomeTax: 0,
    lwf: 0
  })


  const [employerCont, setEmployerCont] = useState({
    employerPf: 0,
    gratuity: 0,
    employerEsi: 0,
    superannuation: 0,
    nps: 0,
    insurance: 0
  })


  const [totals, setTotals] = useState({
    grossSalary: 0,
    totalDeductions: 0,
    netTakeHome: 0,
    totalCTC: 0
  })


  const calculateStructure = (ctc, currentOptionals = addedOptionalFields) => {

    let erContPercentOfGross = (0.40 * 0.12) + (0.40 * 0.0481); // PF + Gratuity
    if (currentOptionals.includes('superannuation')) erContPercentOfGross += (0.40 * 0.10);
    if (currentOptionals.includes('nps')) erContPercentOfGross += (0.40 * 0.10);

    let annualGross = ctc / (1 + erContPercentOfGross);
    if (currentOptionals.includes('insurance')) {
      annualGross = (ctc - 6000) / (1 + erContPercentOfGross);
    }

    let monthlyGross = annualGross / 12;

    if (monthlyGross <= 21000) {
      erContPercentOfGross += 0.0325;
      annualGross = ctc / (1 + erContPercentOfGross);
      if (currentOptionals.includes('insurance')) annualGross = (ctc - 6000) / (1 + erContPercentOfGross);
      monthlyGross = annualGross / 12;
    }

    const basic = monthlyGross * 0.40;
    const hra = basic * 0.50;
    const da = monthlyGross * 0.05;
    const conveyance = monthlyGross * 0.04;
    const medical = monthlyGross * 0.02;

    const lta = currentOptionals.includes('lta') ? monthlyGross * 0.05 : 0;
    const foodAllowance = currentOptionals.includes('foodAllowance') ? monthlyGross * 0.03 : 0;
    const telephone = currentOptionals.includes('telephone') ? monthlyGross * 0.02 : 0;
    const uniform = currentOptionals.includes('uniform') ? monthlyGross * 0.015 : 0;
    const books = currentOptionals.includes('books') ? monthlyGross * 0.015 : 0;
    const driver = currentOptionals.includes('driver') ? 10000 : 0;
    const car = currentOptionals.includes('car') ? monthlyGross * 0.05 : 0;

    let specialAllowance = monthlyGross - (basic + hra + da + conveyance + medical + lta + foodAllowance + telephone + uniform + books + driver + car);
    if (specialAllowance < 0) {
      specialAllowance = 0;
    }

    setEarnings({
      basicSalary: Math.round(basic),
      hra: Math.round(hra),
      da: Math.round(da),
      conveyance: Math.round(conveyance),
      medical: Math.round(medical),
      lta: Math.round(lta),
      foodAllowance: Math.round(foodAllowance),
      telephone: Math.round(telephone),
      uniform: Math.round(uniform),
      books: Math.round(books),
      driver: Math.round(driver),
      car: Math.round(car),
      specialAllowance: Math.round(specialAllowance),
    })

    const epf = basic * 0.12;
    const esi = monthlyGross <= 21000 ? monthlyGross * 0.0075 : 0;
    const pt = monthlyGross > 21000 ? 208 : 0;
    const incomeTax = monthlyGross * 0.05;
    const lwf = currentOptionals.includes('lwf') ? 20 : 0;

    setDeductions({
      employeePf: Math.round(epf),
      employeeEsi: Math.round(esi),
      professionalTax: Math.round(pt),
      lwf: Math.round(lwf),
      incomeTax: Math.round(incomeTax)
    })

    const erPf = basic * 0.12;
    const gratuity = basic * 0.0481;
    const erEsi = monthlyGross <= 21000 ? monthlyGross * 0.0325 : 0;
    const superannuation = currentOptionals.includes('superannuation') ? basic * 0.10 : 0;
    const nps = currentOptionals.includes('nps') ? basic * 0.10 : 0;
    const insurance = currentOptionals.includes('insurance') ? 500 : 0;

    setEmployerCont({
      employerPf: Math.round(erPf),
      gratuity: Math.round(gratuity),
      employerEsi: Math.round(erEsi),
      superannuation: Math.round(superannuation),
      nps: Math.round(nps),
      insurance: Math.round(insurance)
    })
  }

  // Recalculate totals whenever any field changes
  useEffect(() => {
    const gross = Object.values(earnings).reduce((acc, val) => acc + (Number(val) || 0), 0);
    const totalDed = Object.values(deductions).reduce((acc, val) => acc + (Number(val) || 0), 0);
    const totalErCont = Object.values(employerCont).reduce((acc, val) => acc + (Number(val) || 0), 0);

    setTotals({
      grossSalary: gross,
      totalDeductions: totalDed,
      netTakeHome: gross - totalDed,
      totalCTC: (gross + totalErCont) * 12 // Annualized
    });
  }, [earnings, deductions, employerCont])

  const handleEarningsChange = (field, value) => {
    setEarnings(prev => ({ ...prev, [field]: Number(value) || 0 }))
  }

  const handleDeductionsChange = (field, value) => {
    setDeductions(prev => ({ ...prev, [field]: Number(value) || 0 }))
  }

  const handleEmployerContChange = (field, value) => {
    setEmployerCont(prev => ({ ...prev, [field]: Number(value) || 0 }))
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setSelectedEmpId(empId);

    if (empId && employees[empId] && employees[empId].payroll) {
      const p = employees[empId].payroll;
      setEarnings(p.earnings || earnings);
      setDeductions(p.deductions || deductions);
      setEmployerCont(p.employerCont || employerCont);
      setTargetCTC(p.targetCTC || 600000);

      const loadedOptionals = new Set(p.addedOptionalFields || []);
      const allOptionalFields = [
        ...EARNINGS_FIELDS.filter(f => !f.isCommon),
        ...DEDUCTIONS_FIELDS.filter(f => !f.isCommon),
        ...EMPLOYER_CONT_FIELDS.filter(f => !f.isCommon)
      ];

      allOptionalFields.forEach(f => {
        if ((p.earnings && Number(p.earnings[f.key]) > 0) ||
          (p.deductions && Number(p.deductions[f.key]) > 0) ||
          (p.employerCont && Number(p.employerCont[f.key]) > 0)) {
          loadedOptionals.add(f.key);
        }
      });
      setAddedOptionalFields(Array.from(loadedOptionals));
    } else {

      setAddedOptionalFields(allOptionalFieldKeys);
      calculateStructure(600000, allOptionalFieldKeys);
      setTargetCTC(600000);
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

  const handleSaveStructure = () => {
    if (!selectedEmpId) {
      alert("Please select an employee first!");
      return;
    }

    const updatedEmployees = { ...employees };


    if (!updatedEmployees[selectedEmpId]) {
      updatedEmployees[selectedEmpId] = {};
    }

    updatedEmployees[selectedEmpId] = {
      ...updatedEmployees[selectedEmpId],
      payroll: {
        targetCTC,
        earnings,
        deductions,
        employerCont,
        totals,
        addedOptionalFields
      }
    };

    setEmployees(updatedEmployees);
    localStorage.setItem('employee_profiles', JSON.stringify(updatedEmployees));
    alert(`Payroll Structure saved successfully for ${updatedEmployees[selectedEmpId].name || selectedEmpId}!`);
  }

  const handleViewDetails = (empId) => {
    setSelectedEmpId(empId);
    if (empId && employees[empId] && employees[empId].payroll) {
      const p = employees[empId].payroll;
      setEarnings(p.earnings || { basicSalary: 0, hra: 0, da: 0, specialAllowance: 0, conveyance: 0, medical: 0, lta: 0, foodAllowance: 0, telephone: 0, uniform: 0, books: 0, driver: 0, car: 0 });
      setDeductions(p.deductions || { employeePf: 0, employeeEsi: 0, professionalTax: 0, incomeTax: 0, lwf: 0 });
      setEmployerCont(p.employerCont || { employerPf: 0, gratuity: 0, employerEsi: 0, superannuation: 0, nps: 0, insurance: 0 });
      setTargetCTC(p.targetCTC || 600000);

      if (p.addedOptionalFields) {
        setAddedOptionalFields(p.addedOptionalFields);
      } else {
        const activeOptionals = [];
        const allOptionalFields = [
          ...EARNINGS_FIELDS.filter(f => !f.isCommon),
          ...DEDUCTIONS_FIELDS.filter(f => !f.isCommon),
          ...EMPLOYER_CONT_FIELDS.filter(f => !f.isCommon)
        ];

        allOptionalFields.forEach(f => {
          if ((p.earnings && p.earnings[f.key]) ||
            (p.deductions && p.deductions[f.key]) ||
            (p.employerCont && p.employerCont[f.key])) {
            activeOptionals.push(f.key);
          }
        });
        setAddedOptionalFields(activeOptionals);
      }
    } else {
      calculateStructure(600000);
      setTargetCTC(600000);
      setAddedOptionalFields([]);
    }
    setViewMode('view_details');
  };

  // Calculate Company Totals for Overview
  const companyTotals = useMemo(() => {
    let gross = 0;
    let ded = 0;
    let net = 0;
    let ctc = 0;

    Object.values(employees).forEach(emp => {
      if (emp.payroll && emp.payroll.totals) {
        gross += emp.payroll.totals.grossSalary || 0;
        ded += emp.payroll.totals.totalDeductions || 0;
        net += emp.payroll.totals.netTakeHome || 0;
        ctc+= emp.payroll.totals.netTakeHome * 12
      }
    });

    return { gross, ded, net, ctc };
  }, [employees]);

  return (
    <div className="w-full space-y-8 pb-10 px-4 md:px-0 max-w-7xl mx-auto">

      {viewMode === 'overview' ? (
        <>
          {/* Overview Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Payroll Overview</h2>
              <p className="text-gray-500 font-medium mt-1">Company-wide payroll metrics and employee directory.</p>
            </div>
          </div>

          {/* Company Totals Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-green-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500"></div>
              <p className="text-[11px] font-bold tracking-widest text-[#5A725A]/70 uppercase relative z-10 mb-1">Monthly Gross Salary</p>
              <h3 className="text-3xl font-black text-gray-800 relative z-10">{formatCurrency(companyTotals.gross)}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500"></div>
              <p className="text-[11px] font-bold tracking-widest text-rose-500/70 uppercase relative z-10 mb-1">Total Deductions</p>
              <h3 className="text-3xl font-black text-rose-600 relative z-10">{formatCurrency(companyTotals.ded)}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500"></div>
              <p className="text-[11px] font-bold tracking-widest text-emerald-600/70 uppercase relative z-10 mb-1">Net Take-Home</p>
              <h3 className="text-3xl font-black text-emerald-700 relative z-10">{formatCurrency(companyTotals.net)}</h3>
            </div>
            <div className="bg-[#657d65] p-6 rounded-2xl shadow-sm border border-[#566c56] flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500"></div>
              <p className="text-[11px] font-bold tracking-widest text-white/80 uppercase relative z-10 mb-1">Total Annual CTC</p>
              <h3 className="text-3xl font-black text-white relative z-10">{formatCurrency(companyTotals.ctc)}</h3>
            </div>
          </div>

          {/* Employee Directory Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-200/50 flex items-center justify-center text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="font-bold text-gray-800 text-lg">All Employees Directory</h3>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0 justify-end">
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, ID or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5A725A]/20 focus:border-[#5A725A] bg-white transition-all shadow-sm"
                  />
                </div>
                <span className="text-xs font-bold bg-gray-200 text-gray-700 py-1.5 px-3 rounded-full shrink-0">
                  {Object.values(employees).filter(emp => {
                    const id = emp.empId || emp.personal?.employeeId || '';
                    const name = emp.name || `${emp.personal?.firstName || ''} ${emp.personal?.lastName || ''}`;
                    const dept = emp.department || emp.employment?.department || '';
                    const q = searchQuery.toLowerCase();
                    return name.toLowerCase().includes(q) || id.toLowerCase().includes(q) || dept.toLowerCase().includes(q);
                  }).length} Members
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">#</th>
                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Employee ID</th>
                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Department</th>
                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Monthly Gross</th>
                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Deductions</th>
                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Net Take-Home</th>
                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Annual CTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {Object.values(employees).filter(emp => {
                    const id = emp.empId || emp.personal?.employeeId || '';
                    const name = emp.name || `${emp.personal?.firstName || ''} ${emp.personal?.lastName || ''}`;
                    const dept = emp.department || emp.employment?.department || '';
                    const q = searchQuery.toLowerCase();
                    return name.toLowerCase().includes(q) || id.toLowerCase().includes(q) || dept.toLowerCase().includes(q);
                  }).map((emp, index) => {
                    const hasPayroll = emp.payroll && emp.payroll.totals;
                    const empId = emp.empId || emp.personal?.employeeId || 'N/A';
                    return (
                      <tr key={empId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 text-sm text-gray-500 font-medium">{index + 1}</td>
                        <td className="py-4 px-6">
                          <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded-md">{empId}</span>
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-[#5A725A] hover:text-[#4a5f4a] cursor-pointer" onClick={() => handleViewDetails(empId)}>
                          <span className="hover:underline">{emp.name || `${emp.personal?.firstName} ${emp.personal?.lastName}`}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            {emp.department || emp.employment?.department || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-gray-700 text-right">
                          {hasPayroll ? formatCurrency(emp.payroll.totals.grossSalary) : '-'}
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-rose-600 text-right">
                          {hasPayroll ? formatCurrency(emp.payroll.totals.totalDeductions) : '-'}
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-emerald-600 text-right">
                          {hasPayroll ? formatCurrency(emp.payroll.totals.netTakeHome) : '-'}
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-gray-800 text-right">
                          {hasPayroll ? formatCurrency(emp.payroll.totals.totalCTC) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                  {Object.keys(employees).length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-10 text-center text-sm text-gray-500">No employees found. Please register employees first.</td>
                    </tr>
                  ) : Object.values(employees).filter(emp => {
                    const id = emp.empId || emp.personal?.employeeId || '';
                    const name = emp.name || `${emp.personal?.firstName || ''} ${emp.personal?.lastName || ''}`;
                    const dept = emp.department || emp.employment?.department || '';
                    const q = searchQuery.toLowerCase();
                    return name.toLowerCase().includes(q) || id.toLowerCase().includes(q) || dept.toLowerCase().includes(q);
                  }).length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-10 text-center text-sm text-gray-500">No matching employees found for your search.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : viewMode === 'view_details' ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setViewMode('overview')}
              className="text-gray-500 hover:text-gray-800 font-bold text-sm flex items-center gap-2 transition-colors inline-block w-fit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Directory
            </button>

            <div className="flex items-center gap-4">
              <div className="relative w-full sm:w-64 hidden">
              </div>

              <button
                onClick={() => setViewMode(viewMode === 'view_details' ? 'view_details_manage' : 'view_details')}
                disabled={!selectedEmpId}
                className={`font-bold py-2.5 px-5 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${viewMode === 'view_details_manage' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-[#5A725A] text-white hover:bg-[#4a5f4a]'}`}
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
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#5A725A] text-white flex items-center justify-center rounded-2xl shadow-lg text-2xl font-bold uppercase overflow-hidden">
                {employees[selectedEmpId]?.documents?.["Passport Size Photos"]?.previewUrl ? (
                  <img src={employees[selectedEmpId].documents["Passport Size Photos"].previewUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  (employees[selectedEmpId]?.name || employees[selectedEmpId]?.personal?.firstName || 'E')[0]
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{employees[selectedEmpId]?.name || `${employees[selectedEmpId]?.personal?.firstName} ${employees[selectedEmpId]?.personal?.lastName}`}</h2>
                <p className="text-gray-500 font-medium mt-1">{employees[selectedEmpId]?.department || employees[selectedEmpId]?.employment?.department || 'N/A'} • ID: {selectedEmpId}</p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 flex items-center gap-6">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-[#5A725A]/70 uppercase">Net Take-Home</p>
                <p className="text-xl font-black text-gray-800">{formatCurrency(totals.netTakeHome)}</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div>
                <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Annual CTC</p>
                <p className="text-xl font-black text-gray-800">{formatCurrency(totals.totalCTC)}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {/* Earnings */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="bg-emerald-50/50 border-b border-gray-100 p-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Fixed Earnings</h3>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Gross Salary Components</p>
                </div>
              </div>
              <div className="p-5 space-y-4 flex-1">
                {EARNINGS_FIELDS.filter(f => f.isCommon || addedOptionalFields.includes(f.key)).map(item => (
                  <div key={item.key} className="flex items-center justify-between gap-4 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <label className="text-sm font-semibold text-gray-600 flex-1 truncate" title={item.label}>{item.label}</label>
                    <div className="text-right">
                      <span className="text-gray-800 font-bold">{formatCurrency(earnings[item.key] || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-50/30 p-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-600">Total Earnings</span>
                <span className="text-emerald-700 font-black">{formatCurrency(totals.grossSalary)}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="bg-rose-50/50 border-b border-gray-100 p-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Employee Deductions</h3>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Subtracted from Gross</p>
                </div>
              </div>
              <div className="p-5 space-y-4 flex-1">
                {DEDUCTIONS_FIELDS.filter(f => f.isCommon || addedOptionalFields.includes(f.key)).map(item => (
                  <div key={item.key} className="flex items-center justify-between gap-4 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <label className="text-sm font-semibold text-gray-600 flex-1 truncate" title={item.label}>{item.label}</label>
                    <div className="text-right">
                      <span className="text-rose-600 font-bold">{formatCurrency(deductions[item.key] || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-rose-50/30 p-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-600">Total Deductions</span>
                <span className="text-rose-700 font-black">{formatCurrency(totals.totalDeductions)}</span>
              </div>
            </div>

            {/* Employer */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="bg-indigo-50/50 border-b border-gray-100 p-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Employer Contributions</h3>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Part of CTC</p>
                </div>
              </div>
              <div className="p-5 space-y-4 flex-1">
                {EMPLOYER_CONT_FIELDS.filter(f => f.isCommon || addedOptionalFields.includes(f.key)).map(item => (
                  <div key={item.key} className="flex items-center justify-between gap-4 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <label className="text-sm font-semibold text-gray-600 flex-1 truncate" title={item.label}>{item.label}</label>
                    <div className="text-right">
                      <span className="text-indigo-600 font-bold">{formatCurrency(employerCont[item.key] || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : viewMode === 'view_details_manage' ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setViewMode('overview')}
              className="text-gray-500 hover:text-gray-800 font-bold text-sm flex items-center gap-2 transition-colors inline-block w-fit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Directory
            </button>

            <div className="flex items-center gap-4">
              <div className="relative w-full sm:w-64 hidden">
              </div>

              <button
                onClick={() => setViewMode('view_details')}
                disabled={!selectedEmpId}
                className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold py-2.5 px-5 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Cancel Edit
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 opacity-75">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#5A725A] text-white flex items-center justify-center rounded-2xl shadow-lg text-2xl font-bold uppercase overflow-hidden">
                {employees[selectedEmpId]?.documents?.["Passport Size Photos"]?.previewUrl ? (
                  <img src={employees[selectedEmpId].documents["Passport Size Photos"].previewUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  (employees[selectedEmpId]?.name || employees[selectedEmpId]?.personal?.firstName || 'E')[0]
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{employees[selectedEmpId]?.name || `${employees[selectedEmpId]?.personal?.firstName} ${employees[selectedEmpId]?.personal?.lastName}`}</h2>
                <p className="text-gray-500 font-medium mt-1">{employees[selectedEmpId]?.department || employees[selectedEmpId]?.employment?.department || 'N/A'} • ID: {selectedEmpId} <span className="text-amber-600 font-bold ml-2">(EDIT MODE)</span></p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 flex items-center gap-6">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-[#5A725A]/70 uppercase">Net Take-Home</p>
                <p className="text-xl font-black text-gray-800">{formatCurrency(totals.netTakeHome)}</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div>
                <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Annual CTC</p>
                <p className="text-xl font-black text-gray-800">{formatCurrency(totals.totalCTC)}</p>
              </div>
            </div>
          </div>

          {/* Setup Simulator for inline editing */}
          <div className="bg-amber-50 rounded-3xl p-6 shadow-sm border border-amber-200 flex flex-col md:flex-row items-center gap-6 justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-amber-900">Auto-Calculate Structure</h3>
              <p className="text-sm text-amber-700/80 font-medium">Enter a Target Annual CTC to auto-fill standard Indian statutory percentages.</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input
                  type="number"
                  value={targetCTC}
                  onChange={(e) => setTargetCTC(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-white border border-amber-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm"
                />
              </div>
              <button
                onClick={() => calculateStructure(targetCTC)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shrink-0"
              >
                Generate
              </button>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-6 items-start">
            {/* Inline editing cards container */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* Earnings - Editable */}
                <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="bg-emerald-50/50 border-b border-gray-100 p-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Fixed Earnings</h3>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Edit Components</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-4 flex-1">
                    {EARNINGS_FIELDS.filter(f => f.isCommon || addedOptionalFields.includes(f.key)).map(item => (
                      <div key={item.key} className="flex items-center justify-between gap-4">
                        <label className="text-sm font-semibold text-gray-700 flex-1 truncate">{item.label}</label>
                        <div className="relative w-1/3 min-w-[120px]">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                          <input
                            type="number"
                            value={earnings[item.key] || ''}
                            onChange={(e) => handleEarningsChange(item.key, e.target.value)}
                            className="w-full pl-6 pr-3 py-2 bg-emerald-50/30 border border-emerald-200/50 rounded-lg text-sm font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-right transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deductions - Editable */}
                <div className="bg-white rounded-3xl border-2 border-rose-100 shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="bg-rose-50/50 border-b border-gray-100 p-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Employee Deductions</h3>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Edit Components</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-4 flex-1">
                    {DEDUCTIONS_FIELDS.filter(f => f.isCommon || addedOptionalFields.includes(f.key)).map(item => (
                      <div key={item.key} className="flex items-center justify-between gap-4">
                        <label className="text-sm font-semibold text-gray-700 flex-1 truncate">{item.label}</label>
                        <div className="relative w-1/3 min-w-[120px]">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 text-xs font-bold">₹</span>
                          <input
                            type="number"
                            value={deductions[item.key] || ''}
                            onChange={(e) => handleDeductionsChange(item.key, e.target.value)}
                            className="w-full pl-6 pr-3 py-2 bg-rose-50/30 border border-rose-200/50 rounded-lg text-sm font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-right transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Employer Contributions - Editable */}
                <div className="bg-white rounded-3xl border-2 border-indigo-100 shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="bg-indigo-50/50 border-b border-gray-100 p-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Employer Contributions</h3>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Edit Components</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-4 flex-1">
                    {EMPLOYER_CONT_FIELDS.filter(f => f.isCommon || addedOptionalFields.includes(f.key)).map(item => (
                      <div key={item.key} className="flex items-center justify-between gap-4">
                        <label className="text-sm font-semibold text-gray-700 flex-1 truncate">{item.label}</label>
                        <div className="relative w-1/3 min-w-[120px]">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 text-xs font-bold">₹</span>
                          <input
                            type="number"
                            value={employerCont[item.key] || ''}
                            onChange={(e) => handleEmployerContChange(item.key, e.target.value)}
                            className="w-full pl-6 pr-3 py-2 bg-indigo-50/30 border border-indigo-200/50 rounded-lg text-sm font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-right transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button Row for inline edit */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex justify-end gap-3">
                <button
                  onClick={() => setViewMode('view_details')}
                  className="bg-white border text-gray-600 font-bold py-3 px-6 rounded-xl transition-all shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSaveStructure();
                    setViewMode('view_details');
                  }}
                  disabled={!selectedEmpId}
                  className={`font-bold py-3 px-8 rounded-xl transition-all shadow-md ${selectedEmpId ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Optional Fields Sidebar (Only visible in edit mode) */}
            <div className="w-full xl:w-72 shrink-0 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 sticky top-6">
              <h3 className="font-bold text-gray-800 text-lg mb-1">Add Subtopics</h3>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-6">Click to toggle optional fields</p>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-black tracking-widest text-emerald-600 mb-3 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    EARNINGS
                  </h4>
                  <div className="flex flex-col gap-2">
                    {EARNINGS_FIELDS.filter(f => !f.isCommon).map(item => (
                      <button
                        key={item.key}
                        onClick={() => toggleOptionalField(item.key)}
                        className={`text-[13px] font-bold px-4 py-2.5 rounded-xl border transition-all text-left flex items-center justify-between ${addedOptionalFields.includes(item.key) ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                      >
                        <span className="truncate pr-2">{item.label}</span>
                        <div className={`w-5 h-5 rounded shrink-0 flex items-center justify-center border transition-colors ${addedOptionalFields.includes(item.key) ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                          {addedOptionalFields.includes(item.key) ? <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                <div>
                  <h4 className="text-[11px] font-black tracking-widest text-rose-600 mb-3 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    DEDUCTIONS
                  </h4>
                  <div className="flex flex-col gap-2">
                    {DEDUCTIONS_FIELDS.filter(f => !f.isCommon).map(item => (
                      <button
                        key={item.key}
                        onClick={() => toggleOptionalField(item.key)}
                        className={`text-[13px] font-bold px-4 py-2.5 rounded-xl border transition-all text-left flex items-center justify-between ${addedOptionalFields.includes(item.key) ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                      >
                        <span className="truncate pr-2">{item.label}</span>
                        <div className={`w-5 h-5 rounded shrink-0 flex items-center justify-center border transition-colors ${addedOptionalFields.includes(item.key) ? 'bg-rose-500 border-rose-600 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                          {addedOptionalFields.includes(item.key) ? <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                <div>
                  <h4 className="text-[11px] font-black tracking-widest text-indigo-600 mb-3 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    EMPLOYER CONT.
                  </h4>
                  <div className="flex flex-col gap-2">
                    {EMPLOYER_CONT_FIELDS.filter(f => !f.isCommon).map(item => (
                      <button
                        key={item.key}
                        onClick={() => toggleOptionalField(item.key)}
                        className={`text-[13px] font-bold px-4 py-2.5 rounded-xl border transition-all text-left flex items-center justify-between ${addedOptionalFields.includes(item.key) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                      >
                        <span className="truncate pr-2">{item.label}</span>
                        <div className={`w-5 h-5 rounded shrink-0 flex items-center justify-center border transition-colors ${addedOptionalFields.includes(item.key) ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                          {addedOptionalFields.includes(item.key) ? <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-4">
            <button
              onClick={() => setViewMode('overview')}
              className="text-gray-500 hover:text-gray-800 font-bold text-sm flex items-center gap-2 transition-colors inline-block"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Overview
            </button>
          </div>

          {/* Page Header */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5A725A]/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            <div className="flex items-center gap-6 relative">
              <div className="w-16 h-16 bg-[#5A725A] text-white flex items-center justify-center rounded-2xl shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Payroll Management</h2>
                <p className="text-gray-500 font-medium mt-1">Configure complex salary structures and compliance tracking.</p>
              </div>
            </div>

            <div className="flex bg-gray-100/80 p-1.5 rounded-xl border border-gray-200/50 shadow-inner">
              <button
                onClick={() => setActiveTab('structure')}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'structure' ? 'bg-white text-[#5A725A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Salary Structure
              </button>
              <button
                onClick={() => setActiveTab('payslips')}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'payslips' ? 'bg-white text-[#5A725A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Monthly Payslips
              </button>
            </div>
          </div>

          {/* Employee Selector */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Select Employee for Payroll Configuration</label>
            <div className="relative max-w-md">
              <select
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-[#5A725A] focus:ring-2 focus:ring-[#5A725A]/20 transition-all font-semibold"
                value={selectedEmpId}
                onChange={handleEmployeeChange}
              >
                <option value="">-- Choose Employee --</option>
                {Object.values(employees).map(emp => (
                  <option key={emp.empId || emp.personal?.employeeId} value={emp.empId || emp.personal?.employeeId}>
                    {emp.name || `${emp.personal?.firstName} ${emp.personal?.lastName}`} - {emp.department || emp.employment?.department}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
            {!selectedEmpId && (
              <p className="mt-2 text-sm text-amber-600 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Please select an employee to assign or configure their payroll structure.
              </p>
            )}
          </div>

          {activeTab === 'structure' && (
            <div className="space-y-6">

              {/* Top Summary Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-green-100 flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                  <p className="text-xs font-bold tracking-widest text-[#5A725A]/70 uppercase relative z-10 mb-1">Monthly Gross Salary</p>
                  <h3 className="text-3xl font-black text-gray-800 relative z-10">{formatCurrency(totals.grossSalary)}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                  <p className="text-xs font-bold tracking-widest text-rose-500/70 uppercase relative z-10 mb-1">Total Deductions</p>
                  <h3 className="text-3xl font-black text-rose-600 relative z-10">{formatCurrency(totals.totalDeductions)}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex flex-col justify-center relative overflow-hidden group bg-gradient-to-br from-emerald-50/50 to-white">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100/50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                  <p className="text-xs font-bold tracking-widest text-emerald-600/70 uppercase relative z-10 mb-1">Net Take-Home</p>
                  <h3 className="text-3xl font-black text-emerald-700 relative z-10">{formatCurrency(totals.netTakeHome)}</h3>
                </div>
                <div className="bg-[#5A725A] p-6 rounded-3xl shadow-lg border border-[#4a5f4a] flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                  <p className="text-xs font-bold tracking-widest text-white/70 uppercase relative z-10 mb-1">Total Annual CTC</p>
                  <h3 className="text-3xl font-black text-white relative z-10">{formatCurrency(totals.totalCTC)}</h3>
                </div>
              </div>

              {/* Setup Simulator */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Auto-Calculate Structure</h3>
                  <p className="text-sm text-gray-500 font-medium">Enter a Target Annual CTC to auto-fill standard Indian statutory percentages.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={targetCTC}
                      onChange={(e) => setTargetCTC(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5A725A]/20 focus:border-[#5A725A]"
                    />
                  </div>
                  <button
                    onClick={() => calculateStructure(targetCTC)}
                    className="bg-[#5A725A] hover:bg-[#4a5f4a] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shrink-0"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row gap-6 items-start">

                {/* Main Cards Area */}
                <div className="flex-1 space-y-6">

                  {/* Components Container (3 Columns) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-6">

                    {/* Earnings - Green Accent */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                      <div className="bg-emerald-50/50 border-b border-gray-100 p-5 flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">Fixed Earnings</h3>
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Gross Salary Components</p>
                        </div>
                      </div>
                      <div className="p-5 space-y-4 flex-1">
                        {EARNINGS_FIELDS.filter(f => f.isCommon || addedOptionalFields.includes(f.key)).map(item => (
                          <div key={item.key} className="flex items-center justify-between gap-4">
                            <label className="text-sm font-semibold text-gray-700 flex-1 truncate" title={item.label}>{item.label}</label>
                            <div className="relative w-1/3 min-w-[120px]">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                              <input
                                type="number"
                                value={earnings[item.key] || ''}
                                onChange={(e) => handleEarningsChange(item.key, e.target.value)}
                                className="w-full pl-6 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 text-right transition-colors"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deductions - Rose Accent */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                      <div className="bg-rose-50/50 border-b border-gray-100 p-5 flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">Employee Deductions</h3>
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Subtracted from Gross</p>
                        </div>
                      </div>
                      <div className="p-5 space-y-4 flex-1">
                        {DEDUCTIONS_FIELDS.filter(f => f.isCommon || addedOptionalFields.includes(f.key)).map(item => (
                          <div key={item.key} className="flex items-center justify-between gap-4">
                            <label className="text-sm font-semibold text-gray-700 flex-1 truncate" title={item.label}>{item.label}</label>
                            <div className="relative w-1/3 min-w-[120px]">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 text-xs font-bold">₹</span>
                              <input
                                type="number"
                                value={deductions[item.key] || ''}
                                onChange={(e) => handleDeductionsChange(item.key, e.target.value)}
                                className="w-full pl-6 pr-3 py-2 bg-gray-50 border border-gray-200/80 rounded-lg text-sm font-bold text-rose-700/80 focus:outline-none focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500 text-right transition-colors"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Employer Contributions - Blue Accent */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                      <div className="bg-indigo-50/50 border-b border-gray-100 p-5 flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">Employer Contributions</h3>
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Part of CTC</p>
                        </div>
                      </div>
                      <div className="p-5 space-y-4 flex-1">
                        {EMPLOYER_CONT_FIELDS.filter(f => f.isCommon || addedOptionalFields.includes(f.key)).map(item => (
                          <div key={item.key} className="flex items-center justify-between gap-4">
                            <label className="text-sm font-semibold text-gray-700 flex-1 truncate" title={item.label}>{item.label}</label>
                            <div className="relative w-1/3 min-w-[120px]">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 text-xs font-bold">₹</span>
                              <input
                                type="number"
                                value={employerCont[item.key] || ''}
                                onChange={(e) => handleEmployerContChange(item.key, e.target.value)}
                                className="w-full pl-6 pr-3 py-2 bg-gray-50 border border-gray-200/80 rounded-lg text-sm font-bold text-indigo-700/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 text-right transition-colors"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Save Button Row (Full Width under components) */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex justify-end">
                    <button
                      onClick={handleSaveStructure}
                      disabled={!selectedEmpId}
                      className={`font-bold py-3 px-8 rounded-xl transition-all shadow-md w-full sm:w-auto ${selectedEmpId ? 'bg-[#5A725A] hover:bg-[#4a5f4a] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                      Save Structure to Profile
                    </button>
                  </div>

                </div>

                {/* Optional Fields Sidebar (Now spans full height naturally alongside flexible container) */}
                <div className="w-full xl:w-72 shrink-0 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 sticky top-6">
                  <h3 className="font-bold text-gray-800 text-lg mb-1">Add Subtopics</h3>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-6">Click to toggle optional fields</p>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[11px] font-black tracking-widest text-emerald-600 mb-3 uppercase flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        EARNINGS
                      </h4>
                      <div className="flex flex-col gap-2">
                        {EARNINGS_FIELDS.filter(f => !f.isCommon).map(item => (
                          <button
                            key={item.key}
                            onClick={() => toggleOptionalField(item.key)}
                            className={`text-[13px] font-bold px-4 py-2.5 rounded-xl border transition-all text-left flex items-center justify-between ${addedOptionalFields.includes(item.key) ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                          >
                            <span className="truncate pr-2">{item.label}</span>
                            <div className={`w-5 h-5 rounded shrink-0 flex items-center justify-center border transition-colors ${addedOptionalFields.includes(item.key) ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                              {addedOptionalFields.includes(item.key) ? <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="w-full h-px bg-gray-100"></div>

                    <div>
                      <h4 className="text-[11px] font-black tracking-widest text-rose-600 mb-3 uppercase flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        DEDUCTIONS
                      </h4>
                      <div className="flex flex-col gap-2">
                        {DEDUCTIONS_FIELDS.filter(f => !f.isCommon).map(item => (
                          <button
                            key={item.key}
                            onClick={() => toggleOptionalField(item.key)}
                            className={`text-[13px] font-bold px-4 py-2.5 rounded-xl border transition-all text-left flex items-center justify-between ${addedOptionalFields.includes(item.key) ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                          >
                            <span className="truncate pr-2">{item.label}</span>
                            <div className={`w-5 h-5 rounded shrink-0 flex items-center justify-center border transition-colors ${addedOptionalFields.includes(item.key) ? 'bg-rose-500 border-rose-600 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                              {addedOptionalFields.includes(item.key) ? <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="w-full h-px bg-gray-100"></div>

                    <div>
                      <h4 className="text-[11px] font-black tracking-widest text-indigo-600 mb-3 uppercase flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        EMPLOYER CONT.
                      </h4>
                      <div className="flex flex-col gap-2">
                        {EMPLOYER_CONT_FIELDS.filter(f => !f.isCommon).map(item => (
                          <button
                            key={item.key}
                            onClick={() => toggleOptionalField(item.key)}
                            className={`text-[13px] font-bold px-4 py-2.5 rounded-xl border transition-all text-left flex items-center justify-between ${addedOptionalFields.includes(item.key) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                          >
                            <span className="truncate pr-2">{item.label}</span>
                            <div className={`w-5 h-5 rounded shrink-0 flex items-center justify-center border transition-colors ${addedOptionalFields.includes(item.key) ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                              {addedOptionalFields.includes(item.key) ? <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'payslips' && (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Monthly Payslips Setup Module</h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">This module will allow HR to generate, review, and lock monthly payslips based on the configured salary structure and attendance inputs.</p>
            </div>
          )}
        </>
      )}

    </div>
  )
}

export default Payroll
