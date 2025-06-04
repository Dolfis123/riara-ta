import React, { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "qrcode";  // Pastikan Anda sudah install library qrcode
const API_URL = import.meta.env.VITE_API_URL;

const Barang = () => {
  const [barangList, setBarangList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBarang, setCurrentBarang] = useState(null); // Untuk Edit
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [barangToDelete, setBarangToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBarang = barangList.filter((barang) =>
    barang.Nama_Barang.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBarang.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBarang.length / itemsPerPage);
  
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const [formData, setFormData] = useState({
    Nama_Barang: "",
    Deskripsi: "",
    Stok_Tersedia: 0,
  });

  // Fetch data barang dari backend
  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const response = await axios.get(`${API_URL}/barang`);
        setBarangList(response.data); // Set hasil data ke state
      } catch (error) {
        console.error("Error fetching barang", error);
      }
    };

    fetchBarang();
  }, []);

  // Handle changes in form input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle Add Barang
  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentBarang(null);
    setFormData({
      Nama_Barang: "",
      Deskripsi: "",
      Stok_Tersedia: 0,
    });
    setIsModalOpen(true);
  };

  // Handle Edit Barang
  const handleEditClick = (barang) => {
    setIsEditing(true);
    setCurrentBarang(barang);
    setFormData({
      Nama_Barang: barang.Nama_Barang,
      Deskripsi: barang.Deskripsi,
      Stok_Tersedia: barang.Stok_Tersedia,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (barang) => {
    setBarangToDelete(barang); // Set barang yang akan dihapus
    setIsConfirmModalOpen(true); // Buka modal konfirmasi
  };
  
  const handleConfirmDelete = async () => {
    if (!barangToDelete) return; // Tambahkan pengecekan agar tidak melakukan operasi saat barangToDelete masih null
  
    try {
      await axios.delete(`${API_URL}/barang/${barangToDelete.ID_Barang}`);
      setBarangList(barangList.filter((barang) => barang.ID_Barang !== barangToDelete.ID_Barang));
      setSuccessMessage("Data barang berhasil dihapus.");
      setIsConfirmModalOpen(false); // Tutup modal konfirmasi setelah berhasil
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting barang", error);
    }
  };
  
  
const handleModalSubmit = async (e) => {
  e.preventDefault();
  console.log('Form submitted'); // Debug
  setIsSubmitting(true);
  setSuccessMessage(""); // Reset pesan

  try {
    console.log('Trying to submit...'); // Debug
    let insertedId;

    if (isEditing) {
      await axios.put(
        `${API_URL}/barang/${currentBarang.ID_Barang}`,
        formData
      );
      setSuccessMessage("Data barang berhasil diedit.");
      setIsModalOpen(false); // Tutup setelah berhasil edit
    } else {
      const res = await axios.post(`${API_URL}/barang`, formData);
      insertedId = res.data.ID_Barang;
    
      // Tutup modal lebih awal agar tetap tertutup meskipun QR gagal
      setIsModalOpen(false);
    
      try {
        const qrUrl = `${API_URL}/barang/${insertedId}`;
        const qrCode = await QRCode.toDataURL(qrUrl);
    
        await axios.put(`${API_URL}/barang/${insertedId}`, {
          QR_Code: qrCode,
        });
      } catch (qrError) {
        console.warn("QR code generation failed:", qrError);
      }
    
      setSuccessMessage("Data barang berhasil ditambahkan.");
    }
    

    // Ambil ulang data barang
    const response = await axios.get(`${API_URL}/barang`);
    setBarangList(response.data);

    // Reset form dan tutup modal
    setFormData({
      Nama_Barang: "",
      Deskripsi: "",
      Stok_Tersedia: 0,
    });
    console.log('Closing modal...'); // Debug
    setIsModalOpen(false); // Pastikan ini dipanggil
    setIsEditing(false);
    setCurrentBarang(null);

    setTimeout(() => setSuccessMessage(""), 3000);
  } catch (error) {
    console.error('Error details:', error); // Debug lebih detail
    const message =
      error.response?.data?.message || "Gagal menyimpan data barang.";
    setSuccessMessage(message);
    console.error("Error saving barang:", message);
  } finally {
    setIsSubmitting(false);
  }
};

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentBarang(null);
    setFormData({
      Nama_Barang: "",
      Deskripsi: "",
      Stok_Tersedia: 0,
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-xl font-bold mb-4">Daftar Barang</h1>
      <button
        onClick={handleAddClick}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Tambah Barang
      </button>
      {successMessage && (
        <div className="bg-green-100 text-green-800 border border-green-400 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

<div className="relative w-full md:w-1/2 mb-4">
  <input
    type="text"
    placeholder="Cari berdasarkan Nama Barang..."
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
            <th className="border px-4 py-2">Nama Barang</th>
            <th className="border px-4 py-2">Deskripsi</th>
            <th className="border px-4 py-2">Stok Tersedia</th>
            <th className="border px-4 py-2">QR Code</th>
            <th className="border px-4 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody className="transition-all duration-300 ease-in-out">

        {currentItems.length === 0 ? (
    <tr>
      <td colSpan="6" className="text-center py-4 text-gray-500">
        Tidak ada barang yang sesuai dengan pencarian.
      </td>
    </tr>
  ) : (
        currentItems.map((barang, index) => (
    <tr key={barang.ID_Barang}>
      <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
              <td className="border px-4 py-2">{barang.Nama_Barang}</td>
              <td className="border px-4 py-2">{barang.Deskripsi}</td>
              <td className="border px-4 py-2">{barang.Stok_Tersedia}</td>
              <td className="border px-4 py-2">
 {barang.QR_Code && (
  <div className="relative group w-20 h-20">
    {/* Tambahkan console.log untuk melihat nilai barang.QR_Code */}
    {console.log("QR Code URL:", barang.QR_Code)}

    <img
      src={`https://skydance.life${barang.QR_Code}`} // Menambahkan domain ke path QR Code
      alt="QR Code"
      className="w-full h-full object-contain"
    />
    <a
      href={`https://skydance.life${barang.QR_Code}`} // Menambahkan domain ke path QR Code untuk link download
      download={`QRCode_${barang.Nama_Barang}.png`}
      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
        />
      </svg>
    </a>
  </div>
)}

</td>

              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEditClick(barang)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(barang)}
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

{/* Modal untuk Add / Edit */}
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

      <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit" : "Tambah"} Barang</h2>
      <form onSubmit={handleModalSubmit} className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Nama Barang</label>
          <input
            type="text"
            name="Nama_Barang"
            value={formData.Nama_Barang}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Deskripsi</label>
          <textarea
            name="Deskripsi"
            value={formData.Deskripsi}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Stok Tersedia</label>
          <input
            type="number"
            name="Stok_Tersedia"
            value={formData.Stok_Tersedia}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="col-span-2 mt-4 flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
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

  
      {/* Modal Konfirmasi Hapus */}
      {isConfirmModalOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
      <h2 className="text-xl font-bold mb-3">Konfirmasi Penghapusan</h2>
      <p className="mb-6 text-gray-700">Apakah Anda yakin ingin menghapus barang ini?</p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setIsConfirmModalOpen(false)}
          className="bg-yellow-500 text-black px-4 py-2 rounded"
        >
          Tidak
        </button>
        <button
          onClick={handleConfirmDelete}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md transition-colors"
        >
          Ya
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
  
};

export default Barang;
