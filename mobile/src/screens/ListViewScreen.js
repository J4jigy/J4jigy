import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, globalStyles } from '../styles/globalStyles';

export default function ListViewScreen({ route, navigation }) {
  const { title, type } = route.params;
  const [activeTab, setActiveTab] = useState('All');

  // Mock data for different list types
  const getMockData = () => {
    switch (type) {
      case 'customers':
        return {
          tabs: ['All', 'Debtors / देनदार', 'Regular'],
          data: [
            { id: 1, name: 'Customer 1', amount: '₹ 5,000', type: 'Debtor', phone: '+91 98765 43210' },
            { id: 2, name: 'Customer 2', amount: '₹ 2,500', type: 'Regular', phone: '+91 98765 43211' },
            { id: 3, name: 'Customer 3', amount: '₹ 8,000', type: 'Debtor', phone: '+91 98765 43212' },
          ],
          summary: { title: 'You gave', amount: '₹ 15,500' }
        };
      case 'suppliers':
        return {
          tabs: ['All', 'Creditors / लेनदार', 'Regular'],
          data: [
            { id: 1, name: 'Supplier 1', amount: '₹ 12,000', type: 'Creditor', phone: '+91 98765 43213' },
            { id: 2, name: 'Supplier 2', amount: '₹ 6,000', type: 'Regular', phone: '+91 98765 43214' },
            { id: 3, name: 'Supplier 3', amount: '₹ 9,500', type: 'Creditor', phone: '+91 98765 43215' },
          ],
          summary: { title: 'You gave', amount: '₹ 27,500' }
        };
      case 'payables':
        return {
          tabs: ['All', 'Overdue', 'Upcoming'],
          data: [
            { id: 1, name: 'Rent Payment', amount: '₹ 25,000', dueDate: '2024-01-15', type: 'Overdue' },
            { id: 2, name: 'Utility Bill', amount: '₹ 3,500', dueDate: '2024-01-20', type: 'Upcoming' },
            { id: 3, name: 'Equipment Payment', amount: '₹ 18,000', dueDate: '2024-01-10', type: 'Overdue' },
          ],
          summary: { title: 'Total Payables', amount: '₹ 46,500' }
        };
      case 'receivables':
        return {
          tabs: ['All', 'Overdue', 'Current'],
          data: [
            { id: 1, name: 'Invoice #001', amount: '₹ 15,000', dueDate: '2024-01-12', type: 'Overdue' },
            { id: 2, name: 'Invoice #002', amount: '₹ 8,500', dueDate: '2024-01-25', type: 'Current' },
            { id: 3, name: 'Invoice #003', amount: '₹ 22,000', dueDate: '2024-01-08', type: 'Overdue' },
          ],
          summary: { title: 'Total Receivables', amount: '₹ 45,500' }
        };
      default:
        return {
          tabs: ['All'],
          data: [
            { id: 1, name: 'Item 1', amount: '₹ 1,000', description: 'Sample item' },
            { id: 2, name: 'Item 2', amount: '₹ 2,000', description: 'Sample item' },
          ],
          summary: { title: 'Total', amount: '₹ 3,000' }
        };
    }
  };

  const mockData = getMockData();
  const { tabs, data, summary } = mockData;

  const filteredData = activeTab === 'All' 
    ? data 
    : data.filter(item => {
        if (activeTab.includes('Debtors') || activeTab.includes('देनदार')) {
          return item.type === 'Debtor';
        }
        if (activeTab.includes('Creditors') || activeTab.includes('लेनदार')) {
          return item.type === 'Creditor';
        }
        return item.type === activeTab;
      });

  const renderListItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem}>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemAmount}>{item.amount}</Text>
        </View>
        
        {item.phone && (
          <Text style={globalStyles.textMuted}>{item.phone}</Text>
        )}
        
        {item.dueDate && (
          <Text style={globalStyles.textMuted}>Due: {item.dueDate}</Text>
        )}
        
        {item.description && (
          <Text style={globalStyles.textMuted}>{item.description}</Text>
        )}
        
        {item.type && (
          <View style={[
            styles.typeChip,
            item.type === 'Debtor' && styles.debtorChip,
            item.type === 'Creditor' && styles.creditorChip,
            item.type === 'Overdue' && styles.overdueChip,
          ]}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity style={styles.itemAction}>
        <Ionicons name="chevron-forward" size={20} color={colors.slate400} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryAmount}>{summary.amount}</Text>
          <Text style={styles.summaryTitle}>{summary.title}</Text>
        </View>

        {/* Tabs */}
        {tabs.length > 1 && (
          <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
            </ScrollView>
          </View>
        )}

        {/* List */}
        <View style={styles.listContainer}>
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderListItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={64} color={colors.slate600} />
                <Text style={styles.emptyText}>No items found</Text>
                <Text style={globalStyles.textMuted}>
                  {activeTab === 'All' ? 'Add some items to get started' : `No items in ${activeTab} category`}
                </Text>
              </View>
            )}
          />
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={() => {}}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate900,
  },
  summaryCard: {
    backgroundColor: colors.slate800,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate700,
    padding: 20,
    margin: 16,
    alignItems: 'center',
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 14,
    color: colors.slate400,
  },
  tabContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    backgroundColor: colors.slate800,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.slate700,
  },
  activeTab: {
    backgroundColor: colors.blue600,
    borderColor: colors.blue500,
  },
  tabText: {
    fontSize: 14,
    color: colors.slate400,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  listItem: {
    backgroundColor: colors.slate800,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate700,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
    flex: 1,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.green400,
  },
  typeChip: {
    backgroundColor: colors.slate600,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  debtorChip: {
    backgroundColor: colors.red600,
  },
  creditorChip: {
    backgroundColor: colors.blue600,
  },
  overdueChip: {
    backgroundColor: colors.orange600,
  },
  typeText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500',
  },
  itemAction: {
    marginLeft: 16,
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.slate400,
    marginTop: 16,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.blue600,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});