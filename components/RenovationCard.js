import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../lib/theme';
import { formatCurrency, getPriorityColor, getStatusInfo } from '../lib/data';

export default function RenovationCard({ renovation, propertyName, onPress, onStatusChange }) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const statusInfo = getStatusInfo(renovation.status, colors);
  const priorityColor = getPriorityColor(renovation.priority, colors);

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

  const getCategoryIcon = (category) => {
    const icons = {
      Kitchen: 'kitchen',
      Bathroom: 'bathtub',
      Exterior: 'roofing',
      Interior: 'format-paint',
      HVAC: 'ac-unit',
      Plumbing: 'plumbing',
      Electrical: 'electrical-services',
      Flooring: 'grid-on',
      Landscaping: 'grass',
      Other: 'build',
    };
    return icons[category] || 'build';
  };

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
        <View style={styles.topRow}>
          <View style={[styles.iconContainer, { backgroundColor: priorityColor + '15' }]}>
            <MaterialIcons name={getCategoryIcon(renovation.category)} size={20} color={priorityColor} />
          </View>
          <View style={styles.titleArea}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {renovation.title}
            </Text>
            {propertyName && (
              <Text style={[styles.property, { color: colors.textSecondary }]} numberOfLines={1}>
                {propertyName}
              </Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {renovation.description}
        </Text>

        <View style={[styles.bottomRow, { borderTopColor: colors.borderLight }]}>
          <View style={styles.costInfo}>
            <MaterialIcons name="attach-money" size={16} color={colors.textSecondary} />
            <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Est: </Text>
            <Text style={[styles.costValue, { color: colors.text }]}>
              {formatCurrency(renovation.estimatedCost)}
            </Text>
            {renovation.actualCost != null && (
              <>
                <Text style={[styles.costLabel, { color: colors.textSecondary }]}>  Actual: </Text>
                <Text style={[styles.costValue, { color: renovation.actualCost <= renovation.estimatedCost ? colors.success : colors.danger }]}>
                  {formatCurrency(renovation.actualCost)}
                </Text>
              </>
            )}
          </View>
          <View style={styles.priorityRow}>
            <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {renovation.priority.charAt(0).toUpperCase() + renovation.priority.slice(1)}
            </Text>
          </View>
        </View>

        {renovation.dueDate && (
          <View style={styles.dueDateRow}>
            <MaterialIcons name="event" size={14} color={colors.textTertiary} />
            <Text style={[styles.dueDate, { color: colors.textTertiary }]}>
              Due: {renovation.dueDate}
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
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  property: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  costInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  costValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  dueDate: {
    fontSize: 12,
    fontWeight: '500',
  },
});
