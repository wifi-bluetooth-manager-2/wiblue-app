import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UserContextProvider } from "./contexts/userContextProvider";
import Account from "./pages/account/Account";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import SavedNetworks from "./pages/savedNetworks/SavedNetworks";
import { Toaster } from "react-hot-toast";
import Stats from "./pages/stats/Stats";
import Settings from "./pages/settings/Settings";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <UserContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<SavedNetworks />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </UserContextProvider>
    <Toaster position={"top-center"} />
  </React.StrictMode>,
);
