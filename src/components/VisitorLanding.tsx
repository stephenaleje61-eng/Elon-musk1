import React, { useState, useEffect, useRef } from 'react';
import { 
  UserPlus, 
  Clock, 
  CheckCircle, 
  Send, 
  Image as ImageIcon, 
  Smile, 
  X, 
  ShieldCheck, 
  MessageSquare, 
  MapPin, 
  Mail, 
  User, 
  Lock,
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc 
} from 'firebase/firestore';
import { FriendRequest, ChatMessage, PrivateChat } from '../types';

export const VisitorLanding: React.FC<{ onNavigateAdmin?: () => void }> = ({ onNavigateAdmin }) => {
  // Visitor Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Active Request State
  const [requestId, setRequestId] = useState<string | null>(() => {
    return localStorage.getItem('ems_visitor_request_id');
  });
  const [currentRequest, setCurrentRequest] = useState<FriendRequest | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);

  // Chat State (When accepted)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen to the visitor's Friend Request in real time
  useEffect(() => {
    if (!requestId) {
      setCurrentRequest(null);
      return;
    }

    setLoadingStatus(true);
    const reqRef = doc(db, 'friendRequests', requestId);
    const unsubscribe = onSnapshot(reqRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as FriendRequest;
        setCurrentRequest(data);
      } else {
        // Document was removed or not found
        setCurrentRequest(null);
      }
      setLoadingStatus(false);
    }, (error) => {
      console.warn('Error listening to friend request:', error);
      setLoadingStatus(false);
    });

    return () => unsubscribe();
  }, [requestId]);

  // Listen to Real-Time Messages when status is accepted
  useEffect(() => {
    if (!requestId || currentRequest?.status !== 'accepted') {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, 'privateChats', requestId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((d) => {
        msgs.push({ id: d.id, ...d.data() } as ChatMessage);
      });
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (err) => {
      console.warn('Error listening to private chat messages:', err);
    });

    return () => unsubscribe();
  }, [requestId, currentRequest?.status]);

  // Submit Friend Request
  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanLocation = location.trim();

    if (!cleanName || !cleanEmail || !cleanLocation) {
      setFormError('Please fill in your Name, Email, and Location to join.');
      return;
    }

    setSubmitting(true);
    try {
      // Deterministic or clean ID based on timestamp
      const newReqRef = doc(collection(db, 'friendRequests'));
      const id = newReqRef.id;

      const newFriendRequest: FriendRequest = {
        id,
        name: cleanName,
        email: cleanEmail,
        location: cleanLocation,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      // 1. Save to friendRequests collection
      await setDoc(newReqRef, newFriendRequest);

      // 2. Save/update visitors collection
      await setDoc(doc(db, 'visitors', id), {
        id,
        name: cleanName,
        email: cleanEmail,
        location: cleanLocation,
        status: 'pending',
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

      // Save local reference for session persistence
      localStorage.setItem('ems_visitor_request_id', id);
      localStorage.setItem('ems_visitor_name', cleanName);
      localStorage.setItem('ems_visitor_email', cleanEmail);
      setRequestId(id);
      setCurrentRequest(newFriendRequest);

    } catch (err: any) {
      console.error('Error submitting friend request:', err);
      setFormError('Failed to send request. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel / Restart Request
  const handleResetRequest = () => {
    if (window.confirm('Reset your current session and start a new request?')) {
      localStorage.removeItem('ems_visitor_request_id');
      localStorage.removeItem('ems_visitor_name');
      localStorage.removeItem('ems_visitor_email');
      setRequestId(null);
      setCurrentRequest(null);
      setName('');
      setEmail('');
      setLocation('');
    }
  };

  // Send Message in Private Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId || (!messageText.trim() && !attachedImage)) return;

    setSendingMsg(true);
    const textToSend = messageText.trim();
    const imageToSend = attachedImage;

    setMessageText('');
    setAttachedImage(null);
    setShowEmojiPicker(false);

    try {
      const messagesRef = collection(db, 'privateChats', requestId, 'messages');
      const newMsg: Omit<ChatMessage, 'id'> = {
        sender: 'visitor',
        senderName: currentRequest?.name || 'Visitor',
        text: textToSend,
        imageUrl: imageToSend || undefined,
        timestamp: new Date().toISOString(),
        read: false
      };

      await addDoc(messagesRef, newMsg);

      // Update parent privateChat doc
      await setDoc(doc(db, 'privateChats', requestId), {
        id: requestId,
        requestId,
        visitorId: requestId,
        visitorName: currentRequest?.name || 'Visitor',
        visitorEmail: currentRequest?.email || '',
        visitorLocation: currentRequest?.location || '',
        status: 'active',
        lastMessage: textToSend || '📷 Photo sent',
        lastMessageTime: new Date().toISOString(),
        lastSender: 'visitor',
        adminUnreadCount: (currentRequest as any)?.adminUnreadCount ? (currentRequest as any).adminUnreadCount + 1 : 1,
        createdAt: currentRequest?.timestamp || new Date().toISOString()
      }, { merge: true });

    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  // Image Upload Handler
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

  const quickEmojis = ['🚀', '🛰️', '⚡', '🌌', '🪐', '💬', '👍', '🔥', '✨', '👏'];

  return (
    <div className="min-h-screen bg-[#121212] text-[#e4e6eb] flex flex-col font-sans">
      
      {/* Top Facebook-Style Navigation Bar */}
      <header className="bg-[#18191a] border-b border-[#2d2e30] sticky top-0 z-30 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#242526] border border-[#3a3b3c] flex items-center justify-center text-white font-black text-lg">
              X
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                ELON MUSK SPACE
              </span>
              <span className="text-[11px] text-[#b0b3b8] block -mt-0.5">
                Community Network · Fan Club
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentRequest && (
              <button
                onClick={handleResetRequest}
                className="text-xs text-[#b0b3b8] hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242526] hover:bg-[#3a3b3c] border border-[#3a3b3c] transition-colors"
                title="Reset session and start a new request"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>New Request</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        
        {/* CASE 1: NO REQUEST FILED YET -> SHOW LANDING PAGE & JOIN FORM */}
        {!currentRequest && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Hero Card */}
            <div className="bg-[#242526] border border-[#3a3b3c] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#18191a] border border-[#3a3b3c] rounded-full text-xs text-[#b0b3b8] font-mono">
                <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
                <span>Space Enthusiast & Technology Community</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
                ELON MUSK SPACE - Community Network
              </h1>

              <p className="text-sm sm:text-base text-[#b0b3b8] max-w-2xl mx-auto leading-relaxed">
                Connect with verified community admins and fellow aerospace enthusiasts. Fill in your details below to send your friend connection request to join the space network.
              </p>
            </div>

            {/* Join Form Card (Facebook-style profile invitation) */}
            <div className="bg-[#242526] border border-[#3a3b3c] rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 border-b border-[#3a3b3c] pb-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#18191a] border border-[#3a3b3c] flex items-center justify-center text-white">
                  <UserPlus className="w-5 h-5 text-neutral-300" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Member Registration Request</h2>
                  <p className="text-xs text-[#b0b3b8]">All submissions are reviewed directly by community administrators.</p>
                </div>
              </div>

              {formError && (
                <div className="mb-6 p-4 bg-red-950/40 border border-red-500/50 rounded-xl text-xs text-red-400">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSendRequest} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b0b3b8] mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Your Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#18191a] border border-[#3a3b3c] rounded-xl px-4 py-3 text-sm text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#2d88ff] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b0b3b8] mb-2 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. johndoe@spacemail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#18191a] border border-[#3a3b3c] rounded-xl px-4 py-3 text-sm text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#2d88ff] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b0b3b8] mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Location (City, Country) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Austin, Texas, USA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#18191a] border border-[#3a3b3c] rounded-xl px-4 py-3 text-sm text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#2d88ff] transition-colors"
                  />
                </div>

                {/* ONE BIG BUTTON: "Send Request to Join Space" (Facebook Add Friend Style) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-white hover:bg-neutral-200 text-black font-extrabold text-base tracking-wide uppercase rounded-xl transition-all active:scale-[0.99] shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <UserPlus className="w-5 h-5 text-black" />
                    <span>{submitting ? 'Submitting Request...' : 'Send Request to Join Space'}</span>
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* CASE 2: REQUEST IS PENDING -> "Request Sent - Waiting for Admin Approval" */}
        {currentRequest && currentRequest.status === 'pending' && (
          <div className="bg-[#242526] border border-[#3a3b3c] rounded-2xl p-6 sm:p-10 text-center space-y-6 shadow-2xl animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#18191a] border-2 border-amber-500/50 text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Request Sent - Waiting for Admin Approval
              </h2>
              <p className="text-sm text-[#b0b3b8] max-w-lg mx-auto">
                Thank you, <strong className="text-white">{currentRequest.name}</strong>! Your friend connection request has been securely delivered to the Community Admin.
              </p>
            </div>

            {/* Pending Details Box */}
            <div className="max-w-md mx-auto bg-[#18191a] border border-[#3a3b3c] rounded-xl p-4 text-xs text-left space-y-2 font-mono">
              <div className="flex justify-between py-1 border-b border-[#2d2e30]">
                <span className="text-[#8a8d91]">Status:</span>
                <span className="text-amber-400 font-bold uppercase">Pending Verification</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2d2e30]">
                <span className="text-[#8a8d91]">Submitted Email:</span>
                <span className="text-white truncate max-w-[200px]">{currentRequest.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2d2e30]">
                <span className="text-[#8a8d91]">Location:</span>
                <span className="text-white">{currentRequest.location}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8a8d91]">Request ID:</span>
                <span className="text-neutral-400 select-all">{currentRequest.id}</span>
              </div>
            </div>

            <div className="p-4 bg-[#18191a]/60 border border-[#3a3b3c] rounded-xl text-xs text-[#b0b3b8] max-w-lg mx-auto leading-relaxed">
              <span className="text-white font-bold block mb-1">Live Real-Time Sync Active</span>
              This page will automatically refresh into the private encrypted chat the moment the admin accepts your request. No manual reload needed.
            </div>

            <div className="pt-2">
              <button
                onClick={handleResetRequest}
                className="text-xs text-[#b0b3b8] hover:text-white underline font-medium"
              >
                Cancel and Submit Different Details
              </button>
            </div>
          </div>
        )}

        {/* CASE 3: REQUEST WAS DECLINED */}
        {currentRequest && currentRequest.status === 'declined' && (
          <div className="bg-[#242526] border border-[#3a3b3c] rounded-2xl p-8 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-red-950/50 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
              <X className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white uppercase">Membership Request Not Approved</h2>
            <p className="text-xs text-[#b0b3b8] max-w-md mx-auto">
              The community admin was unable to approve this request at this time. You may submit a new request with verified details.
            </p>
            <button
              onClick={handleResetRequest}
              className="mt-4 px-6 py-2.5 bg-white text-black text-xs font-bold uppercase rounded-xl hover:bg-neutral-200"
            >
              Start New Request
            </button>
          </div>
        )}

        {/* CASE 4: REQUEST ACCEPTED -> REAL-TIME PRIVATE CHAT UNLOCKED */}
        {currentRequest && currentRequest.status === 'accepted' && (
          <div className="bg-[#242526] border border-[#3a3b3c] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[700px] animate-fadeIn">
            
            {/* Chat Room Top Bar */}
            <div className="p-4 bg-[#18191a] border-b border-[#3a3b3c] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#242526] border border-[#3a3b3c] flex items-center justify-center text-white font-bold text-sm">
                    ADM
                  </div>
                  <span className="w-3 h-3 bg-emerald-500 border-2 border-[#18191a] rounded-full absolute bottom-0 right-0" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Space Community Admin</span>
                    <span className="text-[10px] bg-white text-black font-bold px-1.5 py-0.2 rounded font-mono">
                      OFFICIAL ADMIN
                    </span>
                  </div>
                  <div className="text-[11px] text-[#b0b3b8] flex items-center gap-1.5 font-mono">
                    <span>Connected with: {currentRequest.name}</span>
                    <span>·</span>
                    <span className="text-emerald-400">Channel Unlocked</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono text-[#8a8d91] block">ID: {currentRequest.id.substring(0, 8)}</span>
              </div>
            </div>

            {/* CHANNEL OPEN BANNER */}
            <div className="bg-[#18191a]/80 border-b border-[#2d2e30] py-2 px-4 text-center">
              <span className="text-xs font-bold text-emerald-400 tracking-wide uppercase flex items-center justify-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Channel Open - You are now connected. You can message the admin directly</span>
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#121212]">
              {messages.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#242526] border border-[#3a3b3c] flex items-center justify-center mx-auto text-[#b0b3b8]">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-white">Private Conversation Started</div>
                  <p className="text-xs text-[#b0b3b8] max-w-sm mx-auto">
                    Type your message below to communicate directly with the admin. Only you and the admin can see these messages.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isVisitor = m.sender === 'visitor';

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isVisitor ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-[#8a8d91]">
                        <span>{isVisitor ? 'You' : 'Community Admin'}</span>
                        <span>·</span>
                        <span className="font-mono">
                          {new Date(m.timestamp || m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className={`max-w-[85%] sm:max-w-md rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                        isVisitor
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

            {/* Message Input Toolbar */}
            <div className="p-3 sm:p-4 bg-[#18191a] border-t border-[#3a3b3c] space-y-2">
              
              {/* Attached Image Preview */}
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

              {/* Emoji Bar */}
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

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
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
                  placeholder="Type a message to admin..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 bg-[#242526] border border-[#3a3b3c] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#2d88ff] transition-colors"
                />

                <button
                  type="submit"
                  disabled={sendingMsg || (!messageText.trim() && !attachedImage)}
                  className="p-2.5 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-40"
                  aria-label="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
