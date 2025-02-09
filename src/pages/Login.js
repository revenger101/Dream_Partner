import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField, Button, Paper, Link, Container, Avatar } from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";

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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("http://127.0.0.1:8000/user/login/", {
        email,
        password,
      });

      if (response.data.message === "Login successful.") {
        const user = response.data.user;

        // Ensure the profile picture URL is correctly formatted
        const profilePictureUrl = user.profile_picture.startsWith("/")
          ? `http://127.0.0.1:8000${decodeURIComponent(user.profile_picture)}`
          : user.profile_picture;

        const userData = {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          gender: user.gender,
          birthday: user.birthday,
          zodiacSign: user.zodiac_sign,
          profilePicture: profilePictureUrl, // Use the correctly formatted URL
        };

        // Save user data to localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        setProfilePicture(profilePictureUrl); // Update state with profile picture

        // Redirect to the profile page
        setTimeout(() => {
          navigate("/profile", {
            state: { user: userData },
          });
        }, 1000); // Show profile picture before navigating
      }
    } catch (error) {
      setError("Invalid email or password.");
    }
  };

  return (
    <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <StyledPaper elevation={6}>
        {profilePicture && (
          <Avatar src={profilePicture} alt="Profile Picture" sx={{ width: 80, height: 80, margin: "auto" }} />
        )}
        <Typography variant="h4" color="primary" gutterBottom>
          Login 💖
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleSubmit}>
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
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <StyledButton type="submit" variant="contained" fullWidth>
            Login
          </StyledButton>
        </form>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Don't have an account? <Link href="/">Sign up</Link>
        </Typography>
      </StyledPaper>
    </Container>
  );
};

export default Login;