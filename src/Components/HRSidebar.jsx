import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"

function HRSidebar() {

  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const menuClass =
    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"

  const activeClass =
    "bg-white/20 text-white shadow"

  const normalClass =
    "text-gray-300 hover:bg-white/10 hover:text-white"



  const handleMenuClick = () => {
    setIsOpen(false)
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-[22px] left-4 z-[70] text-white hover:text-gray-200 text-3xl hover:bg-white/10 px-2 rounded transition-colors"
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-[rgb(90,114,90)]/90 backdrop-blur-md text-white p-5 flex flex-col
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >

        <h1 className="text-2xl font-bold mb-8 mt-12">
          HR Portal
        </h1>


        <nav className="flex flex-col space-y-1">

          <NavLink
            to="/hr/prejoining"
            onClick={handleMenuClick}
            className={({ isActive }) =>
              `${menuClass} ${isActive ? activeClass : normalClass}`
            }
          >
            Pre-Joining
          </NavLink>

          <div className="mx-2 border-b border-white/20"></div>

          <NavLink
            to="/hr/employment"
            onClick={handleMenuClick}
            className={({ isActive }) =>
              `${menuClass} ${isActive ? activeClass : normalClass}`
            }
          >
            During Employment
          </NavLink>

          <div className="mx-2 border-b border-white/20"></div>

          <NavLink
            to="/hr/payroll"
            onClick={handleMenuClick}
            className={({ isActive }) =>
              `${menuClass} ${isActive ? activeClass : normalClass}`
            }
          >
            Payroll & Compliance
          </NavLink>

          <div className="mx-2 border-b border-white/20"></div>

          <NavLink
            to="/hr/reports"
            onClick={handleMenuClick}
            className={({ isActive }) =>
              `${menuClass} ${isActive ? activeClass : normalClass}`
            }
          >
            Reports
          </NavLink>

          <div className="mx-2 border-b border-white/20"></div>

          <NavLink
            to="/hr/profile"
            onClick={handleMenuClick}
            className={({ isActive }) =>
              `${menuClass} ${isActive ? activeClass : normalClass}`
            }
          >
            HR Profile
          </NavLink>

        </nav>



      </div>
    </>
  )
}

export default HRSidebar

