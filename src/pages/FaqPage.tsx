import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useSite } from '../context/SiteContext';

export const FaqPage: React.FC = () => {
  const { settings, faqs, updatePageSeo } = useSite();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openId, setOpenId] = useState<number | null>(null);

  const brandName = settings?.businessName || '[DEALERSHIP NAME]';

  useEffect(() => {
    updatePageSeo(
      `Frequently Asked Questions | ${brandName}`,
      `Answers regarding vehicle inspections, customs documentation, GH₵ payment procedures, and DVLA registration at ${brandName}.`
    );
  }, [brandName, updatePageSeo]);

  const categories = [
    'All',
    ...Array.from(new Set(faqs.map((f) => f.category))),
  ];
  const filteredFaqs =
    selectedCategory === 'All'
      ? faqs
      : faqs.filter((f) => f.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-14 space-y-10">
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-[#9A7332]">
          Buyer Guidance & Dealership Policies
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Transparent guidance on vehicle availability, physical mechanical
          inspections, customs clearance papers, and Ghana Cedi (GH₵) settlement
          procedures.
        </p>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filteredFaqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="p-6">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full flex items-start justify-between gap-4 text-left cursor-pointer"
              >
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A7332] block mb-1">
                    {faq.category}
                  </span>
                  <span className="text-base font-semibold text-slate-900">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 shrink-0 mt-1 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-display">
            Have a specific question about a vehicle or import procedure?
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Contact our sales desk directly for written clarification before
            making any commitment.
          </p>
        </div>
        <Link
          to="/contact"
          className="px-4 py-2.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 whitespace-nowrap"
        >
          Contact Sales Desk
        </Link>
      </div>
    </div>
  );
};

export const LegalPage: React.FC<{ mode: 'privacy' | 'terms' }> = ({
  mode,
}) => {
  const { settings, updatePageSeo } = useSite();
  const brandName = settings?.businessName || '[DEALERSHIP NAME]';

  const isPrivacy = mode === 'privacy';
  const title = isPrivacy
    ? 'Privacy Policy & Data Protection Disclosure'
    : 'Terms of Use & Vehicle Inspection Policy';

  useEffect(() => {
    updatePageSeo(`${title} | ${brandName}`);
  }, [title, brandName, updatePageSeo]);

  const content = isPrivacy
    ? settings?.privacyPolicyContent
    : settings?.termsContent;

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-14 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="text-xs font-mono uppercase tracking-wider text-[#9A7332]">
          Legal & Compliance Documentation · Republic of Ghana
        </div>
        <h1 className="text-3xl font-bold text-slate-900 font-display">
          {title}
        </h1>
        <p className="text-xs text-slate-500">
          Dealership: {brandName} · Location:{' '}
          {settings?.location || '[CITY, GHANA]'} · Editable in Admin Dashboard
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
          {content || 'Loading policy document...'}
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-5">
      <div className="text-xs font-mono uppercase tracking-wider text-[#9A7332]">
        Error 404
      </div>
      <h1 className="text-3xl font-bold text-slate-900 font-display">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-600">
        The page or vehicle listing you requested could not be found. Browse our
        active showroom inventory or contact our sales team for assistance.
      </p>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          to="/inventory"
          className="px-5 py-2.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
        >
          Browse Inventory
        </Link>
        <Link
          to="/"
          className="px-5 py-2.5 text-xs font-semibold border border-slate-300 text-slate-800 rounded-lg hover:bg-white"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};
