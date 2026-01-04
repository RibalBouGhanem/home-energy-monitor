import React from "react";

export default function ForgotPassword() {
    return (
        <div className="login-row">
            <button
                type="button"
                className="login-link-button"
                onClick={() => alert("Hook this to your reset flow")}
            >
                Forgot password?
            </button>
        </div>
    );
}