import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  Car,
  Check,
  Download,
  Edit3,
  Eye,
  FileText,
  Lock,
  LogOut,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { useSite, formatGhanaPhoneForWhatsApp } from '../context/SiteContext';
import {
  AuditLogItem,
  CustomerInquiry,
  FaqItem,
  ServiceItem,
  TestDriveRequest,
  TestimonialItem,
  Vehicle,
  VehicleImageItem,
} from '../types';
import { VehicleImage } from '../components/VehicleImage';

const STUDIO_PRESET_IMAGES = [
  {
    label: 'Pearl White SUV (Front)',
    url: '/vehicles/suv-pearl-front.svg',
  },
  {
    label: 'SUV Side Profile & Dimensions',
    url: '/vehicles/suv-pearl-side.svg',
  },
  {
    label: 'Luxury Leather Cockpit',
    url: '/vehicles/suv-pearl-interior.svg',
  },
  {
    label: 'Obsidian Executive Sedan',
    url: '/vehicles/sedan-obsidian-front.svg',
  },
  {
    label: 'Silver 4x4 Double-Cab Pickup',
    url: '/vehicles/pickup-silver-front.svg',
  },
  {
    label: 'Sapphire AWD Crossover',
    url: '/vehicles/crossover-blue-front.svg',
  },
  {
    label: 'Champagne Luxury SUV',
    url: '/vehicles/luxury-graphite-front.svg',
  },
  {
    label: 'Crimson Performance Hatchback',
    url: '/vehicles/hatchback-crimson-front.svg',
  },
];

export const AdminPage: React.FC = () => {
  const {
    currentUser,
    authLoading,
    signInAdmin,
    signOutAdmin,
    authFetch,
    refreshBootstrap,
    formatPriceGHS,
    updatePageSeo,
  } = useSite();

  const [activeSection, setActiveSection] = useState<
    'overview' | 'vehicles' | 'inquiries' | 'content' | 'staff'
  >('overview');
  const [authError, setAuthError] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Overview state
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogItem[]>([]);

  // Vehicles state
  const [adminVehicles, setAdminVehicles] = useState<Vehicle[]>([]);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('All');
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');

  // Inquiries & Test Drives state
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [testDrives, setTestDrives] = useState<TestDriveRequest[]>([]);
  const [leadSubTab, setLeadSubTab] = useState<'inquiries' | 'testdrives'>(
    'inquiries'
  );
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('All');
  const [selectedInquiry, setSelectedInquiry] =
    useState<CustomerInquiry | null>(null);
  const [selectedTestDrive, setSelectedTestDrive] =
    useState<TestDriveRequest | null>(null);

  // Content & Settings state
  const [settingsForm, setSettingsForm] = useState<any>(null);
  const [adminServices, setAdminServices] = useState<ServiceItem[]>([]);
  const [adminFaqs, setAdminFaqs] = useState<FaqItem[]>([]);
  const [adminTestimonials, setAdminTestimonials] = useState<TestimonialItem[]>(
    []
  );
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    details: '',
    isConfirmed: true,
    sortOrder: 1,
  });
  const [newFaq, setNewFaq] = useState({
    category: 'General',
    question: '',
    answer: '',
    isPublished: true,
    sortOrder: 1,
  });
  const [newTestimonial, setNewTestimonial] = useState({
    customerName: '',
    roleOrLocation: 'Accra, Ghana',
    vehiclePurchased: '',
    content: '',
  });

  // Staff state
  const [staffList, setStaffList] = useState<any[]>([]);

  useEffect(() => {
    updatePageSeo('Dealer Administration Dashboard');
  }, [updatePageSeo]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusBanner({ type, text });
    setTimeout(() => setStatusBanner(null), 5000);
  };

  const loadAdminData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [ovRes, vehRes, inqRes, cntRes, stfRes] = await Promise.all([
        authFetch('/api/admin/overview'),
        authFetch('/api/admin/vehicles'),
        authFetch('/api/admin/inquiries'),
        authFetch('/api/admin/content'),
        authFetch('/api/admin/staff'),
      ]);

      if (ovRes.ok) {
        const ov = await ovRes.json();
        setOverviewStats(ov.stats);
        setRecentLogs(ov.recentActivity || []);
      }
      if (vehRes.ok) {
        const vd = await vehRes.json();
        setAdminVehicles(vd.vehicles || []);
      }
      if (inqRes.ok) {
        const id = await inqRes.json();
        setInquiries(id.inquiries || []);
        setTestDrives(id.testDrives || []);
      }
      if (cntRes.ok) {
        const cd = await cntRes.json();
        setSettingsForm(cd.settings);
        setAdminServices(cd.services || []);
        setAdminFaqs(cd.faqs || []);
        setAdminTestimonials(cd.testimonials || []);
      }
      if (stfRes.ok) {
        const sd = await stfRes.json();
        setStaffList(sd.staff || []);
      }
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    }
  }, [currentUser, authFetch]);

  useEffect(() => {
    if (currentUser) {
      loadAdminData();
    }
  }, [currentUser, loadAdminData]);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInAdmin();
    } catch (err: any) {
      setAuthError(
        err.message || 'Authentication failed. Please allow popup sign-in.'
      );
    }
  };

  // Vehicle Editor Handlers
  const openCreateVehicle = () => {
    setPreviewMode(false);
    setEditingVehicle({
      make: 'Toyota',
      model: '',
      trim: '',
      year: new Date().getFullYear(),
      price: 450000,
      discountPrice: '',
      condition: 'Foreign Used',
      mileage: 25000,
      mileageUnit: 'km',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      engineCapacity: '2.5L Inline-4',
      bodyType: 'SUV',
      exteriorColour: 'Pearl White',
      interiorColour: 'Black Leather',
      drivetrain: '4WD / AWD',
      vin: '',
      showVinPublicly: false,
      importStatus: 'Customs Duty Paid',
      location: settingsForm?.location || '[CITY, GHANA]',
      description: '',
      featuresText:
        'Reverse Camera & Parking Sensors\nApple CarPlay & Android Auto\nDual-Zone Automatic Climate Control\nAlloy Wheels',
      availabilityStatus: 'Available',
      featuredStatus: false,
      publicationStatus: 'Published',
      isSampleData: false,
      images: [
        {
          imageUrl: '/vehicles/suv-pearl-front.svg',
          altText: 'Front quarter studio view',
          sortOrder: 0,
        },
      ],
    });
  };

  const openEditVehicle = (v: Vehicle) => {
    setPreviewMode(false);
    setEditingVehicle({
      ...v,
      discountPrice: v.discountPrice || '',
      featuresText: (v.featuresList || []).join('\n'),
      images: [...(v.images || [])],
    });
  };

  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingVehicle) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        showToast('error', `Skipped ${file.name}: Only image files are allowed.`);
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        showToast(
          'error',
          `Skipped ${file.name}: File exceeds 4MB upload limit.`
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEditingVehicle((prev: any) => ({
            ...prev,
            images: [
              ...(prev.images || []),
              {
                imageUrl: reader.result as string,
                altText: `${prev.year} ${prev.make} ${prev.model} - ${file.name}`,
                sortOrder: (prev.images || []).length,
              },
            ],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddUrlImage = () => {
    if (!newImageUrl.trim() || !editingVehicle) return;
    setEditingVehicle((prev: any) => ({
      ...prev,
      images: [
        ...(prev.images || []),
        {
          imageUrl: newImageUrl.trim(),
          altText:
            newImageAlt.trim() ||
            `${prev.year} ${prev.make} ${prev.model} photo`,
          sortOrder: (prev.images || []).length,
        },
      ],
    }));
    setNewImageUrl('');
    setNewImageAlt('');
  };

  const moveImageOrder = (idx: number, direction: -1 | 1) => {
    if (!editingVehicle) return;
    const list = [...editingVehicle.images];
    const target = idx + direction;
    if (target < 0 || target >= list.length) return;
    const temp = list[idx];
    list[idx] = list[target];
    list[target] = temp;
    setEditingVehicle({
      ...editingVehicle,
      images: list.map((img, i) => ({ ...img, sortOrder: i })),
    });
  };

  const removeImageAt = (idx: number) => {
    if (!editingVehicle) return;
    const list = editingVehicle.images.filter(
      (_: any, i: number) => i !== idx
    );
    setEditingVehicle({
      ...editingVehicle,
      images: list.map((img: any, i: number) => ({ ...img, sortOrder: i })),
    });
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    const featuresList = String(editingVehicle.featuresText || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...editingVehicle,
      featuresList,
    };

    try {
      const isEdit = Boolean(editingVehicle.id);
      const url = isEdit
        ? `/api/admin/vehicles/${editingVehicle.id}`
        : '/api/admin/vehicles';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Failed to save vehicle.');
        return;
      }
      showToast(
        'success',
        `Saved ${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}.`
      );
      setEditingVehicle(null);
      await loadAdminData();
      await refreshBootstrap();
    } catch (err: any) {
      showToast('error', err.message || 'Error saving vehicle.');
    }
  };

  const handleConfirmDeleteVehicle = async (id: number) => {
    try {
      const res = await authFetch(`/api/admin/vehicles/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('success', 'Vehicle removed from inventory.');
        setDeleteConfirmId(null);
        await loadAdminData();
        await refreshBootstrap();
      }
    } catch {
      showToast('error', 'Failed to delete vehicle.');
    }
  };

  const handleClearSampleVehicles = async () => {
    try {
      const res = await authFetch('/api/admin/vehicles/clear-sample', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          'success',
          `Removed ${data.removedCount} sample demonstration vehicles.`
        );
        await loadAdminData();
        await refreshBootstrap();
      }
    } catch {
      showToast('error', 'Failed to remove sample vehicles.');
    }
  };

  const handleRestoreSampleVehicles = async () => {
    try {
      const res = await authFetch('/api/admin/vehicles/restore-sample', {
        method: 'POST',
      });
      if (res.ok) {
        showToast('success', 'Restored demonstration sample vehicles.');
        await loadAdminData();
        await refreshBootstrap();
      }
    } catch {
      showToast('error', 'Failed to restore sample vehicles.');
    }
  };

  const handleUpdateInquiry = async (
    id: number,
    status: string,
    internalNotes: string
  ) => {
    try {
      const res = await authFetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, internalNotes }),
      });
      if (res.ok) {
        showToast('success', `Inquiry #${id} updated.`);
        await loadAdminData();
      }
    } catch {
      showToast('error', 'Failed to update inquiry.');
    }
  };

  const handleUpdateTestDrive = async (
    id: number,
    status: string,
    internalNotes: string
  ) => {
    try {
      const res = await authFetch(`/api/admin/test-drives/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, internalNotes }),
      });
      if (res.ok) {
        showToast('success', `Test-drive #${id} updated.`);
        await loadAdminData();
      }
    } catch {
      showToast('error', 'Failed to update test drive.');
    }
  };

  const exportInquiriesToCsv = () => {
    const headers = [
      'ID',
      'Date',
      'Customer Name',
      'Phone',
      'Email',
      'Type',
      'Vehicle',
      'Status',
      'Message',
      'Internal Notes',
    ];
    const rows = inquiries.map((i) => [
      i.id,
      new Date(i.createdAt).toISOString(),
      `"${(i.customerName || '').replace(/"/g, '""')}"`,
      `"${(i.phone || '').replace(/"/g, '""')}"`,
      `"${(i.email || '').replace(/"/g, '""')}"`,
      `"${i.inquiryType}"`,
      `"${(i.vehicleTitle || '').replace(/"/g, '""')}"`,
      i.status,
      `"${(i.message || '').replace(/"/g, '""')}"`,
      `"${(i.internalNotes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `dealership-inquiries-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      const res = await authFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        showToast(
          'success',
          'Dealership settings and website content saved to database.'
        );
        await loadAdminData();
        await refreshBootstrap();
      } else {
        showToast('error', 'Failed to save dealership settings.');
      }
    } catch {
      showToast('error', 'Error saving settings.');
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authFetch('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify(newService),
    });
    if (res.ok) {
      setNewService({
        title: '',
        description: '',
        details: '',
        isConfirmed: true,
        sortOrder: adminServices.length + 1,
      });
      showToast('success', 'Service saved.');
      await loadAdminData();
      await refreshBootstrap();
    }
  };

  const handleDeleteService = async (id: number) => {
    const res = await authFetch(`/api/admin/services/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      showToast('success', 'Service deleted.');
      await loadAdminData();
      await refreshBootstrap();
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authFetch('/api/admin/faqs', {
      method: 'POST',
      body: JSON.stringify(newFaq),
    });
    if (res.ok) {
      setNewFaq({
        category: 'General',
        question: '',
        answer: '',
        isPublished: true,
        sortOrder: adminFaqs.length + 1,
      });
      showToast('success', 'FAQ saved.');
      await loadAdminData();
      await refreshBootstrap();
    }
  };

  const handleDeleteFaq = async (id: number) => {
    const res = await authFetch(`/api/admin/faqs/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      showToast('success', 'FAQ deleted.');
      await loadAdminData();
      await refreshBootstrap();
    }
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authFetch('/api/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify(newTestimonial),
    });
    if (res.ok) {
      setNewTestimonial({
        customerName: '',
        roleOrLocation: 'Accra, Ghana',
        vehiclePurchased: '',
        content: '',
      });
      showToast('success', 'Verified customer testimonial added.');
      await loadAdminData();
      await refreshBootstrap();
    }
  };

  const handleDeleteTestimonial = async (id: number) => {
    const res = await authFetch(`/api/admin/testimonials/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      showToast('success', 'Testimonial removed.');
      await loadAdminData();
      await refreshBootstrap();
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center text-sm text-slate-600">
        Verifying administrator session...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-[#C89D54] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Dealer Administration Portal
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Protected administrative area. Sign in with your authorized Google
              account to manage vehicle inventory, GH₵ pricing, customer
              inquiries, and dealership content.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded-lg">
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            className="w-full py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Sign In with Google Authentication
          </button>

          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              ← Return to Public Dealership Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredAdminVehicles = adminVehicles.filter((v) => {
    const matchesSearch =
      !vehicleSearch.trim() ||
      `${v.year} ${v.make} ${v.model} ${v.trim}`
        .toLowerCase()
        .includes(vehicleSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (vehicleStatusFilter === 'All') return true;
    if (vehicleStatusFilter === 'Sample') return v.isSampleData;
    if (
      vehicleStatusFilter === 'Published' ||
      vehicleStatusFilter === 'Draft' ||
      vehicleStatusFilter === 'Unpublished'
    ) {
      return v.publicationStatus === vehicleStatusFilter;
    }
    return v.availabilityStatus === vehicleStatusFilter;
  });

  const filteredInquiries = inquiries.filter((i) => {
    const matchesSearch =
      !leadSearch.trim() ||
      `${i.customerName} ${i.phone} ${i.vehicleTitle} ${i.message}`
        .toLowerCase()
        .includes(leadSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (leadStatusFilter === 'All') return true;
    return i.status === leadStatusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 space-y-8">
      {/* Top Admin Header */}
      <div className="bg-[#0E1116] text-white rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="text-xs font-mono text-[#C89D54]">
            AUTHENTICATED DEALERSHIP ADMIN · {currentUser.email}
          </div>
          <h1 className="text-2xl font-bold font-display mt-1">
            {settingsForm?.businessName || 'WESTROAD'} — Management
            Console
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadAdminData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/15 text-white rounded-lg cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
          <button
            type="button"
            onClick={signOutAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-red-600/20 hover:bg-red-600/30 text-red-200 border border-red-500/30 rounded-lg cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {statusBanner && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
              : 'bg-red-50 text-red-950 border border-red-200'
          }`}
        >
          <span>{statusBanner.text}</span>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-slate-500 hover:text-slate-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSection('overview')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'overview'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Dashboard Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('vehicles')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'vehicles'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Vehicle Inventory ({adminVehicles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('inquiries')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'inquiries'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>
            Inquiries & Test Drives ({inquiries.length + testDrives.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('content')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'content'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Business Info, CMS & SEO</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('staff')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'staff'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Administrators ({staffList.length})</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: OVERVIEW                                                       */}
      {/* ===================================================================== */}
      {activeSection === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500">Total Vehicles</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
                {overviewStats?.totalVehicles ?? 0}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500">Available Stock</div>
              <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">
                {overviewStats?.availableVehicles ?? 0}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500">Sold Vehicles</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
                {overviewStats?.soldVehicles ?? 0}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500">Draft / Unpublished</div>
              <div className="text-2xl font-bold text-amber-700 font-mono mt-1">
                {overviewStats?.draftOrUnpublishedVehicles ?? 0}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500">New Inquiries</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
                {overviewStats?.newInquiries ?? 0}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500">Pending Test Drives</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
                {overviewStats?.pendingTestDrives ?? 0}
              </div>
            </div>
          </div>

          {/* Demonstration Sample Data Control Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Demonstration Sample Inventory Control
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                There are currently{' '}
                <strong className="font-mono text-slate-900">
                  {overviewStats?.sampleVehiclesCount ?? 0}
                </strong>{' '}
                clearly labeled demonstration sample vehicles in the database.
                You can remove all sample data in one click before launching
                with genuine dealership stock.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleClearSampleVehicles}
                className="px-4 py-2 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 rounded-lg cursor-pointer"
              >
                Remove All Sample Vehicles
              </button>
              <button
                type="button"
                onClick={handleRestoreSampleVehicles}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer"
              >
                Restore Sample Vehicles
              </button>
            </div>
          </div>

          {/* Recent Activity & Audit Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Latest Customer Inquiries
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveSection('inquiries')}
                  className="text-xs font-semibold text-[#9A7332] hover:underline cursor-pointer"
                >
                  Manage All →
                </button>
              </div>
              {inquiries.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">
                  No customer inquiries submitted yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {inquiries.slice(0, 5).map((inq) => (
                    <div
                      key={inq.id}
                      className="py-3 flex items-start justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">
                          {inq.customerName} ·{' '}
                          <span className="font-mono">{inq.phone}</span>
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          {inq.inquiryType}
                          {inq.vehicleTitle ? ` — ${inq.vehicleTitle}` : ''}
                        </div>
                      </div>
                      <span className="font-mono text-slate-500 shrink-0">
                        {inq.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 font-display">
                Administrative Audit Log
              </h2>
              {recentLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">
                  No administrative actions logged yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="py-2.5 text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                        <span>{log.action}</span>
                        <span>
                          {new Date(log.createdAt).toLocaleString('en-GH')}
                        </span>
                      </div>
                      <div className="text-slate-800">{log.details}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: VEHICLE & IMAGE MANAGEMENT                                     */}
      {/* ===================================================================== */}
      {activeSection === 'vehicles' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  placeholder="Filter by make, model, year..."
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <select
                value={vehicleStatusFilter}
                onChange={(e) => setVehicleStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
                <option value="Published">Published</option>
                <option value="Draft">Drafts</option>
                <option value="Unpublished">Unpublished</option>
                <option value="Sample">Sample Demo Data</option>
              </select>
            </div>

            <button
              type="button"
              onClick={openCreateVehicle}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Vehicle</span>
            </button>
          </div>

          {/* Vehicle Editor Modal / Panel */}
          {editingVehicle && (
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    {editingVehicle.id
                      ? `Edit Vehicle: ${editingVehicle.year} ${editingVehicle.make} ${editingVehicle.model}`
                      : 'Add New Vehicle to Inventory'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage technical specifications, GH₵ pricing, availability,
                    and multi-photo gallery.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>
                      {previewMode ? 'Back to Form Editor' : 'Preview Listing'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingVehicle(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {previewMode ? (
                <div className="bg-[#F8F8F7] border border-slate-200 rounded-xl p-6 space-y-4">
                  <div className="text-xs font-mono uppercase text-[#9A7332]">
                    Listing Preview Before Publication
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="aspect-[4/3] bg-[#14181F] rounded-xl overflow-hidden">
                      <VehicleImage
                        src={editingVehicle.images?.[0]?.imageUrl}
                        alt={editingVehicle.model || 'Preview'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs text-slate-500">
                        {editingVehicle.condition} ·{' '}
                        {editingVehicle.importStatus} ·{' '}
                        {editingVehicle.availabilityStatus}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 font-display">
                        {editingVehicle.year} {editingVehicle.make}{' '}
                        {editingVehicle.model} {editingVehicle.trim}
                      </h3>
                      <div className="text-xl font-bold font-mono text-slate-900">
                        {formatPriceGHS(
                          editingVehicle.discountPrice || editingVehicle.price
                        )}
                      </div>
                      <p className="text-sm text-slate-600 whitespace-pre-line">
                        {editingVehicle.description}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveVehicle} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Make / Manufacturer *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingVehicle.make}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            make: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Model *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingVehicle.model}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            model: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Trim / Edition
                      </label>
                      <input
                        type="text"
                        value={editingVehicle.trim}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            trim: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Manufacturing Year *
                      </label>
                      <input
                        type="number"
                        required
                        value={editingVehicle.year}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            year: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Asking Price (GH₵) *
                      </label>
                      <input
                        type="number"
                        required
                        value={editingVehicle.price}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            price: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Discount Price (GH₵, Optional)
                      </label>
                      <input
                        type="number"
                        value={editingVehicle.discountPrice}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            discountPrice: e.target.value,
                          })
                        }
                        placeholder="Leave empty if no discount"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Condition *
                      </label>
                      <select
                        value={editingVehicle.condition}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            condition: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="New">New</option>
                        <option value="Foreign Used">Foreign Used</option>
                        <option value="Ghana Used">Ghana Used</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Body Type *
                      </label>
                      <select
                        value={editingVehicle.bodyType}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            bodyType: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="SUV">SUV</option>
                        <option value="Sedan">Sedan</option>
                        <option value="Pickup">Pickup</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Luxury">Luxury</option>
                        <option value="Coupe">Coupe</option>
                        <option value="Van">Van</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Mileage *
                      </label>
                      <input
                        type="number"
                        required
                        value={editingVehicle.mileage}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            mileage: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Transmission *
                      </label>
                      <select
                        value={editingVehicle.transmission}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            transmission: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="CVT">CVT</option>
                        <option value="Dual-Clutch">Dual-Clutch</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Fuel Type *
                      </label>
                      <select
                        value={editingVehicle.fuelType}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            fuelType: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Electric">Electric</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Engine Capacity
                      </label>
                      <input
                        type="text"
                        value={editingVehicle.engineCapacity}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            engineCapacity: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Drivetrain
                      </label>
                      <select
                        value={editingVehicle.drivetrain}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            drivetrain: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="4WD / AWD">4WD / AWD</option>
                        <option value="FWD">FWD</option>
                        <option value="RWD">RWD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Exterior Colour
                      </label>
                      <input
                        type="text"
                        value={editingVehicle.exteriorColour}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            exteriorColour: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Interior Colour
                      </label>
                      <input
                        type="text"
                        value={editingVehicle.interiorColour}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            interiorColour: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Customs / Import Status
                      </label>
                      <select
                        value={editingVehicle.importStatus}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            importStatus: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Customs Duty Paid">
                          Customs Duty Paid
                        </option>
                        <option value="Registered in Ghana">
                          Registered in Ghana
                        </option>
                        <option value="In Transit / Pre-Order">
                          In Transit / Pre-Order
                        </option>
                        <option value="Unverified">Unverified</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Availability Status
                      </label>
                      <select
                        value={editingVehicle.availabilityStatus}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            availabilityStatus: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Available">Available</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Sold">Sold</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Publication Status
                      </label>
                      <select
                        value={editingVehicle.publicationStatus}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            publicationStatus: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                        <option value="Unpublished">Unpublished</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        VIN / Chassis Number
                      </label>
                      <input
                        type="text"
                        value={editingVehicle.vin}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            vin: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div className="flex flex-col justify-end space-y-2 pb-1">
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingVehicle.featuredStatus}
                          onChange={(e) =>
                            setEditingVehicle({
                              ...editingVehicle,
                              featuredStatus: e.target.checked,
                            })
                          }
                        />
                        <span>Feature on Homepage</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingVehicle.showVinPublicly}
                          onChange={(e) =>
                            setEditingVehicle({
                              ...editingVehicle,
                              showVinPublicly: e.target.checked,
                            })
                          }
                        />
                        <span>Display VIN Publicly</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Detailed Vehicle Description *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={editingVehicle.description}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Key Features (One per line)
                      </label>
                      <textarea
                        rows={4}
                        value={editingVehicle.featuresText}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            featuresText: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  {/* Multi-Photo Gallery Upload & Reordering */}
                  <div className="border-t border-slate-200 pt-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Vehicle Photographs & Gallery Order
                        </h3>
                        <p className="text-xs text-slate-500">
                          Upload images from your device (max 4MB each), select
                          a studio preset, or paste a verified image URL. First
                          image is the cover photo.
                        </p>
                      </div>

                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photos from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleDeviceImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Add by URL or Preset */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Quick Studio Render Preset
                        </label>
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) setNewImageUrl(e.target.value);
                          }}
                          className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="">-- Choose Studio Render --</option>
                          {STUDIO_PRESET_IMAGES.map((p) => (
                            <option key={p.url} value={p.url}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Image URL / Path
                        </label>
                        <input
                          type="text"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="/vehicles/suv-pearl-front.svg or https://..."
                          className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Alt Text
                        </label>
                        <input
                          type="text"
                          value={newImageAlt}
                          onChange={(e) => setNewImageAlt(e.target.value)}
                          placeholder="Front view"
                          className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          type="button"
                          onClick={handleAddUrlImage}
                          className="w-full py-2 px-3 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 cursor-pointer"
                        >
                          Add to Gallery
                        </button>
                      </div>
                    </div>

                    {/* Gallery Preview & Reorder Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                      {(editingVehicle.images || []).map(
                        (img: VehicleImageItem, idx: number) => (
                          <div
                            key={idx}
                            className="bg-white border border-slate-200 rounded-lg overflow-hidden p-2 space-y-2"
                          >
                            <div className="aspect-[4/3] bg-[#14181F] rounded overflow-hidden">
                              <VehicleImage
                                src={img.imageUrl}
                                alt={img.altText}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-[11px] text-slate-600 truncate">
                              #{idx + 1} {idx === 0 ? '(Primary)' : ''}
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveImageOrder(idx, -1)}
                                  className="p-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
                                  title="Move Left"
                                >
                                  <ArrowUp className="w-3 h-3 -rotate-90" />
                                </button>
                                <button
                                  type="button"
                                  disabled={
                                    idx === editingVehicle.images.length - 1
                                  }
                                  onClick={() => moveImageOrder(idx, 1)}
                                  className="p-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
                                  title="Move Right"
                                >
                                  <ArrowDown className="w-3 h-3 -rotate-90" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeImageAt(idx)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                title="Remove Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditingVehicle(null)}
                      className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer"
                    >
                      Save Vehicle Record
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Inventory Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-mono">
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Price (GH₵)</th>
                  <th className="py-3.5 px-4">Condition & Customs</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4">Publication</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAdminVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded bg-[#14181F] overflow-hidden shrink-0">
                          <VehicleImage
                            src={v.images?.[0]?.imageUrl}
                            alt={v.model}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {v.year} {v.make} {v.model} {v.trim}
                          </div>
                          <div className="text-slate-500 mt-0.5">
                            {v.bodyType} · {v.mileage.toLocaleString()}{' '}
                            {v.mileageUnit}
                            {v.featuredStatus ? ' · Featured' : ''}
                            {v.isSampleData ? ' · Sample Data' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 tabular-nums">
                      {formatPriceGHS(v.discountPrice || v.price)}
                      {v.discountPrice && (
                        <div className="text-[11px] text-slate-400 line-through">
                          {formatPriceGHS(v.price)}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{v.condition}</div>
                      <div className="text-slate-400">{v.importStatus}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {v.availabilityStatus}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {v.publicationStatus}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/vehicles/${v.slug}`}
                          className="p-1.5 text-slate-500 hover:text-slate-900"
                          title="View Public Listing"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditVehicle(v)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                          title="Edit Vehicle"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {deleteConfirmId === v.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleConfirmDeleteVehicle(v.id)}
                              className="px-2 py-1 bg-red-600 text-white rounded text-[11px] font-semibold cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(v.id)}
                            className="p-1.5 text-red-600 hover:text-red-800 cursor-pointer"
                            title="Delete Vehicle"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: CUSTOMER INQUIRIES & TEST DRIVES                               */}
      {/* ===================================================================== */}
      {activeSection === 'inquiries' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLeadSubTab('inquiries')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                  leadSubTab === 'inquiries'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Customer Inquiries ({inquiries.length})
              </button>
              <button
                type="button"
                onClick={() => setLeadSubTab('testdrives')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                  leadSubTab === 'testdrives'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Test-Drive Requests ({testDrives.length})
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                placeholder="Search customer, phone, vehicle..."
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
              {leadSubTab === 'inquiries' && (
                <>
                  <select
                    value={leadStatusFilter}
                    onChange={(e) => setLeadStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="All">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Converted">Converted</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <button
                    type="button"
                    onClick={exportInquiriesToCsv}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {leadSubTab === 'inquiries' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                {filteredInquiries.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No matching customer inquiries found.
                  </div>
                ) : (
                  filteredInquiries.map((inq) => (
                    <div
                      key={inq.id}
                      onClick={() => setSelectedInquiry(inq)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedInquiry?.id === inq.id
                          ? 'bg-slate-100'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">
                          {inq.customerName} ({inq.phone})
                        </span>
                        <span className="font-mono text-slate-600">
                          {inq.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#9A7332] font-medium mt-0.5">
                        {inq.inquiryType}
                        {inq.vehicleTitle ? ` · ${inq.vehicleTitle}` : ''}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {inq.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="lg:col-span-5">
                {selectedInquiry ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 font-display">
                          Inquiry #{selectedInquiry.id}:{' '}
                          {selectedInquiry.customerName}
                        </h3>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          Submitted:{' '}
                          {new Date(selectedInquiry.createdAt).toLocaleString(
                            'en-GH'
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedInquiry(null)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500">Phone:</span>{' '}
                        <strong className="font-mono">
                          {selectedInquiry.phone}
                        </strong>
                      </div>
                      {selectedInquiry.email && (
                        <div>
                          <span className="text-slate-500">Email:</span>{' '}
                          <strong className="font-mono">
                            {selectedInquiry.email}
                          </strong>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-500">Category:</span>{' '}
                        <strong>{selectedInquiry.inquiryType}</strong>
                      </div>
                      {selectedInquiry.vehicleTitle && (
                        <div>
                          <span className="text-slate-500">Vehicle:</span>{' '}
                          <strong>{selectedInquiry.vehicleTitle}</strong>
                        </div>
                      )}
                      {selectedInquiry.tradeInDetails && (
                        <div>
                          <span className="text-slate-500">
                            Sourcing / Trade-In Specs:
                          </span>{' '}
                          <strong>{selectedInquiry.tradeInDetails}</strong>
                        </div>
                      )}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-line">
                        {selectedInquiry.message}
                      </div>
                    </div>

                    {/* Direct Customer Reply Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                      >
                        Call Customer
                      </a>
                      {formatGhanaPhoneForWhatsApp(selectedInquiry.phone) && (
                        <a
                          href={`https://wa.me/${formatGhanaPhoneForWhatsApp(
                            selectedInquiry.phone
                          )}?text=${encodeURIComponent(
                            `Hello ${selectedInquiry.customerName}, thank you for your inquiry with ${
                              settingsForm?.businessName || 'our dealership'
                            } regarding ${
                              selectedInquiry.vehicleTitle || 'our vehicles'
                            }.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-[#15803D] text-white rounded-lg text-xs font-semibold"
                        >
                          Reply on WhatsApp
                        </a>
                      )}
                      {selectedInquiry.email && (
                        <a
                          href={`mailto:${selectedInquiry.email}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                        >
                          Send Email
                        </a>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Inquiry Status
                        </label>
                        <select
                          value={selectedInquiry.status}
                          onChange={(e) =>
                            setSelectedInquiry({
                              ...selectedInquiry,
                              status: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Converted">Converted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Internal Staff Notes (Private)
                        </label>
                        <textarea
                          rows={3}
                          value={selectedInquiry.internalNotes}
                          onChange={(e) =>
                            setSelectedInquiry({
                              ...selectedInquiry,
                              internalNotes: e.target.value,
                            })
                          }
                          placeholder="Add private follow-up notes..."
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateInquiry(
                            selectedInquiry.id,
                            selectedInquiry.status,
                            selectedInquiry.internalNotes
                          )
                        }
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Save Status & Notes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
                    Select an inquiry from the list to view details, contact the
                    customer, or update its status and internal notes.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                {testDrives.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No test-drive requests recorded yet.
                  </div>
                ) : (
                  testDrives.map((td) => (
                    <div
                      key={td.id}
                      onClick={() => setSelectedTestDrive(td)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedTestDrive?.id === td.id
                          ? 'bg-slate-100'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">
                          {td.customerName} ({td.phone})
                        </span>
                        <span className="font-mono text-slate-600">
                          {td.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#9A7332] font-medium mt-0.5">
                        Vehicle: {td.vehicleTitle}
                      </div>
                      <div className="text-xs font-mono text-slate-600 mt-1">
                        Requested Slot: {td.preferredDate} at {td.preferredTime}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="lg:col-span-5">
                {selectedTestDrive ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Test Drive #{selectedTestDrive.id}:{' '}
                      {selectedTestDrive.customerName}
                    </h3>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        Phone:{' '}
                        <strong className="font-mono">
                          {selectedTestDrive.phone}
                        </strong>
                      </div>
                      <div>
                        Vehicle: <strong>{selectedTestDrive.vehicleTitle}</strong>
                      </div>
                      <div>
                        Appointment:{' '}
                        <strong className="font-mono">
                          {selectedTestDrive.preferredDate} at{' '}
                          {selectedTestDrive.preferredTime}
                        </strong>
                      </div>
                      {selectedTestDrive.notes && (
                        <div className="p-3 bg-slate-50 rounded border border-slate-200 mt-2">
                          {selectedTestDrive.notes}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Appointment Status
                      </label>
                      <select
                        value={selectedTestDrive.status}
                        onChange={(e) =>
                          setSelectedTestDrive({
                            ...selectedTestDrive,
                            status: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Internal Notes
                      </label>
                      <textarea
                        rows={3}
                        value={selectedTestDrive.internalNotes}
                        onChange={(e) =>
                          setSelectedTestDrive({
                            ...selectedTestDrive,
                            internalNotes: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateTestDrive(
                          selectedTestDrive.id,
                          selectedTestDrive.status,
                          selectedTestDrive.internalNotes
                        )
                      }
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Save Test-Drive Update
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
                    Select a test-drive request to confirm or update its status.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: BUSINESS INFORMATION, CMS, SERVICES, FAQS & SEO                */}
      {/* ===================================================================== */}
      {activeSection === 'content' && settingsForm && (
        <div className="space-y-10">
          <form
            onSubmit={handleSaveSettings}
            className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">
                Dealership Business Information & Branding
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Replace the configurable placeholders below with your official
                Ghanaian dealership contact details. Changes update the live
                website immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={settingsForm.businessName}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      businessName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Business Location (City, Ghana)
                </label>
                <input
                  type="text"
                  value={settingsForm.location}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  WhatsApp Number (e.g. +233240000000)
                </label>
                <input
                  type="text"
                  value={settingsForm.whatsapp}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      whatsapp: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Business Email
                </label>
                <input
                  type="text"
                  value={settingsForm.email}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={settingsForm.openingHours}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      openingHours: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Website Domain
                </label>
                <input
                  type="text"
                  value={settingsForm.domain}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, domain: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Sold Vehicles Public Visibility Policy
                </label>
                <select
                  value={settingsForm.soldVehiclePolicy}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      soldVehiclePolicy: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="hide">
                    Hide Sold Vehicles from Public Inventory
                  </option>
                  <option value="show_labeled">
                    Show Sold Vehicles Clearly Labeled as Sold
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Homepage Hero Headline
                </label>
                <input
                  type="text"
                  value={settingsForm.heroHeadline}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      heroHeadline: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Verified Google Maps Embed URL (Optional)
                </label>
                <input
                  type="text"
                  value={settingsForm.googleMapsEmbedUrl}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      googleMapsEmbedUrl: e.target.value,
                    })
                  }
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Homepage Hero Description
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.heroDescription}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      heroDescription: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  About Us: Dealership Background
                </label>
                <textarea
                  rows={4}
                  value={settingsForm.aboutBackground}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      aboutBackground: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  About Us: Mission & Values
                </label>
                <textarea
                  rows={4}
                  value={settingsForm.aboutMission}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      aboutMission: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  About Us: Customer Service Approach
                </label>
                <textarea
                  rows={4}
                  value={settingsForm.aboutCustomerApproach}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      aboutCustomerApproach: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* SEO & Financing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Default SEO Page Title
                </label>
                <input
                  type="text"
                  value={settingsForm.seoTitle}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      seoTitle: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Default SEO Meta Description
                </label>
                <input
                  type="text"
                  value={settingsForm.seoDescription}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      seoDescription: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save All Business & Website Settings</span>
              </button>
            </div>
          </form>

          {/* Services & FAQs Manager */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Services Manager */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Manage Dealership Services ({adminServices.length})
              </h3>
              <form
                onSubmit={handleAddService}
                className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200"
              >
                <input
                  type="text"
                  required
                  placeholder="Service Title (e.g. Vehicle Inspection Arrangements)"
                  value={newService.title}
                  onChange={(e) =>
                    setNewService({ ...newService, title: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Short Summary"
                  value={newService.description}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                />
                <textarea
                  rows={2}
                  placeholder="Detailed Service Notes"
                  value={newService.details}
                  onChange={(e) =>
                    setNewService({ ...newService, details: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Add Confirmed Service
                </button>
              </form>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {adminServices.map((s) => (
                  <div
                    key={s.id}
                    className="py-3 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {s.title}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {s.description}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(s.id)}
                      className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs Manager */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Manage Frequently Asked Questions ({adminFaqs.length})
              </h3>
              <form
                onSubmit={handleAddFaq}
                className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200"
              >
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Category (e.g. Payments)"
                    value={newFaq.category}
                    onChange={(e) =>
                      setNewFaq({ ...newFaq, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Question *"
                    value={newFaq.question}
                    onChange={(e) =>
                      setNewFaq({ ...newFaq, question: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="Answer *"
                  value={newFaq.answer}
                  onChange={(e) =>
                    setNewFaq({ ...newFaq, answer: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Add FAQ Entry
                </button>
              </form>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {adminFaqs.map((f) => (
                  <div
                    key={f.id}
                    className="py-3 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        [{f.category}] {f.question}
                      </div>
                      <div className="text-slate-500 mt-0.5 line-clamp-2">
                        {f.answer}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(f.id)}
                      className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Genuine Customer Testimonials Manager */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Verified Customer Testimonials ({adminTestimonials.length})
              </h3>
              <p className="text-xs text-slate-500">
                Testimonials are hidden on the public homepage unless genuine
                customer reviews are added here.
              </p>
            </div>
            <form
              onSubmit={handleAddTestimonial}
              className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200"
            >
              <input
                type="text"
                required
                placeholder="Customer Full Name *"
                value={newTestimonial.customerName}
                onChange={(e) =>
                  setNewTestimonial({
                    ...newTestimonial,
                    customerName: e.target.value,
                  })
                }
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              />
              <input
                type="text"
                required
                placeholder="City / Role (e.g. East Legon, Accra)"
                value={newTestimonial.roleOrLocation}
                onChange={(e) =>
                  setNewTestimonial({
                    ...newTestimonial,
                    roleOrLocation: e.target.value,
                  })
                }
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              />
              <input
                type="text"
                placeholder="Vehicle Purchased (e.g. 2022 Toyota Hilux)"
                value={newTestimonial.vehiclePurchased}
                onChange={(e) =>
                  setNewTestimonial({
                    ...newTestimonial,
                    vehiclePurchased: e.target.value,
                  })
                }
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Publish Verified Testimonial
              </button>
              <textarea
                rows={2}
                required
                placeholder="Genuine customer feedback statement *"
                value={newTestimonial.content}
                onChange={(e) =>
                  setNewTestimonial({
                    ...newTestimonial,
                    content: e.target.value,
                  })
                }
                className="md:col-span-4 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </form>

            {adminTestimonials.length > 0 && (
              <div className="divide-y divide-slate-100">
                {adminTestimonials.map((t) => (
                  <div
                    key={t.id}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong>{t.customerName}</strong> ({t.roleOrLocation}) — “
                      {t.content}”
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteTestimonial(t.id)}
                      className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: ADMINISTRATORS & STAFF ROLES                                   */}
      {/* ===================================================================== */}
      {activeSection === 'staff' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Authorized Dealership Administrators
            </h2>
            <p className="text-xs text-slate-500">
              Users are authenticated via Firebase Authentication and linked to
              PostgreSQL by UID.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-mono">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Firebase UID</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {staffList.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {u.name}
                    </td>
                    <td className="py-3 px-4 font-mono">{u.email}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {u.uid}
                    </td>
                    <td className="py-3 px-4 font-semibold uppercase">
                      {u.role}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">
                      {u.accountStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
