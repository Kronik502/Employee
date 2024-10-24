import React from 'react';

function TextBox({ formData, handleChange, handleFileChange, handleSubmit, handleCancelEdit, editingIndex }) {
  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-group">
        <label htmlFor="photo">Upload Photo</label>
        <input
          type="file"
          id="photo"
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>

      <div className="form-group">
        <label htmlFor="name">Full Names</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Type Full Names..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Type Email..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Type Phone Number..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="position">Position</label>
        <input
          type="text"
          id="position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          placeholder="Type Position..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="id">ID Number</label>
        <input
          type="text"
          id="id"
          name="id"
          value={formData.id}
          onChange={handleChange}
          placeholder="Type ID..."
        />
      </div>

      {editingIndex !== -1 && (
        <div className="edit-actions">
          <button type="button" className="cancel-edit-button" onClick={handleCancelEdit}>Cancel</button>
          <button type="submit" className="submit-button">Save Changes</button>
        </div>
      )}

      {editingIndex === -1 && (
        <button type="submit" className="submit-button">Add Employee</button>
      )}
    </form>
  );
}

export default TextBox;
