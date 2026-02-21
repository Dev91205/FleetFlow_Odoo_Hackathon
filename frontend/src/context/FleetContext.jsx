import { createContext, useContext, useReducer, useEffect, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ───────────────── API FETCH ─────────────────

async function apiFetch(path, options = {}) {

  const token = localStorage.getItem("ff_token");

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "API error");
  }

  return data;

}

// ───────────────── INITIAL STATE ─────────────────

const initialState = {

  currentUser: null,

  vehicles: [],
  drivers: [],
  trips: [],
  maintenanceLogs: [],
  expenses: [],

  alerts: [],

  _loading: true,
  _error: null

};

// ───────────────── REDUCER ─────────────────

function reducer(state, action) {

  switch (action.type) {

    case "LOGIN":
      return {
        ...state,
        currentUser: action.payload,
        _loading: false
      };

    case "LOGOUT":
      return {
        ...initialState,
        _loading: false
      };

    case "SET_ALL":
      return {
        ...state,

        vehicles: action.payload.vehicles || [],
        drivers: action.payload.drivers || [],
        trips: action.payload.trips || [],
        maintenanceLogs: action.payload.maintenanceLogs || [],
        expenses: action.payload.expenses || [],

        alerts: [],

        _loading: false
      };

    case "SET_LOADING":
      return {
        ...state,
        _loading: action.payload
      };

    case "SET_ERROR":
      return {
        ...state,
        _error: action.payload,
        _loading: false
      };

    default:
      return state;

  }

}

// ───────────────── CONTEXT ─────────────────

const FleetContext = createContext(null);

// ───────────────── PROVIDER ─────────────────

export function FleetProvider({ children }) {

  const [state, dispatch] = useReducer(reducer, initialState);

  // Load all system data
  const refreshAll = useCallback(async () => {

    try {

      dispatch({ type: "SET_LOADING", payload: true });

      const [
        vehicles,
        drivers,
        trips,
        maintenanceLogs,
        expenses
      ] = await Promise.all([

        apiFetch("/api/vehicles"),
        apiFetch("/api/drivers"),
        apiFetch("/api/trips"),
        apiFetch("/api/maintenance"),
        apiFetch("/api/expenses")

      ]);

      dispatch({
        type: "SET_ALL",
        payload: {
          vehicles,
          drivers,
          trips,
          maintenanceLogs,
          expenses
        }
      });

    }
    catch (err) {

      console.error("Refresh failed:", err);

      dispatch({
        type: "SET_ERROR",
        payload: err.message
      });

    }

  }, []);

  // Check auth on startup
  useEffect(() => {

    const token = localStorage.getItem("ff_token");
    const user = localStorage.getItem("ff_user");

    if (token && user) {

      dispatch({
        type: "LOGIN",
        payload: JSON.parse(user)
      });

      refreshAll();

    }
    else {

      dispatch({
        type: "SET_LOADING",
        payload: false
      });

    }

  }, [refreshAll]);

  // Login
  const login = async (email, password) => {

    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    localStorage.setItem("ff_token", data.token);
    localStorage.setItem("ff_user", JSON.stringify(data.user));

    dispatch({
      type: "LOGIN",
      payload: data.user
    });

    await refreshAll();

  };

  // Logout
  const logout = () => {

    localStorage.removeItem("ff_token");
    localStorage.removeItem("ff_user");

    dispatch({
      type: "LOGOUT"
    });

  };

  return (
    <FleetContext.Provider
      value={{
        ...state,
        dispatch,
        login,
        logout,
        refreshAll
      }}
    >
      {children}
    </FleetContext.Provider>
  );

}

// ───────────────── HOOK ─────────────────

export function useFleet() {

  const ctx = useContext(FleetContext);

  if (!ctx)
    throw new Error("useFleet must be used inside FleetProvider");

  return ctx;

}

// ───────────────── SELECTORS ─────────────────

export function selectAvailableVehicles(state) {

  if (!state?.vehicles) return [];

  return state.vehicles.filter(
    v => v.status === "Available"
  );

}

export function selectAvailableDrivers(state) {

  if (!state?.drivers) return [];

  return state.drivers.filter(
    d => d.status === "On Duty"
  );

}

export function selectKPIs(state) {

  if (!state?.vehicles) {

    return {
      activeFleet: 0,
      maintenance: 0,
      utilization: 0
    };

  }

  const activeFleet =
    state.vehicles.filter(v => v.status === "On Trip").length;

  const maintenance =
    state.vehicles.filter(v => v.status === "In Shop").length;

  const utilization =
    state.vehicles.length
      ? Math.round((activeFleet / state.vehicles.length) * 100)
      : 0;

  return {
    activeFleet,
    maintenance,
    utilization
  };

}

export function suggestOptimalVehicle(weight, vehicles) {

  if (!vehicles) return [];

  return vehicles
    .filter(v => v.capacity >= weight)
    .sort((a, b) => a.capacity - b.capacity);

}