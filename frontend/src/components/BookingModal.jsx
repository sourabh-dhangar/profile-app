import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import api from '../api/client';
import { useToast } from './Toast';

const TIME_SLOTS = [
  '10:00 AM - 11:30 AM',
  '12:00 PM - 01:30 PM',
  '02:30 PM - 04:00 PM',
  '04:30 PM - 06:00 PM',
  '06:30 PM - 08:00 PM',
];

const BookingModal = ({
  isOpen,
  onClose,
  profile,
  services = [],
}) => {
  const toast = useToast();
  const [selectedService, setSelectedService] = useState(
    services[0] || 'General Consultation / Initial Meeting'
  );
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0]);
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e, launchWhatsapp = false) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    if (!senderName.trim() || !senderPhone.trim()) {
      setError('Please provide your name and phone number so we can confirm your booking.');
      return;
    }

    const bookingMessage = `Appointment Request for ${selectedService}\nDate: ${selectedDate}\nTime Slot: ${selectedTimeSlot}\nClient: ${senderName} (${senderPhone})\nEmail: ${senderEmail || 'N/A'}\nNotes: ${notes || 'None'}`;

    try {
      setSubmitting(true);
      await api.post(`/profiles/${profile.username}/inquiries`, {
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        senderEmail: senderEmail.trim() || `${senderPhone.replace(/[^0-9]/g, '')}@lead.myprofile`,
        subject: `[Appointment Booking]: ${selectedService} on ${selectedDate}`,
        message: bookingMessage,
      });

      setBooked(true);
      toast.success('Appointment request sent successfully!');

      // If user chose WhatsApp or profile has whatsapp
      if (launchWhatsapp && (profile.businessDetails?.whatsappNumber || profile.contactDetails?.whatsapp)) {
        const rawWa = profile.businessDetails?.whatsappNumber || profile.contactDetails?.whatsapp;
        const cleanWa = rawWa.replace(/[^0-9]/g, '');
        const waText = encodeURIComponent(
          `Hello ${profile.name}!\n\nI would like to book an appointment:\n📌 Service: ${selectedService}\n📅 Date: ${selectedDate}\n⏰ Time: ${selectedTimeSlot}\n👤 Name: ${senderName}\n📞 Phone: ${senderPhone}\n${notes ? `📝 Note: ${notes}\n` : ''}\n(Booked via MyProfile)`
        );
        window.open(`https://wa.me/${cleanWa}?text=${waText}`, '_blank');
      }

      setTimeout(() => {
        setBooked(false);
        onClose();
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit booking. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappAvailable = !!(
    profile.businessDetails?.whatsappNumber || profile.contactDetails?.whatsapp
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {booked ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Booking Request Confirmed!</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Your appointment request for <strong>{selectedService}</strong> on <strong>{selectedDate}</strong> has been delivered to {profile.name}.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Book an Appointment</h3>
                <p className="text-xs text-slate-400">
                  Reserve a consultation or service slot with {profile.name}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              {/* Select Service */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Select Offering / Service *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                >
                  {services.length > 0 ? (
                    services.map((s, idx) => (
                      <option key={idx} value={s}>
                        {s}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Initial Consultation & Discussion">
                        Initial Consultation & Discussion
                      </option>
                      <option value="Professional Service Session">
                        Professional Service Session
                      </option>
                      <option value="Project Scoping / Architecture Review">
                        Project Scoping / Architecture Review
                      </option>
                    </>
                  )}
                </select>
              </div>

              {/* Date & Time Slot Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Time Window *
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {TIME_SLOTS.map((slot, idx) => (
                      <option key={idx} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Amit Patel"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-4 py-2.5 pl-9 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Your Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full px-4 py-2.5 pl-9 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="e.g. amit@example.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full px-4 py-2.5 pl-9 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Special Notes or Requirements
                </label>
                <textarea
                  rows="2"
                  placeholder="Any specific requests or requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                {whatsappAvailable ? (
                  <>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={(e) => handleSubmit(e, true)}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Book on WhatsApp</span>
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors disabled:opacity-50"
                    >
                      <span>Send Request</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span>Submit Appointment Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
