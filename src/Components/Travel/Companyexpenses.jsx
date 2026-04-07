import React, { useMemo, useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../../assets/connection";
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    Select,
    MenuItem,
    InputAdornment,
    InputLabel,
    FormHelperText,
    useTheme,
    useMediaQuery,
    Switch,
    Dialog,
    DialogContent,
    Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ReactECharts from "echarts-for-react";

const AmountTabs = () => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));
    const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
    const isMdDown = useMediaQuery(theme.breakpoints.down("md"));
    const isLgDown = useMediaQuery(theme.breakpoints.down("lg"));

    const [docUploadOpt, setDocUploadOpt] = useState("No");
    const [purchaseTypeOptions, setPurchaseTypeOptions] = useState([]);
    const [purchaseTypeLoading, setPurchaseTypeLoading] = useState(false);
    const [showCategoryBar, setShowCategoryBar] = useState(false);
    const [openReceivedPopup, setOpenReceivedPopup] = useState(false);
    const [chartViewMode, setChartViewMode] = useState("month");

    const amountInputRef = useRef(null);
    const remarksInputRef = useRef(null);
    const hiddenFileInputRef = useRef(null);

    const [receivedForm, setReceivedForm] = useState({
        date: dayjs(),
        amount: "",
    });

    const [spentForm, setSpentForm] = useState({
        date: dayjs(),
        purchaseType: "",
        amount: "",
        bill: null,
        remarks: "",
    });

    const [receivedList, setReceivedList] = useState([]);
    const [spentList, setSpentList] = useState([]);
    const [errors, setErrors] = useState({});

    const [deleteId, setDeleteId] = useState(null);
    const [deleteType, setDeleteType] = useState("");
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const [summaryData, setSummaryData] = useState({
        currentMonthAdvance: 0,
        currentYearAdvance: 0,
        currentMonthExpense: 0,
        currentYearExpense: 0,
    });

    // Search states for Table1
    const [showSearch, setShowSearch] = useState(false);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [searchType, setSearchType] = useState("");

    useEffect(() => {
        loadPurchaseTypes();
        fetchSummaryData();
        fetchSpentData();
        fetchReceivedData();
    }, []);

    //get API table CALL
    const fetchSpentData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/TravelMaster/spent_new`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch spent data");
            }

            const data = await response.json();

            const formattedData = Array.isArray(data)
                ? data.map((item, index) => ({
                    id: item.id || index + 1,
                    date: item.date || null,
                    purchaseTypeName:

                        item.name ||
                        "-",
                    amount: Number(item.amount || 0),
                    remarks: item.remarks || "-",
                    uploadbill: item.billFile || item.uploadbill || "-",
                }))
                : [];

            setSpentList(formattedData);
        } catch (error) {
            console.error("Fetch Spent API Error:", error);
            setSpentList([]);
        }
    };

    const fetchReceivedData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/TravelMaster/received`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch received data");
            }

            const data = await response.json();

            const formattedData = Array.isArray(data)
                ? data.map((item, index) => ({
                    id: item.id || index + 1,
                    date: item.date || null,
                    amount: Number(item.amount || 0),
                }))
                : [];

            setReceivedList(formattedData);
        } catch (error) {
            console.error("Fetch Received API Error:", error);
            setReceivedList([]);
        }
    };

    // this code advance amount and total expence api call

    const fetchSummaryData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/TravelMaster/summary`);

            if (!response.ok) {
                throw new Error("Failed to fetch summary data");
            }

            const data = await response.json();

            setSummaryData({
                currentMonthAdvance: Number(data?.monthReceived || 0),
                currentYearAdvance: Number(data?.yearReceived || 0),
                currentMonthExpense: Number(data?.monthExpense || 0),
                currentYearExpense: Number(data?.yearExpense || 0),
            });
        } catch (error) {
            console.error("Summary API Error:", error);
        }
    };

    const loadPurchaseTypes = async () => {
        try {
            setPurchaseTypeLoading(true);

            const response = await fetch(`${API_BASE_URL}/api/travelmaster/purchase-types`);

            if (!response.ok) {
                throw new Error("Failed to fetch purchase types");
            }

            const data = await response.json();
            setPurchaseTypeOptions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Purchase Type API Error:", error);
            setPurchaseTypeOptions([]);
        } finally {
            setPurchaseTypeLoading(false);
        }
    };

    const handleReceivedChange = (e) => {
        const { name, value } = e.target;

        if (name === "amount") {
            const regex = /^\d*\.?\d{0,2}$/;
            if (value !== "" && !regex.test(value)) {
                return;
            }
        }

        setReceivedForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddReceived = async () => {
        if (!receivedForm.date || !receivedForm.amount) {
            alert("Please fill Date and Amount");
            return;
        }

        const payload = {
            id: 0,
            date: dayjs(receivedForm.date).toISOString(),
            amount: Number(receivedForm.amount || 0),
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/TravelMaster/received`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to save received amount");
            }

            await response.json();

            setReceivedForm({
                date: dayjs(),
                amount: "",
            });

            // Refresh summary and existing list
            fetchSummaryData();
            fetchReceivedData();

            setOpenReceivedPopup(false);
            alert("Advance amount added successfully");
        } catch (error) {
            console.error("Add Received API Error:", error);
            alert("Failed to add advance amount. Please try again.");
        }
    };

    // dropdown api
    const handleSpentSubmit = async () => {
        let newErrors = {};

        if (!spentForm.date) newErrors.date = "Please select date";
        if (!spentForm.purchaseType) newErrors.purchaseType = "Please select purchase type";
        if (!spentForm.amount) newErrors.amount = "Please enter amount";
        if (!spentForm.remarks) newErrors.remarks = "Please enter remarks";

        if (docUploadOpt === "Yes" && !spentForm.bill) {
            newErrors.bill = "Please upload bill";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        const selectedPurchaseType = purchaseTypeOptions.find(
            (item) => String(item.id) === String(spentForm.purchaseType)
        );

        const purchaseTypeId = selectedPurchaseType?.id || "";
        const purchaseTypeNameStr = selectedPurchaseType?.name || "";

        if (!purchaseTypeId) {
            alert("Purchase type not found");
            return;
        }

        const payload = {
            id: 0,
            date: dayjs(spentForm.date).toISOString(),
            purchaseItem: purchaseTypeId,
            amount: Number(spentForm.amount || 0),
            remarks: spentForm.remarks,
            billFile: spentForm.bill ? spentForm.bill.name : "",
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/TravelMaster/spent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error("Failed to save spent amount");
            }

            const newEntry = {
                id: result?.id || Date.now(),
                ...payload,
                purchaseTypeName: purchaseTypeNameStr,
                purchaseType: spentForm.purchaseType,
            };

            setSpentList((prev) => [...prev, newEntry]);

            setSpentForm({
                date: dayjs(),
                purchaseType: "",
                purchaseItem: "",
                amount: "",
                bill: null,
                remarks: "",
            });

            setDocUploadOpt("No");
            setErrors({});
            fetchSummaryData();
        } catch (error) {
            console.error("Spent Save API Error:", error);
            alert("Spent amount not saved. Please try again.");
        }
    };

    const handleSpentChange = (e) => {
        const { name, value } = e.target;

        if (name === "amount") {
            const regex = /^\d*\.?\d{0,2}$/;
            if (value !== "" && !regex.test(value)) {
                return;
            }
        }

        setSpentForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        if (name === "purchaseType") {
            setTimeout(() => {
                amountInputRef.current?.focus();
            }, 100);
        }
    };

    const handleBillUpload = (e) => {
        const file = e.target.files?.[0] || null;
        setSpentForm((prev) => ({
            ...prev,
            bill: file,
        }));

        setErrors((prev) => ({
            ...prev,
            bill: "",
        }));
    };

    const openFilePicker = () => {
        if (docUploadOpt !== "Yes") return;
        hiddenFileInputRef.current?.click();
    };

    const handleDeleteSpent = (id) => {
        setSpentList((prev) => prev.filter((item) => item.id !== id));
    };

    const handleDeleteReceived = (id) => {
        setReceivedList((prev) => prev.filter((item) => item.id !== id));
    };

    // this code delete api call

    const handleConfirmDelete = async () => {
        try {
            if (deleteType === "spent") {
                const response = await fetch(
                    `${API_BASE_URL}/api/TravelMaster/spent/${deleteId}`,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                const text = await response.text();
                let result = {};
                if (text) {
                    try {
                        result = JSON.parse(text);
                    } catch (e) {
                        console.warn("Non-JSON response:", text);
                    }
                }

                if (!response.ok) {
                    throw new Error(result?.message || "Failed to delete spent data");
                }

                setSpentList((prev) =>
                    prev.filter((item) => String(item.id) !== String(deleteId))
                );

                alert(result?.message || "Spent deleted successfully");
            } else if (deleteType === "received") {
                setReceivedList((prev) =>
                    prev.filter((item) => String(item.id) !== String(deleteId))
                );
            }

            setDeleteId(null);
            setDeleteType("");
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error("Delete API Error:", error);
            alert(error.message || "Delete failed. Please try again.");
        }
    };


    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const categoryChartData = useMemo(() => {
        const filteredList = spentList.filter((item) => {
            if (!item?.date) return false;

            const itemDate = dayjs(item.date);
            if (!itemDate.isValid()) return false;

            if (chartViewMode === "month") {
                return itemDate.year() === currentYear && itemDate.month() === currentMonth;
            }

            return itemDate.year() === currentYear;
        });

        const grouped = filteredList.reduce((acc, item) => {
            const rawName = item?.purchaseTypeName ?? item?.purchaseType ?? "Others";

            const key =
                typeof rawName === "string"
                    ? rawName.trim() || "Others"
                    : String(rawName ?? "Others");

            const amount =
                typeof item?.amount === "number" || typeof item?.amount === "string"
                    ? Number(item.amount || 0)
                    : 0;

            acc[key] = (acc[key] || 0) + amount;
            return acc;
        }, {});

        return Object.keys(grouped).map((key) => ({
            name: String(key),
            value: Number(grouped[key]) || 0,
        }));
    }, [spentList, chartViewMode, currentYear, currentMonth]);

    const safeCategoryData = useMemo(() => {
        if (!Array.isArray(categoryChartData) || categoryChartData.length === 0) {
            return [{ name: "No Data", value: 0 }];
        }

        return categoryChartData.map((item) => ({
            name: typeof item?.name === "string" ? item.name : String(item?.name ?? "Others"),
            value: Number(item?.value) || 0,
        }));
    }, [categoryChartData]);

    const currentMonthName = dayjs().format("MMMM");
    const currentYearLabel = dayjs().format("YYYY");

    const chartColors = [
        // "#5A725A", // main green
        "#7F9F7F", // light green
        "#A3C1A3", // soft green
        // "#cee2ce", // very light green
        "#F4A261", // orange highlight
        "#E76F51", // soft red
    ];

    const tableHeadSx = {
        color: "#fff",
        fontWeight: 700,
        whiteSpace: "nowrap",
        textAlign: "center",
        fontSize: { xs: 12, sm: 13, md: 14 },
        px: { xs: 1, sm: 1.5 },
        py: 1.2,
        bgcolor: "rgb(90,114,90) !important", // Fixed background for sticky header
    };

    const commonPaperSx = {
        borderRadius: { xs: 2.5, sm: 3, md: 4 },
        border: "1px solid #e5e7eb",
        backgroundColor: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    };

    const commonFieldLabelSx = {
        pb: 0.8,
        fontWeight: 500,
        fontSize: { xs: 13, sm: 14 },
    };

    const summaryCardSx = {

        borderRadius: 3,
        p: { xs: 2, sm: 2.4, md: 2.8 },
        border: "1px solid #d9d9d9",
        backgroundColor: "#fff",
        minHeight: { xs: 80, sm: 90, md: 100 },
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        alignContent: "flex-start",
        rowGap: 2,
        columnGap: 2,
    };


    const barOption = useMemo(
        () => ({
            color: chartColors,
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
            },
            xAxis: {
                type: "category",
                data: safeCategoryData.map((d) => d.name),
                axisLabel: {
                    color: "#555",
                    interval: 0,
                    rotate: isXs ? 25 : 0,
                    fontSize: isXs ? 10 : 12,
                },
            },
            yAxis: {
                type: "value",
                axisLabel: {
                    fontSize: isXs ? 10 : 12,
                },
            },
            series: [
                {
                    type: "bar",
                    data: safeCategoryData.map((d, index) => ({
                        value: Number(d.value) || 0,
                        itemStyle: {
                            color: chartColors[index % chartColors.length],
                            borderRadius: [10, 10, 0, 0],
                        },
                    })),
                    barWidth: isXs ? 24 : isSm ? 34 : 46,
                    label: {
                        show: !isXs,
                        position: "top",
                        formatter: ({ value }) => `₹ ${Number(value) || 0}`,
                        fontSize: 11,
                    },
                },
            ],
            grid: {
                left: isXs ? "8%" : "5%",
                right: isXs ? "4%" : "3%",
                bottom: isXs ? "14%" : "8%",
                top: "12%",
                containLabel: true,
            },
        }),
        [safeCategoryData, isXs, isSm]
    );

    const pieOption = useMemo(
        () => ({
            color: chartColors,
            tooltip: {
                trigger: "item",
                formatter: (params) =>
                    `${params.name}: ₹ ${Number(params.value) || 0} (${params.percent || 0}%)`,
            },
            legend: {
                top: "bottom",
                icon: "circle",
                textStyle: {
                    fontSize: isXs ? 10 : 12,
                },
            },
            series: [
                {
                    name: "Expenses",
                    type: "pie",
                    radius: isXs ? ["38%", "62%"] : isSm ? ["42%", "66%"] : ["50%", "70%"],
                    center: ["50%", isXs ? "42%" : "45%"],
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: "#fff",
                        borderWidth: 3,
                    },
                    label: { show: false },
                    emphasis: {
                        scale: true,
                        scaleSize: 8,
                    },
                    data: safeCategoryData.map((d) => ({
                        name: d.name,
                        value: Number(d.value) || 0,
                    })),
                },
            ],
        }),
        [safeCategoryData, isXs, isSm]
    );

    // Combined filtering logic for Table1
    const filteredSpentList = useMemo(() => {
        return spentList.filter((item) => {
            if (!item.date) return false;
            const itemDate = dayjs(item.date).startOf("day");

            // From Date filter
            if (fromDate) {
                const start = dayjs(fromDate).startOf("day");
                if (itemDate.isBefore(start)) return false;
            }

            // To Date filter
            if (toDate) {
                const end = dayjs(toDate).startOf("day");
                if (itemDate.isAfter(end)) return false;
            }

            // Purchase Type filter
            if (searchType) {
                const selectedType = purchaseTypeOptions.find(o => String(o.id) === String(searchType));
                const selectedName = selectedType?.name;

                // Check if item has purchaseType ID or if its purchaseTypeName matches
                const matchesId = item.purchaseType && String(item.purchaseType) === String(searchType);
                const matchesName = item.purchaseTypeName && selectedName && String(item.purchaseTypeName) === String(selectedName);

                if (!matchesId && !matchesName) return false;
            }

            return true;
        });
    }, [spentList, fromDate, toDate, searchType, purchaseTypeOptions]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                sx={{
                    p: { xs: 1, sm: 2, md: 3 },
                    bgcolor: "#e6e7e9",
                    minHeight: "100vh",
                }}
            >
                <Box
                    sx={{
                        maxWidth: 1700,
                        mx: "auto",
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            xl: "1.1fr 0.9fr",
                        },
                        gap: { xs: 1.5, sm: 2, md: 2.5 },
                    }}
                >
                    <Box
                        sx={{
                            display: "grid",
                            gap: { xs: 1.5, sm: 2, md: 2.5 },
                        }}
                    >
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "1fr 1fr",
                                },
                                gap: { xs: 1.5, sm: 2, md: 2.5 },
                            }}
                        >
                            <Paper
                                sx={{
                                    ...summaryCardSx,
                                    cursor: "pointer",
                                    // backgroundColor: "#abebca", 
                                }}
                                onClick={() => setOpenReceivedPopup(true)}
                            >
                                <Typography
                                    sx={{
                                        fontSize: { xs: 18, sm: 22, md: 24 },
                                        fontWeight: 500,

                                        mb: 0.5,
                                        width: "100%",

                                    }}
                                >
                                    Advance Amount
                                </Typography>

                                <Box sx={{ flex: 1, pb: -3 }}>
                                    <Typography sx={{ fontSize: { xs: 12, sm: 14 }, color: "#4b5563", mb: 0.6 }}>
                                        {currentMonthName}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: 20, sm: 26, md: 28 },
                                            fontWeight: 700,
                                            color: "#50774e",
                                            lineHeight: 1.1,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        ₹ {Number(summaryData.currentMonthAdvance || 0).toFixed(2)}
                                    </Typography>
                                </Box>

                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: { xs: 12, sm: 14 }, color: "#4b5563", mb: 0.6 }}>
                                        {currentYearLabel} year
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: 20, sm: 26, md: 28 },
                                            fontWeight: 700,
                                            color: "#111",
                                            lineHeight: 1.1,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        (₹ {Number(summaryData.currentYearAdvance || 0).toFixed(2)})
                                    </Typography>
                                </Box>
                            </Paper>

                            <Paper sx={summaryCardSx}>
                                <Typography
                                    sx={{
                                        fontSize: { xs: 18, sm: 22, md: 24 },
                                        fontWeight: 500,
                                        color: "#2f4a6d",
                                        mb: 0.5,
                                        width: "100%",
                                    }}
                                >
                                    Total Expense
                                </Typography>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: { xs: 12, sm: 14 }, color: "#4b5563", mb: 0.6 }}>
                                        {currentMonthName}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: 20, sm: 26, md: 28 },
                                            fontWeight: 700,
                                            color: "#eb7b12",
                                            lineHeight: 1.1,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        ₹ {Number(summaryData.currentMonthExpense || 0).toFixed(2)}
                                    </Typography>

                                </Box>

                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: { xs: 12, sm: 14 }, color: "#4b5563", mb: 0.6 }}>
                                        {currentYearLabel} year
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: 20, sm: 26, md: 28 },
                                            fontWeight: 700,
                                            color: "#111",
                                            lineHeight: 1.1,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        (₹ {Number(summaryData.currentYearExpense || 0).toFixed(2)})
                                    </Typography>
                                </Box>
                            </Paper>
                        </Box>

                        <Paper
                            elevation={0}
                            sx={{
                                ...commonPaperSx,
                                p: { xs: 1.5, sm: 2.5, md: 3 },
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    mb: 2.5,
                                    fontSize: { xs: 18, sm: 19, md: 20 },
                                }}
                            >
                                Spent Amount Details
                            </Typography>

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        sm: "1fr 1fr",
                                        lg: "repeat(3, 1fr)",
                                    },
                                    gap: { xs: 1.5, sm: 2 },
                                }}
                            >
                                <Box>
                                    <InputLabel sx={{ mb: 0.8 }}>Select Date</InputLabel>
                                    <DatePicker
                                        value={spentForm.date}
                                        onChange={(newValue) => {
                                            setSpentForm((prev) => ({
                                                ...prev,
                                                date: newValue,
                                            }));

                                            setErrors((prev) => ({
                                                ...prev,
                                                date: "",
                                            }));
                                        }}
                                        format="DD/MM/YYYY"
                                        disableFuture
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                                fullWidth: true,
                                                error: !!errors.date,
                                                helperText: errors.date,
                                            },
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Typography sx={commonFieldLabelSx}>Purchase Type</Typography>
                                    <FormControl fullWidth size="small" error={!!errors.purchaseType}>
                                        <Select
                                            name="purchaseType"
                                            value={spentForm.purchaseType}
                                            onChange={handleSpentChange}
                                            displayEmpty
                                            renderValue={(selected) => {
                                                if (!selected) {
                                                    return <span style={{ color: "#999" }}>Select Type</span>;
                                                }

                                                const selectedItem = purchaseTypeOptions.find(
                                                    (item) => String(item?.id) === String(selected)
                                                );

                                                return typeof selectedItem?.name === "string"
                                                    ? selectedItem.name
                                                    : String(selected);
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em>{purchaseTypeLoading ? "Loading..." : "Select Type"}</em>
                                            </MenuItem>

                                            {purchaseTypeOptions.map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {typeof item?.name === "string"
                                                        ? item.name
                                                        : String(item?.name ?? "")}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>{errors.purchaseType}</FormHelperText>
                                    </FormControl>
                                </Box>

                                <Box>
                                    <Typography sx={commonFieldLabelSx}>Amount (Rs)</Typography>
                                    <TextField
                                        inputRef={amountInputRef}
                                        placeholder="Enter amount"
                                        name="amount"
                                        type="number"
                                        value={spentForm.amount}
                                        onChange={handleSpentChange}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                remarksInputRef.current?.focus();
                                            }
                                        }}
                                        fullWidth
                                        size="small"
                                        error={!!errors.amount}
                                        helperText={errors.amount}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                        }}
                                    />
                                </Box>
                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight: 500,
                                            fontSize: { xs: 13, sm: 14 },
                                            mb: 0.8,
                                        }}
                                    >
                                        Upload Bill
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            flexWrap: "wrap",

                                        }}
                                    >
                                        <RadioGroup
                                            row
                                            value={docUploadOpt}
                                            onChange={(e) => setDocUploadOpt(e.target.value)}

                                        >
                                            <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                            <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                        </RadioGroup>

                                        <input
                                            ref={hiddenFileInputRef}
                                            type="file"
                                            onChange={handleBillUpload}
                                            disabled={docUploadOpt !== "Yes"}
                                            style={{ display: "none" }}
                                        />


                                        <IconButton
                                            onClick={openFilePicker}
                                            disabled={docUploadOpt !== "Yes"}
                                            sx={{
                                                border: "1px solid #cbd5e1",
                                                borderRadius: 1,
                                                bgcolor: docUploadOpt === "Yes" ? "#fff" : "#f3f4f6",
                                                color: docUploadOpt === "Yes" ? "#3f6941" : "#9ca3af",
                                                width: 24,
                                                height: 34,
                                            }}
                                        >
                                            <UploadFileIcon sx={{ fontSize: 18 }} />
                                        </IconButton>

                                        <Typography
                                            sx={{
                                                fontSize: 12,
                                                color: "#6b7280",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {spentForm.bill ? spentForm.bill.name : "No file chosen"}
                                        </Typography>


                                        {errors.bill && (
                                            <Typography sx={{ color: "red", fontSize: 12, mt: 0.5, width: "100%" }}>
                                                {errors.bill}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                <Box
                                    sx={{

                                        gridColumn: { xs: "auto", lg: "span 2" },
                                    }}
                                >
                                    <Typography sx={commonFieldLabelSx}>Remarks</Typography>
                                    <TextField
                                        inputRef={remarksInputRef}
                                        name="remarks"
                                        value={spentForm.remarks}
                                        onChange={handleSpentChange}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSpentSubmit();
                                            }
                                        }}
                                        fullWidth
                                        size="small"
                                        multiline
                                        minRows={isXs ? 2 : 1}
                                        placeholder="Enter remarks"
                                        error={!!errors.remarks}
                                        helperText={errors.remarks}
                                    />
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    mt: 3,
                                    display: "flex",
                                    justifyContent: { xs: "stretch", sm: "center" },
                                }}
                            >
                                <Button
                                    variant="contained"
                                    onClick={handleSpentSubmit}
                                    fullWidth={isXs}
                                    sx={{

                                        px: 4,
                                        minWidth: { xs: "100%", sm: 140 },
                                        bgcolor: "#3f6941",
                                        textTransform: "none",
                                        borderRadius: 2,
                                        py: { xs: 1.1, sm: 0.9 },
                                        "&:hover": { bgcolor: "rgb(90,114,90)" },
                                    }}
                                >
                                    Add
                                </Button>
                            </Box>
                        </Paper>
                    </Box>

                    <Paper
                        sx={{
                            ...commonPaperSx,
                            p: { xs: 1.5, sm: 2, md: 2.5 },
                            minHeight: { xs: 220, sm: 260, md: 300, xl: 340 },
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: { xs: "flex-start", sm: "center" },
                                mb: 1.2,
                                flexDirection: { xs: "column", sm: "row" },
                                gap: 1.5,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    color: "rgb(90,114,90)",
                                    fontSize: { xs: 18, sm: 22, md: 24 },
                                    mb: 5,
                                }}
                            >
                                Spending by Category
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    gap: 1,
                                    width: "fit-content",
                                    ml: "auto",
                                }}
                            >
                                {/* PIE / BAR slider */}
                                <Box
                                    onClick={() => setShowCategoryBar((prev) => !prev)}
                                    sx={{
                                        position: "relative",
                                        width: { xs: 72, sm: 107 },
                                        height: { xs: 20, sm: 26 },
                                        borderRadius: "3px",
                                        bgcolor: "#d9d9d9",
                                        border: "2px solid #bfbfbf",
                                        cursor: "pointer",
                                        overflow: "hidden",
                                        userSelect: "none",
                                        boxShadow: "inset 0 1px 4px rgba(0,0,0,0.18)",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 3,
                                            left: showCategoryBar ? "calc(50% + 1px)" : 3,
                                            width: "calc(50% - 4px)",
                                            height: "calc(100% - 6px)",
                                            borderRadius: "2px",
                                            bgcolor: showCategoryBar ? "#1653a3" : "#1653a3",
                                            transition: "all 0.28s ease",
                                            boxShadow: "0 2px 6px rgba(0,0,0,0.22)",
                                        }}
                                    />

                                    <Box
                                        sx={{
                                            position: "relative",
                                            zIndex: 1,
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            height: "100%",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 550,
                                                fontSize: { xs: 8, sm: 11 },
                                                letterSpacing: 1,
                                                color: !showCategoryBar ? "#fff" : "#666",
                                                transition: "color 0.28s ease",
                                            }}
                                        >
                                            PIE
                                        </Box>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 550,
                                                fontSize: { xs: 8, sm: 11 },
                                                letterSpacing: 1,
                                                color: showCategoryBar ? "#fff" : "#666",
                                                transition: "color 0.28s ease",
                                            }}
                                        >
                                            BAR
                                        </Box>
                                    </Box>
                                </Box>

                                {/* MONTH / YEAR slider */}
                                <Box
                                    onClick={() =>
                                        setChartViewMode((prev) => (prev === "month" ? "year" : "month"))
                                    }
                                    sx={{
                                        position: "relative",
                                        width: { xs: 72, sm: 107 },
                                        height: { xs: 20, sm: 26 },
                                        borderRadius: "3px",
                                        bgcolor: "#d9d9d9",
                                        border: "2px solid #bfbfbf",
                                        cursor: "pointer",
                                        overflow: "hidden",
                                        userSelect: "none",
                                        boxShadow: "inset 0 1px 4px rgba(0,0,0,0.18)",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 3,
                                            left: chartViewMode === "year" ? "calc(50% + 1px)" : 3,
                                            width: "calc(50% - 4px)",
                                            height: "calc(100% - 6px)",
                                            borderRadius: "2px",
                                            bgcolor: chartViewMode === "year" ? "#063b12" : "#063b12",
                                            transition: "all 0.28s ease",
                                            boxShadow: "0 2px 6px rgba(0,0,0,0.22)",
                                        }}
                                    />

                                    <Box
                                        sx={{
                                            position: "relative",
                                            zIndex: 1,
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            height: "100%",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 550,
                                                fontSize: { xs: 8, sm: 11 },
                                                letterSpacing: 0.5,
                                                color: chartViewMode === "month" ? "#fff" : "#666",
                                                transition: "color 0.28s ease",
                                            }}
                                        >
                                            MONTH
                                        </Box>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 550,
                                                fontSize: { xs: 8, sm: 11 },
                                                letterSpacing: 0.5,
                                                color: chartViewMode === "year" ? "#fff" : "#666",
                                                transition: "color 0.28s ease",
                                            }}
                                        >
                                            YEAR
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                        <Typography
                            sx={{
                                fontSize: 13,
                                color: "#6b7280",
                                mb: 1,
                                fontWeight: 500,
                            }}
                        >
                            {chartViewMode === "month"
                                ? `Showing ${dayjs().format("MMMM YYYY")} data`
                                : `Showing ${dayjs().format("YYYY")} data`}
                        </Typography>

                        <Box
                            sx={{
                                width: "100%",
                                flex: 1,
                                minHeight: { xs: 200, sm: 240, md: 280, lg: 320 },
                            }}
                        >
                            <ReactECharts
                                option={showCategoryBar ? barOption : pieOption}
                                style={{ width: "100%", height: "100%" }}
                                notMerge={true}
                                lazyUpdate={true}
                            />
                        </Box>
                    </Paper>

                    <Paper
                        sx={{
                            ...commonPaperSx,
                            p: { xs: 1.2, sm: 2, md: 2.5 },
                            gridColumn: "1 / -1",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                            }}
                        >
                            <Typography sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 20 } }}>
                                Spent Amount Table
                            </Typography>
                            <IconButton
                                onClick={() => setShowSearch(!showSearch)}
                                sx={{
                                    color: showSearch ? "#1653a3" : "inherit",
                                    backgroundColor: showSearch ? "rgba(22, 83, 163, 0.08)" : "transparent",
                                    "&:hover": {
                                        backgroundColor: showSearch ? "rgba(22, 83, 163, 0.12)" : "rgba(0, 0, 0, 0.04)",
                                    }
                                }}
                            >
                                <SearchIcon />
                            </IconButton>
                        </Box>

                        {/* Collapsible Search Bar */}
                        {showSearch && (
                            <Box
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    borderRadius: 2,
                                    bgcolor: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        sm: "1fr 1fr",
                                        lg: "1fr 1fr 1.2fr auto",
                                    },
                                    gap: 2,
                                    alignItems: "end",
                                }}
                            >
                                <Box>
                                    <Typography sx={{ ...commonFieldLabelSx, mb: 0.5 }}>From Date</Typography>
                                    <DatePicker
                                        value={fromDate}
                                        onChange={(newValue) => setFromDate(newValue)}
                                        format="DD/MM/YYYY"
                                        disableFuture
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                                fullWidth: true,
                                                placeholder: "Start date",
                                            },
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Typography sx={{ ...commonFieldLabelSx, mb: 0.5 }}>To Date</Typography>
                                    <DatePicker
                                        value={toDate}
                                        onChange={(newValue) => setToDate(newValue)}
                                        format="DD/MM/YYYY"
                                        disableFuture
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                                fullWidth: true,
                                                placeholder: "End date",
                                            },
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Typography sx={{ ...commonFieldLabelSx, mb: 0.5 }}>Search by Purchase Type</Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={searchType}
                                            onChange={(e) => setSearchType(e.target.value)}
                                            displayEmpty
                                            renderValue={(selected) => {
                                                if (!selected) return <span style={{ color: "#94a3b8" }}>All Types</span>;
                                                const item = purchaseTypeOptions.find(o => String(o.id) === String(selected));
                                                return item ? item.name : selected;
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em>All Types</em>
                                            </MenuItem>
                                            {purchaseTypeOptions.map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<HighlightOffIcon />}
                                    onClick={() => {
                                        setFromDate(null);
                                        setToDate(null);
                                        setSearchType("");
                                    }}
                                    sx={{
                                        height: 40,
                                        textTransform: "none",
                                        color: "#64748b",
                                        borderColor: "#cbd5e1",
                                        "&:hover": {
                                            borderColor: "#94a3b8",
                                            bgcolor: "#f1f5f9",
                                        },
                                    }}
                                >
                                    Clear
                                </Button>
                            </Box>
                        )}

                        {isMdDown ? (
                            <Box sx={{ display: "grid", gap: 1.5 }}>
                                {filteredSpentList.length > 0 ? (
                                    filteredSpentList.map((item, index) => (
                                        <Paper
                                            key={item.id}
                                            variant="outlined"
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                borderColor: "#dbe2e8",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    mb: 1,
                                                }}
                                            >
                                                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                                                    #{index + 1}
                                                </Typography>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => {
                                                        setDeleteId(item.id);
                                                        setDeleteType("spent");
                                                        setOpenDeleteDialog(true);
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>

                                            <Divider sx={{ mb: 1.2 }} />

                                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2 }}>
                                                <Box>
                                                    <Typography sx={{ fontSize: 11, color: "#6b7280" }}>Date</Typography>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                                                        {item.date ? dayjs(item.date).format("DD/MM/YYYY") : "-"}
                                                    </Typography>
                                                </Box>

                                                <Box>
                                                    <Typography sx={{ fontSize: 11, color: "#6b7280" }}>
                                                        Purchase Type
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                                                        {item.purchaseTypeName || "-"}
                                                    </Typography>
                                                </Box>

                                                <Box>
                                                    <Typography sx={{ fontSize: 11, color: "#6b7280" }}>Amount</Typography>
                                                    <Typography
                                                        sx={{
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            color: "#3f6941",
                                                        }}
                                                    >
                                                        ₹{Number(item.amount || 0).toFixed(2)}
                                                    </Typography>
                                                </Box>

                                                <Box>
                                                    <Typography sx={{ fontSize: 11, color: "#6b7280" }}>Bill</Typography>
                                                    <Typography
                                                        sx={{
                                                            fontSize: 13,
                                                            fontWeight: 500,
                                                            wordBreak: "break-word",
                                                        }}
                                                    >
                                                        {item.uploadbill || "-"}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ gridColumn: "1 / -1" }}>
                                                    <Typography sx={{ fontSize: 11, color: "#e0600b" }}>Remarks</Typography>
                                                    <Typography
                                                        sx={{
                                                            fontSize: 13,
                                                            fontWeight: 500,
                                                            wordBreak: "break-word",
                                                        }}
                                                    >
                                                        {item.remarks || "-"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    ))
                                ) : (
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            textAlign: "center",
                                            color: "#6b7280",
                                        }}
                                    >
                                        No spent amount data
                                    </Paper>
                                )}
                            </Box>
                        ) : (
                            <TableContainer
                                sx={{
                                    overflowX: "auto",
                                    overflowY: "auto",
                                    maxHeight: 500, // Enables vertical scrolling
                                    borderRadius: 2,
                                    "&::-webkit-scrollbar": { width: "7px", height: "7px" },
                                    "&::-webkit-scrollbar-track": { background: "#f1f1f1", borderRadius: "10px" },
                                    "&::-webkit-scrollbar-thumb": { background: "rgb(90,114,90)", borderRadius: "10px" },
                                    "&::-webkit-scrollbar-thumb:hover": { background: "rgb(70,94,70)" },
                                }}
                            >
                                <Table stickyHeader sx={{ minWidth: isLgDown ? 900 : 1000 }}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "rgb(90,114,90)" }}>
                                            <TableCell sx={tableHeadSx}>S.No</TableCell>
                                            <TableCell sx={tableHeadSx}>Date</TableCell>
                                            <TableCell sx={tableHeadSx}>Purchase Type</TableCell>
                                            <TableCell sx={tableHeadSx}>Amount</TableCell>
                                            <TableCell sx={tableHeadSx}>Remarks</TableCell>
                                            <TableCell sx={tableHeadSx}>Upload Bill</TableCell>
                                            <TableCell sx={tableHeadSx}>Actions2</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {filteredSpentList.length > 0 ? (
                                            filteredSpentList.map((item, index) => (
                                                <TableRow key={`${item.id}-${index}`}>
                                                    <TableCell align="center">{index + 1}</TableCell>
                                                    <TableCell align="center">
                                                        {item.date ? dayjs(item.date).format("DD/MM/YYYY") : "-"}
                                                    </TableCell>
                                                    <TableCell align="center">{item.purchaseTypeName}</TableCell>
                                                    <TableCell align="center">
                                                        ₹{Number(item.amount || 0).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align="center">{item.remarks}</TableCell>
                                                    <TableCell align="center">{item.uploadbill || "-"}</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => {
                                                                setDeleteId(item.id);
                                                                setDeleteType("spent");
                                                                setOpenDeleteDialog(true);
                                                            }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">
                                                    No spent amount data
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Box>

                <Dialog
                    open={openReceivedPopup}
                    onClose={() => setOpenReceivedPopup(false)}
                    fullWidth
                    maxWidth="md"
                    fullScreen={isXs}
                    PaperProps={{
                        sx: {
                            borderRadius: { xs: 0, sm: 3 },
                            overflow: "hidden",
                            m: { xs: 0, sm: 2 },
                        },
                    }}
                >
                    <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ position: "relative" }}>
                            <IconButton
                                onClick={() => setOpenReceivedPopup(false)}
                                sx={{
                                    position: "absolute",
                                    right: { xs: -6, sm: -8 },
                                    top: { xs: -6, sm: -8 },
                                    color: "#666",
                                }}
                            >
                                <CloseIcon />
                            </IconButton>

                            <Typography
                                sx={{
                                    fontSize: { xs: 24, sm: 30, md: 38 },
                                    fontWeight: 500,
                                    textAlign: "center",
                                    mb: 3,
                                    color: "#1e1e1e",
                                    pr: 4,
                                }}
                            >
                                Advance Amount
                            </Typography>

                            <Box
                                sx={{
                                    border: "2px solid #23af75",
                                    borderRadius: 2,
                                    p: { xs: 2, sm: 3, md: 4 },
                                    mx: "auto",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                                        gap: { xs: 2, sm: 3, md: 5 },
                                        alignItems: "end",
                                        mb: { xs: 3, sm: 4 },
                                    }}
                                >
                                    <Box>
                                        <InputLabel sx={{ mb: 0.8 }}>Date</InputLabel>
                                        <DatePicker
                                            value={receivedForm.date}
                                            onChange={(newValue) =>
                                                setReceivedForm((prev) => ({
                                                    ...prev,
                                                    date: newValue || dayjs(),
                                                }))
                                            }
                                            format="DD/MM/YYYY"
                                            disableFuture
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                },
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: { xs: 16, sm: 20, md: 24 },
                                                fontWeight: 500,
                                                mb: 1.2,
                                                color: "#1e1e1e",
                                            }}
                                        >
                                            Amount :
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            name="amount"
                                            value={receivedForm.amount}
                                            onChange={handleReceivedChange}
                                            placeholder="Enter amount"
                                            size="small"
                                        />
                                    </Box>
                                </Box>

                                <Box sx={{ display: "flex", justifyContent: "center" }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleAddReceived}
                                        fullWidth={isXs}
                                        sx={{
                                            minWidth: { xs: "100%", sm: 150, md: 180 },
                                            height: { xs: 40, sm: 42, md: 44 },
                                            fontSize: { xs: 16, sm: 20, md: 22 },
                                            fontWeight: 500,
                                            textTransform: "none",
                                            borderRadius: 1.5,
                                            bgcolor: "#489154",
                                            px: 4,
                                            py: 3,

                                            "&:hover": {
                                                bgcolor: "#3e6d41",
                                            },
                                        }}
                                    >
                                        Add
                                    </Button>
                                </Box>
                            </Box>

                            {receivedList.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography sx={{ mb: 1.5, fontWeight: 700, fontSize: 18 }}>
                                        Total Advance Taken Table
                                    </Typography>

                                    {isXs ? (
                                        <Box sx={{ display: "grid", gap: 1.25 }}>
                                            {receivedList.map((item, index) => (
                                                <Paper
                                                    key={item.id}
                                                    variant="outlined"
                                                    sx={{ p: 1.5, borderRadius: 2 }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            mb: 1,
                                                        }}
                                                    >
                                                        <Typography sx={{ fontWeight: 700 }}>#{index + 1}</Typography>
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() => {
                                                                setDeleteId(item.id);
                                                                setDeleteType("received");
                                                                setOpenDeleteDialog(true);
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>

                                                    <Divider sx={{ mb: 1 }} />

                                                    <Box sx={{ display: "grid", gap: 1 }}>
                                                        <Box>
                                                            <Typography sx={{ fontSize: 11, color: "#6b7280" }}>
                                                                Date
                                                            </Typography>
                                                            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                                                                {item.date ? dayjs(item.date).format("DD/MM/YYYY") : "-"}
                                                            </Typography>
                                                        </Box>

                                                        <Box>
                                                            <Typography sx={{ fontSize: 11, color: "#6b7280" }}>
                                                                Amount
                                                            </Typography>
                                                            <Typography
                                                                sx={{ fontSize: 14, fontWeight: 700, color: "#3f6941" }}
                                                            >
                                                                ₹{Number(item.amount || 0).toFixed(2)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Paper>
                                            ))}
                                        </Box>
                                    ) : (
                                        <TableContainer sx={{ overflowX: "auto", borderRadius: 2 }}>
                                            <Table sx={{ minWidth: 500 }}>
                                                <TableHead>
                                                    <TableRow sx={{ bgcolor: "#3b753b" }}>
                                                        <TableCell sx={tableHeadSx}>S.No</TableCell>
                                                        <TableCell sx={tableHeadSx}>Date</TableCell>
                                                        <TableCell sx={tableHeadSx}>Amount</TableCell>
                                                        <TableCell sx={tableHeadSx}>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {receivedList.map((item, index) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell align="center">{index + 1}</TableCell>
                                                            <TableCell align="center">
                                                                {item.date ? dayjs(item.date).format("DD/MM/YYYY") : "-"}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                ₹{Number(item.amount || 0).toFixed(2)}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <IconButton
                                                                    color="error"
                                                                    onClick={() => {
                                                                        setDeleteId(item.id);
                                                                        setDeleteType("received");
                                                                        setOpenDeleteDialog(true);
                                                                    }}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </DialogContent>
                </Dialog>
                <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                    <DialogContent sx={{ textAlign: "center", p: 3 }}>
                        <Typography sx={{ fontSize: 18, mb: 2 }}>
                            Are you sure you want to delete?
                        </Typography>

                        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleConfirmDelete}
                            >
                                Delete
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() => setOpenDeleteDialog(false)}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Box>
        </LocalizationProvider>
    );
};

export default AmountTabs;