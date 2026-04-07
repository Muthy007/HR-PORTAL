import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Typography, Grid, TextField, Button, SvgIcon } from "@mui/material"

// Custom SVG Icons matching the original Tailwind design exactly
const CustomEditIcon = (props) => (
    <SvgIcon {...props} sx={{ ...props.sx, fill: 'none' }} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </SvgIcon>
)

const CustomCameraIcon = (props) => (
    <SvgIcon {...props} sx={{ ...props.sx, fill: 'none' }} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </SvgIcon>
)

const CustomCheckIcon = (props) => (
    <SvgIcon {...props} sx={{ ...props.sx, fill: 'none' }} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </SvgIcon>
)

function HRProfile() {
    const navigate = useNavigate()
    const [hrUser, setHrUser] = useState({ name: 'ADMIN', phone: '', address: '', department: 'HR', hrId: 'HR-0001', manager1: '', manager2: '' })
    const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', profileImage: '', hrId: '', manager1: '', manager2: '' })
    const [imagePreview, setImagePreview] = useState(null)

    useEffect(() => {
        const storedHr = sessionStorage.getItem('hr_credentials')
        let parsedUser = null
        if (storedHr) {
            parsedUser = JSON.parse(storedHr)
        }

        if (parsedUser) {
            setHrUser({ ...parsedUser, department: 'HR' })
            setEditForm({
                name: parsedUser.name || '',
                phone: parsedUser.phone || '',
                address: parsedUser.address || '',
                profileImage: parsedUser.profileImage || '',
                hrId: parsedUser.hrId || 'HR-0001',
                manager1: parsedUser.manager1 || '',
                manager2: parsedUser.manager2 || ''
            })
            setImagePreview(parsedUser.profileImage || null)
        } else {
            setEditForm({ name: 'ADMIN', phone: '', address: '', profileImage: '', hrId: 'HR-0001', manager1: '', manager2: '' })
        }
    }, [])

    const handleSaveProfile = (e) => {
        e.preventDefault()
        const updatedUser = { ...hrUser, ...editForm, department: 'HR' }
        setHrUser(updatedUser)
        sessionStorage.setItem('hr_credentials', JSON.stringify(updatedUser))

        // Dispatch custom event to notify other components (like topbar)
        window.dispatchEvent(new Event('hrProfileUpdated'))
        alert("Profile saved successfully!")
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024 * 2) { // 2MB limit
                alert("Image size should be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setEditForm(prev => ({ ...prev, profileImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    }

    return (
        <Box sx={{ p: 3, maxWidth: '896px', mx: 'auto' }}>
            <Box sx={{ backgroundColor: 'white', borderRadius: 4, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid rgb(243, 244, 246)', overflow: 'hidden' }}>
                <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgb(243, 244, 246)', backgroundColor: 'rgba(249, 250, 251, 0.5)' }}>
                    <Typography component="h2" sx={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'rgb(31, 41, 55)', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CustomEditIcon sx={{ color: '#5A725A', fontSize: 24 }} />
                        Edit HR Profile
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSaveProfile} sx={{ p: 4 }}>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 5 }}>
                        <Box
                            component="label"
                            sx={{
                                position: 'relative', width: '128px', height: '128px', borderRadius: '50%',
                                border: '4px solid rgb(243, 244, 246)', overflow: 'hidden', backgroundColor: 'rgb(249, 250, 251)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                cursor: 'pointer',
                                '&:hover .overlay': { opacity: 1 }
                            }}
                        >
                            {imagePreview ? (
                                <Box component="img" src={imagePreview} alt="Preview" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <Typography sx={{ color: 'rgb(209, 213, 219)', fontSize: '3rem', fontWeight: 'bold' }}>
                                    {editForm.name.charAt(0) || 'M'}
                                </Typography>
                            )}

                            <Box className="overlay" sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 150ms' }}>
                                <CustomCameraIcon sx={{ color: 'white', fontSize: 32 }} />
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                            </Box>
                        </Box>
                        <Typography sx={{ fontSize: '0.875rem', color: 'rgb(107, 114, 128)', fontWeight: 500 }}>
                            Click image to upload new profile photo
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem', fontWeight: 600, color: 'rgb(55, 65, 81)', mb: 1 }}>
                                HR ID
                                <Typography component="span" sx={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: 'rgb(243, 244, 246)', color: 'rgb(107, 114, 128)', px: 0.75, py: 0.25, borderRadius: 1, textTransform: 'uppercase' }}>
                                    Required
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                required
                                value={editForm.hrId}
                                onChange={(e) => setEditForm({ ...editForm, hrId: e.target.value })}
                                placeholder="e.g. HR-001"
                                InputProps={{
                                    sx: {
                                        borderRadius: '12px',
                                        backgroundColor: 'rgb(249, 250, 251)',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        color: 'rgb(55, 65, 81)',
                                        textTransform: 'uppercase',
                                        '& .MuiOutlinedInput-input': { p: '12px 16px' },
                                        '& fieldset': { borderColor: 'rgb(229, 231, 235)', borderWidth: '1px' },
                                        '&:hover fieldset': { borderColor: 'rgb(209, 213, 219)' },
                                        '&.Mui-focused fieldset': { borderColor: '#5A725A', borderWidth: '1px', boxShadow: '0 0 0 2px rgba(90, 114, 90, 0.2)' }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'rgb(55, 65, 81)', mb: 1 }}>
                                Full Name
                            </Box>
                            <TextField
                                fullWidth
                                required
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                placeholder="Enter HR Name"
                                InputProps={{
                                    sx: {
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        color: 'rgb(55, 65, 81)',
                                        '& .MuiOutlinedInput-input': { p: '12px 16px' },
                                        '& fieldset': { borderColor: 'rgb(229, 231, 235)', borderWidth: '1px' },
                                        '&:hover fieldset': { borderColor: 'rgb(209, 213, 219)' },
                                        '&.Mui-focused fieldset': { borderColor: '#5A725A', borderWidth: '1px', boxShadow: '0 0 0 2px rgba(90, 114, 90, 0.2)' }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'rgb(55, 65, 81)', mb: 1 }}>
                                Phone Number
                            </Box>
                            <TextField
                                fullWidth
                                type="tel"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/[^0-9]/g, '') })}
                                placeholder="e.g. +1 234 567 8900"
                                InputProps={{
                                    sx: {
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        color: 'rgb(55, 65, 81)',
                                        '& .MuiOutlinedInput-input': { p: '12px 16px' },
                                        '& fieldset': { borderColor: 'rgb(229, 231, 235)', borderWidth: '1px' },
                                        '&:hover fieldset': { borderColor: 'rgb(209, 213, 219)' },
                                        '&.Mui-focused fieldset': { borderColor: '#5A725A', borderWidth: '1px', boxShadow: '0 0 0 2px rgba(90, 114, 90, 0.2)' }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem', fontWeight: 600, color: 'rgb(55, 65, 81)', mb: 1 }}>
                                Department
                                <Typography component="span" sx={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: 'rgb(220, 252, 231)', color: 'rgb(21, 128, 61)', px: 0.75, py: 0.25, borderRadius: 1, textTransform: 'uppercase' }}>
                                    Auto-Assigned
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                readOnly
                                value="HR"
                                InputProps={{
                                    readOnly: true,
                                    sx: {
                                        borderRadius: '12px',
                                        backgroundColor: 'rgb(249, 250, 251)',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: 'rgb(107, 114, 128)',
                                        cursor: 'not-allowed',
                                        '& .MuiOutlinedInput-input': { p: '12px 16px' },
                                        '& fieldset': { borderColor: 'rgb(229, 231, 235)', borderWidth: '1px' },
                                        // Disable hover style on readonly fields
                                        '&:hover fieldset': { borderColor: 'rgb(229, 231, 235)' },
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgb(243, 244, 246)' }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em', color: '#5A725A', mb: 3, textTransform: 'uppercase' }}>
                            Reporting Hierarchy
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Box component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'rgb(55, 65, 81)', mb: 1 }}>
                                    Reporting Manager 1
                                </Box>
                                <TextField
                                    fullWidth
                                    value={editForm.manager1}
                                    onChange={(e) => setEditForm({ ...editForm, manager1: e.target.value })}
                                    placeholder="Primary Manager Name"
                                    InputProps={{
                                        sx: {
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            color: 'rgb(55, 65, 81)',
                                            '& .MuiOutlinedInput-input': { p: '12px 16px' },
                                            '& fieldset': { borderColor: 'rgb(229, 231, 235)', borderWidth: '1px' },
                                            '&:hover fieldset': { borderColor: 'rgb(209, 213, 219)' },
                                            '&.Mui-focused fieldset': { borderColor: '#5A725A', borderWidth: '1px', boxShadow: '0 0 0 2px rgba(90, 114, 90, 0.2)' }
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'rgb(55, 65, 81)', mb: 1 }}>
                                    Reporting Manager 2
                                </Box>
                                <TextField
                                    fullWidth
                                    value={editForm.manager2}
                                    onChange={(e) => setEditForm({ ...editForm, manager2: e.target.value })}
                                    placeholder="Secondary Manager Name"
                                    InputProps={{
                                        sx: {
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            color: 'rgb(55, 65, 81)',
                                            '& .MuiOutlinedInput-input': { p: '12px 16px' },
                                            '& fieldset': { borderColor: 'rgb(229, 231, 235)', borderWidth: '1px' },
                                            '&:hover fieldset': { borderColor: 'rgb(209, 213, 219)' },
                                            '&.Mui-focused fieldset': { borderColor: '#5A725A', borderWidth: '1px', boxShadow: '0 0 0 2px rgba(90, 114, 90, 0.2)' }
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<CustomCheckIcon sx={{ fontSize: 20 }} />}
                            sx={{
                                backgroundColor: '#5A725A',
                                color: 'white',
                                px: 4,
                                py: 1.5,
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                transition: 'all 150ms',
                                '&:hover': {
                                    backgroundColor: '#4a5f4a',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                                }
                            }}
                        >
                            Save Changes
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default HRProfile
