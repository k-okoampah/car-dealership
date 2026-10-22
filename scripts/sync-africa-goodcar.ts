import * as dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { db } from '../src/db/index.ts';
import { vehicles, vehicleImages, dealershipSettings } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

interface AfricaGoodCarRow {
  productId: number;
  sku: string;
  image: string;
  price: number;
  km: number;
  model: string;
  name: string;
  tag?: string;
  location?: string;
  inCountryName?: string;
  inCityName?: string;
  manufacturerName?: string;
}

interface ProductDetailResponse {
  code: number;
  data: {
    productImageList?: string[];
    productAttributeList?: Array<{
      attributeName: string;
      text: string;
    }>;
  };
}

function parseYear(str: string): number {
  const match = str.match(/\b(201\d|202\d)\b/);
  return match ? parseInt(match[1], 10) : 2022;
}

function parseBodyType(name: string, model: string): string {
  const text = (name + ' ' + model).toLowerCase();
  if (text.includes('suv') || text.includes('traveller') || text.includes('rav4') || text.includes('x70') || text.includes('x90') || text.includes('cr-v') || text.includes('cross') || text.includes('t2') || text.includes('dashing')) {
    return 'SUV';
  }
  if (text.includes('delica') || text.includes('van') || text.includes('hiace') || text.includes('mpv')) {
    return 'Van';
  }
  if (text.includes('pickup') || text.includes('hilux') || text.includes('truck')) {
    return 'Pickup';
  }
  if (text.includes('coupe')) {
    return 'Coupe';
  }
  return 'Sedan';
}

function parseMake(row: AfricaGoodCarRow): string {
  if (row.manufacturerName && row.manufacturerName.trim()) {
    const raw = row.manufacturerName.trim().toUpperCase();
    if (raw.includes('TOYOTA')) return 'Toyota';
    if (raw.includes('JETOUR')) return 'Jetour';
    if (raw.includes('CHERY')) return 'Chery';
    if (raw.includes('HONDA')) return 'Honda';
    if (raw.includes('MITSUBISHI')) return 'Mitsubishi';
    if (raw.includes('MERCEDES') || raw.includes('BENZ')) return 'Mercedes-Benz';
    if (raw.includes('FAW') || raw.includes('HONGQI')) return 'Hongqi';
    if (raw.includes('BYD')) return 'BYD';
    if (raw.includes('HAVAL') || raw.includes('GWM')) return 'Haval';
    if (raw.includes('GEELY')) return 'Geely';
    if (raw.includes('VOLKSWAGEN') || raw.includes('VW')) return 'Volkswagen';
    if (raw.includes('LEXUS')) return 'Lexus';
    if (raw.includes('HYUNDAI')) return 'Hyundai';
    if (raw.includes('KIA')) return 'Kia';
  }
  const full = (row.name + ' ' + row.model).toUpperCase();
  if (full.includes('JETOUR')) return 'Jetour';
  if (full.includes('TOYOTA')) return 'Toyota';
  if (full.includes('MITSUBISHI')) return 'Mitsubishi';
  if (full.includes('HONDA')) return 'Honda';
  if (full.includes('HONGQI')) return 'Hongqi';
  if (full.includes('CHERY')) return 'Chery';
  return 'WESTROAD Direct';
}

function cleanModelName(row: AfricaGoodCarRow, make: string): string {
  let raw = row.model || row.name || 'Vehicle';
  // Remove duplicate make if present
  const regex = new RegExp(`^${make}\\s*`, 'i');
  raw = raw.replace(regex, '').trim();
  // If year is in model, clean it up or leave it
  return raw || row.name;
}

async function run() {
  console.log('--- Fetching real vehicles from africa-goodcar.com ---');
  const res = await fetch('https://africa-goodcar.com/home/productList?offset=0&limit=36&languageId=1&huiLvId=2');
  const json = await res.json();
  const rows: AfricaGoodCarRow[] = json.data?.rows || [];
  console.log(`Fetched ${rows.length} vehicles from africa-goodcar.com`);

  const processedVehicles = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const make = parseMake(row);
    const model = cleanModelName(row, make);
    const year = parseYear(row.name + ' ' + row.model + ' ' + (row.tag || ''));
    const bodyType = parseBodyType(row.name, row.model);
    const slug = `${year}-${make.toLowerCase()}-${model.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${row.productId}`;

    // Fetch product detail for attributes and images
    let images: string[] = [row.image].filter(Boolean);
    let attributes: Record<string, string> = {};
    try {
      const detailRes = await fetch(`https://africa-goodcar.com/home/productDetail?productId=${row.productId}&languageId=1`);
      if (detailRes.ok) {
        const detailJson: ProductDetailResponse = await detailRes.json();
        if (detailJson.data?.productImageList && detailJson.data.productImageList.length > 0) {
          images = detailJson.data.productImageList.filter(Boolean);
        }
        if (detailJson.data?.productAttributeList) {
          for (const attr of detailJson.data.productAttributeList) {
            if (attr.attributeName && attr.text) {
              attributes[attr.attributeName.trim()] = attr.text.trim();
            }
          }
        }
      }
    } catch (e) {
      console.warn(`Could not load details for ${row.productId}:`, e);
    }

    const mileage = row.km || (attributes['Mileage'] ? parseInt(attributes['Mileage'], 10) : 15000);
    const fuelType = attributes['Energy Type'] || (row.model.toLowerCase().includes('hybrid') ? 'Hybrid' : 'Petrol');
    const engineCapacity = attributes['Displacement'] || attributes['Engine'] || (row.model.match(/\b\d\.\d[TL]?\b/i)?.[0]) || '2.0L';
    const transmission = attributes['Transmission'] || 'Automatic';
    const drivetrain = (row.model.includes('4WD') || row.name.includes('4WD')) ? '4WD / AWD' : '2WD';

    const featuresList = [
      attributes['Power'] ? `Max Output: ${attributes['Power']}` : 'High Efficiency Powertrain',
      attributes['Dimensions'] ? `Dimensions: ${attributes['Dimensions']}` : 'Tropicalized Chassis',
      'Original Manufacturer Multi-Point Inspection',
      'West Africa Highway Readiness Certified',
      'N1 Highway Accra Inspection & Support',
      'Direct Sourcing & Port ICUMS Clearance Assistance'
    ];

    processedVehicles.push({
      productId: row.productId,
      slug,
      make,
      model,
      trim: attributes['Manufacturer'] || `${engineCapacity} ${transmission}`,
      year,
      price: row.price || 250000,
      currency: 'GH₵',
      condition: mileage < 500 ? 'Brand New' : 'Foreign Used',
      mileage,
      mileageUnit: 'km',
      transmission,
      fuelType,
      engineCapacity,
      bodyType,
      exteriorColour: attributes['Exterior Color'] || 'Factory Finish',
      interiorColour: attributes['Interior Color'] || 'Executive Leather',
      drivetrain,
      vin: row.sku || `VIN-WESR-${row.productId}`,
      showVinPublicly: true,
      importStatus: 'Customs Duty Paid',
      location: 'N1 Highway, Accra, Ghana / Direct Port Transit',
      description: `Official WESTROAD verified vehicle listing (ID #${row.productId}). Backed by 15-year China-Africa automotive trade expertise with physical operations along the N1 Highway in Accra, Ghana. Inspected and verified with full export diagnostics, suspension suitability for African roads, and complete logistics and ICUMS clearance support.`,
      features: JSON.stringify(featuresList),
      availabilityStatus: 'Available',
      featuredStatus: i < 8,
      publicationStatus: 'Published',
      isSampleData: false,
      images: images.map((img, idx) => ({
        imageUrl: img,
        altText: `${year} ${make} ${model} - WESTROAD Genuine Photo ${idx + 1}`,
        sortOrder: idx,
      })),
    });

    console.log(`Processed [${i + 1}/${rows.length}]: ${year} ${make} ${model} (${images.length} images, GH₵ ${row.price})`);
  }

  // Save static JSON backups for zero-downtime static rendering
  const dataDir = path.resolve(process.cwd(), 'src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(path.join(dataDir, 'wesrroadVehicles.json'), JSON.stringify(processedVehicles, null, 2));
  console.log(`Saved ${processedVehicles.length} vehicles to src/data/wesrroadVehicles.json`);

  // Now seed/update PostgreSQL database
  console.log('--- Updating PostgreSQL database with real WESTROAD data ---');
  try {
    // 1. Update dealershipSettings
    const existingSettings = await db.select().from(dealershipSettings).limit(1);
    const wesrroadSettings = {
      businessName: 'WESTROAD',
      tagline: 'China–Africa Vehicle Trading Platform & Direct Sourcing Showroom',
      location: 'N1 Highway, Accra, Ghana',
      phone: '+233 55 710 7217',
      whatsapp: '+233 55 710 7217',
      email: 'wrmobile@163.com',
      address: 'Along the N1 Highway, Accra, Ghana (West Africa Office)',
      openingHours: 'Monday – Saturday: 8:00 AM – 6:00 PM GMT',
      currency: 'GH₵',
      primaryMarket: 'Ghana',
      domain: 'africa-goodcar.com',
      logoText: 'WESTROAD',
      heroHeadline: 'Direct China–Ghana Vehicle Sourcing & Verified Sales in Accra',
      heroDescription: 'Backed by 15-year automotive expertise with regional offices along the N1 Highway in Accra and branches across Beijing, Tianjin, Guangzhou and Chengdu. Browse verified SUVs, sedans and commercial vehicles priced transparently in GH₵.',
      aboutBackground: 'We are a China‑based vehicle‑trading platform dedicated to the African market. Backed by 15‑year expertise in China’s automotive trade, we run offices and branches across Beijing, Tianjin, Hangzhou, Guangzhou and Chengdu. We offer African customers a full suite of one‑stop solutions: vehicle sourcing, shipment against received deposit, logistics arrangement, insurance coverage and customs clearance support. Our West Africa office is strategically positioned along the N1 Highway in Accra, Ghana. Our East‑Africa branch is based at Morocco Square, Dar es Salaam, Tanzania.',
      aboutMission: 'To provide African automobile buyers with transparent, verified, factory-inspected vehicles with seamless port logistics, customs clearance, and dedicated local support in Accra, Ghana.',
      aboutCustomerApproach: 'Every vehicle is verified for African road readiness, cooling efficiency, and structural integrity. Prospective buyers in Ghana are welcome to inspect vehicles physically at our N1 Highway office or coordinate direct port deliveries with complete ICUMS customs documentation.',
      aboutTeamInfo: 'Managed by cross-border automotive veterans with 15+ years experience in vehicle sourcing, logistics, and West Africa dealership operations.',
      socialLinks: JSON.stringify({
        twitter: 'https://twitter.com/westroad',
        facebook: 'https://facebook.com/westroad',
        instagram: 'https://instagram.com/westroad',
        tiktok: 'https://tiktok.com/@westroadauto',
      }),
      seoTitle: 'WESTROAD — China–Africa Vehicle Trading & Dealership in Ghana',
      seoDescription: 'Official WESTROAD platform. Verified vehicles, direct sourcing from China to Ghana, transparent GH₵ pricing, port clearance, and N1 Highway Accra office.',
      privacyPolicyContent: `1. DATA CONTROLLER & SCOPE
This Privacy Policy governs how WESTROAD ("West Road Auto", "we", "our"), operating along the N1 Highway in Accra, Ghana and through official portal africa-goodcar.com, collects and processes customer inquiries in accordance with the Data Protection Act, 2012 (Act 843) of the Republic of Ghana.

2. INFORMATION WE COLLECT
When you submit a vehicle inquiry, quotation request, or test-drive viewing on WESTROAD, we collect your Name, WhatsApp/Phone Number, Email Address, and specific vehicle inquiries.

3. HOW WE USE YOUR INFORMATION
Contact details are used strictly to provide vehicle availability updates, price quotations in GH₵, shipping and ICUMS customs estimates, and coordinate showroom visits along the N1 Highway.

4. CONFIDENTIALITY
We never sell, rent, or trade customer information with unauthorized third parties.`,
      termsContent: `1. GENERAL TERMS
Welcome to WESTROAD (africa-goodcar.com), the official online vehicle inventory platform of West Road Auto. By using this website, you agree to these Terms.

2. VEHICLE PRICING & INVENTORY IN GH₵
All vehicle prices are quoted in Ghana Cedis (GH₵) with exchange rate transparency. Vehicle specifications, mileage readings, and availability are verified from our genuine stock and direct import pipeline.

3. PHYSICAL INSPECTION & VERIFICATION
Prospective buyers are welcome to conduct physical inspections and computer diagnostics at our N1 Highway Accra premises or at Tema Port upon arrival.

4. OFFICIAL CONTACTS
All official business transactions and inquiries are handled strictly through our verified phone and WhatsApp lines (+233 59 641 6623 / +233 59 359 2023) and official email (wrmobile@163.com).`,
      updatedAt: new Date(),
    };

    if (existingSettings.length > 0) {
      await db.update(dealershipSettings).set(wesrroadSettings as any).where(eq(dealershipSettings.id, existingSettings[0].id));
      console.log('Updated dealershipSettings with WESTROAD official identity');
    } else {
      await db.insert(dealershipSettings).values(wesrroadSettings as any);
      console.log('Inserted dealershipSettings');
    }

    // 2. Remove old sample vehicles from DB
    await db.delete(vehicles).where(eq(vehicles.isSampleData, true));
    console.log('Cleared old sample vehicles from database');

    // 3. Insert real WESTROAD vehicles into DB
    for (const v of processedVehicles) {
      const existing = await db.select().from(vehicles).where(eq(vehicles.slug, v.slug)).limit(1);
      let vehicleId: number;
      if (existing.length > 0) {
        vehicleId = existing[0].id;
        await db.update(vehicles).set({
          make: v.make,
          model: v.model,
          trim: v.trim,
          year: v.year,
          price: v.price,
          currency: v.currency,
          condition: v.condition,
          mileage: v.mileage,
          transmission: v.transmission,
          fuelType: v.fuelType,
          engineCapacity: v.engineCapacity,
          bodyType: v.bodyType,
          exteriorColour: v.exteriorColour,
          interiorColour: v.interiorColour,
          drivetrain: v.drivetrain,
          vin: v.vin,
          showVinPublicly: true,
          location: v.location,
          importStatus: v.importStatus,
          description: v.description,
          features: v.features,
          availabilityStatus: v.availabilityStatus,
          featuredStatus: v.featuredStatus,
          publicationStatus: v.publicationStatus,
          isSampleData: false,
          updatedAt: new Date(),
        }).where(eq(vehicles.id, vehicleId));
      } else {
        const [inserted] = await db.insert(vehicles).values({
          slug: v.slug,
          make: v.make,
          model: v.model,
          trim: v.trim,
          year: v.year,
          price: v.price,
          currency: v.currency,
          condition: v.condition,
          mileage: v.mileage,
          mileageUnit: v.mileageUnit,
          transmission: v.transmission,
          fuelType: v.fuelType,
          engineCapacity: v.engineCapacity,
          bodyType: v.bodyType,
          exteriorColour: v.exteriorColour,
          interiorColour: v.interiorColour,
          drivetrain: v.drivetrain,
          vin: v.vin,
          showVinPublicly: true,
          location: v.location,
          importStatus: v.importStatus,
          description: v.description,
          features: v.features,
          availabilityStatus: v.availabilityStatus,
          featuredStatus: v.featuredStatus,
          publicationStatus: v.publicationStatus,
          isSampleData: false,
        }).returning({ id: vehicles.id });
        vehicleId = inserted.id;
      }

      // Re-insert vehicle images
      await db.delete(vehicleImages).where(eq(vehicleImages.vehicleId, vehicleId));
      for (const img of v.images) {
        await db.insert(vehicleImages).values({
          vehicleId,
          imageUrl: img.imageUrl,
          altText: img.altText,
          sortOrder: img.sortOrder,
        });
      }
    }
    console.log(`Successfully synced ${processedVehicles.length} vehicles to PostgreSQL!`);
  } catch (dbErr) {
    console.error('Error updating DB:', dbErr);
  }

  console.log('--- WESTROAD SYNC COMPLETE ---');
}

run().catch(console.error);
