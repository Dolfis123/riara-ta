import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [roleCounts, setRoleCounts] = useState({ totalPegawai: 0, totalAdmin: 0 });
  const [transaksiCounts, setTransaksiCounts] = useState({
    hari_ini: 0,
    bulan_ini: 0,
    tahun_ini: 0
  });

  const [selectedDate, setSelectedDate] = useState('');
  const [transaksiByDate, setTransaksiByDate] = useState({
    hari: null,
    bulan: null,
    tahun: null
  });

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch jumlah pegawai dan admin
      const pegawaiRes = await axios.get(`${API_URL}/pegawai/count-by-role`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoleCounts(pegawaiRes.data);

      // Fetch jumlah transaksi hari/bulan/tahun ini
      const transaksiRes = await axios.get(`${API_URL}/riwayat/pengambilan/statistik`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransaksiCounts(transaksiRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchTransaksiByTanggal = async () => {
    if (!selectedDate) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/riwayat/pengambilan/statistik/by-date`, {
        params: { tanggal: selectedDate },
        headers: { Authorization: `Bearer ${token}` }
      });

      setTransaksiByDate(res.data);
    } catch (error) {
      console.error("Error fetching transaksi by tanggal:", error);
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

      {/* Card Pegawai */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Jumlah Pegawai</h2>
          <p className="text-4xl font-bold mt-2">{roleCounts.totalPegawai}</p>
        </div>
        <div className="text-5xl opacity-30">👥</div>
      </div>

      {/* Card Admin */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Jumlah Admin</h2>
          <p className="text-4xl font-bold mt-2">{roleCounts.totalAdmin}</p>
        </div>
        <div className="text-5xl opacity-30">🛠️</div>
      </div>

      {/* Transaksi Hari Ini */}
      <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Transaksi Hari Ini</h2>
          <p className="text-4xl font-bold mt-2">{transaksiCounts.hari_ini}</p>
        </div>
        <div className="text-5xl opacity-30">📅</div>
      </div>

      {/* Transaksi Bulan Ini */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Transaksi Bulan Ini</h2>
          <p className="text-4xl font-bold mt-2">{transaksiCounts.bulan_ini}</p>
        </div>
        <div className="text-5xl opacity-30">🗓️</div>
      </div>

      {/* Transaksi Tahun Ini */}
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Transaksi Tahun Ini</h2>
          <p className="text-4xl font-bold mt-2">{transaksiCounts.tahun_ini}</p>
        </div>
        <div className="text-5xl opacity-30">📆</div>
      </div>

      {/* Input Pilih Tanggal */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xl col-span-1 md:col-span-2">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Pilih Tanggal Untuk Melihat Transaksi</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border p-2 rounded w-full md:w-1/3"
          />
          <button
            onClick={fetchTransaksiByTanggal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tampilkan
          </button>
        </div>
      </div>

      {/* Hasil dari tanggal terpilih */}
      {transaksiByDate.hari !== null && (
        <>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Transaksi Pada Hari Itu</h2>
              <p className="text-4xl font-bold mt-2">{transaksiByDate.hari}</p>
            </div>
            <div className="text-5xl opacity-30">📆</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Transaksi Bulan Itu</h2>
              <p className="text-4xl font-bold mt-2">{transaksiByDate.bulan}</p>
            </div>
            <div className="text-5xl opacity-30">📅</div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Transaksi Tahun Itu</h2>
              <p className="text-4xl font-bold mt-2">{transaksiByDate.tahun}</p>
            </div>
            <div className="text-5xl opacity-30">🗓️</div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
