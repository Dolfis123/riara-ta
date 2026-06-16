import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import axios from "axios";
import "../styles/scanQR.css";
import beepSound from "../../assets/beep.mp3";
import successGif from "../../assets/success.gifs.gif";

const API_URL = import.meta.env.VITE_API_URL;

function ScanQRCode() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [barang, setBarang] = useState(null);
  const [jumlahAmbil, setJumlahAmbil] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [lastScannedId, setLastScannedId] = useState(null);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");

  const beep = new Audio(beepSound);

  const scanQRCode = () => {
    // Jika sedang menampilkan detail barang, hentikan scanning
    if (barang) return;

    const canvas = canvasRef.current;
    // Cek apakah webcamRef.current null sebelum akses video
    if (!webcamRef.current || !webcamRef.current.video) return;
    
    const video = webcamRef.current.video;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code && code.data) {
        // --- PERBAIKAN LOGIKA EKSTRAKSI ID ---
        // QR Code bisa berisi angka "1" ATAU teks "barang-1.png" ATAU URL "http://.../barang-1.png"
        // Kita gunakan Regex untuk mengambil angka pertama yang ditemukan
        const rawData = code.data;
        const numberPattern = /\d+/; 
        const match = rawData.match(numberPattern);

        if (match) {
            const id = match[0]; // Ambil angkanya saja (misal: "1")

            if (id === lastScannedId) return;

            setLastScannedId(id);
            beep.play();

            axios
              .get(`${API_URL}/barang/${id}`)
              .then((res) => {
                setBarang(res.data);
                setErrorMsg("");
              })
              .catch(() => {
                setErrorMsg("QR terbaca, tapi Data Barang tidak ditemukan.");
                // Reset lastScannedId setelah beberapa detik agar bisa scan ulang jika gagal
                setTimeout(() => setLastScannedId(null), 2000);
              });
        }
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      scanQRCode();
    }, 500); // Scan setiap 500ms agar lebih responsif tapi tidak memberatkan
    return () => clearInterval(interval);
  }, []);

  const handleAmbilBarang = async () => {
    const jumlah = parseInt(jumlahAmbil);
    if (!jumlah || isNaN(jumlah) || jumlah < 1) {
      setErrorMsg("Masukkan jumlah yang valid.");
      return;
    }

    if (barang.Stok_Tersedia <= 0) {
      setErrorMsg("❌ Stok barang habis.");
      return;
    }

    if (jumlah > barang.Stok_Tersedia) {
      setErrorMsg("❌ Jumlah melebihi stok tersedia.");
      return;
    }

    const idPegawai = localStorage.getItem("ID_Pegawai");
    if (!idPegawai) {
      setErrorMsg("ID Pegawai tidak ditemukan. Silakan login.");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/barang/pengambilan`,
        {
          ID_Barang: barang.ID_Barang,
          Jumlah_Diambil: jumlah,
          ID_Pegawai: idPegawai,
        }
      );

      const riwayat = res.data.riwayat;
      
      // Update stok lokal sementara
      const sisaStok = barang.Stok_Tersedia - jumlah;
      setBarang({ ...barang, Stok_Tersedia: sisaStok });

      setSuccessMsg(
        `✅ Barang berhasil diambil. ID Transaksi: ${riwayat.ID_Transaksi}`
      );
      setJumlahAmbil("");
      setShowSuccessPopup(true);

      // Tunggu 3 detik lalu reset scanner
      setTimeout(() => {
        setShowSuccessPopup(false);
        setBarang(null);
        setLastScannedId(null);
        setErrorMsg("");
      }, 3000);

    } catch (err) {
      console.error(err);
      setErrorMsg("❌ Gagal mengambil barang.");
    }
  };

  const switchCamera = () => {
    setCameraFacingMode((prev) =>
      prev === "environment" ? "user" : "environment"
    );
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {barang ? (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="bg-white bg-opacity-90 backdrop-blur-md border border-gray-300 rounded-2xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center border-b pb-2">
              {barang.Nama_Barang}
            </h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Deskripsi:</strong> {barang.Deskripsi}
              </p>
              <p>
                <strong>Stok Tersedia:</strong> {barang.Stok_Tersedia}
              </p>
              <div className="flex justify-center my-4">
                {/* --- PERBAIKAN TAMPILAN GAMBAR --- */}
                {/* Gabungkan API_URL + /qris/ + nama file dari database */}
                <img 
                    src={`${API_URL}/qris/${barang.QR_Code}`} 
                    alt="QR Code" 
                    className="w-32 h-32 object-contain border rounded"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+QR"; }}
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium mb-1">
                Jumlah yang ingin diambil:
              </label>
              <input
                type="number"
                min="1"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={jumlahAmbil}
                onChange={(e) => setJumlahAmbil(e.target.value)}
              />
              <button
                onClick={handleAmbilBarang}
                className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Ambil Barang
              </button>
              {/* Tombol Batal Scan */}
              <button
                onClick={() => { setBarang(null); setLastScannedId(null); setErrorMsg(""); }}
                className="mt-2 w-full bg-gray-400 text-white font-semibold py-2 rounded-lg hover:bg-gray-500 transition"
              >
                Batal / Scan Lagi
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="relative w-full max-w-3xl aspect-video mb-4 bg-black rounded-xl overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{ facingMode: cameraFacingMode }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            
            {/* Overlay Garis Scan */}
            <div className="absolute inset-0 border-2 border-blue-500 opacity-50 pointer-events-none"></div>
            <div className="scan-box">
              <div className="scanner-line"></div>
            </div>
          </div>
          
          <p className="text-gray-500 text-center mb-4">
            Arahkan kamera ke QR Code barang
          </p>
          <button
            onClick={switchCamera}
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
          >
            Ganti Kamera
          </button>
        </div>
      )}

      {successMsg && showSuccessPopup && (
        <div className="success-popup fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="bg-white p-6 rounded-lg flex flex-col items-center">
                <img src={successGif} alt="Sukses" className="w-20 h-20 mb-2"/>
                <p className="text-lg font-bold text-green-600 text-center">{successMsg}</p>
            </div>
        </div>
      )}

      {errorMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
            <h2 className="text-xl font-bold mb-4 text-red-600">⚠️ Error</h2>
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