import React, { useEffect, useState } from "react";
import { 
  Box, Typography, Avatar, Grid, Card, CardContent, Button, ThemeProvider, createTheme 
} from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2

// Define Valentine's theme
const valentinesTheme = createTheme({
  palette: {
    primary: {
      main: "#D32F2F", // Deep red
    },
    secondary: {
      main: "#FF4081", // Pink accent
    },
    background: {
      default: "#FFF0F5", // Light pink background
      paper: "#FFEBEE", // Soft red for cards
    },
    text: {
      primary: "#880E4F", // Dark pink text
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
});

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [userId, setUserId] = useState(null);
  const [acceptedMatches, setAcceptedMatches] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.id);
    }

    // Retrieve accepted matches from localStorage
    const storedAcceptedMatches = localStorage.getItem("acceptedMatches");
    if (storedAcceptedMatches) {
      setAcceptedMatches(JSON.parse(storedAcceptedMatches));
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://127.0.0.1:8000/user/possible-matches/${userId}/`)
      .then((response) => {
        // Filter out accepted matches from the server response
        const storedAcceptedMatches = JSON.parse(localStorage.getItem("acceptedMatches") || "[]");
        const acceptedMatchIds = storedAcceptedMatches.map((match) => match.id);
        const filteredMatches = response.data.matches.filter(
          (match) => !acceptedMatchIds.includes(match.id)
        );
        setMatches(filteredMatches);
      })
      .catch((error) => console.error("Error fetching matches:", error));
  }, [userId]);

  const handleAccept = (matchId) => {
    if (!userId) return;

    axios
      .post(`http://127.0.0.1:8000/user/accept-match/${userId}/${matchId}/`)
      .then(() => {
        setMatches((prevMatches) => prevMatches.filter((match) => match.id !== matchId));

        const acceptedMatch = matches.find((match) => match.id === matchId);
        if (acceptedMatch) {
          const updatedAccepted = [...acceptedMatches, acceptedMatch];
          setAcceptedMatches(updatedAccepted);
          localStorage.setItem("acceptedMatches", JSON.stringify(updatedAccepted));
        }
      })
      .catch((error) => console.error("Error accepting match:", error));
  };

  const handleReject = (matchId) => {
    if (!userId) return;
  
    axios
      .post(`http://127.0.0.1:8000/user/reject-match/${userId}/${matchId}/`)
      .then((response) => {
        if (response.data.error) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: response.data.error,
            confirmButtonColor: "#D32F2F", // Valentine's red
            allowOutsideClick: true, // Allow clicking outside the dialog
            allowEscapeKey: true, // Allow closing the dialog with the Escape key
          });
        } else {
          setMatches((prevMatches) => prevMatches.filter((match) => match.id !== matchId));
  
          // Show SweetAlert2 success notification
          Swal.fire({
            title: "Match Rejected!",
            text: "Match rejected successfully!",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#D32F2F", // Valentine's red
            background: "#FFF0F5", // Light pink background
            allowOutsideClick: true, // Allow clicking outside the dialog
            allowEscapeKey: true, // Allow closing the dialog with the Escape key
            customClass: {
              title: "valentine-title", // Custom class for the title
              content: "valentine-text", // Custom class for the text
            },
          });
        }
      })
      .catch((error) => {
        console.error("Error rejecting match:", error);
        if (error.response && error.response.data.error) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.response.data.error,
            confirmButtonColor: "#D32F2F", // Valentine's red
            allowOutsideClick: true, // Allow clicking outside the dialog
            allowEscapeKey: true, // Allow closing the dialog with the Escape key
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "An error occurred while rejecting the match.",
            confirmButtonColor: "#D32F2F", // Valentine's red
            allowOutsideClick: true, // Allow clicking outside the dialog
            allowEscapeKey: true, // Allow closing the dialog with the Escape key
          });
        }
      });
  };

  return (
    <ThemeProvider theme={valentinesTheme}>
      <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
        {/* Messages Section (Left Side) */}
        <Box sx={{ width: "25%", p: 3, borderRight: "2px solid #D32F2F", bgcolor: "background.paper" }}>
          <Typography variant="h5" gutterBottom sx={{ color: "primary.main", fontWeight: "bold" }}>
            Already Matched 💌
          </Typography>
          {acceptedMatches.map((match) => (
            <Box key={match.id} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar src={match.profile_picture || "https://via.placeholder.com/150"} sx={{ width: 50, height: 50, mr: 2 }} />
              <Typography color="text.primary">{match.first_name}</Typography>
            </Box>
          ))}
        </Box>

        {/* Possible Matches Section (Right Side) */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Typography variant="h3" gutterBottom sx={{ color: "primary.main", fontWeight: "bold", textAlign: "center" }}>
            Possible Matches ❤️
          </Typography>
          <Grid container spacing={3}>
            {matches.map((match) => (
              <Grid item key={match.id} xs={12} sm={6} md={4}>
                <Card sx={{ textAlign: "center", borderRadius: "16px", bgcolor: "background.paper", boxShadow: 3 }}>
                  <Avatar 
                    src={match.profile_picture || "https://via.placeholder.com/150"} 
                    sx={{ width: 120, height: 120, margin: "auto", mt: 2 }} 
                  />
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary" }}>
                      {match.first_name} {match.last_name}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAccept(match.id)}
                        sx={{ borderRadius: "8px", textTransform: "none" }}
                      >
                        Accept 💘
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleReject(match.id)}
                        sx={{ borderRadius: "8px", textTransform: "none" }}
                      >
                        Reject 💔
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MatchesPage;