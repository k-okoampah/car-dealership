import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Check,
  Filter,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  Share2,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { Vehicle } from '../types';
import { VehicleCard } from '../components/VehicleCard';

export const InventoryPage: React.FC = () => {
  const { settings, filterMeta, updatePageSeo } = useSite();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sharedCopied, setSharedCopied] = useState(false);

  // Extract current filter state from URL query params
  const q = searchParams.get('q') || '';
  const make = searchParams.get('make') || 'All';
  const model = searchParams.get('model') || '';
  const bodyType = searchParams.get('bodyType') || 'All';
  const condition = searchParams.get('condition') || 'All';
  const transmission = searchParams.get('transmission') || 'All';
  const fuelType = searchParams.get('fuelType') || 'All';
  const drivetrain = searchParams.get('drivetrain') || 'All';
  const availability = searchParams.get('availability') || 'All';
  const importStatus = searchParams.get('importStatus') || 'All';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minYear = searchParams.get('minYear') || '';
  const maxYear = searchParams.get('maxYear') || '';
  const maxMileage = searchParams.get('maxMileage') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || '1');

  useEffect(() => {
    updatePageSeo(
      `Browse Available Cars in Ghana (${total} Vehicles)`,
      `Search and filter inspected SUVs, sedans, and 4x4 pickups priced in GH₵ at ${
        settings?.businessName || 'WESRROAD'
      }.`
    );
  }, [total, settings?.businessName, updatePageSeo]);

  useEffect(() => {
    let active = true;
    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiParams = new URLSearchParams(searchParams);
        if (!apiParams.has('limit')) apiParams.set('limit', '9');
        const res = await fetch(`/api/vehicles?${apiParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setVehicles(data.vehicles || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
          }
        } else {
          throw new Error('API returned non-200');
        }
      } catch (err: any) {
        try {
          const raw = await import('../data/wesrroadVehicles.json');
          const allItems = (raw.default || raw) as unknown as Vehicle[];
          let filtered = allItems;
          if (q.trim()) {
            const query = q.toLowerCase();
            filtered = filtered.filter(
              (v) =>
                v.make.toLowerCase().includes(query) ||
                v.model.toLowerCase().includes(query) ||
                v.description.toLowerCase().includes(query)
            );
          }
          if (make && make !== 'All') {
            filtered = filtered.filter((v) => v.make === make);
          }
          if (bodyType && bodyType !== 'All') {
            filtered = filtered.filter((v) => v.bodyType === bodyType);
          }
          const limit = 9;
          const start = (page - 1) * limit;
          const pageItems = filtered.slice(start, start + limit);
          if (active) {
            setVehicles(pageItems);
            setTotal(filtered.length);
            setTotalPages(Math.ceil(filtered.length / limit) || 1);
          }
        } catch {
          if (active) {
            setError('Error loading inventory');
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchInventory();
    return () => {
      active = false;
    };
  }, [searchParams]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'All') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleShareSearch = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setSharedCopied(true);
      setTimeout(() => setSharedCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Build active filter descriptors
  const activeFilters: { key: string; label: string }[] = [];
  if (q) activeFilters.push({ key: 'q', label: `Keyword: "${q}"` });
  if (make !== 'All') activeFilters.push({ key: 'make', label: `Make: ${make}` });
  if (model) activeFilters.push({ key: 'model', label: `Model: ${model}` });
  if (bodyType !== 'All')
    activeFilters.push({ key: 'bodyType', label: `Category: ${bodyType}` });
  if (condition !== 'All')
    activeFilters.push({ key: 'condition', label: `Condition: ${condition}` });
  if (transmission !== 'All')
    activeFilters.push({
      key: 'transmission',
      label: `Transmission: ${transmission}`,
    });
  if (fuelType !== 'All')
    activeFilters.push({ key: 'fuelType', label: `Fuel: ${fuelType}` });
  if (drivetrain !== 'All')
    activeFilters.push({ key: 'drivetrain', label: `Drive: ${drivetrain}` });
  if (availability !== 'All')
    activeFilters.push({
      key: 'availability',
      label: `Status: ${availability}`,
    });
  if (importStatus !== 'All')
    activeFilters.push({
      key: 'importStatus',
      label: `Customs: ${importStatus}`,
    });
  if (minPrice)
    activeFilters.push({
      key: 'minPrice',
      label: `Min: GH₵ ${Number(minPrice).toLocaleString()}`,
    });
  if (maxPrice)
    activeFilters.push({
      key: 'maxPrice',
      label: `Max: GH₵ ${Number(maxPrice).toLocaleString()}`,
    });
  if (minYear)
    activeFilters.push({ key: 'minYear', label: `From Year: ${minYear}` });
  if (maxYear)
    activeFilters.push({ key: 'maxYear', label: `To Year: ${maxYear}` });
  if (maxMileage)
    activeFilters.push({
      key: 'maxMileage',
      label: `Max Mileage: ${Number(maxMileage).toLocaleString()} km`,
    });

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display tracking-tight">
            Browse Vehicle Inventory
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Search available new, foreign-used, and Ghana-registered vehicles in{' '}
            {settings?.location || 'Accra, Ghana'}. All prices in GH₵.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleShareSearch}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-slate-900 cursor-pointer whitespace-nowrap"
          >
            {sharedCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Search Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Search Results</span>
              </>
            )}
          </button>

          {/* Sort Control */}
          <select
            aria-label="Sort vehicles"
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
          >
            <option value="newest">Sort: Newest Added</option>
            <option value="price_asc">Price: Low to High (GH₵)</option>
            <option value="price_desc">Price: High to Low (GH₵)</option>
            <option value="year_desc">Year: Newest First</option>
            <option value="mileage_asc">Mileage: Lowest First</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Filter Panel */}
        <aside className="lg:col-span-3 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Filter className="w-4 h-4 text-[#9A7332]" />
                <span>Search & Filters</span>
              </div>
              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            {/* Keyword */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Keyword
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => updateFilter('q', e.target.value)}
                  placeholder="Make, model, trim..."
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            {/* Make */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Make / Manufacturer
              </label>
              <select
                value={make}
                onChange={(e) => updateFilter('make', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="All">All Makes</option>
                {filterMeta.makes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Model Name
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => updateFilter('model', e.target.value)}
                placeholder="e.g. Land Cruiser, Hilux, C300"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            {/* Category / Body Type */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Body Type
              </label>
              <select
                value={bodyType}
                onChange={(e) => updateFilter('bodyType', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="All">All Body Types</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Pickup">Pickup</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Luxury">Luxury</option>
                <option value="Coupe">Coupe</option>
                <option value="Van">Van</option>
              </select>
            </div>

            {/* Price Range in GH₵ */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Min Price (GH₵)
                </label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  placeholder="Min GH₵"
                  className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Max Price (GH₵)
                </label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  placeholder="Max GH₵"
                  className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            {/* Year Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Min Year
                </label>
                <input
                  type="number"
                  min={2000}
                  max={2027}
                  value={minYear}
                  onChange={(e) => updateFilter('minYear', e.target.value)}
                  placeholder="e.g. 2019"
                  className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Max Year
                </label>
                <input
                  type="number"
                  min={2000}
                  max={2027}
                  value={maxYear}
                  onChange={(e) => updateFilter('maxYear', e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => updateFilter('condition', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="All">All Conditions</option>
                <option value="New">Brand New</option>
                <option value="Foreign Used">Foreign Used (Tokunbo / Home Used)</option>
                <option value="Ghana Used">Ghana Registered / Used</option>
              </select>
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Transmission
              </label>
              <select
                value={transmission}
                onChange={(e) => updateFilter('transmission', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="All">All Transmissions</option>
                <option value="Automatic">Automatic</option>
                <option value="CVT">CVT</option>
                <option value="Dual-Clutch">Dual-Clutch</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Fuel Type
              </label>
              <select
                value={fuelType}
                onChange={(e) => updateFilter('fuelType', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="All">All Fuel Types</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            {/* Drivetrain */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Drivetrain
              </label>
              <select
                value={drivetrain}
                onChange={(e) => updateFilter('drivetrain', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="All">All Drivetrains</option>
                <option value="4WD / AWD">4WD / AWD</option>
                <option value="FWD">FWD</option>
                <option value="RWD">RWD</option>
              </select>
            </div>

            {/* Max Mileage */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Max Mileage (km)
              </label>
              <select
                value={maxMileage}
                onChange={(e) => updateFilter('maxMileage', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-mono focus:outline-none focus:border-slate-900"
              >
                <option value="">Any Mileage</option>
                <option value="5000">Under 5,000 km</option>
                <option value="20000">Under 20,000 km</option>
                <option value="40000">Under 40,000 km</option>
                <option value="80000">Under 80,000 km</option>
              </select>
            </div>

            {/* Import Status */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Import / Customs Status
              </label>
              <select
                value={importStatus}
                onChange={(e) => updateFilter('importStatus', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="All">All Import Statuses</option>
                <option value="Customs Duty Paid">Customs Duty Paid</option>
                <option value="Registered in Ghana">Registered in Ghana</option>
                <option value="In Transit / Pre-Order">
                  In Transit / Pre-Order
                </option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) => updateFilter('availability', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="All">All Listed Stock</option>
                <option value="Available">Available Now</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Right Inventory Results */}
        <div className="lg:col-span-9 space-y-6">
          {/* Result Count & Active Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600 tabular-nums">
              Showing <strong className="text-slate-900">{vehicles.length}</strong> of{' '}
              <strong className="text-slate-900">{total}</strong> matching
              vehicles
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => updateFilter(f.key, '')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors cursor-pointer"
                  >
                    <span>{f.label}</span>
                    <span className="text-slate-500">×</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-red-700 hover:underline ml-1 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl p-5 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-80 rounded-xl bg-slate-200/70 animate-pulse"
                />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">
                No Vehicles Match Your Exact Filter Criteria
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Try broadening your price range in GH₵, clearing one or more
                active filters, or submitting a bespoke vehicle sourcing request
                to our import team.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Clear All Filters
                </button>
                <Link
                  to="/contact?type=Vehicle+Sourcing"
                  className="px-4 py-2 text-xs font-semibold border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-50"
                >
                  Submit Vehicle Sourcing Request
                </Link>
              </div>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-4">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} viewMode="list" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} viewMode="grid" />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-6 flex items-center justify-between border-t border-slate-200">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => updateFilter('page', String(page - 1))}
                className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Previous Page
              </button>
              <span className="text-xs text-slate-600 font-mono">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => updateFilter('page', String(page + 1))}
                className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Next Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
