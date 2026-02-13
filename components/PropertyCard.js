import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../lib/theme';
import { formatCurrency, getPropertyColor } from '../lib/data';

export default function PropertyCard({ property, index, onPress, renovationCount }) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const propertyColor = getPropertyColor(index);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress();
  };

  const equity = property.currentValue - property.purchasePrice;
  const equityPercent = ((equity / property.purchasePrice) * 100).toFixed(1);
  const monthlyCashflow = property.monthlyRent - property.monthlyExpenses;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, {
          backgroundColor: colors.card,
          shadowColor: colors.shadow,
          borderColor: colors.borderLight,
        }]}
      >
        <View style={styles.header}>
          <View style={[styles.colorBar, { backgroundColor: propertyColor }]} />
          <View style={styles.headerInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{property.name}</Text>
            <Text style={[styles.address, { color: colors.textSecondary }]}>{property.address}</Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: propertyColor + '15' }]}>
            <Text style={[styles.typeText, { color: propertyColor }]}>{property.type}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Value</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(property.currentValue)}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cashflow</Text>
            <Text style={[styles.statValue, { color: monthlyCashflow >= 0 ? colors.success : colors.danger }]}>
              {formatCurrency(monthlyCashflow)}/mo
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Equity</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>+{equityPercent}%</Text>
          </View>
        </View>

        {renovationCount > 0 && (
          <View style={[styles.renovationBanner, { backgroundColor: colors.warningLight }]}>
            <MaterialIcons name="build" size={14} color={colors.warning} />
            <Text style={[styles.renovationText, { color: colors.warning }]}>
              {renovationCount} renovation{renovationCount > 1 ? 's' : ''} needed
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  colorBar: {
    width: 4,
    height: 44,
    borderRadius: 2,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  address: {
    fontSize: 13,
    fontWeight: '400',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  renovationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  renovationText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
