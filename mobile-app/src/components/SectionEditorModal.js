import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { COLORS } from '../theme';

const SECTION_TYPES = [
  { id: 'skills', label: 'Skills', icon: '⚡', defaultTitle: 'Technical Skills & Stacks' },
  { id: 'experience', label: 'Experience', icon: '💼', defaultTitle: 'Work Experience' },
  { id: 'education', label: 'Education', icon: '🎓', defaultTitle: 'Education & Degrees' },
  { id: 'services', label: 'Services', icon: '🛠️', defaultTitle: 'Client Services & Offerings' },
  { id: 'custom', label: 'Custom', icon: '📑', defaultTitle: 'About My Work' },
];

export default function SectionEditorModal({
  visible,
  onClose,
  onSave,
  onDelete,
  initialSection,
  onShowToast,
}) {
  const isEditing = Boolean(initialSection?._id);

  const [type, setType] = useState('skills');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (initialSection) {
      setType(initialSection.type || 'skills');
      setTitle(initialSection.title || '');
      if (initialSection.content?.items && Array.isArray(initialSection.content.items)) {
        setContent(initialSection.content.items.join(', '));
      } else if (initialSection.content?.text) {
        setContent(initialSection.content.text);
      } else {
        setContent('');
      }
    } else {
      setType('skills');
      setTitle('Technical Skills & Stacks');
      setContent('React Native, Expo, Node.js, Express, MongoDB');
    }
  }, [initialSection, visible]);

  const handleSelectType = (selectedType) => {
    setType(selectedType.id);
    if (!isEditing || !title) {
      setTitle(selectedType.defaultTitle);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      onShowToast?.('Section title cannot be empty', 'error');
      return;
    }
    if (!content.trim()) {
      onShowToast?.('Section content cannot be empty', 'error');
      return;
    }

    let formattedContent = {};
    if (type === 'skills') {
      const items = content
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      formattedContent = { items };
    } else {
      formattedContent = { text: content.trim() };
    }

    const payload = {
      ...(initialSection?._id ? { _id: initialSection._id } : {}),
      type,
      title: title.trim(),
      content: formattedContent,
    };

    onSave?.(payload);
    onClose?.();
  };

  const handleDelete = () => {
    if (initialSection?._id) {
      onDelete?.(initialSection._id);
      onClose?.();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerIcon}>
                {isEditing ? '✏️' : '✨'}
              </Text>
              <Text style={styles.headerTitle}>
                {isEditing ? 'Edit Section' : 'Add New Section'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Section Type Selector */}
            <Text style={styles.fieldLabel}>Select Section Category</Text>
            <View style={styles.typeSelectorRow}>
              {SECTION_TYPES.map((t) => {
                const isSelected = type === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.typePill,
                      isSelected && styles.typePillActive,
                    ]}
                    onPress={() => handleSelectType(t)}
                  >
                    <Text style={styles.typePillIcon}>{t.icon}</Text>
                    <Text
                      style={[
                        styles.typePillLabel,
                        isSelected && styles.typePillLabelActive,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Title Input */}
            <Text style={styles.fieldLabel}>Section Title</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Technical Skills, Work Experience"
              placeholderTextColor="#64748b"
            />

            {/* Content Input */}
            <View style={styles.contentLabelRow}>
              <Text style={styles.fieldLabel}>
                {type === 'skills' ? 'Skill Items (Comma Separated)' : 'Section Details / Body'}
              </Text>
            </View>
            <TextInput
              style={[
                styles.textInput,
                type === 'skills' ? styles.tagInput : styles.textAreaInput,
              ]}
              value={content}
              onChangeText={setContent}
              placeholder={
                type === 'skills'
                  ? 'React Native, Node.js, TypeScript, UI/UX Architecture'
                  : 'Describe your role, responsibilities, or service offerings in detail...'
              }
              placeholderTextColor="#64748b"
              multiline={type !== 'skills'}
              numberOfLines={type === 'skills' ? 2 : 4}
            />

            {type === 'skills' && (
              <Text style={styles.helperNote}>
                💡 Items will be automatically formatted as interactive badges on your public profile.
              </Text>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>
                  {isEditing ? 'Save Changes' : 'Create Section'}
                </Text>
              </TouchableOpacity>

              {isEditing && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={handleDelete}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteBtnText}>🗑️ Delete Section</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0b1120',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  modalBody: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 8,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  typePillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: COLORS.primary,
  },
  typePillIcon: {
    fontSize: 14,
  },
  typePillLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  typePillLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    color: COLORS.text,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  tagInput: {
    minHeight: 50,
  },
  textAreaInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  contentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helperNote: {
    fontSize: 11,
    color: '#38bdf8',
    marginBottom: 16,
    lineHeight: 16,
  },
  actionsContainer: {
    gap: 10,
    marginTop: 12,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#030712',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  deleteBtnText: {
    color: '#fb7185',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
