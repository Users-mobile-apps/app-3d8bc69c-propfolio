import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../lib/theme';
import { setOnboarded } from '../lib/data';

const { width } = Dimensions.get('window');

const pages = [
  {
    icon: 'account-balance',
    title: 'Your Portfolio,\nAt a Glance',
    description: 'Track all your real estate investments in one beautiful dashboard. See property values, cash flow, and equity growth instantly.',
    gradient: '#1B6B4A',
  },
  {
    icon: 'build-circle',
    title: 'Renovation\nTracker',
    description: 'Stay on top of every renovation project. Set priorities, track budgets, and never miss a maintenance deadline again.',
    gradient: '#D4A853',
  },
  {
    icon: 'trending-up',
    title: 'Financial\nInsights',
    description: 'Understand your portfolio performance with detailed financial breakdowns, expense tracking, and investment returns.',
    gradient: '#4A90D9',
  },
];

export default function OnboardingScreen({ onComplete }) {
  const { colors, isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef(null);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePageChange = (e) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentPage < pages.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    }
  };

  const handleGetStarted = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setOnboarded();
    onComplete();
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setOnboarded();
    onComplete();
  };

  const isLastPage = currentPage === pages.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
        <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
      </TouchableOpacity>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={handlePageChange}
      >
        {pages.map((page, index) => (
          <View key={index} style={styles.page}>
            <View style={[styles.iconCircle, { backgroundColor: page.gradient + '18' }]}>
              <MaterialIcons name={page.icon} size={56} color={page.gradient} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{page.title}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{page.description}</Text>
          </View>
        ))}
      </PagerView>

      <View style={styles.bottomArea}>
        <View style={styles.dots}>
          {pages.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, {
                backgroundColor: i === currentPage ? colors.primary : colors.borderLight,
                width: i === currentPage ? 24 : 8,
              }]}
            />
          ))}
        </View>

        {isLastPage ? (
          <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
            <TouchableOpacity
              style={[styles.getStartedBtn, { backgroundColor: colors.primary }]}
              onPress={handleGetStarted}
              activeOpacity={0.85}
              onPressIn={() => {
                Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
              }}
              onPressOut={() => {
                Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
              }}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.primary }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  nextBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
