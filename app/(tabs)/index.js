import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';
import { getProperties, getRenovations, formatCurrency, formatCurrencyShort } from '../../lib/data';
import StatCard from '../../components/StatCard';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
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

  // Calculations
  const totalValue = properties.reduce((sum, p) => sum + (p.currentValue || 0), 0);
  const totalEquity = properties.reduce((sum, p) => sum + ((p.currentValue || 0) - (p.purchasePrice || 0)), 0);
  const monthlyCashflow = properties.reduce((sum, p) => sum + ((p.monthlyRent || 0) - (p.monthlyExpenses || 0)), 0);
  const annualCashflow = monthlyCashflow * 12;
  const totalInvested = properties.reduce((sum, p) => sum + (p.purchasePrice || 0), 0);
  const avgROI = totalInvested > 0 ? ((totalEquity / totalInvested) * 100).toFixed(1) : '0.0';

  const pendingRenos = renovations.filter(r => r.status === 'pending');
  const inProgressRenos = renovations.filter(r => r.status === 'in_progress');
  const totalRenoEstimate = renovations
    .filter(r => r.status !== 'completed')
    .reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
  const highPriorityCount = renovations.filter(r => r.priority === 'high' && r.status !== 'completed').length;

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Portfolio Overview</Text>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: colors.primaryLight }]}>
            <MaterialIcons name="home-work" size={20} color={colors.primary} />
            <Text style={[styles.headerBadgeText, { color: colors.primary }]}>{properties.length}</Text>
          </View>
        </View>

        {/* Portfolio Value Hero */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>Total Portfolio Value</Text>
            <View style={[styles.roiBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <MaterialIcons name="trending-up" size={14} color="#FFFFFF" />
              <Text style={styles.roiText}>+{avgROI}% ROI</Text>
            </View>
          </View>
          <Text style={styles.heroValue}>{formatCurrency(totalValue)}</Text>
          <View style={styles.heroBottom}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Equity Gained</Text>
              <Text style={styles.heroStatValue}>{formatCurrency(totalEquity)}</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Total Invested</Text>
              <Text style={styles.heroStatValue}>{formatCurrency(totalInvested)}</Text>
            </View>
          </View>
        </View>

        {/* Cash Flow Stats */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Cash Flow</Text>
        <View style={styles.statsRow}>
          <StatCard
            icon="account-balance-wallet"
            label="Monthly"
            value={formatCurrency(monthlyCashflow)}
            subtitle={monthlyCashflow >= 0 ? 'Positive' : 'Negative'}
            color={monthlyCashflow >= 0 ? colors.success : colors.danger}
          />
          <View style={{ width: 12 }} />
          <StatCard
            icon="trending-up"
            label="Annual"
            value={formatCurrencyShort(annualCashflow)}
            subtitle="Projected"
            color={colors.primary}
          />
        </View>

        {/* Renovation Summary */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Renovation Status</Text>
        <View style={styles.statsRow}>
          <StatCard
            icon="build"
            label="Pending"
            value={pendingRenos.length.toString()}
            subtitle={`${inProgressRenos.length} in progress`}
            color={colors.warning}
          />
          <View style={{ width: 12 }} />
          <StatCard
            icon="attach-money"
            label="Reno Budget"
            value={formatCurrencyShort(totalRenoEstimate)}
            subtitle={`${highPriorityCount} high priority`}
            color={colors.danger}
          />
        </View>

        {/* Active Renovations Preview */}
        {(inProgressRenos.length > 0 || highPriorityCount > 0) && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Needs Attention</Text>
            {[...inProgressRenos, ...renovations.filter(r => r.priority === 'high' && r.status === 'pending')]
              .slice(0, 3)
              .map((reno) => {
                const property = properties.find(p => p.id === reno.propertyId);
                return (
                  <View
                    key={reno.id}
                    style={[styles.alertCard, {
                      backgroundColor: colors.card,
                      borderColor: colors.borderLight,
                    }]}
                  >
                    <View style={[styles.alertIcon, {
                      backgroundColor: reno.status === 'in_progress' ? colors.warningLight : colors.dangerLight,
                    }]}>
                      <MaterialIcons
                        name={reno.status === 'in_progress' ? 'engineering' : 'priority-high'}
                        size={18}
                        color={reno.status === 'in_progress' ? colors.warning : colors.danger}
                      />
                    </View>
                    <View style={styles.alertContent}>
                      <Text style={[styles.alertTitle, { color: colors.text }]} numberOfLines={1}>
                        {reno.title}
                      </Text>
                      <Text style={[styles.alertSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                        {property?.name || 'Unknown Property'} · {formatCurrency(reno.estimatedCost)}
                      </Text>
                    </View>
                    <View style={[styles.alertStatus, {
                      backgroundColor: reno.status === 'in_progress' ? colors.warningLight : colors.dangerLight,
                    }]}>
                      <Text style={[styles.alertStatusText, {
                        color: reno.status === 'in_progress' ? colors.warning : colors.danger,
                      }]}>
                        {reno.status === 'in_progress' ? 'Active' : 'Urgent'}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </>
        )}

        {/* Property breakdown mini cards */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Property Breakdown</Text>
        {properties.map((prop, idx) => {
          const cashflow = (prop.monthlyRent || 0) - (prop.monthlyExpenses || 0);
          const renos = renovations.filter(r => r.propertyId === prop.id && r.status !== 'completed').length;
          return (
            <View
              key={prop.id}
              style={[styles.propRow, {
                backgroundColor: colors.card,
                borderColor: colors.borderLight,
              }]}
            >
              <View style={[styles.propDot, { backgroundColor: ['#1B6B4A', '#D4A853', '#4A90D9', '#E54545', '#8B5CF6'][idx % 5] }]} />
              <View style={styles.propInfo}>
                <Text style={[styles.propName, { color: colors.text }]} numberOfLines={1}>{prop.name}</Text>
                <Text style={[styles.propMeta, { color: colors.textSecondary }]}>
                  {formatCurrencyShort(prop.currentValue)} · {formatCurrency(cashflow)}/mo
                </Text>
              </View>
              {renos > 0 && (
                <View style={[styles.renoBadge, { backgroundColor: colors.warningLight }]}>
                  <MaterialIcons name="build" size={12} color={colors.warning} />
                  <Text style={[styles.renoBadgeText, { color: colors.warning }]}>{renos}</Text>
                </View>
              )}
            </View>
          );
        })}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  headerBadgeText: {
    fontSize: 16,
    fontWeight: '800',
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#1B6B4A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '600',
  },
  roiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  roiText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 16,
  },
  heroBottom: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 16,
  },
  heroStat: {
    flex: 1,
  },
  heroStatDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  alertSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  alertStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  alertStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  propRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  propDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  propInfo: {
    flex: 1,
  },
  propName: {
    fontSize: 15,
    fontWeight: '600',
  },
  propMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  renoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  renoBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
