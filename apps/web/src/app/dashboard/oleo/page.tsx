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
  Avatar,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  OilBarrel as OilIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { useAuth } from '@/lib/auth'
import firestore from '@/lib/firestore'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { OIL_INTERVAL_DEFAULT } from '@autogest/shared'
import type { Client, Car, OilChange } from '@autogest/shared'

export default function OilChangesPage() {
  const { mechanic } = useAuth()
  const [oilChanges, setOilChanges] = useState<OilChange[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOil, setEditingOil] = useState<OilChange | null>(null)
  const { register, handleSubmit, reset, setValue, watch } = useForm()

  const selectedCarId = watch('carId')

  useEffect(() => {
    if (mechanic?.uid) {
      Promise.all([
        firestore.getOilChanges(mechanic.uid),
        firestore.getClients(mechanic.uid),
        firestore.getCars(mechanic.uid),
      ]).then(([o, c, carsData]) => {
        setOilChanges(o)
        setClients(c)
        setCars(carsData)
      })
    }
  }, [mechanic?.uid])

  const openNew = () => {
    setEditingOil(null)
    reset({
      clientId: '', carId: '', date: new Date().toISOString().split('T')[0],
      mileage: '', oilType: '', oilBrand: '', oilViscosity: '',
      oilQuantity: '', filterBrand: '', filterChanged: true,
      nextChangeDate: '', nextChangeKm: '', notes: '', cost: '',
    })
    setDialogOpen(true)
  }

  const getClientByCar = (carId: string) => {
    const car = cars.find((c) => c.id === carId)
    if (!car) return ''
    setValue('clientId', car.clientId)
    return car.clientId
  }

  useEffect(() => {
    if (selectedCarId) {
      getClientByCar(selectedCarId)
    }
  }, [selectedCarId])

  const onSubmit = async (data: any) => {
    if (!mechanic?.uid) return
    try {
      const payload = {
        ...data,
        mechanicId: mechanic.uid,
        date: new Date(data.date),
        mileage: Number(data.mileage) || 0,
        oilQuantity: data.oilQuantity ? Number(data.oilQuantity) : null,
        filterChanged: data.filterChanged === 'true' || data.filterChanged === true,
        nextChangeDate: data.nextChangeDate ? new Date(data.nextChangeDate) : null,
        nextChangeKm: data.nextChangeKm ? Number(data.nextChangeKm) : null,
        cost: data.cost ? Number(data.cost) : null,
      }
      if (editingOil) {
        await firestore.updateOilChange(editingOil.id, payload)
        toast.success('Troca de óleo atualizada!')
      } else {
        await firestore.addOilChange(payload)
        toast.success('Troca de óleo registrada!')
      }
      setDialogOpen(false)
      setOilChanges(await firestore.getOilChanges(mechanic.uid))
    } catch {
      toast.error('Erro ao salvar')
    }
  }

  const getCarInfo = (carId: string) => {
    const car = cars.find((c) => c.id === carId)
    return car ? `${car.brand} ${car.model} - ${car.plate}` : 'N/A'
  }

  const getClientName = (carId: string) => {
    const car = cars.find((c) => c.id === carId)
    if (!car) return 'N/A'
    return clients.find((c) => c.id === car.clientId)?.name || 'N/A'
  }

  const isOverdue = (date: any) => {
    if (!date) return false
    const d = date.toDate ? date.toDate() : new Date(date)
    return d < new Date()
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Troca de Óleo</Typography>
          <Typography variant="body2" color="text.secondary">
            {oilChanges.length} registro(s) de troca de óleo
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          Nova Troca de Óleo
        </Button>
      </Box>

      {oilChanges.filter((o) => o.nextChangeDate && isOverdue(o.nextChangeDate)).length > 0 && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          <Typography fontWeight={600}>
            {oilChanges.filter((o) => o.nextChangeDate && isOverdue(o.nextChangeDate)).length} troca(s) de óleo estão atrasadas!
          </Typography>
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Carro</TableCell>
                  <TableCell>Óleo</TableCell>
                  <TableCell>Km Atual</TableCell>
                  <TableCell>Próx. Troca (Km)</TableCell>
                  <TableCell>Próx. Troca (Data)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {oilChanges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Nenhum registro de troca de óleo</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  oilChanges.map((oil) => (
                    <TableRow key={oil.id} hover>
                      <TableCell>{oil.date.toDate().toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{getClientName(oil.carId)}</TableCell>
                      <TableCell>{getCarInfo(oil.carId)}</TableCell>
                      <TableCell>
                        <Chip icon={<OilIcon />} label={`${oil.oilBrand} ${oil.oilType}`} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{oil.mileage.toLocaleString()} km</TableCell>
                      <TableCell>
                        {oil.nextChangeKm ? (
                          <Typography fontWeight={500}>
                            {oil.nextChangeKm.toLocaleString()} km
                          </Typography>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {oil.nextChangeDate ? (
                          <Typography
                            fontWeight={500}
                            color={isOverdue(oil.nextChangeDate) ? 'error.main' : 'text.primary'}
                          >
                            {oil.nextChangeDate.toDate().toLocaleDateString('pt-BR')}
                          </Typography>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {oil.nextChangeDate && isOverdue(oil.nextChangeDate) ? (
                          <Chip icon={<WarningIcon />} label="Atrasada" size="small" color="error" />
                        ) : (
                          <Chip label="OK" size="small" color="success" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar"><IconButton size="small"><EditIcon fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editingOil ? 'Editar Troca de Óleo' : 'Nova Troca de Óleo'}</DialogTitle>
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
                <TextField label="Data" type="date" {...register('date', { required: true })} fullWidth required InputLabelProps={{ shrink: true }} />
                <TextField label="Quilometragem Atual" type="number" {...register('mileage', { required: true })} fullWidth required />
              </Box>
              <Box display="flex" gap={2}>
                <TextField label="Tipo do Óleo (ex: 5W30)" {...register('oilType', { required: true })} fullWidth required />
                <TextField label="Marca do Óleo" {...register('oilBrand', { required: true })} fullWidth required />
              </Box>
              <Box display="flex" gap={2}>
                <TextField label="Viscosidade" {...register('oilViscosity')} fullWidth />
                <TextField label="Quantidade (L)" type="number" {...register('oilQuantity')} fullWidth />
              </Box>
              <Box display="flex" gap={2}>
                <TextField label="Marca do Filtro" {...register('filterBrand')} fullWidth />
                <FormControl fullWidth>
                  <InputLabel>Filtro Trocado?</InputLabel>
                  <Select label="Filtro Trocado?" defaultValue="true" {...register('filterChanged')}>
                    <MenuItem value="true">Sim</MenuItem>
                    <MenuItem value="false">Não</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Typography variant="subtitle2" color="primary" mt={1}>Próxima Troca</Typography>
              <Box display="flex" gap={2}>
                <TextField
                  label="Próx. Troca (Km)"
                  type="number"
                  {...register('nextChangeKm')}
                  fullWidth
                  helperText={`Padrão: +${OIL_INTERVAL_DEFAULT.KM.toLocaleString()} km`}
                />
                <TextField
                  label="Próx. Troca (Data)"
                  type="date"
                  {...register('nextChangeDate')}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  helperText={`Padrão: +${OIL_INTERVAL_DEFAULT.DAYS} dias`}
                />
              </Box>

              <Box display="flex" gap={2}>
                <TextField label="Custo (R$)" type="number" {...register('cost')} fullWidth />
                <TextField label="Observações" {...register('notes')} fullWidth multiline rows={2} />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">{editingOil ? 'Atualizar' : 'Registrar'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
