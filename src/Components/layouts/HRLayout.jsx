import { Outlet } from "react-router-dom"
import HRSidebar from "../HRSidebar"
import HRTopbar from "../HRTopbar"


function HRLayout() {
  return (
    <div className="flex h-screen bg-transparent">

      {/* Sidebar */}
      <HRSidebar />

      {/* Right Side */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <HRTopbar />

        {/* Page Content */}
        <div className="p-6 overflow-y-auto">
          <Outlet />
        </div>

      </div>
    </div>
  )
}

export default HRLayout
