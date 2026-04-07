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
import PayrollMaster from './Components/hr/PayrollMaster'
import HRProfile from './Components/hr/HRProfile'

import TravelLayout from './Components/layouts/TravelLayout'
import Department from './Components/Travel/Department'
import NewTravel from './Components/Travel/NewTravel'
import OnBehalf from './Components/Travel/OnBehalf'
import TravelData from './Components/Travel/TravelData'
import Travelexpenses from './Components/Travel/Travelexpenses'
import Localexpenses from './Components/Travel/Localexpenses'
import LocalPurchase from './Components/Travel/LocalPurchase'
import Reportees from './Components/Travel/Reportees'
import Companyexpenses from './Components/Travel/Companyexpenses'
import ProtectedRoute from './Components/ProtectedRoute'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {

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

        <Route element={<ProtectedRoute />}>
          <Route path="/hr" element={<HRLayout />}>
            <Route path="prejoining" element={<PreJoining />} />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="employee/:empId" element={<EmployeeProfile />} />
            <Route path="employment" element={<DuringEmployment />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="payroll-master" element={<PayrollMaster />} />
            <Route path="profile" element={<HRProfile />} />
          </Route>

          <Route path="/travel" element={<TravelLayout />}>
            <Route path="department" element={<Department />} />
            <Route path="new-travel" element={<NewTravel />} />
            <Route path="on-behalf" element={<OnBehalf />} />
            <Route path="travel-data" element={<TravelData />} />
            <Route path="travel-expenses" element={<Travelexpenses />} />
            <Route path="local-expenses" element={<Localexpenses />} />
            <Route path="local-purchase" element={<LocalPurchase />} />
            <Route path="reportees" element={<Reportees />} />
            <Route path="company-expenses" element={<Companyexpenses />} />
          </Route>
        </Route>
      </Routes>

    </div>
  )
}

export default App
