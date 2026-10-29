import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Lock, 
  Info,
  DollarSign,
  Calendar,
  CreditCard,
  Hash,
  ChevronRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { ScamReport, ScamType, PaymentMethod, ReportStatus } from '../types';

export const ScamRecoveryCentre: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'report' | 'track' | 'guidance'>('report');
  
  // Form State
  const [scamType, setScamType] = useState<ScamType>('Crypto / Impersonation Scam');
  const [amountLost, setAmountLost] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [incidentDate, setIncidentDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cryptocurrency (BTC/ETH/USDT/Solana)');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tracked Cases State
  const [userCases, setUserCases] = useState<ScamReport[]>([]);
  const [loadingCases, setLoadingCases] = useState<boolean>(false);
  const [selectedCase, setSelectedCase] = useState<ScamReport | null>(null);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit. Please attach smaller screenshots.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEvidenceFiles(prev => [...prev, event.target!.result as string].slice(0, 4));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEvidence = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Helper to get local cases
  const getLocalCases = (uid: string): ScamReport[] => {
    try {
      const raw = localStorage.getItem(`ems_cases_${uid}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  // Helper to save local cases
  const saveLocalCase = (uid: string, report: ScamReport) => {
    try {
      const existing = getLocalCases(uid);
      const updated = [report, ...existing.filter(c => c.id !== report.id)];
      localStorage.setItem(`ems_cases_${uid}`, JSON.stringify(updated));
    } catch (err) {
      console.warn('Local case storage error:', err);
    }
  };

  // Submit Incident Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Please wait for your session to initialize.');
      return;
    }

    if (!amountLost || Number(amountLost) <= 0) {
      setErrorMsg('Please specify a valid monetary amount lost.');
      return;
    }

    if (!incidentDate) {
      setErrorMsg('Please select the incident date.');
      return;
    }

    if (!description.trim() || description.length < 20) {
      setErrorMsg('Please provide a descriptive account (minimum 20 characters).');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const generatedCaseNum = `EMS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newReport: ScamReport = {
      id: 'case_' + Math.random().toString(36).substring(2, 10),
      caseNumber: generatedCaseNum,
      userId: user.uid,
      userEmailOrName: profile?.displayName || `User-${user.uid.substring(0, 6)}`,
      scamType,
      amountLost: Number(amountLost),
      currency,
      incidentDate,
      paymentMethod,
      transactionReference: transactionRef.trim() || 'N/A',
      description: description.trim(),
      evidenceUrls: evidenceFiles,
      status: 'submitted',
      adminNotes: 'Case docket generated. Initial triage pending.',
      officialGuidanceSteps: [
        'Notify your card issuer or banking fraud department within 24-72 hours to request a chargeback or wire recall.',
        'File an official cybercrime report with your national authority (IC3, Action Fraud, or Europol).',
        'Preserve all communication logs, wallet addresses, and email headers without deleting evidence.'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Always preserve locally so data is 100% persistent
    saveLocalCase(user.uid, newReport);

    const path = 'scam_reports';
    try {
      const docRef = await addDoc(collection(db, path), newReport);
      newReport.id = docRef.id;
      saveLocalCase(user.uid, newReport);
    } catch (err) {
      console.warn('Firestore write failed, report saved in persistent session:', err);
    } finally {
      setSubmittedCaseId(generatedCaseNum);
      setUserCases(prev => [newReport, ...prev.filter(c => c.caseNumber !== generatedCaseNum)]);
      setAmountLost('');
      setDescription('');
      setTransactionRef('');
      setEvidenceFiles([]);
      setActiveTab('track');
      setSubmitting(false);
    }
  };

  // Load User Submitted Cases
  useEffect(() => {
    if (!user) return;
    setLoadingCases(true);
    
    // Initial load from local backup
    const local = getLocalCases(user.uid);
    setUserCases(local);

    const path = 'scam_reports';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreCases: ScamReport[] = [];
        snapshot.forEach(docSnap => {
          firestoreCases.push({ id: docSnap.id, ...docSnap.data() } as ScamReport);
        });

        // Merge firestore and local cases uniquely
        const mergedMap = new Map<string, ScamReport>();
        [...firestoreCases, ...local].forEach(c => {
          mergedMap.set(c.caseNumber, c);
        });

        const merged = Array.from(mergedMap.values());
        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserCases(merged);
        setLoadingCases(false);
      }, (error) => {
        console.warn('Firestore subscription status:', error.message);
        setLoadingCases(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore query skipped:', err);
      setLoadingCases(false);
    }
  }, [user]);

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Under Initial Review</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-white font-mono">
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span>Forensic Triage in Progress</span>
          </span>
        );
      case 'escalated':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-white font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Escalated to Authorities</span>
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500" />
            <span>Case Concluded</span>
          </span>
        );
      default:
        return <span className="text-xs text-neutral-400 font-mono">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-8 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="mb-8 border-b border-neutral-900 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2">
          <ShieldAlert className="w-4 h-4 text-white" />
          <span>Independent Fraud Reporting & Evidence Docket</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
          Scam Money Recovery Centre
        </h1>
        <p className="mt-2 text-neutral-400 text-sm sm:text-base max-w-3xl">
          Report cyber fraud incidents, document transaction evidence, receive immediate steps for banking dispute resolution, and track your case status.
        </p>
      </div>

      {/* CRITICAL SECURITY WARNING BANNER */}
      <div className="mb-8 p-4 sm:p-5 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-black" />
        </div>
        <div className="flex-1">
          <div className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <span>Critical Security Mandate</span>
            <span className="text-xs bg-neutral-900 text-neutral-300 px-2 py-0.5 rounded border border-neutral-800">Do Not Compromise</span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400 leading-relaxed">
            <strong className="text-white">NEVER share your banking PINs, login passwords, One-Time Passcodes (OTPs), or crypto wallet recovery phrases (seed phrases).</strong> Verified authorities, financial institutions, and security personnel will NEVER request your private keys. Beware of secondary "recovery agents" claiming guaranteed funds recovery on Telegram, WhatsApp, or X.
          </p>
          <div className="mt-2 text-xs text-neutral-500 font-mono">
            Notice: This centre is an independent informational and reporting platform. We do not promise guaranteed recovery of lost money. Elon Musk and Tesla do not personally recover private funds.
          </div>
        </div>
      </div>

      {/* Navigation Segmented Controls */}
      <div className="flex items-center gap-2 border-b border-neutral-900 pb-4 mb-8">
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'report'
              ? 'bg-white text-black shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          File Incident Report
        </button>
        <button
          onClick={() => setActiveTab('track')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'track'
              ? 'bg-white text-black shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <span>Track Submitted Cases</span>
          {userCases.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
              activeTab === 'track' ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300'
            }`}>
              {userCases.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('guidance')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'guidance'
              ? 'bg-white text-black shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          Official Authority Directory
        </button>
      </div>

      {/* TAB 1: INCIDENT REPORT FORM */}
      {activeTab === 'report' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form (2 columns) */}
          <div className="lg:col-span-2 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-900">
              <h2 className="text-xl font-bold uppercase tracking-wide text-white">
                Suspicious Incident Docket
              </h2>
              <span className="text-xs text-neutral-500 font-mono">Confidential Case Intake</span>
            </div>

            {submittedCaseId && (
              <div className="mb-6 p-4 bg-neutral-900 border border-neutral-700 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-neutral-400 uppercase font-mono">Case Docket Registered</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">{submittedCaseId}</div>
                  <div className="text-xs text-neutral-400 mt-1">Saved to secure database. Track status below.</div>
                </div>
                <button
                  onClick={() => setActiveTab('track')}
                  className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200"
                >
                  View Case
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 bg-neutral-900 border border-red-500/50 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReport} className="space-y-6">
              
              {/* Scam Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Scam Classification *
                </label>
                <select
                  value={scamType}
                  onChange={(e) => setScamType(e.target.value as ScamType)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
                >
                  <option value="Crypto / Impersonation Scam">Crypto / Impersonation Scam (Fake Giveaways / Deepfakes)</option>
                  <option value="Fake Investment / Guaranteed ROI">Fake Investment / Guaranteed High-Yield ROI Platform</option>
                  <option value="Phishing Link / Credential Stealer">Phishing Link / Credential Theft / Malicious DApp</option>
                  <option value="Social Media 'Recovery Agent' Scam">Secondary "Funds Recovery Specialist" Telegram/WhatsApp Scam</option>
                  <option value="Wire Transfer / Fake Vendor Fraud">Wire Transfer / Invoice Redirection / Fake Escrow</option>
                  <option value="SIM Swap / Unauthorized Account Takeover">SIM Swap / Unauthorized Exchange Breach</option>
                  <option value="Other Cyber Fraud">Other Financial Cyber Fraud</option>
                </select>
              </div>

              {/* Amount Lost & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Amount Lost *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-neutral-500 font-mono">$</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      placeholder="0.00"
                      value={amountLost}
                      onChange={(e) => setAmountLost(e.target.value)}
                      required
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Currency *
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-white transition-colors"
                  >
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                    <option value="CAD">CAD (CA$ - Canadian Dollar)</option>
                    <option value="AUD">AUD (A$ - Australian Dollar)</option>
                    <option value="BTC">BTC (Bitcoin)</option>
                    <option value="ETH">ETH (Ethereum)</option>
                    <option value="USDT">USDT (Tether USD)</option>
                    <option value="SOL">SOL (Solana)</option>
                  </select>
                </div>
              </div>

              {/* Incident Date & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Date of Incident *
                  </label>
                  <input
                    type="date"
                    value={incidentDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Payment Method Used *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
                  >
                    <option value="Cryptocurrency (BTC/ETH/USDT/Solana)">Cryptocurrency (BTC/ETH/USDT/Solana)</option>
                    <option value="Bank Wire Transfer">Bank Wire Transfer (SWIFT / Fedwire)</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                    <option value="P2P Platform (Cash App, Zelle, PayPal)">P2P Platform (Cash App, Zelle, PayPal)</option>
                    <option value="Gift Cards / Voucher">Gift Cards / Prepaid Voucher</option>
                    <option value="Other">Other Electronic Transfer</option>
                  </select>
                </div>
              </div>

              {/* Transaction Reference / Hash */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Transaction Reference ID / Crypto Tx Hash
                </label>
                <input
                  type="text"
                  placeholder="e.g., 0x8a7f9... or Bank Wire Reference / SWIFT confirmation"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Incident Description & Suspect Information *
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail how you were approached, what website/account was used, fraudulent promises made, and the sequence of transfers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Evidence Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Evidence Screenshots & Receipts (Optional)
                </label>
                <div className="border border-dashed border-neutral-800 rounded-xl p-4 text-center hover:border-neutral-700 transition-colors">
                  <input
                    type="file"
                    id="evidence-file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="evidence-file" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-6 h-6 text-neutral-400 mb-2" />
                    <span className="text-xs font-medium text-white">Upload Screenshot / Receipt</span>
                    <span className="text-[11px] text-neutral-500 mt-1">PNG, JPG, WebP up to 2MB each</span>
                  </label>
                </div>

                {/* Evidence Previews */}
                {evidenceFiles.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {evidenceFiles.map((src, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-neutral-800 h-20 bg-neutral-900">
                        <img src={src} alt="Evidence preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeEvidence(idx)}
                          className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-1 text-xs hover:bg-black"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-white text-black font-extrabold text-sm uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {submitting ? 'Encrypting & Filing Docket...' : 'Submit Scam Incident Docket'}
              </button>

            </form>
          </div>

          {/* Side Guidance & Escalation Protocols (1 column) */}
          <div className="space-y-6">
            
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span>Immediate 72-Hour Protocol</span>
              </h3>
              <ol className="space-y-3 text-xs text-neutral-400 leading-relaxed list-decimal list-inside">
                <li>
                  <strong className="text-white">Call your bank immediately:</strong> If you paid via wire transfer or debit card, request an immediate fraudulent transfer recall or dispute under Reg E / chargeback rules.
                </li>
                <li>
                  <strong className="text-white">Freeze compromised credentials:</strong> If you provided personal passwords or IDs, immediately change all banking access codes and enable hardware 2FA.
                </li>
                <li>
                  <strong className="text-white">Document the blockchain trail:</strong> For crypto transfers, retain exact TX hashes, timestamps, and destination deposit addresses.
                </li>
                <li>
                  <strong className="text-white">Ignore unsolicited "hackers":</strong> Criminal networks frequently contact scam victims posing as "ethical hackers" or "recovery agents" to steal a secondary fee.
                </li>
              </ol>
            </div>

            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-neutral-400" />
                <span>Primary International Authorities</span>
              </h3>
              <div className="space-y-3 text-xs">
                <a
                  href="https://www.ic3.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 transition-colors"
                >
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>FBI IC3 (USA)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                  <div className="text-neutral-400 text-[11px] mt-0.5">Internet Crime Complaint Center</div>
                </a>

                <a
                  href="https://www.actionfraud.police.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 transition-colors"
                >
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Action Fraud (UK)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                  <div className="text-neutral-400 text-[11px] mt-0.5">National Fraud & Cyber Crime Reporting</div>
                </a>

                <a
                  href="https://www.europol.europa.eu/about-europol/european-cybercrime-centre-ec3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 transition-colors"
                >
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Europol EC3 (Europe)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                  <div className="text-neutral-400 text-[11px] mt-0.5">European Cybercrime Centre</div>
                </a>

                <a
                  href="https://www.interpol.int"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 transition-colors"
                >
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Interpol Financial Crime</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                  <div className="text-neutral-400 text-[11px] mt-0.5">Global Financial Crime Centre</div>
                </a>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: MY CASES TRACKING */}
      {activeTab === 'track' && (
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-900">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wide text-white">
                My Incident Dockets
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Real-time tracking for cases submitted under your session.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('report')}
              className="px-4 py-2 bg-white text-black text-xs font-bold rounded-xl hover:bg-neutral-200 uppercase"
            >
              + File New Docket
            </button>
          </div>

          {loadingCases ? (
            <div className="py-16 text-center text-neutral-500 font-mono text-xs">
              Retrieving case records from database...
            </div>
          ) : userCases.length === 0 ? (
            <div className="py-16 text-center">
              <ShieldAlert className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <div className="text-base font-bold text-white">No Incident Reports Filed</div>
              <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
                You have not submitted any fraud cases yet under this session. Use the "File Incident Report" tab to document an occurrence.
              </p>
              <button
                onClick={() => setActiveTab('report')}
                className="mt-6 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-bold rounded-xl"
              >
                File an Incident Docket
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userCases.map((c) => (
                <div
                  key={c.id || c.caseNumber}
                  className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all cursor-pointer"
                  onClick={() => setSelectedCase(selectedCase?.caseNumber === c.caseNumber ? null : c)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white text-sm">{c.caseNumber}</span>
                      <span className="text-xs text-neutral-400">·</span>
                      <span className="text-xs text-neutral-300 font-medium">{c.scamType}</span>
                    </div>
                    <div>{getStatusBadge(c.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-neutral-800 text-xs">
                    <div>
                      <span className="text-neutral-500 block">Amount Lost:</span>
                      <span className="font-mono text-white font-semibold">
                        {c.currency} {c.amountLost.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Date Reported:</span>
                      <span className="text-neutral-300 font-mono">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Payment Method:</span>
                      <span className="text-neutral-300 truncate block">{c.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Evidence Attached:</span>
                      <span className="text-neutral-300 font-mono">{c.evidenceUrls?.length || 0} file(s)</span>
                    </div>
                  </div>

                  {/* Expanded Detail Accordion */}
                  {selectedCase?.caseNumber === c.caseNumber && (
                    <div className="mt-4 pt-4 border-t border-neutral-800 text-xs space-y-3 bg-neutral-950 p-4 rounded-xl">
                      <div>
                        <div className="text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                          Incident Narrative:
                        </div>
                        <p className="text-neutral-300 mt-1 leading-relaxed whitespace-pre-line">
                          {c.description}
                        </p>
                      </div>

                      {c.transactionReference && (
                        <div>
                          <div className="text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                            Transaction ID / Hash:
                          </div>
                          <div className="font-mono text-neutral-300 bg-neutral-900 px-3 py-1.5 rounded mt-1 break-all">
                            {c.transactionReference}
                          </div>
                        </div>
                      )}

                      {c.adminNotes && (
                        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                          <div className="text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Official Investigation Notes:</span>
                          </div>
                          <p className="text-neutral-300 mt-1">{c.adminNotes}</p>
                        </div>
                      )}

                      {c.evidenceUrls && c.evidenceUrls.length > 0 && (
                        <div>
                          <div className="text-neutral-400 font-bold uppercase tracking-wider text-[11px] mb-2">
                            Attached Evidence Previews:
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {c.evidenceUrls.map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt={`Evidence ${i + 1}`}
                                className="h-24 w-24 object-cover rounded-lg border border-neutral-700 shrink-0"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OFFICIAL AUTHORITY DIRECTORY */}
      {activeTab === 'guidance' && (
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-900 pb-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-white">
              Official Fraud-Reporting Authorities & Consumer Protection
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Direct pathways to law enforcement and regulatory bodies that hold subpoena power over financial rails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">United States — FBI IC3</span>
                <span className="text-[11px] font-mono text-neutral-400">Federal Bureau of Investigation</span>
              </div>
              <p className="text-xs text-neutral-400">
                The central hub for reporting cyber crimes, wire scams, and cryptocurrency extortion in the USA.
              </p>
              <a
                href="https://www.ic3.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-white font-semibold hover:underline pt-2"
              >
                <span>Visit ic3.gov</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">United Kingdom — Action Fraud</span>
                <span className="text-[11px] font-mono text-neutral-400">City of London Police</span>
              </div>
              <p className="text-xs text-neutral-400">
                UK's national reporting centre for fraud and cyber crime, providing official police crime reference numbers.
              </p>
              <a
                href="https://www.actionfraud.police.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-white font-semibold hover:underline pt-2"
              >
                <span>Visit actionfraud.police.uk</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">European Union — Europol EC3</span>
                <span className="text-[11px] font-mono text-neutral-400">European Cybercrime Centre</span>
              </div>
              <p className="text-xs text-neutral-400">
                Coordinates multinational cybercrime operations and high-tech financial fraud tracking across Europe.
              </p>
              <a
                href="https://www.europol.europa.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-white font-semibold hover:underline pt-2"
              >
                <span>Visit europol.europa.eu</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">International — Interpol Financial Crime</span>
                <span className="text-[11px] font-mono text-neutral-400">IFCACC</span>
              </div>
              <p className="text-xs text-neutral-400">
                Global anti-financial crime and anti-corruption centre tracking cross-border syndicates and money laundering.
              </p>
              <a
                href="https://www.interpol.int"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-white font-semibold hover:underline pt-2"
              >
                <span>Visit interpol.int</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-400 leading-relaxed">
            <strong className="text-white block mb-1">Standard Bank Chargeback & Recall Rules:</strong>
            Under Visa / Mastercard regulations, cardholders typically possess a 60 to 120-day dispute window from the transaction date. For SWIFT and domestic bank wires, recall requests must be lodged with your branch manager within 24 to 48 hours before settlement clearing.
          </div>
        </div>
      )}

    </div>
  );
};
