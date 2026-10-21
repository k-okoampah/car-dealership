import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { DEFAULT_WHY_CHOOSE_US } from '../constants/defaults';

export const AboutPage: React.FC = () => {
  const { settings, openWhatsAppInquiry, updatePageSeo } = useSite();
  const brandName = settings?.businessName || 'WESRROAD';

  useEffect(() => {
    updatePageSeo(
      `About ${brandName} | Vehicle Dealership in ${
        settings?.location || 'Accra, Ghana'
      }`,
      settings?.aboutBackground?.slice(0, 155)
    );
  }, [brandName, settings, updatePageSeo]);

  let whyChooseUsList = DEFAULT_WHY_CHOOSE_US;
  try {
    if (settings?.whyChooseUs) {
      const parsed = JSON.parse(settings.whyChooseUs);
      if (Array.isArray(parsed) && parsed.length > 0) whyChooseUsList = parsed;
    }
  } catch {
    // fallback
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="text-xs font-mono uppercase tracking-wider text-[#9A7332]">
          About the Dealership · {settings?.location || 'Accra, Ghana'}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display tracking-tight headline-balance">
          Committed to Verifiable Documentation and Straightforward Car Buying in
          Ghana
        </h1>
        <p className="text-base text-slate-600 leading-relaxed whitespace-pre-line">
          {settings?.aboutBackground}
        </p>
      </div>

      {/* Mission & Customer Service Approach */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-xl p-7 space-y-3">
          <div className="text-xs font-mono font-semibold text-[#9A7332]">
            01. MISSION & VALUES
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Our Dealership Mission
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {settings?.aboutMission}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-7 space-y-3">
          <div className="text-xs font-mono font-semibold text-[#9A7332]">
            02. CUSTOMER SERVICE APPROACH
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Physical Verification Before Payment
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {settings?.aboutCustomerApproach}
          </p>
        </div>
      </div>

      {/* Reasons to Choose the Dealership */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            Why Choose {brandName}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Practical standards that protect vehicle buyers in{' '}
            {settings?.primaryMarket || 'Ghana'}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyChooseUsList.map((item, idx) => (
            <div key={idx} className="pt-4 border-t border-slate-200">
              <span className="text-xs font-mono font-semibold text-[#9A7332]">
                {item.step || `0${idx + 1}`}.
              </span>
              <h3 className="mt-2 text-base font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Location, Opening Hours & Team Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-7 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Showroom Location & Operating Details
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
            <div className="p-4 bg-[#F8F8F7] rounded-lg border border-slate-200/70">
              <dt className="text-xs text-slate-500">City & Market</dt>
              <dd className="font-semibold text-slate-900 mt-1">
                {settings?.location || 'Accra, Ghana'}
              </dd>
            </div>
            <div className="p-4 bg-[#F8F8F7] rounded-lg border border-slate-200/70">
              <dt className="text-xs text-slate-500">Physical Address</dt>
              <dd className="font-semibold text-slate-900 mt-1">
                {settings?.address || 'Along the N1 Highway, Accra, Ghana'}
              </dd>
            </div>
            <div className="p-4 bg-[#F8F8F7] rounded-lg border border-slate-200/70">
              <dt className="text-xs text-slate-500">Opening Hours</dt>
              <dd className="font-semibold text-slate-900 mt-1">
                {settings?.openingHours || 'Monday – Saturday: 8:00 AM – 6:00 PM GMT'}
              </dd>
            </div>
            <div className="p-4 bg-[#F8F8F7] rounded-lg border border-slate-200/70">
              <dt className="text-xs text-slate-500">Primary Currency</dt>
              <dd className="font-semibold text-slate-900 mt-1 font-mono">
                Ghana Cedi ({settings?.currency || 'GH₵'})
              </dd>
            </div>
          </dl>

          {settings?.aboutTeamInfo && (
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Sales & Inspection Team
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {settings.aboutTeamInfo}
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-[#0E1116] text-white rounded-xl p-7 space-y-5 border border-slate-800">
          <h2 className="text-xl font-bold font-display">
            Visit Our Yard or Speak With Sales
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Schedule an appointment before visiting so we can have your selected
            vehicle ready for inspection and road testing.
          </p>
          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div>Phone: {settings?.phone || '+233 59 641 6623'}</div>
            <div>WhatsApp: {settings?.whatsapp || '+233 59 641 6623'}</div>
            <div>Email: {settings?.email || 'wrmobile@163.com'}</div>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/inventory"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#C89D54] hover:bg-[#B88B42] text-slate-950 font-semibold text-xs rounded-lg transition-colors"
            >
              <span>Browse Available Vehicles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() =>
                openWhatsAppInquiry(
                  `Hello ${brandName}, I read your About page and would like to arrange a showroom visit in ${
                    settings?.location || 'Ghana'
                  }.`
                )
              }
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-lg border border-white/15 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>Chat on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
