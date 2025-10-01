import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const colors = {
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  white: '#ffffff',
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  green600: '#16a34a',
  green700: '#15803d',
  red600: '#dc2626',
  red700: '#b91c1c',
  red400: '#f87171',
  red500: '#ef4444',
  orange600: '#ea580c',
  orange700: '#c2410c',
  yellow400: '#facc15',
  purple600: '#9333ea',
  purple700: '#7c3aed',
  emerald600: '#059669',
  indigo600: '#4f46e5',
  transparent: 'transparent',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate900,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.slate900,
  },
  scrollView: {
    flexGrow: 1,
    backgroundColor: colors.slate900,
  },
  card: {
    backgroundColor: colors.slate800,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate700,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  input: {
    backgroundColor: colors.slate700,
    borderWidth: 1,
    borderColor: colors.slate600,
    borderRadius: 4,
    color: colors.white,
    height: 32,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  button: {
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.blue600,
  },
  buttonSuccess: {
    backgroundColor: colors.green600,
  },
  buttonDanger: {
    backgroundColor: colors.red600,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  text: {
    color: colors.white,
    fontSize: 14,
  },
  textMuted: {
    color: colors.slate400,
    fontSize: 12,
  },
  textSmall: {
    color: colors.slate400,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: colors.slate800,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate700,
    padding: 20,
    margin: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  grid2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    marginRight: 8,
  },
  gridItemLast: {
    flex: 1,
    marginRight: 0,
  },
  label: {
    color: colors.slate400,
    fontSize: 12,
    marginBottom: 4,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.slate800,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.red600,
  },
  summaryBox: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate600,
    padding: 16,
  },
});