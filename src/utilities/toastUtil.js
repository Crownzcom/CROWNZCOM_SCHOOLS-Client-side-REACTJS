import { toast } from "react-toastify";

export const showToast = (message, type = "default") => {
  const options = {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  switch (type) {
    case "error":
      toast.error(message, options);
      break;
    case "success":
      toast.success(message, options);
      break;
    case "info":
      toast.info(message, options);
      break;
    case "warning":
      toast.warn(message, options);
      break;
    default:
      toast(message, options);
  }
};
