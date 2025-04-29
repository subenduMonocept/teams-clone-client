import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { getAllUsers, deleteUser } from "../redux/slices/authSlice";
import { useAppDispatch } from "../customHooks/hooks";
import { User } from "../types/auth";
import { showToast } from "../utils/toast";

const DeleteUser = () => {
  const dispatch = useAppDispatch();

  const { users, currentUser: loggedInUser } = useSelector(
    (state: RootState) => state.auth
  );

  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleDelete = async (id: string, email: string) => {
    if (!id) {
      showToast("User ID not found", "error");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;

    setLoadingId(id);
    try {
      await dispatch(deleteUser(email)).unwrap();
      showToast("User deleted successfully", "success");
      dispatch(getAllUsers());
    } catch (err) {
      const errorMessage = typeof err === "string" ? err : "Delete failed";
      showToast(errorMessage, "error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">All Users</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4 border-b">Avatar</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Gender</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((currentUser: User) => {
                const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  currentUser.name || currentUser.email.split("@")[0]
                )}&backgroundColor=ffe082,ffccbc,b3e5fc`;

                return (
                  <tr key={currentUser._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      <img
                        src={currentUser.profileImage || fallbackAvatar}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">{currentUser.name}</td>
                    <td className="py-2 px-4 border-b">{currentUser.email}</td>
                    <td className="py-2 px-4 border-b capitalize">
                      {currentUser.gender || "Not specified"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() =>
                          handleDelete(currentUser._id, currentUser.email)
                        }
                        disabled={
                          currentUser.email === loggedInUser?.email ||
                          loadingId === currentUser._id
                        }
                        className={`px-3 py-1 text-sm rounded ${
                          currentUser.email === loggedInUser?.email
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        } disabled:opacity-50`}
                      >
                        {loadingId === currentUser._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeleteUser;
