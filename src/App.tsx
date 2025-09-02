import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import LoyaltyCard from './pages/LoyaltyCard';
import Discounts from './pages/Discounts';
import ProductList from './pages/ProductList';
import QRPrinting from './pages/QRPrinting';
import Offers from './pages/Offers';
import DisplayScreen from './pages/DisplayScreen';
import SuperAdmin from './pages/SuperAdmin';
import Login from './pages/Login';
import Register from './pages/Register';
import { useSelector } from 'react-redux';
import { RootState } from './store';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const token = useSelector((state: RootState) => state.auth.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <Routes>
          {/* Public Landing (no dashboard layout) */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Dashboard routes wrapped with Layout */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/loyalty-card" element={<ProtectedRoute><Layout><LoyaltyCard /></Layout></ProtectedRoute>} />
          <Route path="/discounts" element={<ProtectedRoute><Layout><Discounts /></Layout></ProtectedRoute>} />
          <Route path="/product-list" element={<ProtectedRoute><Layout><ProductList /></Layout></ProtectedRoute>} />
          <Route path="/qr-printing" element={<ProtectedRoute><Layout><QRPrinting /></Layout></ProtectedRoute>} />
          <Route path="/offers" element={<ProtectedRoute><Layout><Offers /></Layout></ProtectedRoute>} />
          {/* Public display screen (no admin layout) */}
          <Route path="/display-screen" element={<DisplayScreen />} />
          {/* Admin display screen (with layout) */}
          <Route path="/admin/display-screen" element={<ProtectedRoute><Layout><DisplayScreen /></Layout></ProtectedRoute>} />
          <Route path="/super-admin" element={<ProtectedRoute><Layout><SuperAdmin /></Layout></ProtectedRoute>} />
        </Routes>
      </Router>
    </I18nextProvider>
  );
}

export default App;