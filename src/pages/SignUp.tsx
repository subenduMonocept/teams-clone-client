import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { clearError, signup } from "../redux/slices/authSlice";
import Input from "../components/custom/Input";
import { showToast } from "../utils/toast";
import { NavLink, useNavigate } from "react-router-dom";

const SignUp = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(signup(form)).unwrap();
      showToast("SignUp successful", "success");
      dispatch(clearError());
      navigate("/login");
    } catch (err) {
      const errorMessage = typeof err === "string" ? err : "Signup failed";
      showToast(errorMessage, "error");
    }
  };

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <div
      className="flex justify-center items-center min-h-screen 
    bg-gray-100"
    >
      <form
        onSubmit={handleSignUp}
        className="w-full max-w-md bg-white rounded 
        shadow-md p-6"
      >
        <h2 className="text-xl font-bold text-center">Sign Up</h2>
        <div className="flex flex-col gap-2">
          <Input
            label="Name"
            name="name"
            type="text"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p
            className="text-red-500 text-sm 
        text-center"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white 
          py-2 rounded mt-2
           hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <p className="text-center mt-4">
          If you already have an account,{" "}
          <NavLink to="/login" className="text-blue-500 hover:underline">
            click here to log in
          </NavLink>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
