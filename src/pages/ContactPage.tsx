import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, MessageCircle, Send } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { Vehicle } from '../types';

export const ContactPage: React.FC = () => {
  const { settings, openWhatsAppInquiry, updatePageSeo } = useSite();
  const [searchParams] = useSearchParams();
  const brandName = settings?.businessName || '[DEALERSHIP NAME]';

  const initialType = searchParams.get('type') || 'General Inquiry';
  const [activeMode, setActiveMode] = useState<'inquiry' | 'testdrive'>(
    'inquiry'
  );
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);

  // Inquiry form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState(initialType);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [tradeInDetails, setTradeInDetails] = useState('');
  const [message, setMessage] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Test drive form state
  const [tdName, setTdName] = useState('');
  const [tdPhone, setTdPhone] = useState('');
  const [tdEmail, setTdEmail] = useState('');
  const [tdVehicleId, setTdVehicleId] = useState('');
  const [tdDate, setTdDate] = useState('');
  const [tdTime, setTdTime] = useState('10:00 AM');
  const [tdNotes, setTdNotes] = useState('');
  const [tdSubmitting, setTdSubmitting] = useState(false);
  const [tdFeedback, setTdFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    updatePageSeo(
      `Contact Sales & Book a Test Drive | ${brandName}`,
      `Contact ${brandName} in ${
        settings?.location || '[CITY, GHANA]'
      } by phone, WhatsApp, or online inquiry form.`
    );
  }, [brandName, settings?.location, updatePageSeo]);

  useEffect(() => {
    fetch('/api/vehicles?limit=50')
      .then((r) => r.json())
      .then((data) => {
        if (data.vehicles) setVehiclesList(data.vehicles);
      })
      .catch(() => {});
  }, []);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    const chosenVehicle = vehiclesList.find(
      (v) => String(v.id) === selectedVehicleId
    );
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          email,
          inquiryType,
          vehicleId: chosenVehicle ? chosenVehicle.id : null,
          vehicleTitle: chosenVehicle
            ? `${chosenVehicle.year} ${chosenVehicle.make} ${chosenVehicle.model}`
            : '',
          tradeInDetails,
          message,
          consentGiven,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: 'error',
          text: data.error || 'Could not submit inquiry.',
        });
      } else {
        setFeedback({ type: 'success', text: data.message });
        setCustomerName('');
        setPhone('');
        setEmail('');
        setTradeInDetails('');
        setMessage('');
      }
    } catch {
      setFeedback({
        type: 'error',
        text: 'Network error while submitting form.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTdSubmitting(true);
    setTdFeedback(null);
    const chosenVehicle = vehiclesList.find(
      (v) => String(v.id) === tdVehicleId
    );
    const vehicleTitle = chosenVehicle
      ? `${chosenVehicle.year} ${chosenVehicle.make} ${chosenVehicle.model}`
      : 'General Showroom Viewing';

    try {
      const res = await fetch('/api/test-drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: tdName,
          phone: tdPhone,
          email: tdEmail,
          vehicleId: chosenVehicle ? chosenVehicle.id : null,
          vehicleTitle,
          preferredDate: tdDate,
          preferredTime: tdTime,
          notes: tdNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTdFeedback({
          type: 'error',
          text: data.error || 'Could not schedule appointment.',
        });
      } else {
        setTdFeedback({ type: 'success', text: data.message });
        setTdName('');
        setTdPhone('');
        setTdEmail('');
        setTdDate('');
        setTdNotes('');
      }
    } catch {
      setTdFeedback({
        type: 'error',
        text: 'Network error while scheduling appointment.',
      });
    } finally {
      setTdSubmitting(false);
    }
  };

  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 space-y-12">
      <div className="max-w-2xl space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-[#9A7332]">
          Sales Desk & Yard Appointments
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display tracking-tight">
          Contact {brandName}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Submit a general question, request custom vehicle sourcing, propose a
          trade-in valuation, or book a physical inspection and test drive at
          our showroom in {settings?.location || '[CITY, GHANA]'}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Direct Contact Details & Map */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Dealership Contact Information
            </h2>

            <dl className="space-y-3.5 text-sm">
              <div className="pb-3 border-b border-slate-100">
                <dt className="text-xs text-slate-500">Business Location</dt>
                <dd className="font-semibold text-slate-900 mt-0.5">
                  {settings?.location || '[CITY, GHANA]'}
                </dd>
              </div>
              <div className="pb-3 border-b border-slate-100">
                <dt className="text-xs text-slate-500">Physical Address</dt>
                <dd className="font-semibold text-slate-900 mt-0.5">
                  {settings?.address || '[PHYSICAL ADDRESS]'}
                </dd>
              </div>
              <div className="pb-3 border-b border-slate-100">
                <dt className="text-xs text-slate-500">Telephone / Sales Desk</dt>
                <dd className="font-mono font-semibold text-slate-900 mt-0.5">
                  <a href={`tel:${settings?.phone || '+233596416623'}`} className="hover:underline">
                    {settings?.phone || '+233 59 641 6623'}
                  </a>
                </dd>
              </div>
              <div className="pb-3 border-b border-slate-100">
                <dt className="text-xs text-slate-500">WhatsApp Sales Accounts</dt>
                <dd className="font-mono font-semibold text-slate-900 mt-0.5 space-y-1">
                  <div>
                    <a
                      href="https://wa.me/2330596416623?text=Welcome%20your%20inquiry"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Line 1: +233 59 641 6623</span>
                    </a>
                  </div>
                  <div>
                    <a
                      href="https://wa.me/233593592023?text=Welcome%20your%20inquiry"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Line 2: +233 59 359 2023</span>
                    </a>
                  </div>
                </dd>
              </div>
              <div className="pb-3 border-b border-slate-100">
                <dt className="text-xs text-slate-500">Official Email</dt>
                <dd className="font-mono font-semibold text-slate-900 mt-0.5">
                  <a href={`mailto:${settings?.email || 'wrmobile@163.com'}`} className="hover:underline text-slate-900">
                    {settings?.email || 'wrmobile@163.com'}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Opening Hours</dt>
                <dd className="font-semibold text-slate-900 mt-0.5">
                  {settings?.openingHours || 'Monday – Saturday: 8:00 AM – 6:00 PM GMT'}
                </dd>
              </div>
            </dl>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href="https://wa.me/2330596416623?text=Welcome%20your%20inquiry"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Line 1</span>
              </a>
              <a
                href="https://wa.me/233593592023?text=Welcome%20your%20inquiry"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Line 2</span>
              </a>
            </div>
          </div>

          {/* Embedded Google Maps (Only rendered when a verified embed URL is configured in Admin) */}
          {settings?.googleMapsEmbedUrl ? (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden h-64">
              <iframe
                title="Dealership Verified Location Map"
                src={settings.googleMapsEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-800 block mb-1">
                Showroom Map & Directions
              </strong>
              Physical address: {settings?.address || '[PHYSICAL ADDRESS]'},{' '}
              {settings?.location || '[CITY, GHANA]'}. Once the dealership
              supplies a verified Google Maps embed URL in the Admin Dashboard,
              the interactive map pin will appear here automatically.
            </div>
          )}
        </div>

        {/* Right: Customer Inquiry & Test Drive Booking Forms */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => setActiveMode('inquiry')}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeMode === 'inquiry'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              General, Sourcing & Trade-In Inquiry
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('testdrive')}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeMode === 'testdrive'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Book a Test Drive / Inspection
            </button>
          </div>

          {activeMode === 'inquiry' ? (
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Kwame Mensah"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 024 000 0000"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Inquiry Category *
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="General Inquiry">General Sales Inquiry</option>
                    <option value="Purchase Inquiry">
                      Vehicle Purchase / Pro-Forma Request
                    </option>
                    <option value="Vehicle Sourcing">
                      Custom Vehicle Sourcing on Request
                    </option>
                    <option value="Trade-In Request">
                      Trade-In Valuation Inquiry
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Associated Inventory Vehicle (Optional)
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">
                    -- Not tied to a specific showroom vehicle --
                  </option>
                  {vehiclesList.map((v) => (
                    <option key={v.id} value={String(v.id)}>
                      {v.year} {v.make} {v.model} {v.trim} (GH₵{' '}
                      {(v.discountPrice || v.price).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {(inquiryType === 'Trade-In Request' ||
                inquiryType === 'Vehicle Sourcing') && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {inquiryType === 'Trade-In Request'
                      ? 'Your Trade-In Vehicle Make, Model, Year & Registration Status *'
                      : 'Target Make, Model, Year & Budget in GH₵ *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={tradeInDetails}
                    onChange={(e) => setTradeInDetails(e.target.value)}
                    placeholder={
                      inquiryType === 'Trade-In Request'
                        ? 'e.g. 2018 Toyota Corolla S, Ghana Registered, 65,000 km'
                        : 'e.g. 2022 Toyota Prado TX-L Diesel, Budget GH₵ 1,100,000'
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Your Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide details on your inquiry, preferred viewing schedule, or questions..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300"
                />
                <span>
                  I consent to {brandName} storing my contact details to respond
                  to this inquiry in accordance with the Dealership Privacy
                  Policy.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {submitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}
                </span>
              </button>

              {feedback && (
                <div
                  className={`p-4 rounded-xl text-xs font-medium ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  {feedback.text}
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleTestDriveSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={tdName}
                    onChange={(e) => setTdName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={tdPhone}
                    onChange={(e) => setTdPhone(e.target.value)}
                    placeholder="e.g. 024 000 0000"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={tdEmail}
                    onChange={(e) => setTdEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Select Vehicle for Inspection *
                  </label>
                  <select
                    required
                    value={tdVehicleId}
                    onChange={(e) => setTdVehicleId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">-- Select a Vehicle --</option>
                    {vehiclesList.map((v) => (
                      <option key={v.id} value={String(v.id)}>
                        {v.year} {v.make} {v.model} (GH₵{' '}
                        {(v.discountPrice || v.price).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={todayIso}
                    value={tdDate}
                    onChange={(e) => setTdDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Preferred Time Slot *
                  </label>
                  <select
                    value={tdTime}
                    onChange={(e) => setTdTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Inspection Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={tdNotes}
                  onChange={(e) => setTdNotes(e.target.value)}
                  placeholder="Let us know if you are bringing an independent mechanic or diagnostic tool..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={tdSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>
                  {tdSubmitting
                    ? 'Scheduling Appointment...'
                    : 'Request Test-Drive Appointment'}
                </span>
              </button>

              {tdFeedback && (
                <div
                  className={`p-4 rounded-xl text-xs font-medium ${
                    tdFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  {tdFeedback.text}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
