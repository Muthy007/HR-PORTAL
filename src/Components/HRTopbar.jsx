import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import logoImg from "../assets/Signboard.jpg.jpeg"
import { API_BASE_URL } from "../assets/connection"
import { Box, Typography, IconButton, Avatar, Button, Drawer } from "@mui/material"
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import CloseIcon from '@mui/icons-material/Close'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import LogoutIcon from '@mui/icons-material/Logout'

function HRTopbar() {
  const navigate = useNavigate()
  const [hrUser, setHrUser] = useState({ name: 'ADMIN', phone: '', address: '', department: 'HR', hrId: 'HR-0001', manager1: '', manager2: '' })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', profileImage: '', hrId: '', manager1: '', manager2: '' })
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadProfile = async () => {
    const storedHr = sessionStorage.getItem('hr_credentials')

    let parsedUser = null
    if (storedHr) {
      try {
        parsedUser = JSON.parse(storedHr)
      } catch (e) {
        console.error("Error parsing hr_credentials:", e)
      }
    }

    const hrIdToFetch = parsedUser?.id || 1

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/EmployeeMaster/profile/${hrIdToFetch}`)
      if (response.ok) {
        const data = await response.json()
        const photoData = data.profilePhoto ? (data.profilePhoto.startsWith('data:image') ? data.profilePhoto : `data:image/jpeg;base64,${data.profilePhoto}`) : null
        setHrUser({ ...data, department: 'HR', profileImage: photoData })
        setEditForm({
          id: data.id,
          hrName: data.hrName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          passwordHash: data.passwordHash || '',
          createdAt: data.createdAt || '',
          reportingManager1: data.reportingManager1 || '',
          reportingManager2: data.reportingManager2 || '',
          profilePhoto: data.profilePhoto || ''
        })
        setImagePreview(photoData)
      } else {
        console.error("Failed to fetch HR profile")
        if (parsedUser) {
          setHrUser({ ...parsedUser, department: 'HR' })
          setEditForm({ hrName: parsedUser.name, email: parsedUser.email, id: parsedUser.id })
        }
      }
    } catch (err) {
      console.error("Error fetching HR profile:", err)
      if (parsedUser) {
        setHrUser({ ...parsedUser, department: 'HR' })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
    window.addEventListener('hrProfileUpdated', loadProfile)
    return () => window.removeEventListener('hrProfileUpdated', loadProfile)
  }, [])

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    })
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/api/EmployeeMaster/update-profile/${editForm.id || 1}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "accept": "*/*"
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        alert("Profile Updated Successfully")
        loadProfile()
        setIsEditModalOpen(false)
      } else {
        const errData = await response.json().catch(() => ({}))
        setError(errData.message || "Failed to update profile")
      }
    } catch (err) {
      console.error("Update profile error:", err)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("photo", file)

    try {
      const response = await fetch(`${API_BASE_URL}/api/EmployeeMaster/upload-photo/${editForm.id || 1}`, {
        method: "POST",
        headers: {
          "accept": "*/*"
        },
        body: formData
      })

      if (response.ok) {
        alert("Photo uploaded successfully")
        loadProfile()
      } else {
        const errData = await response.json().catch(() => ({}))
        setError(errData.message || "Failed to upload photo")
      }
    } catch (err) {
      console.error("Photo upload error:", err)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleLogout = () => {
    sessionStorage.clear()
    navigate("/")
  }

  return (
    <>
      <Box
        sx={{
          backgroundColor: 'rgb(90, 114, 90)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 40
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            ml: { xs: 0.5, sm: 0.5, md: 3, lg: 6 } 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="img" src={logoImg} alt="Elantris Technologies Logo" sx={{ height: '40px', objectFit: 'contain' }} />
          </Box>
        </Box>

        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            <Box
              onClick={() => setIsEditModalOpen(true)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                position: 'relative',
                transition: 'opacity 150ms',
                '&:hover': { opacity: 0.8 }
              }}
            >
              <Avatar
                src={hrUser.profileImage || undefined}
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: 'white',
                  color: '#5A725A',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  border: '2px solid white'
                }}
              >
                {!hrUser.profileImage && (hrUser.hrName || hrUser.name || 'A').charAt(0)}
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontWeight: 'bold', color: 'white', lineHeight: 1.25, textTransform: 'uppercase', fontSize: '1rem' }}>
                  {hrUser.hrName || hrUser.name || 'ADMIN'}
                </Typography>
                <Typography sx={{ fontSize: '10px', fontWeight: 500, color: 'rgb(229, 231, 235)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  HR Administrator
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      
      <Drawer
        anchor="right"
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        sx={{
          zIndex: 40,
          '& .MuiDrawer-paper': {
            width: '320px',
            borderLeft: '1px solid rgb(243, 244, 246)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
        BackdropProps={{ sx: { backgroundColor: 'transparent' } }}
      >
        <Box sx={{ flexShrink: 0, px: 3, py: 1.5, borderBottom: '1px solid rgb(243, 244, 246)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(249, 250, 251, 0.8)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(12px)' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'rgb(31, 41, 55)', display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.125rem' }}>
             <PersonOutlineIcon sx={{ color: '#5A725A' }} />
             HR Profile
          </Typography>
          <IconButton onClick={() => setIsEditModalOpen(false)} sx={{ backgroundColor: 'white', border: '1px solid rgb(229, 231, 235)', p: 1, borderRadius: 2, color: 'rgb(156, 163, 175)', '&:hover': { color: 'rgb(239, 68, 68)', backgroundColor: 'rgb(254, 242, 242)' }, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', transition: 'all 150ms' }}>
             <CloseIcon sx={{ fontSize: '1.25rem' }} />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  position: 'relative',
                  width: '128px',
                  height: '128px',
                  borderRadius: '50%',
                  border: '4px solid rgb(243, 244, 246)',
                  overflow: 'hidden',
                  backgroundColor: 'rgb(249, 250, 251)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer',
                  '&:hover .overlay': { opacity: 1 }
                }}
              >
                {imagePreview ? (
                  <Box component="img" src={imagePreview} alt="Preview" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Typography sx={{ color: 'rgb(209, 213, 219)', fontSize: '3rem', fontWeight: 'bold' }}>
                    {(editForm.hrName || 'A').charAt(0)}
                  </Typography>
                )}
                <Box className="overlay" sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 150ms' }}>
                  <CameraAltIcon sx={{ color: 'white', fontSize: '2rem' }} />
                </Box>
              </Box>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handlePhotoUpload} />
              <Typography sx={{ fontSize: '10px', color: 'rgb(156, 163, 175)', mt: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Click to change photo
              </Typography>
            </Box>

            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {error && (
                <Box sx={{ backgroundColor: 'rgb(254, 242, 242)', color: 'rgb(220, 38, 38)', p: 1, fontSize: '0.875rem', borderRadius: 1, border: '1px solid rgb(254, 202, 202)' }}>
                  {error}
                </Box>
              )}
              
              <Box sx={{ display: 'flex', borderBottom: '1px solid rgb(229, 231, 235)', pb: 1.5 }}>
                <Typography sx={{ width: '33.33%', fontSize: '13px', fontWeight: 600, color: 'rgb(55, 65, 81)' }}>HR ID</Typography>
                <Typography sx={{ width: '16px', textAlign: 'center', color: 'rgb(55, 65, 81)', fontWeight: 600 }}>:</Typography>
                <Typography sx={{ width: '66.66%', fontSize: '13px', fontWeight: 'bold', color: 'rgb(31, 41, 55)', textTransform: 'uppercase' }}>{editForm.id}</Typography>
              </Box>

              <Box sx={{ display: 'flex', borderBottom: '1px solid rgb(229, 231, 235)', pb: 1.5, alignItems: 'center' }}>
                <Typography sx={{ width: '33.33%', fontSize: '13px', fontWeight: 600, color: 'rgb(55, 65, 81)' }}>Full Name</Typography>
                <Typography sx={{ width: '16px', textAlign: 'center', color: 'rgb(55, 65, 81)', fontWeight: 600 }}>:</Typography>
                <Typography sx={{ width: '66.66%', fontSize: '13px', fontWeight: 600, color: 'rgb(31, 41, 55)' }}>{editForm.hrName}</Typography>
              </Box>

              <Box sx={{ display: 'flex', borderBottom: '1px solid rgb(229, 231, 235)', pb: 1.5, alignItems: 'center' }}>
                <Typography sx={{ width: '33.33%', fontSize: '13px', fontWeight: 600, color: 'rgb(55, 65, 81)' }}>Phone</Typography>
                <Typography sx={{ width: '16px', textAlign: 'center', color: 'rgb(55, 65, 81)', fontWeight: 600 }}>:</Typography>
                <Typography sx={{ width: '66.66%', fontSize: '13px', fontWeight: 600, color: 'rgb(31, 41, 55)' }}>{editForm.phoneNumber || '-'}</Typography>
              </Box>

              <Box sx={{ display: 'flex', borderBottom: '1px solid rgb(229, 231, 235)', pb: 1.5, alignItems: 'center' }}>
                <Typography sx={{ width: '33.33%', fontSize: '13px', fontWeight: 600, color: 'rgb(55, 65, 81)' }}>Email</Typography>
                <Typography sx={{ width: '16px', textAlign: 'center', color: 'rgb(55, 65, 81)', fontWeight: 600 }}>:</Typography>
                <Typography sx={{ width: '66.66%', fontSize: '13px', fontWeight: 600, color: 'rgb(31, 41, 55)' }}>{editForm.email}</Typography>
              </Box>

              <Box sx={{ display: 'flex', borderBottom: '1px solid rgb(229, 231, 235)', pb: 1.5 }}>
                <Typography sx={{ width: '33.33%', fontSize: '13px', fontWeight: 600, color: 'rgb(55, 65, 81)' }}>Department</Typography>
                <Typography sx={{ width: '16px', textAlign: 'center', color: 'rgb(55, 65, 81)', fontWeight: 600 }}>:</Typography>
                <Typography sx={{ width: '66.66%', fontSize: '13px', fontWeight: 600, color: 'rgb(31, 41, 55)' }}>HR</Typography>
              </Box>

              <Box sx={{ pt: 0.5 }}>
                <Typography sx={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', color: '#5A725A', mb: 1.5, textTransform: 'uppercase' }}>Reporting Hierarchy</Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', borderBottom: '1px solid rgb(229, 231, 235)', pb: 1.5, alignItems: 'center' }}>
                    <Typography sx={{ width: '33.33%', fontSize: '13px', fontWeight: 600, color: 'rgb(55, 65, 81)' }}>Reporting Manager 1</Typography>
                    <Typography sx={{ width: '16px', textAlign: 'center', color: 'rgb(55, 65, 81)', fontWeight: 600 }}>:</Typography>
                    <Typography sx={{ width: '66.66%', fontSize: '13px', fontWeight: 600, color: 'rgb(31, 41, 55)' }}>{editForm.reportingManager1 || '-'}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', borderBottom: '1px solid rgb(229, 231, 235)', pb: 1.5, alignItems: 'center' }}>
                    <Typography sx={{ width: '33.33%', fontSize: '13px', fontWeight: 600, color: 'rgb(55, 65, 81)' }}>Reporting Manager 2</Typography>
                    <Typography sx={{ width: '16px', textAlign: 'center', color: 'rgb(55, 65, 81)', fontWeight: 600 }}>:</Typography>
                    <Typography sx={{ width: '66.66%', fontSize: '13px', fontWeight: 600, color: 'rgb(31, 41, 55)' }}>{editForm.reportingManager2 || '-'}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5, position: 'sticky', bottom: 0, backgroundColor: 'white', borderTop: '1px solid rgb(243, 244, 246)', mt: 'auto', flexShrink: 0, zIndex: 10 }}>
            <Button
              onClick={handleLogout}
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              sx={{
                width: '100%',
                backgroundColor: 'rgb(254, 242, 242)',
                color: 'rgb(220, 38, 38)',
                py: 1.5,
                borderColor: 'rgb(254, 202, 202)',
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  backgroundColor: 'rgb(254, 226, 226)',
                  color: 'rgb(185, 28, 28)',
                  borderColor: 'rgb(252, 165, 165)'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Drawer>

    </>
  )
}

export default HRTopbar
