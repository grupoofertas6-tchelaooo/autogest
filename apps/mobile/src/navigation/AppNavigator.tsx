import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import HomeScreen from '../screens/HomeScreen'
import CarDetailsScreen from '../screens/CarDetailsScreen'
import ProfileScreen from '../screens/ProfileScreen'
import { ActivityIndicator, View } from 'react-native'
import { colors } from '../theme'

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
  const [user, setUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="CarDetails"
            component={CarDetailsScreen}
            options={{
              headerShown: true,
              headerTitle: 'Detalhes do Carro',
              headerBackTitle: 'Voltar',
              headerTintColor: colors.primary,
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerShown: true,
              headerTitle: 'Meu Perfil',
              headerBackTitle: 'Voltar',
              headerTintColor: colors.primary,
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}
