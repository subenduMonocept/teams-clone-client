import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { login } from "../redux/slices/authSlice";
import Input from "../components/custom/Input";
import { showToast } from "../utils/toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login(form)).unwrap();
      showToast("Login successful", "success");
      navigate("/");
    } catch (err) {
      const errorMessage =
        typeof err === "string" ? err : "Login failed. Please try again";
      showToast(errorMessage, "error");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded shadow-md p-6"
      >
        <h2 className="text-xl font-bold text-center mb-6">Login</h2>
        <div className="flex flex-col gap-4">
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
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">
            {typeof error === "string"
              ? error
              : "An error occurred during login"}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded mt-4 hover:bg-green-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign up here
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;
