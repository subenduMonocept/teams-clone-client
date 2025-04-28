import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import Input from "../components/custom/Input";
import { showToast } from "../utils/toast";
import { updateUser } from "../redux/slices/authSlice";
import { useAppDispatch } from "../customHooks/hooks";

const UpdateUser = () => {
  const dispatch = useAppDispatch();

  const { user, loading } = useSelector((state: RootState) => state.auth);
  const [form, setForm] = useState({ email: "", password: "", name: "" });

  useEffect(() => {
    if (user) {
      setForm({ email: user.email, password: "", name: user.name });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = {
        password: form.password,
      };
      await dispatch(updateUser({ email: form.email, userData })).unwrap();
      showToast("User updated successfully", "success");
    } catch (err) {
      const errorMessage = typeof err === "string" ? err : "Update failed";
      showToast(errorMessage, "error");
    }
  };

  return (
    <form
      onSubmit={handleUpdate}
      className="p-4 max-w-md mx-auto mt-10 bg-white shadow rounded space-y-4"
    >
      <h2 className="text-xl font-bold">Update User</h2>
      <Input
        label="Name"
        name="name"
        type="text"
        value={form.name}
        onChange={handleChange}
        disabled={true}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        disabled={true}
      />
      <Input
        label="New Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        required
      />
      <button
        type="submit"
        className={`w-full py-2 rounded text-white transition 
    ${
      loading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-yellow-500 hover:bg-yellow-600"
    }`}
        disabled={loading}
      >
        {loading ? "Updating..." : "Update"}
      </button>
    </form>
  );
};

export default UpdateUser;
