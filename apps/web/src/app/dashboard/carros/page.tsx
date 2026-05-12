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
  Avatar,
  Tooltip,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useAuth } from '@/lib/auth'
import firestore from '@/lib/firestore'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FUEL_TYPES } from '@autogest/shared'
import type { Client, Car } from '@autogest/shared'

export default function CarsPage() {
  const { mechanic } = useAuth()
  const [cars, setCars] = useState<Car[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    if (mechanic?.uid) {
      Promise.all([
        firestore.getCars(mechanic.uid),
        firestore.getClients(mechanic.uid),
      ]).then(([carsData, clientsData]) => {
        setCars(carsData)
        setClients(clientsData)
      })
    }
  }, [mechanic?.uid])

  const openNew = () => {
    setEditingCar(null)
    reset({ plate: '', brand: '', model: '', year: new Date().getFullYear(), color: '', fuelType: 'flex', engine: '', vin: '', mileage: '', notes: '', clientId: '' })
    setDialogOpen(true)
  }

  const openEdit = (car: Car) => {
    setEditingCar(car)
    setValue('clientId', car.clientId)
    setValue('plate', car.plate)
    setValue('brand', car.brand)
    setValue('model', car.model)
    setValue('year', car.year)
    setValue('color', car.color || '')
    setValue('fuelType', car.fuelType || 'flex')
    setValue('engine', car.engine || '')
    setValue('vin', car.vin || '')
    setValue('mileage', car.mileage?.toString() || '')
    setValue('notes', car.notes || '')
    setDialogOpen(true)
  }

  const onSubmit = async (data: any) => {
    if (!mechanic?.uid) return
    try {
      const payload = {
        ...data,
        mechanicId: mechanic.uid,
        mileage: data.mileage ? Number(data.mileage) : null,
        year: Number(data.year),
      }
      if (editingCar) {
        await firestore.updateCar(editingCar.id, payload)
        toast.success('Carro atualizado!')
      } else {
        await firestore.addCar(payload)
        toast.success('Carro cadastrado!')
      }
      setDialogOpen(false)
      const updated = await firestore.getCars(mechanic.uid)
      setCars(updated)
    } catch {
      toast.error('Erro ao salvar carro')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este carro?')) return
    try {
      await firestore.deleteCar(id)
      toast.success('Carro excluído')
      setCars(await firestore.getCars(mechanic!.uid))
    } catch {
      toast.error('Erro ao excluir carro')
    }
  }

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || 'Cliente removido'
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Carros</Typography>
          <Typography variant="body2" color="text.secondary">
            {cars.length} carro(s) cadastrado(s)
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          Novo Carro
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Placa</TableCell>
                  <TableCell>Modelo</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Ano</TableCell>
                  <TableCell>Cor</TableCell>
                  <TableCell>Combustível</TableCell>
                  <TableCell>Km</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Nenhum carro cadastrado</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  cars.map((car) => (
                    <TableRow key={car.id} hover>
                      <TableCell>
                        <Chip label={car.plate} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>{car.brand} {car.model}</Typography>
                      </TableCell>
                      <TableCell>{getClientName(car.clientId)}</TableCell>
                      <TableCell>{car.year}</TableCell>
                      <TableCell>{car.color || '-'}</TableCell>
                      <TableCell>
                        {FUEL_TYPES.find((f) => f.value === car.fuelType)?.label || car.fuelType || '-'}
                      </TableCell>
                      <TableCell>{car.mileage ? `${car.mileage.toLocaleString()} km` : '-'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar"><IconButton size="small" onClick={() => openEdit(car)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Excluir"><IconButton size="small" color="error" onClick={() => handleDelete(car.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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
          <DialogTitle>{editingCar ? 'Editar Carro' : 'Novo Carro'}</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <FormControl fullWidth required>
                <InputLabel>Cliente</InputLabel>
                  <Select label="Cliente" defaultValue="" {...register('clientId', { required: true })}>
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box display="flex" gap={2}>
                <TextField label="Placa" {...register('plate', { required: true })} error={!!errors.plate} helperText={errors.plate ? 'Obrigatório' : ''} required fullWidth />
                <TextField label="Ano" type="number" {...register('year', { required: true })} error={!!errors.year} fullWidth required />
              </Box>
              <Box display="flex" gap={2}>
                <TextField label="Marca" {...register('brand', { required: true })} error={!!errors.brand} fullWidth required />
                <TextField label="Modelo" {...register('model', { required: true })} error={!!errors.model} fullWidth required />
              </Box>
              <Box display="flex" gap={2}>
                <TextField label="Cor" {...register('color')} fullWidth />
                <FormControl fullWidth>
                  <InputLabel>Combustível</InputLabel>
                  <Select label="Combustível" defaultValue="flex" {...register('fuelType')}>
                    {FUEL_TYPES.map((f) => (
                      <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box display="flex" gap={2}>
                <TextField label="Motor" {...register('engine')} fullWidth />
                <TextField label="Chassi (VIN)" {...register('vin')} fullWidth />
              </Box>
              <TextField label="Quilometragem Atual" type="number" {...register('mileage')} fullWidth />
              <TextField label="Observações" {...register('notes')} fullWidth multiline rows={2} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">{editingCar ? 'Atualizar' : 'Cadastrar'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
