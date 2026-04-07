import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { Box, Typography, IconButton, Backdrop, Collapse, Divider } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"

function HRSidebar() {

  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [isPayrollOpen, setIsPayrollOpen] = useState(
    location.pathname.includes('/hr/payroll')
  )

  useEffect(() => {
    if (location.pathname.includes('/hr/payroll')) {
      setIsPayrollOpen(true)
    }
  }, [location.pathname])

  const handleMenuClick = () => {
    setIsOpen(false)
  }

  const getMenuSx = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    px: 2,
    py: 1.5,
    borderRadius: 2,
    transition: 'all 200ms',
    textDecoration: 'none',
    width: '100%',
    textAlign: 'left',
    justifyContent: 'space-between',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '1rem',
    ...(isActive
      ? {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }
      : {
          backgroundColor: 'transparent',
          color: 'rgb(209, 213, 219)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white'
          }
        })
  })

  return (
    <>
      <Backdrop
        open={isOpen}
        onClick={() => setIsOpen(false)}
        sx={{ zIndex: 40, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
      />

    
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          top: '22px',
          left: '16px',
          zIndex: 70,
          color: 'white',
          padding: '8px',
          borderRadius: 1,
          transition: 'color 150ms, background-color 150ms',
          '&:hover': {
            color: 'rgb(229, 231, 235)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <MenuIcon sx={{ fontSize: '1.875rem' }} />
      </IconButton>

    
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '256px',
          backgroundColor: 'rgba(90, 114, 90, 0.9)',
          backdropFilter: 'blur(12px)',
          color: 'white',
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 300ms ease-in-out',
          zIndex: 50,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, mt: 6, fontSize: '1.5rem', lineHeight: '2rem' }}>
          HR Portal
        </Typography>

        <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          
          <Box
            component={NavLink}
            to="/hr/prejoining"
            onClick={handleMenuClick}
            sx={getMenuSx(location.pathname === '/hr/prejoining')}
          >
            Pre-Joining
          </Box>

          <Divider sx={{ mx: 1, my: 0.5, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

          <Box
            component={NavLink}
            to="/hr/employment"
            onClick={handleMenuClick}
            sx={getMenuSx(location.pathname === '/hr/employment')}
          >
            During Employment
          </Box>

          <Divider sx={{ mx: 1, my: 0.5, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

          <Box>
            <Box
              component="button"
              onClick={() => setIsPayrollOpen(!isPayrollOpen)}
              sx={getMenuSx(location.pathname.includes('/hr/payroll'))}
            >
              <Typography component="span" sx={{ fontSize: '1rem', fontFamily: 'inherit' }}>Payroll & Compliance</Typography>
              <Typography component="span" sx={{ fontSize: '0.75rem' }}>{isPayrollOpen ? '▲' : '▼'}</Typography>
            </Box>

            <Collapse in={isPayrollOpen}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pl: 2, mt: 0.5 }}>
                <Box
                  component={NavLink}
                  to="/hr/payroll"
                  end
                  onClick={handleMenuClick}
                  sx={{
                    ...getMenuSx(location.pathname === '/hr/payroll'),
                    fontSize: '0.875rem',
                    py: 1
                  }}
                >
                  Payroll Overview
                </Box>
                <Box
                  component={NavLink}
                  to="/hr/payroll-master"
                  onClick={handleMenuClick}
                  sx={{
                    ...getMenuSx(location.pathname === '/hr/payroll-master'),
                    fontSize: '0.875rem',
                    py: 1
                  }}
                >
                  Payroll Master
                </Box>
              </Box>
            </Collapse>
          </Box>

          <Divider sx={{ mx: 1, my: 0.5, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

          <Box
            component={NavLink}
            to="/hr/profile"
            onClick={handleMenuClick}
            sx={getMenuSx(location.pathname === '/hr/profile')}
          >
            HR Profile
          </Box>

        </Box>

        {/* Bottom Navigation Button */}
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Box
            component={NavLink}
            to="/travel/department"
            onClick={handleMenuClick}
            sx={{
              ...getMenuSx(false),
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white'
              }
            }}
          >
            Travel Portal
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default HRSidebar
