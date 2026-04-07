
import { useState } from "react";
import {
    AppBar,
    Toolbar,
    IconButton,
    Box,
    Button,
    Drawer,
    Avatar,
    Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";

import logo from "../../assets/Signboard.jpg.jpeg";
import { useNavigate, useLocation } from "react-router-dom";

function Topbar() {
    const [openProfile, setOpenProfile] = useState(false);
    const [openSidebar, setOpenSidebar] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: "Department", path: "/travel/department" },
        { text: "New Travel", path: "/travel/new-travel" },
        { text: "On Behalf", path: "/travel/on-behalf" },
        { text: "Travel Data", path: "/travel/travel-data" },
        { text: "Travel Expenses", path: "/travel/travel-expenses" },
        { text: "Local Expenses", path: "/travel/local-expenses" },
        { text: "Local Purchase", path: "/travel/local-purchase" },
        { text: "Reportees", path: "/travel/reportees" },
        { text: "Company Expenses", path: "/travel/company-expenses" },
    ];

    return (
        <>
            {/* TOPBAR */}
            <AppBar position="static" sx={{ backgroundColor: "rgb(90,114,90)", p: 2 }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => setOpenSidebar(true)}
                    >
                        <MenuIcon sx={{ fontSize: 40 }} />
                    </IconButton>

                    <Box
                        component="img"
                        src={logo}
                        alt="Elantris Technologies"
                        sx={{
                            height: 60,
                            objectFit: "contain",
                            ml: 2,
                        }}
                    />

                    <Box sx={{ flexGrow: 1 }} />

                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#ffffff",
                            color: "#2f4f2f",
                            fontWeight: 600,
                            textTransform: "none",
                            "&:hover": {
                                backgroundColor: "#f2f2f2",
                            },
                        }}
                        onClick={() => setOpenProfile(true)}
                    >
                        Profile
                    </Button>
                </Toolbar>
            </AppBar>

            {/* LEFT SIDEBAR */}
            <Drawer
                anchor="left"
                open={openSidebar}
                onClose={() => setOpenSidebar(false)}
                PaperProps={{
                    sx: {
                        width: 260,
                        backgroundColor: "rgba(90, 114, 90, 0.9)",
                        backdropFilter: "blur(12px)",
                        color: "white",
                        borderRight: "none",
                    },
                }}
            >
                <Box sx={{ width: "100%", height: "100%", pt: 4, px: 2, pb: 4, display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Header */}
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            fontWeight: 'bold', 
                            mb: 4, 
                            px: 1,
                            mt: 1
                        }}
                    >
                        Travel Portal
                    </Typography>

                    {/* Menu Items */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {menuItems.map((item, index) => {
                            const isActive = location.pathname.includes(item.path);
                            return (
                                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Box
                                        onClick={() => {
                                            navigate(item.path);
                                            setOpenSidebar(false);
                                        }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            px: 2,
                                            py: 1.5,
                                            cursor: "pointer",
                                            borderRadius: '8px',
                                            color: isActive ? "white" : "#d1d5db", // gray-300 equivalent
                                            backgroundColor: isActive ? "rgba(255, 255, 255, 0.2)" : "transparent",
                                            boxShadow: isActive ? "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)" : "none",
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                backgroundColor: isActive ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)",
                                                color: "white",
                                            },
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "16px" }}>{item.text}</Typography>
                                    </Box>
                                    {index < menuItems.length - 1 && (
                                        <Box sx={{ mx: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }} />
                                    )}
                                </Box>
                            );
                        })}
                    </Box>

                    {/* HR Portal Navigation Button */}
                    <Box sx={{ mt: 'auto', pt: 2 }}>
                        <Box
                            onClick={() => {
                                navigate("/hr/prejoining");
                                setOpenSidebar(false);
                            }}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                px: 2,
                                py: 1.5,
                                cursor: "pointer",
                                borderRadius: '8px',
                                color: "white",
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                                },
                            }}
                        >
                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>HR Portal</Typography>
                        </Box>
                    </Box>
                </Box>
            </Drawer>

            {/* RIGHT PROFILE DRAWER */}
            <Drawer
                anchor="right"
                open={openProfile}
                onClose={() => setOpenProfile(false)}
                PaperProps={{
                    sx: {
                        width: 350,
                        backgroundColor: "#f9fbf9",
                    },
                }}
            >
                <Box sx={{ width: "100%" }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            px: 1,
                            py: 0.5,
                            borderBottom: "1px solid #d6ddd6",
                            backgroundColor: "#e8efe8",
                        }}
                    >
                        <IconButton onClick={() => setOpenProfile(false)}>
                            <CloseIcon sx={{ color: "#5a725a" }} />
                        </IconButton>
                    </Box>

                    <Box display="flex" justifyContent="center" my={3}>
                        <Avatar sx={{ width: 180, height: 180 }}>S</Avatar>
                    </Box>

                    {[
                        { label: "Name", value: "Sakthivel.K" },
                        { label: "Emp ID", value: "EMP004" },
                        { label: "Designation", value: "Software" },
                        { label: "Rep.Mgr 1", value: "Gowthaman" },
                        { label: "Rep.Mgr 2", value: "Gowthaman" },
                    ].map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "flex",
                                borderBottom: "1px solid #d6ddd6",
                                py: 1.5,
                                px: 3,
                                color: "#2f3b2f",
                            }}
                        >
                            <Box sx={{ width: 120, fontWeight: "bold" }}>{item.label}</Box>
                            <Box sx={{ width: 20 }}>:</Box>
                            <Box sx={{ flex: 1 }}>{item.value}</Box>
                        </Box>
                    ))}

                    <Box sx={{ p: 3 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<LogoutIcon />}
                            sx={{
                                backgroundColor: "#5a725a",
                                textTransform: "none",
                                fontWeight: 600,
                                "&:hover": {
                                    backgroundColor: "#496149",
                                },
                            }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
}

export default Topbar;