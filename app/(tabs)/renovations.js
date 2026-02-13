import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity,
  Modal, Alert, TextInput,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import {
  getProperties, getRenovations, saveRenovations,
  formatCurrency, getPriorityColor, getStatusInfo,
} from '../../lib/data';
import RenovationCard from '../../components/RenovationCard';
import AddRenovationModal from '../../components/AddRenovationModal';
import EmptyState from '../../components/EmptyState';

export default function RenovationsScreen() {
  const { colors } = useTheme();
  const [properties, setProperties] = useState([]);
  const [renovations, setRenovations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReno, setSelectedReno] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, in_progress, completed, high

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

  const handleAddRenovation = async (renovation) => {
    const updated = [...renovations, renovation];
    setRenovations(updated);
    await saveRenovations(updated);
  };

  const handleStatusChange = async (renoId, newStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = renovations.map(r =>
      r.id === renoId ? { ...r, status: newStatus } : r
    );
    setRenovations(updated);
    await saveRenovations(updated);

    if (newStatus === 'completed') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDeleteRenovation = (reno) => {
    Alert.alert(
      'Delete Renovation',
      `Remove "${reno.title}" from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            const updated = renovations.filter(r => r.id !== reno.id);
            setRenovations(updated);
            await saveRenovations(updated);
            setSelectedReno(null);
          },
        },
      ]
    );
  };

  const getFilteredRenovations = () => {
    switch (filter) {
      case 'pending': return renovations.filter(r => r.status === 'pending');
      case 'in_progress': return renovations.filter(r => r.status === 'in_progress');
      case 'completed': return renovations.filter(r => r.status === 'completed');
      case 'high': return renovations.filter(r => r.priority === 'high' && r.status !== 'completed');
      default: return renovations;
    }
  };

  const filteredRenovations = getFilteredRenovations();
  const filters = [
    { key: 'all', label: 'All', count: renovations.length },
    { key: 'pending', label: 'Pending', count: renovations.filter(r => r.status === 'pending').length },
    { key: 'in_progress', label: 'Active', count: renovations.filter(r => r.status === 'in_progress').length },
    { key: 'high', label: 'Urgent', count: renovations.filter(r => r.priority === 'high' && r.status !== 'completed').length },
    { key: 'completed', label: 'Done', count: renovations.filter(r => r.status === 'completed').length },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Renovations</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {renovations.filter(r => r.status !== 'completed').length} active projects
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

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        style={[styles.filterScroll, { borderBottomColor: colors.borderLight }]}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilter(f.key);
            }}
            style={[styles.filterChip, {
              backgroundColor: filter === f.key ? colors.primary : colors.surfaceSecondary,
            }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, {
              color: filter === f.key ? '#FFFFFF' : colors.textSecondary,
            }]}>
              {f.label}
            </Text>
            <View style={[styles.filterCount, {
              backgroundColor: filter === f.key ? 'rgba(255,255,255,0.25)' : colors.borderLight,
            }]}>
              <Text style={[styles.filterCountText, {
                color: filter === f.key ? '#FFFFFF' : colors.textTertiary,
              }]}>
                {f.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {filteredRenovations.length === 0 ? (
          <EmptyState
            icon="build"
            title={filter === 'all' ? 'No Renovations' : `No ${filters.find(f => f.key === filter)?.label} Items`}
            subtitle={filter === 'all'
              ? 'Track renovation needs for your properties. Add your first renovation project.'
              : 'No renovations match this filter.'
            }
            actionLabel={filter === 'all' ? 'Add Renovation' : undefined}
            onAction={filter === 'all' ? () => setShowAddModal(true) : undefined}
          />
        ) : (
          filteredRenovations.map((reno) => {
            const property = properties.find(p => p.id === reno.propertyId);
            return (
              <RenovationCard
                key={reno.id}
                renovation={reno}
                propertyName={property?.name}
                onPress={() => setSelectedReno(reno)}
              />
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <AddRenovationModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddRenovation}
        properties={properties}
      />

      {/* Renovation Detail Modal */}
      <Modal visible={!!selectedReno} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedReno(null); }}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Renovation Details</Text>
            <TouchableOpacity onPress={() => selectedReno && handleDeleteRenovation(selectedReno)}>
              <MaterialIcons name="delete-outline" size={24} color={colors.danger} />
            </TouchableOpacity>
          </View>

          {selectedReno && (
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedReno.title}</Text>
              <Text style={[styles.detailDesc, { color: colors.textSecondary }]}>{selectedReno.description}</Text>

              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: getStatusInfo(selectedReno.status, colors).bg }]}>
                  <Text style={[styles.badgeText, { color: getStatusInfo(selectedReno.status, colors).color }]}>
                    {getStatusInfo(selectedReno.status, colors).label}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getPriorityColor(selectedReno.priority, colors) + '15' }]}>
                  <View style={[styles.priDot, { backgroundColor: getPriorityColor(selectedReno.priority, colors) }]} />
                  <Text style={[styles.badgeText, { color: getPriorityColor(selectedReno.priority, colors) }]}>
                    {selectedReno.priority.charAt(0).toUpperCase() + selectedReno.priority.slice(1)} Priority
                  </Text>
                </View>
              </View>

              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>UPDATE STATUS</Text>
              <View style={styles.statusButtons}>
                {[
                  { key: 'pending', label: 'Pending', icon: 'schedule' },
                  { key: 'in_progress', label: 'In Progress', icon: 'engineering' },
                  { key: 'completed', label: 'Completed', icon: 'check-circle' },
                ].map((s) => {
                  const info = getStatusInfo(s.key, colors);
                  const isActive = selectedReno.status === s.key;
                  return (
                    <TouchableOpacity
                      key={s.key}
                      onPress={() => {
                        handleStatusChange(selectedReno.id, s.key);
                        setSelectedReno({ ...selectedReno, status: s.key });
                      }}
                      style={[styles.statusBtn, {
                        backgroundColor: isActive ? info.color + '15' : colors.surfaceSecondary,
                        borderColor: isActive ? info.color : 'transparent',
                        borderWidth: 1.5,
                      }]}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name={s.icon} size={18} color={isActive ? info.color : colors.textSecondary} />
                      <Text style={[styles.statusBtnText, { color: isActive ? info.color : colors.textSecondary }]}>
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[styles.infoSection, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <InfoRow label="Category" value={selectedReno.category} colors={colors} />
                <InfoRow label="Estimated Cost" value={formatCurrency(selectedReno.estimatedCost)} colors={colors} />
                {selectedReno.actualCost != null && (
                  <InfoRow label="Actual Cost" value={formatCurrency(selectedReno.actualCost)} colors={colors} />
                )}
                <InfoRow label="Property" value={properties.find(p => p.id === selectedReno.propertyId)?.name || 'Unknown'} colors={colors} />
                <InfoRow label="Created" value={selectedReno.createdAt} colors={colors} />
                {selectedReno.dueDate && <InfoRow label="Due Date" value={selectedReno.dueDate} colors={colors} />}
              </View>

              {selectedReno.notes ? (
                <View style={[styles.notesSection, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: 8 }]}>NOTES</Text>
                  <Text style={[styles.notesText, { color: colors.text }]}>{selectedReno.notes}</Text>
                </View>
              ) : null}

              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, colors }) {
  return (
    <View style={[infoStyles.row, { borderBottomColor: colors.borderLight }]}>
      <Text style={[infoStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
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
  filterScroll: {
    borderBottomWidth: 0.5,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    marginRight: 4,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 22,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '700',
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
  detailTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  detailDesc: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  priDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoSection: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
    marginBottom: 16,
  },
  notesSection: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
