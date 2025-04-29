import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import Input from "../components/custom/Input";
import { showToast } from "../utils/toast";
import { updateUser } from "../redux/slices/authSlice";
import { useAppDispatch } from "../customHooks/hooks";
import Select from "../components/custom/Select";
import { ImageUpload } from "../components/custom/ImageUpload";

const UpdateUser = () => {
  const dispatch = useAppDispatch();

  const { currentUser, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    gender: "",
    profileImage: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (base64String: string) => {
    setPreviewUrl(base64String);
    setForm({ ...form, profileImage: base64String });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = {
        password: form.password,
        gender: form.gender,
        profileImage: form.profileImage,
      };
      await dispatch(updateUser({ email: form.email, userData })).unwrap();
      showToast("User updated successfully", "success");
    } catch (err) {
      const errorMessage = typeof err === "string" ? err : "Update failed";
      showToast(errorMessage, "error");
    }
  };

  useEffect(() => {
    if (currentUser) {
      setForm({
        email: currentUser.email,
        password: "",
        name: currentUser.name,
        gender: currentUser.gender || "",
        profileImage: currentUser.profileImage || "",
      });
      if (currentUser.profileImage) {
        setPreviewUrl(currentUser.profileImage);
      }
    }
  }, [currentUser]);

  return (
    <form
      onSubmit={handleUpdate}
      className="p-4 max-w-md mx-auto mt-24 mb-12 
      bg-white shadow rounded space-y-4"
    >
      <h2 className="text-xl font-bold">Update User</h2>
      <div className="space-y-2">
        <label
          className="block text-sm font-medium 
        text-gray-700"
        >
          Profile Image
        </label>
        <ImageUpload
          onUploadComplete={handleImageUpload}
          accept="image/jpeg,image/png"
          maxSize={2 * 1024 * 1024} // 2MB
        />
        {previewUrl && (
          <div className="mt-2">
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-20 h-20 rounded-full 
              object-cover"
            />
          </div>
        )}
      </div>
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
      <Select
        label="Gender"
        name="gender"
        value={form.gender}
        onChange={handleChange}
        required
        options={[
          { value: "", label: "Select Gender" },
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" },
        ]}
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
