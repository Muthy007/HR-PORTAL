import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Modal, TextField, Select, MenuItem, InputLabel, FormControl, InputAdornment, IconButton
} from "@mui/material";
import { API_BASE_URL } from "../../assets/connection";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Close as CloseIcon,
    Calculate as CalculateIcon
} from "@mui/icons-material";

function PayrollMaster() {
    // --- State for Heads ---
    const [heads, setHeads] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [isHeadModalOpen, setIsHeadModalOpen] = useState(false);
    const [isHeadEditing, setIsHeadEditing] = useState(false);
    const [headFormData, setHeadFormData] = useState({
        headId: 0,
        headName: '',
        headType: 1
    });
    // --- State for Elements ---
    const [elements, setElements] = useState([]);
    const [fetchElementsLoading, setFetchElementsLoading] = useState(true);
    const [isElementModalOpen, setIsElementModalOpen] = useState(false);
    const [isElementEditing, setIsElementEditing] = useState(false);
    const [elementFormData, setElementFormData] = useState({
        elementId: 0,
        headId: '',
        elementValue: '',
        valueType: 'Percentage',
        valueCalculating: 'Basic Salary'
    });
    const [previewSalary, setPreviewSalary] = useState(10000);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // --- Fetchers ---
    const fetchHeads = async () => {
        try {
            setFetchLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/EmployeeMaster/heads`);
            if (response.ok) {
                const data = await response.json();
                setHeads(data);
            } else {
                console.error("Failed to fetch heads");
            }
        } catch (err) {
            console.error("Network error fetching heads", err);
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchElements = async () => {
        try {
            setFetchElementsLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/EmployeeMaster/elements`);
            if (response.ok) {
                const data = await response.json();
                setElements(data);
            } else {
                console.error("Failed to fetch elements");
            }
        } catch (err) {
            console.error("Network error fetching elements", err);
        } finally {
            setFetchElementsLoading(false);
        }
    };

    useEffect(() => {
        fetchHeads();
        fetchElements();
    }, []);

    // --- Head Handlers ---
    const handleHeadChange = (e) => {
        const { name, value } = e.target;
        setHeadFormData({
            ...headFormData,
            [name]: name === 'headType' ? parseInt(value, 10) : value
        });
    };

    const handleAddHeadClick = () => {
        setHeadFormData({ headId: 0, headName: '', headType: 1 });
        setIsHeadEditing(false);
        setError(null);
        setSuccess(null);
        setIsHeadModalOpen(true);
    };

    const handleEditHeadClick = (head) => {
        setHeadFormData({ headId: head.headId, headName: head.headName, headType: head.headType || 1 });
        setIsHeadEditing(true);
        setError(null);
        setSuccess(null);
        setIsHeadModalOpen(true);
    };

    const handleHeadSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const url = `${API_BASE_URL}/api/EmployeeMaster/add-head`;
        const method = "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json", "accept": "*/*" },
                body: JSON.stringify({
                    headId: headFormData.headId,
                    headName: headFormData.headName,
                    headType: headFormData.headType
                })
            });

            if (response.ok) {
                setSuccess(`Payroll head ${isHeadEditing ? 'updated' : 'added'} successfully!`);
                await fetchHeads();
                setTimeout(() => setIsHeadModalOpen(false), 1500);
            } else {
                const errData = await response.json().catch(() => ({}));
                setError(errData.message || `Failed to ${isHeadEditing ? 'update' : 'add'} payroll head`);
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // --- Element Handlers ---
    const handleElementChange = (e) => {
        let { name, value } = e.target;
        if (name === 'elementValue') {
            value = value.replace(/[^0-9.]/g, '');
        }
        setElementFormData({
            ...elementFormData,
            [name]: value
        });
    };

    const handleAddElementClick = () => {
        setElementFormData({ elementId: 0, headId: heads.length > 0 ? heads[0].headId : '', elementValue: '', valueType: 'Percentage', valueCalculating: 'Basic Salary' });
        setPreviewSalary(10000);
        setIsElementEditing(false);
        setError(null);
        setSuccess(null);
        setIsElementModalOpen(true);
    };

    const handleEditElementClick = (element) => {
        setElementFormData({
            elementId: element.elementId || element.element_id,
            headId: element.headId || element.head_id,
            elementValue: element.elementValue || element.element_value,
            valueType: element.valueType || element.value_type,
            valueCalculating: element.valueCalculating || element.value_calculating
        });
        setIsElementEditing(true);
        setError(null);
        setSuccess(null);
        setIsElementModalOpen(true);
    };

    const handleElementSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const url = `${API_BASE_URL}/api/EmployeeMaster/add-element`;
        const method = "POST";

        const payload = {
            elementId: Number(elementFormData.elementId),
            headId: Number(elementFormData.headId),
            elementValue: Number(elementFormData.elementValue),
            valueType: elementFormData.valueType,
            valueCalculating: elementFormData.valueCalculating
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json", "accept": "*/*" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSuccess(`Pay Element ${isElementEditing ? 'updated' : 'added'} successfully!`);
                await fetchElements();
                setTimeout(() => setIsElementModalOpen(false), 1500);
            } else {
                const errData = await response.json().catch(() => ({}));
                setError(errData.message || `Failed to ${isElementEditing ? 'update' : 'add'} pay element`);
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Separate heads into Earnings and Deductions
    const earnings = heads.filter(h => h.headType === 1);
    const deductions = heads.filter(h => h.headType === 2);

    const getHeadName = (hId) => {
        const head = heads.find(h => h.headId === Number(hId));
        return head ? head.headName : `Head ID: ${hId}`;
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#5A725A', mb: 3, letterSpacing: '-0.02em' }}>
                Payroll Configuration
            </Typography>

            
            <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, alignItems: 'flex-start' }}>

                
                <Paper elevation={0} sx={{ flex: 1, width: '100%', bgcolor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'grey.200', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', minHeight: { lg: 'calc(100vh - 150px)' } }}>
                    <Box sx={{ bgcolor: 'rgba(249, 250, 251, 0.8)', px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'grey.200', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.800', lineHeight: 1.2 }}>Payroll Heads</Typography>
                            <Typography variant="body2" sx={{ color: 'grey.500', fontWeight: 500, mt: 0.5 }}>Manage components (Earnings & Deductions)</Typography>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={handleAddHeadClick}
                            startIcon={<AddIcon />}
                            sx={{
                                bgcolor: '#5A725A', '&:hover': { bgcolor: '#4a5f4a' }, textTransform: 'none', fontWeight: 'bold', px: 2, py: 1, borderRadius: 2, boxShadow: 'none'
                            }}
                        >
                            Add Head
                        </Button>
                    </Box>

                    <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
                        {fetchLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                                <svg className="animate-spin h-8 w-8 text-[#5A725A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            </Box>
                        ) : heads.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 5 }}>
                                <Typography sx={{ color: 'grey.500' }}>No payroll heads created yet.</Typography>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                
                                {earnings.length > 0 && (
                                    <Box sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.100', overflow: 'hidden' }}>
                                        <Box sx={{ bgcolor: 'rgba(240, 253, 244, 0.5)', px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'grey.100' }}>
                                            <Typography sx={{ fontWeight: 'bold', color: '#166534', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Earnings / Allowance</Typography>
                                        </Box>
                                        <Box>
                                            {earnings.map((head, index) => (
                                                <Box key={head.headId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, borderBottom: index < earnings.length - 1 ? '1px solid #f3f4f6' : 'none', '&:hover': { bgcolor: 'grey.50' }, transition: 'background-color 0.2s' }}>
                                                    <Typography sx={{ color: 'grey.700', fontWeight: 600, fontSize: '0.875rem' }}>{head.headName}</Typography>
                                                    <IconButton onClick={() => handleEditHeadClick(head)} size="small" sx={{ color: '#5A725A', '&:hover': { bgcolor: 'rgba(90, 114, 90, 0.1)' } }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                                
                                {deductions.length > 0 && (
                                    <Box sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.100', overflow: 'hidden' }}>
                                        <Box sx={{ bgcolor: 'rgba(254, 242, 242, 0.5)', px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'grey.100' }}>
                                            <Typography sx={{ fontWeight: 'bold', color: '#991b1b', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deductions</Typography>
                                        </Box>
                                        <Box>
                                            {deductions.map((head, index) => (
                                                <Box key={head.headId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, borderBottom: index < deductions.length - 1 ? '1px solid #f3f4f6' : 'none', '&:hover': { bgcolor: 'grey.50' }, transition: 'background-color 0.2s' }}>
                                                    <Typography sx={{ color: 'grey.700', fontWeight: 600, fontSize: '0.875rem' }}>{head.headName}</Typography>
                                                    <IconButton onClick={() => handleEditHeadClick(head)} size="small" sx={{ color: '#5A725A', '&:hover': { bgcolor: 'rgba(90, 114, 90, 0.1)' } }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                </Paper>

                
                <Paper elevation={0} sx={{ flex: 1, width: '100%', bgcolor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'grey.200', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', minHeight: { lg: 'calc(100vh - 150px)' } }}>
                    <Box sx={{ bgcolor: 'rgba(249, 250, 251, 0.8)', px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'grey.200', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.800', lineHeight: 1.2 }}>Pay Elements</Typography>
                            <Typography variant="body2" sx={{ color: 'grey.500', fontWeight: 500, mt: 0.5 }}>Configure formulas and values for heads</Typography>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={handleAddElementClick}
                            startIcon={<AddIcon />}
                            sx={{
                                bgcolor: '#5A725A', '&:hover': { bgcolor: '#4a5f4a' }, textTransform: 'none', fontWeight: 'bold', px: 2, py: 1, borderRadius: 2, boxShadow: 'none'
                            }}
                        >
                            Add Element
                        </Button>
                    </Box>

                    <Box sx={{ p: 0, overflowY: 'auto', flex: 1 }}>
                        {fetchElementsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                                <svg className="animate-spin h-8 w-8 text-[#5A725A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            </Box>
                        ) : elements.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 5 }}>
                                <Typography sx={{ color: 'grey.500' }}>No pay elements configured yet.</Typography>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table sx={{ minWidth: 500 }}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'grey.50', '& th': { borderBottom: '1px solid', borderColor: 'grey.200' } }}>
                                            <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', py: 2 }}>Payroll Head</TableCell>
                                            <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', py: 2 }}>Value Type</TableCell>
                                            <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', py: 2 }}>Element Value</TableCell>
                                            <TableCell align="center" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'grey.500', textTransform: 'uppercase', py: 2 }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {elements.map((el, idx) => {
                                            const headName = getHeadName(el.headId || el.head_id);
                                            const headId = el.headId || el.head_id;
                                            
                                            // Determine standard calculation text
                                            let calcText = el.valueCalculating || el.value_calculating;
                                            if (headId === 1 || headName.toLowerCase().includes('basic salary')) calcText = 'Annual CTC';
                                            else if (headId === 4 || headName.toLowerCase().includes('special allowance')) calcText = 'CTC Remainder (Balancer)';
                                            else if ((el.valueType || el.value_type) === 'Percentage') {
                                                if (calcText === headName || !calcText || calcText === 'Percentage') {
                                                    if (headName.toLowerCase().includes('esi')) calcText = 'Gross Salary';
                                                    else calcText = 'Basic Salary';
                                                }
                                            } else {
                                                calcText = 'Fixed Amount';
                                            }

                                            return (
                                                <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& td': { borderColor: 'grey.100' } }}>
                                                    <TableCell sx={{ py: 2 }}>
                                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'grey.800' }}>
                                                            {headName}
                                                        </Typography>
                                                        <Box sx={{ display: 'inline-block', mt: 0.5, bgcolor: '#eff6ff', px: 1, py: 0.25, borderRadius: 1 }}>
                                                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#2563eb' }}>
                                                                Calculation: {calcText}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ py: 2 }}>
                                                        <Box component="span" sx={{ bgcolor: 'grey.100', color: 'grey.700', px: 1.5, py: 0.75, borderRadius: 2, fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid', borderColor: 'grey.200' }}>
                                                            {el.valueType || el.value_type}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ py: 2 }}>
                                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'grey.900' }}>
                                                            {el.elementValue || el.element_value}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ py: 2 }}>
                                                        <IconButton onClick={() => handleEditElementClick(el)} size="small" sx={{ color: '#5A725A', '&:hover': { bgcolor: 'rgba(90, 114, 90, 0.1)' } }}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                </Paper>
            </Box>

            <Modal
                open={isHeadModalOpen}
                onClose={() => setIsHeadModalOpen(false)}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
                BackdropProps={{ sx: { backdropFilter: 'blur(4px)', bgcolor: 'rgba(0, 0, 0, 0.5)' } }}
            >
                <Paper elevation={24} sx={{ width: '100%', maxWidth: 450, borderRadius: 3, overflow: 'hidden', outline: 'none' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'grey.100', bgcolor: 'rgba(249, 250, 251, 0.5)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.800' }}>
                            {isHeadEditing ? 'Edit Payroll Head' : 'Add New Payroll Head'}
                        </Typography>
                        <IconButton onClick={() => setIsHeadModalOpen(false)} size="small" sx={{ color: 'grey.400', '&:hover': { color: 'grey.600', bgcolor: 'grey.100' } }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        {error && (
                            <Box sx={{ mb: 2, bgcolor: '#fef2f2', border: '1px solid', borderColor: '#fecaca', color: '#dc2626', px: 2, py: 1.5, borderRadius: 2 }}>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{error}</Typography>
                            </Box>
                        )}
                        {success && (
                            <Box sx={{ mb: 2, bgcolor: '#f0fdf4', border: '1px solid', borderColor: '#bbf7d0', color: '#15803d', px: 2, py: 1.5, borderRadius: 2 }}>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{success}</Typography>
                            </Box>
                        )}
                        <form onSubmit={handleHeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <Box>
                                <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'grey.700', mb: 1 }}>Head Name</InputLabel>
                                <TextField
                                    fullWidth
                                    name="headName"
                                    value={headFormData.headName}
                                    onChange={handleHeadChange}
                                    required
                                    placeholder="e.g. Basic Salary"
                                    variant="outlined"
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white', '&.Mui-focused fieldset': { borderColor: '#5A725A', borderWidth: '2px' } } }}
                                />
                            </Box>
                            <Box>
                                <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'grey.700', mb: 1 }}>Head Type</InputLabel>
                                <Select
                                    fullWidth
                                    name="headType"
                                    value={headFormData.headType}
                                    onChange={handleHeadChange}
                                    size="small"
                                    sx={{ borderRadius: 2, bgcolor: 'white', fontWeight: 500, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#5A725A', borderWidth: '2px' } }}
                                >
                                    <MenuItem value={1}>1 - Earnings</MenuItem>
                                    <MenuItem value={2}>2 - Deductions</MenuItem>
                                </Select>
                            </Box>
                            <Box sx={{ pt: 1, display: 'flex', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setIsHeadModalOpen(false)}
                                    sx={{ flex: 1, borderColor: 'grey.200', color: 'grey.700', fontWeight: 'bold', py: 1.5, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: 'grey.50', borderColor: 'grey.300' } }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    sx={{ flex: 1, bgcolor: '#5A725A', fontWeight: 'bold', py: 1.5, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#4a5f4a' }, '&.Mui-disabled': { opacity: 0.7, bgcolor: '#5A725A', color: 'white' } }}
                                >
                                    {loading ? 'Saving...' : (isHeadEditing ? "Save Changes" : "Save Head")}
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Paper>
            </Modal>

            
            <Modal
                open={isElementModalOpen}
                onClose={() => setIsElementModalOpen(false)}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
                BackdropProps={{ sx: { backdropFilter: 'blur(4px)', bgcolor: 'rgba(0, 0, 0, 0.5)' } }}
            >
                <Paper elevation={24} sx={{ width: '100%', maxWidth: 450, borderRadius: 3, overflow: 'hidden', outline: 'none' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'grey.100', bgcolor: 'rgba(249, 250, 251, 0.5)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.800' }}>
                            {isElementEditing ? 'Edit Pay Element' : 'Add New Pay Element'}
                        </Typography>
                        <IconButton onClick={() => setIsElementModalOpen(false)} size="small" sx={{ color: 'grey.400', '&:hover': { color: 'grey.600', bgcolor: 'grey.100' } }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        {error && (
                            <Box sx={{ mb: 2, bgcolor: '#fef2f2', border: '1px solid', borderColor: '#fecaca', color: '#dc2626', px: 2, py: 1.5, borderRadius: 2 }}>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{error}</Typography>
                            </Box>
                        )}
                        {success && (
                            <Box sx={{ mb: 2, bgcolor: '#f0fdf4', border: '1px solid', borderColor: '#bbf7d0', color: '#15803d', px: 2, py: 1.5, borderRadius: 2 }}>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{success}</Typography>
                            </Box>
                        )}
                        <form onSubmit={handleElementSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Box>
                                <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'grey.700', mb: 1 }}>Payroll Head Selection</InputLabel>
                                <Select
                                    fullWidth
                                    name="headId"
                                    value={elementFormData.headId}
                                    onChange={handleElementChange}
                                    required
                                    size="small"
                                    sx={{ borderRadius: 2, bgcolor: 'white', fontWeight: 500, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#5A725A', borderWidth: '2px' } }}
                                >
                                    <MenuItem value="" disabled>Select a Payroll Head</MenuItem>
                                    {heads.map(h => (
                                        <MenuItem key={h.headId} value={h.headId}>{h.headName} ({h.headType === 1 ? 'Earning' : 'Deduction'})</MenuItem>
                                    ))}
                                </Select>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'grey.700', mb: 1 }}>
                                        {elementFormData.valueType === 'Percentage' ? 'Percentage (%)' : 'Fixed (₹)'}
                                    </InputLabel>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        name="elementValue"
                                        value={elementFormData.elementValue}
                                        onChange={handleElementChange}
                                        required
                                        placeholder={elementFormData.valueType === 'Percentage' ? "e.g. 12" : "e.g. 5000"}
                                        inputProps={{ step: "0.01" }}
                                        variant="outlined"
                                        size="small"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white', '&.Mui-focused fieldset': { borderColor: '#5A725A', borderWidth: '2px' } } }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'grey.700', mb: 1 }}>Value Type</InputLabel>
                                    <Select
                                        fullWidth
                                        name="valueType"
                                        value={elementFormData.valueType}
                                        onChange={handleElementChange}
                                        required
                                        size="small"
                                        sx={{ borderRadius: 2, bgcolor: 'white', fontWeight: 500, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#5A725A', borderWidth: '2px' } }}
                                    >
                                        <MenuItem value="Percentage">Percentage</MenuItem>
                                        <MenuItem value="Fixed">Fixed</MenuItem>
                                    </Select>
                                </Grid>
                                <Grid item xs={6}>
                                    <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'grey.700', mb: 1 }}>Value Calculating</InputLabel>
                                    <Select
                                        fullWidth
                                        name="valueCalculating"
                                        value={elementFormData.valueCalculating}
                                        onChange={handleElementChange}
                                        required
                                        size="small"
                                        sx={{ borderRadius: 2, bgcolor: 'white', fontWeight: 500, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#5A725A', borderWidth: '2px' } }}
                                    >
                                        {elementFormData.valueType === 'Percentage' ? [
                                            <MenuItem key="Basic Salary" value="Basic Salary">Basic Salary</MenuItem>,
                                            <MenuItem key="Gross Salary" value="Gross Salary">Gross Salary</MenuItem>,
                                            <MenuItem key="Annual CTC" value="Annual CTC">Annual CTC</MenuItem>
                                        ] : (
                                            <MenuItem value="Fixed">Fixed Amount</MenuItem>
                                        )}
                                    </Select>
                                </Grid>
                            </Grid>

                            
                            {elementFormData.valueType === 'Percentage' && (
                                <Box sx={{ mt: 1, p: 2, bgcolor: 'rgba(90, 114, 90, 0.05)', border: '1px solid', borderColor: 'rgba(90, 114, 90, 0.2)', borderRadius: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <CalculateIcon sx={{ fontSize: 18, color: '#5A725A' }} />
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'grey.800' }}>Calculation Preview</Typography>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <InputLabel sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'grey.600', mb: 0.5 }}>Dummy {elementFormData.valueCalculating} (₹)</InputLabel>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                value={previewSalary}
                                                onChange={(e) => setPreviewSalary(Number(e.target.value.replace(/[^0-9.]/g, '')))}
                                                variant="outlined"
                                                size="small"
                                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(59, 130, 246, 0.1)', '& fieldset': { borderColor: '#bfdbfe' }, '&.Mui-focused fieldset': { borderColor: '#3b82f6' } }, '& input': { py: 1, fontSize: '0.875rem', fontWeight: 500 } }}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <InputLabel sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'grey.600', mb: 0.5 }}>Calculated Amount (₹)</InputLabel>
                                            <Box sx={{ width: '100%', px: 1.5, py: 1, bgcolor: '#f0fdf4', border: '1px solid', borderColor: '#bbf7d0', color: '#166534', fontWeight: 'bold', borderRadius: 2, fontSize: '0.875rem', display: 'flex', alignItems: 'center', height: '38px', boxSizing: 'border-box' }}>
                                                ₹ {((previewSalary * Number(elementFormData.elementValue || 0)) / 100).toFixed(2)}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    <Typography sx={{ fontSize: '11px', color: 'grey.500', mt: 1, fontWeight: 500 }}>
                                        Preview: {elementFormData.elementValue || 0}% of ₹{previewSalary}
                                    </Typography>
                                </Box>
                            )}

                            <Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setIsElementModalOpen(false)}
                                    sx={{ flex: 1, borderColor: 'grey.200', color: 'grey.700', fontWeight: 'bold', py: 1.5, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: 'grey.50', borderColor: 'grey.300' } }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    sx={{ flex: 1, bgcolor: '#5A725A', fontWeight: 'bold', py: 1.5, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#4a5f4a' }, '&.Mui-disabled': { opacity: 0.7, bgcolor: '#5A725A', color: 'white' } }}
                                >
                                    {loading ? 'Saving...' : (isElementEditing ? "Save Changes" : "Save Element")}
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Paper>
            </Modal>
        </Box>
    );
}

export default PayrollMaster;
