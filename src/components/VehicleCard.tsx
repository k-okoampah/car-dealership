import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Vehicle } from '../types';
import { useSite } from '../context/SiteContext';
import { VehicleImage } from './VehicleImage';

interface VehicleCardProps {
  vehicle: Vehicle;
  viewMode?: 'grid' | 'list';
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  viewMode = 'grid',
}) => {
  const { formatPriceGHS } = useSite();
  const primaryImage =
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images[0].imageUrl
      : '/vehicles/suv-pearl-front.svg';
  const primaryAlt =
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images[0].altText
      : `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  const effectivePrice =
    vehicle.discountPrice && vehicle.discountPrice > 0
      ? vehicle.discountPrice
      : vehicle.price;

  if (viewMode === 'list') {
    return (
      <Link
        to={`/vehicles/${vehicle.slug}`}
        className="group flex flex-col md:flex-row bg-white border border-slate-200/90 rounded-xl overflow-hidden transition-transform duration-150 hover:-translate-y-0.5"
      >
        <div className="md:w-80 lg:w-96 aspect-[4/3] bg-[#14181F] shrink-0 overflow-hidden">
          <VehicleImage
            src={primaryImage}
            alt={primaryAlt}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            {/* Zero-Pill Metadata Kicker */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
              <span className="uppercase tracking-wider font-medium text-slate-700">
                {vehicle.bodyType}
              </span>
              <span aria-hidden="true">·</span>
              <span>{vehicle.condition}</span>
              <span aria-hidden="true">·</span>
              <span>{vehicle.importStatus}</span>
              {vehicle.availabilityStatus !== 'Available' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-amber-700">
                    {vehicle.availabilityStatus}
                  </span>
                </>
              )}
              {vehicle.isSampleData && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400">Demo Listing</span>
                </>
              )}
            </div>

            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#9A7332] transition-colors">
              {vehicle.year} {vehicle.make} {vehicle.model}{' '}
              {vehicle.trim && (
                <span className="font-normal text-slate-600">
                  {vehicle.trim}
                </span>
              )}
            </h3>

            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
              {vehicle.description}
            </p>

            {/* Unboxed Technical Specs Line */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600 tabular-nums">
              <span>
                {vehicle.mileage.toLocaleString()} {vehicle.mileageUnit}
              </span>
              <span aria-hidden="true">·</span>
              <span>{vehicle.transmission}</span>
              <span aria-hidden="true">·</span>
              <span>{vehicle.fuelType}</span>
              <span aria-hidden="true">·</span>
              <span>{vehicle.drivetrain}</span>
              <span aria-hidden="true">·</span>
              <span>{vehicle.engineCapacity}</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="tabular-nums">
              <span className="text-lg font-semibold text-slate-900 font-mono">
                {formatPriceGHS(effectivePrice)}
              </span>
              {vehicle.discountPrice && vehicle.discountPrice > 0 && (
                <span className="ml-2.5 text-xs text-slate-400 line-through font-mono">
                  {formatPriceGHS(vehicle.price)}
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 group-hover:text-[#9A7332] transition-colors whitespace-nowrap shrink-0">
              View Specifications
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/vehicles/${vehicle.slug}`}
      className="group flex flex-col bg-white border border-slate-200/90 rounded-xl overflow-hidden transition-transform duration-150 hover:-translate-y-0.5"
    >
      <div className="aspect-[4/3] w-full bg-[#14181F] overflow-hidden">
        <VehicleImage
          src={primaryImage}
          alt={primaryAlt}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Clean Unboxed Metadata Line (Zero-Pill Rule) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <span className="uppercase tracking-wider font-medium text-slate-700">
              {vehicle.make}
            </span>
            <span aria-hidden="true">·</span>
            <span>{vehicle.bodyType}</span>
            <span aria-hidden="true">·</span>
            <span>{vehicle.condition}</span>
            {vehicle.availabilityStatus !== 'Available' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-amber-700">
                  {vehicle.availabilityStatus}
                </span>
              </>
            )}
          </div>

          <h3 className="mt-1.5 text-base font-semibold text-slate-900 group-hover:text-[#9A7332] transition-colors line-clamp-1">
            {vehicle.year} {vehicle.make} {vehicle.model}{' '}
            {vehicle.trim && (
              <span className="font-normal text-slate-600">{vehicle.trim}</span>
            )}
          </h3>

          {/* Unboxed Specs Row with Typographic Separators */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 tabular-nums truncate">
            <span>
              {vehicle.mileage.toLocaleString()} {vehicle.mileageUnit}
            </span>
            <span aria-hidden="true">·</span>
            <span>{vehicle.transmission}</span>
            <span aria-hidden="true">·</span>
            <span>{vehicle.fuelType}</span>
            <span aria-hidden="true">·</span>
            <span>{vehicle.drivetrain}</span>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-baseline justify-between gap-2">
          <div className="tabular-nums">
            <span className="text-[15px] font-semibold text-slate-900 font-mono">
              {formatPriceGHS(effectivePrice)}
            </span>
            {vehicle.discountPrice && vehicle.discountPrice > 0 && (
              <span className="ml-2 text-xs text-slate-400 line-through font-mono">
                {formatPriceGHS(vehicle.price)}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 truncate">
            {vehicle.importStatus}
          </span>
        </div>
      </div>
    </Link>
  );
};
