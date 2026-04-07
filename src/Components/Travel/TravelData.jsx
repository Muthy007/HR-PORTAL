import React, { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    Divider,
    Button,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    FormControl,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

function TravelData() {
    const [year, setYear] = useState(dayjs("2026"));
    const [selectedType, setSelectedType] = useState("domestic");

    const handleRefresh = () => {
        setYear(dayjs("2026"));
    };

    const sections = [
        {
            title: "TAF APPLIED",
            items: [
                { key: "domestic", label: "Domestic", value: 0, color: "#21a74a" },
                { key: "international", label: "International", value: 0, color: "#e8942d" },
            ],
        },
        {
            title: "TAF STATUS",
            items: [
                { key: "tafApproved", label: "Approved", value: 0, color: "#21a74a" },
                { key: "tafPending", label: "Pending", value: 0, color: "#e8942d" },
                { key: "tafCancelRejected", label: "Cancel/Rejected", value: 0, color: "#e63946" },
            ],
        },
        {
            title: "STATEMENT STATUS",
            items: [
                { key: "statementApproved", label: "Approved", value: 0, color: "#21a74a" },
                { key: "statementSubmitted", label: "Submitted", value: 0, color: "#e8942d" },
                { key: "statementPending", label: "Pending", value: 0, color: "#e63946" },
            ],
        },
        {
            title: "REPORTEE STATUS",
            items: [
                { key: "reporteeTafPending", label: "TAF Pending", value: 0, color: "#21a74a" },
                {
                    key: "reporteeAdditionalAdvancePending",
                    label: "Additional Advance Pending",
                    value: 0,
                    color: "#e8942d",
                },
                {
                    key: "reporteeStatementPending",
                    label: "Statement Pending",
                    value: 0,
                    color: "#e63946",
                },
            ],
        },
    ];

    const commonColumns = [
        "TAF-No",
        "Purpose",
        "Travel Location",
        "No of Days",
        "Advance",
        "Statement Status",
        "Remarks",
    ];

    const tableMap = {
        domestic: {
            title: "TAF APPLIED (DOMESTIC)",
            columns: commonColumns,
            rows: [],
        },
        international: {
            title: "TAF APPLIED (INTERNATIONAL)",
            columns: commonColumns,
            rows: [],
        },
        tafApproved: {
            title: "TAF STATUS (APPROVED)",
            columns: commonColumns,
            rows: [],
        },
        tafPending: {
            title: "TAF STATUS (PENDING)",
            columns: [
                "REV-No",
                "Purpose",
                "Travel Location",
                "No of Days",
                "Advance",
                "Remarks",
                "Auth.level 1",
                "Auth.level 2",
                "Auth.level 3",
                "Auth MD",
            ],
            rows: [],
        },
        tafCancelRejected: {
            title: "TAF STATUS (CANCEL/REJECTED)",
            columns: [
                "REV-No",
                "Purpose",
                "Travel Location",
                "No of Days",
                "Advance",
                "Remarks",
                "Auth.level 1",
                "Auth.level 2",
                "Auth.level 3",
                "Auth MD",
            ],
            rows: [],
        },

    };

    const currentTable = tableMap[selectedType];
    const showTable = Boolean(currentTable);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100%",
                bgcolor: "#cfd6d1",
                overflowX: "hidden",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    borderTop: "3px solid #849486",
                    borderBottom: "1px solid #8f9890",
                    px: { xs: 1.5, sm: 2, md: 3 },
                    py: { xs: 1.2, sm: 1.4, md: 1.6 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                }}
            >
                <Box
                    sx={{
                        flex: { xs: "1 1 100%", md: "1 1 0" },
                        display: "flex",
                        justifyContent: { xs: "center", md: "center" },
                        order: { xs: 1, md: 2 },
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: { xs: "22px", sm: "26px", md: "32px" },
                            fontWeight: 700,
                            color: "#111",
                            textAlign: "center",
                            lineHeight: 1.2,
                        }}
                    >
                        Travel Details
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        ml: { md: "auto" },
                        width: { xs: "100%", sm: "auto" },
                        justifyContent: { xs: "center", sm: "center", md: "flex-end" },
                        order: { xs: 2, md: 3 },
                    }}
                >
                    <FormControl size="small">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                views={["year"]}
                                openTo="year"
                                value={year}
                                onChange={(newValue) => {
                                    if (newValue) setYear(newValue);
                                }}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        sx: {
                                            width: { xs: 110, sm: 130, md: 145 },
                                            "& .MuiInputBase-root": {
                                                height: { xs: 34, sm: 36, md: 38 },
                                                borderRadius: "20px",
                                                bgcolor: "#c9e1f3",
                                                fontWeight: 700,
                                            },
                                            "& .MuiInputBase-input": {
                                                textAlign: "center",
                                                fontSize: { xs: "13px", sm: "14px", md: "15px" },
                                                py: 0.8,
                                            },
                                        },
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </FormControl>

                    <IconButton
                        onClick={handleRefresh}
                        sx={{
                            width: { xs: 34, sm: 36, md: 38 },
                            height: { xs: 34, sm: 36, md: 38 },
                        }}
                    >
                        <RefreshIcon sx={{ fontSize: { xs: 22, sm: 24, md: 26 }, color: "#111" }} />
                    </IconButton>
                </Box>
            </Box>

            {/* Main Layout */}
            <Box
                sx={{
                    px: { xs: 1, sm: 1.5, md: 2 },
                    py: { xs: 1.5, sm: 2, md: 2 },
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr",
                            md: "minmax(240px, 320px) minmax(0, 1fr)",
                            lg: "minmax(240px, 300px) minmax(0, 1fr)",
                            xl: "400px minmax(0, 1fr)",
                        },
                        gap: { xs: 1.5, sm: 2, md: 2 },
                        alignItems: "start",
                    }}
                >
                    {/* Left section */}
                    <Box sx={{ minWidth: 0, width: "100%" }}>
                        {sections.map((section, index) => (
                            <Paper
                                key={index}
                                elevation={3}
                                sx={{
                                    mb: 1.5,
                                    borderRadius: 2,
                                    px: { xs: 1.2, sm: 1.5, md: 1.8 },
                                    py: { xs: 1.2, sm: 1.5, md: 1.8 },
                                    boxShadow: "0 3px 12px rgba(0,0,0,0.14)",


                                }}
                            >
                                <Typography
                                    sx={{
                                        textAlign: "center",
                                        fontSize: { xs: "21px", sm: "22px", md: "23px", lg: "24px" },
                                        fontWeight: 500,
                                        color: "#13294b",
                                    }}
                                >
                                    {section.title}
                                </Typography>

                                <Divider
                                    sx={{
                                        my: 1.2,
                                        borderBottomWidth: 2,
                                        borderColor: "#1d5e7a",
                                    }}
                                />

                                {section.items.map((item, i) => (
                                    <Box
                                        key={item.key}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 1,
                                            py: { xs: 1.1, sm: 1.2, md: 1.3 },
                                            borderBottom:
                                                i !== section.items.length - 1 ? "1px solid #dddddd" : "none",
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                flex: 1,
                                                fontSize: "large",
                                                color: "#111",
                                                lineHeight: 1.3,
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {item.label}:
                                        </Typography>

                                        <Button
                                            variant="contained"
                                            onClick={() => setSelectedType(item.key)}
                                            sx={{
                                                minWidth: { xs: 62, sm: 66, md: 70 },
                                                height: { xs: 28, sm: 30, md: 32 },
                                                borderRadius: "999px",
                                                bgcolor: item.color,
                                                color: "#fff",
                                                fontSize: { xs: "12px", sm: "13px", md: "14px" },
                                                fontWeight: 700,
                                                textTransform: "none",
                                                px: 1.8,
                                                boxShadow: "none",
                                                flexShrink: 0,
                                                "&:hover": {
                                                    bgcolor: item.color,
                                                    opacity: 0.92,
                                                    boxShadow: "none",
                                                },
                                            }}
                                        >
                                            {item.value}
                                        </Button>
                                    </Box>
                                ))}
                            </Paper>
                        ))}
                    </Box>

                    {/* Right section */}
                    {showTable && (
                        <Box
                            sx={{
                                minWidth: 0,
                                width: "100%",
                            }}
                        >
                            <Paper
                                sx={{
                                    width: "100%",
                                    maxWidth: "100%",
                                    borderRadius: { xs: 1.5, sm: 2, md: 2 },
                                    overflow: "hidden",
                                    boxShadow: "0 3px 12px rgba(0,0,0,0.12)",
                                }}
                            >
                                <Box
                                    sx={{
                                        px: { xs: 1, sm: 1.5, md: 2 },
                                        py: { xs: 1.2, sm: 1.4, md: 1.8 },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            textAlign: "center",
                                            fontSize: { xs: "13px", sm: "15px", md: "18px", lg: "20px" },
                                            fontWeight: 700,
                                            color: "#222",
                                            mb: { xs: 1.2, sm: 1.5, md: 1.8 },
                                            textTransform: "uppercase",
                                            lineHeight: 1.4,
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {currentTable.title}
                                    </Typography>

                                    <TableContainer
                                        sx={{
                                            width: "100%",
                                            maxWidth: "100%",
                                            overflowX: "auto",
                                            overflowY: "hidden",
                                            border: "1px solid #d8d8d8",
                                            borderRadius: 1,
                                            WebkitOverflowScrolling: "touch",
                                            "&::-webkit-scrollbar": {
                                                height: 6,
                                            },
                                            "&::-webkit-scrollbar-thumb": {
                                                backgroundColor: "#b8b8b8",
                                                borderRadius: 4,
                                            },
                                        }}
                                    >
                                        <Table
                                            size="small"
                                            sx={{
                                                minWidth: {
                                                    xs: currentTable.columns.length > 7 ? 900 : 650,
                                                    sm: currentTable.columns.length > 7 ? 1000 : 750,
                                                    md: currentTable.columns.length > 7 ? 1100 : 850,
                                                },
                                                tableLayout: "auto",
                                                bgcolor: "#fff",
                                            }}
                                        >
                                            <TableHead>
                                                <TableRow>
                                                    {currentTable.columns.map((col, index) => (
                                                        <TableCell
                                                            key={index}
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: { xs: "11px", sm: "12px", md: "14px" },
                                                                color: "#111",
                                                                border: "1px solid #d7d7d7",
                                                                whiteSpace: "nowrap",
                                                                px: { xs: 0.8, sm: 1.2, md: 1.5 },
                                                                py: { xs: 0.8, sm: 1, md: 1.4 },
                                                                bgcolor: "#f5f5f5",
                                                            }}
                                                        >
                                                            {col}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>

                                            <TableBody>
                                                {currentTable.rows.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={currentTable.columns.length}
                                                            sx={{
                                                                textAlign: "center",
                                                                py: { xs: 2, sm: 2.5, md: 3 },
                                                                fontSize: { xs: "12px", sm: "13px", md: "14px" },
                                                                color: "#666",
                                                                border: "1px solid #d7d7d7",
                                                            }}
                                                        >
                                                            No records found
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    currentTable.rows.map((row, rowIndex) => (
                                                        <TableRow key={rowIndex}>
                                                            {currentTable.columns.map((col, colIndex) => (
                                                                <TableCell
                                                                    key={colIndex}
                                                                    sx={{
                                                                        border: "1px solid #d7d7d7",
                                                                        whiteSpace: "nowrap",
                                                                        fontSize: { xs: "11px", sm: "12px", md: "14px" },
                                                                        px: { xs: 0.8, sm: 1.2, md: 1.5 },
                                                                        py: { xs: 0.8, sm: 1, md: 1.3 },
                                                                    }}
                                                                >
                                                                    {row[col] || "-"}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            </Paper>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default TravelData;