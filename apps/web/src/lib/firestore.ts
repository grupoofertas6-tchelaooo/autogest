'use client'

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { COLLECTIONS } from '@autogest/shared'
import type {
  Client,
  Car,
  ServiceOrder,
  OilChange,
  MaintenanceSchedule,
} from '@autogest/shared'

const firestore = {
  getMechanicId: () => {
    const { auth } = require('./firebase')
    return auth.currentUser?.uid
  },

  // Clients
  async getClients(mechanicId: string): Promise<Client[]> {
    const q = query(
      collection(db, COLLECTIONS.CLIENTS),
      where('mechanicId', '==', mechanicId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as Client))
      .sort((a, b) => a.name.localeCompare(b.name))
  },

  async addClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
    return addDoc(collection(db, COLLECTIONS.CLIENTS), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  },

  async updateClient(id: string, data: Partial<Client>) {
    return updateDoc(doc(db, COLLECTIONS.CLIENTS, id), {
      ...data,
      updatedAt: Timestamp.now(),
    })
  },

  async deleteClient(id: string) {
    return deleteDoc(doc(db, COLLECTIONS.CLIENTS, id))
  },

  // Cars
  async getCars(mechanicId: string): Promise<Car[]> {
    const q = query(
      collection(db, COLLECTIONS.CARS),
      where('mechanicId', '==', mechanicId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as Car))
      .sort((a, b) => a.plate.localeCompare(b.plate))
  },

  async getCarsByClient(mechanicId: string, clientId: string): Promise<Car[]> {
    const q = query(
      collection(db, COLLECTIONS.CARS),
      where('mechanicId', '==', mechanicId),
      where('clientId', '==', clientId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Car))
  },

  async addCar(data: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) {
    return addDoc(collection(db, COLLECTIONS.CARS), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  },

  async updateCar(id: string, data: Partial<Car>) {
    return updateDoc(doc(db, COLLECTIONS.CARS, id), {
      ...data,
      updatedAt: Timestamp.now(),
    })
  },

  async deleteCar(id: string) {
    return deleteDoc(doc(db, COLLECTIONS.CARS, id))
  },

  // Service Orders
  async getServiceOrders(mechanicId: string): Promise<ServiceOrder[]> {
    const q = query(
      collection(db, COLLECTIONS.SERVICE_ORDERS),
      where('mechanicId', '==', mechanicId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as ServiceOrder))
      .sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime())
  },

  async addServiceOrder(data: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>) {
    return addDoc(collection(db, COLLECTIONS.SERVICE_ORDERS), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  },

  async updateServiceOrder(id: string, data: Partial<ServiceOrder>) {
    return updateDoc(doc(db, COLLECTIONS.SERVICE_ORDERS, id), {
      ...data,
      updatedAt: Timestamp.now(),
    })
  },

  // Oil Changes
  async getOilChanges(mechanicId: string): Promise<OilChange[]> {
    const q = query(
      collection(db, COLLECTIONS.OIL_CHANGES),
      where('mechanicId', '==', mechanicId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as OilChange))
      .sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime())
  },

  async addOilChange(data: Omit<OilChange, 'id' | 'createdAt' | 'updatedAt'>) {
    return addDoc(collection(db, COLLECTIONS.OIL_CHANGES), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  },

  async updateOilChange(id: string, data: Partial<OilChange>) {
    return updateDoc(doc(db, COLLECTIONS.OIL_CHANGES, id), {
      ...data,
      updatedAt: Timestamp.now(),
    })
  },

  // Maintenance Schedules
  async getMaintenanceSchedules(mechanicId: string): Promise<MaintenanceSchedule[]> {
    const q = query(
      collection(db, COLLECTIONS.MAINTENANCE_SCHEDULES),
      where('mechanicId', '==', mechanicId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MaintenanceSchedule))
  },

  async addMaintenanceSchedule(data: Omit<MaintenanceSchedule, 'id' | 'createdAt' | 'updatedAt'>) {
    return addDoc(collection(db, COLLECTIONS.MAINTENANCE_SCHEDULES), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  },

  async updateMaintenanceSchedule(id: string, data: Partial<MaintenanceSchedule>) {
    return updateDoc(doc(db, COLLECTIONS.MAINTENANCE_SCHEDULES, id), {
      ...data,
      updatedAt: Timestamp.now(),
    })
  },
}

export default firestore
