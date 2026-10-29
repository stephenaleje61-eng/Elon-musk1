import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  X, 
  Users, 
  DollarSign, 
  Search, 
  Eye, 
  Trash2,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { ScamReport, ReportStatus } from '../types';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, refreshProfile } = useAuth();
  
  const [adminPasskey, setAdminPasskey] = useState<string>('');
  const [authorized, setAuthorized] = useState<boolean>(isAdmin);
  const [authError, setAuthError] = useState<string | null>(null);

  // Data
  const [cases, setCases] = useState<ScamReport[]>([]);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCase, setSelectedCase] = useState<ScamReport | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [newStatus, setNewStatus] = useState<ReportStatus>('under_review');
  const [savingCase, setSavingCase] = useState<boolean>(false);

  // Sync authorization
  useEffect(() => {
    if (isAdmin) setAuthorized(true);
  }, [isAdmin]);

  // Load cases and reports if authorized
  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load Scam Reports from Firestore
      try {
        const scamSnap = await getDocs(collection(db, 'scam_reports'));
        const fetchedCases: ScamReport[] = [];
        scamSnap.forEach(d => {
          fetchedCases.push({ id: d.id, ...d.data() } as ScamReport);
        });
        fetchedCases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setCases(fetchedCases);
      } catch (firestoreErr) {
        console.warn('Admin Firestore scan skipped or offline:', firestoreErr);
        // Scan local storage for cases
        const allLocalCases: ScamReport[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('ems_cases_')) {
            try {
              const items: ScamReport[] = JSON.parse(localStorage.getItem(key) || '[]');
              allLocalCases.push(...items);
            } catch {}
          }
        }
        allLocalCases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setCases(allLocalCases);
      }

      // Load User Abuse Reports
      try {
        const reportSnap = await getDocs(collection(db, 'user_reports'));
        const fetchedReports: any[] = [];
        reportSnap.forEach(d => {
          fetchedReports.push({ id: d.id, ...d.data() });
        });
        setUserReports(fetchedReports);
      } catch {}
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized && isOpen) {
      loadAdminData();
    }
  }, [authorized, isOpen]);

  if (!isOpen) return null;

  // Authorize with owner passkey or designated email
  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Secure owner authorization: valid passkey or admin email
    if (adminPasskey.trim() === 'SPACE_SECURE_2026' || user.email === 'pathogenmcb@gmail.com') {
      try {
        // Record admin token in Firestore admins collection
        await setDoc(doc(db, 'admins', user.uid), {
          uid: user.uid,
          email: user.email || 'pathogenmcb@gmail.com',
          authorizedAt: new Date().toISOString()
        });
        await refreshProfile();
        setAuthorized(true);
        setAuthError(null);
      } catch (err) {
        setAuthError('Failed to grant database admin authorization: ' + String(err));
      }
    } else {
      setAuthError('Invalid administrator credentials.');
    }
  };

  const handleUpdateCaseStatus = async () => {
    if (!selectedCase) return;
    setSavingCase(true);
    const path = `scam_reports/${selectedCase.id}`;

    try {
      await updateDoc(doc(db, 'scam_reports', selectedCase.id), {
        status: newStatus,
        adminNotes: editingNotes.trim(),
        updatedAt: new Date().toISOString()
      });

      setCases(prev => prev.map(c => 
        c.id === selectedCase.id ? { ...c, status: newStatus, adminNotes: editingNotes.trim() } : c
      ));
      setSelectedCase(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    } finally {
      setSavingCase(false);
    }
  };

  const totalReportedLoss = cases.reduce((acc, c) => acc + (Number(c.amountLost) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto p-6 text-white space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-neutral-300" />
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight text-white">
                Website Owner & Compliance Administration
              </h2>
              <span className="text-[11px] font-mono text-neutral-500">
                Protected Operations Desk · Verified Session Only
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AUTH GATE IF NOT VERIFIED */}
        {!authorized ? (
          <div className="py-12 max-w-md mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold uppercase text-white">Restricted Administrator Area</h3>
            <p className="text-xs text-neutral-400">
              Access is restricted to verified administrators and platform owner pathogenmcb@gmail.com.
            </p>

            {authError && (
              <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-xs text-red-400">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthorize} className="space-y-3 pt-2 text-xs">
              <input
                type="password"
                placeholder="Enter Administrator Passkey (SPACE_SECURE_2026)"
                value={adminPasskey}
                onChange={(e) => setAdminPasskey(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-white text-black font-extrabold uppercase rounded-xl hover:bg-neutral-200"
              >
                Verify & Unlock Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* AUTHORIZED DASHBOARD VIEW */
          <div className="space-y-6">
            
            {/* KPI Analytics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl">
                <span className="text-[10px] uppercase font-mono text-neutral-400 block">Total Dockets Filed</span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">{cases.length}</span>
              </div>
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl">
                <span className="text-[10px] uppercase font-mono text-neutral-400 block">Total Loss Documented</span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  ${totalReportedLoss.toLocaleString()}
                </span>
              </div>
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl">
                <span className="text-[10px] uppercase font-mono text-neutral-400 block">Safety Abuse Reports</span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">{userReports.length}</span>
              </div>
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl">
                <span className="text-[10px] uppercase font-mono text-neutral-400 block">Pending Reviews</span>
                <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                  {cases.filter(c => c.status === 'submitted' || c.status === 'under_review').length}
                </span>
              </div>
            </div>

            {/* Case Management Table */}
            <div className="border border-neutral-900 rounded-xl overflow-hidden bg-neutral-950">
              <div className="p-4 bg-neutral-900/40 border-b border-neutral-900 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Reported Scam Incidents ({cases.length})
                </h3>
                <button
                  onClick={loadAdminData}
                  className="text-xs text-neutral-400 hover:text-white font-mono"
                >
                  Refresh Data
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs font-mono text-neutral-500">
                  Loading database records...
                </div>
              ) : cases.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  No scam incident records found in the database.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-neutral-900/80 text-neutral-400 uppercase font-mono sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Docket #</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {cases.map((c) => (
                        <tr key={c.id} className="hover:bg-neutral-900/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-white">{c.caseNumber}</td>
                          <td className="py-2.5 px-3 text-neutral-300 max-w-[150px] truncate">{c.scamType}</td>
                          <td className="py-2.5 px-3 font-mono text-white">
                            {c.currency} {c.amountLost.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-400 font-mono">{c.incidentDate}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-900 border border-neutral-800 text-neutral-300">
                              {c.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => {
                                setSelectedCase(c);
                                setNewStatus(c.status);
                                setEditingNotes(c.adminNotes || '');
                              }}
                              className="px-2.5 py-1 bg-white text-black font-bold rounded text-[11px] uppercase hover:bg-neutral-200"
                            >
                              Triage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* User Reports & Content Moderation */}
            {userReports.length > 0 && (
              <div className="border border-neutral-900 rounded-xl p-4 bg-neutral-950 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Reported Abusive Users & Chat Flagging ({userReports.length})
                </h3>
                <div className="space-y-2 text-xs">
                  {userReports.map((r) => (
                    <div key={r.id} className="p-3 bg-neutral-900/60 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="font-mono text-neutral-400 block text-[10px]">Target User: {r.targetUserId}</span>
                        <span className="text-white font-medium">{r.reason}</span>
                        <p className="text-neutral-400 mt-0.5">{r.details}</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-neutral-800 text-[10px] font-mono text-neutral-300 uppercase">
                        {r.status || 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TRIAGE CASE DETAIL MODAL */}
        {selectedCase && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 text-white space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <div>
                  <span className="text-xs font-mono text-neutral-400 uppercase">Docket Investigation</span>
                  <h3 className="text-lg font-bold text-white font-mono">{selectedCase.caseNumber}</h3>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block">Victim Statement:</span>
                  <p className="text-neutral-300 bg-neutral-900 p-3 rounded-lg leading-relaxed mt-0.5 whitespace-pre-wrap">
                    {selectedCase.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <div>
                    <span className="text-neutral-500 uppercase text-[10px] block">Amount:</span>
                    <span className="text-white">{selectedCase.currency} {selectedCase.amountLost}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase text-[10px] block">Method:</span>
                    <span className="text-white">{selectedCase.paymentMethod}</span>
                  </div>
                </div>

                {selectedCase.evidenceUrls && selectedCase.evidenceUrls.length > 0 && (
                  <div>
                    <span className="text-neutral-500 uppercase text-[10px] block mb-1">Attached Evidence:</span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selectedCase.evidenceUrls.map((u, i) => (
                        <img key={i} src={u} alt="Evidence" className="h-20 w-20 object-cover rounded-lg border border-neutral-800" />
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <label className="block text-neutral-400 uppercase text-[10px] font-bold mb-1">
                    Update Investigation Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="submitted">Submitted (Awaiting Triage)</option>
                    <option value="under_review">Under Review (Forensics Active)</option>
                    <option value="escalated">Escalated to Authorities (IC3 / Police)</option>
                    <option value="closed">Closed / Resolution Documented</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase text-[10px] font-bold mb-1">
                    Official Admin Guidance / Case Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide official feedback visible to victim on case tracking page..."
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingCase}
                  onClick={handleUpdateCaseStatus}
                  className="flex-1 py-2.5 bg-white hover:bg-neutral-200 text-black font-bold rounded-xl text-xs uppercase"
                >
                  {savingCase ? 'Updating...' : 'Save Case Updates'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
