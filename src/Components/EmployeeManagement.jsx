import { useState } from "react"
import { useNavigate } from "react-router-dom"

function EmployeeManagement() {

  const navigate = useNavigate()

  const [employees, setEmployees] = useState([])

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    email: ""
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddEmployee = (e) => {
    e.preventDefault()

    const newEmployee = {
      id: employees.length + 1,
      ...formData
    }

    setEmployees([...employees, newEmployee])

   
    console.log("Newly Registered Employee Details:", JSON.stringify(newEmployee, null, 2))

    setFormData({
      name: "",
      department: "",
      email: ""
    })
  }

  const handleEmployeeClick = (employee) => {
    navigate("/hr/prejoining", { state: employee })
  }

  return (
    <div className="p-6 space-y-6">

      <h2 className="text-2xl font-bold text-[#5A725A]">
        Employee Management
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

     
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-5">

          <h3 className="text-lg font-semibold mb-4">
            Employee List
          </h3>

          <table className="w-full">

            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Email</th>
              </tr>
            </thead>

            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-500 font-medium italic">
                    No employee data available
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr
                    key={emp.id}
                    onClick={() => handleEmployeeClick(emp)}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="p-3 font-medium text-[#5A725A]">
                      {emp.name}
                    </td>
                    <td className="p-3">
                      {emp.department}
                    </td>
                    <td className="p-3 text-gray-600">
                      {emp.email}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>

        </div>

        <div className="bg-white rounded-xl shadow p-5">

          <h3 className="text-lg font-semibold mb-4">
            Add New Employee
          </h3>

          <form onSubmit={handleAddEmployee} className="space-y-4">

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Employee Name"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5A725A]"
            />

            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Department"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5A725A]"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5A725A]"
            />

            <button
              type="submit"
              className="w-full bg-[#5A725A] text-white py-2 rounded-lg hover:bg-[#4a5f4a] transition"
            >
              Add Employee
            </button>

          </form>

        </div>

      </div>

    </div>
  )
}

export default EmployeeManagement
