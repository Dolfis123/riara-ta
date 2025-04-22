import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import DefaultLayout from './layout/DefaultLayout';

import SingIn from './pages/Authentication/SingIn';
import Pegawai from './pages/Dashboard/Pegawai';
import Barang from './pages/Dashboard/Barang';
import ProtectedRoute from './pages/ProtectedRoute';
import ScanQRCode from './pages/Dashboard/ScanQRCode';
import RiwayatPengambilan from './pages/Dashboard/RiwayatPengambilan';
import BarangSearch from './pages/Dashboard/BarangSearch';
import SuperAdmin from './pages/Dashboard/SuperAdmin';

function App() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <PageTitle title="Login" />
            <SingIn />
          </>
        }
      />

      
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute>
           
              <PageTitle title="Barang Dashboard | TailAdmin" />
              <SuperAdmin />
            
          </ProtectedRoute>
        }
      />
      <Route
        path="/scan-qrcode"
        element={
          <ProtectedRoute>
           
              <PageTitle title="Barang Dashboard | TailAdmin" />
              <ScanQRCode />
            
          </ProtectedRoute>
        }
      />
      <Route
        path="/stok-barang"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Barang Dashboard | TailAdmin" />
              <Barang />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/riwayat-pengambilan"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Barang Dashboard | TailAdmin" />
              <RiwayatPengambilan />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/data-pegawai"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Pegawai Dashboard | TailAdmin" />
              <Pegawai />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />

      {/* Tambahkan rute lain jika ada */}
    </Routes>
  );
}

export default App;
