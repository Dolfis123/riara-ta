import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [roleCounts, setRoleCounts] = useState({ totalPegawai: 0, totalAdmin: 0 });
  const [statistik, setStatistik] = useState({ hariIni: 0, bulanIni: 0, tahunIni: 0 });
  const [periode, setPeriode] = useState('default'); // opsi: default, hari, bulan, tahun

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/pegawai/count-by-role`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoleCounts(response.data);
      } catch (error) {
        console.error("Error fetching role counts:", error);
      }
    };

    const fetchStatistik = async () => {
      try {
        // Fetching statistic data from the API to get the count of 'Barang Diambil'
        const response = await axios.get(`${API_URL}/pengambilan/statistik`);
        setStatistik(response.data);
      } catch (error) {
        console.error("Error fetching statistik pengambilan:", error);
      }
    };

    fetchCounts();
    fetchStatistik();
  }, []);

  // Function to determine value based on selected period
  const getStatistikValue = () => {
    if (periode === 'hari') return { label: 'Hari Ini', value: statistik.hariIni };
    if (periode === 'bulan') return { label: 'Bulan Ini', value: statistik.bulanIni };
    if (periode === 'tahun') return { label: 'Tahun Ini', value: statistik.tahunIni };
    // Default: show all
    return [
      { label: 'Hari Ini', value: statistik.hariIni },
      { label: 'Bulan Ini', value: statistik.bulanIni },
      { label: 'Tahun Ini', value: statistik.tahunIni }
    ];
  };

  const statistikToRender = getStatistikValue();

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Card Pegawai */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between col-span-1">
        <div>
          <h2 className="text-xl font-semibold">Jumlah Pegawai</h2>
          <p className="text-4xl font-bold mt-2">{roleCounts.totalPegawai}</p>
        </div>
        <div className="text-5xl opacity-30">
          👥
        </div>
      </div>

      {/* Card Admin */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between col-span-1">
        <div>
          <h2 className="text-xl font-semibold">Jumlah Admin</h2>
          <p className="text-4xl font-bold mt-2">{roleCounts.totalAdmin}</p>
        </div>
        <div className="text-5xl opacity-30">
          🛠️
        </div>
      </div>

      {/* Dropdown Pilih Periode */}
      <div className="col-span-full">
        <label className="block text-sm font-medium mb-1 text-gray-700">Pilih Periode</label>
        <select
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          className="w-full sm:w-64 border-gray-300 rounded-lg p-2 shadow-sm"
        >
          <option value="default">Tampilkan Semua</option>
          <option value="hari">Hanya Hari Ini</option>
          <option value="bulan">Hanya Bulan Ini</option>
          <option value="tahun">Hanya Tahun Ini</option>
        </select>
      </div>

      {/* Card Statistik Barang Diambil */}
      {Array.isArray(statistikToRender)
        ? statistikToRender.map((item, index) => (
            <div key={index} className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Barang Diambil ({item.label})</h2>
                <p className="text-4xl font-bold mt-2">{item.value}</p>
              </div>
              <div className="text-5xl opacity-30">📦</div>
            </div>
          ))
        : (
          <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between col-span-1">
            <div>
              <h2 className="text-xl font-semibold">Barang Diambil ({statistikToRender.label})</h2>
              <p className="text-4xl font-bold mt-2">{statistikToRender.value}</p>
            </div>
            <div className="text-5xl opacity-30">📦</div>
          </div>
        )}
    </div>
  );
}

export default Dashboard;
