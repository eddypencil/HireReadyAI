//src\main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./shared/i18n/i18n";
import App from "./App.jsx";
import { UserProvider } from "./features/auth/context/user.context";
import { BrowserRouter } from "react-router-dom";
import { ApplicationProvider } from "./features/applications/context/application.context";
import { ThemeProvider } from "./shared/context/theme";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
    <UserProvider>
      <ApplicationProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApplicationProvider>
    </UserProvider>
    </ThemeProvider>
  </StrictMode>,
);
