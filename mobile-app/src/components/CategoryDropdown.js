import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { COLORS } from '../theme';

/**
 * Reusable Dropdown Selector with optional search and "Other (Type Manually)" support.
 * Uses a dark-glass Modal sheet so it works consistently across Android, iOS, and Web.
 */
export default function CategoryDropdown({
  label,
  value,
  options = [],
  onSelect,
  placeholder = 'Select an option...',
  accentColor = COLORS.emerald || '#10b981',
  allowCustom = false,
  customTriggerValue = 'Custom',
  customValue = '',
  onChangeCustomValue,
  customLabel = 'SPECIFY OTHER CATEGORY',
  customPlaceholder = 'Type your category manually...',
  searchable = true,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { id: opt, label: opt };
      }
      return {
        id: opt.id ?? opt.name ?? opt.value,
        label: opt.label ?? opt.name ?? String(opt.id),
      };
    });
  }, [options]);

  const isCustomSelected = useMemo(() => {
    if (!allowCustom) return false;
    if (value === customTriggerValue || value === 'Custom Category' || value === 'Custom') {
      return true;
    }
    if (!value) return false;
    return !normalizedOptions.some(
      (opt) => opt.id === value || opt.label === value
    );
  }, [allowCustom, customTriggerValue, normalizedOptions, value]);

  const selectedOption = useMemo(() => {
    if (isCustomSelected) {
      return (
        normalizedOptions.find((o) => o.id === customTriggerValue) || {
          id: customTriggerValue,
          label: '✨ Other (Type Manually)',
        }
      );
    }
    return normalizedOptions.find((opt) => opt.id === value || opt.label === value);
  }, [isCustomSelected, normalizedOptions, customTriggerValue, value]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return normalizedOptions;
    const q = search.trim().toLowerCase();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        String(opt.id).toLowerCase().includes(q)
    );
  }, [normalizedOptions, search]);

  const handleChoose = (optId) => {
    setOpen(false);
    setSearch('');
    onSelect?.(optId);
  };

  const displayLabel = isCustomSelected
    ? customValue?.trim()
      ? `✨ Other: ${customValue.trim()}`
      : selectedOption?.label || '✨ Other (Type Manually)'
    : selectedOption?.label || value || placeholder;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        style={[
          styles.trigger,
          open && { borderColor: accentColor },
        ]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.triggerText,
            !value && !isCustomSelected && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {displayLabel}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      {isCustomSelected && (
        <View style={styles.customWrapper}>
          {customLabel ? <Text style={styles.customLabel}>{customLabel}</Text> : null}
          <TextInput
            style={styles.customInput}
            value={customValue}
            onChangeText={onChangeCustomValue}
            placeholder={customPlaceholder}
            placeholderTextColor="#64748b"
          />
        </View>
      )}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label || 'Select Category'}</Text>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {searchable && normalizedOptions.length > 5 && (
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search category..."
                placeholderTextColor="#64748b"
                autoCorrect={false}
              />
            )}

            <ScrollView
              style={styles.optionsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {filteredOptions.map((opt) => {
                const isSelected =
                  (isCustomSelected && opt.id === customTriggerValue) ||
                  (!isCustomSelected && (value === opt.id || value === opt.label));

                return (
                  <TouchableOpacity
                    key={String(opt.id)}
                    style={[
                      styles.optionRow,
                      isSelected && {
                        backgroundColor: 'rgba(16, 185, 129, 0.14)',
                        borderColor: accentColor,
                      },
                    ]}
                    onPress={() => handleChoose(opt.id)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && { color: '#ffffff', fontWeight: '800' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <Text style={[styles.checkMark, { color: accentColor }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}

              {filteredOptions.length === 0 && (
                <Text style={styles.emptyText}>No matching categories found.</Text>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
    marginRight: 8,
  },
  placeholderText: {
    color: '#64748b',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '700',
  },
  customWrapper: {
    marginTop: 10,
  },
  customLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 6,
  },
  customInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.45)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 14,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.82)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    maxHeight: '72%',
    padding: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
  },
  searchInput: {
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 13,
    marginBottom: 10,
  },
  optionsList: {
    maxHeight: 340,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 6,
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
  },
  optionText: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
    flex: 1,
  },
  checkMark: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    paddingVertical: 20,
    fontSize: 13,
  },
});
