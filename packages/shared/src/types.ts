export interface Mechanic {
  uid: string
  name: string
  email: string
  phone: string
  address?: string
  logo?: string
  businessName?: string
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  mechanicId: string
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  document?: string
  address?: string
  notes?: string
  photoUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Car {
  id: string
  clientId: string
  mechanicId: string
  plate: string
  brand: string
  model: string
  year: number
  color?: string
  fuelType?: 'gasoline' | 'ethanol' | 'diesel' | 'flex' | 'electric' | 'hybrid'
  engine?: string
  vin?: string
  mileage?: number
  notes?: string
  photoUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface ServiceOrder {
  id: string
  carId: string
  clientId: string
  mechanicId: string
  number: number
  date: Date
  mileage: number
  description: string
  items: ServiceItem[]
  laborCost: number
  partsCost: number
  totalCost: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'partial'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ServiceItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  type: 'part' | 'service'
}

export interface OilChange {
  id: string
  carId: string
  clientId: string
  mechanicId: string
  date: Date
  mileage: number
  oilType: string
  oilBrand: string
  oilViscosity?: string
  oilQuantity?: number
  filterBrand?: string
  filterChanged: boolean
  nextChangeDate?: Date
  nextChangeKm?: number
  notes?: string
  cost?: number
  createdAt: Date
  updatedAt: Date
}

export interface MaintenanceSchedule {
  id: string
  carId: string
  clientId: string
  mechanicId: string
  title: string
  description?: string
  intervalKm?: number
  intervalDays?: number
  lastDoneDate?: Date
  lastDoneKm?: number
  nextDueDate?: Date
  nextDueKm?: number
  category: 'oil' | 'tires' | 'brakes' | 'suspension' | 'engine' | 'transmission' | 'cooling' | 'electrical' | 'other'
  reminderEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  clientId: string
  mechanicId: string
  carId?: string
  type: 'oil_change' | 'maintenance' | 'service' | 'promotional'
  title: string
  message: string
  scheduledDate: Date
  sent: boolean
  sentAt?: Date
  read: boolean
  readAt?: Date
  createdAt: Date
}

export interface AppSettings {
  id: string
  mechanicId: string
  businessName: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
  defaultOilIntervalKm: number
  defaultOilIntervalDays: number
  notificationEnabled: boolean
  theme: 'light' | 'dark' | 'system'
  currency: string
  language: 'pt-BR' | 'en-US' | 'es'
}

export type CarSummary = {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  clientName: string
  nextOilChangeKm?: number
  nextOilChangeDate?: Date
  nextMaintenanceKm?: number
  nextMaintenanceDate?: Date
}
