import React from "react";
import { CafeProvider, useCafe } from "./context/CafeContext";
import { RoleSwitcher } from "./components/common/RoleSwitcher";
import { Header } from "./components/common/Header";
import { CustomerView } from "./components/customer/CustomerView";
import { StaffDashboard } from "./components/staff/StaffDashboard";
import { OwnerDashboard } from "./components/owner/OwnerDashboard";
import { SuperAdminDashboard } from "./components/admin/SuperAdminDashboard";
import { SuperAdminLoginGate } from "./components/admin/SuperAdminLoginGate";

const MainContent: React.FC = () => {
  const { role, currentUser } = useCafe();

  const isSuperAdminAuthed = currentUser?.role === "superadmin";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hide RoleSwitcher when at the SuperAdmin authentication gate */}
      {!(role === "superadmin" && !isSuperAdminAuthed) && <RoleSwitcher />}
      {role === "customer" && <Header />}
      
      <div className="flex-1">
        {role === "customer" && <CustomerView />}
        {role === "staff" && <StaffDashboard />}
        {role === "owner" && <OwnerDashboard />}
        {role === "superadmin" && (
          isSuperAdminAuthed ? <SuperAdminDashboard /> : <SuperAdminLoginGate />
        )}
      </div>
    </div>
  );
};

export function App() {
  return (
    <CafeProvider>
      <MainContent />
    </CafeProvider>
  );
}

export default App;
