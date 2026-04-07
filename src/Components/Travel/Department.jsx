import React, { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Divider,
    TextField,
    FormControl,
    Select,
    MenuItem,
    ToggleButton,
    ToggleButtonGroup,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

export default function DepartmentExpenseFullPage() {
    const [travelType, setTravelType] = useState("Domestic");
    const [year, setYear] = useState("2026");
    const [location, setLocation] = useState("Chennai");
    const [department, setDepartment] = useState("Software");
    const [view, setView] = useState("Employee");
    const [employee, setEmployee] = useState("sakthivel k - 004");
    const [chartView, setChartView] = useState("OverAll");
    const [page, setPage] = useState(1);

    const summaryColumns = [
        "No. Of Travel",
        "Air Tickets",
        "Car Expense",
        "Other Tickets",
        "Hotel",
        "Food",
        "Taxi/Local",
        "Consumables",
        "Other",
        "Total",
    ];

    const summaryRows = [
        {
            "No. Of Travel": 0,
            "Air Tickets": "0.00L",
            "Car Expense": "0.00L",
            "Other Tickets": "0.00L",
            Hotel: "0.00L",
            Food: "0.00L",
            "Taxi/Local": "0.00L",
            Consumables: "0.00L",
            Other: "0.00L",
            Total: "0.00L",
        },
    ];

    const pieData = [
        { name: "Car", value: 0.01, color: "#d9edf2" },
        { name: "Ticket", value: 0.01, color: "#bfd7df" },
        { name: "Food", value: 0.01, color: "#a8c8d2" },
        { name: "Hotel", value: 0.01, color: "#8cb4c2" },
        { name: "Air", value: 0.01, color: "#5b93a9" },
        { name: "Taxi", value: 0.01, color: "#46788d" },
        { name: "Consume", value: 0.01, color: "#335d70" },
        { name: "Other", value: 0.01, color: "#223d4b" },
    ];

    const monthlyChartData = [
        { month: "Jan", value: 0 },
        { month: "Feb", value: 0 },
        { month: "Mar", value: 0 },
        { month: "Apr", value: 0 },
        { month: "May", value: 0 },
        { month: "Jun", value: 0 },
        { month: "Jul", value: 0 },
        { month: "Aug", value: 0 },
        { month: "Sep", value: 0 },
        { month: "Oct", value: 0 },
        { month: "Nov", value: 0 },
        { month: "Dec", value: 0 },
    ];



    const leftTableRows = [
        { month: "Jan", travel: 0, expense: "0.00" },
        { month: "Feb", travel: 0, expense: "0.00" },
        { month: "Mar", travel: 0, expense: "0.00" },
        { month: "Apr", travel: 0, expense: "0.00" },
        { month: "May", travel: 0, expense: "0.00" },
        { month: "Jun", travel: 0, expense: "0.00" },
        { month: "Jul", travel: 0, expense: "0.00" },
        { month: "Aug", travel: 0, expense: "0.00" },
        { month: "Sep", travel: 0, expense: "0.00" },
        { month: "Oct", travel: 0, expense: "0.00" },
        { month: "Nov", travel: 0, expense: "0.00" },
        { month: "Dec", travel: 0, expense: "0.00" },
    ];

    const rowsPerPage = 6;
    const totalPages = Math.ceil(leftTableRows.length / rowsPerPage);

    const paginatedRows = leftTableRows.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };
    const expenseDetailsData = [
        { month: "Jan", expense: 0 },
        { month: "Feb", expense: 0 },
        { month: "Mar", expense: 0 },
        { month: "Apr", expense: 0 },
        { month: "May", expense: 0 },
        { month: "Jun", expense: 0 },
        { month: "Jul", expense: 0 },
        { month: "Aug", expense: 0 },
        { month: "Sep", expense: 0 },
        { month: "Oct", expense: 0 },
        { month: "Nov", expense: 0 },
        { month: "Dec", expense: 0 },
    ];

    const detailedRows = [
        { month: "Jan", travel: 0, air: "0.00", car: "0.00", otherTickets: "0.00", hotel: "0.00", food: "0.00", taxi: "0.00", consumables: "0.00", other: "0.00", total: "0.00" },
        { month: "Feb", travel: 0, air: "0.00", car: "0.00", otherTickets: "0.00", hotel: "0.00", food: "0.00", taxi: "0.00", consumables: "0.00", other: "0.00", total: "0.00" },
        { month: "Mar", travel: 0, air: "0.00", car: "0.00", otherTickets: "0.00", hotel: "0.00", food: "0.00", taxi: "0.00", consumables: "0.00", other: "0.00", total: "0.00" },
        { month: "Apr", travel: 0, air: "0.00", car: "0.00", otherTickets: "0.00", hotel: "0.00", food: "0.00", taxi: "0.00", consumables: "0.00", other: "0.00", total: "0.00" },
        { month: "May", travel: 0, air: "0.00", car: "0.00", otherTickets: "0.00", hotel: "0.00", food: "0.00", taxi: "0.00", consumables: "0.00", other: "0.00", total: "0.00" },
        { month: "Jun", travel: 0, air: "0.00", car: "0.00", otherTickets: "0.00", hotel: "0.00", food: "0.00", taxi: "0.00", consumables: "0.00", other: "0.00", total: "0.00" },
        { month: "Jul", travel: 0, air: "0.00", car: "0.00", otherTickets: "0.00", hotel: "0.00", food: "0.00", taxi: "0.00", consumables: "0.00", other: "0.00", total: "0.00" },
        { month: "Aug", travel: 0, air: "0.00", car: "0.00", otherTickets: "0.00", hotel: "0.00", food: "0.00", taxi: "0.00", consumables: "0.00", other: "0.00", total: "0.00" },
        { month: "Sep", travel: 0, air: "0.00", car: "0.00", otherTickets: "0.00", hotel: "0.00", food: "0.00", taxi: "0.00", consumables: "0.00", other: "0.00", total: "0.00" },
        { month: "Oct", travel: 0, air: "0.00", car: "0.00", otherTickets: "0.00", hotel: "0.00", food: "0.00", taxi: "0.00", consumables: "0.00", other: "0.00", total: "0.00" },
        { month: "Nov", travel: 0, air: "0.00", car: "0.00", otherTickets: "0.00", hotel: "0.00", food: "0.00", taxi: "0.00", consumables: "0.00", other: "0.00", total: "0.00" },
        { month: "Dec", travel: 0, air: "0.00", car: "0.00", otherTickets: "0.00", hotel: "0.00", food: "0.00", taxi: "0.00", consumables: "0.00", other: "0.00", total: "0.00" },
    ];

    const handleGetData = () => {
        console.log({
            travelType,
            year,
            location,
            department,
            view,
            employee,
            chartView,
        });
    };

    return (
        <Box
            sx={{
                bgcolor: "#dfe6df",
                minHeight: "100vh",
                p: 1,
            }}
        >
            {/* SECTION 1 */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid #cdd5cd",
                    mb: 1,
                    bgcolor: "#eff3ef",
                }}
            >
                <Box
                    sx={{
                        textAlign: "center",
                        py: 1.5,
                        borderBottom: "1px solid #cdd5cd",
                    }}
                >
                    <Typography
                        sx={{
                            fontWeight: 700,
                            fontSize: 18,
                            color: "#425c43",
                        }}
                    >
                        Department Expense Dashboard
                    </Typography>
                </Box>

                <Box sx={{ p: 1.5, bgcolor: "#f6f8f6" }}>
                    <RadioGroup
                        row
                        value={travelType}
                        onChange={(e) => setTravelType(e.target.value)}
                        sx={{
                            display: "flex",
                            justifyContent: "space-around",
                            mb: 1,
                        }}
                    >
                        <FormControlLabel
                            value="Domestic"
                            control={<Radio size="small" />}
                            label="Domestic Travel"
                        />
                        <FormControlLabel
                            value="International"
                            control={<Radio size="small" />}
                            label="International Travel"
                        />
                    </RadioGroup>

                    <Divider sx={{ mb: 1.2, borderColor: "#53636b" }} />

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                md: "100px 200px 200px 420px 210px 110px",
                            },
                            gap: 1.5,
                            alignItems: "center",
                        }}
                    >
                        <TextField
                            size="small"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            sx={{ bgcolor: "#fff" }}
                        />

                        <FormControl size="small" sx={{ bgcolor: "#fff" }}>
                            <Select value={location} onChange={(e) => setLocation(e.target.value)}>
                                <MenuItem value="Chennai">Chennai</MenuItem>
                                <MenuItem value="Bangalore">Bangalore</MenuItem>
                                <MenuItem value="Coimbatore">Coimbatore</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ bgcolor: "#fff" }}>
                            <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                                <MenuItem value="Software">Software</MenuItem>
                                <MenuItem value="HR">HR</MenuItem>
                                <MenuItem value="Accounts">Accounts</MenuItem>
                            </Select>
                        </FormControl>

                        <ToggleButtonGroup
                            exclusive
                            value={view}
                            onChange={(_, newValue) => newValue && setView(newValue)}
                            fullWidth
                            sx={{
                                height: 40,
                                "& .MuiToggleButton-root": {
                                    textTransform: "none",
                                    fontWeight: 500,
                                    borderRadius: 0,
                                    color: "#777",
                                },
                                "& .Mui-selected": {
                                    bgcolor: "#2f2d73 !important",
                                    color: "#fff !important",
                                },
                            }}
                        >
                            <ToggleButton value="OverAll">OverAll</ToggleButton>
                            <ToggleButton value="Team">Team</ToggleButton>
                            <ToggleButton value="Employee">Employee</ToggleButton>
                        </ToggleButtonGroup>

                        <TextField
                            size="small"
                            value={employee}
                            onChange={(e) => setEmployee(e.target.value)}
                            sx={{ bgcolor: "#fff" }}
                        />

                        <Button
                            variant="contained"
                            onClick={handleGetData}
                            sx={{
                                bgcolor: "#8aa086",
                                color: "#fff",
                                textTransform: "none",
                                fontWeight: 600,
                                height: 40,
                                "&:hover": {
                                    bgcolor: "#758b72",
                                },
                            }}
                        >
                            Get Data
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ p: 1, bgcolor: "#edf2ed" }}>
                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            borderRadius: 1.5,
                            overflow: "hidden",
                        }}
                    >
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#8ea18e" }}>
                                    {summaryColumns.map((col) => (
                                        <TableCell
                                            key={col}
                                            align="center"
                                            sx={{
                                                color: "#fff",
                                                fontWeight: 700,
                                                fontSize: 13,
                                                borderBottom: "none",
                                                py: 1.3,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {col}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {summaryRows.map((row, index) => (
                                    <TableRow key={index} sx={{ bgcolor: "#ffffff" }}>
                                        {summaryColumns.map((col) => (
                                            <TableCell
                                                key={col}
                                                align="center"
                                                sx={{
                                                    py: 1.7,
                                                    fontSize: 13,
                                                    borderBottom: "none",
                                                }}
                                            >
                                                {row[col]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <Box
                    sx={{
                        p: 1,
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
                        gap: 1,
                        bgcolor: "#edf2ed",
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 1.5,
                            overflow: "hidden",
                            border: "1px solid #d9d9d9",
                            bgcolor: "#fff",
                            height: 335,
                        }}
                    >
                        <Box
                            sx={{
                                textAlign: "center",
                                py: 1,
                                borderBottom: "1px solid #315568",
                            }}
                        >
                            <Typography sx={{ fontSize: 16 }}>Category Wise</Typography>
                        </Box>

                        <Box sx={{ height: 280, p: 1 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={1}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                        iconType="rect"
                                        wrapperStyle={{ fontSize: "12px" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 1.5,
                            overflow: "hidden",
                            border: "1px solid #d9d9d9",
                            bgcolor: "#fff",
                            height: 335,
                        }}
                    >
                        <Box
                            sx={{
                                px: 1.5,
                                py: 1,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderBottom: "1px solid #315568",
                            }}
                        >
                            <Typography sx={{ fontSize: 16 }}>
                                Flight Ticket Expense (In Lakhs)
                            </Typography>

                            <FormControl size="small" sx={{ minWidth: 170 }}>
                                <Select
                                    value={chartView}
                                    onChange={(e) => setChartView(e.target.value)}
                                    sx={{ height: 34, bgcolor: "#fff" }}
                                >
                                    <MenuItem value="OverAll">OverAll</MenuItem>
                                    <MenuItem value="Pending">Pending</MenuItem>
                                    <MenuItem value="Approved">Approved</MenuItem>
                                    <MenuItem value="Processed">Processed</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Box sx={{ width: "100%", height: 275, p: 1 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyChartData}>
                                    <CartesianGrid stroke="#e1e1e1" />
                                    <XAxis dataKey="month" />
                                    <YAxis
                                        domain={[0, 1]}
                                        ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]}
                                    />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#4d6f8a"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Box>
            </Paper>

            {/* SECTION 2 */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
                    gap: 1,
                    mb: 1,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        p: 1.5,
                        border: "1px solid #d7ddd7",
                        bgcolor: "#fff",
                    }}
                >
                    <Table
                        size="small"
                        sx={{
                            "& th": {
                                fontWeight: 700,
                                fontSize: 14,
                                borderBottom: "1px solid #5c8aa3",
                            },
                            "& td": {
                                fontSize: 14,
                                borderBottom: "1px solid #315568",
                                py: 1.8,
                            },
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">Month</TableCell>
                                <TableCell align="center">No. Of Travel</TableCell>
                                <TableCell align="right">Expense (In Lakhs)</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedRows.map((row) => (
                                <TableRow key={row.month}>
                                    <TableCell align="left" sx={{ pl: 4 }}>
                                        {row.month}
                                    </TableCell>
                                    <TableCell align="center">{row.travel}</TableCell>
                                    <TableCell align="right">{row.expense}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            mt: 1.5,
                            gap: 1,
                        }}
                    >
                        <IconButton sx={{ color: "#2f2d73", p: 0.4 }}>
                            <DownloadIcon />
                        </IconButton>

                        <Button
                            variant="contained"
                            onClick={handlePrevPage}
                            disabled={page === 1}
                            sx={{
                                minWidth: 30,
                                width: 30,
                                height: 28,
                                p: 0,
                                bgcolor: "#2f2d73",
                                fontSize: 16,
                                "&.Mui-disabled": {
                                    bgcolor: "#b7b7d6",
                                    color: "#fff",
                                },
                            }}
                        >
                            {"<"}
                        </Button>

                        <Typography sx={{ fontSize: 14 }}>{page}</Typography>

                        <Button
                            variant="contained"
                            onClick={handleNextPage}
                            disabled={page === totalPages}
                            sx={{
                                minWidth: 30,
                                width: 30,
                                height: 28,
                                p: 0,
                                bgcolor: "#2f2d73",
                                fontSize: 16,
                                "&.Mui-disabled": {
                                    bgcolor: "#b7b7d6",
                                    color: "#fff",
                                },
                            }}
                        >
                            {">"}
                        </Button>
                    </Box>
                </Paper>

                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        p: 1,
                        border: "1px solid #d7ddd7",
                        bgcolor: "#fff",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottom: "1px solid #315568",
                            pb: 0.6,
                            mb: 1,
                        }}
                    >
                        <Typography sx={{ fontSize: 16 }}>Expense Details</Typography>

                        <FormControl size="small" sx={{ minWidth: 170 }}>
                            <Select
                                value={chartView}
                                onChange={(e) => setChartView(e.target.value)}
                                sx={{ height: 34 }}
                            >
                                <MenuItem value="OverAll">OverAll</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Approved">Approved</MenuItem>
                                <MenuItem value="Processed">Processed</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ width: "100%", height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={expenseDetailsData}>
                                <CartesianGrid stroke="#e1e1e1" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 1]}
                                    ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#4d6f8a"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Box>

            {/* SECTION 3 */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    p: 1.5,
                    border: "1px solid #d7ddd7",
                    bgcolor: "#fff",
                }}
            >
                <TableContainer>
                    <Table
                        size="small"
                        sx={{
                            "& th": {
                                fontWeight: 700,
                                fontSize: 14,
                                borderBottom: "1px solid #5c8aa3",
                                whiteSpace: "nowrap",
                            },
                            "& td": {
                                fontSize: 14,
                                borderBottom: "1px solid #315568",
                                py: 1.6,
                                whiteSpace: "nowrap",
                            },
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">Month</TableCell>
                                <TableCell align="center">No. Of Travel</TableCell>
                                <TableCell align="center">Air Tickets</TableCell>
                                <TableCell align="center">Car Expense</TableCell>
                                <TableCell align="center">Other Tickets</TableCell>
                                <TableCell align="center">Hotel</TableCell>
                                <TableCell align="center">Food</TableCell>
                                <TableCell align="center">Taxi/Local</TableCell>
                                <TableCell align="center">Consumables</TableCell>
                                <TableCell align="center">Other</TableCell>
                                <TableCell align="center">Total</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {detailedRows.map((row) => (
                                <TableRow key={row.month}>
                                    <TableCell align="left" sx={{ pl: 4 }}>
                                        {row.month}
                                    </TableCell>
                                    <TableCell align="center">{row.travel}</TableCell>
                                    <TableCell align="center">{row.air}</TableCell>
                                    <TableCell align="center">{row.car}</TableCell>
                                    <TableCell align="center">{row.otherTickets}</TableCell>
                                    <TableCell align="center">{row.hotel}</TableCell>
                                    <TableCell align="center">{row.food}</TableCell>
                                    <TableCell align="center">{row.taxi}</TableCell>
                                    <TableCell align="center">{row.consumables}</TableCell>
                                    <TableCell align="center">{row.other}</TableCell>
                                    <TableCell align="center">{row.total}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography
                    sx={{
                        mt: 1.5,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#333",
                    }}
                >
                    Notes :- All Values In Lakhs
                </Typography>
            </Paper>
        </Box>
    );
}