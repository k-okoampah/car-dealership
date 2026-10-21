import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Check,
  Expand,
  MessageCircle,
  Phone,
  Share2,
  X,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { Vehicle } from '../types';
import { VehicleImage } from '../components/VehicleImage';
import { VehicleCard } from '../components/VehicleCard';

export const VehicleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { settings, formatPriceGHS, openWhatsAppInquiry, updatePageSeo } =
    useSite();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sharedCopied, setSharedCopied] = useState(false);

  // Active form tab: 'inquiry' | 'testdrive'
  const [activeTab, setActiveTab] = useState<'inquiry' | 'testdrive'>(
    'inquiry'
  );

  // Inquiry Form State
  const [inqName, setInqName] = useState('');
  const [inqPhone, setInqPhone] = useState('');
  const [inqEmail, setInqEmail] = useState('');
  const [inqType, setInqType] = useState('Purchase Inquiry');
  const [inqTradeDetails, setInqTradeDetails] = useState('');
  const [inqMessage, setInqMessage] = useState('');
  const [inqSubmitting, setInqSubmitting] = useState(false);
  const [inqFeedback, setInqFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Test Drive Form State
  const [tdName, setTdName] = useState('');
  const [tdPhone, setTdPhone] = useState('');
  const [tdEmail, setTdEmail] = useState('');
  const [tdDate, setTdDate] = useState('');
  const [tdTime, setTdTime] = useState('10:00 AM');
  const [tdNotes, setTdNotes] = useState('');
  const [tdSubmitting, setTdSubmitting] = useState(false);
  const [tdFeedback, setTdFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    const loadVehicle = async () => {
      setLoading(true);
      setError(null);
      setSelectedImageIdx(0);
      try {
        let data: Vehicle | null = null;
        try {
          const res = await fetch(`/api/vehicles/${slug}`);
          if (res.ok) {
            data = await res.json();
          }
        } catch {
          // ignore and fallback
        }

        if (!data) {
          const raw = await import('../data/wesrroadVehicles.json');
          const allItems = (raw.default || raw) as unknown as Vehicle[];
          data = allItems.find((v) => v.slug === slug) || null;
        }

        if (!data) {
          throw new Error('Vehicle listing not found or no longer available.');
        }

        if (active) {
          setVehicle(data);
          const fullTitle = `${data.year} ${data.make} ${data.model} ${
            data.trim || ''
          }`.trim();
          setInqMessage(
            `Hello, I am interested in the ${fullTitle} listed at ${formatPriceGHS(
              data.discountPrice || data.price
            )}. Please confirm if it is available for physical inspection.`
          );
          updatePageSeo(
            `${fullTitle} – ${formatPriceGHS(data.discountPrice || data.price)}`,
            data.description.slice(0, 155)
          );
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Unable to load vehicle details');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadVehicle();
    return () => {
      active = false;
    };
  }, [slug, formatPriceGHS, updatePageSeo]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 space-y-8">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 h-[440px] bg-slate-200 rounded-xl animate-pulse" />
          <div className="lg:col-span-5 h-[440px] bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 font-display">
          Vehicle Listing Not Found
        </h1>
        <p className="text-sm text-slate-600">
          {error ||
            'The requested vehicle may have been sold or unpublished from our inventory.'}
        </p>
        <div className="pt-2">
          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Vehicle Inventory</span>
          </Link>
        </div>
      </div>
    );
  }

  const gallery =
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images
      : [
          {
            imageUrl: '/vehicles/suv-pearl-front.svg',
            altText: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            sortOrder: 0,
          },
        ];

  const activeImage = gallery[selectedImageIdx] || gallery[0];
  const effectivePrice =
    vehicle.discountPrice && vehicle.discountPrice > 0
      ? vehicle.discountPrice
      : vehicle.price;
  const fullVehicleTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${
    vehicle.trim || ''
  }`.trim();
  const listingUrl = window.location.href;

  const handleShareListing = async () => {
    try {
      await navigator.clipboard.writeText(listingUrl);
      setSharedCopied(true);
      setTimeout(() => setSharedCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInqSubmitting(true);
    setInqFeedback(null);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: inqName,
          phone: inqPhone,
          email: inqEmail,
          inquiryType: inqType,
          vehicleId: vehicle.id,
          vehicleTitle: fullVehicleTitle,
          tradeInDetails: inqTradeDetails,
          message: inqMessage,
          consentGiven: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInqFeedback({
          type: 'error',
          text: data.error || 'Failed to submit inquiry.',
        });
      } else {
        setInqFeedback({ type: 'success', text: data.message });
        setInqName('');
        setInqPhone('');
        setInqEmail('');
        setInqTradeDetails('');
      }
    } catch {
      setInqFeedback({
        type: 'error',
        text: 'Network error while submitting your inquiry.',
      });
    } finally {
      setInqSubmitting(false);
    }
  };

  const handleTestDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTdSubmitting(true);
    setTdFeedback(null);
    try {
      const res = await fetch('/api/test-drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: tdName,
          phone: tdPhone,
          email: tdEmail,
          vehicleId: vehicle.id,
          vehicleTitle: fullVehicleTitle,
          preferredDate: tdDate,
          preferredTime: tdTime,
          notes: tdNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTdFeedback({
          type: 'error',
          text: data.error || 'Failed to book test drive.',
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
        text: 'Network error while scheduling your test drive.',
      });
    } finally {
      setTdSubmitting(false);
    }
  };

  const todayIso = new Date().toISOString().split('T')[0];
  const phoneConfigured =
    settings?.phone && !settings.phone.includes('[') ? settings.phone : '+233 59 641 6623';

  // Structured Data JSON-LD for Individual Vehicle
  const vehicleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: fullVehicleTitle,
    brand: { '@type': 'Brand', name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    bodyType: vehicle.bodyType,
    vehicleTransmission: vehicle.transmission,
    fuelType: vehicle.fuelType,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage,
      unitCode: vehicle.mileageUnit === 'km' ? 'KMT' : 'SMI',
    },
    offers: {
      '@type': 'Offer',
      price: effectivePrice,
      priceCurrency: 'GHS',
      availability:
        vehicle.availabilityStatus === 'Available'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
      url: listingUrl,
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleJsonLd) }}
      />

      {/* Breadcrumb & Share Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            to="/inventory"
            className="inline-flex items-center gap-1 text-slate-800 font-medium hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Inventory</span>
          </Link>
          <span aria-hidden="true">/</span>
          <span>{vehicle.bodyType}</span>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 font-medium truncate max-w-[260px]">
            {fullVehicleTitle}
          </span>
        </div>

        <button
          type="button"
          onClick={handleShareListing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-slate-900 cursor-pointer"
        >
          {sharedCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Listing URL Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Vehicle Link</span>
            </>
          )}
        </button>
      </div>

      {/* Main Split: Gallery Left + Contiguous Purchase/Inquiry Module Right */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Gallery, Specifications & Description */}
        <div className="lg:col-span-7 space-y-8">
          {/* Primary Image Stage */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] w-full bg-[#14181F] rounded-2xl overflow-hidden border border-slate-200">
              <VehicleImage
                src={activeImage.imageUrl}
                alt={activeImage.altText}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/75 hover:bg-black text-white text-xs font-medium rounded-lg backdrop-blur-xs cursor-pointer"
              >
                <Expand className="w-3.5 h-3.5" />
                <span>Full-Size View</span>
              </button>
            </div>

            {/* Thumbnail Strip */}
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIdx === idx
                        ? 'border-slate-900 ring-2 ring-slate-900/20'
                        : 'border-slate-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <VehicleImage
                      src={img.imageUrl}
                      alt={img.altText}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Complete Vehicle Specifications Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-900 font-display mb-4">
              Technical Specifications & Documentation
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Make & Model</dt>
                <dd className="font-medium text-slate-900">
                  {vehicle.make} {vehicle.model}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Trim / Edition</dt>
                <dd className="font-medium text-slate-900">
                  {vehicle.trim || 'Standard Specification'}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Manufacturing Year</dt>
                <dd className="font-mono font-medium text-slate-900">
                  {vehicle.year}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Vehicle Condition</dt>
                <dd className="font-medium text-slate-900">
                  {vehicle.condition}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Odometer Mileage</dt>
                <dd className="font-mono font-medium text-slate-900">
                  {vehicle.mileage.toLocaleString()} {vehicle.mileageUnit}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Transmission</dt>
                <dd className="font-medium text-slate-900">
                  {vehicle.transmission}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Fuel Type</dt>
                <dd className="font-medium text-slate-900">
                  {vehicle.fuelType}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Engine Capacity</dt>
                <dd className="font-medium text-slate-900">
                  {vehicle.engineCapacity || 'Unverified (Confirm at Viewing)'}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Body Type</dt>
                <dd className="font-medium text-slate-900">
                  {vehicle.bodyType}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Drivetrain</dt>
                <dd className="font-medium text-slate-900">
                  {vehicle.drivetrain}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Exterior Colour</dt>
                <dd className="font-medium text-slate-900">
                  {vehicle.exteriorColour || 'Unverified'}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Interior Colour</dt>
                <dd className="font-medium text-slate-900">
                  {vehicle.interiorColour || 'Unverified'}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Customs / Import Status</dt>
                <dd className="font-medium text-slate-900">
                  {vehicle.importStatus}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Chassis / VIN</dt>
                <dd className="font-mono text-xs font-medium text-slate-900">
                  {vehicle.showVinPublicly && vehicle.vin
                    ? vehicle.vin
                    : 'Available During Physical Inspection'}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Viewing Location</dt>
                <dd className="font-medium text-slate-900">
                  {vehicle.location || settings?.location || 'Accra, Ghana'}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Availability Status</dt>
                <dd className="font-semibold text-slate-900">
                  {vehicle.availabilityStatus}
                </dd>
              </div>
            </dl>
          </div>

          {/* Description & Features */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display mb-2">
                Vehicle Overview & Inspection Notes
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {vehicle.description}
              </p>
            </div>

            {vehicle.featuresList && vehicle.featuresList.length > 0 && (
              <div className="pt-5 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Key Equipment & Specifications
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                  {vehicle.featuresList.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#9A7332] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Contiguous Purchase & Inquiry Module */}
        <div className="lg:col-span-5 lg:sticky lg:top-22 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            {/* Unboxed Status Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="uppercase tracking-wider font-semibold text-slate-800">
                {vehicle.condition}
              </span>
              <span aria-hidden="true">·</span>
              <span>{vehicle.importStatus}</span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  vehicle.availabilityStatus === 'Available'
                    ? 'text-emerald-700 font-semibold'
                    : 'text-amber-700 font-semibold'
                }
              >
                {vehicle.availabilityStatus}
              </span>
              {vehicle.isSampleData && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400">Demonstration Data</span>
                </>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-display leading-snug">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              {vehicle.trim && (
                <p className="text-sm text-slate-600 mt-0.5">{vehicle.trim}</p>
              )}
            </div>

            {/* Asking Price in GH₵ */}
            <div className="py-4 border-y border-slate-100 flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Asking Price</span>
              <div className="text-right tabular-nums">
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  {formatPriceGHS(effectivePrice)}
                </div>
                {vehicle.discountPrice && vehicle.discountPrice > 0 && (
                  <div className="text-xs text-slate-400 line-through font-mono">
                    Was {formatPriceGHS(vehicle.price)}
                  </div>
                )}
              </div>
            </div>

            {/* Primary WhatsApp & Call CTAs */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() =>
                  openWhatsAppInquiry(
                    `Hello ${
                      settings?.businessName || 'WESTROAD'
                    }, I am interested in the ${fullVehicleTitle} listed at ${formatPriceGHS(
                      effectivePrice
                    )} (${listingUrl}). Is it currently available for inspection?`,
                    fullVehicleTitle,
                    vehicle.id
                  )
                }
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#15803D] hover:bg-[#166534] text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire on WhatsApp (Prefilled Vehicle Link)</span>
              </button>

              {phoneConfigured ? (
                <a
                  href={`tel:${phoneConfigured}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs rounded-xl transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Sales Desk: {phoneConfigured}</span>
                </a>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 text-slate-700 font-mono text-xs rounded-xl">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Sales Desk: {settings?.phone || '+233 59 641 6623'}</span>
                </div>
              )}
            </div>

            {/* Interactive Tabbed Forms: Purchase Inquiry vs Test Drive Request */}
            <div className="pt-2">
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('inquiry')}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    activeTab === 'inquiry'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Purchase / Info Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('testdrive')}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    activeTab === 'testdrive'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Request Test Drive
                </button>
              </div>

              {activeTab === 'inquiry' ? (
                <form onSubmit={handleInquirySubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Inquiry Type
                    </label>
                    <select
                      value={inqType}
                      onChange={(e) => setInqType(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Purchase Inquiry">
                        Purchase / Pro-Forma Inquiry
                      </option>
                      <option value="Vehicle Inquiry">
                        General Vehicle Specification Question
                      </option>
                      <option value="Trade-In Request">
                        Trade-In Valuation Toward This Vehicle
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name *"
                      value={inqName}
                      onChange={(e) => setInqName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone / WhatsApp *"
                      value={inqPhone}
                      onChange={(e) => setInqPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <input
                    type="email"
                    placeholder="Email Address (Optional)"
                    value={inqEmail}
                    onChange={(e) => setInqEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />

                  {inqType === 'Trade-In Request' && (
                    <input
                      type="text"
                      required
                      placeholder="Your Current Vehicle Make, Model, Year & Condition *"
                      value={inqTradeDetails}
                      onChange={(e) => setInqTradeDetails(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  )}

                  <textarea
                    rows={3}
                    required
                    value={inqMessage}
                    onChange={(e) => setInqMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />

                  <button
                    type="submit"
                    disabled={inqSubmitting}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {inqSubmitting
                      ? 'Submitting Inquiry...'
                      : 'Submit Vehicle Inquiry'}
                  </button>

                  {inqFeedback && (
                    <div
                      className={`p-3 rounded-lg text-xs font-medium ${
                        inqFeedback.type === 'success'
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'bg-red-50 text-red-900 border border-red-200'
                      }`}
                    >
                      {inqFeedback.text}
                    </div>
                  )}
                </form>
              ) : (
                <form onSubmit={handleTestDriveSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name *"
                      value={tdName}
                      onChange={(e) => setTdName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone / WhatsApp *"
                      value={tdPhone}
                      onChange={(e) => setTdPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <input
                    type="email"
                    placeholder="Email Address (Optional)"
                    value={tdEmail}
                    onChange={(e) => setTdEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={todayIso}
                        value={tdDate}
                        onChange={(e) => setTdDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Preferred Time *
                      </label>
                      <select
                        value={tdTime}
                        onChange={(e) => setTdTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:30 AM">10:30 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Any specific inspection notes (e.g. bringing independent mechanic)?"
                    value={tdNotes}
                    onChange={(e) => setTdNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />

                  <button
                    type="submit"
                    disabled={tdSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {tdSubmitting
                        ? 'Booking Appointment...'
                        : 'Schedule Test Drive & Inspection'}
                    </span>
                  </button>

                  {tdFeedback && (
                    <div
                      className={`p-3 rounded-lg text-xs font-medium ${
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
      </div>

      {/* Similar Vehicles Section */}
      {vehicle.similarVehicles && vehicle.similarVehicles.length > 0 && (
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Similar Vehicles in Stock
            </h2>
            <Link
              to={`/inventory?bodyType=${encodeURIComponent(vehicle.bodyType)}`}
              className="text-xs font-semibold text-slate-900 hover:text-[#9A7332]"
            >
              More {vehicle.bodyType}s →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vehicle.similarVehicles.map((sim) => (
              <VehicleCard key={sim.id} vehicle={sim} />
            ))}
          </div>
        </div>
      )}

      {/* Full-Size Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-5xl flex items-center justify-between text-white mb-4">
            <span className="text-sm font-medium">{activeImage.altText}</span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer"
              aria-label="Close full-size viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="w-full max-w-5xl aspect-[4/3] bg-[#0F1216] rounded-xl overflow-hidden">
            <VehicleImage
              src={activeImage.imageUrl}
              alt={activeImage.altText}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
