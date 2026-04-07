import React from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Divider
} from "@mui/material";

const EmployeeDetails = () => {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#cfd6d1", // light grey background
            }}
        >
            {/* Header Section */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 24px",
                    backgroundColor: "#cfd6d1",
                }}
            >
                {/* Left Title */}
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    Enter the details
                </Typography>

                {/* Right Input + Button */}
                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Employee Name"
                        variant="outlined"
                        sx={{
                            backgroundColor: "#e9e7e6",
                            borderRadius: 1,
                            width: 200,
                        }}
                    />

                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#4f6656",
                            textTransform: "none",
                            "&:hover": {
                                backgroundColor: "#050505",
                            },
                        }}
                    >
                        Get Details
                    </Button>
                </Box>
            </Box>

            {/* Bottom Line */}
            <Divider sx={{ borderColor: "#6b7c73" }} />
        </Box>
    );
};

export default EmployeeDetails;