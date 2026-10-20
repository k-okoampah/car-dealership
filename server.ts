import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import * as dotenv from 'dotenv';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  clearAllSampleVehicles,
  createCustomerInquiryRecord,
  createTestDriveRequestRecord,
  createTestimonialRecord,
  deleteAdminVehicle,
  deleteFaqRecord,
  deleteServiceRecord,
  deleteTestimonialRecord,
  getAdminContentRecords,
  getAdminInquiriesAndTestDrives,
  getAdminOverviewStats,
  getAdminVehiclesList,
  getFilteredVehicles,
  getPublicBootstrapData,
  getVehicleBySlug,
  restoreSampleVehicles,
  updateAdminInquiry,
  updateAdminTestDrive,
  updateDealershipSettingsRecord,
  upsertAdminVehicle,
  upsertFaqRecord,
  upsertServiceRecord,
} from './src/db/repository.ts';
import { listUsers, updateUserRoleAndStatus } from './src/db/users.ts';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit to support base64 vehicle image uploads from the Admin Dashboard
app.use(express.json({ limit: '15mb' }));

// Security Headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Simple In-Memory Rate Limiter & Duplicate Submission Guard for Public Forms
const submissionRateMap = new Map<string, { count: number; resetAt: number; lastHash: string }>();

function checkFormRateLimit(ip: string, payloadHash: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const existing = submissionRateMap.get(ip);

  if (!existing || now > existing.resetAt) {
    submissionRateMap.set(ip, { count: 1, resetAt: now + windowMs, lastHash: payloadHash });
    return { allowed: true };
  }

  if (existing.lastHash === payloadHash) {
    return {
      allowed: false,
      reason: 'This exact inquiry was just submitted. Our sales team has received your request.',
    };
  }

  if (existing.count >= 8) {
    return {
      allowed: false,
      reason: 'Too many requests submitted in a short period. Please wait a minute and try again.',
    };
  }

  existing.count += 1;
  existing.lastHash = payloadHash;
  return { allowed: true };
}

async function sendOptionalEmailNotification(subject: string, htmlBody: string) {
  if (
    process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true' &&
    process.env.RESEND_API_KEY &&
    process.env.DEALERSHIP_NOTIFICATION_EMAIL
  ) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Dealership Notifications <onboarding@resend.dev>',
          to: [process.env.DEALERSHIP_NOTIFICATION_EMAIL],
          subject,
          html: htmlBody,
        }),
      });
    } catch (err) {
      console.error('Optional email notification failed:', err);
    }
  }
}

// ============================================================================
// SEO ROUTES: robots.txt & sitemap.xml
// ============================================================================

app.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${baseUrl}/sitemap.xml\n`
  );
});

app.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const result = await getFilteredVehicles({ limit: 50 });
    const staticPages = ['', '/inventory', '/about', '/services', '/contact', '/faq', '/privacy', '/terms'];

    const urlsXml = [
      ...staticPages.map(
        (p) =>
          `  <url><loc>${baseUrl}${p}</loc><changefreq>weekly</changefreq><priority>${
            p === '' ? '1.0' : '0.8'
          }</priority></url>`
      ),
      ...result.vehicles.map(
        (v) =>
          `  <url><loc>${baseUrl}/vehicles/${v.slug}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`
      ),
    ].join('\n');

    res
      .type('application/xml')
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsXml}\n</urlset>`
      );
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// ============================================================================
// PUBLIC API ROUTES
// ============================================================================

app.get('/api/public/bootstrap', async (_req: Request, res: Response) => {
  try {
    const data = await getPublicBootstrapData();
    res.json(data);
  } catch (error: any) {
    console.error('Failed to fetch bootstrap data:', error);
    res.status(500).json({ error: error.message || 'Failed to load site data' });
  }
});

app.get('/api/vehicles', async (req: Request, res: Response) => {
  try {
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const minYear = req.query.minYear ? Number(req.query.minYear) : undefined;
    const maxYear = req.query.maxYear ? Number(req.query.maxYear) : undefined;
    const maxMileage = req.query.maxMileage ? Number(req.query.maxMileage) : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 12;

    const result = await getFilteredVehicles({
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
      make: typeof req.query.make === 'string' ? req.query.make : undefined,
      model: typeof req.query.model === 'string' ? req.query.model : undefined,
      bodyType: typeof req.query.bodyType === 'string' ? req.query.bodyType : undefined,
      condition: typeof req.query.condition === 'string' ? req.query.condition : undefined,
      transmission: typeof req.query.transmission === 'string' ? req.query.transmission : undefined,
      fuelType: typeof req.query.fuelType === 'string' ? req.query.fuelType : undefined,
      drivetrain: typeof req.query.drivetrain === 'string' ? req.query.drivetrain : undefined,
      availability: typeof req.query.availability === 'string' ? req.query.availability : undefined,
      importStatus: typeof req.query.importStatus === 'string' ? req.query.importStatus : undefined,
      featured: req.query.featured === 'true' ? true : undefined,
      sort: typeof req.query.sort === 'string' ? req.query.sort : 'newest',
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      maxMileage,
      page,
      limit,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Failed to fetch vehicles:', error);
    res.status(500).json({ error: error.message || 'Failed to load vehicles' });
  }
});

app.get('/api/vehicles/:slug', async (req: Request, res: Response) => {
  try {
    const vehicle = await getVehicleBySlug(req.params.slug);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle listing not found' });
    }
    res.json(vehicle);
  } catch (error: any) {
    console.error('Failed to fetch vehicle details:', error);
    res.status(500).json({ error: error.message || 'Failed to load vehicle details' });
  }
});

app.post('/api/inquiries', async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      phone,
      email,
      inquiryType,
      vehicleId,
      vehicleTitle,
      tradeInDetails,
      message,
      consentGiven,
    } = req.body || {};

    if (!customerName || String(customerName).trim().length < 2) {
      return res.status(400).json({ error: 'Please provide your full name.' });
    }
    if (!phone || String(phone).trim().length < 7) {
      return res.status(400).json({ error: 'Please provide a valid phone or WhatsApp number.' });
    }
    if (!message || String(message).trim().length < 5) {
      return res.status(400).json({ error: 'Please enter a brief message or inquiry details.' });
    }
    if (consentGiven === false) {
      return res.status(400).json({ error: 'Please confirm consent to be contacted regarding your inquiry.' });
    }

    const clientIp = req.ip || 'unknown';
    const payloadHash = `${customerName}-${phone}-${inquiryType}-${vehicleId || ''}-${message}`;
    const rateCheck = checkFormRateLimit(clientIp, payloadHash);
    if (!rateCheck.allowed) {
      return res.status(429).json({ error: rateCheck.reason });
    }

    const created = await createCustomerInquiryRecord({
      customerName: String(customerName),
      phone: String(phone),
      email: email ? String(email) : '',
      inquiryType: String(inquiryType || 'General Inquiry'),
      vehicleId: vehicleId ? Number(vehicleId) : null,
      vehicleTitle: vehicleTitle ? String(vehicleTitle) : '',
      tradeInDetails: tradeInDetails ? String(tradeInDetails) : '',
      message: String(message),
      consentGiven: Boolean(consentGiven ?? true),
    });

    await sendOptionalEmailNotification(
      `New ${created.inquiryType}: ${created.customerName}`,
      `<p><strong>Customer:</strong> ${created.customerName}</p><p><strong>Phone:</strong> ${created.phone}</p><p><strong>Vehicle:</strong> ${created.vehicleTitle || 'General'}</p><p><strong>Message:</strong> ${created.message}</p>`
    );

    res.status(201).json({
      message:
        'Your inquiry has been recorded (#INQ-' +
        created.id +
        '). Our sales desk will contact you via phone or WhatsApp shortly.',
      inquiryId: created.id,
      createdAt: created.createdAt,
    });
  } catch (error: any) {
    console.error('Failed to submit inquiry:', error);
    res.status(500).json({ error: error.message || 'Failed to submit inquiry' });
  }
});

app.post('/api/test-drives', async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      phone,
      email,
      vehicleId,
      vehicleTitle,
      preferredDate,
      preferredTime,
      notes,
    } = req.body || {};

    if (!customerName || String(customerName).trim().length < 2) {
      return res.status(400).json({ error: 'Please provide your full name.' });
    }
    if (!phone || String(phone).trim().length < 7) {
      return res.status(400).json({ error: 'Please provide a valid phone or WhatsApp number.' });
    }
    if (!vehicleTitle) {
      return res.status(400).json({ error: 'Please select a vehicle for the test drive.' });
    }
    if (!preferredDate) {
      return res.status(400).json({ error: 'Please select a preferred appointment date.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (String(preferredDate) < todayStr) {
      return res.status(400).json({
        error: 'Preferred test-drive date cannot be in the past. Please choose today or a future date.',
      });
    }

    const clientIp = req.ip || 'unknown';
    const payloadHash = `td-${customerName}-${phone}-${vehicleId || ''}-${preferredDate}-${preferredTime}`;
    const rateCheck = checkFormRateLimit(clientIp, payloadHash);
    if (!rateCheck.allowed) {
      return res.status(429).json({ error: rateCheck.reason });
    }

    const created = await createTestDriveRequestRecord({
      customerName: String(customerName),
      phone: String(phone),
      email: email ? String(email) : '',
      vehicleId: vehicleId ? Number(vehicleId) : null,
      vehicleTitle: String(vehicleTitle),
      preferredDate: String(preferredDate),
      preferredTime: String(preferredTime || '10:00 AM'),
      notes: notes ? String(notes) : '',
    });

    await sendOptionalEmailNotification(
      `New Test-Drive Request: ${created.vehicleTitle}`,
      `<p><strong>Customer:</strong> ${created.customerName}</p><p><strong>Phone:</strong> ${created.phone}</p><p><strong>Vehicle:</strong> ${created.vehicleTitle}</p><p><strong>Date/Time:</strong> ${created.preferredDate} at ${created.preferredTime}</p>`
    );

    res.status(201).json({
      message: `Your test-drive request (#TD-${created.id}) for ${created.preferredDate} at ${created.preferredTime} has been logged. Our team will confirm your appointment slot.`,
      requestId: created.id,
      createdAt: created.createdAt,
    });
  } catch (error: any) {
    console.error('Failed to submit test drive request:', error);
    res.status(500).json({ error: error.message || 'Failed to schedule test drive' });
  }
});

// ============================================================================
// PROTECTED ADMIN API ROUTES (Require Firebase Auth + DB User Validation)
// ============================================================================

app.get('/api/admin/me', requireAuth, async (req: AuthRequest, res: Response) => {
  res.json({ user: req.dbUser });
});

app.get('/api/admin/overview', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const overview = await getAdminOverviewStats();
    res.json(overview);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load admin overview' });
  }
});

app.get('/api/admin/vehicles', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const list = await getAdminVehiclesList();
    res.json({ vehicles: list });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load admin vehicles' });
  }
});

app.post('/api/admin/vehicles', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const saved = await upsertAdminVehicle(
      req.body,
      req.dbUser!.uid,
      req.dbUser!.email
    );
    res.status(201).json({ vehicle: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create vehicle' });
  }
});

app.put('/api/admin/vehicles/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const saved = await upsertAdminVehicle(
      { ...req.body, id: Number(req.params.id) },
      req.dbUser!.uid,
      req.dbUser!.email
    );
    res.json({ vehicle: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update vehicle' });
  }
});

app.delete('/api/admin/vehicles/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await deleteAdminVehicle(
      Number(req.params.id),
      req.dbUser!.uid,
      req.dbUser!.email
    );
    res.json({ deleted });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete vehicle' });
  }
});

app.post('/api/admin/vehicles/clear-sample', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await clearAllSampleVehicles(req.dbUser!.uid, req.dbUser!.email);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to remove sample vehicles' });
  }
});

app.post('/api/admin/vehicles/restore-sample', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await restoreSampleVehicles(req.dbUser!.uid, req.dbUser!.email);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to restore sample vehicles' });
  }
});

app.get('/api/admin/inquiries', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const data = await getAdminInquiriesAndTestDrives();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch inquiries' });
  }
});

app.patch('/api/admin/inquiries/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await updateAdminInquiry(
      Number(req.params.id),
      String(req.body.status || 'New'),
      String(req.body.internalNotes ?? ''),
      req.dbUser!.uid,
      req.dbUser!.email
    );
    res.json({ inquiry: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update inquiry' });
  }
});

app.patch('/api/admin/test-drives/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await updateAdminTestDrive(
      Number(req.params.id),
      String(req.body.status || 'Pending'),
      String(req.body.internalNotes ?? ''),
      req.dbUser!.uid,
      req.dbUser!.email
    );
    res.json({ testDrive: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update test drive' });
  }
});

app.get('/api/admin/content', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const data = await getAdminContentRecords();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load content records' });
  }
});

app.put('/api/admin/settings', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await updateDealershipSettingsRecord(
      req.body,
      req.dbUser!.uid,
      req.dbUser!.email
    );
    res.json({ settings: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update dealership settings' });
  }
});

app.post('/api/admin/services', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const saved = await upsertServiceRecord(req.body, req.dbUser!.uid, req.dbUser!.email);
    res.json({ service: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save service' });
  }
});

app.delete('/api/admin/services/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await deleteServiceRecord(Number(req.params.id), req.dbUser!.uid, req.dbUser!.email);
    res.json({ deleted: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete service' });
  }
});

app.post('/api/admin/faqs', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const saved = await upsertFaqRecord(req.body, req.dbUser!.uid, req.dbUser!.email);
    res.json({ faq: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save FAQ' });
  }
});

app.delete('/api/admin/faqs/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await deleteFaqRecord(Number(req.params.id), req.dbUser!.uid, req.dbUser!.email);
    res.json({ deleted: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete FAQ' });
  }
});

app.post('/api/admin/testimonials', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const saved = await createTestimonialRecord(req.body, req.dbUser!.uid, req.dbUser!.email);
    res.json({ testimonial: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save testimonial' });
  }
});

app.delete('/api/admin/testimonials/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await deleteTestimonialRecord(Number(req.params.id), req.dbUser!.uid, req.dbUser!.email);
    res.json({ deleted: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete testimonial' });
  }
});

app.get('/api/admin/staff', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const staff = await listUsers();
    res.json({ staff });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch staff list' });
  }
});

app.patch('/api/admin/staff/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await updateUserRoleAndStatus(
      Number(req.params.id),
      String(req.body.role || 'admin'),
      String(req.body.accountStatus || 'active')
    );
    res.json({ user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update staff member' });
  }
});

// ============================================================================
// VITE DEV MIDDLEWARE / STATIC PRODUCTION SERVER
// ============================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dealership server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}
