import React, { useState } from 'react';
import { X, Send, Mail, User, Phone, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../api/client';
import { useToast } from './Toast';

const InquiryModal = ({ isOpen, onClose, username, creatorName, accentBg = 'bg-emerald-500' }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    subject: 'Project Inquiry',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.senderName.trim() || !formData.senderEmail.trim() || !formData.message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/profiles/${username}/inquiries`, formData);
      setSubmitted(true);
      toast.success('Inquiry sent successfully!');
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          senderName: '',
          senderEmail: '',
          senderPhone: '',
          subject: 'Project Inquiry',
          message: '',
        });
        onClose();
      }, 1800);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send inquiry. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl shadow-emerald-500/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Message Sent!</h3>
            <p className="text-sm text-slate-300 max-w-xs mx-auto">
              Your inquiry has been delivered directly to {creatorName}. They will get back to you soon.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Get in Touch</h3>
                <p className="text-xs text-slate-400">Send a direct message or project inquiry to {creatorName}</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Your Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.senderName}
                      onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Your Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={formData.senderEmail}
                      onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={formData.senderPhone}
                      onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Project Inquiry"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your project, question, or message..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95 disabled:opacity-50 ${accentBg}`}
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default InquiryModal;
