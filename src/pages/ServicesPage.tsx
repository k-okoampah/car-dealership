import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useSite } from '../context/SiteContext';

export const ServicesPage: React.FC = () => {
  const { settings, services, openWhatsAppInquiry, updatePageSeo } = useSite();
  const brandName = settings?.businessName || 'WESRROAD';

  useEffect(() => {
    updatePageSeo(
      `Automotive Services & Vehicle Sourcing | ${brandName}`,
      `Explore confirmed services offered by ${brandName} in ${
        settings?.location || 'Ghana'
      }, including vehicle sales, bespoke import sourcing, mechanical inspections, and trade-in valuations.`
    );
  }, [brandName, settings?.location, updatePageSeo]);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="text-xs font-mono uppercase tracking-wider text-[#9A7332]">
          Confirmed Dealership Capabilities · {settings?.location || 'Accra, Ghana'}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display tracking-tight headline-balance">
          Automotive Sales, Custom Sourcing & Pre-Purchase Inspections
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          We only display services actively provided by {brandName}. Whether you
          are purchasing from our yard in {settings?.location || 'Accra, Ghana'}{' '}
          or commissioning a direct import to Tema Port, our team coordinates
          each stage with written documentation.
        </p>
      </div>

      {/* Confirmed Services Grid */}
      {services.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-600">
          No confirmed services are currently published. Administrators can
          enable services in the Admin Dashboard.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {services.map((svc, idx) => (
            <div
              key={svc.id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="text-xs font-mono font-semibold text-[#9A7332]">
                  0{idx + 1}.
                </div>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  {svc.title}
                </h2>
                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  {svc.description}
                </p>
                {svc.details && (
                  <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
                    {svc.details}
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <Link
                  to={`/contact?type=${encodeURIComponent(svc.title)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-[#9A7332]"
                >
                  <span>Request This Service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    openWhatsAppInquiry(
                      `Hello ${brandName}, I would like to inquire about your "${svc.title}" service in Ghana.`
                    )
                  }
                  className="text-xs font-medium text-emerald-700 hover:underline cursor-pointer"
                >
                  WhatsApp Desk
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bespoke Vehicle Sourcing & Trade-In Callout */}
      <div className="bg-[#0E1116] text-white rounded-2xl p-8 lg:p-12 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-3">
          <h2 className="text-2xl font-bold font-display">
            Need a Specific Specification Imported or Valuing a Trade-In?
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Submit your preferred make, model, manufacturing year, and budget in
            GH₵, or provide details of your current Ghana-registered vehicle for
            a physical trade-in appraisal.
          </p>
        </div>
        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
          <Link
            to="/contact?type=Vehicle+Sourcing"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#C89D54] hover:bg-[#B88B42] text-slate-950 font-semibold text-xs rounded-lg transition-colors"
          >
            <span>Submit Sourcing / Trade-In Request</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() =>
              openWhatsAppInquiry(
                `Hello ${brandName}, I would like to discuss a custom vehicle sourcing or trade-in valuation request in Ghana.`
              )
            }
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-lg border border-white/15 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#4ADE80]" />
            <span>Discuss on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
