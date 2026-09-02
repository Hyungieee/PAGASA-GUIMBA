import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  RefreshCw,
  AlertCircle,
  FileCode,
  Eye,
  Check,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { 
  CredentialEmailPayload, 
  generateCredentialWelcomeEmailHtml,
  getGmailComposeUrl,
  getMailtoUrl,
  copyFormattedCredentials
} from '../../services/emailService';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: CredentialEmailPayload | null;
  onResend?: (payload: CredentialEmailPayload) => Promise<void>;
  deliveryStatus?: 'Delivered' | 'Pending' | 'Failed';
  deliveryDate?: string;
  deliveryError?: string;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  payload,
  onResend,
  deliveryStatus = 'Delivered',
  deliveryDate,
  deliveryError
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'plaintext'>('preview');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !payload) return null;

  const emailData = generateCredentialWelcomeEmailHtml(payload);
  const gmailComposeUrl = getGmailComposeUrl(payload);
  const mailtoUrl = getMailtoUrl(payload);

  const handleCopy = async (text: string) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResendClick = async () => {
    if (!onResend) return;
    setIsSending(true);
    try {
      await onResend(payload);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/20">
              <Mail className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white font-display">
                  Automated Credential Dispatch Center
                </h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  deliveryStatus === 'Delivered' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : deliveryStatus === 'Failed'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {deliveryStatus === 'Delivered' ? '✓ Dispatched / Recorded' : deliveryStatus === 'Failed' ? '✕ Delivery Issue' : '⏳ Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Recipient: <span className="text-white font-mono font-bold">{payload.to}</span> ({payload.recipientName})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Send & Action Bar */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border-b border-blue-100 p-3 px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Quick Actions:</span>
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Open prepared Gmail composer in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Gmail Web</span>
            </a>

            <a
              href={mailtoUrl}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Open system default email client"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Default Mail App</span>
            </a>

            <button
              onClick={() => handleCopy(emailData.plainText)}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copied ? 'Copied!' : 'Copy Credentials'}</span>
            </button>
          </div>

          {onResend && (
            <button
              onClick={handleResendClick}
              disabled={isSending}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer ml-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
              <span>{isSending ? 'Triggering Server...' : 'Trigger Server API'}</span>
            </button>
          )}
        </div>

        {/* Info & Delivery Meta Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <div>
              <span className="text-slate-400 font-semibold">From: </span>
              <span className="font-semibold text-blue-700 font-mono">morangian31@gmail.com</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Subject: </span>
              <span className="font-medium text-slate-900">{emailData.subject}</span>
            </div>
            {deliveryDate && (
              <div>
                <span className="text-slate-400 font-semibold">Dispatched: </span>
                <span className="font-mono text-slate-700">{new Date(deliveryDate).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                activeTab === 'preview' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> Visual Preview
              </span>
            </button>
            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                activeTab === 'html' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1">
                <FileCode className="w-3 h-3" /> HTML Code
              </span>
            </button>
            <button
              onClick={() => setActiveTab('plaintext')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                activeTab === 'plaintext' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Plain Text
            </button>
          </div>
        </div>

        {deliveryError && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Delivery Notice: {deliveryError}. You can send directly using "Open in Gmail Web" or retry via the server.</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/60">
          {activeTab === 'preview' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl mx-auto">
              <iframe
                title="Email Preview"
                srcDoc={emailData.html}
                className="w-full h-[480px] border-0"
              />
            </div>
          )}

          {activeTab === 'html' && (
            <div className="relative">
              <button
                onClick={() => handleCopy(emailData.html)}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md hover:bg-slate-700 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy HTML'}</span>
              </button>
              <pre className="bg-slate-900 text-slate-200 p-5 rounded-2xl text-xs font-mono overflow-x-auto max-h-[480px]">
                {emailData.html}
              </pre>
            </div>
          )}

          {activeTab === 'plaintext' && (
            <div className="relative">
              <button
                onClick={() => handleCopy(emailData.plainText)}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md hover:bg-slate-700 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
              <pre className="bg-white border border-slate-200 text-slate-800 p-6 rounded-2xl text-xs font-mono whitespace-pre-wrap max-h-[480px]">
                {emailData.plainText}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Includes official PAGASA organization seal, login URL, and credentials guidance.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};

