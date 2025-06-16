/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../index.css"; // Import CSS file for styling
import logo from '../../images/logo/logo.png'; // Import logo image
import bgImage from '../../images/logo/pnMkw.jpeg';
import { Helmet } from 'react-helmet';

const API_URL = import.meta.env.VITE_API_URL;



function SignIn() {
  const [namaPegawai, setNamaPegawai] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  setError(''); // Reset error

  // Menambahkan log untuk memeriksa nilai API_URL
  console.log("API URL:", API_URL);

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Nama_Pegawai: namaPegawai, PIN: pin }),
    });

    const data = await response.json();

    if (response.ok) {
      // Simpan token, role, username, dan ID Pegawai ke localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);
      localStorage.setItem('ID_Pegawai', data.ID_Pegawai); // Simpan ID Pegawai

      if (data.role === 'pegawai') {
        navigate('/scan-qrcode'); // Arahkan pegawai ke halaman scan QR
      } else if (data.role === 'admin') {
        navigate('/dashboard'); // Arahkan admin ke halaman dashboard
      } else if (data.role === 'super_admin') {
        navigate('/super-admin'); // Arahkan super admin ke halaman super admin
      } else {
        alert('Role tidak dikenali. Hubungi admin.');
      }
    } else {
      setError(data.message || 'Login gagal, silakan coba lagi.');
    }
  } catch (err) {
    setError('Server error, silakan coba lagi nanti.');
  }
};

  

  return (
    
<div
  className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
  style={{ backgroundImage: `url(${bgImage})` }}
>

<Helmet>
  <title>Sistem Pengambilan Barang QR - Pengadilan Negeri Manokwari</title>
  <meta name="description" content="Aplikasi resmi Pengadilan Negeri Manokwari untuk pengambilan barang berbasis QR Code. Sistem ini digunakan oleh pegawai melalui proses login yang aman." />
  <meta name="robots" content="index, follow" />
</Helmet>
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8">
        <div className="text-center mb-6">
          <img
            src={logo}
            alt="Logo"
            className="mx-auto w-24 h-24 rounded-full border-4 border-white shadow-md"
          />
  <h2 className="mt-4 text-xl font-bold text-gray-800 dark:text-white">
  Sistem Pengambilan Barang Menggunakan QR - Pengadilan Negeri Manokwari
   </h2>
   <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 text-center">
  Sistem ini ditujukan bagi pegawai Pengadilan Negeri Manokwari untuk melakukan pengambilan barang secara cepat dan terverifikasi menggunakan QR Code.
   </p>


          {/* <p className="text-sm text-gray-600 dark:text-gray-300">
            Masuk untuk melanjutkan
          </p> */}
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">
              Nama Pegawai
            </label>
            <input
              type="text"
              value={namaPegawai}
              onChange={(e) => setNamaPegawai(e.target.value)}
              placeholder="Masukkan nama pegawai"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">
              PIN
            </label>
            <div className="relative">
   <input
  type={showPassword ? 'text' : 'password'}
  value={pin}
  onChange={(e) => {
    const value = e.target.value;
    // Hanya izinkan angka dan maksimal 6 digit
    if (/^\d{0,6}$/.test(value)) {
      setPin(value);
    }
  }}
  inputMode="numeric"       // 👈 Menampilkan keyboard angka
  pattern="\d*"             // 👈 Memberi tahu browser bahwa hanya angka yang diizinkan
  placeholder="Masukkan PIN"
  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
  required
/>


              <div
                className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer text-gray-500 dark:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-200 font-semibold"
          >
            Masuk
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Pengadilan Negeri Manokwari
        </div>
      </div>
    </div>
  );
}

export default SignIn;
