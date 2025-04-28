import { toast } from "react-toastify";

export const showToast = (
  message: string,
  type: "success" | "error" | "info" = "error"
) => {
  if (type === "error") {
    toast.error(message);
  } else if (type === "info") {
    toast.info(message);
  } else {
    toast.success(message);
  }
};
