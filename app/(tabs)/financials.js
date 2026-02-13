import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../lib/theme';
import {
  getProperties, getRenovations, formatCurrency, formatCurrencyShort, getPropertyColor,
} from '../../lib/data';
import StatCard from '../../components/StatCard';
import MiniBarChart from '../../components/MiniBarChart';

const { width } = Dimensions.get('window');

export default function FinancialsScreen() {
  const { colors } = useTheme();
  const [properties, setProperties] = useState([]);
  const [renovations, setRenovations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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

  // Portfolio calculations
  const totalValue = properties.reduce((s, p) => s + (p.currentValue || 0), 0);
  const totalInvested = properties.reduce((s, p) => s + (p.purchasePrice || 0), 0);
  const totalEquity = totalValue - totalInvested;
  const monthlyIncome = properties.reduce((s, p) => s + (p.monthlyRent || 0), 0);
  const monthlyExpenses = properties.reduce((s, p) => s + (p.monthlyExpenses || 0), 0);
  const monthlyCashflow = monthlyIncome - monthlyExpenses;
  const annualIncome = monthlyIncome * 12;
  const annualExpenses = monthlyExpenses * 12;
  const annualCashflow = monthlyCashflow * 12;
  const capRate = totalValue > 0 ? ((annualCashflow / totalValue) * 100).toFixed(2) : '0.00';
  const cashOnCash = totalInvested > 0 ? ((annualCashflow / totalInvested) * 100).toFixed(2) : '0.00';

  // Renovation finances
  const completedRenos = renovations.filter(r => r.status === 'completed');
  const activeRenos = renovations.filter(r => r.status !== 'completed');
  const totalRenoSpent = completedRenos.reduce((s, r) => s + (r.actualCost || r.estimatedCost || 0), 0);
  const totalRenoBudget = activeRenos.reduce((s, r) => s + (r.estimatedCost || 0), 0);

  // Per-property cashflow chart data
  const cashflowData = properties.map((p, i) => ({
    label: p.name.split(' ')[0],
    value: (p.monthlyRent || 0) - (p.monthlyExpenses || 0),
    color: getPropertyColor(i),
  }));

  // Per-property value chart data
  const valueData = properties.map((p, i) => ({
    label: p.name.split(' ')[0],
    value: p.currentValue || 0,
    color: getPropertyColor(i),
  }));

  // Renovation budget by category
  const categoryBudgets = {};
  activeRenos.forEach(r => {
    if (!categoryBudgets[r.category]) categoryBudgets[r.category] = 0;
    categoryBudgets[r.category] += r.estimatedCost || 0;
  });
  const renoChartData = Object.entries(categoryBudgets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map((entry, i) => ({
      label: entry[0].substring(0, 5),
      value: entry[1],
      color: ['#E54545', '#F5A623', '#4A90D9', '#8B5CF6', '#1B6B4A'][i % 5],
    }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Financials</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Portfolio performance & renovation budgets
        </Text>

        {/* Key Metrics */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Metrics</Text>
        <View style={styles.statsRow}>
          <StatCard icon="show-chart" label="Cap Rate" value={`${capRate}%`} color={colors.primary} />
          <View style={{ width: 12 }} />
          <StatCard icon="percent" label="Cash-on-Cash" value={`${cashOnCash}%`} color={colors.accent} />
        </View>

        {/* Income vs Expenses */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Breakdown</Text>
        <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Income</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: colors.success }]}>{formatCurrency(monthlyIncome)}</Text>
          </View>
          <View style={[styles.breakdownDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: colors.danger }]} />
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Expenses</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: colors.danger }]}>{formatCurrency(monthlyExpenses)}</Text>
          </View>
          <View style={[styles.breakdownDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.breakdownLabel, { color: colors.text, fontWeight: '700' }]}>Net Cash Flow</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: monthlyCashflow >= 0 ? colors.success : colors.danger, fontWeight: '800' }]}>
              {formatCurrency(monthlyCashflow)}
            </Text>
          </View>

          {/* Visual bar showing income vs expenses */}
          <View style={styles.barContainer}>
            <View style={[styles.barBg, { backgroundColor: colors.surfaceSecondary }]}>
              <View style={[styles.barFill, {
                backgroundColor: colors.success,
                width: monthlyIncome > 0 ? '100%' : '0%',
              }]} />
            </View>
            <View style={[styles.barBg, { backgroundColor: colors.surfaceSecondary, marginTop: 6 }]}>
              <View style={[styles.barFill, {
                backgroundColor: colors.danger,
                width: monthlyIncome > 0 ? `${(monthlyExpenses / monthlyIncome) * 100}%` : '0%',
              }]} />
            </View>
          </View>
        </View>

        {/* Annual Summary */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Annual Summary</Text>
        <View style={styles.statsRow}>
          <StatCard icon="monetization-on" label="Revenue" value={formatCurrencyShort(annualIncome)} color={colors.success} />
          <View style={{ width: 12 }} />
          <StatCard icon="receipt" label="Expenses" value={formatCurrencyShort(annualExpenses)} color={colors.danger} />
        </View>
        <View style={styles.statsRow}>
          <StatCard icon="savings" label="Net Profit" value={formatCurrencyShort(annualCashflow)} color={annualCashflow >= 0 ? colors.success : colors.danger} />
          <View style={{ width: 12 }} />
          <StatCard icon="real-estate-agent" label="Equity" value={formatCurrencyShort(totalEquity)} subtitle={`${((totalEquity / Math.max(totalInvested, 1)) * 100).toFixed(1)}% gain`} color={colors.primary} />
        </View>

        {/* Property Cash Flow Comparison */}
        {cashflowData.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Cash Flow by Property</Text>
            <MiniBarChart data={cashflowData} />
          </>
        )}

        {/* Property Value Comparison */}
        {valueData.length > 0 && (
          <>
            <View style={{ height: 16 }} />
            <MiniBarChart data={valueData} title="Property Values" />
          </>
        )}

        {/* Renovation Budget */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Renovation Budget</Text>
        <View style={[styles.renoSummary, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.renoSummaryRow}>
            <View>
              <Text style={[styles.renoLabel, { color: colors.textSecondary }]}>Spent (Completed)</Text>
              <Text style={[styles.renoValue, { color: colors.text }]}>{formatCurrency(totalRenoSpent)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.renoLabel, { color: colors.textSecondary }]}>Remaining Budget</Text>
              <Text style={[styles.renoValue, { color: colors.warning }]}>{formatCurrency(totalRenoBudget)}</Text>
            </View>
          </View>
          <View style={[styles.budgetBar, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={[styles.budgetFill, {
              backgroundColor: colors.success,
              width: (totalRenoSpent + totalRenoBudget) > 0
                ? `${(totalRenoSpent / (totalRenoSpent + totalRenoBudget)) * 100}%`
                : '0%',
            }]} />
          </View>
          <View style={styles.budgetLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Completed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.surfaceSecondary }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Remaining</Text>
            </View>
          </View>
        </View>

        {/* Renovation by Category */}
        {renoChartData.length > 0 && (
          <>
            <View style={{ height: 16 }} />
            <MiniBarChart data={renoChartData} title="Budget by Category" />
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    paddingTop: 16,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  breakdownCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  breakdownDivider: {
    height: 1,
  },
  barContainer: {
    marginTop: 12,
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  renoSummary: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 4,
  },
  renoSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  renoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  renoValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  budgetBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  budgetFill: {
    height: '100%',
    borderRadius: 5,
  },
  budgetLegend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
