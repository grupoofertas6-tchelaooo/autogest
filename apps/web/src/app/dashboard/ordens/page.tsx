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
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material'
import { useAuth } from '@/lib/auth'
import firestore from '@/lib/firestore'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { SERVICE_STATUS, PAYMENT_STATUS } from '@autogest/shared'
import type { Client, Car, ServiceOrder, ServiceItem } from '@autogest/shared'

export default function ServiceOrdersPage() {
  const { mechanic } = useAuth()
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null)
  const [items, setItems] = useState<ServiceItem[]>([])
  const { register, handleSubmit, reset, setValue, watch } = useForm()

  useEffect(() => {
    if (mechanic?.uid) {
      Promise.all([
        firestore.getServiceOrders(mechanic.uid),
        firestore.getClients(mechanic.uid),
        firestore.getCars(mechanic.uid),
      ]).then(([o, c, carsData]) => {
        setOrders(o)
        setClients(c)
        setCars(carsData)
      })
    }
  }, [mechanic?.uid])

  const openNew = () => {
    setEditingOrder(null)
    setItems([])
    reset({ carId: '', clientId: '', date: new Date().toISOString().split('T')[0], mileage: '', description: '', laborCost: '0', partsCost: '0', totalCost: '0', status: 'pending', paymentStatus: 'pending', notes: '' })
    setDialogOpen(true)
  }

  const filteredCars = cars.filter((c) => c.clientId === watch('clientId'))

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, totalPrice: 0, type: 'service' }])
  }

  const updateItem = (index: number, field: keyof ServiceItem, value: any) => {
    const newItems = [...items]
    ;(newItems[index] as any)[field] = value
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice
    }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const totalCalc = items.reduce((sum, item) => sum + item.totalPrice, 0)

  const onSubmit = async (data: any) => {
    if (!mechanic?.uid) return
    try {
      const nextNumber = orders.length > 0 ? Math.max(...orders.map((o) => o.number)) + 1 : 1
      const payload = {
        ...data,
        mechanicId: mechanic.uid,
        number: editingOrder?.number || nextNumber,
        date: new Date(data.date),
        mileage: Number(data.mileage) || 0,
        items,
        laborCost: Number(data.laborCost) || 0,
        partsCost: Number(data.partsCost) || 0,
        totalCost: totalCalc + Number(data.laborCost || 0),
      }
      if (editingOrder) {
        await firestore.updateServiceOrder(editingOrder.id, payload)
        toast.success('Ordem atualizada!')
      } else {
        await firestore.addServiceOrder(payload)
        toast.success('Ordem criada!')
      }
      setDialogOpen(false)
      setOrders(await firestore.getServiceOrders(mechanic.uid))
    } catch {
      toast.error('Erro ao salvar ordem')
    }
  }

  const getCarInfo = (carId: string) => {
    const car = cars.find((c) => c.id === carId)
    return car ? `${car.brand} ${car.model} - ${car.plate}` : 'N/A'
  }

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || 'N/A'
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Ordens de Serviço</Typography>
          <Typography variant="body2" color="text.secondary">
            {orders.length} ordem(ns) registrada(s)
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          Nova OS
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nº</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Carro</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Pagamento</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Nenhuma ordem de serviço</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell><Typography fontWeight={600}>#{order.number}</Typography></TableCell>
                      <TableCell>{order.date.toDate().toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{getClientName(order.clientId)}</TableCell>
                      <TableCell>{getCarInfo(order.carId)}</TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>
                          R$ {order.totalCost.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={SERVICE_STATUS.find((s) => s.value === order.status)?.label || order.status}
                          color={(SERVICE_STATUS.find((s) => s.value === order.status)?.color as any) || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={PAYMENT_STATUS.find((s) => s.value === order.paymentStatus)?.label || order.paymentStatus}
                          color={(PAYMENT_STATUS.find((s) => s.value === order.paymentStatus)?.color as any) || 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar"><IconButton size="small"><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Imprimir"><IconButton size="small"><ReceiptIcon fontSize="small" /></IconButton></Tooltip>
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
          <DialogTitle>{editingOrder ? 'Editar OS' : 'Nova Ordem de Serviço'}</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <Box display="flex" gap={2}>
                <FormControl fullWidth required>
                  <InputLabel>Cliente</InputLabel>
                  <Select label="Cliente" defaultValue="" {...register('clientId', { required: true })}>
                    {clients.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>Carro</InputLabel>
                  <Select label="Carro" defaultValue="" {...register('carId', { required: true })}>
                    {filteredCars.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.brand} {c.model} - {c.plate}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box display="flex" gap={2}>
                <TextField label="Data" type="date" {...register('date', { required: true })} fullWidth required InputLabelProps={{ shrink: true }} />
                <TextField label="Quilometragem" type="number" {...register('mileage')} fullWidth />
              </Box>
              <TextField label="Descrição do Serviço" {...register('description')} fullWidth multiline rows={2} />

              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2">Itens do Serviço</Typography>
                  <Button size="small" onClick={addItem}>+ Adicionar Item</Button>
                </Box>
                {items.map((item, index) => (
                  <Box key={index} display="flex" gap={1} alignItems="center" mb={1}>
                    <TextField size="small" label="Descrição" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} sx={{ flex: 2 }} />
                    <FormControl size="small" sx={{ flex: 0.5 }}>
                      <Select value={item.type} onChange={(e) => updateItem(index, 'type', e.target.value)}>
                        <MenuItem value="service">Serviço</MenuItem>
                        <MenuItem value="part">Peça</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField size="small" label="Qtd" type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))} sx={{ flex: 0.5 }} />
                    <TextField size="small" label="Valor Unit." type="number" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))} sx={{ flex: 0.7 }} />
                    <Typography sx={{ flex: 0.5 }}>R$ {item.totalPrice.toFixed(2)}</Typography>
                    <IconButton size="small" color="error" onClick={() => removeItem(index)}>✕</IconButton>
                  </Box>
                ))}
                {items.length > 0 && (
                  <Box textAlign="right" mt={1}>
                    <Typography fontWeight={600}>Total Itens: R$ {totalCalc.toFixed(2)}</Typography>
                  </Box>
                )}
              </Box>

              <Box display="flex" gap={2}>
                <TextField label="Mão de Obra (R$)" type="number" {...register('laborCost')} fullWidth />
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                <Select label="Status" defaultValue="pending" {...register('status')}>
                  {SERVICE_STATUS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Pagamento</InputLabel>
                <Select label="Pagamento" defaultValue="pending" {...register('paymentStatus')}>
                    {PAYMENT_STATUS.map((s) => (
                      <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <TextField label="Observações" {...register('notes')} fullWidth multiline rows={2} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">{editingOrder ? 'Atualizar' : 'Criar OS'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
