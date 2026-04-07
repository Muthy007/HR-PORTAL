import { useEffect, useState } from "react";
import axios from "axios";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Grid,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    Select,
    MenuItem,
    Paper,
    IconButton,
    Avatar,
    Drawer,
    Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import logo from "../../assets/Signboard.jpg.jpeg";
import Sakthi from '../../assets/Sakthi.jpeg';
import CloseIcon from "@mui/icons-material/Close";
import { FormControl, InputLabel } from "@mui/material";
import { Chip } from "@mui/material";


import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

function Travel() {

    const [travelType, setTravelType] = useState("Domestic");
    const [purpose, setPurpose] = useState("");


    useEffect(() => {
        const loadPurpose = async () => {
            try {
                setPurposeLoading(true);
                setPurposeError("");

                const res = await axios.post(
                    "http://13.234.251.159:9080/api/BP_Integration/Get_TravelMastersList",
                    {
                        mas_cat: "Purpose"   // ✅ REQUIRED
                    },
                    { headers: { "Content-Type": "application/json" } }
                );

                const data = res.data;

                const list =

                    data?.data ??
                    [];

                setPurposeList(Array.isArray(list) ? list : []);
            } catch (err) {
                console.error("Purpose API error:", err?.response?.status, err?.response?.data);
                setPurposeError(
                    ` ${err?.response?.status || "NO_RESPONSE"}`
                );
                setPurposeList([]);
            } finally {
                setPurposeLoading(false);
            }
        };

        loadPurpose();
    }, []);
    const [journeys, setJourneys] = useState([
        {
            from: "",
            to: "",
            date: "",
            mode: "",
            flightNo: "",
            time: "",
            approx: ""
        }
    ]);


    const handleAddJourney = () => {
        setJourneys([
            ...journeys,
            { from: "", to: "", date: "", mode: "", flightNo: "", time: "", approx: "" }
        ]);
    };

    const handleRemoveJourney = () => {
        if (journeys.length > 1) {
            setJourneys(journeys.slice(0, -1));
        }
    };
    const [openProfile, setOpenProfile] = useState(false);
    const handleModeChange = (index, value) => {
        const updatedJourneys = [...journeys];
        updatedJourneys[index].mode = value;
        setJourneys(updatedJourneys);
    };
    // ✅ Purpose dropdown API states
    const [purposeList, setPurposeList] = useState([]);
    const [purposeLoading, setPurposeLoading] = useState(false);
    const [purposeError, setPurposeError] = useState("");
    const [formData, setFormData] = useState({
        travelType: "Domestic",
        travelLocation: "",
        travelAddress: "",
        advanceAmount: "",
        purpose: "",
        purposeOthers: "",
        noOfDays: "",
        amountDetails: "",
        remarks: "",
        otherCurrency: "",   // ✅ add this
        amount: ""           // ✅ add this (you used formData.amount)
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    const handleSubmit = () => {
        const finalData = {
            ...formData,
            journeys: journeys
        };


    };

    const handleJourneyChange = (index, e) => {
        const { name, value } = e.target;
        const updatedJourneys = [...journeys];
        updatedJourneys[index][name] = value;
        setJourneys(updatedJourneys);
    };
    const currencyOptions = [
        { code: "USD", label: "USD - US Dollar" },
        { code: "EUR", label: "EUR - Euro" },
        { code: "GBP", label: "GBP - British Pound" },
        { code: "AED", label: "AED - UAE Dirham" },
        { code: "SGD", label: "SGD - Singapore Dollar" },
        { code: "MYR", label: "MYR - Malaysian Ringgit" },
    ];
    const [amountItems, setAmountItems] = useState([]);
    // example item: { currency: "INR", amount: "100000" }
    const handleAddAmountDetail = () => {
        const inr = formData.advanceAmount?.toString().trim();
        const cur = formData.otherCurrency?.toString().trim();
        const amt = formData.amount?.toString().trim();

        const newItems = [];

        if (inr) newItems.push({ currency: "INR", amount: inr });
        if (cur && amt) newItems.push({ currency: cur, amount: amt });

        if (newItems.length === 0) return;

        setAmountItems((prev) => {
            const updated = [...prev];

            newItems.forEach((ni) => {
                const alreadyExists = updated.some(
                    (x) => x.currency === ni.currency && x.amount === ni.amount
                );
                if (!alreadyExists) updated.push(ni); // ✅ no duplicates
            });

            return updated;
        });

        // optional: clear other currency + amount after add
        setFormData((prev) => ({ ...prev, otherCurrency: "", amount: "" }));
    };
    const handleRemoveAmountItem = (idx) => {
        setAmountItems((prev) => prev.filter((_, i) => i !== idx));
    };


    const isInternational = formData.travelType === "International";

    // ✅ already added currencies list
    const usedCurrencies = amountItems.map((x) => x.currency);

    // ✅ dropdown options (remove already used)
    const availableCurrencyOptions = currencyOptions.filter(
        (c) => !usedCurrencies.includes(c.code)
    );
    return (
        <Box sx={{ background: "#f3f8f3", minHeight: "100vh", p: 2, gap: 5 }}>


            {/* FORM CONTAINER */}
            <Paper
                sx={{
                    p: { xs: 2, sm: 3, md: 4 },
                    borderRadius: 3,
                    backgroundColor: "#f5f5f5",
                    boxShadow: 7,
                }}
            >
                <Typography
                    sx={{
                        color: "rgb(90,114,90)",
                        fontWeight: 500,
                        fontSize: { xs: "22px", sm: "26px", md: "28px" },
                        mb: 2,
                    }}
                >
                    Travel Types
                </Typography>

                <RadioGroup
                    row
                    name="travelType"
                    value={formData.travelType}
                    onChange={handleChange}
                    sx={{ mb: 3 }}
                >
                    <FormControlLabel value="Domestic" control={<Radio />} label="Domestic" />
                    <FormControlLabel
                        value="International"
                        control={<Radio />}
                        label="International"
                    />
                </RadioGroup>

                {/* Top Row */}
                <Grid container spacing={3} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <FormControl fullWidth size="small">
                            <Typography sx={{ mb: 0.7, fontSize: 15 }}>Purpose</Typography>
                            <Select
                                name="purpose"
                                value={formData.purpose || ""}
                                onChange={handleChange}
                                displayEmpty
                                disabled={purposeLoading}
                                sx={{ height: 42, backgroundColor: "white", }}
                            >
                                <MenuItem value="">
                                    <em>{purposeLoading ? "Loading..." : "Select Purpose"}</em>
                                </MenuItem>

                                {purposeList.map((p) => (
                                    <MenuItem key={p.id} value={p.name}>
                                        {p.name}
                                    </MenuItem>
                                ))}
                            </Select>

                            {purposeError && (
                                <Typography sx={{ color: "red", mt: 0.5, fontSize: 12 }}>
                                    {purposeError}
                                </Typography>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <Typography sx={{ mb: 0.7, fontSize: 15 }}>If Purpose Others</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            name="purposeOthers"
                            value={formData.purposeOthers}
                            onChange={handleChange}
                            disabled={formData.purpose !== "Others"}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    height: 42,
                                    backgroundColor: "white",
                                },
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
                        <Typography sx={{ mb: 0.7, fontSize: 15 }}>
                            Advance Amount (INR)
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            name="advanceAmount"
                            type="number"
                            value={formData.advanceAmount}
                            onChange={handleChange}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    height: 42,
                                    backgroundColor: "white",
                                },
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
                        <FormControl fullWidth size="small">
                            <Typography sx={{ mb: 0.7, fontSize: 15 }}>Other Currency</Typography>
                            <Select
                                name="otherCurrency"
                                value={formData.otherCurrency}
                                onChange={handleChange}
                                disabled={!isInternational}
                                displayEmpty
                                sx={{ height: 42, backgroundColor: "white" }}
                            >
                                <MenuItem value="">
                                    <em>Select</em>
                                </MenuItem>

                                {availableCurrencyOptions.map((c) => (
                                    <MenuItem key={c.code} value={c.code}>
                                        {c.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 10, sm: 6, md: 2.2 }}>
                        <Typography sx={{ mb: 0.7, fontSize: 15 }}>Amount</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            type="number"
                            disabled={!isInternational}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    height: 42,
                                    backgroundColor: "white",
                                },
                            }}
                        />
                    </Grid>

                    <Grid
                        size={{ xs: 2, sm: 1, md: 0.3 }}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: { xs: "flex-start", md: "center" },
                            pt: { xs: 3.6, md: 3.2 },
                        }}
                    >
                        <IconButton
                            onClick={handleAddAmountDetail}
                            disabled={!isInternational}
                            sx={{
                                width: 36,
                                height: 36,
                                bgcolor: "#5f7d5d",
                                color: "#fff",
                                "&:hover": {
                                    bgcolor: "#466344",
                                },
                                "&.Mui-disabled": {
                                    bgcolor: "#bdbdbd",
                                    color: "#fff",
                                },
                            }}
                        >
                            <AddIcon />
                        </IconButton>
                    </Grid>
                </Grid>

                {/* Bottom Section */}
                <Grid container spacing={3} alignItems="flex-start">
                    {/* Left side */}
                    <Grid size={{ xs: 12, md: 4.8 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography sx={{ mb: 0.7, fontSize: 15 }}>Travel Location</Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="travelLocation"
                                    value={formData.travelLocation}
                                    onChange={handleChange}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            height: 42,
                                            backgroundColor: "white",
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography sx={{ mb: 0.7, fontSize: 15 }}>No Of Days</Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="noOfDays"
                                    value={formData.noOfDays}
                                    onChange={handleChange}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            height: 42, backgroundColor: "white",
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Typography sx={{ mb: 0.7, fontSize: 15 }}>Remarks</Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            height: 42,
                                            backgroundColor: "white",
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Right side */}
                    <Grid size={{ xs: 12, md: 6.6 }}>
                        <Typography sx={{ mb: 0.7, fontSize: 15 }}>Amount Details</Typography>

                        <TableContainer
                            sx={{
                                border: "1px solid #d6d6d6",
                                borderRadius: 1,
                                bgcolor: "#fff",
                                overflow: "hidden",
                                opacity: !isInternational ? 0.5 : 1,
                                pointerEvents: !isInternational ? "none" : "auto",
                            }}
                        >
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "#eaf2fa" }}>
                                        <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Currency</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }} align="center">
                                            Action
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {amountItems.length > 0 ? (
                                        amountItems.map((item, idx) => (
                                            <TableRow key={`${item.currency}-${item.amount}-${idx}`}>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell>{item.currency}</TableCell>
                                                <TableCell>{item.amount}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveAmountItem(idx)}
                                                    >
                                                        <CloseIcon sx={{ color: "red" }} fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                No amounts added
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </Paper>

            <Paper
                sx={{
                    mt: 2,
                    mb: 1,
                    borderRadius: 3,
                    boxShadow: 7,
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        px: 2,
                        py: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        bgcolor: "#f5f5f5",
                        flexWrap: "wrap",
                        gap: 1,
                    }}
                >
                    <Typography
                        sx={{
                            color: "rgb(11, 12, 11)",
                            fontWeight: 500,
                            fontSize: { xs: "22px", sm: "26px", md: "28px" },
                        }}
                    >
                        Journey Details
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={handleAddJourney}
                            sx={{
                                minWidth: 50,
                                bgcolor: "#e6b800",
                                color: "#000",
                                textTransform: "none",
                                boxShadow: "none",
                                "&:hover": {
                                    bgcolor: "#d4aa00",
                                    boxShadow: "none",
                                },
                            }}
                        >
                            Add
                        </Button>

                        <Button
                            size="small"
                            variant="contained"
                            onClick={handleRemoveJourney}
                            sx={{
                                minWidth: 70,
                                bgcolor: "#e6b800",
                                color: "#000",
                                textTransform: "none",
                                boxShadow: "none",
                                "&:hover": {
                                    bgcolor: "#d4aa00",
                                    boxShadow: "none",
                                },
                            }}
                        >
                            Remove
                        </Button>
                    </Box>
                </Box>

                {/* Table */}
                <TableContainer sx={{ overflowX: "auto" }}>
                    <Table sx={{ minWidth: 1100 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "rgb(90,114,90)" }}>
                                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>From</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>To</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Mode</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Flight No.</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Time</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Approx Fare</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                                    Choose Flight Options
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {journeys.map((journey, index) => {
                                const isFlight = journey.mode === "FLIGHT";

                                return (
                                    <TableRow key={index}>
                                        <TableCell sx={{ minWidth: 180 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="From Location"
                                                name="from"
                                                sx={{
                                                    "& .MuiInputBase-input": {
                                                        fontSize: "18px"
                                                    }
                                                }}
                                                value={journey.from}
                                                onChange={(e) => handleJourneyChange(index, e)}
                                                variant="standard"
                                                InputProps={{ disableUnderline: true }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ minWidth: 180 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="To Location"
                                                name="to"
                                                sx={{
                                                    "& .MuiInputBase-input": {
                                                        fontSize: "18px"
                                                    }
                                                }}
                                                value={journey.to}
                                                onChange={(e) => handleJourneyChange(index, e)}
                                                variant="standard"
                                                InputProps={{ disableUnderline: true }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ minWidth: 150 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="date"
                                                name="date"
                                                value={journey.date}
                                                onChange={(e) => handleJourneyChange(index, e)}
                                                variant="standard"
                                                InputProps={{ disableUnderline: true }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ minWidth: 150 }}>
                                            <Select
                                                fullWidth
                                                size="small"
                                                name="mode"
                                                value={journey.mode}
                                                displayEmpty
                                                onChange={(e) => handleJourneyChange(index, e)}
                                            >
                                                <MenuItem value="">
                                                    <em>MODE</em>
                                                </MenuItem>
                                                <MenuItem value="BUS">BUS</MenuItem>
                                                <MenuItem value="TAXI">TAXI</MenuItem>
                                                <MenuItem value="FLIGHT">FLIGHT</MenuItem>
                                                <MenuItem value="CAR-OWN">CAR-OWN</MenuItem>
                                            </Select>
                                        </TableCell>

                                        <TableCell sx={{ minWidth: 140 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                name="flightNo"
                                                sx={{
                                                    "& .MuiInputBase-input": {
                                                        fontSize: "18px"
                                                    }
                                                }}
                                                value={isFlight ? journey.flightNo : "NA"}
                                                onChange={(e) => handleJourneyChange(index, e)}
                                                variant="standard"
                                                disabled={!isFlight}
                                                InputProps={{ disableUnderline: true }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ minWidth: 120 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="time"
                                                name="time"
                                                value={isFlight ? journey.time : "NA"}
                                                onChange={(e) => handleJourneyChange(index, e)}
                                                variant="standard"
                                                disabled={!isFlight}
                                                InputProps={{ disableUnderline: true }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ minWidth: 140 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                name="approx"
                                                sx={{
                                                    "& .MuiInputBase-input": {
                                                        fontSize: "18px"
                                                    }
                                                }}
                                                value={isFlight ? journey.approx : "0"}
                                                onChange={(e) => handleJourneyChange(index, e)}
                                                variant="standard"
                                                disabled={!isFlight}
                                                InputProps={{ disableUnderline: true }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ minWidth: 190 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                disabled={!isFlight}
                                                sx={{
                                                    bgcolor: "#64a8f3",
                                                    textTransform: "none",
                                                    boxShadow: "none",
                                                    "&:hover": {
                                                        bgcolor: "#4f97e8",
                                                        boxShadow: "none",
                                                    },
                                                    "&.Mui-disabled": {
                                                        bgcolor: "#bdbdbd",
                                                        color: "#fff",
                                                    },
                                                }}
                                            >
                                                Click Here
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Box
                mt={3}
                sx={{
                    backgroundColor: "#c5c3bd",   // background color
                    padding: 2,                   // inner space
                    borderRadius: 2               // rounded corners
                }}
            >
                <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                    Note: If not mentioning booking details kindly mention 'NA'
                </Typography>

                <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                    Note: If flight details not mentioned kindly mention 'NA'
                </Typography>

                <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                    Note: If Flight, mention Flight Approx Amount
                </Typography>
            </Box>
            <Box textAlign="center" mt={4}>
                <Button
                    variant="contained"
                    sx={{ background: "rgb(90,114,90)", paddingX: 5 }}
                    onClick={handleSubmit}
                >
                    SUBMIT
                </Button>
            </Box>
        </Box>


    );
}

export default Travel;