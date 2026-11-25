import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import {
  fetchConversationsApi,
  fetchConversationWithUserApi,
  sendChatMessageApi,
  searchChatUsersApi,
} from '../services/api';
import { getProfileAvatar } from '../utils/avatar';

const formatMessageTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatRelativeDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return formatMessageTime(dateStr);
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function MessagesScreen({
  authToken,
  currentUser,
  initialTargetUsername = null,
  onClearTargetUsername,
  onViewProfile,
  onShowToast,
  onUnreadCountChange,
}) {
  const [conversations, setConversations] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [activeUsername, setActiveUsername] = useState(initialTargetUsername);
  const [targetProfile, setTargetProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  // New Chat Search Modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const flatListRef = useRef(null);
  const currentUserId = currentUser?.user?._id || currentUser?._id;

  const loadConversations = async (silent = false) => {
    if (!authToken) return;
    if (!silent) setLoadingConvs(true);
    try {
      const res = await fetchConversationsApi(authToken);
      if (res?.success) {
        const list = res.data?.conversations || [];
        setConversations(list);
        const totalUnread = list.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        onUnreadCountChange?.(totalUnread);
      }
    } catch (err) {
      if (!silent) console.warn('Failed to load conversations:', err.message);
    } finally {
      if (!silent) setLoadingConvs(false);
    }
  };

  const loadThread = async (username, silent = false) => {
    if (!authToken || !username) return;
    if (!silent) setLoadingThread(true);
    try {
      const res = await fetchConversationWithUserApi(authToken, username);
      if (res?.success) {
        setTargetProfile(res.data?.targetProfile || null);
        setMessages(res.data?.messages || []);
      } else if (!silent) {
        onShowToast?.(res?.message || `Unable to open chat with @${username}`, 'error');
      }
    } catch (err) {
      if (!silent) {
        onShowToast?.('Failed to load chat thread', 'error');
      }
    } finally {
      if (!silent) setLoadingThread(false);
    }
  };

  useEffect(() => {
    if (initialTargetUsername) {
      setActiveUsername(initialTargetUsername);
      loadThread(initialTargetUsername, false);
      onClearTargetUsername?.();
    }
  }, [initialTargetUsername]);

  useEffect(() => {
    loadConversations(false);
  }, [authToken]);

  useEffect(() => {
    if (!authToken) return;
    const interval = setInterval(() => {
      loadConversations(true);
      if (activeUsername) {
        loadThread(activeUsername, true);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [authToken, activeUsername]);

  const handleOpenConversation = (username) => {
    setActiveUsername(username);
    setTargetProfile(null);
    setMessages([]);
    loadThread(username, false);
  };

  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !activeUsername || sending) return;

    setSending(true);
    setInputText('');
    try {
      const res = await sendChatMessageApi(authToken, activeUsername, trimmed);
      if (res?.success && res.data?.message) {
        setMessages((prev) => [...prev, res.data.message]);
        loadConversations(true);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 80);
      } else {
        setInputText(trimmed);
        onShowToast?.(res?.message || 'Failed to send message', 'error');
      }
    } catch (err) {
      setInputText(trimmed);
      onShowToast?.('Network error while sending message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (!authToken) return;
    setSearching(true);
    try {
      const res = await searchChatUsersApi(authToken, query);
      if (res?.success) {
        setSearchResults(res.data?.users || []);
      }
    } catch (err) {
      console.warn('User search error:', err.message);
    } finally {
      setSearching(false);
    }
  };

  const openNewChatModal = () => {
    setShowNewChatModal(true);
    handleSearchUsers('');
  };

  // =====================================
  // THREAD VIEW (1-ON-1 CHAT)
  // =====================================
  if (activeUsername) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.threadHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              setActiveUsername(null);
              setTargetProfile(null);
              setMessages([]);
              loadConversations(true);
            }}
            activeOpacity={0.75}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.threadUserRow}
            onPress={() => onViewProfile?.(activeUsername)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: getProfileAvatar(targetProfile || { username: activeUsername }) }}
              style={styles.threadAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.threadName} numberOfLines={1}>
                {targetProfile?.name || `@${activeUsername}`}
              </Text>
              <Text style={styles.threadMeta} numberOfLines={1}>
                @{activeUsername}
                {targetProfile?.category ? ` • ${targetProfile.category}` : ''}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewProfilePill}
            onPress={() => onViewProfile?.(activeUsername)}
          >
            <Text style={styles.viewProfilePillText}>Profile</Text>
          </TouchableOpacity>
        </View>

        {loadingThread ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.mutedText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, idx) => String(item._id || idx)}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => {
              const isMine = String(item.senderId) === String(currentUserId);
              return (
                <View
                  style={[
                    styles.bubbleRow,
                    isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      isMine ? styles.bubbleMine : styles.bubbleTheirs,
                    ]}
                  >
                    <Text style={styles.bubbleText}>{item.text}</Text>
                    <Text style={styles.bubbleTime}>
                      {formatMessageTime(item.createdAt)}
                      {isMine ? (item.read ? '  ✓✓' : '  ✓') : ''}
                    </Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyThreadBox}>
                <Text style={styles.emptyEmoji}>💬</Text>
                <Text style={styles.emptyTitle}>Start a conversation</Text>
                <Text style={styles.mutedText}>
                  Send a direct message to @{activeUsername} regarding their profile or listings.
                </Text>
              </View>
            }
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.chatInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Message @${activeUsername}...`}
            placeholderTextColor="#64748b"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#020617" />
            ) : (
              <Text style={styles.sendBtnText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // =====================================
  // CONVERSATIONS LIST VIEW
  // =====================================
  return (
    <View style={styles.container}>
      <View style={styles.listHeader}>
        <View>
          <Text style={styles.screenTitle}>Messages</Text>
          <Text style={styles.screenSubtitle}>Direct chat with creators & businesses</Text>
        </View>
        <TouchableOpacity
          style={styles.newChatBtn}
          onPress={openNewChatModal}
          activeOpacity={0.8}
        >
          <Text style={styles.newChatBtnText}>+ New Chat</Text>
        </TouchableOpacity>
      </View>

      {loadingConvs ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.mutedText}>Loading conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item._id)}
          contentContainerStyle={styles.convListContent}
          renderItem={({ item }) => {
            const other = item.otherProfile || {};
            const unread = item.unreadCount || 0;
            return (
              <TouchableOpacity
                style={styles.convCard}
                onPress={() => handleOpenConversation(other.username)}
                activeOpacity={0.75}
              >
                <Image
                  source={{ uri: getProfileAvatar(other) }}
                  style={styles.convAvatar}
                />
                <View style={styles.convBody}>
                  <View style={styles.convTopRow}>
                    <Text style={styles.convName} numberOfLines={1}>
                      {other.name || `@${other.username}`}
                    </Text>
                    <Text style={styles.convTime}>
                      {formatRelativeDate(item.lastMessage?.createdAt || item.updatedAt)}
                    </Text>
                  </View>
                  <View style={styles.convBottomRow}>
                    <Text
                      style={[styles.convPreview, unread > 0 && styles.convPreviewUnread]}
                      numberOfLines={1}
                    >
                      {item.lastMessage?.text || `@${other.username} • Tap to chat`}
                    </Text>
                    {unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.mutedText}>
                Tap "+ New Chat" or visit any profile and tap Message to start chatting.
              </Text>
              <TouchableOpacity
                style={[styles.newChatBtn, { marginTop: 16 }]}
                onPress={openNewChatModal}
              >
                <Text style={styles.newChatBtnText}>Find People to Chat</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* New Chat User Search Modal */}
      <Modal
        visible={showNewChatModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewChatModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <SafeAreaView style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Start New Chat</Text>
              <TouchableOpacity
                onPress={() => setShowNewChatModal(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalSearchInput}
              value={searchQuery}
              onChangeText={handleSearchUsers}
              placeholder="Search by name, @username, or category..."
              placeholderTextColor="#64748b"
              autoCorrect={false}
            />

            {searching ? (
              <ActivityIndicator color="#10b981" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item, idx) => String(item._id || item.username || idx)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.userSearchRow}
                    onPress={() => {
                      setShowNewChatModal(false);
                      handleOpenConversation(item.username);
                    }}
                  >
                    <Image
                      source={{ uri: getProfileAvatar(item) }}
                      style={styles.userSearchAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userSearchName}>{item.name}</Text>
                      <Text style={styles.userSearchMeta}>
                        @{item.username}
                        {item.category ? ` • ${item.category}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.chatArrow}>💬</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={[styles.mutedText, { textAlign: 'center', marginTop: 20 }]}>
                    No users found.
                  </Text>
                }
              />
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  screenTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
  },
  screenSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  newChatBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  newChatBtnText: {
    color: '#020617',
    fontSize: 13,
    fontWeight: '800',
  },
  convListContent: {
    padding: 12,
    flexGrow: 1,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  convAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e293b',
    marginRight: 12,
  },
  convBody: {
    flex: 1,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  convName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  convTime: {
    color: '#64748b',
    fontSize: 11,
  },
  convBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  convPreview: {
    color: '#94a3b8',
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  convPreviewUnread: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#10b981',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#020617',
    fontSize: 11,
    fontWeight: '800',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 28,
  },
  emptyThreadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 28,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  mutedText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  backBtnText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  threadUserRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  threadAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1e293b',
    marginRight: 10,
  },
  threadName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  threadMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  viewProfilePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  viewProfilePillText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
  messagesList: {
    padding: 14,
    flexGrow: 1,
  },
  bubbleRow: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubbleRowTheirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: '#10b981',
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    color: '#f8fafc',
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTime: {
    color: 'rgba(248, 250, 252, 0.72)',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#10b981',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendBtnText: {
    color: '#020617',
    fontSize: 13,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
  },
  modalSearchInput: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
    marginBottom: 10,
  },
  userSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  userSearchAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1e293b',
    marginRight: 12,
  },
  userSearchName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  userSearchMeta: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  chatArrow: {
    fontSize: 18,
    marginLeft: 8,
  },
});
