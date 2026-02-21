import { Routes, Route, Navigate } from "react-router-dom";

import { useFleet } from "./context/FleetContext";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

import AppLayout from "./AppLayout";

import Dashboard from "./pages/Dashboard";
import VehicleRegistry from "./pages/VehicleRegistry";
import TripDispatcher from "./pages/TripDispatcher";
import MaintenanceLogs from "./pages/MaintenanceLogs";
import ExpenseLogs from "./pages/ExpenseLogs";
import DriverProfiles from "./pages/DriverProfiles";
import Analytics from "./pages/Analytics";
import AlertCenter from "./pages/AlertCenter";

function PublicRoute({ children }) {

  const { currentUser } = useFleet();

  if (currentUser)
    return <Navigate to="/dashboard" />;

  return children;

}

function PrivateRoute({ children }) {

  const { currentUser } = useFleet();

  if (!currentUser)
    return <Navigate to="/auth" />;

  return children;

}

export default function App() {

  return (

    <Routes>

      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />

      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicles" element={<VehicleRegistry />} />
        <Route path="/trips" element={<TripDispatcher />} />
        <Route path="/maintenance" element={<MaintenanceLogs />} />
        <Route path="/expenses" element={<ExpenseLogs />} />
        <Route path="/drivers" element={<DriverProfiles />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/alerts" element={<AlertCenter />} />

      </Route>

    </Routes>

  );

}