import React from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { COLORS } from '../theme';

export default function Toast({ message, type = 'info', visible }) {
  if (!visible || !message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <View style={styles.toastContainer}>
      <View
        style={[
          styles.toastCard,
          isSuccess && styles.toastSuccess,
          isError && styles.toastError,
        ]}
      >
        <Text style={styles.toastIcon}>
          {isSuccess ? '✓' : isError ? '⚠️' : '⚡'}
        </Text>
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 999,
    alignItems: 'center',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    gap: 10,
    maxWidth: '92%',
  },
  toastSuccess: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(6, 78, 59, 0.95)',
  },
  toastError: {
    borderColor: 'rgba(244, 63, 94, 0.4)',
    backgroundColor: 'rgba(136, 19, 55, 0.95)',
  },
  toastIcon: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
