import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../lib/theme';
import { formatCurrencyShort } from '../lib/data';

export default function MiniBarChart({ data, title }) {
  const { colors } = useTheme();
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
      <View style={styles.chartArea}>
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          return (
            <View key={index} style={styles.barColumn}>
              <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                {formatCurrencyShort(item.value)}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[styles.bar, {
                    height: `${Math.max(height, 5)}%`,
                    backgroundColor: item.color || colors.primary,
                    borderRadius: 4,
                  }]}
                />
              </View>
              <Text style={[styles.barLabel, { color: colors.textTertiary }]}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  barTrack: {
    flex: 1,
    width: 28,
    justifyContent: 'flex-end',
    borderRadius: 4,
  },
  bar: {
    width: '100%',
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
  },
});
