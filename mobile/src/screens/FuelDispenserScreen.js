import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, globalStyles } from '../styles/globalStyles';

const { width: screenWidth } = Dimensions.get('window');

export default function FuelDispenserScreen({ navigation }) {
  const dispensers = Array.from({ length: 20 }, (_, i) => i + 1);

  const handleDispenserPress = (dispenserId) => {
    navigation.navigate('FuelDispenserDetails', { dispenserId: `D${dispenserId}` });
  };

  const renderDispenser = (dispenserId) => (
    <TouchableOpacity
      key={dispenserId}
      style={styles.dispenserButton}
      onPress={() => handleDispenserPress(dispenserId)}
    >
      <Text style={styles.dispenserText}>D{dispenserId}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>(For Petrolpump Only)</Text>
          </View>

          {/* Dispenser Grid */}
          <View style={styles.dispenserGrid}>
            {dispensers.map(renderDispenser)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
  },
  dispenserGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dispenserButton: {
    backgroundColor: colors.slate800,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate700,
    width: (screenWidth - 64) / 4,
    height: (screenWidth - 64) / 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dispenserText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
});