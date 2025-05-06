import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import DesignerDashboard from "./pages/DesignerDashboard";
import { useAuth } from "./contexts/AuthContext";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DesignerDashboard />
                </PrivateRoute>
              }
            />
            {/* <Route path="/dashboard" element={<DesignerDashboard />} /> */}
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
