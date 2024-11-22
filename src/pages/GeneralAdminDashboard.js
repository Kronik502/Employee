import React from 'react';
import { Link } from 'react-router-dom';  // Import Link to route to /employees
import './General.css';  // Import the external CSS for styling

const GeneralAdminDashboard = () => {
  return (
    <div className="generaladmin-dashboard">
      <h2 className="dashboard-title">Welcome to the General Admin Dashboard</h2>
      
      <div className="dashboard-container">
        {/* Eye-catching button to navigate to Employees */}
        <Link to="/employees">
          <button className="btn-employee">Manage Employees</button>
        </Link>
      </div>
    </div>
  );
};

export default GeneralAdminDashboard;
