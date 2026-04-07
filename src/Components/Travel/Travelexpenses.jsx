import React, { useMemo, useState } from "react";
import {
    Box,
    Tabs,
    Tab,
    Paper,
    Typography,
    Stack,
    TextField,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider,
    Button,
    MenuItem,
    Select,
    FormControl,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

// Date pickers
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

/* Reusable Card Section */
function StatementCard({
    title,
    showYear = false,
    showRefresh = false,
    search,
    setSearch,
    columns,
    rows = [],
    year,
    setYear,
    yearOptions = [],
}) {
    const filtered = useMemo(() => {
        const q = (search || "").trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
    }, [rows, search]);

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 1,
                border: "1px solid #cfd7cf",
                overflow: "hidden",
                bgcolor: "#fff",
                mb: 2,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    bgcolor: "#5a725a",
                    px: 2,
                    py: 1.2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
                <Typography
                    sx={{
                        fontWeight: 700,
                        color: "#0f1b0f",
                        fontSize: "24px",
                    }}
                >
                    {title}
                </Typography>

                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                    {showYear && (
                        <FormControl size="small">
                            <Select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                sx={{
                                    minWidth: 110,
                                    height: 40,
                                    borderRadius: 999,
                                    backgroundColor: "#fff",
                                    fontWeight: 700,
                                    fontSize: "17px",
                                    "& .MuiSelect-select": {
                                        py: 0.8,
                                    },
                                }}
                            >
                                {yearOptions.map((y) => (
                                    <MenuItem key={y} value={y}>
                                        {y}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    <TextField
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search.."
                        sx={{
                            width: showYear ? 260 : 320,
                            "& .MuiOutlinedInput-root": {
                                height: 40,
                                background: "white",
                                fontSize: "17px",
                            },
                            "& .MuiInputBase-input": {
                                fontSize: "17px",
                            },
                        }}
                    />

                    {showRefresh && (
                        <IconButton
                            size="small"
                            sx={{
                                color: "#0f1b0f",
                                "& .MuiSvgIcon-root": {
                                    fontSize: "28px",
                                },
                            }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    )}
                </Stack>
            </Box>

            {/* Table */}
            <TableContainer sx={{ bgcolor: "#fff" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {columns.map((h) => (
                                <TableCell
                                    key={h}
                                    sx={{
                                        fontWeight: 700,
                                        color: "#1a1a1a",
                                        borderBottom: "1px solid #e6eae6",
                                        whiteSpace: "nowrap",
                                        fontSize: "17px",
                                        py: 1.5,
                                    }}
                                >
                                    {h}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>


                </Table>
            </TableContainer>

            <Divider />

            {/* Footer */}
            <Box
                sx={{
                    px: 2,
                    py: 1.1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                }}
            >
                <Typography
                    sx={{
                        color: "#2c2c2c",
                        fontSize: "17px",
                        fontWeight: 500,
                    }}
                >
                    No.of Rows : {filtered.length}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{
                            minWidth: 80,
                            height: 38,
                            fontSize: "16px",
                            textTransform: "none",
                            fontWeight: 600,
                        }}
                    >
                        Back
                    </Button>

                    <Box
                        sx={{
                            px: 1.8,
                            py: 0.8,
                            border: "1px solid #cfd7cf",
                            borderRadius: 0.7,
                            fontSize: "16px",
                            fontWeight: 500,
                            bgcolor: "#fff",
                        }}
                    >
                        {`1 of ${filtered.length === 0 ? 0 : 1}`}
                    </Box>

                    <Button
                        variant="outlined"
                        size="small"
                        sx={{
                            minWidth: 80,
                            height: 38,
                            fontSize: "16px",
                            textTransform: "none",
                            fontWeight: 600,
                        }}
                    >
                        Next
                    </Button>
                </Stack>
            </Box>
        </Paper>
    );
}

export default function ExpenseStatementPage() {
    const [tab, setTab] = useState(0);

    const [selectedYear, setSelectedYear] = useState("2026");

    const [createSearch, setCreateSearch] = useState("");
    const [pendingSearch, setPendingSearch] = useState("");
    const [approvedSearch, setApprovedSearch] = useState("");

    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const yearOptions = ["2024", "2025", "2026", "2027", "2028"];

    const createRows = useMemo(() => [], []);
    const pendingRows = useMemo(() => [], []);
    const approvedRows = useMemo(() => [], []);

    const handleViewData = () => {
        console.log("View Data:", {
            year: selectedYear,
            from: fromDate ? fromDate.format("YYYY-MM-DD") : null,
            to: toDate ? toDate.format("YYYY-MM-DD") : null,
        });
    };

    const handleDownloadExcel = () => {
        console.log("Download Excel:", {
            year: selectedYear,
            from: fromDate ? fromDate.format("YYYY-MM-DD") : null,
            to: toDate ? toDate.format("YYYY-MM-DD") : null,
        });
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#e6ebe6", p: 1.5 }}>
            {/* Tabs */}
            <Paper
                elevation={0}
                sx={{
                    bgcolor: "#d6ded6",
                    borderRadius: 0.5,
                    px: 1,
                    border: "1px solid #cfd7cf",
                }}
            >
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    textColor="inherit"
                    indicatorColor="success"
                    sx={{
                        minHeight: 48,
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 700,
                            minHeight: 48,
                            py: 0.5,
                            fontSize: "18px",
                        },
                    }}
                >
                    <Tab label="Create Expense Statement" />
                    <Tab label="View Expense Statement" />
                    <Tab label="Reports" />
                </Tabs>
            </Paper>

            <Box sx={{ mt: 1.5 }}>
                {/* TAB 0 */}
                {tab === 0 && (
                    <StatementCard
                        title="Expense Statement"
                        showYear
                        showRefresh
                        search={createSearch}
                        setSearch={setCreateSearch}
                        year={selectedYear}
                        setYear={setSelectedYear}
                        yearOptions={yearOptions}
                        columns={[
                            "TAF-No",
                            "Travel Type",
                            "Purpose",
                            "Travel Location",
                            "Date of travel",
                            "No of Days",
                            "Advance Amt.",
                            "Expense Amt.",
                            "Status",
                        ]}
                        rows={createRows}
                    />
                )}

                {/* TAB 1 */}
                {tab === 1 && (
                    <>
                        <StatementCard
                            title="Pending For Approval"
                            showYear
                            showRefresh
                            search={pendingSearch}
                            setSearch={setPendingSearch}
                            year={selectedYear}
                            setYear={setSelectedYear}
                            yearOptions={yearOptions}
                            columns={[
                                "TAF-No",
                                "Travel Type",
                                "Purpose",
                                "Location",
                                "Date of Travel",
                                "No. of Day",
                                "Advance Amt.",
                                "Expense Amt.",
                                "Approver 1",
                                "Approver 2",
                                "Accounts",
                            ]}
                            rows={pendingRows}
                        />

                        <StatementCard
                            title="Approved Statement"
                            showYear
                            showRefresh
                            search={approvedSearch}
                            setSearch={setApprovedSearch}
                            year={selectedYear}
                            setYear={setSelectedYear}
                            yearOptions={yearOptions}
                            columns={[
                                "TAF-No",
                                "Travel Type",
                                "TID",
                                "Purpose",
                                "Location",
                                "Date of Travel",
                                "No. of Days",
                                "Advance Amt.",
                                "Expense Amt.",
                            ]}
                            rows={approvedRows}
                        />
                    </>
                )}

                {/* TAB 2 */}
                {tab === 2 && (
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 1,
                            border: "1px solid #cfd7cf",
                            bgcolor: "#fff",
                            overflow: "hidden",
                            maxWidth: 1200,
                            mx: "auto",
                        }}
                    >
                        {/* Title */}
                        <Box sx={{ py: 2, px: 2 }}>
                            <Typography
                                sx={{
                                    textAlign: "center",
                                    fontWeight: 800,
                                    fontSize: "26px",
                                }}
                            >
                                Consolidated Expense Report
                            </Typography>
                        </Box>

                        <Divider />

                        {/* Report filter row */}
                        <Box sx={{ px: 2, py: 2.5 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Stack
                                    direction={{ xs: "column", md: "row" }}
                                    spacing={2}
                                    alignItems={{ xs: "stretch", md: "flex-end" }}
                                >
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: "17px", fontWeight: 500, mb: 0.8 }}>
                                            Year
                                        </Typography>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(e.target.value)}
                                                sx={{
                                                    height: 42,
                                                    bgcolor: "#f2f2f2",
                                                    fontSize: "17px",
                                                }}
                                            >
                                                {yearOptions.map((y) => (
                                                    <MenuItem key={y} value={y}>
                                                        {y}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: "17px", fontWeight: 500, mb: 0.8 }}>
                                            From Date
                                        </Typography>
                                        <DatePicker
                                            value={fromDate}
                                            onChange={(v) => setFromDate(v)}
                                            format="DD-MM-YYYY"
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    sx: {
                                                        "& .MuiOutlinedInput-root": {
                                                            bgcolor: "#f2f2f2",
                                                            height: 42,
                                                        },
                                                        "& .MuiInputBase-input": {
                                                            fontSize: "17px",
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: "17px", fontWeight: 500, mb: 0.8 }}>
                                            To Date
                                        </Typography>
                                        <DatePicker
                                            value={toDate}
                                            onChange={(v) => setToDate(v)}
                                            format="DD-MM-YYYY"
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    sx: {
                                                        "& .MuiOutlinedInput-root": {
                                                            bgcolor: "#f2f2f2",
                                                            height: 42,
                                                        },
                                                        "& .MuiInputBase-input": {
                                                            fontSize: "17px",
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </Box>

                                    <Button
                                        variant="contained"
                                        onClick={handleViewData}
                                        sx={{
                                            flex: 1,
                                            height: 42,
                                            textTransform: "none",
                                            fontWeight: 700,
                                            fontSize: "17px",
                                            bgcolor: "#1976d2",
                                        }}
                                    >
                                        View Data
                                    </Button>

                                    <Button
                                        variant="contained"
                                        onClick={handleDownloadExcel}
                                        sx={{
                                            flex: 1,
                                            height: 42,
                                            textTransform: "none",
                                            fontWeight: 700,
                                            fontSize: "17px",
                                            bgcolor: "#1976d2",
                                        }}
                                    >
                                        Download Excel
                                    </Button>
                                </Stack>
                            </LocalizationProvider>
                        </Box>
                    </Paper>
                )}
            </Box>
        </Box>
    );
}