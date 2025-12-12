// src/App.jsx
import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import AppRoutes from "./app/AppRoutes";


export default function App() {
  return (
    <>
      <AppRoutes />
    </>
  );
}
