import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  TextField,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  InputLabel,
  Button,
  IconButton,
  Grid,
  FormControl,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Chip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

function TabPanel({ value, index, children }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ mt: 1.5 }}>
      {value === index ? children : null}
    </Box>
  );
}

export default function LocalPurchasePage() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const rows = useMemo(() => [], []);

  // form direct open aaganum na true
  const [showCreateForm, setShowCreateForm] = useState(true);

  const [selectMonth, setSelectMonth] = useState("");
  const [purchaseType, setPurchaseType] = useState("");
  const [date, setDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [location, setLocation] = useState("");
  const [equipmentName, setEquipmentName] = useState("");
  const [amount, setAmount] = useState("");


  const [equipmentType, setEquipmentType] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  const commonInputSx = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      height: 32,
      fontSize: 12,
      bgcolor: "#fff",
    },
    "& input": {
      padding: "7px 10px",
      fontSize: 12,
    },
  };

  const commonSelectSx = {
    height: 32,
    fontSize: 12,
    bgcolor: "#fff",
    "& .MuiSelect-select": {
      padding: "7px 10px",
      fontSize: 12,
    },
  };

  const labelSx = {
    fontSize: 13,
    mb: 0.6,
    fontWeight: 500,
    color: "#111",
  };
  const [value, setValue] = React.useState(dayjs());
  const [gstOption, setGstOption] = useState("No");
  const [gstAmount, setGstAmount] = useState("");

  const [docUploadOpt, setDocUploadOpt] = useState("No");
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#dfe5df" }}>
      {/* TOP TABS BAR */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "#d4dcd4",
          borderBottom: "1px solid #c8d0c8",
          px: 0.5,
          borderRadius: 0,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            setShowCreateForm(v === 0 ? true : false);
          }}
          variant="scrollable"
          scrollButtons="auto"
          textColor="inherit"
          indicatorColor="success"
          sx={{
            minHeight: 30,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              minHeight: 30,
              py: 0,
              fontSize: 18,
              px: 2,
            },
          }}
        >
          <Tab label="Create Local Purchase" />
          <Tab label="View Purchase" />
        </Tabs>
      </Paper>

      <Box sx={{ p: 1 }} >
        {/* TAB 0 */}
        <TabPanel value={tab} index={0}>
          {showCreateForm ? (
            <>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 1.5,
                  border: "1px solid #cfd7cf",
                  bgcolor: "White",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto 1fr",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 30,
                        fontFamily: "serif",
                        color: "#111111",
                        justifySelf: "start",
                      }}
                    >
                      Local Purchase

                    </Typography>

                  </Box>

                  <Divider sx={{ mt: 1.2, borderColor: "#8fa3a9" }} />
                </Box>

                {/* Form */}
                <Box sx={{ px: 2, py: 2, pb: 2 }}>
                  <Box
                    sx={{

                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(1, 1fr)",
                        md: "repeat(4, 1fr)",
                      },
                      gap: 2.5,
                      width: "100%",
                    }}
                  >
                    {/* Row 1 */}

                    <Box>
                      <InputLabel>Select Date</InputLabel>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>

                        <DatePicker
                          value={value}
                          onChange={(newValue) => setValue(newValue)}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              placeholder: "Select Date", // 👈 inside text box
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                    <Box >
                      <InputLabel>Purchase Type</InputLabel>
                      <FormControl size="small" fullWidth>

                        <Select
                          displayEmpty
                          value={purchaseType}
                          onChange={(e) => setPurchaseType(e.target.value)}

                          renderValue={(v) =>
                            v ? v : <span style={{ color: "#666" }}>Select Purchase Type</span>
                          }
                        >
                          <MenuItem value="Repair">Repair</MenuItem>
                          <MenuItem value="Spare">Spare</MenuItem>
                          <MenuItem value="Service">Service</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box>
                      <Typography>Customer Name:</Typography>
                      <TextField
                        size="small"
                        placeholder="...."
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        fullWidth

                      />
                    </Box>

                    <Box>
                      <Typography >Equipment Name:</Typography>
                      <TextField
                        size="small"
                        placeholder="...."
                        value={equipmentName}
                        onChange={(e) => setEquipmentName(e.target.value)}
                        fullWidth

                      />
                    </Box>

                    <Box>
                      <Typography sx={{ pt: 1.5 }}>Location:</Typography>
                      <TextField
                        size="small"
                        placeholder="...."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        fullWidth

                      />
                    </Box>



                    {/* Row 2 */}
                    <Box>
                      <Typography sx={{ pt: 1.5 }}>Amount:</Typography>
                      <TextField
                        size="small"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        fullWidth

                      />
                    </Box>
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,

                        }}
                      >
                        <Typography sx={{ pb: -1 }}>GST Option:</Typography>

                        <RadioGroup
                          row
                          value={gstOption}
                          onChange={(e) => setGstOption(e.target.value)}
                        >
                          <FormControlLabel
                            value="Yes"
                            control={<Radio size="small" />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="No"
                            control={<Radio size="small" />}
                            label="No"
                          />
                        </RadioGroup>
                      </Box>

                      <TextField
                        size="small"
                        placeholder="Enter GST Amount"
                        value={gstAmount}
                        onChange={(e) => setGstAmount(e.target.value)}
                        fullWidth
                        disabled={gstOption !== "Yes"}   // 👈 main logic
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: gstOption === "Yes" ? "#fff" : "#f8f8f8",
                            height: 38,
                          },
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography sx={{ pb: 1 }}>Equipment Type:</Typography>
                      <TextField
                        size="small"
                        placeholder="...."
                        value={equipmentType}
                        onChange={(e) => setEquipmentType(e.target.value)}
                        fullWidth

                      />
                    </Box>
                  </Box>


                  <Box
                    sx={{
                      py: 2,
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(4, 1fr)",
                      },
                      gap: 2.5,
                      width: "100%",
                    }}
                  >
                    {/* Document Upload */}
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.2,

                        }}
                      >
                        <Typography>Document Upload:</Typography>

                        <RadioGroup
                          row
                          value={docUploadOpt}
                          onChange={(e) => setDocUploadOpt(e.target.value)}
                        >
                          <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                          <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                        </RadioGroup>
                      </Box>

                      <Box
                        sx={{
                          minHeight: 32,
                          border: "1px solid #6ea4ff",
                          borderRadius: 0.5,
                          display: "flex",
                          alignItems: "center",
                          px: 1,
                          bgcolor: docUploadOpt === "Yes" ? "#fff" : "#f8f8f8",
                        }}
                      >
                        <input
                          type="file"
                          disabled={docUploadOpt !== "Yes"}   // 👈 enable/disable
                          style={{
                            fontSize: "11px",
                            width: "100%",
                            cursor: docUploadOpt === "Yes" ? "pointer" : "not-allowed",
                            opacity: docUploadOpt === "Yes" ? 1 : 0.5,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* 👇 Remarks (CENTER + BIG WIDTH) */}
                    <Box
                      sx={{
                        gridColumn: {
                          xs: "1 / -1",      // mobile full width
                          md: "2 / span 2",  // center la 2 column occupy pannum
                        },
                      }}
                    >
                      <Typography sx={{ pt: 1 }}>Remarks:</Typography>
                      <TextField
                        size="small"
                        placeholder="......"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        fullWidth
                      />
                    </Box>

                    {/* Serial Number */}
                    <Box>
                      <Typography sx={{ pt: 1 }}>Serial Number:</Typography>
                      <TextField
                        size="small"
                        placeholder="...."
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        fullWidth
                      />
                    </Box>
                  </Box>
                  {/* ADD button */}
                  <Box sx={{ py: 1, display: "flex", justifyContent: "center", mt: 2.2 }}>
                    {/* <Button
                      variant="outlined" sx={{ bgcolor: "#64b5f6" }}>
                      Refresh
                    </Button> */}

                    <Button
                      variant="contained"
                      sx={{
                        px: 1,
                        width: 165,
                        height: 35,
                        bgcolor: "#4588be",
                        textTransform: "none",
                        fontSize: 18,
                        fontWeight: 500,
                        borderRadius: 1,
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#499caa", boxShadow: "none" },
                      }}
                      onClick={() => console.log("ADD")}
                    >
                      Add
                    </Button>
                  </Box>

                  {/* Table */}
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 1.8,
                      border: "1px solid #cfd7cf",
                      borderRadius: 2,
                      overflow: "hidden",
                      bgcolor: "#f9f9f9",
                      p: 1,
                    }}
                  >
                    {/* <TableContainer sx={{ overflowX: "auto" }}> */}
                    <TableContainer
                      sx={{
                        width: "100%",
                        overflowX: "auto",   // 👈 important
                      }}
                    >
                      <Table size="small" sx={{ minWidth: 900 }}>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#56835e" }}>
                            {[
                              "Year & Claim-No.",
                              "Customer Name",
                              "Date",
                              "Purchase Type",
                              "Equipment Name",
                              "Amount",
                              "View",
                            ].map((h) => (
                              <TableCell
                                key={h}
                                sx={{
                                  fontWeight: 600,
                                  fontSize: 16,
                                  color: "#fff",   // contrast improve
                                  py: 1.2,
                                  borderBottom: "none",
                                  whiteSpace: "nowrap",
                                  fontFamily: "serif",
                                }}
                              >
                                {h}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                      </Table>
                    </TableContainer>
                  </Paper>

                  {/* Submit */}
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 1.8 }}>
                    <Button
                      variant="contained"
                      sx={{
                        width: 165,
                        height: 33,
                        bgcolor: "#435a49",
                        textTransform: "none",
                        fontSize: 18,
                        fontWeight: 500,
                        borderRadius: 1,
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#34483b", boxShadow: "none" },
                      }}
                      onClick={() => console.log("Submit")}
                    >
                      Submit
                    </Button>
                  </Box>
                </Box>
              </Paper>

              {/* Back button */}
              <Box
                sx={{
                  position: "fixed",
                  right: { xs: 12, sm: 22 },
                  bottom: { xs: 12, sm: 18 },
                  zIndex: 20,
                }}
              >
                <IconButton
                  onClick={() => setShowCreateForm(false)}
                  sx={{
                    width: { xs: 44, sm: 54 },
                    height: { xs: 44, sm: 54 },
                    bgcolor: "rgba(255,255,255,0.95)",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
                    "&:hover": { bgcolor: "#fff" },
                  }}
                >
                  <ArrowBackIosNewIcon
                    sx={{ fontSize: { xs: 28, sm: 38 }, color: "#3c5d6a" }}
                  />
                </IconButton>
              </Box>

              <Box sx={{ height: { xs: "10vh", sm: "14vh" } }} />
            </>
          ) : (
            <>
              {/* List view */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 1,
                  border: "1px solid #cfd7cf",
                  bgcolor: "#fff",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.2,
                    borderBottom: "1px solid #e3e8e3",
                    minHeight: 52,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "stretch", sm: "center" },
                    justifyContent: "space-between",
                    gap: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 500,
                      fontFamily: "serif",
                      color: "#111",
                    }}
                  >
                    Local Purchase2
                  </Typography>

                  <TextField
                    size="small"
                    placeholder="Search.."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                      width: { xs: "100%", sm: 170 },
                      ...commonInputSx,
                    }}
                  />
                </Box>

                <Box sx={{ px: 2, pt: 1 }}>
                  <TableContainer sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow>
                          {[
                            "Year",
                            "Claim-No.",
                            "Date",
                            "Expense Amt.",
                            "Claim Status.",
                          ].map((h) => (
                            <TableCell
                              key={h}
                              sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                borderBottom: "1px solid #e3e8e3",
                                py: 1,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                    </Table>
                  </TableContainer>
                </Box>

                <Box
                  sx={{
                    px: 2,
                    py: 1.2,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: "#1f1f1f" }}>
                    No.of Rows : {rows.length}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {["Back", "1", "Next"].map((t) => (
                      <Button
                        key={t}
                        variant="outlined"
                        size="small"
                        sx={{
                          minWidth: t === "1" ? 34 : 54,
                          height: 30,
                          textTransform: "none",
                          fontSize: 12,
                          borderColor: "#caa5a5",
                          color: "#1f1f1f",
                        }}
                      >
                        {t}
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Paper>

              <Box sx={{ height: { xs: "18vh", sm: "22vh", md: "30vh" } }} />

              {/* Add icon */}
              <Box
                sx={{
                  position: "fixed",
                  right: { xs: 12, sm: 18 },
                  bottom: { xs: 12, sm: 18 },
                  zIndex: 20,
                }}
              >
                <Box
                  sx={{
                    width: { xs: 46, sm: 52 },
                    height: { xs: 46, sm: 52 },
                    bgcolor: "#2f5fb3",
                    borderRadius: 1,
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
                  }}
                >
                  <IconButton
                    sx={{
                      width: { xs: 36, sm: 40 },
                      height: { xs: 36, sm: 40 },
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.35)",
                      color: "#fff",
                    }}
                    onClick={() => setShowCreateForm(true)}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            </>
          )}
        </TabPanel>

        {/* TAB 1 */}
        <TabPanel value={tab} index={1}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 1,
              border: "1px solid #cfd7cf",
              bgcolor: "#fff",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.2,
                borderBottom: "1px solid #e3e8e3",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "stretch", md: "center" },
                justifyContent: "space-between",
                gap: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  fontFamily: "serif",
                  color: "#111",
                }}
              >
                Local Purchase
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "stretch", sm: "center" },
                  gap: 1.2,
                  width: { xs: "100%", md: "auto" },
                }}
              >
                <Chip
                  label="2026"
                  variant="outlined"
                  sx={{
                    height: 30,
                    borderRadius: 999,
                    fontSize: 12,
                    bgcolor: "#fff",
                    alignSelf: { xs: "flex-start", sm: "center" },
                  }}
                />

                <TextField
                  size="small"
                  placeholder="Search.."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ width: { xs: "100%", sm: 220 }, ...commonInputSx }}
                />

                <IconButton
                  onClick={() => {
                    setSearch("");
                    console.log("refresh");
                  }}
                  sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ px: 2, pt: 1 }}>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 820 }}>
                  <TableHead>
                    <TableRow>
                      {[
                        "Year",
                        "Claim No.",
                        "Date",
                        "Expense Amt.",
                        "Approver",
                        "Accounts",
                        "Credits",
                      ].map((h) => (
                        <TableCell
                          key={h}
                          sx={{
                            fontWeight: 700,
                            fontSize: 13,
                            borderBottom: "1px solid #e3e8e3",
                            py: 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                </Table>
              </TableContainer>
            </Box>

            <Box
              sx={{
                px: 2,
                py: 1.2,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography sx={{ fontSize: 12, color: "#1f1f1f" }}>
                No.of Rows : {rows.length}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 54,
                    height: 28,
                    textTransform: "none",
                    fontSize: 12,
                    borderColor: "#caa5a5",
                    color: "#1f1f1f",
                  }}
                >
                  Back
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 34,
                    height: 28,
                    textTransform: "none",
                    fontSize: 12,
                    borderColor: "#caa5a5",
                    color: "#1f1f1f",
                  }}
                >
                  1
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 54,
                    height: 28,
                    textTransform: "none",
                    fontSize: 12,
                    borderColor: "#caa5a5",
                    color: "#1f1f1f",
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ height: { xs: "18vh", sm: "22vh", md: "30vh" } }} />

          <Box
            sx={{
              position: "fixed",
              right: { xs: 12, sm: 18 },
              bottom: { xs: 12, sm: 18 },
              zIndex: 20,
            }}
          >
            <Box
              sx={{
                width: { xs: 46, sm: 52 },
                height: { xs: 46, sm: 52 },
                bgcolor: "#2f5fb3",
                borderRadius: 1,
                display: "grid",
                placeItems: "center",
                boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
              }}
            >
              <IconButton
                sx={{
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.35)",
                  color: "#fff",
                }}
                onClick={() => {
                  setTab(0);
                  setShowCreateForm(true);
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ height: { xs: "10vh", sm: "12vh" } }} />
        </TabPanel>
      </Box>
    </Box>
  );
}  