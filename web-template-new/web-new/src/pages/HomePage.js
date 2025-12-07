import React from "react";
import "../styles/templatemo-graph-page.css";

import Navbar from "../components/Navbar";
import Hero from "../components/hero/Hero";
import Dashboard from "../components/dashboard/Dashboard";
import Analytics from "../components/analytics/Analytics";
import Reports from "../components/Reports";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export default function HomePage() {
    const userName = "Ribal";
    
    return (
        <>
            <Navbar />
            <Hero userName={userName} />
            <Dashboard />
            <Analytics />
            <Reports />
            <Contact />
            <Footer />
        </>
    );
}