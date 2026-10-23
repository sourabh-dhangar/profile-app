import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getProfileAvatar } from '../utils/avatar';
import { useToast } from '../components/Toast';
import {
  MessageSquare,
  Send,
  Search,
  ArrowLeft,
  User,
  Check,
  CheckCheck,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Clock,
  PlusCircle,
  X,
  Compass,
} from 'lucide-react';

const MessagesPage = () => {
  const { targetUsername } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const toast = useToast();

  const [conversations, setConversations] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [activeUsername, setActiveUsername] = useState(targetUsername || null);
  const [targetProfile, setTargetProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  // Search & New Chat state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 1. Fetch conversations list
  const fetchConversations = async (silent = false) => {
    if (!silent) setLoadingConvs(true);
    try {
      const res = await api.get('/chat/conversations');
      if (res.data?.success) {
        setConversations(res.data.data.conversations || []);
      }
    } catch (err) {
      if (!silent) {
        console.error('Error fetching conversations:', err);
      }
    } finally {
      if (!silent) setLoadingConvs(false);
    }
  };

  // 2. Fetch specific thread with target user
  const fetchThread = async (username, silent = false) => {
    if (!username) return;
    if (!silent) setLoadingThread(true);
    try {
      const res = await api.get(`/chat/conversations/${username}`);
      if (res.data?.success) {
        const { targetProfile: profileData, messages: msgs } = res.data.data;
        setTargetProfile(profileData);
        setMessages(msgs || []);
        if (!silent) {
          setTimeout(() => scrollToBottom('auto'), 50);
        }
      }
    } catch (err) {
      if (!silent) {
        console.error('Error fetching thread:', err);
        toast.error(err.response?.data?.message || `Unable to load chat with @${username}`);
      }
    } finally {
      if (!silent) setLoadingThread(false);
    }
  };

  // Sync activeUsername with URL param
  useEffect(() => {
    if (targetUsername) {
      setActiveUsername(targetUsername);
      fetchThread(targetUsername, false);
    }
  }, [targetUsername]);

  // Initial load
  useEffect(() => {
    fetchConversations(false);
  }, []);

  // 3. Auto-polling every 2.5s for real-time chat updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(true);
      if (activeUsername) {
        fetchThread(activeUsername, true);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [activeUsername]);

  // Scroll down when new messages arrive
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length]);

  // Send message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const cleanText = inputText.trim();
    if (!cleanText || sending || !activeUsername) return;

    // Prevent messaging self
    if (profile?.username && activeUsername.toLowerCase() === profile.username.toLowerCase()) {
      toast.error('You cannot message yourself');
      return;
    }

    setSending(true);
    try {
      const res = await api.post(`/chat/conversations/${activeUsername}/messages`, {
        text: cleanText,
      });

      if (res.data?.success) {
        setInputText('');
        // Optimistically add message
        setMessages((prev) => [...prev, res.data.data]);
        setTimeout(() => scrollToBottom('smooth'), 50);
        // Refresh conversations in background to update order and lastMessage
        fetchConversations(true);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Search creators to start a chat with
  const handleSearchCreators = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get(`/chat/search-users?q=${encodeURIComponent(query.trim())}`);
      if (res.data?.success) {
        setSearchResults(res.data.data.users || []);
      }
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUserToChat = (username) => {
    setShowNewChatModal(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/messages/${username}`);
  };

  // Time formatter
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Quick conversation starter suggestions
  const quickPrompts = [
    '👋 Hi there! Love your profile.',
    '💼 Interested in collaborating on a project.',
    '✨ Would love to get a quote for your services.',
    '📅 Are you available for a quick discussion?',
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>Direct Messages</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live 2-Way
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Connect directly with verified creators, service professionals, and businesses
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewChatModal(true)}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Main Dual-Pane Chat Container */}
      <div className="glass-panel border border-slate-800/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-slate-950/80 flex h-[calc(100vh-12rem)] min-h-[520px]">
        
        {/* ========================================================================= */}
        {/* LEFT PANE: CONVERSATIONS LIST */}
        {/* ========================================================================= */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-800/80 flex flex-col bg-slate-900/40 shrink-0 ${
            activeUsername ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search Header */}
          <div className="p-3 sm:p-4 border-b border-slate-800/80 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Conversations Thread List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {loadingConvs && conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-5 h-5 mx-auto animate-spin text-emerald-400" />
                <p>Loading your messages...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto text-slate-400 border border-slate-700/50">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-200">No conversations yet</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Start a conversation with any creator from the directory or their public profile.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 transition-all inline-flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Start New Conversation</span>
                </button>
              </div>
            ) : (
              conversations
                .filter((c) => {
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    c.otherProfile?.name?.toLowerCase().includes(q) ||
                    c.otherProfile?.username?.toLowerCase().includes(q) ||
                    c.lastMessage?.text?.toLowerCase().includes(q)
                  );
                })
                .map((conv) => {
                  const isActive =
                    activeUsername &&
                    conv.otherProfile?.username?.toLowerCase() === activeUsername.toLowerCase();
                  const otherName = conv.otherProfile?.name || 'Creator';
                  const otherUsername = conv.otherProfile?.username || 'user';
                  const avatar = getProfileAvatar(conv.otherProfile?.photoUrl, otherName);

                  return (
                    <button
                      key={conv._id}
                      onClick={() => {
                        navigate(`/messages/${otherUsername}`);
                      }}
                      className={`w-full text-left p-3 sm:p-4 flex items-center space-x-3 transition-colors ${
                        isActive
                          ? 'bg-emerald-500/10 border-l-4 border-emerald-400'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={avatar}
                          alt={otherName}
                          className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-800"
                        />
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-slate-950 ring-2 ring-slate-950 shadow-md">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4
                            className={`text-xs sm:text-sm font-bold truncate ${
                              isActive ? 'text-emerald-400' : 'text-slate-200'
                            }`}
                          >
                            {otherName}
                          </h4>
                          <span className="text-[10px] text-slate-500 shrink-0 ml-1">
                            {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 truncate mb-1">
                          @{otherUsername}
                        </p>

                        <p
                          className={`text-xs truncate ${
                            conv.unreadCount > 0
                              ? 'font-bold text-slate-200'
                              : 'text-slate-400'
                          }`}
                        >
                          {conv.lastMessage?.text || 'Started a conversation'}
                        </p>
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANE: ACTIVE MESSAGE THREAD */}
        {/* ========================================================================= */}
        <div
          className={`flex-1 flex flex-col bg-slate-950/60 ${
            !activeUsername ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeUsername ? (
            <>
              {/* Thread Header */}
              <div className="p-3 sm:p-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => {
                      setActiveUsername(null);
                      navigate('/messages');
                    }}
                    className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                    title="Back to conversations"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <img
                    src={getProfileAvatar(
                      targetProfile?.photoUrl,
                      targetProfile?.name || activeUsername
                    )}
                    alt={targetProfile?.name || activeUsername}
                    className="w-10 h-10 rounded-2xl object-cover ring-2 ring-slate-800 shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-sm font-extrabold text-white truncate">
                        {targetProfile?.name || activeUsername}
                      </h3>
                      <span className="text-emerald-400 text-xs font-bold" title="Verified Creator">
                        ✓
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      @{activeUsername}
                      {targetProfile?.category && (
                        <span className="text-slate-500 ml-1.5">• {targetProfile.category}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    to={`/p/${activeUsername}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 flex items-center space-x-1 transition-all"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Messages History */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingThread && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400 space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-400 mr-2" />
                    <span>Loading conversation history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                    <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-white">
                        Say Hello to {targetProfile?.name || `@${activeUsername}`}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Start your direct conversation now. Messages are delivered instantly.
                      </p>
                    </div>

                    {/* Quick Starter Suggestions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md w-full pt-2">
                      {quickPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInputText(prompt);
                            inputRef.current?.focus();
                          }}
                          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-300 hover:text-white hover:border-emerald-500/30 transition-all text-ellipsis overflow-hidden"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMyMessage =
                      msg.senderId === user?._id ||
                      (profile?.userId && msg.senderId === profile.userId) ||
                      (msg.recipientId && msg.recipientId !== user?._id && msg.recipientId !== profile?.userId);

                    return (
                      <div
                        key={msg._id || index}
                        className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-md md:max-w-lg rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-md transition-all ${
                            isMyMessage
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-medium rounded-br-xs'
                              : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {msg.text}
                          </p>
                        </div>

                        {/* Timestamp & Read Status */}
                        <div
                          className={`flex items-center space-x-1 mt-1 text-[10px] text-slate-500 px-1`}
                        >
                          <span>{formatTime(msg.createdAt)}</span>
                          {isMyMessage && (
                            <span title={msg.read ? 'Read' : 'Sent'}>
                              {msg.read ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Check className="w-3 h-3 text-slate-500" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message @${activeUsername}...`}
                    disabled={sending}
                    maxLength={2000}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:hover:from-emerald-500 disabled:hover:to-teal-500 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty Desktop Thread View */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <MessageSquare className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Your Direct Messages</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Select an existing conversation from the list or start a new direct chat with any creator or business.
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Start New Chat</span>
                </button>
                <Link
                  to="/discover"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center space-x-1.5 transition-all"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Browse Directory</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: START NEW CHAT WITH ANY CREATOR */}
      {/* ========================================================================= */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Start New Conversation</h3>
              </div>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Search by name, handle, or business specialty to message any creator directly.
            </p>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search by name, @username, or specialty..."
                value={searchQuery}
                onChange={(e) => handleSearchCreators(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            {/* Search Results */}
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 -mx-2 px-2">
              {searching ? (
                <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                  <RefreshCw className="w-4 h-4 mx-auto animate-spin text-emerald-400" />
                  <p>Searching creators...</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleSelectUserToChat(u.username)}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-800/60 flex items-center space-x-3 transition-colors"
                  >
                    <img
                      src={getProfileAvatar(u.photoUrl, u.name)}
                      alt={u.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-bold text-white truncate">{u.name}</span>
                        <span className="text-emerald-400 text-[10px]">✓</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">@{u.username}</p>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {u.subCategory || u.category || u.profileType}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 shrink-0">Chat →</span>
                  </button>
                ))
              ) : searchQuery ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No creators found matching "{searchQuery}"
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  Type a name or topic above to find creators
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
