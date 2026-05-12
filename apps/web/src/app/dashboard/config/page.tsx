'use client'

import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Avatar,
  Grid,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  Business,
  Email,
  Phone,
  Save as SaveIcon,
} from '@mui/icons-material'
import { useAuth } from '@/lib/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { updateEmail } from 'firebase/auth'
import toast from 'react-hot-toast'
import { auth } from '@/lib/firebase'

export default function SettingsPage() {
  const { mechanic, user } = useAuth()
  const [name, setName] = useState(mechanic?.name || '')
  const [businessName, setBusinessName] = useState(mechanic?.businessName || '')
  const [phone, setPhone] = useState(mechanic?.phone || '')
  const [address, setAddress] = useState(mechanic?.address || '')

  const handleSave = async () => {
    if (!mechanic?.uid) return
    try {
      await updateDoc(doc(db, 'mechanics', mechanic.uid), {
        name,
        businessName,
        phone,
        address,
        updatedAt: new Date(),
      })
      toast.success('Configurações salvas!')
    } catch {
      toast.error('Erro ao salvar')
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Configurações</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Gerencie as informações da sua oficina
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 32 }}>
                {mechanic?.name?.charAt(0)?.toUpperCase() || 'M'}
              </Avatar>
              <Typography variant="h6">{mechanic?.name}</Typography>
              <Typography variant="body2" color="text.secondary">{mechanic?.email}</Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>{mechanic?.businessName}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" mb={3}>Informações da Oficina</Typography>

              <Box display="flex" flexDirection="column" gap={2.5}>
                <TextField
                  label="Seu Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  InputProps={{ startAdornment: <Business sx={{ mr: 1, color: 'action.active' }} /> }}
                />
                <TextField
                  label="Nome da Oficina"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Email"
                  value={mechanic?.email || ''}
                  fullWidth
                  disabled
                  InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} /> }}
                  helperText="Email associado à conta"
                />
                <TextField
                  label="Telefone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  fullWidth
                  InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} /> }}
                />
                <TextField
                  label="Endereço"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />

                <Divider sx={{ my: 1 }} />

                <Box display="flex" justifyContent="flex-end">
                  <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} size="large">
                    Salvar Alterações
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>Configurações Padrão</Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Intervalo padrão troca de óleo (Km)"
                  type="number"
                  defaultValue={5000}
                  fullWidth
                  helperText="Valor sugerido para novas trocas de óleo"
                />
                <TextField
                  label="Intervalo padrão troca de óleo (dias)"
                  type="number"
                  defaultValue={180}
                  fullWidth
                  helperText="Valor sugerido para novas trocas de óleo"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Notificações automáticas para clientes"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
