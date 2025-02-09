import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Divider,
} from "@mui/material";
import {
  Person as ProfileIcon,
  Notifications as NotificationsIcon,
  Favorite as MatchesIcon,
  ExitToApp as LogoutIcon,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios"; // For API requests

const drawerWidth = 240;

// Valentine-themed background with a subtle gradient and rounded border
const StyledDrawer = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    boxSizing: "border-box",
    background: "linear-gradient(180deg, #ffcccb, #ffebee)", // Light red gradient
    borderRight: "1px solid #e0e0e0",
    borderRadius: "0 16px 16px 0", // Rounded border on the right side
    display: "flex",
    flexDirection: "column", // Arrange items vertically
  },
});

const UserProfileBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "24px 16px",
  borderBottom: "1px solid #e0e0e0",
  background: "#ffcccb", // Light red background for the user profile section
});

const StyledAvatar = styled(Avatar)({
  width: "80px",
  height: "80px",
  marginBottom: "16px",
  border: "2px solid #d32f2f", // Valentine red border for the avatar
  borderRadius: "50%", // Ensure the avatar is perfectly round
});

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  "&:hover": {
    backgroundColor: "#ffebee", // Light red hover background
    color: "#d32f2f", // Valentine red text color on hover
  },
  "&.Mui-selected": {
    backgroundColor: "#ffcdd2", // Light red background for selected item
    color: "#d32f2f", // Valentine red text color for selected item
  },
  "&.Mui-selected:hover": {
    backgroundColor: "#ffcdd2", // Keep the same background on hover for selected item
  },
}));

const LogoutButton = styled(ListItem)({
  marginTop: "auto", // Push the logout button to the bottom
  backgroundColor: "#d32f2f", // Red background for the logout button
  color: "#fff", // White text color
  "&:hover": {
    backgroundColor: "#b71c1c", // Darker red on hover
  },
  "&:active": {
    backgroundColor: "#d32f2f", // Keep the same color when clicked
  },
  cursor: "pointer", // Show pointer cursor
});

export default function Sidebar({ notificationsCount }) {
  const location = useLocation(); // Get the current route
  const navigate = useNavigate(); // For navigation
  const [notifications, setNotifications] = useState([]); // State to store notifications
  const [showNotifications, setShowNotifications] = useState(false); // State to toggle notifications window

  // Retrieve user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData ? userData.id : null; // Get user ID
  const userName = userData ? userData.firstName : "John";
  const userLastName = userData ? userData.lastName : "Doe";
  const userProfilePicture = userData ? userData.profilePicture : "https://via.placeholder.com/150";

  // Fetch notifications when the component mounts
  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:8000/api/get-notifications/${userId}/`)
        .then((response) => {
          setNotifications(response.data.notifications); // Store notifications in state
        })
        .catch((error) => {
          console.error("Error fetching notifications:", error);
        });
    }
  }, [userId]);

  // Toggle notifications window
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Mark a notification as read
  const markNotificationAsRead = (notificationId) => {
    axios
      .post(`http://localhost:8000/api/mark-notification-as-read/${notificationId}/`)
      .then(() => {
        // Update the notifications state to remove the read notification
        setNotifications((prevNotifications) =>
          prevNotifications.filter((n) => n.id !== notificationId)
        );
      })
      .catch((error) => {
        console.error("Error marking notification as read:", error);
      });
  };

  // Determine which button is selected based on the current route
  const getSelectedIndex = () => {
    switch (location.pathname) {
      case "/profile":
        return 0;
      case "/notifications":
        return 1;
      case "/matches":
        return 2;
      default:
        return -1;
    }
  };

  const selectedIndex = getSelectedIndex();

  // Handle button clicks
  const handleListItemClick = (path) => {
    navigate(path); // Navigate to the specified path
  };

  // Handle logout with confirmation dialog
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f", // Valentine's red
      cancelButtonColor: "#ff4081", // Valentine's pink
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      background: "#ffebee", // Light pink background
      customClass: {
        title: "valentine-title", // Custom class for the title
        content: "valentine-text", // Custom class for the text
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear everything from localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        // Redirect to login page
        navigate("/login");

        // Show a success message
        Swal.fire({
          title: "Logged Out!",
          text: "You have been successfully logged out.",
          icon: "success",
          confirmButtonColor: "#d32f2f", // Valentine's red
          background: "#ffebee", // Light pink background
        });
      }
    });
  };

  return (
    <StyledDrawer variant="permanent" anchor="left">
      <UserProfileBox>
        <StyledAvatar alt={userName} src={userProfilePicture} />
        <Typography variant="h6" color="textPrimary" sx={{ color: "#d32f2f" }}>
          {userName} {userLastName}
        </Typography>
      </UserProfileBox>

      <List>
        {/* Profile Button */}
        <StyledListItem
          button
          selected={selectedIndex === 0}
          onClick={() => handleListItemClick("/profile")}
        >
          <ListItemIcon>
            <ProfileIcon
              sx={{ color: selectedIndex === 0 ? "#d32f2f" : "inherit" }} // Valentine red for selected icon
            />
          </ListItemIcon>
          <ListItemText
            primary="Profile"
            primaryTypographyProps={{
              sx: { color: selectedIndex === 0 ? "#d32f2f" : "inherit" }, // Valentine red for selected text
            }}
          />
        </StyledListItem>

        {/* Notifications Button */}
        <StyledListItem
          button
          selected={selectedIndex === 1}
          onClick={toggleNotifications} // Toggle notifications window
        >
          <ListItemIcon>
            <Badge badgeContent={notificationsCount} color="error">
              <NotificationsIcon
                sx={{ color: selectedIndex === 1 ? "#d32f2f" : "inherit" }} // Valentine red for selected icon
              />
            </Badge>
          </ListItemIcon>
          <ListItemText
            primary="Notifications"
            primaryTypographyProps={{
              sx: { color: selectedIndex === 1 ? "#d32f2f" : "inherit" }, // Valentine red for selected text
            }}
          />
        </StyledListItem>

        {/* Matches Button */}
        <StyledListItem
          button
          selected={selectedIndex === 2}
          onClick={() => handleListItemClick("/matches")}
        >
          <ListItemIcon>
            <MatchesIcon
              sx={{ color: selectedIndex === 2 ? "#d32f2f" : "inherit" }} // Valentine red for selected icon
            />
          </ListItemIcon>
          <ListItemText
            primary="Matches"
            primaryTypographyProps={{
              sx: { color: selectedIndex === 2 ? "#d32f2f" : "inherit" }, // Valentine red for selected text
            }}
          />
        </StyledListItem>
      </List>

      {/* Notifications Window */}
      {showNotifications && (
        <Box
          sx={{
            position: "fixed",
            top: "64px", // Adjust position as needed
            right: "16px", // Adjust position as needed
            width: "300px",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            padding: "16px",
            zIndex: 1000,
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: "16px", color: "#d32f2f" }}>
            Notifications
          </Typography>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Box
                key={notification.id}
                sx={{
                  marginBottom: "16px",
                  padding: "8px",
                  borderBottom: "1px solid #e0e0e0",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#ffebee", // Light red hover background
                  },
                }}
                onClick={() => markNotificationAsRead(notification.id)} // Mark as read on click
              >
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {notification.sender.first_name} {notification.sender.last_name}
                </Typography>
                <Typography variant="body2">{notification.message}</Typography>
                <Typography variant="caption" sx={{ color: "#757575" }}>
                  {notification.created_at}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body1" sx={{ color: "#757575" }}>
              No new notifications.
            </Typography>
          )}
        </Box>
      )}

      {/* Logout Button at the Bottom */}
      <LogoutButton button onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon sx={{ color: "#fff" }} /> {/* White icon */}
        </ListItemIcon>
        <ListItemText
          primary="Logout"
          primaryTypographyProps={{
            sx: { color: "#fff" }, // White text
          }}
        />
      </LogoutButton>
    </StyledDrawer>
  );
}