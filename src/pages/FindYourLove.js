import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  LinearProgress,
  Paper,
  MenuItem,
  IconButton,
  Avatar,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/system";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import PhotoCamera from "@mui/icons-material/PhotoCamera"; // Icon for upload button
import axios from "axios";
import { Visibility, VisibilityOff } from "@mui/icons-material";

// Valentine-themed styles
const StyledPaper = styled(Paper)({
  padding: "24px",
  borderRadius: "16px",
  textAlign: "center",
  width: "100%",
  maxWidth: "500px",
  margin: "0 auto",
  background: "linear-gradient(180deg, #ffebee, #fff)", // Soft pink gradient
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
});

const ValentineButton = styled(Button)({
  background: "#d32f2f", // Valentine red
  color: "#fff",
  "&:hover": {
    background: "#b71c1c", // Darker red on hover
  },
  marginTop: "16px",
});

export default function FindYourLove() {
  const navigate = useNavigate();
  const [step, setStep] = useState("form");
  const [progress, setProgress] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // State for password
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState(null);
  const [zodiacSign, setZodiacSign] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null); // Store the image file
  const [preview, setPreview] = useState(null); // Store the preview URL
  const [errorMessage, setErrorMessage] = useState(""); // For error messages
  const [showPassword, setShowPassword] = useState(false);

  const zodiacSigns = [
    "♈Aries",
    "♉Taurus",
    "♊Gemini",
    "♋Cancer",
    "♌Leo",
    "♍Virgo",
    "♎ Libra",
    "♏Scorpio",
    "♐Sagittarius",
    "♑Capricorn",
    "♒Aquarius",
    "♓Pisces",
  ];

  // Handle Image Upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0]; // Get the uploaded file
    if (file) {
      setProfilePicture(file);
      const previewUrl = URL.createObjectURL(file); // Generate preview URL
      setPreview(previewUrl);

      // Save the image URL to localStorage
      localStorage.setItem("profilePicture", previewUrl);
    }
  };

  // Password strength function (simple example)
  const calculatePasswordStrength = (password) => {
    const length = password.length;
    if (length > 8) return 100;
    if (length > 5) return 70;
    if (length > 3) return 40;
    return 10;
  };

  const startProcessing = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStep("processing");
    setProgress(10);

    try {
      // Create FormData to send image along with other data
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("email", email);
      formData.append("birthdate", birthday.toISOString().split("T")[0]);
      formData.append("zodiac", zodiacSign);
      formData.append("gender", gender === "male" ? "Male" : "Female");
      formData.append("password", password); // Add password to the form data
      if (profilePicture) {
        formData.append("profile_picture", profilePicture);
      }

      const response = await axios.post("http://127.0.0.1:8000/user/zodiac-compatibility/", formData, {
        headers: { "Content-Type": "multipart/form-data" }, // Set content type
      });

      setProgress(100);
      setTimeout(() => {
        setMatches(response.data.compatible_users || []);
        setStep("matches");

        // Save user data to localStorage
        const userData = {
          id: response.data.user_id, // Ensure the backend returns the user ID
          firstName,
          lastName,
          email,
          gender,
          birthday: birthday.toISOString().split("T")[0],
          zodiacSign,
          profilePicture: preview || "https://via.placeholder.com/150",
        };
        localStorage.setItem("user", JSON.stringify(userData)); // Save data in localStorage

        // Navigate to profile with the saved data
        navigate("/profile", {
          state: { user: userData },
        });

        setLoading(false);
      }, 1000);
    } catch (error) {
      if (error.response && error.response.data.message === "Email already exists.") {
        setErrorMessage("This email is already registered.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
      setStep("form");
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: "16px",
        }}
      >
        {step === "form" && (
          <StyledPaper elevation={6}>
            <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom sx={{ color: "#d32f2f" }}>
              Find Your Perfect Match 💕
            </Typography>
            <form onSubmit={startProcessing}>
              <TextField
                fullWidth
                label="First Name"
                variant="outlined"
                margin="normal"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                fullWidth
                label="Last Name"
                variant="outlined"
                margin="normal"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                margin="normal"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Add Password Field */}
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                margin="normal"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ marginTop: "8px" }}>
                <LinearProgress variant="determinate" value={calculatePasswordStrength(password)} />
              </Box>

              <TextField
                fullWidth
                select
                label="Zodiac Sign"
                value={zodiacSign}
                onChange={(e) => setZodiacSign(e.target.value)}
                margin="normal"
                required
              >
                {zodiacSigns.map((sign) => (
                  <MenuItem key={sign} value={sign}>
                    {sign}
                  </MenuItem>
                ))}
              </TextField>

              <DatePicker
                label="Birthday"
                value={birthday}
                onChange={(newValue) => setBirthday(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="normal" required />
                )}
              />
              {/* Image Upload Section */}
              <Typography variant="subtitle1" color="primary" fontWeight="bold" mt={2} sx={{ color: "#d32f2f" }}>
                Upload Profile Picture
              </Typography>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="profile-picture-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="profile-picture-upload">
                <IconButton color="primary" component="span" aria-label="upload picture">
                  <PhotoCamera sx={{ color: "#d32f2f" }} /> {/* Red camera icon */}
                </IconButton>
              </label>

              {/* Display Image Preview */}
              {preview && (
                <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                  <Avatar src={preview} alt="Profile Preview" sx={{ width: 80, height: 80 }} />
                </Box>
              )}

              <Typography variant="subtitle1" color="primary" fontWeight="bold" mt={2} sx={{ color: "#d32f2f" }}>
                Gender
              </Typography>
              <RadioGroup row value={gender} onChange={(e) => setGender(e.target.value)}>
                <FormControlLabel value="male" control={<Radio sx={{ color: "#d32f2f" }} />} label="Men" />
                <FormControlLabel value="female" control={<Radio sx={{ color: "#d32f2f" }} />} label="Women" />
              </RadioGroup>

              {/* Display Error Message */}
              {errorMessage && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {errorMessage}
                </Typography>
              )}

              <ValentineButton
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                disabled={loading}
                onClick={startProcessing}
              >
                {loading ? "Finding Matches..." : "Find Love"}
              </ValentineButton>
            </form>
          </StyledPaper>
        )}
      </Container>
    </LocalizationProvider>
  );
}