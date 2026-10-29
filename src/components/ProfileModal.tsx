import React, { useState } from 'react';
import { 
  User, 
  X, 
  Check, 
  Copy, 
  AlertTriangle, 
  LogOut, 
  ShieldAlert, 
  Upload,
  Info,
  LogIn,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { 
    user, 
    profile, 
    updateProfileDetails, 
    logout, 
    signInAnonymous, 
    signInWithGoogle,
    firebaseAuthError 
  } = useAuth();
  
  const [displayName, setDisplayName] = useState<string>(profile?.displayName || '');
  const [bio, setBio] = useState<string>(profile?.bio || '');
  const [photoURL, setPhotoURL] = useState<string>(profile?.photoURL || '');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyId = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfileDetails(displayName, bio, photoURL);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      alert('Avatar image exceeds 1.5MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoURL(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 text-white space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-neutral-300" />
            <h2 className="text-xl font-bold uppercase tracking-tight text-white">
              Cosmonaut Profile & Session
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Backend Infrastructure Info */}
        <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-mono text-[10px] uppercase flex items-center gap-1">
              <Database className="w-3 h-3 text-neutral-400" />
              <span>Backend Infrastructure Status</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Provisioned</span>
          </div>
          <div className="text-[11px] text-neutral-300 font-mono truncate">
            DB: ai-studio-2298c818-c3ed-4ce2-9e40-e963cb25b2c0
          </div>
        </div>

        {/* User Session ID Banner */}
        <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 uppercase font-mono text-[10px] tracking-wider">
              {user?.email ? 'Authenticated Account' : 'Anonymous Session ID'}
            </span>
            <button
              onClick={handleCopyId}
              className="text-xs text-neutral-300 hover:text-white flex items-center gap-1 font-mono"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
            </button>
          </div>
          <div className="font-mono text-xs text-white bg-black/60 p-2.5 rounded-lg break-all border border-neutral-800 select-all">
            {user?.email ? `${user.email} (${user.uid})` : (user?.uid || 'Initializing...')}
          </div>
        </div>

        {/* Google Authentication Option */}
        {!user?.email && (
          <div className="p-4 bg-neutral-900/30 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wide">
                Link with Google Account
              </span>
              <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded font-mono">
                Official Auth
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Google Sign-In enables verified cloud syncing for your cases and conversations across any device or browser.
            </p>
            <button
              onClick={signInWithGoogle}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4 text-white" />
              <span>Sign In with Google</span>
            </button>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* Avatar Preview & Upload */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center shrink-0">
              {photoURL ? (
                <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold font-mono text-neutral-400">
                  {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <label className="block text-neutral-400 font-semibold uppercase">Profile Avatar (Optional)</label>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-white font-medium cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-neutral-400" />
                <span>Upload Picture</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 font-semibold uppercase mb-1">
              Display Name (Optional)
            </label>
            <input
              type="text"
              maxLength={60}
              placeholder="e.g. Orbital Pioneer"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white text-xs"
            />
          </div>

          <div>
            <label className="block text-neutral-400 font-semibold uppercase mb-1">
              Biography / Focus Area (Optional)
            </label>
            <textarea
              rows={3}
              maxLength={300}
              placeholder="e.g. Space enthusiast interested in Starship and Tesla electric vehicles..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-white text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-white text-black font-extrabold uppercase rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Profile Saved</span>
              </>
            ) : (
              <span>{saving ? 'Saving...' : 'Update Profile Details'}</span>
            )}
          </button>
        </form>

        {/* ACCOUNT RECOVERY NOTICE */}
        <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-2 text-xs text-neutral-400">
          <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Anonymous Account Recovery Guidance</span>
          </div>
          <p className="leading-relaxed">
            Your anonymous session is tied to this browser's local storage token. If browser data is cleared without linking a Google account, <strong className="text-white">anonymous credentials cannot be recovered</strong>.
          </p>
        </div>

        {/* Logout / Switch Session Action */}
        <div className="pt-2 border-t border-neutral-900 flex justify-between items-center">
          <button
            onClick={async () => {
              await logout();
              onClose();
            }}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-neutral-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Reset Session</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
