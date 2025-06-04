import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const RiwayatPengambilan = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [filteredRiwayat, setFilteredRiwayat] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const res = await axios.get("http://localhost:7070/api/riwayat/pengambilan");
        setRiwayat(res.data.riwayat);
        setFilteredRiwayat(res.data.riwayat);
      } catch (error) {
        console.error("Gagal mengambil data riwayat pengambilan:", error);
      }
    };

    fetchRiwayat();
  }, []);

  useEffect(() => {
    const filtered = riwayat.filter((item) => {
      const namaBarang = item.barang?.Nama_Barang?.toLowerCase() || "";
      const namaPegawai = item.pegawai?.Nama_Pegawai?.toLowerCase() || "";
      const tanggal = new Date(item.Tanggal);
      const bulanItem = `${tanggal.getFullYear()}-${String(tanggal.getMonth() + 1).padStart(2, '0')}`;

      return (
        (namaBarang.includes(searchTerm.toLowerCase()) ||
         namaPegawai.includes(searchTerm.toLowerCase())) &&
        (!selectedMonth || bulanItem === selectedMonth)
      );
    });

    setFilteredRiwayat(filtered);
  }, [searchTerm, selectedMonth, riwayat]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ format: "legal", orientation: "portrait" });
    doc.setFontSize(16);
    doc.text("Pengadilan Negeri Manokwari", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Rekap Riwayat Pengambilan - Bulan: ${selectedMonth || "Semua"}`, 105, 30, { align: "center" });

    const tableRows = filteredRiwayat.map((item) => [
      item.pegawai?.Nama_Pegawai || "-",
      item.barang?.Nama_Barang || "-",
      item.Jumlah_Diambil,
      new Date(item.Tanggal).toLocaleString()
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["Nama Pegawai", "Nama Barang", "Jumlah Diambil", "Tanggal Ambil"]],
      body: tableRows,
      styles: { fontSize: 10 },
      theme: 'grid'
    });

    doc.save("rekap_riwayat_pengambilan.pdf");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Riwayat Pengambilan Barang</h1>

      <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari Nama Barang atau Pegawai..."
          className="border px-4 py-2 rounded mb-2 md:mb-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <input
          type="month"
          className="border px-4 py-2 rounded mb-2 md:mb-0"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />

        <button
          onClick={handleDownloadPDF}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Download PDF
        </button>
      </div>

      <table className="min-w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Nama Pegawai</th>
            <th className="border px-4 py-2 text-left">Nama Barang</th>
            <th className="border px-4 py-2 text-left">Jumlah Diambil</th>
            <th className="border px-4 py-2 text-left">Tanggal Ambil</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {filteredRiwayat.length === 0 ? (
            <tr>
              <td colSpan="4" className="border px-4 py-2 text-center">
                Tidak ada riwayat pengambilan
              </td>
            </tr>
          ) : (
            filteredRiwayat.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border px-4 py-2">
                  {item.pegawai ? item.pegawai.Nama_Pegawai : '-'}
                </td>
                <td className="border px-4 py-2">
                  {item.barang ? item.barang.Nama_Barang : 'Nama Barang Tidak Ditemukan'}
                </td>
                <td className="border px-4 py-2">{item.Jumlah_Diambil}</td>
                <td className="border px-4 py-2">
                  {new Date(item.Tanggal).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RiwayatPengambilan;