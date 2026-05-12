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
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material'
import { useAuth } from '@/lib/auth'
import firestore from '@/lib/firestore'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import type { Client } from '@autogest/shared'

export default function ClientsPage() {
  const { mechanic } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    if (mechanic?.uid) {
      firestore.getClients(mechanic.uid).then(setClients)
    }
  }, [mechanic?.uid])

  const openNew = () => {
    setEditingClient(null)
    reset({ name: '', email: '', phone: '', whatsapp: '', document: '', address: '', notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (client: Client) => {
    setEditingClient(client)
    setValue('name', client.name)
    setValue('email', client.email || '')
    setValue('phone', client.phone || '')
    setValue('whatsapp', client.whatsapp || '')
    setValue('document', client.document || '')
    setValue('address', client.address || '')
    setValue('notes', client.notes || '')
    setDialogOpen(true)
  }

  const onSubmit = async (data: any) => {
    if (!mechanic?.uid) return
    try {
      if (editingClient) {
        await firestore.updateClient(editingClient.id, data)
        toast.success('Cliente atualizado!')
      } else {
        await firestore.addClient({ ...data, mechanicId: mechanic.uid })
        toast.success('Cliente cadastrado!')
      }
      setDialogOpen(false)
      const updated = await firestore.getClients(mechanic.uid)
      setClients(updated)
    } catch {
      toast.error('Erro ao salvar cliente')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    try {
      await firestore.deleteClient(id)
      toast.success('Cliente excluído')
      const updated = await firestore.getClients(mechanic!.uid)
      setClients(updated)
    } catch {
      toast.error('Erro ao excluir cliente')
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Clientes</Typography>
          <Typography variant="body2" color="text.secondary">
            {clients.length} cliente(s) cadastrado(s)
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          Novo Cliente
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>WhatsApp</TableCell>
                  <TableCell>Documento</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Nenhum cliente cadastrado</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main' }}>
                            {client.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography fontWeight={500}>{client.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{client.email || '-'}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell>
                        {client.whatsapp ? (
                          <Chip
                            icon={<WhatsAppIcon />}
                            label={client.whatsapp}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ) : '-'}
                      </TableCell>
                      <TableCell>{client.document || '-'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar"><IconButton size="small" onClick={() => openEdit(client)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Excluir"><IconButton size="small" color="error" onClick={() => handleDelete(client.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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
          <DialogTitle>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <TextField label="Nome" {...register('name', { required: true })} error={!!errors.name} helperText={errors.name ? 'Obrigatório' : ''} fullWidth required />
              <TextField label="Email" type="email" {...register('email')} fullWidth />
              <TextField label="Telefone" {...register('phone')} fullWidth />
              <TextField label="WhatsApp" {...register('whatsapp')} fullWidth />
              <TextField label="CPF/CNPJ" {...register('document')} fullWidth />
              <TextField label="Endereço" {...register('address')} fullWidth multiline rows={2} />
              <TextField label="Observações" {...register('notes')} fullWidth multiline rows={2} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">{editingClient ? 'Atualizar' : 'Cadastrar'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
