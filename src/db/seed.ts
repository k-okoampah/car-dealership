import { db } from './index.ts';
import {
  dealershipSettings,
  faqs,
  services,
  vehicleImages,
  vehicles,
} from './schema.ts';
import { eq } from 'drizzle-orm';
import {
  DEFAULT_BUYING_PROCESS,
  DEFAULT_WHY_CHOOSE_US,
} from '../constants/defaults.ts';

export { DEFAULT_BUYING_PROCESS, DEFAULT_WHY_CHOOSE_US };

export const DEFAULT_PRIVACY_POLICY = `1. DATA CONTROLLER & SCOPE
This Privacy Policy governs how [DEALERSHIP NAME] ("we", "our", or "the Dealership"), operating in [CITY, GHANA], collects, processes, and safeguards personal information in accordance with the Data Protection Act, 2012 (Act 843) of the Republic of Ghana.

2. INFORMATION WE COLLECT
When you submit a vehicle inquiry, request a test drive, request vehicle sourcing, or propose a trade-in on [DOMAIN NAME], we collect:
- Full Name
- Telephone and WhatsApp Contact Number
- Email Address (where provided)
- Preferred Appointment Dates, Vehicle Preferences, and Trade-In Specifications

3. HOW WE USE YOUR INFORMATION
Your contact details are used strictly to:
- Respond to your vehicle availability or purchase inquiries
- Confirm and coordinate physical inspections and test-drive appointments
- Prepare pro-forma invoices or vehicle sourcing estimates upon request

4. DATA PROTECTION & CONFIDENTIALITY
Customer inquiries and contact records are stored in access-controlled databases restricted to authorized dealership personnel. We never sell, rent, or publicly display customer contact information.

5. YOUR RIGHTS UNDER GHANA LAW
You may request access to, correction of, or deletion of your personal inquiry records at any time by contacting [BUSINESS EMAIL] or calling [PHONE NUMBER].`;

export const DEFAULT_TERMS = `1. GENERAL TERMS OF USE
Welcome to [DOMAIN NAME], the official online inventory platform for [DEALERSHIP NAME], located at [PHYSICAL ADDRESS], [CITY, GHANA]. By accessing this website, you agree to these Terms of Use.

2. VEHICLE LISTINGS & PRICING IN GH₵
All prices are quoted in Ghana Cedis (GH₵) unless stated otherwise. While we make every effort to ensure specifications, mileage readings, and availability statuses are accurate, online listings constitute an invitation to treat and not a binding contract of sale.

3. PHYSICAL INSPECTION & VERIFICATION
Prospective buyers are strongly advised to inspect vehicles physically and verify all specifications, chassis numbers (VIN), and customs documentation prior to completing any purchase. Unavailable or unverified specifications are explicitly labeled as such.

4. PAYMENTS & RESERVATIONS
This website facilitates purchase inquiries and appointment scheduling. Never transfer funds to personal mobile money accounts or unverified third parties. All payments or reservation deposits must be confirmed directly at our physical office ([PHYSICAL ADDRESS]) and settled through official dealership corporate bank accounts.

5. WARRANTY & AFTER-SALES POLICY
Unless a written warranty agreement is explicitly executed on official dealership letterhead at the time of sale, used vehicles are sold subject to the buyer's pre-purchase inspection and verification.`;

export const SAMPLE_VEHICLES_DATA = [
  {
    slug: '2023-toyota-land-cruiser-300-vxr-demo',
    make: 'Toyota',
    model: 'Land Cruiser 300',
    trim: 'VX-R 3.5L V6 Twin-Turbo',
    year: 2023,
    price: 2150000,
    discountPrice: null,
    currency: 'GH₵',
    condition: 'Foreign Used',
    mileage: 14200,
    mileageUnit: 'km',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    engineCapacity: '3.5L V6 Twin-Turbo',
    bodyType: 'SUV',
    exteriorColour: 'Pearl White',
    interiorColour: 'Saddle Tan Leather',
    drivetrain: '4WD / AWD',
    vin: 'JTMAA7BJ0P4019283',
    showVinPublicly: true,
    importStatus: 'Customs Duty Paid',
    location: '[CITY, GHANA]',
    description:
      '[DEMONSTRATION LISTING] Full-size 4WD flagship SUV equipped with the 3.5L V6 Twin-Turbo petrol powertrain and 10-speed automatic transmission. Cleared at Tema Port with full ICUMS customs documentation. Features multi-terrain monitor, ventilated leather seating for 7 passengers, cool box, and heavy-duty adaptive variable suspension ideal for both executive city travel and regional highways.',
    features: JSON.stringify([
      'Multi-Terrain Select & Crawl Control',
      '12.3-inch JBL Reference Infotainment',
      '360-Degree Panoramic Camera System',
      'Center Console Cool Box',
      'Four-Zone Climate Control',
      'Ventilated & Heated Front/Second Row Seats',
      'Power Tailgate with Kick Sensor',
      'Adaptive Radar Cruise Control',
    ]),
    availabilityStatus: 'Available',
    featuredStatus: true,
    publicationStatus: 'Published',
    isSampleData: true,
    images: [
      {
        imageUrl: '/vehicles/suv-pearl-front.svg',
        altText: '2023 Toyota Land Cruiser 300 VX-R Front Quarter Studio View',
        sortOrder: 0,
      },
      {
        imageUrl: '/vehicles/suv-pearl-side.svg',
        altText: '2023 Toyota Land Cruiser 300 VX-R Side Profile Dimensions',
        sortOrder: 1,
      },
      {
        imageUrl: '/vehicles/suv-pearl-interior.svg',
        altText: '2023 Toyota Land Cruiser 300 VX-R Leather Cabin & Console',
        sortOrder: 2,
      },
    ],
  },
  {
    slug: '2022-mercedes-benz-c300-amg-line-demo',
    make: 'Mercedes-Benz',
    model: 'C300',
    trim: 'AMG Line 4MATIC',
    year: 2022,
    price: 940000,
    discountPrice: 910000,
    currency: 'GH₵',
    condition: 'Foreign Used',
    mileage: 22850,
    mileageUnit: 'km',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    engineCapacity: '2.0L Inline-4 Turbo + EQ Boost',
    bodyType: 'Sedan',
    exteriorColour: 'Obsidian Black Metallic',
    interiorColour: 'Anthracite Nappa Leather',
    drivetrain: '4WD / AWD',
    vin: 'W1KAF4GB2NR048219',
    showVinPublicly: false,
    importStatus: 'Customs Duty Paid',
    location: '[CITY, GHANA]',
    description:
      '[DEMONSTRATION LISTING] W206 generation Mercedes-Benz C300 AMG Line with 9G-TRONIC automatic transmission and 48V mild-hybrid assistance. Imported clean-title with complete customs clearance. Equipped with MBUX portrait central display, Burmester 3D surround sound, panoramic sliding sunroof, and DIGITAL LIGHT LED headlamps.',
    features: JSON.stringify([
      'AMG Bodystyling & 19-inch Multi-Spoke Alloys',
      '11.9-inch MBUX Central Portrait Display',
      'Burmester 3D Surround Audio',
      'Panoramic Sliding Glass Sunroof',
      'Active Parking Assist with PARKTRONIC',
      '64-Colour Ambient Cabin Lighting',
      'Wireless Apple CarPlay & Android Auto',
    ]),
    availabilityStatus: 'Available',
    featuredStatus: true,
    publicationStatus: 'Published',
    isSampleData: true,
    images: [
      {
        imageUrl: '/vehicles/sedan-obsidian-front.svg',
        altText: '2022 Mercedes-Benz C300 AMG Line Front Quarter Studio View',
        sortOrder: 0,
      },
      {
        imageUrl: '/vehicles/suv-pearl-interior.svg',
        altText: '2022 Mercedes-Benz C300 AMG Line Digital Cockpit View',
        sortOrder: 1,
      },
    ],
  },
  {
    slug: '2023-toyota-hilux-28-gd6-double-cab-demo',
    make: 'Toyota',
    model: 'Hilux',
    trim: '2.8L GD-6 Raider 4x4 Automatic',
    year: 2023,
    price: 785000,
    discountPrice: null,
    currency: 'GH₵',
    condition: 'New',
    mileage: 180,
    mileageUnit: 'km',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    engineCapacity: '2.8L Turbo Diesel',
    bodyType: 'Pickup',
    exteriorColour: 'Silver Metallic',
    interiorColour: 'Black Fabric / Leatherette',
    drivetrain: '4WD / AWD',
    vin: 'AHTBA3CD806219402',
    showVinPublicly: true,
    importStatus: 'Customs Duty Paid',
    location: '[CITY, GHANA]',
    description:
      '[DEMONSTRATION LISTING] Brand-new 2.8L GD-6 4x4 Double Cab pickup engineered for commercial fleet operations, mining support, and all-terrain durability across Ghana. Features electronic shift-on-the-fly 4WD, rear differential lock, factory bedliner, sports bar, and tropicalized heavy-duty leaf spring suspension.',
    features: JSON.stringify([
      'Shift-on-the-Fly 4WD with Low Range (4H / 4L)',
      'Electronic Rear Differential Lock',
      'Heavy-Duty Urethane Load Bedliner',
      'Downhill Assist Control (DAC)',
      '8-inch Touchscreen with Smartphone Integration',
      'Reverse Camera & Front/Rear Ultrasonic Sensors',
      'Side Steps & Factory Roll Bar',
    ]),
    availabilityStatus: 'Available',
    featuredStatus: true,
    publicationStatus: 'Published',
    isSampleData: true,
    images: [
      {
        imageUrl: '/vehicles/pickup-silver-front.svg',
        altText: '2023 Toyota Hilux 2.8 GD-6 4x4 Double Cab Studio View',
        sortOrder: 0,
      },
      {
        imageUrl: '/vehicles/suv-pearl-side.svg',
        altText: '2023 Toyota Hilux Side Clearance Specification',
        sortOrder: 1,
      },
    ],
  },
  {
    slug: '2021-honda-crv-touring-awd-demo',
    make: 'Honda',
    model: 'CR-V',
    trim: 'Touring 1.5T AWD',
    year: 2021,
    price: 465000,
    discountPrice: 448000,
    currency: 'GH₵',
    condition: 'Foreign Used',
    mileage: 38400,
    mileageUnit: 'km',
    transmission: 'CVT',
    fuelType: 'Petrol',
    engineCapacity: '1.5L VTEC Turbo',
    bodyType: 'SUV',
    exteriorColour: 'Sapphire Blue Metallic',
    interiorColour: 'Ivory Leather',
    drivetrain: '4WD / AWD',
    vin: '2HKRW2H95MH610492',
    showVinPublicly: false,
    importStatus: 'Customs Duty Paid',
    location: '[CITY, GHANA]',
    description:
      '[DEMONSTRATION LISTING] Fuel-efficient 2021 Honda CR-V Touring Real-Time AWD. Foreign used with clean car history and full customs duty paid. Combines low fuel consumption with generous rear legroom, hands-free power tailgate, Honda Sensing safety suite, and wireless phone charging.',
    features: JSON.stringify([
      'Real-Time AWD with Intelligent Control System',
      'Honda Sensing Collision Mitigation Suite',
      'Hands-Free Power Tailgate',
      'Panoramic Moonroof',
      'Multi-Angle Rearview Camera',
      'Remote Engine Start with Climate Pre-Conditioning',
    ]),
    availabilityStatus: 'Available',
    featuredStatus: true,
    publicationStatus: 'Published',
    isSampleData: true,
    images: [
      {
        imageUrl: '/vehicles/crossover-blue-front.svg',
        altText: '2021 Honda CR-V Touring AWD Sapphire Blue Studio View',
        sortOrder: 0,
      },
      {
        imageUrl: '/vehicles/suv-pearl-interior.svg',
        altText: '2021 Honda CR-V Touring Cabin Specification',
        sortOrder: 1,
      },
    ],
  },
  {
    slug: '2022-lexus-rx-350-fsport-awd-demo',
    make: 'Lexus',
    model: 'RX 350',
    trim: 'F-Sport AWD',
    year: 2022,
    price: 890000,
    discountPrice: null,
    currency: 'GH₵',
    condition: 'Foreign Used',
    mileage: 27100,
    mileageUnit: 'km',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    engineCapacity: '3.5L V6 Naturally Aspirated',
    bodyType: 'Luxury',
    exteriorColour: 'Champagne Titanium',
    interiorColour: 'Rioja Red Leather',
    drivetrain: '4WD / AWD',
    vin: '2T2HZMDA9NC310844',
    showVinPublicly: false,
    importStatus: 'Registered in Ghana',
    location: '[CITY, GHANA]',
    description:
      '[DEMONSTRATION LISTING] Proven 3.5L V6 naturally aspirated Lexus RX 350 F-Sport with 8-speed automatic gearbox. Prized in Ghana for its exceptional engine reliability, refined cabin insulation, Mark Levinson 15-speaker audio, and adaptive F-Sport suspension.',
    features: JSON.stringify([
      '3.5L V6 2GR-FKS Engine (No Turbo Complexity)',
      'Mark Levinson 15-Speaker Reference Audio',
      'F-Sport Bolstered Ventilated Leather Seats',
      '12.3-inch Split-Screen Multimedia Display',
      'Color Head-Up Display (HUD)',
      '20-inch Dark Graphite F-Sport Alloy Wheels',
    ]),
    availabilityStatus: 'Reserved',
    featuredStatus: false,
    publicationStatus: 'Published',
    isSampleData: true,
    images: [
      {
        imageUrl: '/vehicles/luxury-graphite-front.svg',
        altText: '2022 Lexus RX 350 F-Sport AWD Studio View',
        sortOrder: 0,
      },
    ],
  },
  {
    slug: '2021-volkswagen-golf-gti-performance-demo',
    make: 'Volkswagen',
    model: 'Golf GTI',
    trim: '2.0 TSI DSG Performance',
    year: 2021,
    price: 420000,
    discountPrice: null,
    currency: 'GH₵',
    condition: 'Foreign Used',
    mileage: 31500,
    mileageUnit: 'km',
    transmission: 'Dual-Clutch',
    fuelType: 'Petrol',
    engineCapacity: '2.0L TSI Turbo',
    bodyType: 'Hatchback',
    exteriorColour: 'Kings Red Metallic',
    interiorColour: 'Titan Black Vienna Leather',
    drivetrain: 'FWD',
    vin: 'WVWZZZCDZMW091420',
    showVinPublicly: false,
    importStatus: 'Customs Duty Paid',
    location: '[CITY, GHANA]',
    description:
      '[DEMONSTRATION LISTING]Mk8 Volkswagen Golf GTI with 7-speed DSG dual-clutch automatic transmission and VAQ electronically controlled front limited-slip differential. Inspected and customs-cleared with full Digital Cockpit Pro and IQ.LIGHT LED matrix headlights.',
    features: JSON.stringify([
      '245 HP 2.0L TSI Engine with 7-Speed DSG',
      'Digital Cockpit Pro & 10-inch Discover Pro Nav',
      'IQ.LIGHT LED Matrix Headlights',
      'Harman Kardon Premium Sound System',
      'DCC Adaptive Chassis Control',
    ]),
    availabilityStatus: 'Available',
    featuredStatus: false,
    publicationStatus: 'Published',
    isSampleData: true,
    images: [
      {
        imageUrl: '/vehicles/hatchback-crimson-front.svg',
        altText: '2021 Volkswagen Golf GTI Performance Studio View',
        sortOrder: 0,
      },
    ],
  },
];

export const DEFAULT_SERVICES = [
  {
    title: 'Verified Foreign-Used & Brand-New Car Sales',
    slug: 'car-sales',
    description:
      'Direct showroom sales of customs-cleared SUVs, executive sedans, crossovers, and 4x4 pickups priced transparently in GH₵.',
    details:
      'Every vehicle in our yard undergoes multi-point mechanical, electrical, and underbody inspection before listing. All customs duty documents (ICUMS) are available for physical verification prior to purchase.',
    isConfirmed: true,
    sortOrder: 1,
  },
  {
    title: 'Bespoke Vehicle Sourcing on Request',
    slug: 'vehicle-sourcing',
    description:
      'Looking for a specific make, trim, year, or fleet specification not currently in our showroom? We source and import to order.',
    details:
      'Submit your target vehicle specifications and budget in GH₵. We provide pre-shipment inspection reports, auction/dealer condition sheets, and transparent landed cost breakdowns into Tema Port.',
    isConfirmed: true,
    sortOrder: 2,
  },
  {
    title: 'Pre-Purchase Mechanical Inspection Arrangements',
    slug: 'vehicle-inspection',
    description:
      'Schedule a comprehensive physical viewing and diagnostic check with your own mechanic or an independent inspection partner.',
    details:
      'We welcome OBD-II computer diagnostics, paint thickness checks, chassis verification, and supervised road tests so you buy with complete confidence.',
    isConfirmed: true,
    sortOrder: 3,
  },
  {
    title: 'Trade-In Valuation & Vehicle Upgrade',
    slug: 'trade-in-inquiries',
    description:
      'Upgrade your current Ghana-registered vehicle toward any car in our inventory following a physical appraisal.',
    details:
      'Bring your vehicle along with original DVLA registration documents and customs papers for a fair market assessment toward your next purchase.',
    isConfirmed: true,
    sortOrder: 4,
  },
  {
    title: 'Customs Clearance & DVLA Registration Support',
    slug: 'import-registration-assistance',
    description:
      'Structured guidance on Ghana Revenue Authority (GRA) customs verification, DVLA roadworthiness inspection, and license plate issuance.',
    details:
      'We assist buyers in completing official DVLA registration, change of ownership, and insurance coordination in their own name.',
    isConfirmed: true,
    sortOrder: 5,
  },
  {
    title: 'Nationwide Insured Delivery Arrangements',
    slug: 'delivery-arrangements',
    description:
      'Coordinated flatbed or chauffeur handover to buyers in Accra, Kumasi, Takoradi, Tamale, and regional capitals upon completed settlement.',
    details:
      'Delivery terms, transit insurance, and handover checklists are agreed in writing following full payment verification.',
    isConfirmed: true,
    sortOrder: 6,
  },
];

export const DEFAULT_FAQS = [
  {
    category: 'Inspections & Verification',
    question: 'Can I bring my own mechanic to inspect a vehicle before buying?',
    answer:
      'Yes. We strongly encourage every buyer to inspect the vehicle in person at [PHYSICAL ADDRESS] and bring an independent mechanical technician or diagnostic scanner before making any payment.',
    isPublished: true,
    sortOrder: 1,
  },
  {
    category: 'Documentation & Customs',
    question: 'Are customs duties fully paid on your foreign-used vehicles?',
    answer:
      'Each listing explicitly states its import and registration status (e.g., "Customs Duty Paid", "Registered in Ghana", or "In Transit"). For all Customs Duty Paid vehicles in our yard, official ICUMS customs clearance documents are provided for your verification.',
    isPublished: true,
    sortOrder: 2,
  },
  {
    category: 'Payments & Pricing',
    question: 'How are payments made and what currency do you accept?',
    answer:
      'All vehicle prices are listed in Ghana Cedis (GH₵). Payments are settled through verified corporate bank transfers or manager’s cheques at our dealership office after you have inspected the vehicle and signed the sales agreement.',
    isPublished: true,
    sortOrder: 3,
  },
  {
    category: 'Reservations & Deposits',
    question: 'Can I reserve a vehicle online?',
    answer:
      'You can submit a Purchase or Reservation Inquiry online or via WhatsApp to hold a viewing slot. Do not send deposits without first verifying the vehicle and receiving an official pro-forma invoice from [DEALERSHIP NAME].',
    isPublished: true,
    sortOrder: 4,
  },
  {
    category: 'Trade-Ins & Sourcing',
    question: 'Do you accept trade-ins or source specific car models on request?',
    answer:
      'Yes. Use the Inquiry form on our Contact or Inventory page and select "Trade-In Request" or "Vehicle Sourcing" with your vehicle details. Our team will schedule a physical valuation or prepare a sourcing quote.',
    isPublished: true,
    sortOrder: 5,
  },
  {
    category: 'Warranty & After-Sales',
    question: 'Do vehicles come with a warranty?',
    answer:
      'Warranty eligibility depends on whether the vehicle is brand-new or foreign-used and is confirmed in writing on a per-vehicle basis during inspection. We never make blanket warranty claims—all mechanical findings are shared transparently upfront.',
    isPublished: true,
    sortOrder: 6,
  },
];

let seedPromise: Promise<void> | null = null;

export async function ensureDatabaseSeeded() {
  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    try {
      const existingSettings = await db.select().from(dealershipSettings).limit(1);
      if (existingSettings.length === 0) {
        await db.insert(dealershipSettings).values({
          businessName: 'WESTROAD',
          tagline: 'China–Africa Vehicle Trading Platform & Direct Sourcing Showroom',
          location: 'N1 Highway, Accra, Ghana',
          phone: '+233 59 641 6623',
          whatsapp: '+233 59 641 6623',
          email: 'wrmobile@163.com',
          address: 'Along the N1 Highway, Accra, Ghana (West Africa Office)',
          openingHours: 'Monday – Saturday: 8:00 AM – 6:00 PM GMT',
          currency: 'GH₵',
          primaryMarket: 'Ghana',
          domain: 'africa-goodcar.com',
          logoText: 'WESTROAD',
          heroHeadline:
            'Direct China–Ghana Vehicle Sourcing & Verified Sales in Accra',
          heroDescription:
            'Backed by 15-year automotive expertise with regional offices along the N1 Highway in Accra and branches across Beijing, Tianjin, Guangzhou and Chengdu. Browse verified SUVs, sedans and commercial vehicles priced transparently in GH₵.',
          aboutBackground:
            'We are a China‑based vehicle‑trading platform dedicated to the African market. Backed by 15‑year expertise in China’s automotive trade, we run offices and branches across Beijing, Tianjin, Hangzhou, Guangzhou and Chengdu. We offer African customers a full suite of one‑stop solutions: vehicle sourcing, shipment against received deposit, logistics arrangement, insurance coverage and customs clearance support. Our West Africa office is strategically positioned along the N1 Highway in Accra, Ghana. Our East‑Africa branch is based at Morocco Square, Dar es Salaam, Tanzania.',
          aboutMission:
            'To provide African automobile buyers with transparent, verified, factory-inspected vehicles with seamless port logistics, customs clearance, and dedicated local support in Accra, Ghana.',
          aboutCustomerApproach:
            'Every vehicle is verified for African road readiness, cooling efficiency, and structural integrity. Prospective buyers in Ghana are welcome to inspect vehicles physically at our N1 Highway office or coordinate direct port deliveries with complete ICUMS customs documentation.',
          aboutTeamInfo:
            'Managed by cross-border automotive veterans with 15+ years experience in vehicle sourcing, logistics, and West Africa dealership operations.',
          whyChooseUs: JSON.stringify(DEFAULT_WHY_CHOOSE_US),
          buyingProcess: JSON.stringify(DEFAULT_BUYING_PROCESS),
          financingOffered: false,
          financingDetails: '',
          onlinePaymentsEnabled: false,
          paymentTerms:
            'All payments are completed in Ghana Cedis (GH₵) via official corporate bank transfer following physical vehicle inspection and execution of a written Bill of Sale.',
          soldVehiclePolicy: 'show_labeled',
          googleMapsEmbedUrl: '',
          socialLinks: JSON.stringify({
            twitter: 'https://twitter.com/westroad',
            facebook: 'https://facebook.com/westroad',
            instagram: 'https://instagram.com/westroad',
            tiktok: 'https://tiktok.com/@westroadauto',
          }),
          seoTitle:
            'WESTROAD — China–Africa Vehicle Trading & Dealership in Ghana',
          seoDescription:
            'Official WESTROAD platform. Verified vehicles, direct sourcing from China to Ghana, transparent GH₵ pricing, port clearance, and N1 Highway Accra office.',
          privacyPolicyContent: DEFAULT_PRIVACY_POLICY,
          termsContent: DEFAULT_TERMS,
        });
      }

      const existingServices = await db.select().from(services).limit(1);
      if (existingServices.length === 0) {
        await db.insert(services).values(DEFAULT_SERVICES);
      }

      const existingFaqs = await db.select().from(faqs).limit(1);
      if (existingFaqs.length === 0) {
        await db.insert(faqs).values(DEFAULT_FAQS);
      }

      const existingVehicles = await db.select().from(vehicles).limit(1);
      if (existingVehicles.length === 0) {
        await seedSampleVehiclesInternal();
      }
    } catch (error) {
      seedPromise = null;
      console.error('Error seeding initial dealership data:', error);
      throw new Error('Failed to initialize dealership database.', {
        cause: error,
      });
    }
  })();

  return seedPromise;
}

export async function seedSampleVehiclesInternal() {
  try {
    const rawData = await import('../data/wesrroadVehicles.json');
    const items = (rawData.default || rawData) as any[];
    for (const item of items) {
      const existing = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.slug, item.slug))
        .limit(1);
      if (existing.length === 0) {
        const { images, productId, ...vehicleData } = item;
        const [inserted] = await db
          .insert(vehicles)
          .values(vehicleData)
          .returning();

        if (images && images.length > 0) {
          await db.insert(vehicleImages).values(
            images.map((img: any) => ({
              vehicleId: inserted.id,
              imageUrl: img.imageUrl,
              altText: img.altText,
              sortOrder: img.sortOrder,
            }))
          );
        }
      }
    }
  } catch (err) {
    console.error('Failed to seed from wesrroadVehicles.json:', err);
  }
}
