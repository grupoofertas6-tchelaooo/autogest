import { StyleSheet } from 'react-native'

export const colors = {
  primary: '#1565C0',
  primaryLight: '#1E88E5',
  primaryDark: '#0D47A1',
  secondary: '#00897B',
  secondaryLight: '#26A69A',
  background: '#F5F7FA',
  white: '#FFFFFF',
  black: '#000000',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#D32F2F',
  warning: '#F57C00',
  success: '#388E3C',
  info: '#0288D1',
  cardShadow: '#00000010',
}

export const fonts = {
  regular: { fontFamily: 'Inter_400Regular' },
  medium: { fontFamily: 'Inter_500Medium' },
  semiBold: { fontFamily: 'Inter_600SemiBold' },
  bold: { fontFamily: 'Inter_700Bold' },
}

export const theme = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    ...fonts.semiBold,
  },
  title: {
    fontSize: 28,
    color: colors.text,
    ...fonts.bold,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    ...fonts.regular,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.text,
    ...fonts.semiBold,
    marginBottom: 12,
  },
})
