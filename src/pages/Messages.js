import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, TextField, Button } from "@mui/material";
import axios from "axios";

const Messages = () => {
  const [acceptedMatches, setAcceptedMatches] = useState([]); // State for accepted matches
  const [selectedUser, setSelectedUser] = useState(null); // State for the selected user
  const [userId, setUserId] = useState(null); // State for the current user ID
  const [message, setMessage] = useState(""); // State for the message input

  useEffect(() => {
    // Retrieve user ID from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.id);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Fetch accepted matches for the user
    axios
      .get(`http://127.0.0.1:8000/user/accepted-matches/${userId}/`)
      .then((response) => {
        setAcceptedMatches(response.data.accepted_matches);
      })
      .catch((error) => {
        console.error("Error fetching accepted matches:", error);
      });
  }, [userId]);

  const handleUserClick = (user) => {
    setSelectedUser(user); // Set the selected user
  };

  const handleSendMessage = () => {
    if (!selectedUser || !message) return;

    // Add logic to send the message (e.g., API call)
    console.log("Message sent to:", selectedUser.first_name, "Content:", message);
    setMessage(""); // Clear the message input
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar for Accepted Matches */}
      <Box sx={{ width: "20%", padding: 2, borderRight: "1px solid #ccc", backgroundColor: "#f5f5f5", overflowY: "auto" }}>
        <Typography variant="h6" gutterBottom sx={{ color: "#d32f2f", fontWeight: "bold" }}>
          Accepted Matches 💬
        </Typography>
        <List>
          {acceptedMatches.map((match) => (
            <ListItem
              key={match.id}
              button
              onClick={() => handleUserClick(match)}
              sx={{
                backgroundColor: selectedUser?.id === match.id ? "#e0e0e0" : "transparent",
                borderRadius: "8px",
                mb: 1,
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={match.profile_picture || "https://via.placeholder.com/150"}
                  alt={`${match.first_name} ${match.last_name}`}
                />
              </ListItemAvatar>
              <ListItemText primary={`${match.first_name} ${match.last_name}`} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main Area for Messages */}
      <Box sx={{ flex: 1, padding: 3, backgroundColor: "#fff" }}>
        {selectedUser ? (
          <>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
              Messages with {selectedUser.first_name} {selectedUser.last_name}
            </Typography>
            <Box sx={{ mt: 2 }}>
              {/* Placeholder for messages */}
              <Typography variant="body1">
                Start a conversation with {selectedUser.first_name}!
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{ mt: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendMessage}
                sx={{ mt: 2, borderRadius: "8px", textTransform: "none" }}
              >
                Send
              </Button>
            </Box>
          </>
        ) : (
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
            Select a user to start messaging.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Messages;