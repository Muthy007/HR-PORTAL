import { Outlet } from "react-router-dom"
import HRSidebar from "../HRSidebar"
import HRTopbar from "../HRTopbar"


function HRLayout() {
  return (
    <div className="flex h-screen bg-transparent">
      <HRSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <HRTopbar />
        <div className="p-6 overflow-y-auto">
          <Outlet />
        </div>

      </div>
    </div>
  )
}

export default HRLayout
