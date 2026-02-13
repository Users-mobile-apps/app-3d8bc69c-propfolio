import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity,
  Modal, Alert, Animated,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import { getProperties, getRenovations, saveProperties, formatCurrency } from '../../lib/data';
import PropertyCard from '../../components/PropertyCard';
import AddPropertyModal from '../../components/AddPropertyModal';
import EmptyState from '../../components/EmptyState';

export default function PropertiesScreen() {
  const { colors } = useTheme();
  const [properties, setProperties] = useState([]);
  const [renovations, setRenovations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const loadData = useCallback(async () => {
    const [props, renos] = await Promise.all([getProperties(), getRenovations()]);
    setProperties(props);
    setRenovations(renos);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddProperty = async (property) => {
    const updated = [...properties, property];
    setProperties(updated);
    await saveProperties(updated);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteProperty = (property) => {
    Alert.alert(
      'Delete Property',
      `Are you sure you want to remove "${property.name}" from your portfolio?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            const updated = properties.filter(p => p.id !== property.id);
            setProperties(updated);
            await saveProperties(updated);
            setSelectedProperty(null);
          },
        },
      ]
    );
  };

  const getRenovationsForProperty = (propertyId) => {
    return renovations.filter(r => r.propertyId === propertyId && r.status !== 'completed');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Properties</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} in portfolio
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAddModal(true);
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {properties.length === 0 ? (
          <EmptyState
            icon="home-work"
            title="No Properties Yet"
            subtitle="Start building your portfolio by adding your first property. Track values, cash flow, and renovation needs."
            actionLabel="Add Property"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          properties.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              index={index}
              renovationCount={getRenovationsForProperty(property.id).length}
              onPress={() => setSelectedProperty(property)}
            />
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <AddPropertyModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddProperty}
      />

      {/* Property Detail Modal */}
      <Modal visible={!!selectedProperty} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedProperty(null); }}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Property Details</Text>
            <TouchableOpacity onPress={() => selectedProperty && handleDeleteProperty(selectedProperty)}>
              <MaterialIcons name="delete-outline" size={24} color={colors.danger} />
            </TouchableOpacity>
          </View>

          {selectedProperty && (
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={[styles.detailName, { color: colors.text }]}>{selectedProperty.name}</Text>
              <Text style={[styles.detailAddress, { color: colors.textSecondary }]}>{selectedProperty.address}</Text>

              <View style={[styles.detailBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.detailBadgeText, { color: colors.primary }]}>{selectedProperty.type}</Text>
              </View>

              <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <Text style={[styles.detailSectionTitle, { color: colors.textSecondary }]}>VALUATION</Text>
                <DetailRow label="Purchase Price" value={formatCurrency(selectedProperty.purchasePrice)} colors={colors} />
                <DetailRow label="Current Value" value={formatCurrency(selectedProperty.currentValue)} colors={colors} highlight />
                <DetailRow
                  label="Equity Gained"
                  value={formatCurrency(selectedProperty.currentValue - selectedProperty.purchasePrice)}
                  colors={colors}
                  valueColor={colors.success}
                />
              </View>

              <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <Text style={[styles.detailSectionTitle, { color: colors.textSecondary }]}>MONTHLY CASH FLOW</Text>
                <DetailRow label="Rental Income" value={formatCurrency(selectedProperty.monthlyRent)} colors={colors} valueColor={colors.success} />
                <DetailRow label="Expenses" value={formatCurrency(selectedProperty.monthlyExpenses)} colors={colors} valueColor={colors.danger} />
                <DetailRow
                  label="Net Cash Flow"
                  value={formatCurrency(selectedProperty.monthlyRent - selectedProperty.monthlyExpenses)}
                  colors={colors}
                  highlight
                  valueColor={(selectedProperty.monthlyRent - selectedProperty.monthlyExpenses) >= 0 ? colors.success : colors.danger}
                />
              </View>

              <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <Text style={[styles.detailSectionTitle, { color: colors.textSecondary }]}>PROPERTY INFO</Text>
                <DetailRow label="Year Purchased" value={selectedProperty.yearPurchased?.toString() || 'N/A'} colors={colors} />
                <DetailRow label="Square Footage" value={selectedProperty.sqft ? `${selectedProperty.sqft.toLocaleString()} sqft` : 'N/A'} colors={colors} />
                <DetailRow label="Units" value={selectedProperty.units?.toString() || '1'} colors={colors} />
              </View>

              {/* Renovations for this property */}
              {getRenovationsForProperty(selectedProperty.id).length > 0 && (
                <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                  <Text style={[styles.detailSectionTitle, { color: colors.textSecondary }]}>ACTIVE RENOVATIONS</Text>
                  {getRenovationsForProperty(selectedProperty.id).map((reno) => (
                    <View key={reno.id} style={[styles.renoRow, { borderBottomColor: colors.borderLight }]}>
                      <View style={[styles.renoPriorityDot, { backgroundColor: reno.priority === 'high' ? colors.danger : reno.priority === 'medium' ? colors.warning : colors.success }]} />
                      <View style={styles.renoInfo}>
                        <Text style={[styles.renoTitle, { color: colors.text }]}>{reno.title}</Text>
                        <Text style={[styles.renoMeta, { color: colors.textSecondary }]}>
                          {formatCurrency(reno.estimatedCost)} · {reno.category}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, colors, highlight, valueColor }) {
  return (
    <View style={[detailStyles.row, { borderBottomColor: colors.borderLight }]}>
      <Text style={[detailStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[detailStyles.value, {
        color: valueColor || colors.text,
        fontWeight: highlight ? '700' : '600',
      }]}>
        {value}
      </Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalContent: {
    padding: 20,
  },
  detailName: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  detailAddress: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 12,
  },
  detailBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
  },
  detailBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailSection: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  renoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  renoPriorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  renoInfo: {
    flex: 1,
  },
  renoTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  renoMeta: {
    fontSize: 12,
    marginTop: 2,
  },
});
