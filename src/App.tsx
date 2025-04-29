import { Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import UpdateUser from "./pages/UpdateUser";
import DeleteUser from "./pages/DeleteUser";
import Chat from "./pages/Chat";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import Navbar from "./components/Navbar";

const App = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <>
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/chat" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/chat" replace /> : <Login />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? <Navigate to="/chat" replace /> : <SignUp />
          }
        />
        <Route
          path="/chat"
          element={
            isAuthenticated ? <Chat /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/update"
          element={
            <ProtectedRoute>
              <UpdateUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delete-users"
          element={
            <ProtectedRoute>
              <DeleteUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <div
              className="flex justify-center 
            items-center min-h-screen text-red-700"
            >
              404 Page Not Found!
            </div>
          }
        />
      </Routes>
    </>
  );
};

export default App;
