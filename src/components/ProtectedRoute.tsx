import { JSX } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const auth = sessionStorage.getItem("auth");

  const parsedAuth = auth ? JSON.parse(auth) : null;

  if (!parsedAuth?.token || !parsedAuth?.currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
