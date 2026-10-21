import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Check,
  Copy,
  ExternalLink,
  Menu,
  MessageCircle,
  Send,
  X,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    settings,
    whatsAppModal,
    closeWhatsAppModal,
    openWhatsAppInquiry,
    getFormattedWhatsAppUrl,
  } = useSite();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // WhatsApp modal state for editing message or submitting as a direct inquiry
  const [editableMessage, setEditableMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadFeedback, setLeadFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  React.useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  React.useEffect(() => {
    if (whatsAppModal.isOpen) {
      setEditableMessage(whatsAppModal.message);
      setCopied(false);
      setLeadFeedback(null);
    }
  }, [whatsAppModal.isOpen, whatsAppModal.message]);

  const brandName = settings?.businessName || 'WESRROAD';
  const configuredWaUrl = getFormattedWhatsAppUrl(
    editableMessage || whatsAppModal.message
  );

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(editableMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDirectSaveInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLead(true);
    setLeadFeedback(null);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone: customerPhone,
          inquiryType: whatsAppModal.vehicleTitle
            ? 'Vehicle Inquiry'
            : 'General Inquiry',
          vehicleId: whatsAppModal.vehicleId || null,
          vehicleTitle: whatsAppModal.vehicleTitle || '',
          message: editableMessage,
          consentGiven: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLeadFeedback({
          type: 'error',
          text: data.error || 'Could not log inquiry.',
        });
      } else {
        setLeadFeedback({
          type: 'success',
          text: data.message,
        });
        setCustomerName('');
        setCustomerPhone('');
      }
    } catch {
      setLeadFeedback({
        type: 'error',
        text: 'Network error while saving inquiry.',
      });
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F7] text-[#111315]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur border-b border-slate-200 px-6 lg:px-10 flex items-center justify-between gap-8">
        {/* Zone 1: Official Logo */}
        <Link
          to="/"
          className="flex items-center tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0 group"
          aria-label="Home"
        >
          <img
            src="/logo.png"
            alt="WESRROAD Logo"
            className="h-9 w-auto max-w-[150px] object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                isActive
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                isActive
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`
            }
          >
            Browse Cars
          </NavLink>
          <NavLink
            to="/services"
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                isActive
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`
            }
          >
            Services
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                isActive
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`
            }
          >
            About Us
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                isActive
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`
            }
          >
            Contact
          </NavLink>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() =>
              openWhatsAppInquiry(
                `Hello ${brandName}, I am browsing your website (${window.location.origin}) and would like to speak with a sales representative regarding available vehicles in Ghana.`
              )
            }
            className="px-4 py-2 text-xs font-semibold text-white bg-[#111315] rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Contact Sales
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <Link to="/" className="py-1.5 hover:text-slate-900">
              Home
            </Link>
            <Link to="/inventory" className="py-1.5 hover:text-slate-900">
              Browse Cars
            </Link>
            <Link to="/services" className="py-1.5 hover:text-slate-900">
              Services
            </Link>
            <Link to="/about" className="py-1.5 hover:text-slate-900">
              About Us
            </Link>
            <Link to="/faq" className="py-1.5 hover:text-slate-900">
              FAQs
            </Link>
            <Link to="/contact" className="py-1.5 hover:text-slate-900">
              Contact
            </Link>
            <Link
              to="/admin"
              className="py-1.5 text-slate-500 hover:text-slate-900 border-t border-slate-100 pt-2"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Floating WhatsApp Contact Button (Compliant with 15% Mobile Sticky Cap) */}
      <button
        type="button"
        onClick={() =>
          openWhatsAppInquiry(
            `Hello ${brandName}, I am visiting your dealership website (${window.location.href}) and would like to inquire about your available vehicles in Ghana.`
          )
        }
        aria-label="Inquire on WhatsApp"
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 px-4 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-full shadow-lg transition-transform duration-150 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap shrink-0"
      >
        <MessageCircle className="w-4 h-4" />
        <span>WhatsApp Sales</span>
      </button>

      {/* WhatsApp Review & Direct Inquiry Modal */}
      {whatsAppModal.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wa-modal-title"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="wa-modal-title"
                  className="text-lg font-bold text-slate-900 font-display"
                >
                  WhatsApp & Direct Sales Inquiry
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Review your prefilled message before opening WhatsApp or logging
                  it directly with our sales desk.
                </p>
              </div>
              <button
                type="button"
                onClick={closeWhatsAppModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="wa-prefilled-msg"
                className="block text-xs font-semibold text-slate-700"
              >
                Prefilled Inquiry Message
              </label>
              <textarea
                id="wa-prefilled-msg"
                rows={4}
                value={editableMessage}
                onChange={(e) => setEditableMessage(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-xs text-slate-500">
                  Dealership WhatsApp:{' '}
                  <strong className="font-mono text-slate-800">
                    {settings?.whatsapp || '[WHATSAPP NUMBER]'}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* External WhatsApp Deep-Link */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={
                  configuredWaUrl ||
                  `https://wa.me/?text=${encodeURIComponent(editableMessage)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {configuredWaUrl
                    ? 'Continue to WhatsApp'
                    : 'Open WhatsApp App'}
                </span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>

            {/* Direct Database Callback Option */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-800 mb-3">
                Or request an immediate WhatsApp / Phone callback from our sales
                desk:
              </p>
              <form onSubmit={handleDirectSaveInquiry} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Your Ghana Phone / WhatsApp"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingLead}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {submittingLead
                      ? 'Recording Inquiry...'
                      : 'Log Callback Request with Dealership'}
                  </span>
                </button>
              </form>

              {leadFeedback && (
                <div
                  className={`mt-3 p-3 rounded-lg text-xs font-medium ${
                    leadFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  {leadFeedback.text}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#0F1216] text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Col 1: Brand & Market */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="WESRROAD Logo"
                  className="h-10 w-auto object-contain brightness-110"
                />
                <span className="text-lg font-bold text-white font-display">
                  {brandName}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {settings?.tagline ||
                  'China–Africa Vehicle Trading Platform & Direct Sourcing Showroom'}
                . All prices listed transparently in{' '}
                {settings?.currency || 'Ghana Cedi (GH₵)'}.
              </p>
              <div className="pt-2 text-xs text-slate-400 space-y-1">
                <div><strong className="text-slate-300">Ghana Office:</strong> {settings?.address || 'Along the N1 Highway, Accra, Ghana'}</div>
                <div><strong className="text-slate-300">East Africa:</strong> Morocco Square, Dar es Salaam, Tanzania</div>
                <div><strong className="text-slate-300">China Hubs:</strong> Beijing · Tianjin · Guangzhou · Hangzhou · Chengdu</div>
                <div><strong className="text-slate-300">Hours:</strong> {settings?.openingHours || 'Mon – Sat: 8:00 AM – 6:00 PM GMT'}</div>
              </div>
            </div>

            {/* Col 2: Inventory Categories */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Vehicle Inventory
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <Link
                    to="/inventory?bodyType=SUV"
                    className="hover:text-white transition-colors"
                  >
                    4WD & Crossover SUVs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/inventory?bodyType=Sedan"
                    className="hover:text-white transition-colors"
                  >
                    Executive & Saloon Sedans
                  </Link>
                </li>
                <li>
                  <Link
                    to="/inventory?bodyType=Pickup"
                    className="hover:text-white transition-colors"
                  >
                    4x4 Double-Cab Pickups
                  </Link>
                </li>
                <li>
                  <Link
                    to="/inventory?bodyType=Hatchback"
                    className="hover:text-white transition-colors"
                  >
                    Urban Hatchbacks
                  </Link>
                </li>
                <li>
                  <Link
                    to="/inventory?bodyType=Luxury"
                    className="hover:text-white transition-colors"
                  >
                    Flagship Luxury Vehicles
                  </Link>
                </li>
                <li>
                  <Link
                    to="/inventory?condition=Foreign+Used"
                    className="hover:text-white transition-colors"
                  >
                    Customs-Cleared Foreign Used
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Dealership Pages */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Dealership & Policies
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-white transition-colors"
                  >
                    About the Dealership
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services"
                    className="hover:text-white transition-colors"
                  >
                    Services & Vehicle Sourcing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="hover:text-white transition-colors"
                  >
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy (Ghana Act 843)
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Sale & Inspection
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin"
                    className="text-[#C89D54] hover:text-amber-300 transition-colors font-medium"
                  >
                    Dealer Admin Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Direct Contact & Social Links */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sales Desk & Contact
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div>
                  <span className="text-slate-400">WhatsApp 1: </span>
                  <a
                    href="https://wa.me/2330596416623?text=Welcome%20your%20inquiry"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-emerald-400 hover:underline"
                  >
                    +233 59 641 6623
                  </a>
                </div>
                <div>
                  <span className="text-slate-400">WhatsApp 2: </span>
                  <a
                    href="https://wa.me/233593592023?text=Welcome%20your%20inquiry"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-emerald-400 hover:underline"
                  >
                    +233 59 359 2023
                  </a>
                </div>
                <div>
                  <span className="text-slate-400">Email: </span>
                  <a
                    href="mailto:wrmobile@163.com"
                    className="font-mono text-slate-300 hover:text-white hover:underline"
                  >
                    wrmobile@163.com
                  </a>
                </div>
                <div>
                  <span className="text-slate-400">Official Portal: </span>
                  <a
                    href="https://africa-goodcar.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C89D54] hover:underline"
                  >
                    africa-goodcar.com
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Official Channels
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                  <a
                    href="https://twitter.com/wesrroad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] text-slate-300 transition-colors"
                  >
                    X (Twitter)
                  </a>
                  <a
                    href="https://facebook.com/wesrroad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] text-slate-300 transition-colors"
                  >
                    Facebook
                  </a>
                  <a
                    href="https://instagram.com/wesrroad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] text-slate-300 transition-colors"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://tiktok.com/@westroadauto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] text-slate-300 transition-colors"
                  >
                    TikTok
                  </a>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Submit Vehicle or Sourcing Inquiry
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © {new Date().getFullYear()} {brandName}. Operating in{' '}
              {settings?.location || 'Accra, Ghana'}. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-300"
              >
                XML Sitemap
              </a>
              <span>·</span>
              <Link to="/privacy" className="hover:text-slate-300">
                Privacy
              </Link>
              <span>·</span>
              <Link to="/terms" className="hover:text-slate-300">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
