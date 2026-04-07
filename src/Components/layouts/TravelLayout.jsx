import { Outlet } from "react-router-dom";
import Topbar from "../Travel/Topbar";

function TravelLayout() {
  return (
    <div className="flex flex-col h-screen bg-transparent">
      <Topbar />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default TravelLayout;
