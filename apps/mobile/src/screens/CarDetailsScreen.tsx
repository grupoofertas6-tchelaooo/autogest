import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { colors, fonts, theme } from '../theme'
import { SafeAreaView } from 'react-native-safe-area-context'

interface OilChange {
  id: string
  date: any
  mileage: number
  oilType: string
  oilBrand: string
  nextChangeDate?: any
  nextChangeKm?: number
}

interface ServiceOrder {
  id: string
  number: number
  date: any
  description: string
  items: any[]
  totalCost: number
  status: string
}

interface Maintenance {
  id: string
  title: string
  category: string
  nextDueDate?: any
  nextDueKm?: number
}

export default function CarDetailsScreen({ route }: any) {
  const { car } = route.params
  const [oilChanges, setOilChanges] = useState<OilChange[]>([])
  const [services, setServices] = useState<ServiceOrder[]>([])
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const uid = auth.currentUser?.uid
      if (!uid) return

      const [oilSnap, serviceSnap, maintSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, 'oilChanges'),
            where('carId', '==', car.id),
            limit(5)
          )
        ),
        getDocs(
          query(
            collection(db, 'serviceOrders'),
            where('carId', '==', car.id),
            limit(10)
          )
        ),
        getDocs(
          query(
            collection(db, 'maintenanceSchedules'),
            where('carId', '==', car.id)
          )
        ),
      ])

      const oils = oilSnap.docs.map((d) => ({ id: d.id, ...d.data() } as OilChange))
      const servs = serviceSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ServiceOrder))
      setOilChanges(oils.sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime()))
      setServices(servs.sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime()))
      setMaintenances(maintSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Maintenance)))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('pt-BR')
  }

  const isOverdue = (timestamp: any) => {
    if (!timestamp) return false
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date < new Date()
  }

  if (loading) {
    return (
      <SafeAreaView style={[theme.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    )
  }

  const nextOil = oilChanges[0]

  return (
    <SafeAreaView style={theme.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Car Header */}
        <View style={styles.carHeader}>
          <View style={styles.carBadge}>
            <Text style={styles.carBadgeText}>
              {car.brand.charAt(0)}{car.model.charAt(0)}
            </Text>
          </View>
          <Text style={styles.carTitle}>{car.brand} {car.model}</Text>
          <Text style={styles.carPlate}>{car.plate} • {car.year}</Text>
          {car.mileage && (
            <Text style={styles.carMileage}>
              {car.mileage.toLocaleString()} km
            </Text>
          )}
        </View>

        {/* Next Oil Change Alert */}
        {nextOil && (
          <View style={[theme.card, nextOil.nextChangeDate && isOverdue(nextOil.nextChangeDate) ? styles.alertCard : styles.infoCard]}>
            <Text style={styles.alertTitle}>
              {nextOil.nextChangeDate && isOverdue(nextOil.nextChangeDate) ? '⚠️ Troca de Óleo Atrasada!' : '🛢️ Próxima Troca de Óleo'}
            </Text>
            {nextOil.nextChangeDate && (
              <Text style={styles.alertText}>
                Data: {formatDate(nextOil.nextChangeDate)}
              </Text>
            )}
            {nextOil.nextChangeKm && (
              <Text style={styles.alertText}>
                Km: {nextOil.nextChangeKm.toLocaleString()} km
              </Text>
            )}
            <Text style={styles.alertSubtext}>
              Última troca: {formatDate(nextOil.date)} ({nextOil.mileage.toLocaleString()} km)
            </Text>
          </View>
        )}

        {/* Maintenance Alerts */}
        {maintenances.filter((m) => m.nextDueDate && isOverdue(m.nextDueDate)).length > 0 && (
          <View style={[theme.card, styles.alertCard]}>
            <Text style={styles.alertTitle}>🔧 Manutenções Pendentes</Text>
            {maintenances
              .filter((m) => m.nextDueDate && isOverdue(m.nextDueDate))
              .map((m) => (
                <View key={m.id} style={styles.maintItem}>
                  <Text style={styles.maintName}>{m.title}</Text>
                  <Text style={styles.maintDate}>Vencida em: {formatDate(m.nextDueDate)}</Text>
                </View>
              ))}
          </View>
        )}

        {/* Services History */}
        <View style={styles.section}>
          <Text style={theme.sectionTitle}>Últimos Serviços</Text>
          {services.length === 0 ? (
            <View style={theme.card}>
              <Text style={styles.emptyText}>Nenhum serviço registrado</Text>
            </View>
          ) : (
            services.map((s) => (
              <View key={s.id} style={theme.card}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceNumber}>OS #{s.number}</Text>
                  <Text style={styles.serviceDate}>{formatDate(s.date)}</Text>
                </View>
                <Text style={styles.serviceDesc}>{s.description}</Text>
                <View style={styles.serviceFooter}>
                  <Text style={styles.serviceStatus}>
                    {s.status === 'completed' ? '✅ Concluído' : s.status === 'in_progress' ? '🔧 Em Andamento' : '⏳ Pendente'}
                  </Text>
                  <Text style={styles.serviceCost}>
                    R$ {s.totalCost.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Oil Change History */}
        <View style={styles.section}>
          <Text style={theme.sectionTitle}>Histórico de Óleo</Text>
          {oilChanges.length === 0 ? (
            <View style={theme.card}>
              <Text style={styles.emptyText}>Nenhuma troca de óleo registrada</Text>
            </View>
          ) : (
            oilChanges.map((o) => (
              <View key={o.id} style={theme.card}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceDate}>{formatDate(o.date)}</Text>
                  <Text style={styles.serviceNumber}>{o.mileage.toLocaleString()} km</Text>
                </View>
                <Text style={styles.oilDetail}>{o.oilBrand} {o.oilType}</Text>
              </View>
            ))
          )}
        </View>

        {/* Upcoming Maintenance */}
        {maintenances.length > 0 && (
          <View style={styles.section}>
            <Text style={theme.sectionTitle}>Manutenções Programadas</Text>
            {maintenances.map((m) => (
              <View key={m.id} style={theme.card}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceNumber}>{m.title}</Text>
                  {m.nextDueDate && (
                    <Text style={[
                      styles.serviceDate,
                      isOverdue(m.nextDueDate) && { color: colors.error },
                    ]}>
                      {isOverdue(m.nextDueDate) ? '⚠️ ' : ''}{formatDate(m.nextDueDate)}
                    </Text>
                  )}
                </View>
                {m.nextDueKm && (
                  <Text style={styles.maintKm}>Próximo nos {m.nextDueKm.toLocaleString()} km</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  carHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  carBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  carBadgeText: {
    fontSize: 28,
    color: colors.primary,
    ...fonts.bold,
  },
  carTitle: {
    fontSize: 22,
    color: colors.text,
    ...fonts.bold,
  },
  carPlate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  carMileage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  alertCard: {
    backgroundColor: '#FFF3F0',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  alertTitle: {
    fontSize: 15,
    color: colors.text,
    ...fonts.semiBold,
    marginBottom: 6,
  },
  alertText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  alertSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  maintItem: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  maintName: {
    fontSize: 14,
    color: colors.text,
    ...fonts.medium,
  },
  maintDate: {
    fontSize: 12,
    color: colors.error,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 4,
    marginTop: 8,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceNumber: {
    fontSize: 14,
    color: colors.text,
    ...fonts.semiBold,
  },
  serviceDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  serviceDesc: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    lineHeight: 20,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  serviceStatus: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  serviceCost: {
    fontSize: 15,
    color: colors.primary,
    ...fonts.semiBold,
  },
  oilDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  maintKm: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 8,
  },
})
