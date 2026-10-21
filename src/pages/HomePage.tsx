import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  MessageCircle,
  Search,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { Vehicle } from '../types';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleImage } from '../components/VehicleImage';
import {
  DEFAULT_BUYING_PROCESS,
  DEFAULT_WHY_CHOOSE_US,
} from '../constants/defaults';

const BODY_CATEGORIES = [
  'All',
  'SUV',
  'Sedan',
  'Pickup',
  'Hatchback',
  'Luxury',
  'Coupe',
  'Van',
];

export const HomePage: React.FC = () => {
  const {
    settings,
    faqs,
    testimonials,
    filterMeta,
    openWhatsAppInquiry,
    updatePageSeo,
  } = useSite();
  const navigate = useNavigate();

  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [collectionTab, setCollectionTab] = useState<'featured' | 'recent'>(
    'featured'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  // Quick search form state
  const [searchQ, setSearchQ] = useState('');
  const [searchMake, setSearchMake] = useState('All');
  const [searchBody, setSearchBody] = useState('All');
  const [searchCondition, setSearchCondition] = useState('All');
  const [searchMaxPrice, setSearchMaxPrice] = useState('');

  useEffect(() => {
    updatePageSeo(
      settings?.seoTitle ||
        `${settings?.businessName || 'WESRROAD'} — Car Sales Dealership in Ghana`,
      settings?.seoDescription
    );
  }, [settings, updatePageSeo]);

  useEffect(() => {
    let active = true;
    const loadVehicles = async () => {
      setLoadingVehicles(true);
      try {
        const res = await fetch('/api/vehicles?limit=24&sort=newest');
        if (res.ok && active) {
          const data = await res.json();
          setVehiclesList(data.vehicles || []);
        }
      } catch (err) {
        console.error('Failed to load homepage vehicles:', err);
      } finally {
        if (active) setLoadingVehicles(false);
      }
    };
    loadVehicles();
    return () => {
      active = false;
    };
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQ.trim()) params.set('q', searchQ.trim());
    if (searchMake !== 'All') params.set('make', searchMake);
    if (searchBody !== 'All') params.set('bodyType', searchBody);
    if (searchCondition !== 'All') params.set('condition', searchCondition);
    if (searchMaxPrice) params.set('maxPrice', searchMaxPrice);
    navigate(`/inventory?${params.toString()}`);
  };

  const displayedVehicles = vehiclesList
    .filter((v) => {
      if (selectedCategory !== 'All' && v.bodyType !== selectedCategory) {
        return false;
      }
      if (collectionTab === 'featured') {
        return v.featuredStatus;
      }
      return true;
    })
    .slice(0, 6);

  const fallbackVehicles =
    displayedVehicles.length > 0
      ? displayedVehicles
      : vehiclesList
          .filter(
            (v) => selectedCategory === 'All' || v.bodyType === selectedCategory
          )
          .slice(0, 6);

  let whyChooseUsList = DEFAULT_WHY_CHOOSE_US;
  let buyingProcessList = DEFAULT_BUYING_PROCESS;
  try {
    if (settings?.whyChooseUs) {
      const parsed = JSON.parse(settings.whyChooseUs);
      if (Array.isArray(parsed) && parsed.length > 0) whyChooseUsList = parsed;
    }
    if (settings?.buyingProcess) {
      const parsed = JSON.parse(settings.buyingProcess);
      if (Array.isArray(parsed) && parsed.length > 0)
        buyingProcessList = parsed;
    }
  } catch {
    // Use defaults
  }

  const brandName = settings?.businessName || 'WESRROAD';

  return (
    <div>
      {/* SECTION 1: Storefront Hero & Advanced Search Bar */}
      <section className="bg-[#0E1116] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Column: Editorial Headline & Direct CTAs */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">

                <h1 className="font-display font-bold tracking-tight text-white headline-balance text-3xl sm:text-4xl lg:text-[42px] leading-[1.12]">
                  {settings?.heroHeadline ||
                    'Direct China–Ghana Vehicle Sourcing & Verified Sales in Accra'}
                </h1>

                <p className="text-slate-300 text-base leading-relaxed max-w-xl">
                  {settings?.heroDescription ||
                    'Backed by 15-year automotive expertise with regional offices along the N1 Highway in Accra and branches across Beijing, Tianjin, Guangzhou and Chengdu. Browse verified SUVs, sedans and commercial vehicles priced transparently in GH₵.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/inventory"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#C89D54] hover:bg-[#B88B42] text-slate-950 font-semibold text-sm rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Browse Available Cars</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    openWhatsAppInquiry(
                      `Hello ${brandName}, I am on your homepage and would like to inquire about available vehicles and inspection scheduling in ${
                        settings?.location || 'Ghana'
                      }.`
                    )
                  }
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-lg border border-white/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#4ADE80]" />
                  <span>Inquire on WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Right Column: Studio Showroom Hero Visual */}
            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[300px] sm:min-h-[360px] rounded-2xl overflow-hidden border border-slate-800 bg-[#14181F] group">
                <VehicleImage
                  src={
                    displayedVehicles[0]?.images?.[0]?.imageUrl ||
                    'https://shop-car-dev.oss-cn-beijing.aliyuncs.com/product/image/1790233079718.jpg'
                  }
                  alt={
                    displayedVehicles[0]
                      ? `${displayedVehicles[0].year} ${displayedVehicles[0].make} ${displayedVehicles[0].model}`
                      : 'WESRROAD Featured Showroom Vehicle'
                  }
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-6">
                  <div className="w-full space-y-2">
                    {displayedVehicles[0] && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-block px-2.5 py-1 bg-[#C89D54] text-slate-950 font-bold text-xs rounded">
                          Featured Arrival
                        </span>
                        <span className="font-mono font-bold text-sm text-white">
                          GH₵ {displayedVehicles[0].price?.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-200">
                      <div>
                        <span className="font-semibold text-white">
                          {displayedVehicles[0]
                            ? `${displayedVehicles[0].year} ${displayedVehicles[0].make} ${displayedVehicles[0].model}`
                            : 'Physical Yard Inspection Welcome'}
                        </span>
                        <span className="mx-2 text-slate-400">·</span>
                        <span>N1 Highway Accra</span>
                      </div>
                      <Link
                        to={displayedVehicles[0] ? `/vehicles/${displayedVehicles[0].slug}` : '/inventory'}
                        className="text-[#C89D54] hover:underline font-medium whitespace-nowrap"
                      >
                        View Vehicle Details →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width Advanced Vehicle Search Panel Below Hero Split */}
          <div className="mt-10 bg-[#161B22] border border-slate-800 rounded-xl p-5">
            <form
              onSubmit={handleQuickSearch}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
            >
              <div className="lg:col-span-2">
                <label
                  htmlFor="hero-search-q"
                  className="block text-xs font-medium text-slate-400 mb-1.5"
                >
                  Search Make, Model, or Keyword
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="hero-search-q"
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="e.g. Land Cruiser, C300, Hilux, 4WD..."
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0E1116] border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#C89D54]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="hero-make"
                  className="block text-xs font-medium text-slate-400 mb-1.5"
                >
                  Manufacturer
                </label>
                <select
                  id="hero-make"
                  value={searchMake}
                  onChange={(e) => setSearchMake(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0E1116] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#C89D54]"
                >
                  <option value="All">All Makes</option>
                  {filterMeta.makes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="hero-body"
                  className="block text-xs font-medium text-slate-400 mb-1.5"
                >
                  Body Type
                </label>
                <select
                  id="hero-body"
                  value={searchBody}
                  onChange={(e) => setSearchBody(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0E1116] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#C89D54]"
                >
                  <option value="All">All Categories</option>
                  {BODY_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="hero-max-price"
                  className="block text-xs font-medium text-slate-400 mb-1.5"
                >
                  Max Budget (GH₵)
                </label>
                <select
                  id="hero-max-price"
                  value={searchMaxPrice}
                  onChange={(e) => setSearchMaxPrice(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0E1116] border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#C89D54]"
                >
                  <option value="">No Max Limit</option>
                  <option value="500000">Up to GH₵ 500,000</option>
                  <option value="800000">Up to GH₵ 800,000</option>
                  <option value="1200000">Up to GH₵ 1,200,000</option>
                  <option value="2500000">Up to GH₵ 2,500,000</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#C89D54] hover:bg-[#B88B42] text-slate-950 font-semibold text-sm rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Search Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* SECTION 2: Featured & Recently Added Inventory Collection */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
              Showroom Inventory
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Filter by vehicle category or switch between featured selections
              and recent arrivals.
            </p>
          </div>

          {/* Interactive Collection Toggle (Segmented Buttons) */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg self-start">
            <button
              type="button"
              onClick={() => setCollectionTab('featured')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                collectionTab === 'featured'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Featured Vehicles
            </button>
            <button
              type="button"
              onClick={() => setCollectionTab('recent')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                collectionTab === 'recent'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recently Added
            </button>
          </div>
        </div>

        {/* Interactive Body Type Filter Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-slate-200">
          {BODY_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === category
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              {category === 'All' ? 'All Body Types' : `${category}s`}
            </button>
          ))}
        </div>

        {loadingVehicles ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-xl bg-slate-200/70 animate-pulse"
              />
            ))}
          </div>
        ) : fallbackVehicles.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              No Published Vehicles Match This Category
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Our inventory is updated as vehicles clear customs. You can reset
              the category filter or request a custom vehicle sourcing quote.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              {selectedCategory !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg cursor-pointer"
                >
                  Show All Categories
                </button>
              )}
              <Link
                to="/contact?type=Vehicle+Sourcing"
                className="px-4 py-2 text-xs font-semibold border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-50"
              >
                Request Vehicle Sourcing
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {fallbackVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Showing verified inventory priced in Ghana Cedis (GH₵). Looking for a
            specific model not listed above?
          </p>
          <div className="flex items-center gap-3">
            <Link
              to="/contact?type=Vehicle+Sourcing"
              className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-white transition-colors whitespace-nowrap"
            >
              Sourcing & Import Request
            </Link>
            <Link
              to="/inventory"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <span>View Full Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: Why Choose Our Dealership & 4-Step Buying Process */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-16">
          {/* Why Choose Us */}
          <div>
            <div className="max-w-2xl mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight headline-balance">
                Why Buyers Across Ghana Choose {brandName}
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Every transaction is built around physical verification,
                authentic customs documentation, and clear Ghana Cedi pricing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {whyChooseUsList.map((item, idx) => (
                <div
                  key={idx}
                  className="pt-5 border-t border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-mono font-semibold text-[#9A7332]">
                      {item.step || `0${idx + 1}`}.
                    </span>
                    <h3 className="mt-2 text-base font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How to Inspect & Purchase a Vehicle */}
          <div className="pt-12 border-t border-slate-200">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
                  How Vehicle Inspection & Purchase Works
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  A transparent four-step process from online inquiry to
                  verified handover.
                </p>
              </div>
              <Link
                to="/services"
                className="text-xs font-semibold text-slate-900 hover:text-[#9A7332] whitespace-nowrap"
              >
                Explore Dealership Services →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {buyingProcessList.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-[#F8F8F7] border border-slate-200/80 rounded-xl p-6"
                >
                  <div className="text-xs font-mono font-semibold text-slate-500">
                    Step {step.step || `0${idx + 1}`}
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Conditional Financing Section (Displayed ONLY if genuinely enabled by Dealership in Admin) */}
          {settings?.financingOffered && settings.financingDetails && (
            <div className="pt-10 border-t border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Partner Bank Auto-Financing Referral
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {settings.financingDetails}
                </p>
              </div>
              <Link
                to="/contact?type=Purchase+Inquiry"
                className="px-5 py-2.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 whitespace-nowrap"
              >
                Request Pro-Forma Invoice
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Conditional Customer Testimonials (Displayed ONLY when genuine verified testimonials exist) */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 border-b border-slate-200">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              Verified Buyer Feedback
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Direct statements from customers who inspected and purchased
              vehicles through {brandName}.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
              >
                <p className="text-sm text-slate-700 leading-relaxed">
                  “{t.content}”
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <strong className="text-slate-900 font-semibold">
                    {t.customerName}
                  </strong>
                  <span> · {t.roleOrLocation}</span>
                  {t.vehiclePurchased && (
                    <div className="mt-0.5 text-slate-500">
                      Vehicle: {t.vehiclePurchased}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 4: Frequently Asked Questions & Direct Contact Strip */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Clear answers on independent mechanical inspections, ICUMS customs
              duty verification, GH₵ bank settlements, and DVLA registration.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/faq"
                className="px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-50"
              >
                View All FAQs
              </Link>
              <Link
                to="/contact"
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Ask a Question
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 divide-y divide-slate-200 bg-white border border-slate-200 rounded-xl overflow-hidden">
            {faqs.slice(0, 4).map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className="p-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-slate-900">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-150 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
