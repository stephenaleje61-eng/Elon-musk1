import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Search, 
  Check, 
  X, 
  Send, 
  Image as ImageIcon, 
  Smile, 
  ArrowLeft, 
  ShieldCheck, 
  RefreshCw, 
  Trash2, 
  MessageSquare, 
  MapPin, 
  Mail, 
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  setDoc, 
  addDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { FriendRequest, VisitorRecord, PrivateChat, ChatMessage } from '../types';

interface AdminControlProps {
  onBackToVisitor: () => void;
}

export const AdminControl: React.FC<AdminControlProps> = ({ onBackToVisitor }) => {
  // Navigation & Tabs State: 'requests' | 'conversations' | 'visitors'
  const [activeTab, setActiveTab] = useState<'requests' | 'conversations' | 'visitors'>('requests');

  // Real-Time Collections from Firebase
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [chats, setChats] = useState<PrivateChat[]>([]);
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Conversation for 1-on-1 Private Chat
  const [selectedChat, setSelectedChat] = useState<PrivateChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set document title
  useEffect(() => {
    document.title = "ELON MUSK SPACE - Admin Control";
  }, []);

  // Quick flash notification
  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // 1. Real-Time Listener for Friend Requests
  useEffect(() => {
    setLoadingData(true);
    const qReq = query(collection(db, 'friendRequests'), orderBy('timestamp', 'desc'));
    
    const unsubscribeReq = onSnapshot(qReq, (snapshot) => {
      const items: FriendRequest[] = [];
      snapshot.forEach(d => {
        const data = d.data() as FriendRequest;
        // Filter out any fake users like "Elon musk1"
        if (data.name?.toLowerCase().includes('elon musk1') || data.email?.toLowerCase().includes('elonmusk1')) {
          return;
        }
        items.push({ ...data, id: d.id });
      });
      setRequests(items);
      setLoadingData(false);
    }, (err) => {
      console.warn('Real-time friendRequests error:', err);
      setLoadingData(false);
    });

    return () => unsubscribeReq();
  }, []);

  // 2. Real-Time Listener for Private Chats
  useEffect(() => {
    const qChats = query(collection(db, 'privateChats'), orderBy('createdAt', 'desc'));
    
    const unsubscribeChats = onSnapshot(qChats, (snapshot) => {
      const items: PrivateChat[] = [];
      snapshot.forEach(d => {
        const data = d.data() as PrivateChat;
        // Filter out fake user "Elon musk1"
        if (data.visitorName?.toLowerCase().includes('elon musk1')) {
          return;
        }
        items.push({ ...data, id: d.id });
      });

      // Sort by lastMessageTime or createdAt
      items.sort((a, b) => {
        const timeA = new Date(a.lastMessageTime || a.createdAt || 0).getTime();
        const timeB = new Date(b.lastMessageTime || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setChats(items);

      // Keep active chat in sync
      if (selectedChat) {
        const refreshed = items.find(c => c.id === selectedChat.id);
        if (refreshed) setSelectedChat(refreshed);
      }
    }, (err) => {
      console.warn('Real-time privateChats error:', err);
    });

    return () => unsubscribeChats();
  }, [selectedChat?.id]);

  // 3. Real-Time Listener for Visitors
  useEffect(() => {
    const qVis = query(collection(db, 'visitors'), orderBy('createdAt', 'desc'));
    
    const unsubscribeVis = onSnapshot(qVis, (snapshot) => {
      const items: VisitorRecord[] = [];
      snapshot.forEach(d => {
        const data = d.data() as VisitorRecord;
        if (data.name?.toLowerCase().includes('elon musk1')) {
          return;
        }
        items.push({ ...data, id: d.id });
      });
      setVisitors(items);
    }, (err) => {
      console.warn('Real-time visitors error:', err);
    });

    return () => unsubscribeVis();
  }, []);

  // 4. Real-Time Listener for Messages in Selected Chat
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, 'privateChats', selectedChat.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach(d => {
        const m = d.data() as ChatMessage;
        // Filter out fake bot replies or placeholder messages
        if (m.text?.toLowerCase().includes('conversation initialized')) {
          return;
        }
        msgs.push({ ...m, id: d.id });
      });
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (err) => {
      console.warn('Error streaming chat messages:', err);
    });

    // Mark chat unread count as read
    updateDoc(doc(db, 'privateChats', selectedChat.id), {
      adminUnreadCount: 0
    }).catch(() => {});

    return () => unsubscribe();
  }, [selectedChat?.id]);

  // ACTION: MANUAL REFRESH BUTTON
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const reqSnap = await getDocs(query(collection(db, 'friendRequests'), orderBy('timestamp', 'desc')));
      const newReqs: FriendRequest[] = [];
      reqSnap.forEach(d => {
        const data = d.data() as FriendRequest;
        if (!data.name?.toLowerCase().includes('elon musk1')) {
          newReqs.push({ ...data, id: d.id });
        }
      });
      setRequests(newReqs);

      const chatSnap = await getDocs(query(collection(db, 'privateChats'), orderBy('createdAt', 'desc')));
      const newChats: PrivateChat[] = [];
      chatSnap.forEach(d => {
        const data = d.data() as PrivateChat;
        if (!data.visitorName?.toLowerCase().includes('elon musk1')) {
          newChats.push({ ...data, id: d.id });
        }
      });
      setChats(newChats);

      showNotice('Data refreshed from Firebase.');
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // ACTION: CLEAR ALL FAKE DATA BUTTON
  const handleClearAllFakeData = async () => {
    if (!window.confirm('Delete all test / fake data from database and start completely fresh? This will remove all mock records.')) {
      return;
    }

    setIsRefreshing(true);
    try {
      // 1. Delete all friendRequests
      const reqSnap = await getDocs(collection(db, 'friendRequests'));
      for (const d of reqSnap.docs) {
        await deleteDoc(d.ref);
      }

      // 2. Delete all privateChats & subcollection messages
      const chatSnap = await getDocs(collection(db, 'privateChats'));
      for (const d of chatSnap.docs) {
        const msgsSnap = await getDocs(collection(db, 'privateChats', d.id, 'messages'));
        for (const m of msgsSnap.docs) {
          await deleteDoc(m.ref);
        }
        await deleteDoc(d.ref);
      }

      // 3. Delete all visitors
      const visSnap = await getDocs(collection(db, 'visitors'));
      for (const d of visSnap.docs) {
        await deleteDoc(d.ref);
      }

      // 4. Clear local test caches
      localStorage.removeItem('ems_visitor_request_id');
      localStorage.removeItem('ems_visitor_name');
      localStorage.removeItem('ems_visitor_email');
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('ems_chats_') || key.startsWith('ems_msgs_') || key.startsWith('ems_cases_'))) {
          localStorage.removeItem(key);
        }
      }

      // Reset state
      setRequests([]);
      setChats([]);
      setVisitors([]);
      setMessages([]);
      setSelectedChat(null);

      showNotice('All fake and test data successfully deleted. Database is clean!');
    } catch (err: any) {
      console.error('Error clearing test data:', err);
      showNotice('Cleared local caches. Note: ' + (err.message || 'Check database permissions.'));
    } finally {
      setIsRefreshing(false);
    }
  };

  // ACTION: ACCEPT FRIEND REQUEST
  const handleAcceptRequest = async (req: FriendRequest) => {
    try {
      // 1. Update friendRequests status to accepted
      await updateDoc(doc(db, 'friendRequests', req.id), {
        status: 'accepted',
        updatedAt: new Date().toISOString()
      });

      // 2. Create / unlock privateChat document
      const chatDocData = {
        id: req.id,
        requestId: req.id,
        visitorId: req.id,
        visitorName: req.name,
        visitorEmail: req.email,
        visitorLocation: req.location,
        status: 'active',
        lastMessage: 'Channel opened by Admin. You are now connected.',
        lastMessageTime: new Date().toISOString(),
        lastSender: 'admin',
        adminUnreadCount: 0,
        createdAt: req.timestamp || new Date().toISOString()
      };

      await setDoc(doc(db, 'privateChats', req.id), chatDocData, { merge: true });

      // 3. Update visitors record
      await setDoc(doc(db, 'visitors', req.id), {
        id: req.id,
        name: req.name,
        email: req.email,
        location: req.location,
        status: 'accepted',
        lastSeen: new Date().toISOString(),
        createdAt: req.timestamp || new Date().toISOString()
      }, { merge: true });

      showNotice(`Accepted request from ${req.name}. Chat channel unlocked.`);

      // Automatically jump to conversations and open this chat
      setSelectedChat({
        ...chatDocData,
        createdAt: chatDocData.createdAt
      } as PrivateChat);
      setActiveTab('conversations');

    } catch (err) {
      console.error('Error accepting friend request:', err);
      showNotice('Failed to accept request. Please try again.');
    }
  };

  // ACTION: DECLINE FRIEND REQUEST
  const handleDeclineRequest = async (req: FriendRequest) => {
    if (!window.confirm(`Decline friend request from ${req.name}?`)) return;

    try {
      await updateDoc(doc(db, 'friendRequests', req.id), {
        status: 'declined',
        updatedAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'visitors', req.id), {
        status: 'declined'
      }).catch(() => {});

      showNotice(`Declined request from ${req.name}.`);
    } catch (err) {
      console.error('Error declining request:', err);
    }
  };

  // ACTION: SEND MESSAGE IN PRIVATE CHAT (Instant reply from Admin)
  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || (!messageText.trim() && !attachedImage)) return;

    setSendingMsg(true);
    const textToSend = messageText.trim();
    const imageToSend = attachedImage;

    setMessageText('');
    setAttachedImage(null);
    setShowEmojiPicker(false);

    try {
      const messagesRef = collection(db, 'privateChats', selectedChat.id, 'messages');
      const newMsg: Omit<ChatMessage, 'id'> = {
        sender: 'admin',
        senderName: 'Community Admin',
        text: textToSend,
        imageUrl: imageToSend || undefined,
        timestamp: new Date().toISOString(),
        read: false
      };

      await addDoc(messagesRef, newMsg);

      // Update parent privateChat doc
      await setDoc(doc(db, 'privateChats', selectedChat.id), {
        lastMessage: textToSend || '📷 Photo sent',
        lastMessageTime: new Date().toISOString(),
        lastSender: 'admin',
        visitorUnreadCount: (selectedChat as any).visitorUnreadCount ? (selectedChat as any).visitorUnreadCount + 1 : 1
      }, { merge: true });

    } catch (err) {
      console.error('Error sending admin message:', err);
      showNotice('Failed to send message. Please retry.');
    } finally {
      setSendingMsg(false);
    }
  };

  // Attach Image Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size exceeds 2MB limit. Please upload a smaller image.');
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

  // Quick Emoji Bar
  const quickEmojis = ['🚀', '🛰️', '⚡', '🌌', '🪐', '💬', '👍', '🔥', '✨', '👏', '🤝', '👋'];

  // Stats Counters
  const totalRequestsCount = requests.length;
  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;
  const activeChatsCount = chats.length;
  const totalMembersCount = visitors.filter(v => v.status === 'accepted').length;

  // Filter lists based on search
  const filteredRequests = requests.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChats = chats.filter(c => 
    c.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.visitorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.visitorLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVisitors = visitors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#121212] text-[#e4e6eb] flex flex-col font-sans">
      
      {/* Top Header: "ELON MUSK SPACE - Admin Control" */}
      <header className="bg-[#18191a] border-b border-[#2d2e30] sticky top-0 z-30 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-black font-black text-lg flex items-center justify-center shrink-0">
              X
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                  ELON MUSK SPACE - Admin Control
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  DIRECT ACCESS
                </span>
              </div>
              <p className="text-[11px] text-[#b0b3b8]">Direct Real-Time Control & Member Messaging Portal</p>
            </div>
          </div>

          {/* Action Buttons in Header: [Refresh] [Clear All Fake Data] [Visitor Landing] */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-lg bg-[#242526] hover:bg-[#3a3b3c] border border-[#3a3b3c] text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Reload requests & chats from Firebase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={handleClearAllFakeData}
              className="px-3 py-1.5 rounded-lg bg-[#242526] hover:bg-red-950/40 border border-[#3a3b3c] hover:border-red-500/50 text-xs font-semibold text-[#b0b3b8] hover:text-red-400 flex items-center gap-1.5 transition-colors"
              title="Delete all test data and start with an empty database"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Fake Data</span>
            </button>

            <button
              onClick={onBackToVisitor}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-extrabold uppercase flex items-center gap-1.5 transition-all shadow"
              title="Switch to Visitor view"
            >
              <span>Visitor Landing</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Action Flash Notification */}
        {actionNotice && (
          <div className="max-w-7xl mx-auto mt-2 px-3 py-1.5 bg-[#242526] border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
        )}
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* SECTION A: TOP STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#242526] border border-[#3a3b3c] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs font-bold text-[#b0b3b8] uppercase font-mono block">Total Requests</span>
              <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">{totalRequestsCount}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#18191a] border border-[#3a3b3c] flex items-center justify-center text-white">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#242526] border border-[#3a3b3c] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase font-mono block">Pending Approval</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 block">{pendingRequestsCount}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#18191a] border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#242526] border border-[#3a3b3c] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase font-mono block">Active Chats</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">{activeChatsCount}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#18191a] border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#242526] border border-[#3a3b3c] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs font-bold text-[#b0b3b8] uppercase font-mono block">Total Members</span>
              <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">{totalMembersCount}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#18191a] border border-[#3a3b3c] flex items-center justify-center text-white">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2d2e30] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => { setActiveTab('requests'); setSelectedChat(null); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#b0b3b8] hover:text-white bg-[#242526] border border-[#3a3b3c]'
              }`}
            >
              <span>Friend Requests</span>
              {pendingRequestsCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'requests' ? 'bg-red-600 text-white' : 'bg-red-500 text-white'
                }`}>
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('conversations')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'conversations'
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#b0b3b8] hover:text-white bg-[#242526] border border-[#3a3b3c]'
              }`}
            >
              <span>Conversations ({chats.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('visitors'); setSelectedChat(null); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'visitors'
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#b0b3b8] hover:text-white bg-[#242526] border border-[#3a3b3c]'
              }`}
            >
              <span>Visitors ({visitors.length})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8a8d91]" />
            <input
              type="text"
              placeholder="Search by name, email, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18191a] border border-[#3a3b3c] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#2d88ff]"
            />
          </div>
        </div>

        {/* SECTION B: FRIEND REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="bg-[#242526] border border-[#3a3b3c] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3a3b3c] pb-4">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wide">
                  Friend & Membership Requests ({requests.length})
                </h2>
                <p className="text-xs text-[#b0b3b8]">Live submissions from visitors seeking to join the space network.</p>
              </div>
              <span className="text-xs text-neutral-400 font-mono">Newest First</span>
            </div>

            {loadingData ? (
              <div className="py-16 text-center text-xs font-mono text-[#8a8d91]">
                Loading real requests from Firebase...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#18191a] border border-[#3a3b3c] flex items-center justify-center mx-auto text-neutral-500">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white">No requests yet - Waiting for real visitors</div>
                <p className="text-xs text-[#b0b3b8] max-w-sm mx-auto">
                  When a visitor submits the "Send Request to Join Space" form on the landing page, it will instantly appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#3a3b3c]">
                {filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#18191a]/40 px-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#18191a] border border-[#3a3b3c] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {req.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{req.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            req.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            req.status === 'declined' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#b0b3b8]">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-neutral-400" />
                            <span>{req.email}</span>
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            <span>{req.location}</span>
                          </span>
                          <span>·</span>
                          <span className="text-[11px] text-[#8a8d91] font-mono">
                            {new Date(req.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: [Accept] [Decline] or [Open Chat] */}
                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleAcceptRequest(req)}
                            className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs uppercase rounded-xl transition-all shadow flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(req)}
                            className="px-3.5 py-2 bg-[#18191a] hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-red-400 font-bold text-xs uppercase rounded-xl border border-[#3a3b3c] transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      ) : req.status === 'accepted' ? (
                        <button
                          onClick={() => {
                            const chat = chats.find(c => c.id === req.id);
                            if (chat) {
                              setSelectedChat(chat);
                            } else {
                              setSelectedChat({
                                id: req.id,
                                requestId: req.id,
                                visitorId: req.id,
                                visitorName: req.name,
                                visitorEmail: req.email,
                                visitorLocation: req.location,
                                status: 'active',
                                lastMessage: 'Channel opened by Admin',
                                lastMessageTime: new Date().toISOString(),
                                lastSender: 'admin',
                                adminUnreadCount: 0,
                                visitorUnreadCount: 0,
                                createdAt: req.timestamp || new Date().toISOString()
                              });
                            }
                            setActiveTab('conversations');
                          }}
                          className="px-3.5 py-1.5 bg-[#18191a] hover:bg-[#3a3b3c] text-white border border-[#3a3b3c] rounded-xl text-xs font-semibold flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Open Chat</span>
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-500 font-mono">Declined</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION C & D: CONVERSATIONS TAB & PRIVATE CHAT VIEW */}
        {activeTab === 'conversations' && (
          <div className="bg-[#242526] border border-[#3a3b3c] rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
            
            {/* Conversations List (4 columns) */}
            <div className={`md:col-span-4 border-r border-[#3a3b3c] flex flex-col justify-between ${
              selectedChat ? 'hidden md:flex' : 'flex'
            }`}>
              <div>
                <div className="p-4 border-b border-[#3a3b3c] flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Accepted Conversations ({chats.length})
                    </h3>
                    <p className="text-[11px] text-[#b0b3b8]">Real accepted members only. No fake bots.</p>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[550px] divide-y divide-[#3a3b3c]">
                  {filteredChats.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto" />
                      <div className="text-xs font-bold text-white">No conversations yet</div>
                      <p className="text-[11px] text-[#b0b3b8]">
                        Accept a friend request in the "Friend Requests" tab to unlock a chat channel.
                      </p>
                    </div>
                  ) : (
                    filteredChats.map((c) => {
                      const isSelected = selectedChat?.id === c.id;
                      const hasUnread = (c.adminUnreadCount || 0) > 0;

                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedChat(c)}
                          className={`p-4 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                            isSelected ? 'bg-[#18191a]' : 'hover:bg-[#18191a]/50'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-[#18191a] border border-[#3a3b3c] flex items-center justify-center text-white font-bold text-xs shrink-0">
                                {c.visitorName.charAt(0).toUpperCase()}
                              </div>
                              {hasUnread && (
                                <span className="w-3 h-3 bg-red-600 rounded-full border-2 border-[#242526] absolute top-0 right-0" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-white truncate">{c.visitorName}</span>
                                {hasUnread && (
                                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-[#8a8d91] truncate">{c.visitorEmail}</p>
                              <p className="text-xs text-[#b0b3b8] truncate mt-1">
                                {c.lastMessage || 'Channel active.'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-mono text-[#8a8d91] block">
                              {c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                            {hasUnread && (
                              <span className="mt-1 px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-mono font-bold inline-block">
                                {c.adminUnreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Private Chat View (8 columns) */}
            <div className={`md:col-span-8 flex flex-col justify-between h-[640px] sm:h-[700px] bg-[#121212] ${
              !selectedChat ? 'hidden md:flex' : 'flex'
            }`}>
              {selectedChat ? (
                <>
                  {/* Chat View Header */}
                  <div className="px-5 py-3.5 border-b border-[#3a3b3c] bg-[#18191a] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedChat(null)}
                        className="md:hidden p-1.5 -ml-1 text-[#b0b3b8] hover:text-white"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-[#242526] border border-[#3a3b3c] flex items-center justify-center font-bold text-sm text-white">
                          {selectedChat.visitorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="w-3 h-3 bg-emerald-500 border-2 border-[#18191a] rounded-full absolute bottom-0 right-0" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{selectedChat.visitorName}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">Channel Open</span>
                        </div>
                        <div className="text-[11px] text-[#b0b3b8] font-mono">
                          {selectedChat.visitorEmail} · {selectedChat.visitorLocation}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-[#8a8d91] block">ID: {selectedChat.id.substring(0, 8)}</span>
                    </div>
                  </div>

                  {/* Middle Area: CHANNEL OPEN Indicator */}
                  <div className="bg-[#18191a]/80 border-b border-[#2d2e30] py-2 px-4 text-center">
                    <span className="text-xs font-bold text-emerald-400 tracking-wide uppercase flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>CHANNEL OPEN - Encrypted 1-on-1 Direct Admin Session</span>
                    </span>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#121212]">
                    {messages.length === 0 ? (
                      <div className="py-20 text-center space-y-2">
                        <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto" />
                        <div className="text-xs font-bold text-white">No messages yet in this channel</div>
                        <p className="text-[11px] text-[#b0b3b8]">
                          Type a reply below to send your first message to {selectedChat.visitorName}.
                        </p>
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isAdminMsg = m.sender === 'admin';

                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-[#8a8d91]">
                              <span>{isAdminMsg ? 'You (Admin)' : selectedChat.visitorName}</span>
                              <span>·</span>
                              <span className="font-mono">
                                {new Date(m.timestamp || m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className={`max-w-[85%] sm:max-w-md rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                              isAdminMsg
                                ? 'bg-white text-black font-medium'
                                : 'bg-[#242526] text-white border border-[#3a3b3c]'
                            }`}>
                              {m.imageUrl && (
                                <div className="mb-2 rounded-xl overflow-hidden bg-black/30">
                                  <img
                                    src={m.imageUrl}
                                    alt="Attachment"
                                    className="w-full max-h-60 object-contain rounded-lg"
                                  />
                                </div>
                              )}
                              {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Bottom [Reply] Input Area that works instantly */}
                  <div className="p-3 sm:p-4 bg-[#18191a] border-t border-[#3a3b3c] space-y-2">
                    {attachedImage && (
                      <div className="relative inline-block border border-[#3a3b3c] rounded-xl overflow-hidden bg-[#242526] p-1">
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

                    {showEmojiPicker && (
                      <div className="flex items-center gap-1.5 p-2 bg-[#242526] border border-[#3a3b3c] rounded-xl overflow-x-auto">
                        {quickEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setMessageText(prev => prev + emoji)}
                            className="p-1 hover:bg-[#3a3b3c] rounded text-base"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handleSendAdminMessage} className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-2 text-[#b0b3b8] hover:text-white hover:bg-[#242526] rounded-xl transition-colors"
                          title="Add Emoji"
                        >
                          <Smile className="w-5 h-5" />
                        </button>

                        <label className="p-2 text-[#b0b3b8] hover:text-white hover:bg-[#242526] rounded-xl transition-colors cursor-pointer" title="Attach Receipt/Screenshot">
                          <ImageIcon className="w-5 h-5" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <input
                        type="text"
                        placeholder={`Reply directly to ${selectedChat.visitorName}...`}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="flex-1 bg-[#242526] border border-[#3a3b3c] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#2d88ff]"
                      />

                      <button
                        type="submit"
                        disabled={sendingMsg || (!messageText.trim() && !attachedImage)}
                        className="px-4 py-2.5 bg-white text-black font-extrabold text-xs uppercase rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-40 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#18191a] border border-[#3a3b3c] flex items-center justify-center text-[#b0b3b8]">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-white uppercase">Direct Visitor Communication</h3>
                  <p className="text-xs text-[#b0b3b8] max-w-sm">
                    Select an accepted conversation on the left to review message history or reply in real time.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* SECTION E: VISITORS TAB */}
        {activeTab === 'visitors' && (
          <div className="bg-[#242526] border border-[#3a3b3c] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3a3b3c] pb-4">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wide">
                  Complete Visitors Registry ({visitors.length})
                </h2>
                <p className="text-xs text-[#b0b3b8]">Live member entries saved in Firebase `visitors` collection.</p>
              </div>
            </div>

            {filteredVisitors.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#8a8d91]">
                No visitors registered in the database yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#18191a] text-[#b0b3b8] uppercase font-mono border-b border-[#3a3b3c]">
                    <tr>
                      <th className="py-3 px-3">Visitor Name</th>
                      <th className="py-3 px-3">Email</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Joined Time</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3a3b3c]">
                    {filteredVisitors.map((v) => (
                      <tr key={v.id} className="hover:bg-[#18191a]/40">
                        <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#18191a] border border-[#3a3b3c] flex items-center justify-center text-xs">
                            {v.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{v.name}</span>
                        </td>
                        <td className="py-3 px-3 text-[#b0b3b8] font-mono">{v.email}</td>
                        <td className="py-3 px-3 text-white">{v.location}</td>
                        <td className="py-3 px-3 text-[#8a8d91] font-mono">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            v.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            v.status === 'declined' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => {
                              const chat = chats.find(c => c.id === v.id);
                              if (chat) {
                                setSelectedChat(chat);
                                setActiveTab('conversations');
                              } else {
                                setActiveTab('requests');
                              }
                            }}
                            className="px-2.5 py-1 bg-[#18191a] hover:bg-[#3a3b3c] text-white border border-[#3a3b3c] rounded text-[11px]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
};
