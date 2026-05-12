'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { Mechanic } from '@autogest/shared'

interface AuthContextType {
  user: User | null
  mechanic: Mechanic | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, businessName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [mechanic, setMechanic] = useState<Mechanic | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const docRef = doc(db, 'mechanics', firebaseUser.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setMechanic(docSnap.data() as Mechanic)
        }
      } else {
        setMechanic(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const register = async (email: string, password: string, name: string, businessName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const mechanicData: Mechanic = {
      uid: result.user.uid,
      name,
      email,
      businessName,
      phone: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await setDoc(doc(db, 'mechanics', result.user.uid), mechanicData)
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, mechanic, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
