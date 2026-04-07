import React, { useState } from "react";
import {
    Box,
    Tabs,
    Tab,
    Typography,
    TextField,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Paper,
    Stack,
} from "@mui/material";

export default function ApprovalPage() {
    const [tab, setTab] = useState(0);

    const domesticRows = [];
    const internationalRows = [];

    const tableHeader1 = [
        "TAF-No.",
        "TID-No.",
        "Employee Name",
        "Employee No.",
        "Location of Visit",
        "No. of days",
        "Advance(INR)",
        "Manager Approval",
    ];

    const tableHeader2 = [
        "TAF-No.",
        "TID-No.",
        "Employee Name",
        "Employee No.",
        "Location of Visit",
        "No. of days",
        "Advance",
        "Manager Approval",
    ];

    const sectionStyle = {
        mt: 3,
    };

    const headerCellStyle = {
        backgroundColor: "rgb(90,114,90)",
        color: "#000",
        fontWeight: 700,
        fontSize: "14px",
        textAlign: "center",
        borderRight: "1px solid #d7ddd5",
        py: 1.2,
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#d9dfd9",
                borderTop: "2px solid #7f977f",
                fontFamily: "Arial, sans-serif",
            }}
        >
            {/* Top Tabs */}
            <Box sx={{ px: 1 }}>
                <Tabs
                    value={tab}
                    onChange={(e, newValue) => setTab(newValue)}
                    textColor="inherit"
                    indicatorColor="success"
                    sx={{
                        minHeight: 36,
                        "& .MuiTab-root": {
                            minHeight: 36,
                            textTransform: "none",
                            fontSize: "15px",
                            color: "#000",
                            alignItems: "flex-start",
                            px: 2,
                        },
                        "& .MuiTabs-indicator": {
                            backgroundColor: "#2e6b4f",
                            height: "2px",
                        },
                    }}
                >
                    <Tab label="TAF Approvals Pending" />
                    <Tab label="Additional Advance" />
                    <Tab label="Statement Approvals" />
                    <Tab label="Local Claim" />
                    <Tab label="Local Purchase" />
                </Tabs>
            </Box>

            <Box sx={{ px: 2, py: 2 }}>
                {/* Domestic Section */}
                <Box sx={sectionStyle}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1 }}
                    >
                        <Typography sx={{ fontSize: "16px", color: "#1f2d1f" }}>
                            Domestic TAF Pending For Approval
                        </Typography>

                        <TextField
                            placeholder="Search.."
                            variant="standard"
                            sx={{
                                width: 315,
                                backgroundColor: "#f7f7f7",
                                px: 1,
                                "& .MuiInputBase-input": {
                                    fontSize: "14px",
                                    py: 0.8,
                                },
                            }}
                        />
                    </Stack>

                    <Paper elevation={0} sx={{ background: "transparent" }}>
                        <Table
                            size="small"
                            sx={{
                                borderCollapse: "collapse",
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    {tableHeader1.map((item, index) => (
                                        <TableCell
                                            key={index}
                                            sx={{
                                                ...headerCellStyle,
                                                width:
                                                    item === "Employee Name"
                                                        ? 180
                                                        : item === "Employee No."
                                                            ? 140
                                                            : item === "Location of Visit"
                                                                ? 160
                                                                : item === "Manager Approval"
                                                                    ? 170
                                                                    : 110,
                                            }}
                                        >
                                            {item}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {domesticRows.length > 0 ? (
                                    domesticRows.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.tafNo}</TableCell>
                                            <TableCell>{row.tidNo}</TableCell>
                                            <TableCell>{row.employeeName}</TableCell>
                                            <TableCell>{row.employeeNo}</TableCell>
                                            <TableCell>{row.location}</TableCell>
                                            <TableCell>{row.days}</TableCell>
                                            <TableCell>{row.advance}</TableCell>
                                            <TableCell>{row.managerApproval}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            sx={{
                                                border: "none",
                                                px: 0,
                                                py: 1.5,
                                                backgroundColor: "transparent",
                                            }}
                                        >
                                            <Typography sx={{ fontSize: "14px", color: "#000" }}>
                                                No.of Rows : 0
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                gap: 0.5,
                                mt: 1,
                            }}
                        >
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                    minWidth: 45,
                                    height: 24,
                                    fontSize: "12px",
                                    textTransform: "none",
                                    color: "#000",
                                    borderColor: "#5f8aa6",
                                    backgroundColor: "#f5f5f5",
                                }}
                            >
                                Back
                            </Button>

                            <Box
                                sx={{
                                    minWidth: 45,
                                    height: 24,
                                    px: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "1px solid #5f8aa6",
                                    backgroundColor: "#f5f5f5",
                                    fontSize: "12px",
                                }}
                            >
                                1 of 0
                            </Box>

                            <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                    minWidth: 45,
                                    height: 24,
                                    fontSize: "12px",
                                    textTransform: "none",
                                    color: "#000",
                                    borderColor: "#5f8aa6",
                                    backgroundColor: "#f5f5f5",
                                }}
                            >
                                Next
                            </Button>
                        </Box>
                    </Paper>
                </Box>

                {/* International Section */}
                <Box sx={{ mt: 4 }}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1 }}
                    >
                        <Typography sx={{ fontSize: "16px", color: "#1f2d1f" }}>
                            International TAF Pending For Approval
                        </Typography>

                        <TextField
                            placeholder="Search.."
                            variant="standard"
                            sx={{
                                width: 315,
                                backgroundColor: "#f7f7f7",
                                px: 1,
                                "& .MuiInputBase-input": {
                                    fontSize: "14px",
                                    py: 0.8,
                                },
                            }}
                        />
                    </Stack>

                    <Paper elevation={0} sx={{ background: "transparent" }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    {tableHeader2.map((item, index) => (
                                        <TableCell
                                            key={index}
                                            sx={{
                                                ...headerCellStyle,
                                                width:
                                                    item === "Employee Name"
                                                        ? 180
                                                        : item === "Employee No."
                                                            ? 140
                                                            : item === "Location of Visit"
                                                                ? 160
                                                                : item === "Manager Approval"
                                                                    ? 170
                                                                    : 110,
                                            }}
                                        >
                                            {item}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {internationalRows.length > 0 ? (
                                    internationalRows.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.tafNo}</TableCell>
                                            <TableCell>{row.tidNo}</TableCell>
                                            <TableCell>{row.employeeName}</TableCell>
                                            <TableCell>{row.employeeNo}</TableCell>
                                            <TableCell>{row.location}</TableCell>
                                            <TableCell>{row.days}</TableCell>
                                            <TableCell>{row.advance}</TableCell>
                                            <TableCell>{row.managerApproval}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            sx={{
                                                border: "none",
                                                px: 0,
                                                py: 1.5,
                                                backgroundColor: "transparent",
                                            }}
                                        >
                                            <Typography sx={{ fontSize: "14px", color: "#000" }}>
                                                No.of Rows : 0
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                gap: 0.5,
                                mt: 1,
                            }}
                        >
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                    minWidth: 45,
                                    height: 24,
                                    fontSize: "12px",
                                    textTransform: "none",
                                    color: "#000",
                                    borderColor: "#5f8aa6",
                                    backgroundColor: "#f5f5f5",
                                }}
                            >
                                Back
                            </Button>

                            <Box
                                sx={{
                                    minWidth: 45,
                                    height: 24,
                                    px: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "1px solid #5f8aa6",
                                    backgroundColor: "#f5f5f5",
                                    fontSize: "12px",
                                }}
                            >
                                1 of 1
                            </Box>

                            <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                    minWidth: 45,
                                    height: 24,
                                    fontSize: "12px",
                                    textTransform: "none",
                                    color: "#000",
                                    borderColor: "#5f8aa6",
                                    backgroundColor: "#f5f5f5",
                                }}
                            >
                                Next
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}