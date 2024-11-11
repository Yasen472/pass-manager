import React, { useState } from 'react';
import { FaEdit } from "react-icons/fa";

const EditableField = ({ label, value, onChange, type = "text" }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="profile-field">
      <label>{label}</label>
      <div className="input-icon-container">
        <input
          type={type}
          value={value}
          onChange={onChange}
          readOnly={!isEditing}
          className={isEditing ? "editable-input" : "readonly-input"}
        />
        <FaEdit className="edit-icon" onClick={handleToggleEdit} />
      </div>
    </div>
  );
};

export default EditableField;
