import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/UserCreate.css";

export default function UserCreate() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("/api/users", { name, email, role });
      navigate("/admin/users");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className="create-user-page">
      <h1>Create User</h1>

      <form className="create-user-form" onSubmit={submit}>
        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="customer">Customer</option>
          <option value="viewer">Viewer</option>
        </select>

        <button type="submit">Create</button>

        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
}
