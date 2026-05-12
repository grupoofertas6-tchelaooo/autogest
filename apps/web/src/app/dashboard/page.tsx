'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
} from '@mui/material'
import {
  People as PeopleIcon,
  DirectionsCar as CarIcon,
  Build as ServiceIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material'
import { useAuth } from '@/lib/auth'
import firestore from '@/lib/firestore'
import { useRouter } from 'next/navigation'
import type { Client, Car, OilChange, MaintenanceSchedule, ServiceOrder } from '@autogest/shared'

export default function DashboardPage() {
  const { mechanic } = useAuth()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [services, setServices] = useState<ServiceOrder[]>([])
  const [oilChanges, setOilChanges] = useState<OilChange[]>([])
  const [maintenances, setMaintenances] = useState<MaintenanceSchedule[]>([])

  useEffect(() => {
    if (!mechanic?.uid) return
    const load = async () => {
      const [c, carsData, s, o, m] = await Promise.all([
        firestore.getClients(mechanic.uid),
        firestore.getCars(mechanic.uid),
        firestore.getServiceOrders(mechanic.uid),
        firestore.getOilChanges(mechanic.uid),
        firestore.getMaintenanceSchedules(mechanic.uid),
      ])
      setClients(c)
      setCars(carsData)
      setServices(s)
      setOilChanges(o)
      setMaintenances(m)
    }
    load()
  }, [mechanic?.uid])

  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  const pendingOilChanges = oilChanges.filter(
    (o) => o.nextChangeDate && o.nextChangeDate.toDate() <= thirtyDaysFromNow
  ).length

  const pendingMaintenance = maintenances.filter(
    (m) => m.nextDueDate && m.nextDueDate.toDate() <= thirtyDaysFromNow
  ).length

  const pendingServices = services.filter((s) => s.status === 'pending' || s.status === 'in_progress').length

  const recentServices = [...services]
    .sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime())
    .slice(0, 5)

  const todayDue = [...oilChanges, ...maintenances].filter((item) => {
    const date = 'nextChangeDate' in item ? item.nextChangeDate : (item as MaintenanceSchedule).nextDueDate
    return date && date.toDate() <= thirtyDaysFromNow
  })

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bem-vindo, {mechanic?.name?.split(' ')[0] || 'Mecânico'}!
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Resumo da sua oficina
      </Typography>

      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1565C0, #1E88E5)',
              color: '#fff',
              cursor: 'pointer',
            }}
            onClick={() => router.push('/dashboard/clientes')}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h3" fontWeight={700}>{clients.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Clientes</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #00897B, #26A69A)',
              color: '#fff',
              cursor: 'pointer',
            }}
            onClick={() => router.push('/dashboard/carros')}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h3" fontWeight={700}>{cars.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Carros</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <CarIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #F57C00, #FB8C00)',
              color: '#fff',
              cursor: 'pointer',
            }}
            onClick={() => router.push('/dashboard/ordens')}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h3" fontWeight={700}>{pendingServices}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Serviços Pendentes</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <ServiceIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #D32F2F, #E53935)',
              color: '#fff',
              cursor: 'pointer',
            }}
            onClick={() => router.push('/dashboard/oleo')}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h3" fontWeight={700}>{pendingOilChanges + pendingMaintenance}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Alertas (30 dias)</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <WarningIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Serviços Recentes</Typography>
                <Button size="small" endIcon={<ArrowIcon />} onClick={() => router.push('/dashboard/ordens')}>
                  Ver todos
                </Button>
              </Box>
              {recentServices.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={3}>
                  Nenhum serviço registrado ainda
                </Typography>
              ) : (
                <List disablePadding>
                  {recentServices.map((s) => {
                    const client = clients.find((c) => c.id === s.clientId)
                    const car = cars.find((c) => c.id === s.carId)
                    return (
                      <ListItem key={s.id} disableGutters sx={{ px: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: s.status === 'completed' ? 'success.main' : 'warning.main' }}>
                            {s.status === 'completed' ? <CheckIcon /> : <ScheduleIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`OS #${s.number} - ${car ? `${car.brand} ${car.model}` : 'Carro'}`}
                          secondary={`${client?.name || 'Cliente'} - ${s.date.toDate().toLocaleDateString('pt-BR')}`}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <Chip
                          label={s.status === 'completed' ? 'Concluído' : s.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                          size="small"
                          color={s.status === 'completed' ? 'success' : s.status === 'in_progress' ? 'info' : 'warning'}
                        />
                      </ListItem>
                    )
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Próximas Manutenções</Typography>
                <Button size="small" endIcon={<ArrowIcon />} onClick={() => router.push('/dashboard/manutencao')}>
                  Ver todos
                </Button>
              </Box>
              {todayDue.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={3}>
                  Nenhuma manutenção próxima
                </Typography>
              ) : (
                <List disablePadding>
                  {todayDue.slice(0, 5).map((item) => {
                    const isOil = 'nextChangeDate' in item
                    const date = isOil ? (item as OilChange).nextChangeDate : (item as MaintenanceSchedule).nextDueDate
                    const car = cars.find((c) => c.id === item.carId)
                    const client = clients.find((c) => c.id === item.clientId)
                    return (
                      <ListItem key={item.id} disableGutters sx={{ px: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: isOil ? 'warning.main' : 'info.main' }}>
                            {isOil ? <OilIcon /> : <ScheduleIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={isOil ? 'Troca de Óleo' : (item as MaintenanceSchedule).title}
                          secondary={`${car ? `${car.brand} ${car.model} - ${car.plate}` : ''} - ${date?.toDate().toLocaleDateString('pt-BR') || 'N/A'}`}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                    )
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
