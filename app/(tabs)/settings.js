import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import { clearAllData, resetOnboarding } from '../../lib/data';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all your properties and renovations. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Done', 'All data has been cleared. Restart the app to see changes.');
          },
        },
      ]
    );
  };

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Done', 'Onboarding has been reset. Restart the app to see the welcome screens again.');
  };

  const sections = [
    {
      title: 'PREFERENCES',
      items: [
        {
          icon: 'notifications',
          label: 'Push Notifications',
          subtitle: 'Get alerts for renovation deadlines',
          type: 'switch',
          value: notificationsEnabled,
          onToggle: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setNotificationsEnabled(!notificationsEnabled);
          },
        },
        {
          icon: 'vibration',
          label: 'Haptic Feedback',
          subtitle: 'Tactile feedback on interactions',
          type: 'switch',
          value: hapticEnabled,
          onToggle: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setHapticEnabled(!hapticEnabled);
          },
        },
        {
          icon: isDark ? 'dark-mode' : 'light-mode',
          label: 'Appearance',
          subtitle: isDark ? 'Dark mode (follows system)' : 'Light mode (follows system)',
          type: 'info',
        },
      ],
    },
    {
      title: 'DATA',
      items: [
        {
          icon: 'replay',
          label: 'Reset Onboarding',
          subtitle: 'See the welcome screens again',
          type: 'action',
          onPress: handleResetOnboarding,
        },
        {
          icon: 'delete-sweep',
          label: 'Clear All Data',
          subtitle: 'Remove all properties and renovations',
          type: 'destructive',
          onPress: handleClearData,
        },
      ],
    },
    {
      title: 'ABOUT',
      items: [
        {
          icon: 'info',
          label: 'Version',
          subtitle: '1.0.0',
          type: 'info',
        },
        {
          icon: 'code',
          label: 'Built with',
          subtitle: 'React Native + Expo',
          type: 'info',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>

        {sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity
                  key={iIdx}
                  style={[styles.row, {
                    borderBottomColor: colors.borderLight,
                    borderBottomWidth: iIdx < section.items.length - 1 ? 0.5 : 0,
                  }]}
                  activeOpacity={item.type === 'switch' || item.type === 'info' ? 1 : 0.7}
                  onPress={() => {
                    if (item.onPress) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      item.onPress();
                    }
                  }}
                  disabled={item.type === 'info'}
                >
                  <View style={[styles.iconCircle, {
                    backgroundColor: item.type === 'destructive' ? colors.dangerLight : colors.primaryLight,
                  }]}>
                    <MaterialIcons
                      name={item.icon}
                      size={20}
                      color={item.type === 'destructive' ? colors.danger : colors.primary}
                    />
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowLabel, {
                      color: item.type === 'destructive' ? colors.danger : colors.text,
                    }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                  </View>
                  {item.type === 'switch' && (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.borderLight, true: colors.primary + '60' }}
                      thumbColor={item.value ? colors.primary : colors.textTertiary}
                    />
                  )}
                  {(item.type === 'action' || item.type === 'destructive') && (
                    <MaterialIcons name="chevron-right" size={22} color={colors.textTertiary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={[styles.footer, { color: colors.textTertiary }]}>
          PropFolio v1.0.0{'\n'}Real Estate Portfolio Manager
        </Text>

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
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 8,
  },
});
