import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { colors, fonts, theme } from '../theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { registerForPushNotifications } from '../services/notifications'

export default function ProfileScreen({ navigation }: any) {
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email || '')
        const docSnap = await getDoc(doc(db, 'clients', user.uid))
        if (docSnap.exists()) {
          setUserName(docSnap.data().name)
        }
      }
    })
    return unsubscribe
  }, [])

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value)
    if (value) {
      const token = await registerForPushNotifications()
      if (token) {
        Alert.alert('Notificações', 'Notificações ativadas com sucesso!')
      } else {
        Alert.alert('Aviso', 'Não foi possível ativar notificações neste dispositivo')
        setNotificationsEnabled(false)
      }
    }
  }

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth)
        },
      },
    ])
  }

  return (
    <SafeAreaView style={theme.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.email}>{userEmail}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>

          <View style={theme.card}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Notificações</Text>
                <Text style={styles.settingDesc}>
                  Receba alertas de manutenção e troca de óleo
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>

          <TouchableOpacity style={theme.card} onPress={() => {}}>
            <Text style={styles.settingLabel}>Alterar Senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[theme.card, styles.logoutCard]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.version}>
          <Text style={styles.versionText}>AutoGest Cliente v1.0</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    color: colors.white,
    ...fonts.bold,
  },
  name: {
    fontSize: 22,
    color: colors.text,
    ...fonts.bold,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    ...fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 15,
    color: colors.text,
    ...fonts.medium,
  },
  settingDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    maxWidth: 220,
  },
  logoutCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  logoutText: {
    fontSize: 15,
    color: colors.error,
    ...fonts.medium,
  },
  version: {
    alignItems: 'center',
    marginTop: 32,
  },
  versionText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
})
