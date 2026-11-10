import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = Cookies.get("auth_user");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
