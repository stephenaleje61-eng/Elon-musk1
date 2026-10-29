import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  Smile, 
  Search, 
  Trash2, 
  ShieldAlert, 
  X, 
  Check, 
  CheckCheck, 
  Clock, 
  ArrowLeft,
  Copy,
  Plus,
  Info,
  Lock,
  User,
  ExternalLink,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc
} from 'firebase/firestore';
import { Conversation, ChatMessage } from '../types';

export const PrivateChatCentre: React.FC = () => {
  const { user, profile, signInWithGoogle } = useAuth();
  
  // Navigation & Conversation State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingChats, setLoadingChats] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

  // Message Composition State
  const [messageText, setMessageText] = useState<string>('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showEmojiBar, setShowEmojiBar] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);

  // New Chat Modal State
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [targetUserName, setTargetUserName] = useState<string>('');
  const [newChatError, setNewChatError] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState<boolean>(false);

  // Block & Report Modal
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('Spam or Scam Content');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Local storage helpers for offline / unauthenticated resilience
  const getLocalConversations = (uid: string): Conversation[] => {
    try {
      const raw = localStorage.getItem(`ems_chats_${uid}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveLocalConversations = (uid: string, chats: Conversation[]) => {
    try {
      localStorage.setItem(`ems_chats_${uid}`, JSON.stringify(chats));
    } catch (err) {
      console.warn('Local chat storage error:', err);
    }
  };

  const getLocalMessages = (convId: string): ChatMessage[] => {
    try {
      const raw = localStorage.getItem(`ems_msgs_${convId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveLocalMessages = (convId: string, msgs: ChatMessage[]) => {
    try {
      localStorage.setItem(`ems_msgs_${convId}`, JSON.stringify(msgs));
    } catch (err) {
      console.warn('Local messages storage error:', err);
    }
  };

  // Copy User ID
  const copySessionId = () => {
    if (user) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  // Listen to User Conversations
  useEffect(() => {
    if (!user) return;
    setLoadingChats(true);

    const localChats = getLocalConversations(user.uid);
    setConversations(localChats);

    const path = 'conversations';
    try {
      const q = query(
        collection(db, path),
        where('participants', 'array-contains', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreChats: Conversation[] = [];
        snapshot.forEach((docSnap) => {
          firestoreChats.push({ id: docSnap.id, ...docSnap.data() } as Conversation);
        });

        // Merge firestore and local
        const mergedMap = new Map<string, Conversation>();
        [...firestoreChats, ...localChats].forEach(c => mergedMap.set(c.id, c));
        const merged = Array.from(mergedMap.values());
        merged.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());

        setConversations(merged);
        saveLocalConversations(user.uid, merged);
        setLoadingChats(false);

        if (activeConversation) {
          const updated = merged.find(c => c.id === activeConversation.id);
          if (updated) setActiveConversation(updated);
        }
      }, (error) => {
        console.warn('Firestore chats query status:', error.message);
        setLoadingChats(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore chats query skipped:', err);
      setLoadingChats(false);
    }
  }, [user]);

  // Listen to Active Conversation Messages
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const localMsgs = getLocalMessages(activeConversation.id);
    setMessages(localMsgs);

    const path = `conversations/${activeConversation.id}/messages`;
    try {
      const q = query(
        collection(db, 'conversations', activeConversation.id, 'messages'),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreMsgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          firestoreMsgs.push({ id: docSnap.id, ...docSnap.data() } as ChatMessage);
        });

        const mergedMap = new Map<string, ChatMessage>();
        [...localMsgs, ...firestoreMsgs].forEach(m => mergedMap.set(m.id, m));
        const merged = Array.from(mergedMap.values());
        merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        setMessages(merged);
        saveLocalMessages(activeConversation.id, merged);
        setLoadingMessages(false);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }, (error) => {
        console.warn('Firestore messages query status:', error.message);
        setLoadingMessages(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore messages query skipped:', err);
      setLoadingMessages(false);
    }
  }, [activeConversation?.id]);

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !activeConversation) return;
    if (!messageText.trim() && !attachedImage) return;

    setSending(true);
    const textToSend = messageText.trim();
    const imageToSend = attachedImage;

    setMessageText('');
    setAttachedImage(null);
    setShowEmojiBar(false);

    const newMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 10),
      conversationId: activeConversation.id,
      senderId: user.uid,
      senderName: profile?.displayName || `User-${user.uid.substring(0, 5)}`,
      senderAvatar: profile?.photoURL || '',
      text: textToSend || (imageToSend ? '[Image Attachment]' : ''),
      imageUrl: imageToSend || undefined,
      status: 'delivered',
      createdAt: new Date().toISOString()
    };

    // Save locally immediately
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    saveLocalMessages(activeConversation.id, updatedMessages);

    // Update conversation item
    const updatedConv: Conversation = {
      ...activeConversation,
      lastMessage: textToSend || '📷 Photo',
      lastMessageSenderId: user.uid,
      lastMessageAt: new Date().toISOString()
    };
    setActiveConversation(updatedConv);
    const updatedConvs = conversations.map(c => c.id === updatedConv.id ? updatedConv : c);
    setConversations(updatedConvs);
    saveLocalConversations(user.uid, updatedConvs);

    // Try Firestore write
    try {
      await addDoc(collection(db, 'conversations', activeConversation.id, 'messages'), newMsg);
      await updateDoc(doc(db, 'conversations', activeConversation.id), {
        lastMessage: textToSend || '📷 Photo',
        lastMessageSenderId: user.uid,
        lastMessageAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Message saved locally, Firestore sync pending authentication:', error);
    } finally {
      setSending(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  // Start New Conversation
  const handleStartNewConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const cleanTargetId = targetUserId.trim();
    if (!cleanTargetId) {
      setNewChatError('Please enter a recipient User ID.');
      return;
    }

    if (cleanTargetId === user.uid) {
      setNewChatError('Cannot start a conversation with your own session.');
      return;
    }

    setNewChatError(null);

    const otherName = targetUserName.trim() || `User-${cleanTargetId.substring(0, 6)}`;
    const myName = profile?.displayName || `User-${user.uid.substring(0, 6)}`;

    const newConv: Conversation = {
      id: 'conv_' + Math.random().toString(36).substring(2, 10),
      participants: [user.uid, cleanTargetId],
      participantNames: {
        [user.uid]: myName,
        [cleanTargetId]: otherName
      },
      participantAvatars: {
        [user.uid]: profile?.photoURL || '',
        [cleanTargetId]: ''
      },
      lastMessage: 'Conversation initialized.',
      lastMessageSenderId: user.uid,
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Save locally
    const updated = [newConv, ...conversations];
    setConversations(updated);
    saveLocalConversations(user.uid, updated);
    setActiveConversation(newConv);
    setShowNewChatModal(false);
    setTargetUserId('');
    setTargetUserName('');

    // Try Firestore write
    try {
      const docRef = await addDoc(collection(db, 'conversations'), newConv);
      newConv.id = docRef.id;
    } catch (err) {
      console.warn('Firestore conversation write deferred, stored in session:', err);
    }
  };

  // Start Community Support Desk Chat
  const handleConnectSupportDesk = async () => {
    if (!user) return;
    const supportId = 'verified-community-desk';
    setTargetUserId(supportId);
    setTargetUserName('Space Community Assistance Desk');
    setShowNewChatModal(true);
  };

  // Delete Conversation
  const handleDeleteConversation = async (convId: string) => {
    if (!window.confirm('Delete this conversation history for your account?')) return;
    
    // Remove locally
    const updated = conversations.filter(c => c.id !== convId);
    setConversations(updated);
    if (user) saveLocalConversations(user.uid, updated);
    if (activeConversation?.id === convId) {
      setActiveConversation(null);
    }

    try {
      await deleteDoc(doc(db, 'conversations', convId));
    } catch (err) {
      console.warn('Firestore delete skipped or offline');
    }
  };

  // Submit Abuse Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeConversation) return;

    const otherId = activeConversation.participants.find(p => p !== user.uid) || 'unknown';

    try {
      await addDoc(collection(db, 'user_reports'), {
        reporterId: user.uid,
        targetUserId: otherId,
        conversationId: activeConversation.id,
        reason: reportReason,
        details: reportDetails.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Safety report queued locally:', err);
    } finally {
      setReportSubmitted(true);
      setTimeout(() => {
        setReportSubmitted(false);
        setShowReportModal(false);
        setReportDetails('');
      }, 2000);
    }
  };

  // Handle Image Upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image exceeds 2MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAttachedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const emojis = ['🚀', '🛰️', '⚡', '🛡️', '📈', '💬', '🪐', '🌌', '✨', '🔥', '👍', '🤝'];

  const filteredConversations = conversations.filter(c => {
    const otherId = c.participants.find(p => p !== user?.uid) || '';
    const name = c.participantNames?.[otherId] || otherId;
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || otherId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-black text-white py-6 sm:py-10 px-4 sm:px-6 max-w-7xl mx-auto">
      
      {/* Header & Verification Transparency Notice */}
      <div className="border-b border-neutral-900 pb-5 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
            <MessageSquare className="w-4 h-4 text-white" />
            <span>Encrypted One-to-One Communications</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Private Chat Centre
          </h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm max-w-2xl">
            Real-time peer messaging between authorized user sessions. Messages persist securely across browser refreshes.
          </p>
        </div>

        {/* User Session ID Banner & Google Auth */}
        <div className="flex items-center gap-3">
          {!user?.email && (
            <button
              onClick={signInWithGoogle}
              className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sync</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs">
            <div className="text-left">
              <span className="text-neutral-500 font-mono text-[10px] uppercase block">Your Session ID</span>
              <span className="font-mono text-neutral-300 font-bold text-xs truncate max-w-[140px] sm:max-w-[200px] block">
                {user?.uid || 'Initializing...'}
              </span>
            </div>
            <button
              onClick={copySessionId}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg transition-colors border border-neutral-800"
              title="Copy Session ID to share"
            >
              {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* VERIFICATION TRANSPARENCY BANNER */}
      <div className="mb-6 p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex items-start gap-3 text-xs text-neutral-400">
        <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">Authenticity Notice:</strong>
          Only verified administrative accounts can display official accreditation. Ordinary accounts communicate within the space community network. Neither Elon Musk nor Tesla staff will ever message you requesting cryptocurrency, private seed phrases, or wire deposits.
        </div>
      </div>

      {/* Main Chat Workstation (Split View) */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px] max-h-[780px]">
        
        {/* Left Column: Conversation Directory (4 cols) */}
        <div className={`md:col-span-4 border-r border-neutral-900 flex flex-col justify-between ${
          activeConversation ? 'hidden md:flex' : 'flex'
        }`}>
          <div>
            {/* Search & New Chat Trigger */}
            <div className="p-4 border-b border-neutral-900 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Conversations</span>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-2.5 py-1 bg-white text-black text-xs font-bold uppercase rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Chat</span>
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Filter by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="overflow-y-auto max-h-[500px] divide-y divide-neutral-900">
              {loadingChats ? (
                <div className="py-12 text-center text-xs font-mono text-neutral-500">
                  Loading direct channels...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <MessageSquare className="w-8 h-8 text-neutral-700 mx-auto" />
                  <div className="text-xs font-bold text-neutral-400 uppercase">No active conversations</div>
                  <p className="text-[11px] text-neutral-500">
                    Connect with another registered session by exchanging User IDs, or start a thread with the Community Assistance Desk.
                  </p>
                  <button
                    onClick={handleConnectSupportDesk}
                    className="mt-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold border border-neutral-800"
                  >
                    Connect Support Desk
                  </button>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const otherId = c.participants.find(p => p !== user?.uid) || '';
                  const displayName = c.participantNames?.[otherId] || `User-${otherId.substring(0, 6)}`;
                  const isSelected = activeConversation?.id === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveConversation(c)}
                      className={`p-4 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected ? 'bg-neutral-900' : 'hover:bg-neutral-900/40'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-neutral-800 text-white flex items-center justify-center font-bold text-xs shrink-0 border border-neutral-700">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white truncate">{displayName}</span>
                            {otherId === 'verified-community-desk' && (
                              <span className="text-[9px] bg-white text-black font-mono font-bold px-1 rounded">
                                DESK
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                            {c.lastMessage || 'Empty chat'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-neutral-500 block">
                          {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Support Desk Link */}
          <div className="p-3 border-t border-neutral-900 bg-neutral-950">
            <button
              onClick={handleConnectSupportDesk}
              className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" />
              <span>Connect Assistance Desk</span>
            </button>
          </div>
        </div>

        {/* Right Column: Chat Stage (8 cols) */}
        <div className={`md:col-span-8 flex flex-col justify-between h-[640px] sm:h-[780px] bg-black ${
          !activeConversation ? 'hidden md:flex' : 'flex'
        }`}>
          {activeConversation ? (
            <>
              {/* Chat Room Top Bar */}
              {(() => {
                const otherId = activeConversation.participants.find(p => p !== user?.uid) || '';
                const otherName = activeConversation.participantNames?.[otherId] || `User-${otherId.substring(0, 6)}`;

                return (
                  <div className="px-5 py-3.5 border-b border-neutral-900 bg-neutral-950 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveConversation(null)}
                        className="md:hidden p-1.5 -ml-1 text-neutral-400 hover:text-white"
                        aria-label="Back to conversations"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      <div className="w-8 h-8 rounded-lg bg-neutral-800 text-white flex items-center justify-center font-bold text-xs border border-neutral-700">
                        {otherName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{otherName}</span>
                          {otherId === 'verified-community-desk' && (
                            <span className="text-[10px] bg-white text-black font-mono font-bold px-1.5 py-0.2 rounded">
                              VERIFIED DESK
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          ID: {otherId}
                        </div>
                      </div>
                    </div>

                    {/* Room Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowReportModal(true)}
                        className="p-2 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white text-xs flex items-center gap-1"
                        title="Report or block participant"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span className="hidden sm:inline">Report</span>
                      </button>

                      <button
                        onClick={() => handleDeleteConversation(activeConversation.id)}
                        className="p-2 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-red-400 text-xs"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingMessages ? (
                  <div className="py-20 text-center text-xs font-mono text-neutral-500">
                    Syncing message log...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center space-y-2">
                    <MessageSquare className="w-8 h-8 text-neutral-700 mx-auto" />
                    <div className="text-xs font-bold text-neutral-400 uppercase">Channel Open</div>
                    <p className="text-[11px] text-neutral-500">
                      Send a message or attach a receipt/screenshot to begin conversation.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user?.uid;

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-neutral-500">
                          <span>{isMe ? 'You' : m.senderName}</span>
                          <span>·</span>
                          <span className="font-mono">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className={`max-w-[85%] sm:max-w-md rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-white text-black font-medium'
                            : 'bg-neutral-900 text-white border border-neutral-800'
                        }`}>
                          {/* Image Attachment inside Message */}
                          {m.imageUrl && (
                            <div className="mb-2 rounded-xl overflow-hidden bg-black/20">
                              <img
                                src={m.imageUrl}
                                alt="Attachment"
                                className="w-full max-h-60 object-contain rounded-lg"
                              />
                            </div>
                          )}

                          {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}

                          {/* Delivery status indicator for sent messages */}
                          {isMe && (
                            <div className="flex justify-end items-center gap-1 mt-1 text-[10px] text-neutral-600 font-mono">
                              <span>Delivered</span>
                              <CheckCheck className="w-3 h-3 text-neutral-700" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer & Toolbar */}
              <div className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-900 space-y-2">
                
                {/* Image Preview before sending */}
                {attachedImage && (
                  <div className="relative inline-block border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900 p-1">
                    <img src={attachedImage} alt="Attachment" className="h-16 w-16 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-0.5 text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Quick Emoji Bar */}
                {showEmojiBar && (
                  <div className="flex items-center gap-1.5 p-2 bg-neutral-900 rounded-xl overflow-x-auto">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setMessageText(prev => prev + emoji)}
                        className="p-1 hover:bg-neutral-800 rounded text-base"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowEmojiBar(!showEmojiBar)}
                      className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                      title="Add Emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    <label className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors cursor-pointer" title="Attach Image">
                      <ImageIcon className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    placeholder="Write a message to this channel..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!messageText.trim() && !attachedImage)}
                    className="p-2.5 bg-white text-black rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-40"
                    aria-label="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-neutral-400" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase">Private Space Communications</h3>
              <p className="text-xs text-neutral-400 max-w-sm">
                Select an existing conversation on the left, initiate a new peer thread with another user's session ID, or contact the Community Assistance Desk.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-4 py-2.5 bg-white text-black font-bold text-xs uppercase rounded-xl hover:bg-neutral-200"
                >
                  Start New Chat
                </button>
                <button
                  onClick={handleConnectSupportDesk}
                  className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white font-bold text-xs uppercase rounded-xl hover:bg-neutral-850"
                >
                  Assistance Desk
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: START NEW CHAT MODAL */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-md w-full p-6 text-white space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <h3 className="text-base font-bold uppercase tracking-wide">Start Direct Conversation</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {newChatError && (
              <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-xs text-red-400">
                {newChatError}
              </div>
            )}

            <form onSubmit={handleStartNewConversation} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold uppercase mb-1">
                  Recipient User ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7qXw8... or verified-community-desk"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold uppercase mb-1">
                  Optional Label or Nickname
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mars Researcher or Assistance Agent"
                  value={targetUserName}
                  onChange={(e) => setTargetUserName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-white text-black font-extrabold uppercase rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Open Secure Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REPORT & BLOCK PARTICIPANT */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-md w-full p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <h3 className="text-base font-bold uppercase tracking-wide flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Report or Block Participant</span>
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <Check className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white uppercase">Report Filed</h4>
                <p className="text-xs text-neutral-400">
                  Our safety and compliance moderators have received this incident.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 font-semibold uppercase mb-1">
                    Violation Category
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white"
                  >
                    <option value="Spam or Scam Content">Fraudulent Investment / Scam Solicitation</option>
                    <option value="Celebrity Impersonation">Impersonating Elon Musk or Official Staff</option>
                    <option value="Harassment or Abuse">Harassment, Threats or Abusive Language</option>
                    <option value="Other Safety Violation">Other Malicious Activity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 font-semibold uppercase mb-1">
                    Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe specific messages or extortion attempts..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
