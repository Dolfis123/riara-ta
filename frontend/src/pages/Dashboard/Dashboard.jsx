import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [roleCounts, setRoleCounts] = useState({ totalPegawai: 0, totalAdmin: 0 });
  const [transaksiCounts, setTransaksiCounts] = useState({
    hari_ini: 0,
    bulan_ini: 0,
    tahun_ini: 0,
    range_custom: null
  });

  const [customDate, setCustomDate] = useState({ startDate: '', endDate: '' });

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch pegawai/admin count
      const pegawaiRes = await axios.get(`${API_URL}/pegawai/count-by-role`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoleCounts(pegawaiRes.data);

      // Fetch transaksi count
      const transaksiRes = await axios.get(`${API_URL}/pengambilan/statistik`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransaksiCounts(transaksiRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCustomRange = async () => {
    try {
      const token = localStorage.getItem("token");
      const { startDate, endDate } = customDate;
      if (!startDate || !endDate) return;

      const response = await axios.get(`${API_URL}/pengambilan/statistik`, {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransaksiCounts(prev => ({
        ...prev,
        range_custom: response.data.range_custom
      }));
    } catch (error) {
      console.error("Error fetching custom range data:", error);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

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

      {/* Custom Range Transaksi */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xl col-span-1 md:col-span-2 xl:col-span-1">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Transaksi Berdasarkan Waktu</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="date"
            value={customDate.startDate}
            onChange={(e) => setCustomDate(prev => ({ ...prev, startDate: e.target.value }))}
            className="border p-2 rounded w-full"
          />
          <input
            type="date"
            value={customDate.endDate}
            onChange={(e) => setCustomDate(prev => ({ ...prev, endDate: e.target.value }))}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={fetchCustomRange}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Cek
          </button>
        </div>
        {transaksiCounts.range_custom !== null && (
          <p className="mt-4 text-gray-700">
            Total Transaksi: <span className="font-bold">{transaksiCounts.range_custom}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
