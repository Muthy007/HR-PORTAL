import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Divider,
  Switch,
  Radio,
  RadioGroup,
  FormControlLabel,
  Dialog,
  DialogContent,
  DialogTitle,
  Link,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const headerColor = "#5A725A";

function TabPanel({ value, index, children }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ mt: 2 }}>
      {value === index ? children : null}
    </Box>
  );
}

function DarkHeaderTable({ columns, rows = [] }) {
  return (
    <TableContainer sx={{ bgcolor: "#fff", border: "1px solid #cfd7cf" }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: headerColor }}>
            {columns.map((h) => (
              <TableCell
                key={h}
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  borderRight: "1px solid rgba(255,255,255,0.15)",
                  py: 1.1,
                  whiteSpace: "nowrap",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} sx={{ height: 50 }} />
            </TableRow>
          ) : (
            rows.map((r, idx) => (
              <TableRow key={idx}>
                {columns.map((c) => (
                  <TableCell key={c} sx={{ textAlign: "center" }}>
                    {r[c] ?? ""}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function UploadDialog({
  open,
  onClose,
  title,
  form,
  setForm,
  invoiceLabel = "Invoice Number",
  saveLabel = "Save",
  showAmount = true,
  showFileChoice = true,
}) {
  const isFileEnabled = showFileChoice ? form.docUpload === "Yes" : true;

  const handleClearClose = () => {
    setForm((prev) => ({
      ...prev,
      invoiceNo: "",
      amount: "",
      docUpload: "No",
      file: null,
    }));
    onClose();
  };

  const handleSave = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          width: { xs: "95%", sm: "90%", md: "86%" },
          maxWidth: "1200px",
          borderRadius: "16px",
          border: "2px solid #e5df2e",
          overflow: "hidden",
          m: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontSize: { xs: 22, sm: 28, md: 34 },
          fontWeight: 400,
          color: "#1f1f1f",
          pt: { xs: 2.5, sm: 3.5 },
          pb: 1,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 2.5, sm: 3.5 },
        }}
      >
        <Divider sx={{ borderColor: "#111", borderBottomWidth: 2, mb: 3 }} />

        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} sm={6} md={showAmount ? 3 : 4}>
            <Typography sx={{ fontSize: 15, mb: 1 }}>{invoiceLabel}:</Typography>
            <TextField
              fullWidth
              size="small"
              value={form.invoiceNo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, invoiceNo: e.target.value }))
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 38,
                  bgcolor: "#fff",
                },
              }}
            />
          </Grid>

          {showAmount && (
            <Grid item xs={12} sm={6} md={2}>
              <Typography sx={{ fontSize: 15, mb: 1 }}>Amount:</Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 38,
                    bgcolor: "#fff",
                  },
                }}
              />
            </Grid>
          )}

          {showFileChoice && (
            <Grid item xs={12} sm={6} md={3}>
              <Typography sx={{ fontSize: 15, mb: 1 }}>Doc. Upload:</Typography>
              <RadioGroup
                row
                value={form.docUpload}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    docUpload: e.target.value,
                    file: e.target.value === "No" ? null : prev.file,
                  }))
                }
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
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={showAmount ? 4 : 5}>
            <Typography sx={{ fontSize: 15, mb: 1 }}>File:</Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #c7ced6",
                borderRadius: "2px",
                minHeight: 38,
                px: 1,
                bgcolor: isFileEnabled ? "#fff" : "#f3f3f3",
                opacity: isFileEnabled ? 1 : 0.7,
              }}
            >
              <Button
                component="label"
                variant="outlined"
                disabled={!isFileEnabled}
                sx={{
                  minWidth: "auto",
                  px: 1.5,
                  py: 0.4,
                  textTransform: "none",
                  fontSize: 13,
                  color: "#000",
                  borderColor: "#888",
                }}
              >
                Choose File
                <input
                  hidden
                  type="file"
                  disabled={!isFileEnabled}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      file: e.target.files?.[0] || null,
                    }))
                  }
                />
              </Button>

              <Typography
                sx={{
                  ml: 1,
                  fontSize: 13,
                  color: "#555555",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {form.file ? form.file.name : "No file chosen"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                mt: 1,
                display: "flex",
                justifyContent: "center",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  minWidth: { xs: "100%", sm: 220, md: 260 },
                  height: 42,
                  bgcolor: "#1976d2",
                  textTransform: "none",
                  borderRadius: "3px",
                  boxShadow: "none",
                }}
              >
                {saveLabel}
              </Button>

              <Button
                variant="contained"
                onClick={handleClearClose}
                sx={{
                  minWidth: { xs: "100%", sm: 220, md: 260 },
                  height: 42,
                  bgcolor: "#c91b2d",
                  textTransform: "none",
                  borderRadius: "3px",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#dc3545",
                  },
                }}
              >
                Clear & Close
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default function CreateStatement() {
  const [tab, setTab] = useState(0);

  const [monthOfClaim, setMonthOfClaim] = useState("");
  const [claimId, setClaimId] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [showClaimTable, setShowClaimTable] = useState(false);

  const [claimForm, setClaimForm] = useState({
    travelEnabled: false,
    travelDate: "",
    purpose: "Customer Visit",
    fromLoc: "",
    toLoc: "",
    kmRun: "",
    travelAmount: "",
    remark: "NA",
    travelFileUpload: false,

    foodDate: "",
    breakfast: "0",
    lunch: "0",
    dinner: "0",
    commonFood: "0",

    tollEnabled: false,
    tollDate: "",
    tollAmount: "",
    tollFile: "No",

    autoEnabled: false,
    autoDate: "",
    autoAmount: "",
    autoFile: "No",

    othersEnabled: false,
    othersDate: "",
    othersAmount: "",
    othersFile: "No",
    othersRemark: "",
  });

  const [claimRows, setClaimRows] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [editPopupOpen, setEditPopupOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    date: "",
    purpose: "Customer Visit",
    vehicle: "",
    vehicleNo: "",
    fuelType: "",
    fromLoc: "",
    toLoc: "",
    kmRun: "",
    amount: "",
    remark: "NA",
    foodItems: {
      common: { enabled: false, invoice: "", amount: "", fileAction: "Same", file: null },
      breakfast: { enabled: false, invoice: "", amount: "", fileAction: "Same", file: null },
      lunch: { enabled: false, invoice: "", amount: "", fileAction: "Same", file: null },
      dinner: { enabled: false, invoice: "", amount: "", fileAction: "Same", file: null },
      toll: { enabled: false, invoice: "", amount: "", fileAction: "Same", file: null },
      auto: { enabled: false, invoice: "", amount: "", fileAction: "Same", file: null },
      others: { enabled: false, invoice: "", amount: "", fileAction: "Same", file: null },
    },
  });

  const [busTaxiModalOpen, setBusTaxiModalOpen] = useState(false);

  const [foodDialogs, setFoodDialogs] = useState({
    commonFood: false,
    breakfast: false,
    lunch: false,
    dinner: false,
  });

  const [foodForms, setFoodForms] = useState({
    commonFood: { invoiceNo: "", amount: "", docUpload: "Yes", file: null },
    breakfast: { invoiceNo: "", amount: "", docUpload: "Yes", file: null },
    lunch: { invoiceNo: "", amount: "", docUpload: "Yes", file: null },
    dinner: { invoiceNo: "", amount: "", docUpload: "Yes", file: null },
  });

  const [busTaxiForm, setBusTaxiForm] = useState({
    invoiceNo: "",
    amount: "",
    docUpload: "Yes",
    file: null,
  });

  const handleClaimFormChange = (field, value) => {
    setClaimForm((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "travelDate") {
        updated.foodDate = value;
        updated.tollDate = value;
        updated.autoDate = value;
        updated.othersDate = value;
      }

      if (field === "kmRun") {
        const km = Number(value || 0);

        if (vehicle === "Bike") {
          updated.travelAmount = String(km * 5);
        } else if (vehicle === "Car") {
          updated.travelAmount = String(km * 13);
        }
      }

      return updated;
    });
  };

  const vehicleLabel =
    vehicle === "Bike"
      ? "Bike"
      : vehicle === "Car"
        ? "Car"
        : vehicle === "Bus / Train"
          ? "Bus/Train"
          : vehicle === "Auto / Taxi"
            ? "Auto/Taxi"
            : "Travel";

  const isBusTaxiVehicle =
    vehicle === "Bus / Train" || vehicle === "Auto / Taxi";

  const handleTravelFileSwitch = (checked) => {
    handleClaimFormChange("travelFileUpload", checked);
    if (checked && isBusTaxiVehicle) {
      setBusTaxiModalOpen(true);
    }
  };

  const handleRefreshCreate = () => {
    setMonthOfClaim("");
    setClaimId("");
    setVehicle("");
    setVehicleNo("");
    setFuelType("");
    setShowClaimTable(false);
    setClaimRows([]);
    setEditIndex(null);

    setClaimForm({
      travelEnabled: true,
      travelDate: "",
      purpose: "Customer Visit",
      fromLoc: "",
      toLoc: "",
      kmRun: "",
      travelAmount: "",
      remark: "NA",
      travelFileUpload: false,

      foodDate: "",
      breakfast: "0",
      lunch: "0",
      dinner: "0",
      commonFood: "0",

      tollEnabled: false,
      tollDate: "",
      tollAmount: "",
      tollFile: "No",

      autoEnabled: false,
      autoDate: "",
      autoAmount: "",
      autoFile: "No",

      othersEnabled: false,
      othersDate: "",
      othersAmount: "",
      othersFile: "No",
      othersRemark: "",
    });

    setBusTaxiForm({
      invoiceNo: "",
      amount: "",
      docUpload: "Yes",
      file: null,
    });

    setFoodForms({
      commonFood: { invoiceNo: "", amount: "", docUpload: "Yes", file: null },
      breakfast: { invoiceNo: "", amount: "", docUpload: "Yes", file: null },
      lunch: { invoiceNo: "", amount: "", docUpload: "Yes", file: null },
      dinner: { invoiceNo: "", amount: "", docUpload: "Yes", file: null },
    });
  };

  const handleAddOrUpdateClaimRow = () => {
    const foodTotal =
      Number(claimForm.commonFood || 0) +
      Number(claimForm.breakfast || 0) +
      Number(claimForm.lunch || 0) +
      Number(claimForm.dinner || 0);

    const toll = claimForm.tollEnabled ? Number(claimForm.tollAmount || 0) : 0;
    const auto = claimForm.autoEnabled ? Number(claimForm.autoAmount || 0) : 0;
    const others = claimForm.othersEnabled ? Number(claimForm.othersAmount || 0) : 0;

    const travelAmount = Number(claimForm.travelAmount || busTaxiForm.amount || 0);
    const total = travelAmount + foodTotal + toll + auto + others;

    const newRow = {
      date: claimForm.travelDate || "-",
      purpose: claimForm.purpose || "-",
      vehType: vehicle || "-",
      fromLoc: claimForm.fromLoc || "-",
      toLoc: claimForm.toLoc || "-",
      kmRun: claimForm.kmRun || "0",
      amount: travelAmount.toFixed(2),
      food: foodTotal.toFixed(2),
      toll: toll.toFixed(2),
      auto: auto.toFixed(2),
      others: others.toFixed(2),
      total: total.toFixed(2),
      remark: claimForm.remark || "-",
    };

    if (editIndex !== null) {
      const updatedRows = [...claimRows];
      updatedRows[editIndex] = newRow;
      setClaimRows(updatedRows);
      setEditIndex(null);
    } else {
      setClaimRows((prev) => [...prev, newRow]);

      const nextCounter = claimCounter + 1;
      setClaimCounter(nextCounter);

      if (monthOfClaim) {
        setClaimId(generateClaimId(monthOfClaim, nextCounter));
      }
    }

    setClaimForm({
      travelEnabled: true,
      travelDate: "",
      purpose: "Customer Visit",
      fromLoc: "",
      toLoc: "",
      kmRun: "",
      travelAmount: "",
      remark: "NA",
      travelFileUpload: false,

      foodDate: "",
      breakfast: "0",
      lunch: "0",
      dinner: "0",
      commonFood: "0",

      tollEnabled: false,
      tollDate: "",
      tollAmount: "",
      tollFile: "No",

      autoEnabled: false,
      autoDate: "",
      autoAmount: "",
      autoFile: "No",

      othersEnabled: false,
      othersDate: "",
      othersAmount: "",
      othersFile: "No",
      othersRemark: "",
    });

    setVehicle("");
    setVehicleNo("");
    setFuelType("");

    setBusTaxiForm({
      invoiceNo: "",
      amount: "",
      docUpload: "Yes",
      file: null,
    });

    setFoodForms({
      commonFood: { invoiceNo: "", amount: "", docUpload: "Yes", file: null },
      breakfast: { invoiceNo: "", amount: "", docUpload: "Yes", file: null },
      lunch: { invoiceNo: "", amount: "", docUpload: "Yes", file: null },
      dinner: { invoiceNo: "", amount: "", docUpload: "Yes", file: null },
    });
  };
  const handleEditFoodChange = (key, field, value) => {
    setEditForm((prev) => ({
      ...prev,
      foodItems: {
        ...prev.foodItems,
        [key]: {
          ...prev.foodItems[key],
          [field]: value,
        },
      },
    }));
  };

  const handleEditRow = (index) => {

    const row = claimRows[index];

    setEditIndex(index);

    setEditForm({
      date: row.date !== "-" ? row.date : "",
      purpose: row.purpose !== "-" ? row.purpose : "Customer Visit",
      vehicle: row.vehType !== "-" ? row.vehType : "",
      vehicleNo: vehicleNo || "",
      fuelType: fuelType || "",
      fromLoc: row.fromLoc !== "-" ? row.fromLoc : "",
      toLoc: row.toLoc !== "-" ? row.toLoc : "",
      kmRun: row.kmRun !== "-" ? row.kmRun : "",
      amount: row.amount !== "-" ? row.amount : "",
      remark: row.remark || "NA",

      foodItems: {
        common: {
          enabled: Number(row.food || 0) > 0,
          invoice: "",
          amount: row.food || "",
          fileAction: "Same",
          file: null,
        },
        breakfast: {
          enabled: false,
          invoice: "",
          amount: "",
          fileAction: "Same",
          file: null,
        },
        lunch: {
          enabled: false,
          invoice: "",
          amount: "",
          fileAction: "Same",
          file: null,
        },
        dinner: {
          enabled: false,
          invoice: "",
          amount: "",
          fileAction: "Same",
          file: null,
        },
        toll: {
          enabled: Number(row.toll || 0) > 0,
          invoice: "",
          amount: row.toll || "",
          fileAction: "Same",
          file: null,
        },
        auto: {
          enabled: Number(row.auto || 0) > 0,
          invoice: "",
          amount: row.auto || "",
          fileAction: "Same",
          file: null,
        },
        others: {
          enabled: Number(row.others || 0) > 0,
          invoice: "",
          amount: row.others || "",
          fileAction: "Same",
          file: null,
        },
      },
    });

    setEditPopupOpen(true);
  };

  const handleEditPopupSave = () => {
    if (editIndex === null) return;

    const common = editForm.foodItems.common.enabled
      ? Number(editForm.foodItems.common.amount || 0)
      : 0;

    const breakfast = editForm.foodItems.breakfast.enabled
      ? Number(editForm.foodItems.breakfast.amount || 0)
      : 0;

    const lunch = editForm.foodItems.lunch.enabled
      ? Number(editForm.foodItems.lunch.amount || 0)
      : 0;

    const dinner = editForm.foodItems.dinner.enabled
      ? Number(editForm.foodItems.dinner.amount || 0)
      : 0;

    const toll = editForm.foodItems.toll.enabled
      ? Number(editForm.foodItems.toll.amount || 0)
      : 0;

    const auto = editForm.foodItems.auto.enabled
      ? Number(editForm.foodItems.auto.amount || 0)
      : 0;

    const others = editForm.foodItems.others.enabled
      ? Number(editForm.foodItems.others.amount || 0)
      : 0;

    const foodTotal = common + breakfast + lunch + dinner;
    const travelAmount = Number(editForm.amount || 0);
    const total = travelAmount + foodTotal + toll + auto + others;

    const updatedRow = {
      ...claimRows[editIndex],
      date: editForm.date || "-",
      purpose: editForm.purpose || "-",
      vehType: editForm.vehicle || "-",
      fromLoc: editForm.fromLoc || "-",
      toLoc: editForm.toLoc || "-",
      kmRun: editForm.kmRun || "0",
      amount: travelAmount.toFixed(2),
      food: foodTotal.toFixed(2),
      toll: toll.toFixed(2),
      auto: auto.toFixed(2),
      others: others.toFixed(2),
      total: total.toFixed(2),
      remark: editForm.remark || "NA",
    };

    const updatedRows = [...claimRows];
    updatedRows[editIndex] = updatedRow;
    setClaimRows(updatedRows);

    setClaimForm((prev) => ({
      ...prev,
      travelDate: editForm.date,
      purpose: editForm.purpose,
      fromLoc: editForm.fromLoc,
      toLoc: editForm.toLoc,
      kmRun: editForm.kmRun,
      travelAmount: editForm.amount,
      remark: editForm.remark,
      commonFood: String(common),
      breakfast: String(breakfast),
      lunch: String(lunch),
      dinner: String(dinner),
      tollAmount: String(toll),
      autoAmount: String(auto),
      othersAmount: String(others),
      tollEnabled: editForm.foodItems.toll.enabled,
      autoEnabled: editForm.foodItems.auto.enabled,
      othersEnabled: editForm.foodItems.others.enabled,
      othersRemark: editForm.foodItems.others.invoice || "",
    }));

    setVehicle(editForm.vehicle);
    setVehicleNo(editForm.vehicleNo);
    setFuelType(editForm.fuelType);

    setEditPopupOpen(false);
    setEditIndex(null);
  };

  const editRowsConfig = [
    { key: "common", label: "Common", invoicePlaceholder: "Invoice" },
    { key: "breakfast", label: "Breakfast", invoicePlaceholder: "Invoice" },
    { key: "lunch", label: "Lunch", invoicePlaceholder: "Invoice" },
    { key: "dinner", label: "Dinner", invoicePlaceholder: "Invoice" },
    { key: "toll", label: "Toll", invoicePlaceholder: "" },
    { key: "auto", label: "Auto", invoicePlaceholder: "" },
    { key: "others", label: "Others", invoicePlaceholder: "Remarks" },
  ];

  const handleUpdatePopupRow = () => {
    if (editIndex === null) return;

    const updatedRow = {
      ...claimRows[editIndex],
      date: editForm.date || "-",
      purpose: editForm.purpose || "-",
      vehType: editForm.vehicle || "-",
      fromLoc: editForm.fromLoc || "-",
      toLoc: editForm.toLoc || "-",
      kmRun: editForm.kmRun || "0",
      amount: Number(editForm.amount || 0).toFixed(2),
      total: (
        Number(editForm.amount || 0) +
        Number(claimRows[editIndex].food || 0) +
        Number(claimRows[editIndex].toll || 0) +
        Number(claimRows[editIndex].auto || 0) +
        Number(claimRows[editIndex].others || 0)
      ).toFixed(2),
      remark: editForm.remark || "NA",
    };

    const updatedRows = [...claimRows];
    updatedRows[editIndex] = updatedRow;
    setClaimRows(updatedRows);

    setEditPopupOpen(false);
    setEditIndex(null);
  };


  const handleDeleteRow = (index) => {
    setClaimRows((prev) => prev.filter((_, i) => i !== index));
    if (editIndex === index) {
      setEditIndex(null);
    }
  };

  const totals = useMemo(() => {
    return claimRows.reduce(
      (acc, row) => {
        const amt = Number(row.amount || 0);

        if (row.vehType === "Car") acc.car += amt;
        if (row.vehType === "Bike") acc.bike += amt;
        if (row.vehType === "Bus / Train" || row.vehType === "Auto / Taxi") {
          acc.busTaxi += amt;
        }

        acc.food += Number(row.food || 0);
        acc.toll += Number(row.toll || 0);
        acc.auto += Number(row.auto || 0);
        acc.others += Number(row.others || 0);
        acc.total += Number(row.total || 0);

        return acc;
      },
      {
        car: 0,
        bike: 0,
        busTaxi: 0,
        food: 0,
        toll: 0,
        auto: 0,
        others: 0,
        total: 0,
      }
    );
  }, [claimRows]);

  const [viewYear, setViewYear] = useState(dayjs());
  const viewRows = useMemo(() => [], []);

  const handleRefreshView = () => {
    console.log("Refresh View", viewYear);
  };

  const [carNo, setCarNo] = useState("");
  const [bikeNo, setBikeNo] = useState("");
  const [gearType, setGearType] = useState("Automatic");
  const [fuel, setFuel] = useState("Diesel");
  const [ccRange, setCcRange] = useState("0");

  const [saveLoading, setSaveLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);

  const fetchVehicles = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch("http://192.168.29.252:7080/api/TravelMaster/all");
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);

        const car = data.find((v) => v.vehicleType === "Car");
        const bike = data.find((v) => v.vehicleType === "Bike");
        if (car) {
          setCarNo(car.vehicleNumber);
          setCcRange(car.ccRange);
          setFuel(car.fuelType);
          setGearType(car.gearType);
        }
        if (bike) {
          setBikeNo(bike.vehicleNumber);
          if (!car) {
            setCcRange(bike.ccRange);
            setFuel(bike.fuelType);
            setGearType(bike.gearType);
          }
        }
      } else {
        console.error("Failed to fetch vehicles:", response.statusText);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSaveVehicle = async () => {
    try {
      setSaveLoading(true);

      if (!carNo && !bikeNo) {
        alert("Enter Car No or Bike No");
        return;
      }

      // Save Car
      if (carNo) {
        const carPayload = {
          vehicleId: 0,
          vehicleType: "Car",
          vehicleNumber: carNo,
          gearType: gearType,
          fuelType: fuel,
          ccRange: Number(ccRange) || 0,
        };

        const carRes = await fetch("http://192.168.29.252:7080/api/TravelMaster/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(carPayload),
        });

        if (!carRes.ok) {
          const errorText = await carRes.text();
          throw new Error(`Car save failed: ${carRes.status} - ${errorText}`);
        }
      }

      // Save Bike
      if (bikeNo) {
        const bikePayload = {
          vehicleId: 0,
          vehicleType: "Bike",
          vehicleNumber: bikeNo,
          gearType: gearType,
          fuelType: fuel,
          ccRange: Number(ccRange) || 0,
        };

        const bikeRes = await fetch("http://192.168.29.252:7080/api/TravelMaster/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bikePayload),
        });

        if (!bikeRes.ok) {
          const errorText = await bikeRes.text();
          throw new Error(`Bike save failed: ${bikeRes.status} - ${errorText}`);
        }
      }

      alert("Vehicle details saved successfully!");
      fetchVehicles();
    } catch (err) {
      console.error("Error saving vehicle details:", err);
      alert(err.message || "Failed to save vehicle details.");
    } finally {
      setSaveLoading(false);
    }
  };
  const [claimCounter, setClaimCounter] = useState(1);

  const generateClaimId = (month, counter) => {
    if (!month) return "";
    const formattedMonth = month.replace("-", "");
    const serial = String(counter).padStart(3, "0");
    return `CLM-${formattedMonth}-${serial}`;
  };

  const draftColumns = [
    "Sl. No",
    "Year",
    "Claim No",
    "Claim Month",
    "Amount",
    "Status",
    "Edit",
    "View",
  ];

  const draftRows = [];

  const selectedYear = viewYear.format("YYYY");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#e6ebe6" }}>
      <Paper
        elevation={0}
        sx={{
          bgcolor: "#d6ded6",
          borderBottom: "1px solid #cfd7cf",
          px: 1,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="inherit"
          indicatorColor="success"
          sx={{
            minHeight: 38,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: 20,
              minHeight: 38,
              py: 0,
            },
          }}
        >
          <Tab label="Create Statement" />
          <Tab label="Draft" />
          <Tab label="View Statement" />
          <Tab label="Vehicle Master" />
        </Tabs>
      </Paper>

      <Box sx={{ p: 2 }}>
        <TabPanel value={tab} index={0}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 1,
              border: "1px solid #cfd7cf",
              bgcolor: "#efefef",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "1.05fr 1.05fr 1.1fr 1.05fr 1.05fr 1.15fr",
                  },
                  gap: 2,
                  alignItems: "end",
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: 13, mb: 0.8, fontWeight: 500 }}>
                    Month of the Claim:
                  </Typography>
                  <TextField
                    size="small"
                    type="month"
                    value={monthOfClaim}
                    onChange={(e) => {
                      const selectedMonth = e.target.value;
                      setMonthOfClaim(selectedMonth);
                      setShowClaimTable(!!selectedMonth);

                      if (selectedMonth) {
                        const newClaimId = generateClaimId(
                          selectedMonth,
                          claimCounter
                        );
                        setClaimId(newClaimId);

                      } else {
                        setClaimId("");
                      }
                    }}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "#fff",
                        height: 36,
                      },
                      "& input": {
                        py: 0.8,
                        fontSize: 13,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 13, mb: 0.8, fontWeight: 500 }}>
                    Claim ID:
                  </Typography>
                  <TextField
                    size="small"
                    value={claimId}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "#fff",
                        height: 36,
                      },
                      "& input": {
                        py: 0.8,
                        fontSize: 13,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 13, mb: 0.8, fontWeight: 500 }}>
                    Vehicle:
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={vehicle}
                      displayEmpty
                      onChange={(e) => {
                        const selectedVehicle = e.target.value;
                        setVehicle(selectedVehicle);

                        const km = Number(claimForm.kmRun || 0);

                        if (selectedVehicle === "Bike") {
                          setClaimForm((prev) => ({
                            ...prev,
                            travelAmount: String(km * 5),
                          }));
                        } else if (selectedVehicle === "Car") {
                          setClaimForm((prev) => ({
                            ...prev,
                            travelAmount: String(km * 13),
                          }));
                        } else {
                          setClaimForm((prev) => ({
                            ...prev,
                            travelAmount: "",
                          }));
                        }
                      }}
                      sx={{
                        bgcolor: "#fff",
                        height: 36,
                        fontSize: 13,
                        "& .MuiSelect-select": {
                          display: "flex",
                          alignItems: "center",
                          py: 0.8,
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select Vehicle
                      </MenuItem>
                      <MenuItem value="Car">Car</MenuItem>
                      <MenuItem value="Bike">Bike</MenuItem>
                      <MenuItem value="Bus / Train">Bus / Train</MenuItem>
                      <MenuItem value="Auto / Taxi">Auto / Taxi</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 13, mb: 0.8, fontWeight: 500 }}>
                    Vehicle No.:
                  </Typography>
                  <TextField
                    size="small"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "#fff",
                        height: 36,
                      },
                      "& input": {
                        py: 0.8,
                        fontSize: 13,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 13, mb: 0.8, fontWeight: 500 }}>
                    Fuel Type:
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      sx={{
                        bgcolor: "#fff",
                        height: 36,
                        fontSize: 13,
                        "& .MuiSelect-select": {
                          display: "flex",
                          alignItems: "center",
                          py: 0.8,
                        },
                      }}
                    >
                      <MenuItem value="">Select Fuel</MenuItem>
                      <MenuItem value="NA">NA</MenuItem>
                      <MenuItem value="Petrol">Petrol</MenuItem>
                      <MenuItem value="Diesel">Diesel</MenuItem>
                      <MenuItem value="EV">EV</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 13, mb: 0.8, opacity: 0 }}>
                    Action
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleRefreshCreate}
                      startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        height: 36,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: 13,
                        bgcolor: "#5c9ded",
                        boxShadow: "none",
                        borderRadius: "2px",
                        "&:hover": {
                          bgcolor: "#4a8fe6",
                          boxShadow: "none",
                        },
                      }}
                    >
                      Refresh
                    </Button>

                    <IconButton
                      size="small"
                      sx={{
                        color: "#1f1f1f",
                        p: 0.4,
                        mt: "1px",
                      }}
                    >
                      <InfoOutlinedIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>

              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: 13,
                  mt: 2.2,
                  color: "#111",
                }}
              >
                Note: As a control and hygiene measure, no claim will be
                processed if the claim is lodged after 10 days of the invoice
                date unless the exception is approved by the concerned approving
                authority.
              </Typography>
            </Box>
          </Paper>

          {showClaimTable && (
            <Paper
              elevation={0}
              sx={{
                mt: 2,
                border: "2px solid #232a31",
                borderRadius: 1,
                overflowX: "auto",
                bgcolor: "#edf1ed",
              }}
            >
              <Box sx={{ px: 2, py: 1.2, display: "flex", alignItems: "center" }}>
                <Typography sx={{ fontWeight: 500, fontSize: 22 }}>
                  Create Local Claim Statement
                </Typography>

              </Box>

              <Box sx={{ px: 1.5, pb: 1.5 }}>
                <TableContainer
                  sx={{
                    border: "1px solid #d5d9d5",
                    bgcolor: "#eef3ee",
                  }}
                >
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, width: 90 }}>
                          {vehicleLabel}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Purpose</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>From Loc.</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>To Loc.</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          {isBusTaxiVehicle ? "File Upload" : "Dist.(KM)"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Amount.</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          Remark(Cust. Name)
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell>
                          <Switch
                            checked={claimForm.travelEnabled}
                            onChange={(e) =>
                              handleClaimFormChange(
                                "travelEnabled",
                                e.target.checked
                              )
                            }
                            size="small"
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            type="date"
                            value={claimForm.travelDate}
                            onChange={(e) =>
                              handleClaimFormChange("travelDate", e.target.value)
                            }
                            fullWidth
                            disabled={!claimForm.travelEnabled}
                            inputProps={{
                              min: monthOfClaim ? `${monthOfClaim}-01` : undefined,
                              max: monthOfClaim
                                ? `${monthOfClaim}-${new Date(
                                  Number(monthOfClaim.split("-")[0]),
                                  Number(monthOfClaim.split("-")[1]),
                                  0
                                ).getDate()}`
                                : undefined,
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={claimForm.purpose}
                              onChange={(e) =>
                                handleClaimFormChange("purpose", e.target.value)
                              }
                            >
                              <MenuItem value="Customer Visit">
                                Customer Visit
                              </MenuItem>
                              <MenuItem value="For Conference">
                                For Conference
                              </MenuItem>
                              <MenuItem value="Office Work">Office Work</MenuItem>
                              <MenuItem value="Client Visit">Client Visit</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="From Location"
                            value={claimForm.fromLoc}
                            onChange={(e) =>
                              handleClaimFormChange("fromLoc", e.target.value)
                            }
                            fullWidth
                            disabled={!claimForm.travelEnabled}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="To Location"
                            value={claimForm.toLoc}
                            onChange={(e) =>
                              handleClaimFormChange("toLoc", e.target.value)
                            }
                            fullWidth
                            disabled={!claimForm.travelEnabled}
                          />
                        </TableCell>

                        <TableCell>
                          {isBusTaxiVehicle ? (
                            <Switch
                              checked={claimForm.travelFileUpload}
                              onChange={(e) => handleTravelFileSwitch(e.target.checked)}
                              size="small"
                            />
                          ) : (
                            <TextField
                              type="number"
                              size="small"
                              placeholder="KM Run"
                              value={claimForm.kmRun}
                              onChange={(e) => handleClaimFormChange("kmRun", e.target.value)}
                              fullWidth
                              disabled={!claimForm.travelEnabled}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={claimForm.travelAmount}
                            onChange={(e) =>
                              handleClaimFormChange("travelAmount", e.target.value)
                            }
                            fullWidth
                            disabled={!claimForm.travelEnabled}
                            InputProps={{
                              readOnly: vehicle === "Bike" || vehicle === "Car",
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            value={claimForm.remark}
                            onChange={(e) =>
                              handleClaimFormChange("remark", e.target.value)
                            }
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Food</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          <Link
                            component="button"
                            underline="hover"
                            sx={{ fontWeight: 700, color: "#000" }}
                            onClick={() =>
                              setFoodDialogs((prev) => ({
                                ...prev,
                                commonFood: true,
                              }))
                            }
                          >
                            Daily Allowance(Common)
                          </Link>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          <Link
                            component="button"
                            underline="hover"
                            sx={{ fontWeight: 700, color: "#000" }}
                            onClick={() =>
                              setFoodDialogs((prev) => ({
                                ...prev,
                                breakfast: true,
                              }))
                            }
                          >
                            Breakfast
                          </Link>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          <Link
                            component="button"
                            underline="hover"
                            sx={{ fontWeight: 700, color: "#000" }}
                            onClick={() =>
                              setFoodDialogs((prev) => ({
                                ...prev,
                                lunch: true,
                              }))
                            }
                          >
                            Lunch
                          </Link>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          <Link
                            component="button"
                            underline="hover"
                            sx={{ fontWeight: 700, color: "#000" }}
                            onClick={() =>
                              setFoodDialogs((prev) => ({
                                ...prev,
                                dinner: true,
                              }))
                            }
                          >
                            Dinner
                          </Link>
                        </TableCell>
                        <TableCell />
                        <TableCell />
                      </TableRow>

                      <TableRow>
                        <TableCell />
                        <TableCell>
                          <TextField
                            size="small"
                            type="date"
                            value={claimForm.foodDate}
                            fullWidth
                            disabled
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={claimForm.commonFood}
                            onChange={(e) =>
                              handleClaimFormChange("commonFood", e.target.value)
                            }
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={claimForm.breakfast}
                            onChange={(e) =>
                              handleClaimFormChange("breakfast", e.target.value)
                            }
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={claimForm.lunch}
                            onChange={(e) =>
                              handleClaimFormChange("lunch", e.target.value)
                            }
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={claimForm.dinner}
                            onChange={(e) =>
                              handleClaimFormChange("dinner", e.target.value)
                            }
                            fullWidth
                          />
                        </TableCell>
                        <TableCell />
                        <TableCell />
                      </TableRow>

                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Toll</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>File</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>File Upload</TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                      </TableRow>

                      <TableRow>
                        <TableCell>
                          <Switch
                            checked={claimForm.tollEnabled}
                            onChange={(e) =>
                              handleClaimFormChange(
                                "tollEnabled",
                                e.target.checked
                              )
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="date"
                            value={claimForm.tollDate}
                            fullWidth
                            disabled
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Amount"
                            value={claimForm.tollAmount}
                            disabled={!claimForm.tollEnabled}
                            onChange={(e) =>
                              handleClaimFormChange("tollAmount", e.target.value)
                            }
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <RadioGroup
                            row
                            value={claimForm.tollFile}
                            onChange={(e) =>
                              handleClaimFormChange("tollFile", e.target.value)
                            }
                          >
                            <FormControlLabel
                              value="Yes"
                              control={
                                <Radio
                                  size="small"
                                  disabled={!claimForm.tollEnabled}
                                />
                              }
                              label="Yes"
                            />
                            <FormControlLabel
                              value="No"
                              control={
                                <Radio
                                  size="small"
                                  disabled={!claimForm.tollEnabled}
                                />
                              }
                              label="No"
                            />
                          </RadioGroup>
                        </TableCell>
                        <TableCell>
                          <Button
                            component="label"
                            disabled={
                              !claimForm.tollEnabled ||
                              claimForm.tollFile !== "Yes"
                            }
                            sx={{ textTransform: "none", bgcolor: "white" }}
                          >
                            File Upload
                            <input hidden type="file" />
                          </Button>
                        </TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                      </TableRow>

                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Auto</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>File</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>File Upload</TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                      </TableRow>

                      <TableRow>
                        <TableCell>
                          <Switch
                            checked={claimForm.autoEnabled}
                            onChange={(e) =>
                              handleClaimFormChange(
                                "autoEnabled",
                                e.target.checked
                              )
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="date"
                            value={claimForm.autoDate}
                            fullWidth
                            disabled
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Amount"
                            value={claimForm.autoAmount}
                            disabled={!claimForm.autoEnabled}
                            onChange={(e) =>
                              handleClaimFormChange("autoAmount", e.target.value)
                            }
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <RadioGroup
                            row
                            value={claimForm.autoFile}
                            onChange={(e) =>
                              handleClaimFormChange("autoFile", e.target.value)
                            }
                          >
                            <FormControlLabel
                              value="Yes"
                              control={
                                <Radio
                                  size="small"
                                  disabled={!claimForm.autoEnabled}
                                />
                              }
                              label="Yes"
                            />
                            <FormControlLabel
                              value="No"
                              control={
                                <Radio
                                  size="small"
                                  disabled={!claimForm.autoEnabled}
                                />
                              }
                              label="No"
                            />
                          </RadioGroup>
                        </TableCell>
                        <TableCell>
                          <Button
                            component="label"
                            disabled={
                              !claimForm.autoEnabled ||
                              claimForm.autoFile !== "Yes"
                            }
                            sx={{ textTransform: "none", bgcolor: "white" }}
                          >
                            File Upload
                            <input hidden type="file" />
                          </Button>
                        </TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                      </TableRow>

                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Others</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>File</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>File Upload</TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell>
                          <Switch
                            checked={claimForm.othersEnabled}
                            onChange={(e) =>
                              handleClaimFormChange(
                                "othersEnabled",
                                e.target.checked
                              )
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="date"
                            value={claimForm.othersDate}
                            fullWidth
                            disabled
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Amount"
                            value={claimForm.othersAmount}
                            disabled={!claimForm.othersEnabled}
                            onChange={(e) =>
                              handleClaimFormChange(
                                "othersAmount",
                                e.target.value
                              )
                            }
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <RadioGroup
                            row
                            value={claimForm.othersFile}
                            onChange={(e) =>
                              handleClaimFormChange("othersFile", e.target.value)
                            }
                          >
                            <FormControlLabel
                              value="Yes"
                              control={
                                <Radio
                                  size="small"
                                  disabled={!claimForm.othersEnabled}
                                />
                              }
                              label="Yes"
                            />
                            <FormControlLabel
                              value="No"
                              control={
                                <Radio
                                  size="small"
                                  disabled={!claimForm.othersEnabled}
                                />
                              }
                              label="No"
                            />
                          </RadioGroup>
                        </TableCell>
                        <TableCell>
                          <Button
                            component="label"
                            disabled={
                              !claimForm.othersEnabled ||
                              claimForm.othersFile !== "Yes"
                            }
                            sx={{ textTransform: "none", bgcolor: "white" }}
                          >
                            File Upload
                            <input hidden type="file" />
                          </Button>
                        </TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="Remarks"
                            value={claimForm.othersRemark}
                            disabled={!claimForm.othersEnabled}
                            onChange={(e) =>
                              handleClaimFormChange(
                                "othersRemark",
                                e.target.value
                              )
                            }
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: "flex", justifyContent: "center", py: 1.5 }}>
                  <Button
                    variant="contained"
                    onClick={handleAddOrUpdateClaimRow}
                    sx={{
                      bgcolor: "#1976d2",
                      minWidth: 260,
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    {editIndex !== null ? "Update" : "Add"}
                  </Button>
                </Box>

                <TableContainer sx={{ bgcolor: "white", border: "1px solid #d5d9d5", mt: 0.5, borderRadius: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: headerColor }}>
                        {[
                          "Date",
                          "Purpose",
                          "Veh. Type",
                          "From Loc",
                          "To Loc",
                          "KM Run",
                          "Amount",
                          "Food",
                          "Toll Charge",
                          "Auto",
                          "Others",
                          "Total",
                          "Actions",
                        ].map((head) => (
                          <TableCell
                            key={head}
                            sx={{
                              color: "#ffffff",
                              fontWeight: 700,
                              textAlign: "center",
                            }}
                          >
                            {head}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {claimRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={13} sx={{ height: 50 }} />

                        </TableRow>
                      ) : (
                        claimRows.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell align="center">{row.date}</TableCell>
                            <TableCell align="center">{row.purpose}</TableCell>
                            <TableCell align="center">{row.vehType}</TableCell>
                            <TableCell align="center">{row.fromLoc}</TableCell>
                            <TableCell align="center">{row.toLoc}</TableCell>
                            <TableCell align="center">{row.kmRun}</TableCell>
                            <TableCell align="center">{row.amount}</TableCell>
                            <TableCell align="center">{row.food}</TableCell>
                            <TableCell align="center">{row.toll}</TableCell>
                            <TableCell align="center">{row.auto}</TableCell>
                            <TableCell align="center">{row.others}</TableCell>
                            <TableCell align="center">{row.total}</TableCell>
                            <TableCell align="center">
                              <Tooltip title="Edit">
                                <IconButton onClick={() => handleEditRow(index)}>
                                  <EditIcon sx={{ color: "blue" }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  onClick={() => handleDeleteRow(index)}
                                >
                                  <DeleteIcon sx={{ color: "red" }} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Paper sx={{ mt: 3, borderRadius: 3, overflow: "hidden", bgcolor: "white " }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        {/* Top title row */}
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            align="center"
                            sx={{
                              bgcolor: headerColor,
                              color: "#fff",
                              fontWeight: 700,
                              py: 1.5,
                              borderBottom: "2px solid #000",
                              fontSize: "16px",
                            }}
                          >
                            Total Expense Amount (Rs.)
                          </TableCell>
                        </TableRow>

                        {/* Column headers */}
                        <TableRow sx={{ bgcolor: headerColor }}>
                          {[
                            "Car",
                            "Bike",
                            "Bus/Taxi",
                            "Food",
                            "Toll Charges",
                            "Auto",
                            "Others",
                            "Total",
                          ].map((head) => (
                            <TableCell
                              key={head}
                              align="center"
                              sx={{
                                color: "#fff",
                                fontWeight: 700,
                              }}
                            >
                              {head}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        <TableRow>
                          <TableCell align="center">{totals.car.toFixed(2)}</TableCell>
                          <TableCell align="center">{totals.bike.toFixed(2)}</TableCell>
                          <TableCell align="center">{totals.busTaxi.toFixed(2)}</TableCell>
                          <TableCell align="center">{totals.food.toFixed(2)}</TableCell>
                          <TableCell align="center">{totals.toll.toFixed(2)}</TableCell>
                          <TableCell align="center">{totals.auto.toFixed(2)}</TableCell>
                          <TableCell align="center">{totals.others.toFixed(2)}</TableCell>
                          <TableCell align="center">{totals.total.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mt: 1.2,
                    mb: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      minWidth: 320,
                      bgcolor: "#6b737a",
                      textTransform: "none",
                    }}
                  >
                    Save
                  </Button>

                  <Button
                    variant="contained"
                    sx={{
                      minWidth: 320,
                      bgcolor: "#1976d2",
                      textTransform: "none",
                    }}
                  >
                    Save & Submit
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}
        </TabPanel>

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
            <Box sx={{ px: 2, py: 2 }}>
              <TableContainer sx={{ bgcolor: "#fff", border: "1px solid #cfd7cf" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "rgb(90,114,90)" }}>
                      {draftColumns.map((col, index) => (
                        <TableCell
                          key={index}
                          sx={{ color: "#fff", fontWeight: 700, textAlign: "center" }}
                        >
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {draftRows.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell align="center">{row.slNo}</TableCell>
                        <TableCell align="center">{row.year}</TableCell>
                        <TableCell align="center">{row.claimNo}</TableCell>
                        <TableCell align="center">{row.claimMonth}</TableCell>
                        <TableCell align="center">{row.amount}</TableCell>
                        <TableCell align="center">{row.status}</TableCell>
                        <TableCell align="center">{row.edit}</TableCell>
                        <TableCell align="center">{row.view}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </TabPanel>

        <TabPanel value={tab} index={2}>
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {/* LEFT SIDE */}
              <Typography sx={{ fontWeight: 500, fontSize: 25, ml: 2, p: 1 }}>
                Local Claim Statement
              </Typography>

              {/* RIGHT SIDE */}
              <Box sx={{
                display: "flex", gap: 1,
                borderRadius: "20"
              }}>
                {/* Year Dropdown */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    views={["year"]}
                    value={viewYear}
                    onChange={(newValue) => setViewYear(newValue)}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: { p: 1, width: 150, height: 30 },
                      },
                    }}
                  />
                </LocalizationProvider>

                {/* Refresh Button */}
                <Button
                  variant="contained"
                  onClick={handleRefreshView}
                  sx={{
                    m: 1,

                    width: 150,              // 👉 width increase
                    height: 38,              // 👉 height small & neat
                    bgcolor: "#4ca3f0",      // 👉 grey color
                    color: "#fff",
                    textTransform: "none",
                    fontSize: 14,
                    fontWeight: 500,
                    borderRadius: "5px",     // 👉 sharp corners
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#4ca3f0",
                      boxShadow: "none",
                    },
                  }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>
            <Box sx={{ fontSize: 18, px: 2, pb: 2, }}>
              <DarkHeaderTable
                columns={[
                  "Year",
                  "Claim No.:",
                  "Claim date",
                  "Amount",
                  "Approver 1",
                  "Accounts",
                  "View Statement",
                  "Download",
                ]}
                rows={viewRows}

              />

            </Box>

          </Paper>


          <Box sx={{ height: "80vh" }} />
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                borderRadius: 0.5,
                border: "1px solid #cfd7cf",
                bgcolor: "#f3f3f3",
                overflow: "hidden",
              }}
            >
              <Box sx={{ py: 1.5 }}>
                <Typography
                  sx={{
                    textAlign: "center",
                    fontWeight: 500,
                    fontSize: 18,
                    color: "#1f1f1f",
                  }}
                >
                  Vehicle Details
                </Typography>
              </Box>

              <Divider sx={{ borderColor: "#d7ddd7" }} />

              <Box sx={{ px: 1.5, py: 1.5 }}>
                {/* Top Row */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "90px 40px 1.4fr 1.4fr 0.9fr 1.4fr",
                    },
                    columnGap: 2,
                    rowGap: 1.5,
                    alignItems: "end",
                    mb: 1.5,
                  }}
                >
                  {/* Car */}
                  <Typography sx={{ fontSize: 18, color: "#000", alignSelf: "center" }}>
                    Car1:
                  </Typography>

                  <ArrowRightAltIcon
                    sx={{
                      fontSize: 30,
                      color: "#1f1f1f",
                      alignSelf: "center",
                    }}
                  />

                  <Box>
                    <Typography sx={{ fontSize: 12, mb: 0.5, color: "#000" }}>
                      Vehicle Number:
                    </Typography>
                    <TextField
                      size="small"
                      value={carNo}
                      onChange={(e) => setCarNo(e.target.value)}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#fff",
                          height: 32,
                          borderRadius: "2px",
                        },
                        "& input": {
                          fontSize: 12,
                          py: 0.7,
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, mb: 0.5, color: "#000" }}>
                      Gear Type:
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={gearType}
                        onChange={(e) => setGearType(e.target.value)}
                        sx={{
                          bgcolor: "#fff",
                          height: 32,
                          fontSize: 12,
                          borderRadius: "2px",
                          "& .MuiSelect-select": {
                            display: "flex",
                            alignItems: "center",
                            py: 0.7,
                          },
                        }}
                      >
                        <MenuItem value="Automatic">Automatic</MenuItem>
                        <MenuItem value="Manual">Manual</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, mb: 0.5, color: "#000" }}>
                      Fuel:
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={fuel}
                        onChange={(e) => setFuel(e.target.value)}
                        sx={{
                          bgcolor: "#fff",
                          height: 32,
                          fontSize: 12,
                          borderRadius: "2px",
                          "& .MuiSelect-select": {
                            display: "flex",
                            alignItems: "center",
                            py: 0.7,
                          },
                        }}
                      >
                        <MenuItem value="Petrol">Petrol</MenuItem>
                        <MenuItem value="Diesel">Diesel</MenuItem>
                        <MenuItem value="EV">EV</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, mb: 0.5, color: "#000" }}>
                      CC Range:
                    </Typography>
                    <TextField
                      size="small"
                      value={ccRange}
                      onChange={(e) => setCcRange(e.target.value)}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#fff",
                          height: 32,
                          borderRadius: "2px",
                        },
                        "& input": {
                          fontSize: 12,
                          py: 0.7,
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Bottom Row */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "90px 40px 1.4fr 1.4fr 0.9fr 1.4fr",
                    },
                    columnGap: 2,
                    rowGap: 1.5,
                    alignItems: "end",
                  }}
                >
                  <Typography sx={{ fontSize: 18, color: "#000", alignSelf: "center" }}>
                    Bike:
                  </Typography>

                  <ArrowRightAltIcon
                    sx={{
                      fontSize: 30,
                      color: "#1f1f1f",
                      alignSelf: "center",
                    }}
                  />

                  <Box>
                    <Typography sx={{ fontSize: 12, mb: 0.5, color: "#000" }}>
                      Vehicle Number:
                    </Typography>
                    <TextField
                      size="small"
                      value={bikeNo}
                      onChange={(e) => setBikeNo(e.target.value)}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#fff",
                          height: 32,
                          borderRadius: "2px",
                        },
                        "& input": {
                          fontSize: 12,
                          py: 0.7,
                        },
                      }}
                    />
                  </Box>

                  <Box />
                  <Box />
                  <Box />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveVehicle}
                    sx={{
                      width: { xs: "100%", sm: 260, md: 310 },
                      height: 32,
                      bgcolor: "#527e5c",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: 12,
                      borderRadius: "2px",
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#527e5c", boxShadow: "none" },
                    }}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </TabPanel>
      </Box>


      <Dialog
        open={editPopupOpen}
        onClose={() => setEditPopupOpen(false)}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            width: "98%",
            maxWidth: "1550px",
            borderRadius: "16px",
            border: "2px solid #e5df2e",
            overflow: "hidden",
            bgcolor: "#f5f5f5",
          },
        }}
      >
        <DialogContent sx={{ p: 2 }}>
          <Box
            sx={{
              border: "1px solid #d0d0d0",
              borderRadius: 1,
              p: 2,
              bgcolor: "#f7f7f7",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1.6fr 1fr 1.5fr 1fr",
                },
                gap: 2,
                mb: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 14, mb: 0.8 }}>Date:</Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 14, mb: 0.8 }}>Purpose:</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={editForm.purpose}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, purpose: e.target.value }))
                    }
                  >
                    <MenuItem value="Customer Visit">Customer Visit</MenuItem>
                    <MenuItem value="For Conference">For Conference</MenuItem>
                    <MenuItem value="Office Work">Office Work</MenuItem>
                    <MenuItem value="Client Visit">Client Visit</MenuItem>
                    <MenuItem value="Supplier Visit">Supplier Visit</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 14, mb: 0.8 }}>Vehicle:</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={editForm.vehicle}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, vehicle: e.target.value }))
                    }
                  >
                    <MenuItem value="Car">Car</MenuItem>
                    <MenuItem value="Bike">Bike</MenuItem>
                    <MenuItem value="Bus / Train">Bus / Train</MenuItem>
                    <MenuItem value="Auto / Taxi">Auto / Taxi</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 14, mb: 0.8 }}>Vehicle No.:</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={editForm.vehicleNo}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, vehicleNo: e.target.value }))
                  }
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 14, mb: 0.8 }}>Fuel Type:</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={editForm.fuelType}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, fuelType: e.target.value }))
                    }
                  >
                    <MenuItem value="NA">NA</MenuItem>
                    <MenuItem value="Petrol">Petrol</MenuItem>
                    <MenuItem value="Diesel">Diesel</MenuItem>
                    <MenuItem value="EV">EV</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr 1fr 1fr",
                },
                gap: 2,
                mb: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 14, mb: 0.8 }}>From Location:</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={editForm.fromLoc}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, fromLoc: e.target.value }))
                  }
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 14, mb: 0.8 }}>To Location:</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={editForm.toLoc}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, toLoc: e.target.value }))
                  }
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 14, mb: 0.8 }}>
                  Travelled Distance(KM):
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={editForm.kmRun}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, kmRun: e.target.value }))
                  }
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 14, mb: 0.8 }}>Amount(Rs):</Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 14, mb: 0.8 }}>Remarks</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={editForm.remark}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, remark: e.target.value }))
                  }
                />
              </Box>
            </Box>

            <TableContainer
              sx={{
                border: "1px solid #d3d7db",
                bgcolor: "#fff",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: 120 }} />
                    <TableCell sx={{ fontWeight: 700, width: 100 }}>Yes / No</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Invoice</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 380 }}>File</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 140 }}>File Upload</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {editRowsConfig.map((item) => {
                    const current = editForm.foodItems[item.key];

                    return (
                      <TableRow key={item.key}>
                        <TableCell sx={{ fontWeight: 600 }}>{item.label}</TableCell>

                        <TableCell>
                          <input
                            type="checkbox"
                            checked={current.enabled}
                            onChange={(e) =>
                              handleEditFoodChange(item.key, "enabled", e.target.checked)
                            }
                            style={{ width: 20, height: 20 }}
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder={item.invoicePlaceholder}
                            value={current.invoice}
                            disabled={!current.enabled}
                            onChange={(e) =>
                              handleEditFoodChange(item.key, "invoice", e.target.value)
                            }
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                bgcolor: "#eef1f5",
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Amount"
                            type="number"
                            value={current.amount}
                            disabled={!current.enabled}
                            onChange={(e) =>
                              handleEditFoodChange(item.key, "amount", e.target.value)
                            }
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                bgcolor: "#eef1f5",
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <RadioGroup
                            row
                            value={current.fileAction}
                            onChange={(e) =>
                              handleEditFoodChange(item.key, "fileAction", e.target.value)
                            }
                          >
                            <FormControlLabel
                              value="Same"
                              control={<Radio size="small" />}
                              label="Same"
                              disabled={!current.enabled}
                            />
                            <FormControlLabel
                              value="Change"
                              control={<Radio size="small" />}
                              label="Change"
                              disabled={!current.enabled}
                            />
                            <FormControlLabel
                              value="Remove"
                              control={<Radio size="small" />}
                              label="Remove"
                              disabled={!current.enabled}
                            />
                          </RadioGroup>
                        </TableCell>

                        <TableCell>
                          <Button
                            component="label"
                            variant="text"
                            disabled={
                              !current.enabled || current.fileAction !== "Change"
                            }
                            sx={{
                              textTransform: "none",
                              minWidth: 100,
                            }}
                          >
                            Upload
                            <input
                              hidden
                              type="file"
                              onChange={(e) =>
                                handleEditFoodChange(
                                  item.key,
                                  "file",
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 3,
                mt: 5,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                onClick={handleEditPopupSave}
                sx={{
                  minWidth: 350,
                  bgcolor: "#28a745",
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#23913c",
                    boxShadow: "none",
                  },
                }}
              >
                Save
              </Button>

              <Button
                variant="contained"
                onClick={() => setEditPopupOpen(false)}
                sx={{
                  minWidth: 350,
                  bgcolor: "#dc3545",
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#c82333",
                    boxShadow: "none",
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>


      <UploadDialog
        open={busTaxiModalOpen}
        onClose={() => setBusTaxiModalOpen(false)}
        title={vehicle === "Bus / Train" ? "Bus/Taxi Bill(s)" : "Auto/Taxi Bill(s)"}
        form={busTaxiForm}
        setForm={setBusTaxiForm}
        invoiceLabel="Invoice No"
        saveLabel="Submit"
        showAmount={true}
        showFileChoice={false}
      />

      <UploadDialog
        open={foodDialogs.commonFood}
        onClose={() => setFoodDialogs((prev) => ({ ...prev, commonFood: false }))}
        title="Common Food Expense"
        form={foodForms.commonFood}
        setForm={(updater) =>
          setFoodForms((prev) => ({
            ...prev,
            commonFood:
              typeof updater === "function" ? updater(prev.commonFood) : updater,
          }))
        }
      />

      <UploadDialog
        open={foodDialogs.breakfast}
        onClose={() => setFoodDialogs((prev) => ({ ...prev, breakfast: false }))}
        title="Breakfast Food Expense"
        form={foodForms.breakfast}
        setForm={(updater) =>
          setFoodForms((prev) => ({
            ...prev,
            breakfast:
              typeof updater === "function" ? updater(prev.breakfast) : updater,
          }))
        }
      />

      <UploadDialog
        open={foodDialogs.lunch}
        onClose={() => setFoodDialogs((prev) => ({ ...prev, lunch: false }))}
        title="Lunch Food Expense"
        form={foodForms.lunch}
        setForm={(updater) =>
          setFoodForms((prev) => ({
            ...prev,
            lunch: typeof updater === "function" ? updater(prev.lunch) : updater,
          }))
        }
      />

      <UploadDialog
        open={foodDialogs.dinner}
        onClose={() => setFoodDialogs((prev) => ({ ...prev, dinner: false }))}
        title="Dinner Food Expense"
        form={foodForms.dinner}
        setForm={(updater) =>
          setFoodForms((prev) => ({
            ...prev,
            dinner:
              typeof updater === "function" ? updater(prev.dinner) : updater,
          }))
        }
      />
    </Box>
  );
} 