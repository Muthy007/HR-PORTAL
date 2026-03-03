import { useState, useEffect } from 'react'

import './App.css'
import LoginHR from './Components/LoginHr'

import { Route, Routes } from 'react-router-dom'
import RegisterHR from './Components/RegisterHr'
import HRLayout from './Components/layouts/HRLayout'
import PreJoining from './Components/hr/PreJoining'
import EmployeeManagement from './Components/EmployeeManagement'
import EmployeeProfile from './Components/hr/EmployeeProfile'
import DuringEmployment from './Components/hr/DuringEmployment'
import Payroll from './Components/hr/Payroll'
import HRProfile from './Components/hr/HRProfile'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Clear dummy data from previous local storage saves
    if (!localStorage.getItem('dummy_data_cleared_v1')) {
      localStorage.removeItem('employee_profiles');
      localStorage.removeItem('employee_documents');
      localStorage.setItem('dummy_data_cleared_v1', 'true');
    }
  }, []);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: '#f3f8f3'
      }}
    >
      <Routes>
        <Route path="/" element={<LoginHR />} />
        <Route path="/hr-register" element={<RegisterHR />} />
        <Route path="/hr" element={<HRLayout />}>
          <Route path="prejoining" element={<PreJoining />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="employee/:empId" element={<EmployeeProfile />} />
          <Route path="employment" element={<DuringEmployment />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="profile" element={<HRProfile />} />
        </Route>

      </Routes>

    </div>
  )
}

export default App
