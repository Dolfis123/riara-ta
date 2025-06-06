import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [roleCounts, setRoleCounts] = useState({ totalPegawai: 0, totalAdmin: 0 });

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

    fetchCounts();
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Card Pegawai */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Jumlah Pegawai</h2>
          <p className="text-4xl font-bold mt-2">{roleCounts.totalPegawai}</p>
        </div>
        <div className="text-5xl opacity-30">
          👥
        </div>
      </div>

      {/* Card Admin */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Jumlah Admin</h2>
          <p className="text-4xl font-bold mt-2">{roleCounts.totalAdmin}</p>
        </div>
        <div className="text-5xl opacity-30">
          🛠️
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
