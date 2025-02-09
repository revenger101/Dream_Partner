import React, { useState } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation to access state
import {
  Box,
  Typography,
  Avatar,
  Button,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Paper,
} from "@mui/material";
import { PhotoCamera, AddAPhoto } from "@mui/icons-material"; // Icons for image upload
import { styled } from "@mui/system";

// Valentine-themed styles
const StyledCard = styled(Card)({
  background: "linear-gradient(180deg, #ffcccb, #ffebee)",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
});

const StyledAvatar = styled(Avatar)({
  width: "120px",
  height: "120px",
  border: "4px solid #d32f2f",
  marginBottom: "16px",
});

const StyledButton = styled(Button)({
  background: "#d32f2f",
  color: "#fff",
  "&:hover": {
    background: "#b71c1c",
  },
});

const AlbumBox = styled(Paper)({
  background: "#fff",
  borderRadius: "16px",
  padding: "16px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  marginBottom: "16px",
});

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    gender: "Male",
    birthday: "1990-01-01",
    zodiacSign: "♈ Aries",
    profilePicture: "https://via.placeholder.com/150",
};


  const [album, setAlbum] = useState([]);

  // Handle album image upload
  const handleImageUpload = (event) => {
    const files = event.target.files;
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
    setAlbum((prevAlbum) => [...prevAlbum, ...newImages]);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        My Profile 💖
      </Typography>

      {/* User Details Section */}
      <StyledCard>
        <Box sx={{ textAlign: "center" }}>
          <StyledAvatar alt={`${user.firstName} ${user.lastName}`} src={user.profilePicture} />
          <Typography variant="h5" color="textPrimary" sx={{ color: "#d32f2f" }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {user.email}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Gender: {user.gender} | Zodiac: {user.zodiacSign} | Birthday: {user.birthday}
          </Typography>
        </Box>
      </StyledCard>

      {/* Photo Album Section */}
      <AlbumBox>
        <Typography variant="h5" color="primary" gutterBottom>
          Photo Album 📸
        </Typography>
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="upload-photo"
          type="file"
          multiple
          onChange={handleImageUpload}
        />
        <label htmlFor="upload-photo">
          <StyledButton
            variant="contained"
            component="span"
            startIcon={<PhotoCamera />}
            sx={{ mb: 2 }}
          >
            Upload Photos
          </StyledButton>
        </label>

        <Grid container spacing={2}>
          {album.map((image, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={image}
                  alt={`Album ${index + 1}`}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      </AlbumBox>
    </Box>
  );
};


export default Profile;