'use client'

import { ReactNode } from 'react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  DirectionsCar as CarIcon,
  Build as ServiceIcon,
  OilBarrel as OilIcon,
  CalendarMonth as MaintenanceIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Logout,
  LocalCarWash,
} from '@mui/icons-material'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useState } from 'react'

const DRAWER_WIDTH = 260

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Clientes', icon: <PeopleIcon />, path: '/dashboard/clientes' },
  { label: 'Carros', icon: <CarIcon />, path: '/dashboard/carros' },
  { label: 'Ordens de Serviço', icon: <ServiceIcon />, path: '/dashboard/ordens' },
  { label: 'Troca de Óleo', icon: <OilIcon />, path: '/dashboard/oleo' },
  { label: 'Manutenção', icon: <MaintenanceIcon />, path: '/dashboard/manutencao' },
  { label: 'Configurações', icon: <SettingsIcon />, path: '/dashboard/config' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { user, mechanic, logout } = useAuth()

  const handleLogout = async () => {
    setAnchorEl(null)
    await logout()
    router.push('/login')
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <LocalCarWash color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" color="primary.main" fontWeight={700} lineHeight={1.2}>
            AutoGest
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {mechanic?.businessName || 'Oficina'}
          </Typography>
        </Box>
      </Box>

      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { router.push(item.path); setMobileOpen(false) }}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? '#fff' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                  '& .MuiListItemIcon-root': {
                    color: isActive ? '#fff' : 'text.secondary',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          AutoGest v1.0
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', backgroundColor: '#fff' }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ flex: 1 }} />
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
                {mechanic?.name?.charAt(0)?.toUpperCase() || 'M'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled>
                <Typography variant="body2">{user?.email}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); router.push('/dashboard/config') }}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                Configurações
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                Sair
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
