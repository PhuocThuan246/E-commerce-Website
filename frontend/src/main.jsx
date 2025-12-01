import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./styles/responsive.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Google
import { GoogleOAuthProvider } from "@react-oauth/google"; 
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="823135247566-2rms5m3delvd16gk7rigbd7vs0f26oe0.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>

    <ToastContainer position="top-right" autoClose={2500} theme="colored" />
  </React.StrictMode>
);
