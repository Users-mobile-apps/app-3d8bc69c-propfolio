import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../lib/theme';
import { RENOVATION_CATEGORIES } from '../lib/data';

export default function AddRenovationModal({ visible, onClose, onSave, properties }) {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyId, setPropertyId] = useState(properties?.[0]?.id || '');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Other');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPropertyId(properties?.[0]?.id || '');
    setEstimatedCost('');
    setPriority('medium');
    setCategory('Other');
    setDueDate('');
    setNotes('');
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Missing Info', 'Please enter a renovation title.');
      return;
    }
    if (!propertyId) {
      Alert.alert('Missing Info', 'Please select a property.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const renovation = {
      id: Date.now().toString(),
      propertyId,
      title: title.trim(),
      description: description.trim(),
      estimatedCost: parseInt(estimatedCost.replace(/[^0-9]/g, '')) || 0,
      actualCost: null,
      priority,
      status: 'pending',
      category,
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: dueDate.trim() || null,
      notes: notes.trim(),
    };

    onSave(renovation);
    resetForm();
    onClose();
  };

  const isValid = title.trim() && propertyId;
  const priorities = [
    { key: 'low', label: 'Low', color: colors.success },
    { key: 'medium', label: 'Medium', color: colors.warning },
    { key: 'high', label: 'High', color: colors.danger },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onClose(); resetForm(); }}>
            <Text style={[styles.cancelBtn, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Add Renovation</Text>
          <TouchableOpacity onPress={handleSave} disabled={!isValid}>
            <Text style={[styles.saveBtn, { color: isValid ? colors.primary : colors.textTertiary }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>RENOVATION DETAILS</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={[styles.inputRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Title</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., Kitchen Remodel"
                placeholderTextColor={colors.textTertiary}
                value={title}
                onChangeText={setTitle}
                returnKeyType="next"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Brief description"
                placeholderTextColor={colors.textTertiary}
                value={description}
                onChangeText={setDescription}
                returnKeyType="next"
                multiline
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PROPERTY</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContainer}>
              {(properties || []).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPropertyId(p.id); }}
                  style={[styles.chip, {
                    backgroundColor: propertyId === p.id ? colors.primary : colors.surfaceSecondary,
                  }]}
                >
                  <Text style={[styles.chipText, { color: propertyId === p.id ? '#FFFFFF' : colors.textSecondary }]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PRIORITY</Text>
          <View style={styles.priorityRow}>
            {priorities.map((p) => (
              <TouchableOpacity
                key={p.key}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPriority(p.key); }}
                style={[styles.priorityChip, {
                  backgroundColor: priority === p.key ? p.color + '20' : colors.surfaceSecondary,
                  borderColor: priority === p.key ? p.color : 'transparent',
                  borderWidth: 1.5,
                }]}
              >
                <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                <Text style={[styles.priorityChipText, { color: priority === p.key ? p.color : colors.textSecondary }]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CATEGORY</Text>
          <View style={styles.categoryGrid}>
            {RENOVATION_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCategory(c); }}
                style={[styles.categoryChip, {
                  backgroundColor: category === c ? colors.primary : colors.surfaceSecondary,
                }]}
              >
                <Text style={[styles.categoryText, { color: category === c ? '#FFFFFF' : colors.textSecondary }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>FINANCIALS & SCHEDULE</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={[styles.inputRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Estimated Cost</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="$0"
                placeholderTextColor={colors.textTertiary}
                value={estimatedCost}
                onChangeText={setEstimatedCost}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Due Date</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textTertiary}
                value={dueDate}
                onChangeText={setDueDate}
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Notes</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Additional notes"
                placeholderTextColor={colors.textTertiary}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  cancelBtn: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveBtn: {
    fontSize: 16,
    fontWeight: '700',
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 8,
  },
  inputGroup: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    width: 120,
  },
  input: {
    flex: 1,
    fontSize: 15,
    textAlign: 'right',
  },
  chipScroll: {
    padding: 12,
  },
  chipContainer: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
