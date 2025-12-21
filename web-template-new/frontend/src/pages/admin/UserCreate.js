import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/UserCreate.css";

export default function UserCreate() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [monitorType, setMonitorType] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("");
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const resetFields = () => {
    setEmail("");
    setName("");
    setPassword("");
    setPhoneNumber("");
    setMonitorType("");
    setSubscriptionType("");
  }
  
  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("/api/users", { email, name, password, phoneNumber, monitorType, subscriptionType});

      setError("success");
      setStatusMsg("User created successfully");

      resetFields();
    } catch (err) {
      setError("error");
      setStatusMsg("Failed to create user", err.json);
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

        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <input
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />

        <input
          placeholder="Monitor Type"
          value={monitorType}
          onChange={(e) => setMonitorType(e.target.value)}
        />

        <input
          placeholder="Subscription Type"
          value={subscriptionType}
          onChange={(e) => setSubscriptionType(e.target.value)}
        />

        <button type="submit">Create</button>

        {error && <p className={`submit-msg ${error}`}>{statusMsg}</p>}
      </form>
    </div>
  );
}
