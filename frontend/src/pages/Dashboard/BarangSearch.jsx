import React, { useState } from 'react';
import axios from 'axios';

const BarangSearch = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.get(`http://localhost:7070/api/barang/search`, {
        params: { nama: keyword }
      });
      setResults(res.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setResults([]);
    }

    setLoading(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Cari barang..."
          className="flex-1 p-2 border rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">
          Cari
        </button>
      </form>

      {loading ? (
        <p>Memuat hasil...</p>
      ) : (
        results.length > 0 ? (
          <ul className="space-y-2">
            {results.map((barang) => (
              <li key={barang.ID_Barang} className="p-3 border rounded shadow">
                <h3 className="text-lg font-bold">{barang.Nama_Barang}</h3>
                <p>{barang.Deskripsi}</p>
                <p><strong>Stok:</strong> {barang.Stok_Tersedia}</p>
                {barang.QR_Code && (
                  <img src={barang.QR_Code} alt="QR Code" className="mt-2 w-24" />
                )}
              </li>
            ))}
          </ul>
        ) : (
          keyword && <p>Tidak ada barang ditemukan.</p>
        )
      )}
    </div>
  );
};

export default BarangSearch;
