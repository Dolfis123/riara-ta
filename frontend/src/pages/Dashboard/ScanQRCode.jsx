/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import axios from "axios";

function ScanQRCode() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [barang, setBarang] = useState(null);
  const [jumlahAmbil, setJumlahAmbil] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const scanQRCode = () => {
    const canvas = canvasRef.current;
    const video = webcamRef.current.video;

    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code && code.data) {
        const id = code.data.split("/").pop();
        axios.get(`http://localhost:7070/api/barang/${id}`)
          .then((res) => {
            setBarang(res.data);
            setErrorMsg("");
          })
          .catch(() => {
            setErrorMsg("QR valid tapi data barang tidak ditemukan.");
          });
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      scanQRCode();
    }, 1000); // setiap 1 detik scan ulang

    return () => clearInterval(interval);
  }, []);

  const handleAmbilBarang = async () => {
    const jumlah = parseInt(jumlahAmbil);
  
    if (!jumlah || isNaN(jumlah) || jumlah < 1) {
      setErrorMsg("Masukkan jumlah yang valid.");
      return;
    }
  
    // Validasi stok tersedia
    if (barang.Stok_Tersedia <= 0) {
      setErrorMsg("❌ Stok barang habis.");
      return;
    }
  
    if (jumlah > barang.Stok_Tersedia) {
      setErrorMsg("❌ Jumlah barang yang diambil melebihi stok yang tersedia.");
      return;
    }
  
    const idPegawai = localStorage.getItem('ID_Pegawai');
    if (!idPegawai) {
      setErrorMsg("ID Pegawai tidak ditemukan. Silakan login terlebih dahulu.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:7070/api/barang/pengambilan", {
        ID_Barang: barang.ID_Barang,
        Jumlah_Diambil: jumlah,
        ID_Pegawai: idPegawai,
      });
  
      const newStok = barang.Stok_Tersedia - jumlah;
      setBarang({ ...barang, Stok_Tersedia: newStok });
  
      const riwayat = response.data.riwayat;
      setSuccessMsg(`Barang berhasil diambil, oleh Riwayat ID: ${riwayat.ID_Transaksi}`);
  
      setShowSuccessPopup(true);
      setJumlahAmbil("");
  
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 4000);
    } catch (err) {
      setErrorMsg("Gagal mengambil barang.");
    }
  };
  
  
  
  

  return (
    
    <div className="p-4 max-w-md mx-auto">
{showSuccessPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
      <h3 className="text-lg font-bold text-green-700 mb-2">✅ Pengambilan Berhasil!</h3>
      <p className="text-gray-600">Stok barang telah diperbarui. Riwayat ID: {successMsg}</p>
    </div>
  </div>
)}


      <h2 className="text-xl font-bold mb-4">Scan QR Code Barang</h2>
      
      {barang ? (
  // === Tampilan jika barang sudah discan ===
  <div
    className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center px-4"
    style={{ backgroundImage: "url('/3c3264a8-59a3-407f-9063-dead2348f2e5.png')" }}
  >
    <div className="bg-white bg-opacity-90 backdrop-blur-md border border-gray-300 rounded-2xl shadow-xl p-6 max-w-md w-full">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 text-center">{barang.Nama_Barang}</h3>
      <div className="space-y-2 text-gray-700">
        <p><span className="font-semibold text-gray-600">Deskripsi:</span> {barang.Deskripsi}</p>
        <p><span className="font-semibold text-gray-600">Stok Tersedia:</span> {barang.Stok_Tersedia}</p>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Jumlah yang ingin diambil:
        </label>
        <input
          type="number"
          min="1"
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          value={jumlahAmbil}
          onChange={(e) => setJumlahAmbil(e.target.value)}
        />
        <button
          onClick={handleAmbilBarang}
          className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200 shadow"
        >
          Ambil Barang
        </button>
      </div>
    </div>
  </div>
) : (
  // === Tampilan Scanner Webcam saat belum ada barang ===
  <div
    className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center px-4"
 
  >
 
<div className="relative w-full max-w-3xl aspect-video mb-10">
  {/* Logo instansi */}

      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover rounded-xl shadow-lg"
        videoConstraints={{ facingMode: "environment" }}
      />
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-4 border-green-400 rounded-lg" />
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 overflow-hidden">
        <div className="w-full h-1 bg-red-500 animate-scan" />
      </div>
    </div>
    <canvas ref={canvasRef} style={{ display: "none" }} />
  </div>
)}


      {successMsg && <div className="text-green-600 mt-4">{successMsg}</div>}
      {/* {errorMsg && <div className="text-red-600 mt-4">{errorMsg}</div>} */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Berhasil!</h2>
            <p>Barang berhasil diambil.</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
      {errorMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Error!</h2>
            <p>{errorMsg}</p>
            <button
              onClick={() => setErrorMsg("")}
              className="bg-red-500 text-white px-4 py-2 rounded mt-4"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScanQRCode;
