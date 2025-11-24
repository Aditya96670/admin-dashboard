import { Navigate } from "react-router-dom";

const PrivateRouter = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRouter;
