import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { InventoryPage } from './pages/InventoryPage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage, LegalPage, NotFoundPage } from './pages/FaqPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <SiteProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/vehicles/:slug" element={<VehicleDetailPage />} />
            <Route path="/inventory/:slug" element={<VehicleDetailPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/privacy" element={<LegalPage mode="privacy" />} />
            <Route path="/terms" element={<LegalPage mode="terms" />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SiteProvider>
  );
}
