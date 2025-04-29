import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";

const Navbar = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      {isAuthenticated ? (
        <nav className="fixed top-0 right-0 w-full bg-gray-800 py-4 px-6 shadow-md z-50">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  `text-white text-lg font-semibold hover:text-gray-400 ${
                    isActive ? "text-blue-400" : ""
                  }`
                }
              >
                Chat
              </NavLink>
              <NavLink
                to="/update"
                className={({ isActive }) =>
                  `text-white text-lg font-semibold hover:text-gray-400 ${
                    isActive ? "text-blue-400" : ""
                  }`
                }
              >
                Update Profile
              </NavLink>
              <NavLink
                to="/delete-users"
                className={({ isActive }) =>
                  `text-white text-lg font-semibold hover:text-gray-400 ${
                    isActive ? "text-blue-400" : ""
                  }`
                }
              >
                Delete Users
              </NavLink>
            </div>
            <button
              onClick={handleLogout}
              className="text-white text-lg font-semibold hover:text-gray-400"
            >
              Logout
            </button>
          </div>
        </nav>
      ) : (
        <nav className="fixed top-0 right-0 w-full bg-gray-800 py-4 px-6 shadow-md z-50">
          <div className="flex justify-end">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `text-white text-lg font-semibold hover:text-gray-400 ${
                  isActive ? "text-blue-400" : ""
                }`
              }
            >
              Login
            </NavLink>
            <span className="mx-4 text-white">|</span>
            <NavLink
              to="/signup"
              className={({ isActive }) =>
                `text-white text-lg font-semibold hover:text-gray-400 ${
                  isActive ? "text-blue-400" : ""
                }`
              }
            >
              Sign Up
            </NavLink>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;
