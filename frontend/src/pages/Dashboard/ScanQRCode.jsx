/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import axios from "axios";
import "../styles/scanQR.css";
import beepSound from "../../assets/beep.mp3";
import successGif from "../../assets/success.gifs.gif";

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

        if (id === lastScannedId) return;

        setLastScannedId(id);
        beep.play();

        axios
          .get(`http://localhost:7070/api/barang/${id}`)
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
      if (!barang) scanQRCode();
    }, 1000);
    return () => clearInterval(interval);
  }, [barang]);

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
        "http://localhost:7070/api/barang/pengambilan",
        {
          ID_Barang: barang.ID_Barang,
          Jumlah_Diambil: jumlah,
          ID_Pegawai: idPegawai,
        }
      );

      const riwayat = res.data.riwayat;
      setBarang({ ...barang, Stok_Tersedia: barang.Stok_Tersedia - jumlah });
      setSuccessMsg(
        `✅ Barang berhasil diambil. ID Transaksi: ${riwayat.ID_Transaksi}`
      );
      setJumlahAmbil("");
      setShowSuccessPopup(true);

      setTimeout(() => {
        setShowSuccessPopup(false);
        setBarang(null);
        setLastScannedId(null);
      }, 3000);
    } catch (err) {
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
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium mb-1">
                Jumlah yang ingin diambil:
              </label>
              <input
                type="number"
                min="1"
                className="w-full border rounded-lg px-3 py-2"
                value={jumlahAmbil}
                onChange={(e) => setJumlahAmbil(e.target.value)}
              />
              <button
                onClick={handleAmbilBarang}
                className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Ambil Barang
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="relative w-full max-w-3xl aspect-video mb-4">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover rounded-xl shadow-lg"
              videoConstraints={{ facingMode: cameraFacingMode }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <div className="scan-box">
              <div className="scanner-line"></div>
            </div>
          </div>
          <p className="text-gray-500 text-center mb-4">
            Arahkan kamera ke QR Code barang
          </p>
          <button
            onClick={switchCamera}
            className="bg-gray-800 text-white px-4 py-2 rounded-md"
          >
            Ganti Kamera
          </button>
        </div>
      )}

      {successMsg && showSuccessPopup && (
        <div className="success-popup">
          <img src={successGif} alt="Sukses" />
          <p>{successMsg}</p>
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
