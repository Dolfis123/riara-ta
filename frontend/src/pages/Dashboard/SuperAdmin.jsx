import React, { useState, useEffect } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

// --- KOMPONEN IKON (SVG) AGAR TIDAK PERLU INSTALL LIBRARY TAMBAHAN ---
const Icons = {
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  ShieldCheck: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
  ),
  Logout: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
  )
};

const SuperAdmin = () => {
  const [pegawaiList, setPegawaiList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [pegawaiToDelete, setPegawaiToDelete] = useState(null);
  const [currentPegawai, setCurrentPegawai] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Sedikit dikurangi agar tabel tidak terlalu panjang
  const [confirmPIN, setConfirmPIN] = useState("");
  const [pinError, setPinError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    Nama_Pegawai: "",
    Jabatan: "",
    PIN: "",
    Role: "pegawai",
  });

  // --- STATISTIK DINAMIS ---
  const stats = {
      total: pegawaiList.length,
      admin: pegawaiList.filter(p => p.Role === 'admin' || p.Role === 'super_admin').length,
      staff: pegawaiList.filter(p => p.Role === 'pegawai').length
  };

  useEffect(() => {
    const fetchPegawai = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/auth`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPegawaiList(response.data);
      } catch (error) {
        console.error("Error fetching pegawai", error);
      }
    };
    fetchPegawai();
  }, []);

  const filteredPegawai = pegawaiList.filter((pegawai) =>
    pegawai.Nama_Pegawai.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPegawai.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPegawai.length / itemsPerPage);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentPegawai(null);
    setFormData({ Nama_Pegawai: "", Jabatan: "", PIN: "", Role: "pegawai" });
    setIsModalOpen(true);
  };

  const handleEditClick = (pegawai) => {
    setIsEditing(true);
    setCurrentPegawai(pegawai);
    setFormData({
      Nama_Pegawai: pegawai.Nama_Pegawai,
      Jabatan: pegawai.Jabatan,
      PIN: "",
      Role: pegawai.Role,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (pegawai) => {
    setPegawaiToDelete(pegawai);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/pegawai/${pegawaiToDelete.ID_Pegawai}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPegawaiList(pegawaiList.filter((p) => p.ID_Pegawai !== pegawaiToDelete.ID_Pegawai));
      setSuccessMessage("Pegawai berhasil dihapus.");
      setTimeout(() => setSuccessMessage(""), 5000);
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting", error);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(formData.PIN)) {
      setPinError("PIN harus 4-6 digit angka.");
      return;
    }
    if (formData.PIN !== confirmPIN) {
      setPinError("Konfirmasi PIN tidak cocok.");
      return;
    }
    setPinError("");

    try {
      const token = localStorage.getItem("token");
      const payload = { ...formData };

      if (isEditing) {
        await axios.put(`${API_URL}/pegawai/${currentPegawai.ID_Pegawai}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage("Data berhasil diperbarui.");
      } else {
        await axios.post(`${API_URL}/auth/register`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage("Pegawai baru berhasil ditambahkan.");
      }

      const response = await axios.get(`${API_URL}/pegawai/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPegawaiList(response.data);
      handleModalClose();
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({ Nama_Pegawai: "", Jabatan: "", PIN: "", Role: "pegawai" });
    setConfirmPIN("");
    setPinError("");
  };

  const handleLogout = () => {
    if (window.confirm("Keluar dari aplikasi?")) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  // Helper untuk warna badge role
  const getRoleBadgeColor = (role) => {
      switch(role) {
          case 'super_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
          case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
          default: return 'bg-green-100 text-green-800 border-green-200';
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      
      {/* --- HEADER / NAVBAR --- */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-gray-800">Super Admin<span className="text-blue-600">Panel</span></h1>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors font-medium text-sm">
                  <Icons.Logout />
                  <span>Logout</span>
              </button>
          </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* --- STATISTIK CARDS (Dashboard Feel) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-50 rounded-full"><Icons.Users /></div>
                <div>
                    <p className="text-sm text-gray-500">Total Pegawai</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-purple-50 rounded-full"><Icons.ShieldCheck /></div>
                <div>
                    <p className="text-sm text-gray-500">Admin & Super Admin</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.admin}</p>
                </div>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-50 rounded-full">
                    <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Staff Aktif</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.staff}</p>
                </div>
            </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Toolbar: Search & Add Button */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Icons.Search />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari pegawai..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                </div>
                <button
                    onClick={handleAddClick}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md shadow-blue-200"
                >
                    <Icons.Plus />
                    Tambah Pegawai
                </button>
            </div>

            {/* Notification */}
            {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 m-6 mb-0 rounded-r shadow-sm flex justify-between items-center animate-fade-in-down">
                    <p>{successMessage}</p>
                    <button onClick={() => setSuccessMessage("")} className="text-green-500 hover:text-green-700">&times;</button>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Pegawai</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jabatan</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">
                                    Tidak ada data yang ditemukan.
                                </td>
                            </tr>
                        ) : (
                            currentItems.map((pegawai, index) => (
                                <tr key={pegawai.ID_Pegawai} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {indexOfFirstItem + index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                                                {pegawai.Nama_Pegawai.substring(0, 2)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{pegawai.Nama_Pegawai}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {pegawai.Jabatan}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRoleBadgeColor(pegawai.Role)}`}>
                                            {pegawai.Role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                        <button onClick={() => handleEditClick(pegawai)} className="text-indigo-600 hover:text-indigo-900 mx-2 p-1 hover:bg-indigo-50 rounded transition-colors" title="Edit">
                                            <Icons.Edit />
                                        </button>
                                        <button onClick={() => handleDeleteClick(pegawai)} className="text-red-600 hover:text-red-900 mx-2 p-1 hover:bg-red-50 rounded transition-colors" title="Hapus">
                                            <Icons.Trash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <span className="text-sm text-gray-700">
                    Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> - <span className="font-medium">{Math.min(indexOfLastItem, filteredPegawai.length)}</span> dari <span className="font-medium">{filteredPegawai.length}</span> data
                </span>
                <div className="flex gap-2">
                    <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Previous
                    </button>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Next
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden backdrop-blur-sm bg-black/40 transition-all p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all scale-100">
            <div className="flex items-start justify-between p-5 border-b border-gray-100 rounded-t">
              <h3 className="text-xl font-bold text-gray-900">
                {isEditing ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}
              </h3>
              <button onClick={handleModalClose} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center transition-colors">
                 <span className="text-xl">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Nama Lengkap</label>
                        <input type="text" name="Nama_Pegawai" value={formData.Nama_Pegawai} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all outline-none" placeholder="Contoh: Budi Santoso" required />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Jabatan</label>
                        <input type="text" name="Jabatan" value={formData.Jabatan} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all outline-none" placeholder="Contoh: Staff IT" required />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Role Akses</label>
                        <select name="Role" value={formData.Role} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all outline-none">
                            <option value="pegawai">Pegawai</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-2">
                    <p className="text-xs text-gray-500 mb-3 uppercase font-bold tracking-wide">Keamanan</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">PIN {isEditing && "(Isi jika ingin ubah)"}</label>
                            <input type="password" name="PIN" value={formData.PIN} 
                                onChange={(e) => /^\d{0,6}$/.test(e.target.value) && setFormData({...formData, PIN: e.target.value})}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center tracking-widest outline-none" 
                                placeholder="••••••" 
                                required={!isEditing} 
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">Konfirmasi PIN</label>
                            <input type="password" name="confirmPIN" value={confirmPIN} 
                                onChange={(e) => /^\d{0,6}$/.test(e.target.value) && setConfirmPIN(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center tracking-widest outline-none" 
                                placeholder="••••••" 
                                required={!isEditing}
                            />
                        </div>
                    </div>
                    {pinError && <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><span className="font-bold">!</span> {pinError}</p>}
                </div>

                <div className="flex items-center justify-end p-6 space-x-2 border-t border-gray-100 rounded-b -mx-6 -mb-6 bg-gray-50">
                    <button type="button" onClick={handleModalClose} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 transition-all">Batal</button>
                    <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-lg shadow-blue-500/30 transition-all">Simpan Data</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRM MODAL --- */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
               <Icons.Trash />
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">Hapus Pegawai?</h3>
            <p className="text-gray-500 mb-6 text-sm">Tindakan ini tidak dapat dibatalkan. Data pegawai <span className="font-bold text-gray-800">{pegawaiToDelete?.Nama_Pegawai}</span> akan hilang permanen.</p>
            <div className="flex justify-center gap-3">
                <button onClick={() => setIsDeleteConfirmOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Batal</button>
                <button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-red-500/30 transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;