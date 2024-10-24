// App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TextBox from './Textbox';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    id: '',
    photo: null
  });

  const [employees, setEmployees] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [submitted, setSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removeIndex, setRemoveIndex] = useState(-1);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:3002/employees');
      setEmployees(response.data);
      setFetchError(null);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setFetchError(error.message || 'Error fetching employees');
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          photo: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.position) {
      alert('Please fill out all required fields.');
      return;
    }

    if (formData.email.indexOf('@') === -1 || formData.email.indexOf('.') === -1) {
      alert('Please enter a valid email address.');
      return;
    }

    if (editingIndex !== -1) {
      const updatedEmployees = [...employees];
      updatedEmployees[editingIndex] = formData;
      setEmployees(updatedEmployees);
      setEditingIndex(-1);
    } else {
      try {
        await axios.post('http://localhost:3002/employees', formData);
        fetchEmployees();
      } catch (error) {
        console.error('Error adding employee:', error);
      }
    }

    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      id: '',
      photo: null
    });
  };

  const handleEdit = (index) => {
    setFormData(employees[index]);
    setEditingIndex(index);
    setSubmitted(false);
  };

  const handleRemove = (index) => {
    setConfirmRemove(true);
    setRemoveIndex(index);
  };

  const confirmRemoveEmployee = async () => {
    if (removeIndex !== -1) {
      try {
        const employeeId = employees[removeIndex].id;
        await axios.delete(`http://localhost:3002/employees/${employeeId}`);
        const updatedEmployees = employees.filter((_, index) => index !== removeIndex);
        setEmployees(updatedEmployees);
      } catch (error) {
        console.error('Error removing employee:', error);
      } finally {
        setConfirmRemove(false);
        setRemoveIndex(-1);
      }
    }
  };

  const cancelRemoveEmployee = () => {
    setConfirmRemove(false);
    setRemoveIndex(-1);
  };

  const handleCancelEdit = () => {
    setEditingIndex(-1);
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      id: '',
      photo: null
    });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    const results = employees.filter(employee =>
      employee.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  };

  const handleViewAllEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:3002/employees');
      setEmployees(response.data);
      setSearchTerm('');
      setSearchResults([]);
      setFetchError(null);
    } catch (error) {
      console.error('Error fetching all employees:', error);
      setFetchError(error.message || 'Error fetching all employees');
    }
  };

  if (submitted) {
    return (
      <div className="success-container">
        <h2>Submitted successfully!</h2>
        {employees.map((employee, index) => (
          <div key={index} className="employee-item">
            {employee.photo && (
              <div className="photo-preview">
                <img src={employee.photo} alt="Uploaded" />
              </div>
            )}
            <p><strong>Names:</strong> {employee.name}</p>
            <p><strong>Email:</strong> {employee.email}</p>
            <p><strong>Phone Number:</strong> {employee.phone}</p>
            <p><strong>Position:</strong> {employee.position}</p>
            <p><strong>ID Number:</strong> {employee.id}</p>
            <div>
              <button className="edit-button" onClick={() => handleEdit(index)}>Edit</button>
    
            </div>
          </div>
        ))}
        <button className="next-button" onClick={() => setSubmitted(false)}>Add Another Employee</button>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Employee Details</h1>
      <TextBox
        formData={formData}
        handleChange={handleChange}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        handleCancelEdit={handleCancelEdit}
        editingIndex={editingIndex}
      />

      <div className="actions-container">
        <button className="view-all-button" onClick={handleViewAllEmployees}>View All Employees</button>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by ID..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button className="search-button" onClick={handleSearch}>Search</button>
        </div>
      </div>

      {fetchError && <p className="error-message">{fetchError}</p>}

      <div className="search-results">
        {searchResults.length > 0 && (
          <div>
            <h2>Search Results</h2>
            {searchResults.map((result, index) => (
              <div key={index} className="employee-item">
                {result.photo && (
                  <div className="photo-preview">
                    <img src={result.photo} alt="Uploaded" />
                  </div>
                )}
                <p><strong>Names:</strong> {result.name}</p>
                <p><strong>Email:</strong> {result.email}</p>
                <p><strong>Phone Number:</strong> {result.phone}</p>
                <p><strong>Position:</strong> {result.position}</p>
                <p><strong>ID Number:</strong> {result.id}</p>
                <div>
                  <button className="edit-button" onClick={() => handleEdit(index)}>Edit</button>
           
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="all-employees">
        <h2>All Employees</h2>
        {employees.map((employee, index) => (
          <div key={index} className="employee-item">
            {employee.photo && (
              <div className="photo-preview">
                <img src={employee.photo} alt="Uploaded" />
              </div>
            )}
            <p><strong>Names:</strong> {employee.name}</p>
            <p><strong>Email:</strong> {employee.email}</p>
            <p><strong>Phone Number:</strong> {employee.phone}</p>
            <p><strong>Position:</strong> {employee.position}</p>
            <p><strong>ID Number:</strong> {employee.id}</p>
            <div>
              <button className="edit-button" onClick={() => handleEdit(index)}>Edit</button>
              <button className="remove-button" onClick={() => handleRemove(index)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      {confirmRemove && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to remove this employee?</h3>
            <div className="modal-buttons">
              <button onClick={confirmRemoveEmployee}>Yes</button>
              <button onClick={cancelRemoveEmployee}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
