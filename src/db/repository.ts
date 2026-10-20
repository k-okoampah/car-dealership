import { db } from './index.ts';
import {
  auditLogs,
  customerInquiries,
  dealershipSettings,
  faqs,
  services,
  testDriveRequests,
  testimonials,
  vehicleImages,
  vehicles,
} from './schema.ts';
import {
  and,
  asc,
   desc,
  eq,
  gte,
  ilike,
  lte,
  ne,
  or,
} from 'drizzle-orm';
import {
  ensureDatabaseSeeded,
  seedSampleVehiclesInternal,
} from './seed.ts';

export interface VehicleFilterParams {
  q?: string;
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  bodyType?: string;
  minYear?: number;
  maxYear?: number;
  condition?: string;
  transmission?: string;
  fuelType?: string;
  maxMileage?: number;
  drivetrain?: string;
  availability?: string;
  importStatus?: string;
  featured?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function getPublicBootstrapData() {
  try {
    await ensureDatabaseSeeded();

    const [settings] = await db.select().from(dealershipSettings).limit(1);
    const activeServices = await db
      .select()
      .from(services)
      .where(eq(services.isConfirmed, true))
      .orderBy(asc(services.sortOrder));
    const publishedFaqs = await db
      .select()
      .from(faqs)
      .where(eq(faqs.isPublished, true))
      .orderBy(asc(faqs.sortOrder));
    const verifiedTestimonials = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.isVerified, true))
      .orderBy(desc(testimonials.createdAt));

    const allPublishedVehicles = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.publicationStatus, 'Published'));

    const makes = Array.from(
      new Set(allPublishedVehicles.map((v) => v.make))
    ).sort();
    const bodyTypes = Array.from(
      new Set(allPublishedVehicles.map((v) => v.bodyType))
    ).sort();
    const years = Array.from(
      new Set(allPublishedVehicles.map((v) => v.year))
    ).sort((a, b) => b - a);

    return {
      settings,
      services: activeServices,
      faqs: publishedFaqs,
      testimonials: verifiedTestimonials,
      filterMeta: {
        makes,
        bodyTypes,
        years,
        totalPublishedCount: allPublishedVehicles.length,
      },
    };
  } catch (error) {
    console.error('Database query failed in getPublicBootstrapData:', error);
    throw new Error('Failed to load dealership configuration and metadata.', {
      cause: error,
    });
  }
}

export async function getFilteredVehicles(params: VehicleFilterParams) {
  try {
    await ensureDatabaseSeeded();

    const [settings] = await db.select().from(dealershipSettings).limit(1);
    const soldPolicy = settings?.soldVehiclePolicy || 'hide';

    const conditions = [eq(vehicles.publicationStatus, 'Published')];

    if (params.availability && params.availability !== 'All') {
      conditions.push(eq(vehicles.availabilityStatus, params.availability));
    } else if (soldPolicy === 'hide') {
      conditions.push(ne(vehicles.availabilityStatus, 'Sold'));
    }

    if (params.q && params.q.trim()) {
      const term = `%${params.q.trim()}%`;
      const searchCondition = or(
        ilike(vehicles.make, term),
        ilike(vehicles.model, term),
        ilike(vehicles.trim, term),
        ilike(vehicles.bodyType, term),
        ilike(vehicles.description, term)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (params.make && params.make !== 'All') {
      conditions.push(eq(vehicles.make, params.make));
    }
    if (params.model && params.model.trim()) {
      conditions.push(ilike(vehicles.model, `%${params.model.trim()}%`));
    }
    if (params.bodyType && params.bodyType !== 'All') {
      conditions.push(eq(vehicles.bodyType, params.bodyType));
    }
    if (params.condition && params.condition !== 'All') {
      conditions.push(eq(vehicles.condition, params.condition));
    }
    if (params.transmission && params.transmission !== 'All') {
      conditions.push(eq(vehicles.transmission, params.transmission));
    }
    if (params.fuelType && params.fuelType !== 'All') {
      conditions.push(eq(vehicles.fuelType, params.fuelType));
    }
    if (params.drivetrain && params.drivetrain !== 'All') {
      conditions.push(eq(vehicles.drivetrain, params.drivetrain));
    }
    if (params.importStatus && params.importStatus !== 'All') {
      conditions.push(eq(vehicles.importStatus, params.importStatus));
    }
    if (typeof params.minPrice === 'number' && !Number.isNaN(params.minPrice)) {
      conditions.push(gte(vehicles.price, params.minPrice));
    }
    if (typeof params.maxPrice === 'number' && !Number.isNaN(params.maxPrice)) {
      conditions.push(lte(vehicles.price, params.maxPrice));
    }
    if (typeof params.minYear === 'number' && !Number.isNaN(params.minYear)) {
      conditions.push(gte(vehicles.year, params.minYear));
    }
    if (typeof params.maxYear === 'number' && !Number.isNaN(params.maxYear)) {
      conditions.push(lte(vehicles.year, params.maxYear));
    }
    if (
      typeof params.maxMileage === 'number' &&
      !Number.isNaN(params.maxMileage)
    ) {
      conditions.push(lte(vehicles.mileage, params.maxMileage));
    }
    if (params.featured === true) {
      conditions.push(eq(vehicles.featuredStatus, true));
    }

    let orderByClause = desc(vehicles.createdAt);
    if (params.sort === 'price_asc') {
      orderByClause = asc(vehicles.price);
    } else if (params.sort === 'price_desc') {
      orderByClause = desc(vehicles.price);
    } else if (params.sort === 'year_desc') {
      orderByClause = desc(vehicles.year);
    } else if (params.sort === 'year_asc') {
      orderByClause = asc(vehicles.year);
    } else if (params.sort === 'mileage_asc') {
      orderByClause = asc(vehicles.mileage);
    }

    const matchedVehicles = await db
      .select()
      .from(vehicles)
      .where(and(...conditions))
      .orderBy(orderByClause);

    const allImages = await db
      .select()
      .from(vehicleImages)
      .orderBy(asc(vehicleImages.sortOrder));

    const imagesByVehicleId = new Map<number, typeof allImages>();
    for (const img of allImages) {
      const list = imagesByVehicleId.get(img.vehicleId) || [];
      list.push(img);
      imagesByVehicleId.set(img.vehicleId, list);
    }

    const enriched = matchedVehicles.map((v) => ({
      ...v,
      featuresList: safeParseJsonArray(v.features),
      images: imagesByVehicleId.get(v.id) || [],
    }));

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(50, params.limit || 12));
    const total = enriched.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const paginated = enriched.slice(offset, offset + limit);

    return {
      vehicles: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('Database query failed in getFilteredVehicles:', error);
    throw new Error('Failed to query vehicle inventory.', { cause: error });
  }
}

export async function getVehicleBySlug(slug: string) {
  try {
    await ensureDatabaseSeeded();

    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.slug, slug))
      .limit(1);

    if (!vehicle) {
      return null;
    }

    const images = await db
      .select()
      .from(vehicleImages)
      .where(eq(vehicleImages.vehicleId, vehicle.id))
      .orderBy(asc(vehicleImages.sortOrder));

    const similarRaw = await db
      .select()
      .from(vehicles)
      .where(
        and(
          eq(vehicles.publicationStatus, 'Published'),
          ne(vehicles.id, vehicle.id),
          ne(vehicles.availabilityStatus, 'Sold')
        )
      )
      .orderBy(desc(vehicles.createdAt))
      .limit(6);

    const allImages = await db
      .select()
      .from(vehicleImages)
      .orderBy(asc(vehicleImages.sortOrder));

    const similar = similarRaw
      .sort((a, b) => {
        const aScore =
          (a.bodyType === vehicle.bodyType ? 2 : 0) +
          (a.make === vehicle.make ? 1 : 0);
        const bScore =
          (b.bodyType === vehicle.bodyType ? 2 : 0) +
          (b.make === vehicle.make ? 1 : 0);
        return bScore - aScore;
      })
      .slice(0, 3)
      .map((s) => ({
        ...s,
        featuresList: safeParseJsonArray(s.features),
        images: allImages.filter((img) => img.vehicleId === s.id),
      }));

    return {
      ...vehicle,
      vin: vehicle.showVinPublicly ? vehicle.vin : '',
      featuresList: safeParseJsonArray(vehicle.features),
      images,
      similarVehicles: similar,
    };
  } catch (error) {
    console.error('Database query failed in getVehicleBySlug:', error);
    throw new Error('Failed to load vehicle details.', { cause: error });
  }
}

export async function createCustomerInquiryRecord(input: {
  customerName: string;
  phone: string;
  email?: string;
  inquiryType: string;
  vehicleId?: number | null;
  vehicleTitle?: string;
  tradeInDetails?: string;
  message: string;
  consentGiven: boolean;
}) {
  try {
    const [created] = await db
      .insert(customerInquiries)
      .values({
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        email: (input.email || '').trim(),
        inquiryType: input.inquiryType,
        vehicleId: input.vehicleId || null,
        vehicleTitle: (input.vehicleTitle || '').trim(),
        tradeInDetails: (input.tradeInDetails || '').trim(),
        message: input.message.trim(),
        consentGiven: input.consentGiven,
        status: 'New',
      })
      .returning();

    return created;
  } catch (error) {
    console.error(
      'Database query failed in createCustomerInquiryRecord:',
      error
    );
    throw new Error('Failed to save customer inquiry.', { cause: error });
  }
}

export async function createTestDriveRequestRecord(input: {
  customerName: string;
  phone: string;
  email?: string;
  vehicleId?: number | null;
  vehicleTitle: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}) {
  try {
    const [created] = await db
      .insert(testDriveRequests)
      .values({
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        email: (input.email || '').trim(),
        vehicleId: input.vehicleId || null,
        vehicleTitle: input.vehicleTitle.trim(),
        preferredDate: input.preferredDate,
        preferredTime: input.preferredTime,
        notes: (input.notes || '').trim(),
        status: 'Pending',
      })
      .returning();

    return created;
  } catch (error) {
    console.error(
      'Database query failed in createTestDriveRequestRecord:',
      error
    );
    throw new Error('Failed to schedule test-drive request.', { cause: error });
  }
}

// ============================================================================
// ADMIN REPOSITORY FUNCTIONS
// ============================================================================

export async function recordAuditLog(
  adminUid: string,
  adminEmail: string,
  action: string,
  entityType: string,
  entityId: string,
  details: string
) {
  try {
    await db.insert(auditLogs).values({
      adminUid,
      adminEmail,
      action,
      entityType,
      entityId,
      details,
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

export async function getAdminOverviewStats() {
  try {
    await ensureDatabaseSeeded();

    const allVehicles = await db
      .select()
      .from(vehicles)
      .orderBy(desc(vehicles.updatedAt));
    const allInquiries = await db
      .select()
      .from(customerInquiries)
      .orderBy(desc(customerInquiries.createdAt));
    const allTestDrives = await db
      .select()
      .from(testDriveRequests)
      .orderBy(desc(testDriveRequests.createdAt));
    const recentLogs = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(15);

    const stats = {
      totalVehicles: allVehicles.length,
      availableVehicles: allVehicles.filter(
        (v) =>
          v.availabilityStatus === 'Available' &&
          v.publicationStatus === 'Published'
      ).length,
      reservedVehicles: allVehicles.filter(
        (v) => v.availabilityStatus === 'Reserved'
      ).length,
      soldVehicles: allVehicles.filter((v) => v.availabilityStatus === 'Sold')
        .length,
      draftOrUnpublishedVehicles: allVehicles.filter(
        (v) => v.publicationStatus !== 'Published'
      ).length,
      sampleVehiclesCount: allVehicles.filter((v) => v.isSampleData).length,
      totalInquiries: allInquiries.length,
      newInquiries: allInquiries.filter((i) => i.status === 'New').length,
      totalTestDrives: allTestDrives.length,
      pendingTestDrives: allTestDrives.filter((t) => t.status === 'Pending')
        .length,
    };

    return {
      stats,
      recentInquiries: allInquiries.slice(0, 6),
      recentTestDrives: allTestDrives.slice(0, 6),
      recentActivity: recentLogs,
    };
  } catch (error) {
    console.error('Database query failed in getAdminOverviewStats:', error);
    throw new Error('Failed to load dashboard overview statistics.', {
      cause: error,
    });
  }
}

export async function getAdminVehiclesList() {
  try {
    await ensureDatabaseSeeded();
    const allVehicles = await db
      .select()
      .from(vehicles)
      .orderBy(desc(vehicles.createdAt));
    const allImages = await db
      .select()
      .from(vehicleImages)
      .orderBy(asc(vehicleImages.sortOrder));

    return allVehicles.map((v) => ({
      ...v,
      featuresList: safeParseJsonArray(v.features),
      images: allImages.filter((img) => img.vehicleId === v.id),
    }));
  } catch (error) {
    console.error('Database query failed in getAdminVehiclesList:', error);
    throw new Error('Failed to load administrative vehicle inventory.', {
      cause: error,
    });
  }
}

export async function upsertAdminVehicle(
  payload: any,
  adminUid: string,
  adminEmail: string
) {
  try {
    const slugBase =
      payload.slug ||
      `${payload.year}-${payload.make}-${payload.model}-${payload.trim || ''}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const featuresJson = Array.isArray(payload.featuresList)
      ? JSON.stringify(payload.featuresList)
      : typeof payload.features === 'string'
      ? payload.features
      : '[]';

    const values = {
      slug: slugBase || `vehicle-${Date.now()}`,
      make: String(payload.make || '').trim(),
      model: String(payload.model || '').trim(),
      trim: String(payload.trim || '').trim(),
      year: Number(payload.year) || new Date().getFullYear(),
      price: Number(payload.price) || 0,
      discountPrice:
        payload.discountPrice && Number(payload.discountPrice) > 0
          ? Number(payload.discountPrice)
          : null,
      currency: 'GH₵',
      condition: String(payload.condition || 'Foreign Used'),
      mileage: Number(payload.mileage) || 0,
      mileageUnit: String(payload.mileageUnit || 'km'),
      transmission: String(payload.transmission || 'Automatic'),
      fuelType: String(payload.fuelType || 'Petrol'),
      engineCapacity: String(payload.engineCapacity || 'Unverified'),
      bodyType: String(payload.bodyType || 'SUV'),
      exteriorColour: String(payload.exteriorColour || 'Unverified'),
      interiorColour: String(payload.interiorColour || 'Unverified'),
      drivetrain: String(payload.drivetrain || '4WD / AWD'),
      vin: String(payload.vin || '').trim(),
      showVinPublicly: Boolean(payload.showVinPublicly),
      importStatus: String(payload.importStatus || 'Customs Duty Paid'),
      location: String(payload.location || '[CITY, GHANA]'),
      description: String(payload.description || '').trim(),
      features: featuresJson,
      availabilityStatus: String(payload.availabilityStatus || 'Available'),
      featuredStatus: Boolean(payload.featuredStatus),
      publicationStatus: String(payload.publicationStatus || 'Published'),
      isSampleData: Boolean(payload.isSampleData),
      updatedAt: new Date(),
    };

    let savedVehicle;
    if (payload.id) {
      const [updated] = await db
        .update(vehicles)
        .set(values)
        .where(eq(vehicles.id, Number(payload.id)))
        .returning();
      savedVehicle = updated;
      await recordAuditLog(
        adminUid,
        adminEmail,
        'UPDATE_VEHICLE',
        'vehicle',
        String(savedVehicle.id),
        `Updated ${savedVehicle.year} ${savedVehicle.make} ${savedVehicle.model} (${savedVehicle.availabilityStatus}, ${savedVehicle.publicationStatus})`
      );
    } else {
      const uniqueSlug = `${values.slug}-${Math.floor(100 + Math.random() * 900)}`;
      const [inserted] = await db
        .insert(vehicles)
        .values({ ...values, slug: uniqueSlug })
        .returning();
      savedVehicle = inserted;
      await recordAuditLog(
        adminUid,
        adminEmail,
        'CREATE_VEHICLE',
        'vehicle',
        String(savedVehicle.id),
        `Added ${savedVehicle.year} ${savedVehicle.make} ${savedVehicle.model} at GH₵ ${savedVehicle.price.toLocaleString()}`
      );
    }

    if (Array.isArray(payload.images)) {
      await db
        .delete(vehicleImages)
        .where(eq(vehicleImages.vehicleId, savedVehicle.id));

      if (payload.images.length > 0) {
        await db.insert(vehicleImages).values(
          payload.images.map((img: any, index: number) => ({
            vehicleId: savedVehicle.id,
            imageUrl: String(img.imageUrl || '').trim(),
            altText:
              String(img.altText || '').trim() ||
              `${savedVehicle.year} ${savedVehicle.make} ${savedVehicle.model} photo ${index + 1}`,
            sortOrder: index,
          }))
        );
      }
    }

    return savedVehicle;
  } catch (error) {
    console.error('Database query failed in upsertAdminVehicle:', error);
    throw new Error('Failed to save vehicle record.', { cause: error });
  }
}

export async function deleteAdminVehicle(
  id: number,
  adminUid: string,
  adminEmail: string
) {
  try {
    const [deleted] = await db
      .delete(vehicles)
      .where(eq(vehicles.id, id))
      .returning();

    if (deleted) {
      await recordAuditLog(
        adminUid,
        adminEmail,
        'DELETE_VEHICLE',
        'vehicle',
        String(id),
        `Deleted vehicle ${deleted.year} ${deleted.make} ${deleted.model}`
      );
    }
    return deleted;
  } catch (error) {
    console.error('Database query failed in deleteAdminVehicle:', error);
    throw new Error('Failed to delete vehicle.', { cause: error });
  }
}

export async function clearAllSampleVehicles(
  adminUid: string,
  adminEmail: string
) {
  try {
    const deleted = await db
      .delete(vehicles)
      .where(eq(vehicles.isSampleData, true))
      .returning();

    await recordAuditLog(
      adminUid,
      adminEmail,
      'CLEAR_SAMPLE_DATA',
      'vehicle',
      'sample_batch',
      `Removed ${deleted.length} demonstration sample vehicles prior to launch`
    );

    return { removedCount: deleted.length };
  } catch (error) {
    console.error('Database query failed in clearAllSampleVehicles:', error);
    throw new Error('Failed to remove demonstration vehicles.', {
      cause: error,
    });
  }
}

export async function restoreSampleVehicles(
  adminUid: string,
  adminEmail: string
) {
  try {
    await seedSampleVehiclesInternal();
    await recordAuditLog(
      adminUid,
      adminEmail,
      'RESTORE_SAMPLE_DATA',
      'vehicle',
      'sample_batch',
      'Restored demonstration sample vehicles for testing'
    );
    return { restored: true };
  } catch (error) {
    console.error('Database query failed in restoreSampleVehicles:', error);
    throw new Error('Failed to restore demonstration vehicles.', {
      cause: error,
    });
  }
}

export async function getAdminInquiriesAndTestDrives() {
  try {
    const inquiriesList = await db
      .select()
      .from(customerInquiries)
      .orderBy(desc(customerInquiries.createdAt));
    const testDrivesList = await db
      .select()
      .from(testDriveRequests)
      .orderBy(desc(testDriveRequests.createdAt));

    return {
      inquiries: inquiriesList,
      testDrives: testDrivesList,
    };
  } catch (error) {
    console.error(
      'Database query failed in getAdminInquiriesAndTestDrives:',
      error
    );
    throw new Error('Failed to fetch customer inquiries and test drives.', {
      cause: error,
    });
  }
}

export async function updateAdminInquiry(
  id: number,
  status: string,
  internalNotes: string,
  adminUid: string,
  adminEmail: string
) {
  try {
    const [updated] = await db
      .update(customerInquiries)
      .set({
        status,
        internalNotes,
        updatedAt: new Date(),
      })
      .where(eq(customerInquiries.id, id))
      .returning();

    if (updated) {
      await recordAuditLog(
        adminUid,
        adminEmail,
        'UPDATE_INQUIRY',
        'inquiry',
        String(id),
        `Updated inquiry #${id} (${updated.customerName}) status to ${status}`
      );
    }
    return updated;
  } catch (error) {
    console.error('Database query failed in updateAdminInquiry:', error);
    throw new Error('Failed to update customer inquiry.', { cause: error });
  }
}

export async function updateAdminTestDrive(
  id: number,
  status: string,
  internalNotes: string,
  adminUid: string,
  adminEmail: string
) {
  try {
    const [updated] = await db
      .update(testDriveRequests)
      .set({
        status,
        internalNotes,
        updatedAt: new Date(),
      })
      .where(eq(testDriveRequests.id, id))
      .returning();

    if (updated) {
      await recordAuditLog(
        adminUid,
        adminEmail,
        'UPDATE_TEST_DRIVE',
        'test_drive',
        String(id),
        `Updated test-drive #${id} (${updated.customerName}) status to ${status}`
      );
    }
    return updated;
  } catch (error) {
    console.error('Database query failed in updateAdminTestDrive:', error);
    throw new Error('Failed to update test-drive request.', { cause: error });
  }
}

export async function updateDealershipSettingsRecord(
  payload: any,
  adminUid: string,
  adminEmail: string
) {
  try {
    await ensureDatabaseSeeded();
    const [existing] = await db.select().from(dealershipSettings).limit(1);

    const updateValues = {
      businessName: String(payload.businessName ?? existing.businessName),
      tagline: String(payload.tagline ?? existing.tagline),
      location: String(payload.location ?? existing.location),
      phone: String(payload.phone ?? existing.phone),
      whatsapp: String(payload.whatsapp ?? existing.whatsapp),
      email: String(payload.email ?? existing.email),
      address: String(payload.address ?? existing.address),
      openingHours: String(payload.openingHours ?? existing.openingHours),
      currency: String(payload.currency ?? 'GH₵'),
      primaryMarket: String(payload.primaryMarket ?? 'Ghana'),
      domain: String(payload.domain ?? existing.domain),
      logoText: String(payload.logoText ?? existing.logoText),
      heroHeadline: String(payload.heroHeadline ?? existing.heroHeadline),
      heroDescription: String(
        payload.heroDescription ?? existing.heroDescription
      ),
      aboutBackground: String(
        payload.aboutBackground ?? existing.aboutBackground
      ),
      aboutMission: String(payload.aboutMission ?? existing.aboutMission),
      aboutCustomerApproach: String(
        payload.aboutCustomerApproach ?? existing.aboutCustomerApproach
      ),
      aboutTeamInfo: String(payload.aboutTeamInfo ?? existing.aboutTeamInfo),
      whyChooseUs:
        typeof payload.whyChooseUs === 'string'
          ? payload.whyChooseUs
          : JSON.stringify(payload.whyChooseUs ?? existing.whyChooseUs),
      buyingProcess:
        typeof payload.buyingProcess === 'string'
          ? payload.buyingProcess
          : JSON.stringify(payload.buyingProcess ?? existing.buyingProcess),
      financingOffered: Boolean(
        payload.financingOffered ?? existing.financingOffered
      ),
      financingDetails: String(
        payload.financingDetails ?? existing.financingDetails
      ),
      onlinePaymentsEnabled: Boolean(
        payload.onlinePaymentsEnabled ?? existing.onlinePaymentsEnabled
      ),
      paymentTerms: String(payload.paymentTerms ?? existing.paymentTerms),
      soldVehiclePolicy: String(
        payload.soldVehiclePolicy ?? existing.soldVehiclePolicy
      ),
      googleMapsEmbedUrl: String(
        payload.googleMapsEmbedUrl ?? existing.googleMapsEmbedUrl
      ),
      socialLinks:
        typeof payload.socialLinks === 'string'
          ? payload.socialLinks
          : JSON.stringify(payload.socialLinks ?? existing.socialLinks),
      seoTitle: String(payload.seoTitle ?? existing.seoTitle),
      seoDescription: String(payload.seoDescription ?? existing.seoDescription),
      privacyPolicyContent: String(
        payload.privacyPolicyContent ?? existing.privacyPolicyContent
      ),
      termsContent: String(payload.termsContent ?? existing.termsContent),
      updatedAt: new Date(),
    };

    const [updated] = await db
      .update(dealershipSettings)
      .set(updateValues)
      .where(eq(dealershipSettings.id, existing.id))
      .returning();

    await recordAuditLog(
      adminUid,
      adminEmail,
      'UPDATE_SETTINGS',
      'dealership_settings',
      String(existing.id),
      `Updated dealership business information and website content for ${updated.businessName}`
    );

    return updated;
  } catch (error) {
    console.error(
      'Database query failed in updateDealershipSettingsRecord:',
      error
    );
    throw new Error('Failed to update dealership settings.', { cause: error });
  }
}

export async function getAdminContentRecords() {
  try {
    await ensureDatabaseSeeded();
    const [settings] = await db.select().from(dealershipSettings).limit(1);
    const allServices = await db
      .select()
      .from(services)
      .orderBy(asc(services.sortOrder));
    const allFaqs = await db.select().from(faqs).orderBy(asc(faqs.sortOrder));
    const allTestimonials = await db
      .select()
      .from(testimonials)
      .orderBy(desc(testimonials.createdAt));

    return {
      settings,
      services: allServices,
      faqs: allFaqs,
      testimonials: allTestimonials,
    };
  } catch (error) {
    console.error('Database query failed in getAdminContentRecords:', error);
    throw new Error('Failed to fetch CMS content records.', { cause: error });
  }
}

export async function upsertServiceRecord(
  payload: any,
  adminUid: string,
  adminEmail: string
) {
  try {
    const slug =
      String(payload.title || 'service')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `service-${Date.now()}`;

    if (payload.id) {
      const [updated] = await db
        .update(services)
        .set({
          title: String(payload.title).trim(),
          slug,
          description: String(payload.description).trim(),
          details: String(payload.details || '').trim(),
          isConfirmed: Boolean(payload.isConfirmed),
          sortOrder: Number(payload.sortOrder) || 0,
        })
        .where(eq(services.id, Number(payload.id)))
        .returning();
      await recordAuditLog(
        adminUid,
        adminEmail,
        'UPDATE_SERVICE',
        'service',
        String(updated.id),
        `Updated service: ${updated.title}`
      );
      return updated;
    } else {
      const [created] = await db
        .insert(services)
        .values({
          title: String(payload.title).trim(),
          slug,
          description: String(payload.description).trim(),
          details: String(payload.details || '').trim(),
          isConfirmed: Boolean(payload.isConfirmed ?? true),
          sortOrder: Number(payload.sortOrder) || 0,
        })
        .returning();
      await recordAuditLog(
        adminUid,
        adminEmail,
        'CREATE_SERVICE',
        'service',
        String(created.id),
        `Created service: ${created.title}`
      );
      return created;
    }
  } catch (error) {
    console.error('Database query failed in upsertServiceRecord:', error);
    throw new Error('Failed to save service.', { cause: error });
  }
}

export async function deleteServiceRecord(
  id: number,
  adminUid: string,
  adminEmail: string
) {
  try {
    await db.delete(services).where(eq(services.id, id));
    await recordAuditLog(
      adminUid,
      adminEmail,
      'DELETE_SERVICE',
      'service',
      String(id),
      `Deleted service #${id}`
    );
    return { deleted: true };
  } catch (error) {
    console.error('Database query failed in deleteServiceRecord:', error);
    throw new Error('Failed to delete service.', { cause: error });
  }
}

export async function upsertFaqRecord(
  payload: any,
  adminUid: string,
  adminEmail: string
) {
  try {
    if (payload.id) {
      const [updated] = await db
        .update(faqs)
        .set({
          category: String(payload.category || 'General').trim(),
          question: String(payload.question).trim(),
          answer: String(payload.answer).trim(),
          isPublished: Boolean(payload.isPublished ?? true),
          sortOrder: Number(payload.sortOrder) || 0,
        })
        .where(eq(faqs.id, Number(payload.id)))
        .returning();
      await recordAuditLog(
        adminUid,
        adminEmail,
        'UPDATE_FAQ',
        'faq',
        String(updated.id),
        `Updated FAQ: ${updated.question}`
      );
      return updated;
    } else {
      const [created] = await db
        .insert(faqs)
        .values({
          category: String(payload.category || 'General').trim(),
          question: String(payload.question).trim(),
          answer: String(payload.answer).trim(),
          isPublished: Boolean(payload.isPublished ?? true),
          sortOrder: Number(payload.sortOrder) || 0,
        })
        .returning();
      await recordAuditLog(
        adminUid,
        adminEmail,
        'CREATE_FAQ',
        'faq',
        String(created.id),
        `Created FAQ: ${created.question}`
      );
      return created;
    }
  } catch (error) {
    console.error('Database query failed in upsertFaqRecord:', error);
    throw new Error('Failed to save FAQ.', { cause: error });
  }
}

export async function deleteFaqRecord(
  id: number,
  adminUid: string,
  adminEmail: string
) {
  try {
    await db.delete(faqs).where(eq(faqs.id, id));
    await recordAuditLog(
      adminUid,
      adminEmail,
      'DELETE_FAQ',
      'faq',
      String(id),
      `Deleted FAQ #${id}`
    );
    return { deleted: true };
  } catch (error) {
    console.error('Database query failed in deleteFaqRecord:', error);
    throw new Error('Failed to delete FAQ.', { cause: error });
  }
}

export async function createTestimonialRecord(
  payload: any,
  adminUid: string,
  adminEmail: string
) {
  try {
    const [created] = await db
      .insert(testimonials)
      .values({
        customerName: String(payload.customerName).trim(),
        roleOrLocation: String(payload.roleOrLocation || 'Accra, Ghana').trim(),
        vehiclePurchased: String(payload.vehiclePurchased || '').trim(),
        content: String(payload.content).trim(),
        isVerified: Boolean(payload.isVerified ?? true),
      })
      .returning();
    await recordAuditLog(
      adminUid,
      adminEmail,
      'CREATE_TESTIMONIAL',
      'testimonial',
      String(created.id),
      `Added verified customer testimonial from ${created.customerName}`
    );
    return created;
  } catch (error) {
    console.error('Database query failed in createTestimonialRecord:', error);
    throw new Error('Failed to save testimonial.', { cause: error });
  }
}

export async function deleteTestimonialRecord(
  id: number,
  adminUid: string,
  adminEmail: string
) {
  try {
    await db.delete(testimonials).where(eq(testimonials.id, id));
    await recordAuditLog(
      adminUid,
      adminEmail,
      'DELETE_TESTIMONIAL',
      'testimonial',
      String(id),
      `Deleted testimonial #${id}`
    );
    return { deleted: true };
  } catch (error) {
    console.error('Database query failed in deleteTestimonialRecord:', error);
    throw new Error('Failed to delete testimonial.', { cause: error });
  }
}

function safeParseJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
