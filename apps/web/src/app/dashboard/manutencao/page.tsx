'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import { useAuth } from '@/lib/auth'
import firestore from '@/lib/firestore'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { MAINTENANCE_CATEGORIES } from '@autogest/shared'
import type { Client, Car, MaintenanceSchedule } from '@autogest/shared'

export default function MaintenancePage() {
  const { mechanic } = useAuth()
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMaint, setEditingMaint] = useState<MaintenanceSchedule | null>(null)
  const { register, handleSubmit, reset, setValue } = useForm()

  useEffect(() => {
    if (mechanic?.uid) {
      Promise.all([
        firestore.getMaintenanceSchedules(mechanic.uid),
        firestore.getClients(mechanic.uid),
        firestore.getCars(mechanic.uid),
      ]).then(([s, c, carsData]) => {
        setSchedules(s)
        setClients(c)
        setCars(carsData)
      })
    }
  }, [mechanic?.uid])

  const openNew = () => {
    setEditingMaint(null)
    reset({ carId: '', title: '', description: '', category: 'other', intervalKm: '', intervalDays: '', lastDoneDate: '', lastDoneKm: '', nextDueDate: '', nextDueKm: '', reminderEnabled: true })
    setDialogOpen(true)
  }

  const onSubmit = async (data: any) => {
    if (!mechanic?.uid) return
    try {
      const payload = {
        ...data,
        mechanicId: mechanic.uid,
        intervalKm: data.intervalKm ? Number(data.intervalKm) : null,
        intervalDays: data.intervalDays ? Number(data.intervalDays) : null,
        lastDoneDate: data.lastDoneDate ? new Date(data.lastDoneDate) : null,
        lastDoneKm: data.lastDoneKm ? Number(data.lastDoneKm) : null,
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null,
        nextDueKm: data.nextDueKm ? Number(data.nextDueKm) : null,
        reminderEnabled: data.reminderEnabled === 'true' || data.reminderEnabled === true,
      }
      if (editingMaint) {
        await firestore.updateMaintenanceSchedule(editingMaint.id, payload)
        toast.success('Manutenção atualizada!')
      } else {
        await firestore.addMaintenanceSchedule(payload)
        toast.success('Manutenção agendada!')
      }
      setDialogOpen(false)
      setSchedules(await firestore.getMaintenanceSchedules(mechanic.uid))
    } catch {
      toast.error('Erro ao salvar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este agendamento?')) return
    try {
      await deleteDoc(doc(db, 'maintenanceSchedules', id))
      toast.success('Excluído')
      setSchedules(await firestore.getMaintenanceSchedules(mechanic!.uid))
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const getCarInfo = (carId: string) => {
    const car = cars.find((c) => c.id === carId)
    return car ? `${car.brand} ${car.model} - ${car.plate}` : 'N/A'
  }

  const getCategoryLabel = (value: string) => {
    return MAINTENANCE_CATEGORIES.find((c) => c.value === value)?.label || value
  }

  const isOverdue = (date: any) => {
    if (!date) return false
    const d = date.toDate ? date.toDate() : new Date(date)
    return d < new Date()
  }

  const overdueCount = schedules.filter((s) => s.nextDueDate && isOverdue(s.nextDueDate)).length

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Cronograma de Manutenção</Typography>
          <Typography variant="body2" color="text.secondary">
            {schedules.length} manutenção(ões) programada(s)
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          Nova Manutenção
        </Button>
      </Box>

      {overdueCount > 0 && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          <Typography fontWeight={600}>{overdueCount} manutenção(ões) estão atrasadas!</Typography>
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Carro</TableCell>
                  <TableCell>Serviço</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Intervalo</TableCell>
                  <TableCell>Última</TableCell>
                  <TableCell>Próxima (Data)</TableCell>
                  <TableCell>Próxima (Km)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Nenhuma manutenção programada</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell>{getCarInfo(s.carId)}</TableCell>
                      <TableCell><Typography fontWeight={500}>{s.title}</Typography></TableCell>
                      <TableCell>
                        <Chip label={getCategoryLabel(s.category)} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {s.intervalKm && s.intervalDays
                          ? `${s.intervalKm.toLocaleString()} km / ${s.intervalDays} dias`
                          : s.intervalKm
                            ? `${s.intervalKm.toLocaleString()} km`
                            : s.intervalDays
                              ? `${s.intervalDays} dias`
                              : '-'}
                      </TableCell>
                      <TableCell>
                        {s.lastDoneDate
                          ? `${s.lastDoneDate.toDate().toLocaleDateString('pt-BR')}${s.lastDoneKm ? ` (${s.lastDoneKm.toLocaleString()} km)` : ''}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {s.nextDueDate ? (
                          <Typography
                            fontWeight={500}
                            color={isOverdue(s.nextDueDate) ? 'error.main' : 'text.primary'}
                          >
                            {s.nextDueDate.toDate().toLocaleDateString('pt-BR')}
                          </Typography>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {s.nextDueKm ? `${s.nextDueKm.toLocaleString()} km` : '-'}
                      </TableCell>
                      <TableCell>
                        {s.nextDueDate && isOverdue(s.nextDueDate) ? (
                          <Chip icon={<WarningIcon />} label="Atrasada" size="small" color="error" />
                        ) : (
                          <Chip icon={<CheckIcon />} label="OK" size="small" color="success" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar"><IconButton size="small"><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Excluir"><IconButton size="small" color="error" onClick={() => handleDelete(s.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editingMaint ? 'Editar Manutenção' : 'Nova Manutenção'}</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <FormControl fullWidth required>
                <InputLabel>Carro</InputLabel>
                <Select label="Carro" defaultValue="" {...register('carId', { required: true })}>
                  {cars.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.brand} {c.model} - {c.plate}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box display="flex" gap={2}>
                <TextField label="Título" {...register('title', { required: true })} fullWidth required />
                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select label="Categoria" defaultValue="other" {...register('category')}>
                    {MAINTENANCE_CATEGORIES.map((c) => (
                      <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <TextField label="Descrição" {...register('description')} fullWidth multiline rows={2} />
              <Typography variant="subtitle2" color="primary">Intervalo</Typography>
              <Box display="flex" gap={2}>
                <TextField label="A cada (Km)" type="number" {...register('intervalKm')} fullWidth helperText="Deixe em branco se for por tempo" />
                <TextField label="A cada (dias)" type="number" {...register('intervalDays')} fullWidth helperText="Deixe em branco se for por km" />
              </Box>
              <Typography variant="subtitle2" color="primary">Última Realização</Typography>
              <Box display="flex" gap={2}>
                <TextField label="Data" type="date" {...register('lastDoneDate')} fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label="Km" type="number" {...register('lastDoneKm')} fullWidth />
              </Box>
              <Typography variant="subtitle2" color="primary">Próxima Previsão</Typography>
              <Box display="flex" gap={2}>
                <TextField label="Data" type="date" {...register('nextDueDate')} fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label="Km" type="number" {...register('nextDueKm')} fullWidth />
              </Box>
              <FormControl fullWidth>
                <InputLabel>Lembrete</InputLabel>
                <Select label="Lembrete" defaultValue="true" {...register('reminderEnabled')}>
                  <MenuItem value="true">Ativado</MenuItem>
                  <MenuItem value="false">Desativado</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">{editingMaint ? 'Atualizar' : 'Agendar'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
