import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PrivateRouter from "./components/PrivateRouter";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRouter>
              <AdminDashboard />
            </PrivateRouter>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
