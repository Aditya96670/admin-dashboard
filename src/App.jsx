import Preview from "../src/components/Preview.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Preview />} />
      </Routes>
    </Router>
  );
};

export default App;
