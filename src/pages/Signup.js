import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";
import { Visibility, VisibilityOff } from "@mui/icons-material";

// Styled components for the signup page
const StyledPaper = styled(Paper)({
  padding: "24px",
  borderRadius: "16px",
  textAlign: "center",
  maxWidth: "400px",
  margin: "0 auto",
});

const StyledButton = styled(Button)({
  background: "#d32f2f",
  color: "#fff",
  "&:hover": {
    background: "#b71c1c",
  },
  marginTop: "16px",
});

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false); // Dialog open state
  const [dialogMessage, setDialogMessage] = useState(""); // Message for the dialog
  const [dialogTitle, setDialogTitle] = useState(""); // Title for the dialog

  // Password strength function (simple example)
  const calculatePasswordStrength = (password) => {
    const length = password.length;
    if (length > 8) return 100;
    if (length > 5) return 70;
    if (length > 3) return 40;
    return 10;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Signup Data:", { name, email, password });

    try {
      // Make the API call to the signup endpoint
      const response = await axios.post("http://127.0.0.1:8000/user/signup/", {
        name,
        email,
        password,
      });

      if (response.data.message === "User registered successfully.") {
        // Show success dialog
        setDialogTitle("Success!");
        setDialogMessage("You have signed up successfully.");
      } else {
        // Show error dialog
        setDialogTitle("Error");
        setDialogMessage("Invalid information or email.");
      }
    } catch (error) {
      // Handle errors (e.g., server error)
      setDialogTitle("Error");
      setDialogMessage("An error occurred during signup. Please try again.");
    } finally {
      setOpen(true); // Open the dialog after the API call
    }
  };

  const handleClose = () => {
    setOpen(false); // Close the dialog
  };

  return (
    <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <StyledPaper elevation={6}>
        <Typography variant="h4" color="primary" gutterBottom>
          Sign Up 💖
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            variant="outlined"
            margin="normal"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <StyledButton type="submit" variant="contained" fullWidth>
            Sign Up
          </StyledButton>
        </form>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account? <Link href="/login">Login</Link>
        </Typography>
      </StyledPaper>

      {/* Dialog for showing success or error message */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Signup;
