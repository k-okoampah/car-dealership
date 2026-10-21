import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import {
  DealershipSettings,
  FaqItem,
  ServiceItem,
  TestimonialItem,
} from '../types';

interface WhatsAppModalState {
  isOpen: boolean;
  message: string;
  vehicleTitle?: string;
  vehicleId?: number | null;
}

interface SiteContextValue {
  settings: DealershipSettings | null;
  services: ServiceItem[];
  faqs: FaqItem[];
  testimonials: TestimonialItem[];
  filterMeta: {
    makes: string[];
    bodyTypes: string[];
    years: number[];
    totalPublishedCount: number;
  };
  loadingBootstrap: boolean;
  refreshBootstrap: () => Promise<void>;
  // Firebase Auth
  currentUser: User | null;
  authLoading: boolean;
  signInAdmin: () => Promise<void>;
  signOutAdmin: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  // WhatsApp & Formatting
  formatPriceGHS: (amount: number | null | undefined) => string;
  openWhatsAppInquiry: (
    prefilledMessage: string,
    vehicleTitle?: string,
    vehicleId?: number | null
  ) => void;
  whatsAppModal: WhatsAppModalState;
  closeWhatsAppModal: () => void;
  getFormattedWhatsAppUrl: (message: string) => string | null;
  updatePageSeo: (title: string, description?: string) => void;
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

export function formatGhanaPhoneForWhatsApp(raw: string): string | null {
  if (!raw || raw.includes('[') || raw.includes(']')) {
    return null;
  }
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits || digits.length < 9) {
    return null;
  }
  if (digits.startsWith('233')) {
    return digits;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return '233' + digits.slice(1);
  }
  return digits;
}

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<DealershipSettings | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [filterMeta, setFilterMeta] = useState({
    makes: [] as string[],
    bodyTypes: [] as string[],
    years: [] as number[],
    totalPublishedCount: 0,
  });
  const [loadingBootstrap, setLoadingBootstrap] = useState(true);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [whatsAppModal, setWhatsAppModal] = useState<WhatsAppModalState>({
    isOpen: false,
    message: '',
  });

  const refreshBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/public/bootstrap');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setServices(data.services || []);
        setFaqs(data.faqs || []);
        setTestimonials(data.testimonials || []);
        if (data.filterMeta) {
          setFilterMeta(data.filterMeta);
        }
      }
    } catch (err) {
      console.error('Failed to load bootstrap data:', err);
    } finally {
      setLoadingBootstrap(false);
    }
  }, []);

  useEffect(() => {
    refreshBootstrap();
  }, [refreshBootstrap]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInAdmin = async () => {
    await signInWithPopup(auth, googleAuthProvider);
  };

  const signOutAdmin = async () => {
    await signOut(auth);
  };

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Authentication required. Please sign in.');
      }
      const token = await user.getIdToken();
      const headers = new Headers(options.headers || {});
      headers.set('Authorization', `Bearer ${token}`);
      if (
        options.body &&
        typeof options.body === 'string' &&
        !headers.has('Content-Type')
      ) {
        headers.set('Content-Type', 'application/json');
      }
      return fetch(url, {
        ...options,
        headers,
      });
    },
    []
  );

  const formatPriceGHS = useCallback(
    (amount: number | null | undefined) => {
      if (amount === null || amount === undefined || Number.isNaN(amount)) {
        return 'Price on Request';
      }
      const symbol = settings?.currency || 'GH₵';
      return `${symbol} ${Number(amount).toLocaleString('en-GH')}`;
    },
    [settings?.currency]
  );

  const getFormattedWhatsAppUrl = useCallback(
    (message: string) => {
      const cleanNumber = formatGhanaPhoneForWhatsApp(settings?.whatsapp || '');
      const encoded = encodeURIComponent(message);
      if (cleanNumber) {
        return `https://wa.me/${cleanNumber}?text=${encoded}`;
      }
      return null;
    },
    [settings?.whatsapp]
  );

  const openWhatsAppInquiry = useCallback(
    (
      prefilledMessage: string,
      vehicleTitle?: string,
      vehicleId?: number | null
    ) => {
      setWhatsAppModal({
        isOpen: true,
        message: prefilledMessage,
        vehicleTitle,
        vehicleId,
      });
    },
    []
  );

  const closeWhatsAppModal = useCallback(() => {
    setWhatsAppModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const updatePageSeo = useCallback(
    (title: string, description?: string) => {
      const brand = settings?.businessName || 'WESTROAD';
      const fullTitle = title.includes(brand) ? title : `${title} | ${brand}`;
      document.title = fullTitle;

      const desc =
        description ||
        settings?.seoDescription ||
        'Browse verified new and foreign-used vehicles in Ghana priced in GH₵.';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', desc);
      }
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', fullTitle);
      }
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute('content', desc);
      }
    },
    [settings?.businessName, settings?.seoDescription]
  );

  return (
    <SiteContext.Provider
      value={{
        settings,
        services,
        faqs,
        testimonials,
        filterMeta,
        loadingBootstrap,
        refreshBootstrap,
        currentUser,
        authLoading,
        signInAdmin,
        signOutAdmin,
        authFetch,
        formatPriceGHS,
        openWhatsAppInquiry,
        whatsAppModal,
        closeWhatsAppModal,
        getFormattedWhatsAppUrl,
        updatePageSeo,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error('useSite must be used inside SiteProvider');
  }
  return ctx;
}
