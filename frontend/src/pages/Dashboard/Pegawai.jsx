import React, { useState, useEffect } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const Pegawai = () => {
  const [pegawaiList, setPegawaiList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // Untuk konfirmasi delete
  const [pegawaiToDelete, setPegawaiToDelete] = useState(null); // Untuk menyimpan pegawai yang akan dihapus
  const [currentPegawai, setCurrentPegawai] = useState(null); // Untuk Edit
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [confirmPIN, setConfirmPIN] = useState("");
const [pinError, setPinError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const filteredPegawai = pegawaiList.filter((pegawai) =>
    pegawai.Nama_Pegawai.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPegawai.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPegawai.length / itemsPerPage);
  
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const [formData, setFormData] = useState({
    Nama_Pegawai: "",
    Jabatan: "",
    PIN: "",
    Role: "pegawai",
  });

  // Fetch data pegawai dari backend
  useEffect(() => {
    const fetchPegawai = async () => {
      try {
        const token = localStorage.getItem("token"); // Ambil token dari localStorage
  
        const response = await axios.get(`${API_URL}/auth`, {
          headers: {
            Authorization: `Bearer ${token}` // Kirim token sebagai Bearer token
          }
        });
  
        setPegawaiList(response.data); // Set hasil data ke state
      } catch (error) {
        console.error("Error fetching pegawai", error);
      }
    };
  
    fetchPegawai();
  }, []);
  useEffect(() => {
    const fetchPegawai = async () => {
      try {
        const token = localStorage.getItem("token");
  
        const response = await axios.get(`${API_URL}/pegawai/pegawai-only`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        setPegawaiList(response.data);
      } catch (error) {
        console.error("Error fetching pegawai", error);
      }
    };
  
    fetchPegawai();
  }, []);
  

  // Handle changes in form input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle Add Pegawai
  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentPegawai(null);
    setFormData({
      Nama_Pegawai: "",
      Jabatan: "",
      PIN: "",
      Role: "pegawai",
    });
    setIsModalOpen(true);
  };

  // Handle Edit Pegawai
  const handleEditClick = (pegawai) => {
    setIsEditing(true);
    setCurrentPegawai(pegawai);
    setFormData({
      Nama_Pegawai: pegawai.Nama_Pegawai,
      Jabatan: pegawai.Jabatan,
      PIN: "", // Jangan tampilkan PIN saat edit
      Role: pegawai.Role,
    });
    setIsModalOpen(true);
  };

  // Handle Delete Pegawai (memunculkan konfirmasi)
  const handleDeleteClick = (pegawai) => {
    setPegawaiToDelete(pegawai); // Set pegawai yang akan dihapus
    setIsDeleteConfirmOpen(true); // Tampilkan modal konfirmasi
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_URL}/pegawai/${pegawaiToDelete.ID_Pegawai}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPegawaiList(pegawaiList.filter((pegawai) => pegawai.ID_Pegawai !== pegawaiToDelete.ID_Pegawai));
      setSuccessMessage("Data pegawai berhasil dihapus.");

      // Hilangkan pesan setelah 10 detik
      setTimeout(() => setSuccessMessage(""), 10000);
      setIsDeleteConfirmOpen(false); // Tutup modal konfirmasi setelah berhasil
    } catch (error) {
      console.error("Error deleting pegawai", error);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
  
    if (!/^\d{4,6}$/.test(formData.PIN)) {
      setPinError("PIN harus terdiri dari 4 hingga 6 digit angka.");
      return;
    }
    
    if (formData.PIN !== confirmPIN) {
      setPinError("PIN dan Konfirmasi PIN tidak cocok.");
      return;
    }
    
  
    setPinError("");
  
    try {
      const token = localStorage.getItem("token");
  
      const payload = {
        ...formData,
        Role: "pegawai",
      };
  
      if (isEditing) {
        await axios.put(
          `${API_URL}/pegawai/${currentPegawai.ID_Pegawai}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccessMessage("Data pegawai berhasil diedit.");
      } else {
        await axios.post(`${API_URL}/auth/register`, payload);
        setSuccessMessage("Data pegawai berhasil ditambahkan.");
      }
  
      const response = await axios.get(`${API_URL}/pegawai/pegawai-only`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setPegawaiList(response.data);
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(""), 10000);
    } catch (error) {
      console.error("Error saving pegawai:", error.response?.data || error.message);
    }
  };
  
  

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentPegawai(null);
    setFormData({
      Nama_Pegawai: "",
      Jabatan: "",
      PIN: "",
      Role: "pegawai",
    });
    setConfirmPIN("");
    setPinError("");
    setIsEditing(false);
  };
  
  return (
    <div className="container mx-auto">
      <h1 className="text-xl font-bold mb-4">Daftar Pegawai</h1>
      <button
        onClick={handleAddClick}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Tambah Pegawai
      </button>
      {successMessage && (
        <div className="bg-green-100 text-green-800 border border-green-400 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

<div className="relative w-full md:w-1/2 mb-4">
  <input
    type="text"
    placeholder="Cari berdasarkan Nama Pegawai..."
    value={searchTerm}
    onChange={(e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1); // reset ke halaman pertama saat search
    }}
    className="w-full pl-10 pr-4 py-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-300 transition-all"
  />
  <div className="absolute left-3 top-2.5 text-gray-500">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  </div>
</div>
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">No</th>
            <th className="border px-4 py-2">Nama Pegawai</th>
            <th className="border px-4 py-2">Jabatan</th>
            <th className="border px-4 py-2">Role</th>
            <th className="border px-4 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>

          
        {currentItems.length === 0 ? (
    <tr>
      <td colSpan="6" className="text-center py-4 text-gray-500">
        Tidak ada nama pegawai yang sesuai dengan pencarian.
      </td>
    </tr>
  ) : (
        currentItems.map((pegawai, index) => (
    <tr key={pegawai.ID_Pegawai}>
      <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
              <td className="border px-4 py-2">{pegawai.Nama_Pegawai}</td>
              <td className="border px-4 py-2">{pegawai.Jabatan}</td>
              <td className="border px-4 py-2">{pegawai.Role}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEditClick(pegawai)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(pegawai)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))
        )}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
  <button
    onClick={handlePrevPage}
    disabled={currentPage === 1}
    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
  >
    Previous
  </button>
  <span className="text-sm text-gray-700">
    Halaman {currentPage} dari {totalPages}
  </span>
  <button
    onClick={handleNextPage}
    disabled={currentPage === totalPages}
    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
  >
    Next
  </button>
</div>

      {/* Modal konfirmasi delete */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus Pegawai</h2>
            <p className="mb-4">Apakah Anda yakin ingin menghapus pegawai ini?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleConfirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Hapus
              </button>
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="bg-yellow-500 text-black px-4 py-2 rounded"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

{isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="relative bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
      {/* Tombol X untuk menutup modal */}
      <button
        onClick={handleModalClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
        aria-label="Close"
      >
        &times;
      </button>

      <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit" : "Tambah"} Pegawai</h2>
      <form onSubmit={handleModalSubmit} className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Nama Pegawai</label>
          <input
            type="text"
            name="Nama_Pegawai"
            value={formData.Nama_Pegawai}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Jabatan</label>
          <input
            type="text"
            name="Jabatan"
            value={formData.Jabatan}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
        <div>
  <label className="block text-sm font-medium">PIN</label>
  <input
    type="password" // bisa diganti ke "text" kalau ingin terlihat
    name="PIN"
    value={formData.PIN}
    onChange={(e) => {
      const value = e.target.value;
      // Hanya izinkan angka dan panjang maksimal 6 digit
      if (/^\d{0,6}$/.test(value)) {
        setFormData({ ...formData, PIN: value });
      }
    }}
    className="w-full p-2 border rounded"
    placeholder="Masukkan PIN (4-6 digit angka)"
    required
  />
</div>

<div className="mt-2">
  <label className="block text-sm font-medium">Konfirmasi PIN</label>
  <input
    type="password" // bisa "text" jika ingin terlihat
    name="confirmPIN"
    value={confirmPIN}
    onChange={(e) => {
      const value = e.target.value;
      if (/^\d{0,6}$/.test(value)) {
        setConfirmPIN(value);
      }
    }}
    className="w-full p-2 border rounded"
    placeholder="Konfirmasi PIN"
    required
  />
</div>


  {pinError && (
    <p className="text-red-600 text-sm">{pinError}</p>
  )}

  </div>
  {/* <div className="flex justify-end">
    <button
      type="submit"
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      {isEditing ? "Update Pegawai" : "Tambah Pegawai"}
    </button>
  </div> */}
        <div>
          <input type="hidden" name="Role" value="pegawai" />
          <label className="block mb-1">Role</label>
          <select
            name="Role"
            value={formData.Role}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            disabled
          >
            <option value="pegawai">Pegawai</option>
          </select>
        </div>
        <div className="col-span-2 mt-4 flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded"
          >
            Simpan
          </button>
        </div>
      </form>
      {/* Tombol tutup alternatif (opsional) */}
      <button
        onClick={handleModalClose}
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
      >
        Tutup
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default Pegawai;
