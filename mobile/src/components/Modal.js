import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal as RNModal,
  StyleSheet,
} from 'react-native';
import { colors, globalStyles } from '../styles/globalStyles';

export default function Modal({ 
  visible, 
  onClose, 
  title, 
  children,
  showCloseButton = true 
}) {
  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={globalStyles.modalTitle}>{title}</Text>
            {showCloseButton && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: colors.slate800,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate700,
    margin: 20,
    maxWidth: 400,
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate700,
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.slate400,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
});