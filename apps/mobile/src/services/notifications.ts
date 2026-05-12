import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    return null
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    return null
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  if (!projectId) return null

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId })
  return tokenData.data
}

export function createChannel() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('maintenance', {
      name: 'Manutenção',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    })
  }
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  date: Date,
  data?: Record<string, string>
) {
  const trigger = date.getTime() - Date.now()
  if (trigger <= 0) return

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.ceil(trigger / 1000),
    },
  })
}

export { Notifications }
