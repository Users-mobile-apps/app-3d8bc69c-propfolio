import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../lib/theme';
import { PROPERTY_TYPES } from '../lib/data';

export default function AddPropertyModal({ visible, onClose, onSave }) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('Single Family');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [sqft, setSqft] = useState('');
  const [units, setUnits] = useState('1');

  const resetForm = () => {
    setName('');
    setAddress('');
    setType('Single Family');
    setPurchasePrice('');
    setCurrentValue('');
    setMonthlyRent('');
    setMonthlyExpenses('');
    setSqft('');
    setUnits('1');
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Missing Info', 'Please enter a property name.');
      return;
    }
    if (!purchasePrice.trim()) {
      Alert.alert('Missing Info', 'Please enter the purchase price.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const property = {
      id: Date.now().toString(),
      name: name.trim(),
      address: address.trim(),
      type,
      purchasePrice: parseInt(purchasePrice.replace(/[^0-9]/g, '')) || 0,
      currentValue: parseInt(currentValue.replace(/[^0-9]/g, '')) || parseInt(purchasePrice.replace(/[^0-9]/g, '')) || 0,
      monthlyRent: parseInt(monthlyRent.replace(/[^0-9]/g, '')) || 0,
      monthlyExpenses: parseInt(monthlyExpenses.replace(/[^0-9]/g, '')) || 0,
      sqft: parseInt(sqft.replace(/[^0-9]/g, '')) || 0,
      units: parseInt(units) || 1,
      yearPurchased: new Date().getFullYear(),
    };

    onSave(property);
    resetForm();
    onClose();
  };

  const isValid = name.trim() && purchasePrice.trim();

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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Add Property</Text>
          <TouchableOpacity onPress={handleSave} disabled={!isValid}>
            <Text style={[styles.saveBtn, { color: isValid ? colors.primary : colors.textTertiary }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PROPERTY DETAILS</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={[styles.inputRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Name</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., Maple Street Duplex"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
            </View>
            <View style={[styles.inputRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Address</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Full address"
                placeholderTextColor={colors.textTertiary}
                value={address}
                onChangeText={setAddress}
                returnKeyType="next"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                {PROPERTY_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setType(t); }}
                    style={[styles.typeChip, {
                      backgroundColor: type === t ? colors.primary : colors.surfaceSecondary,
                    }]}
                  >
                    <Text style={[styles.typeChipText, { color: type === t ? '#FFFFFF' : colors.textSecondary }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>FINANCIALS</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={[styles.inputRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Purchase Price</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="$0"
                placeholderTextColor={colors.textTertiary}
                value={purchasePrice}
                onChangeText={setPurchasePrice}
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>
            <View style={[styles.inputRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Current Value</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="$0"
                placeholderTextColor={colors.textTertiary}
                value={currentValue}
                onChangeText={setCurrentValue}
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>
            <View style={[styles.inputRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Monthly Rent</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="$0"
                placeholderTextColor={colors.textTertiary}
                value={monthlyRent}
                onChangeText={setMonthlyRent}
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Monthly Expenses</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="$0"
                placeholderTextColor={colors.textTertiary}
                value={monthlyExpenses}
                onChangeText={setMonthlyExpenses}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ADDITIONAL INFO</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={[styles.inputRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Sq Ft</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                value={sqft}
                onChangeText={setSqft}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Units</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="1"
                placeholderTextColor={colors.textTertiary}
                value={units}
                onChangeText={setUnits}
                keyboardType="numeric"
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
    width: 130,
  },
  input: {
    flex: 1,
    fontSize: 15,
    textAlign: 'right',
  },
  typeScroll: {
    flex: 1,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
