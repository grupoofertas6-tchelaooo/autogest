import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { collection, query, where, getDocs, limit as firestoreLimit } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { colors, fonts, theme } from '../theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'

interface CarData {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  color?: string
  mileage?: number
}

export default function HomeScreen({ navigation }: any) {
  const [cars, setCars] = useState<CarData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [clientId, setClientId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email || '')
        setUserName(user.email?.split('@')[0] || 'Cliente')
        await findClientAndLoadCars(user.email || '')
      } else {
        setClientId(null)
        setCars([])
        setLoading(false)
      }
    })
    return unsubscribe
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (userEmail) {
        findClientAndLoadCars(userEmail)
      }
    }, [userEmail])
  )

  const findClientAndLoadCars = async (email: string) => {
    try {
      const clientQuery = query(
        collection(db, 'clients'),
        where('email', '==', email),
        firestoreLimit(1)
      )
      const clientSnap = await getDocs(clientQuery)
      if (clientSnap.empty) {
        setCars([])
        setLoading(false)
        setRefreshing(false)
        return
      }
      const clientDoc = clientSnap.docs[0]
      setClientId(clientDoc.id)

      const q = query(
        collection(db, 'cars'),
        where('clientId', '==', clientDoc.id)
      )
      const snapshot = await getDocs(q)
      const carsData = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as CarData))
        .sort((a, b) => a.plate.localeCompare(b.plate))
      setCars(carsData)
    } catch (err) {
      console.error('Error loading cars:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    if (userEmail) findClientAndLoadCars(userEmail)
  }

  const renderCar = ({ item }: { item: CarData }) => (
    <TouchableOpacity
      style={theme.card}
      onPress={() => navigation.navigate('CarDetails', { car: item })}
      activeOpacity={0.7}
    >
      <View style={styles.carHeader}>
        <View style={styles.carIcon}>
          <Text style={styles.carIconText}>
            {item.brand.charAt(0)}{item.model.charAt(0)}
          </Text>
        </View>
        <View style={styles.carInfo}>
          <Text style={styles.carName}>{item.brand} {item.model}</Text>
          <Text style={styles.carPlate}>{item.plate}</Text>
        </View>
        <View style={styles.carYear}>
          <Text style={styles.yearText}>{item.year}</Text>
          <Text style={styles.mileageText}>
            {item.mileage ? `${item.mileage.toLocaleString()} km` : '-'}
          </Text>
        </View>
      </View>

      {item.color && (
        <View style={styles.carDetail}>
          <Text style={styles.detailLabel}>Cor: </Text>
          <Text style={styles.detailValue}>{item.color}</Text>
        </View>
      )}
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <SafeAreaView style={[theme.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={theme.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {userName}!</Text>
          <Text style={styles.subtitle}>Seus carros</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileBtnText}>
            {userName.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={renderCar}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyTitle}>Nenhum carro cadastrado</Text>
            <Text style={styles.emptyText}>
              Seu mecânico ainda não cadastrou nenhum carro para você
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    color: colors.text,
    ...fonts.bold,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBtnText: {
    color: colors.white,
    fontSize: 18,
    ...fonts.semiBold,
  },
  list: {
    paddingBottom: 20,
  },
  carHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  carIconText: {
    fontSize: 18,
    color: colors.primary,
    ...fonts.bold,
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 16,
    color: colors.text,
    ...fonts.semiBold,
  },
  carPlate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  carYear: {
    alignItems: 'flex-end',
  },
  yearText: {
    fontSize: 14,
    color: colors.text,
    ...fonts.medium,
  },
  mileageText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  carDetail: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    color: colors.text,
    ...fonts.medium,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: colors.text,
    ...fonts.semiBold,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
})
