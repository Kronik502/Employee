import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Super.css'

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  // Navigation handlers for various sections
  const handleRoleAssignment = () => {
    navigate('/assign-admin');
  };

  const handleManageUsers = () => {
    navigate('/superadmin/manage-users');
  };

  const handleManageEmployees = () => {
    navigate('/employees');
  };

  const handleViewReports = () => {
    navigate('/superadmin/reports');
  };

  return (
    <div className="superadmin-dashboard">
      <h2 className="dashboard-title">Super Admin Dashboard</h2>

      <div className="dashboard-container">
        {/* Buttons for all Super Admin functionalities */}
        <button onClick={handleRoleAssignment} className="btn-admin">
          Assign Admin Roles
        </button>
      

        <button onClick={handleManageEmployees} className="btn-admin">
          Manage Employees
        </button>

    
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
