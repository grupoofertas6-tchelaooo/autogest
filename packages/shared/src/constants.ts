export const COLLECTIONS = {
  MECHANICS: 'mechanics',
  CLIENTS: 'clients',
  CARS: 'cars',
  SERVICE_ORDERS: 'serviceOrders',
  OIL_CHANGES: 'oilChanges',
  MAINTENANCE_SCHEDULES: 'maintenanceSchedules',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
} as const

export const OIL_INTERVAL_DEFAULT = {
  KM: 5000,
  DAYS: 180,
} as const

export const MAINTENANCE_CATEGORIES = [
  { value: 'oil', label: 'Óleo e Filtros' },
  { value: 'tires', label: 'Pneus' },
  { value: 'brakes', label: 'Freios' },
  { value: 'suspension', label: 'Suspensão' },
  { value: 'engine', label: 'Motor' },
  { value: 'transmission', label: 'Câmbio' },
  { value: 'cooling', label: 'Arrefecimento' },
  { value: 'electrical', label: 'Elétrica' },
  { value: 'other', label: 'Outros' },
] as const

export const FUEL_TYPES = [
  { value: 'gasoline', label: 'Gasolina' },
  { value: 'ethanol', label: 'Etanol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'flex', label: 'Flex' },
  { value: 'electric', label: 'Elétrico' },
  { value: 'hybrid', label: 'Híbrido' },
] as const

export const SERVICE_STATUS = [
  { value: 'pending', label: 'Pendente', color: 'warning' },
  { value: 'in_progress', label: 'Em Andamento', color: 'info' },
  { value: 'completed', label: 'Concluído', color: 'success' },
  { value: 'cancelled', label: 'Cancelado', color: 'error' },
] as const

export const PAYMENT_STATUS = [
  { value: 'pending', label: 'Pendente', color: 'warning' },
  { value: 'paid', label: 'Pago', color: 'success' },
  { value: 'partial', label: 'Parcial', color: 'info' },
] as const
