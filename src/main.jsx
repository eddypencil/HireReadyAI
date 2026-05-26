import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./context/userContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { ApplicationProvider } from "./context/applicationContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <ApplicationProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      </ApplicationProvider>
    </UserProvider>
  </StrictMode>,
);
