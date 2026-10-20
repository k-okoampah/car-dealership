export interface VehicleImageItem {
  id?: number;
  vehicleId?: number;
  imageUrl: string;
  altText: string;
  sortOrder: number;
}

export interface Vehicle {
  id: number;
  slug: string;
  make: string;
  model: string;
  trim: string;
  year: number;
  price: number;
  discountPrice: number | null;
  currency: string;
  condition: string;
  mileage: number;
  mileageUnit: string;
  transmission: string;
  fuelType: string;
  engineCapacity: string;
  bodyType: string;
  exteriorColour: string;
  interiorColour: string;
  drivetrain: string;
  vin: string;
  showVinPublicly: boolean;
  importStatus: string;
  location: string;
  description: string;
  features: string;
  featuresList: string[];
  availabilityStatus: 'Available' | 'Reserved' | 'Sold' | string;
  featuredStatus: boolean;
  publicationStatus: 'Published' | 'Draft' | 'Unpublished' | string;
  isSampleData: boolean;
  images: VehicleImageItem[];
  similarVehicles?: Vehicle[];
  createdAt: string;
  updatedAt: string;
}

export interface DealershipSettings {
  id: number;
  businessName: string;
  tagline: string;
  location: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  openingHours: string;
  currency: string;
  primaryMarket: string;
  domain: string;
  logoText: string;
  heroHeadline: string;
  heroDescription: string;
  aboutBackground: string;
  aboutMission: string;
  aboutCustomerApproach: string;
  aboutTeamInfo: string;
  whyChooseUs: string;
  buyingProcess: string;
  financingOffered: boolean;
  financingDetails: string;
  onlinePaymentsEnabled: boolean;
  paymentTerms: string;
  soldVehiclePolicy: 'hide' | 'show_labeled' | string;
  googleMapsEmbedUrl: string;
  socialLinks: string;
  seoTitle: string;
  seoDescription: string;
  privacyPolicyContent: string;
  termsContent: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  details: string;
  isConfirmed: boolean;
  sortOrder: number;
}

export interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  isPublished: boolean;
  sortOrder: number;
}

export interface TestimonialItem {
  id: number;
  customerName: string;
  roleOrLocation: string;
  vehiclePurchased: string;
  content: string;
  isVerified: boolean;
  createdAt: string;
}

export interface CustomerInquiry {
  id: number;
  customerName: string;
  phone: string;
  email: string;
  inquiryType: string;
  vehicleId: number | null;
  vehicleTitle: string;
  tradeInDetails: string;
  message: string;
  consentGiven: boolean;
  status: string;
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestDriveRequest {
  id: number;
  customerName: string;
  phone: string;
  email: string;
  vehicleId: number | null;
  vehicleTitle: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  notes: string;
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogItem {
  id: number;
  adminUid: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}
