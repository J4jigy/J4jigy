import React, { useState } from 'react';
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

export default function DashboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Business');

  const summaryCards = [
    {
      title: 'You will Give',
      subtitle: 'Total Payables',
      amount: '₹ 0',
      color: 'red',
      onPress: () => navigation.navigate('ListView', { title: 'Payables - You will Give', type: 'payables' }),
    },
    {
      title: 'You will Receive',
      subtitle: 'Total Receivables',
      amount: '₹ 0',
      color: 'green',
      onPress: () => navigation.navigate('ListView', { title: 'Receivables - You will Receive', type: 'receivables' }),
    },
  ];

  const tabs = ['Business', 'Finance', 'Personal'];

  const featureTiles = {
    Business: [], // Empty - no default business features
    Finance: [], // Empty - no default finance features  
    Personal: [], // Empty - no default personal features
  };

  const renderSummaryCard = (card, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.summaryCard,
        card.color === 'red' ? styles.redCard : styles.greenCard,
      ]}
      onPress={card.onPress}
    >
      <Text style={styles.summaryAmount}>{card.amount}</Text>
      <Text style={styles.summaryTitle}>{card.title}</Text>
      <Text style={styles.summarySubtitle}>{card.subtitle}</Text>
    </TouchableOpacity>
  );

  const renderFeatureTile = (tile, index) => (
    <TouchableOpacity
      key={index}
      style={styles.featureTile}
      onPress={tile.onPress}
    >
      <Ionicons name={tile.icon} size={24} color={tile.color} />
      <Text style={styles.tileTitle}>{tile.title}</Text>
      {tile.subtitle && <Text style={styles.tileSubtitle}>{tile.subtitle}</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Summary Cards */}
          <View style={styles.summarySection}>
            {summaryCards.map(renderSummaryCard)}
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Feature Tiles */}
          <View style={styles.featuresContainer}>
            {featureTiles[activeTab]?.length === 0 ? (
              <View style={styles.emptyFeaturesState}>
                <Ionicons name="apps-outline" size={64} color={colors.slate600} />
                <Text style={styles.emptyFeaturesText}>No {activeTab.toLowerCase()} features available</Text>
                <Text style={styles.emptyFeaturesSubtext}>Features will appear here when added</Text>
              </View>
            ) : (
              featureTiles[activeTab]?.map(renderFeatureTile)
            )}
          </View>

          {/* Floating Action Buttons */}
          <View style={styles.fabContainer}>
            <TouchableOpacity
              style={[styles.fab, styles.chatFab]}
              onPress={() => {/* Chat functionality */}}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.blue400} />
            </TouchableOpacity>
          </View>

          {/* Cash In/Out Buttons */}
          <View style={styles.cashButtonsContainer}>
            <TouchableOpacity
              style={[styles.cashButton, styles.cashInButton]}
              onPress={() => navigation.navigate('CashIn')}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.white} />
              <Text style={styles.cashButtonText}>Cash In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.cashButton, styles.cashOutButton]}
              onPress={() => navigation.navigate('CashOut')}
            >
              <Ionicons name="remove-circle-outline" size={20} color={colors.white} />
              <Text style={styles.cashButtonText}>Cash Out</Text>
            </TouchableOpacity>
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
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  redCard: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderColor: colors.red600,
    borderWidth: 1,
  },
  greenCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: colors.green600,
    borderWidth: 1,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 12,
    color: colors.slate400,
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: 11,
    color: colors.slate500,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.slate800,
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  activeTab: {
    backgroundColor: colors.slate700,
  },
  tabText: {
    fontSize: 14,
    color: colors.slate400,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 80,
  },
  featureTile: {
    backgroundColor: colors.slate800,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate700,
    padding: 16,
    width: (screenWidth - 44) / 2,
    marginBottom: 12,
    alignItems: 'center',
    minHeight: 100,
  },
  tileTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.white,
    marginTop: 8,
    textAlign: 'center',
  },
  tileSubtitle: {
    fontSize: 10,
    color: colors.slate400,
    marginTop: 2,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 90,
    right: 20,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chatFab: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  cashButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cashButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cashInButton: {
    backgroundColor: colors.green600,
  },
  cashOutButton: {
    backgroundColor: colors.red600,
  },
  cashButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});