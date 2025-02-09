import { BrowserRouter as Router, Routes, Route , useLocation} from "react-router-dom";
import { Box } from "@mui/material";
import FindYourLove from "./pages/FindYourLove";
import Sidebar from "./Components/Sidebar";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Matches from "./pages/Matches"; 
import Signup from "./pages/Signup";
import Login from "./pages/Login";

const AppContent = () => {
  const location = useLocation();
  const isFindYourLovePage = location.pathname === "/";
  const isLoginPage = location.pathname === "/login";
  const isSignupPage = location.pathname === "/signup";

  const user = {
    name: "User User",
    profilePicture: "https://via.placeholder.com/150",
  };


  const showSidebar = !isLoginPage && !isSignupPage && !isFindYourLovePage;

  return (
    <Box sx={{ display: "flex" }}>
      {showSidebar && <Sidebar user={user} />}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<FindYourLove />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/login" element={<Login />} /> {/* Add the Login route */}
          <Route path="/signup" element={<Signup />} /> {/* Add the Signup route */}
        </Routes>
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;