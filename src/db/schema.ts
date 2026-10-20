import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  name: text('name').notNull().default('Administrator'),
  email: text('email').notNull(),
  role: text('role').notNull().default('admin'),
  accountStatus: text('account_status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  trim: text('trim').notNull().default(''),
  year: integer('year').notNull(),
  price: integer('price').notNull(),
  discountPrice: integer('discount_price'),
  currency: text('currency').notNull().default('GH₵'),
  condition: text('condition').notNull(), // 'New' | 'Foreign Used' | 'Ghana Used'
  mileage: integer('mileage').notNull(),
  mileageUnit: text('mileage_unit').notNull().default('km'),
  transmission: text('transmission').notNull(), // 'Automatic' | 'Manual' | 'CVT' | 'Dual-Clutch'
  fuelType: text('fuel_type').notNull(), // 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric'
  engineCapacity: text('engine_capacity').notNull().default('Unverified'),
  bodyType: text('body_type').notNull(), // 'SUV' | 'Sedan' | 'Pickup' | 'Hatchback' | 'Coupe' | 'Van' | 'Luxury'
  exteriorColour: text('exterior_colour').notNull(),
  interiorColour: text('interior_colour').notNull(),
  drivetrain: text('drivetrain').notNull(), // '4WD / AWD' | 'FWD' | 'RWD'
  vin: text('vin').notNull().default(''),
  showVinPublicly: boolean('show_vin_publicly').notNull().default(false),
  importStatus: text('import_status').notNull().default('Customs Duty Paid'),
  location: text('location').notNull().default('[CITY, GHANA]'),
  description: text('description').notNull(),
  features: text('features').notNull().default('[]'), // JSON string array
  availabilityStatus: text('availability_status').notNull().default('Available'), // 'Available' | 'Reserved' | 'Sold'
  featuredStatus: boolean('featured_status').notNull().default(false),
  publicationStatus: text('publication_status').notNull().default('Published'), // 'Published' | 'Draft' | 'Unpublished'
  isSampleData: boolean('is_sample_data').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const vehicleImages = pgTable('vehicle_images', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id')
    .references(() => vehicles.id, { onDelete: 'cascade' })
    .notNull(),
  imageUrl: text('image_url').notNull(),
  altText: text('alt_text').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const customerInquiries = pgTable('customer_inquiries', {
  id: serial('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull().default(''),
  inquiryType: text('inquiry_type').notNull(), // 'General Inquiry' | 'Vehicle Inquiry' | 'Vehicle Sourcing' | 'Trade-In Request' | 'Purchase Inquiry'
  vehicleId: integer('vehicle_id').references(() => vehicles.id, {
    onDelete: 'set null',
  }),
  vehicleTitle: text('vehicle_title').notNull().default(''),
  tradeInDetails: text('trade_in_details').notNull().default(''),
  message: text('message').notNull(),
  consentGiven: boolean('consent_given').notNull().default(true),
  status: text('status').notNull().default('New'), // 'New' | 'Contacted' | 'Follow-up' | 'Converted' | 'Closed'
  internalNotes: text('internal_notes').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const testDriveRequests = pgTable('test_drive_requests', {
  id: serial('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull().default(''),
  vehicleId: integer('vehicle_id').references(() => vehicles.id, {
    onDelete: 'set null',
  }),
  vehicleTitle: text('vehicle_title').notNull(),
  preferredDate: text('preferred_date').notNull(),
  preferredTime: text('preferred_time').notNull(),
  status: text('status').notNull().default('Pending'), // 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
  notes: text('notes').notNull().default(''),
  internalNotes: text('internal_notes').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const dealershipSettings = pgTable('dealership_settings', {
  id: serial('id').primaryKey(),
  businessName: text('business_name').notNull().default('[DEALERSHIP NAME]'),
  tagline: text('tagline')
    .notNull()
    .default('Verified Vehicle Sales & Automotive Advisory in Ghana'),
  location: text('location').notNull().default('[CITY, GHANA]'),
  phone: text('phone').notNull().default('[PHONE NUMBER]'),
  whatsapp: text('whatsapp').notNull().default('[WHATSAPP NUMBER]'),
  email: text('email').notNull().default('[BUSINESS EMAIL]'),
  address: text('address').notNull().default('[PHYSICAL ADDRESS]'),
  openingHours: text('opening_hours').notNull().default('[BUSINESS HOURS]'),
  currency: text('currency').notNull().default('GH₵'),
  primaryMarket: text('primary_market').notNull().default('Ghana'),
  domain: text('domain').notNull().default('[DOMAIN NAME]'),
  logoText: text('logo_text').notNull().default('[DEALERSHIP NAME]'),
  heroHeadline: text('hero_headline')
    .notNull()
    .default('Inspected New & Foreign-Used Vehicles Ready for Ghanaian Roads'),
  heroDescription: text('hero_description')
    .notNull()
    .default(
      'Browse customs-cleared SUVs, executive sedans, and 4x4 pickups with transparent GH₵ pricing, independent inspection support, and direct WhatsApp consultation.'
    ),
  aboutBackground: text('about_background').notNull(),
  aboutMission: text('about_mission').notNull(),
  aboutCustomerApproach: text('about_customer_approach').notNull(),
  aboutTeamInfo: text('about_team_info').notNull().default(''),
  whyChooseUs: text('why_choose_us').notNull(), // JSON array
  buyingProcess: text('buying_process').notNull(), // JSON array
  financingOffered: boolean('financing_offered').notNull().default(false),
  financingDetails: text('financing_details').notNull().default(''),
  onlinePaymentsEnabled: boolean('online_payments_enabled')
    .notNull()
    .default(false),
  paymentTerms: text('payment_terms').notNull().default(''),
  soldVehiclePolicy: text('sold_vehicle_policy').notNull().default('hide'), // 'hide' | 'show_labeled'
  googleMapsEmbedUrl: text('google_maps_embed_url').notNull().default(''),
  socialLinks: text('social_links')
    .notNull()
    .default('{"instagram":"","facebook":"","linkedin":"","twitter":""}'),
  seoTitle: text('seo_title')
    .notNull()
    .default('[DEALERSHIP NAME] | Car Sales Dealership in [CITY, GHANA]'),
  seoDescription: text('seo_description')
    .notNull()
    .default(
      'Browse available new and foreign-used vehicles in Ghana. Compare specifications in GH₵, schedule physical inspections or test drives, and inquire via WhatsApp.'
    ),
  privacyPolicyContent: text('privacy_policy_content').notNull(),
  termsContent: text('terms_content').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  description: text('description').notNull(),
  details: text('details').notNull(),
  isConfirmed: boolean('is_confirmed').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const faqs = pgTable('faqs', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  isPublished: boolean('is_published').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  roleOrLocation: text('role_or_location').notNull(),
  vehiclePurchased: text('vehicle_purchased').notNull(),
  content: text('content').notNull(),
  isVerified: boolean('is_verified').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  adminUid: text('admin_uid').notNull(),
  adminEmail: text('admin_email').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull().default(''),
  details: text('details').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  images: many(vehicleImages),
  inquiries: many(customerInquiries),
  testDrives: many(testDriveRequests),
}));

export const vehicleImagesRelations = relations(vehicleImages, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleImages.vehicleId],
    references: [vehicles.id],
  }),
}));

export const customerInquiriesRelations = relations(
  customerInquiries,
  ({ one }) => ({
    vehicle: one(vehicles, {
      fields: [customerInquiries.vehicleId],
      references: [vehicles.id],
    }),
  })
);

export const testDriveRequestsRelations = relations(
  testDriveRequests,
  ({ one }) => ({
    vehicle: one(vehicles, {
      fields: [testDriveRequests.vehicleId],
      references: [vehicles.id],
    }),
  })
);
