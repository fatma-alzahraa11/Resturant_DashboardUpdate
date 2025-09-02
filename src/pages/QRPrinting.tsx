import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QrCode, Download } from 'lucide-react';
import * as QRCode from 'qrcode';

const QRPrinting: React.FC = () => {
  const { t } = useTranslation();
  const [tableCount, setTableCount] = useState<number>(1);
  const [qrCodes, setQrCodes] = useState<Array<{ table: number; dataUrl: string; value: string }>>([]);

  // Load persisted data if available
  useEffect(() => {
    try {
      const savedCount = localStorage.getItem('qr.tables.count');
      const savedCodes = localStorage.getItem('qr.codes');
      if (savedCount) {
        const parsed = parseInt(savedCount, 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
          setTableCount(parsed);
        }
      }
      if (savedCodes) {
        const parsedCodes = JSON.parse(savedCodes);
        if (Array.isArray(parsedCodes)) {
          setQrCodes(parsedCodes);
        }
      }
    } catch {}
  }, []);

  const handleGenerateQRCodes = async () => {
    const count = Math.max(1, Math.floor(Number(tableCount)) || 1);
    const result: Array<{ table: number; dataUrl: string; value: string }> = [];
    for (let i = 1; i <= count; i++) {
      const value = `${window.location.origin}/display-screen?table=${i}`;
      const dataUrl = await QRCode.toDataURL(value, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 512
      });
      result.push({ table: i, dataUrl, value });
    }
    setQrCodes(result);
    // Persist to localStorage
    try {
      localStorage.setItem('qr.tables.count', String(count));
      localStorage.setItem('qr.codes', JSON.stringify(result));
    } catch {}
  };

  const handleDownloadAll = async () => {
    if (!qrCodes.length) return;
    // Trigger downloads sequentially to avoid browser blocking
    for (const q of qrCodes) {
      const link = document.createElement('a');
      link.href = q.dataUrl;
      link.download = `table-${q.table}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Small delay between downloads
      await new Promise((r) => setTimeout(r, 120));
    }
  };

  const handleClearAll = () => {
    setQrCodes([]);
    setTableCount(1);
    try {
      localStorage.removeItem('qr.codes');
      localStorage.removeItem('qr.tables.count');
    } catch {}
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-primary-100 rounded-xl">
            <QrCode className="w-8 h-8 text-primary-900" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary-900">
              {t('pages.qrPrinting.title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('pages.qrPrinting.description')}
            </p>
          </div>
        </div>

        {/* Stats cards removed as requested */}

        {/* Generator Controls */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Table Numbers
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F48C06]"
              value={String(tableCount)}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D+/g, '');
                const parsed = digitsOnly === '' ? 0 : parseInt(digitsOnly, 10);
                setTableCount(parsed);
              }}
              placeholder={'Enter Table Numbers'}
            />
          </div>
          <div>
            <button
              type="button"
              onClick={handleGenerateQRCodes}
              className="inline-flex items-center justify-center w-full md:w-auto gap-2 bg-[#F48C06] text-white font-semibold px-5 py-2.5 rounded-lg shadow hover:bg-[#e57f04] transition"
            >
              <QrCode className="w-5 h-5" />
              QR Creator
            </button>
          </div>
        </div>

        {/* QR List */}
        {qrCodes.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {qrCodes.map((q) => (
              <div key={q.table} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold text-primary-900">T {q.table}</div>
                  <a
                    href={q.dataUrl}
                    download={`table-${q.table}.png`}
                    className="inline-flex items-center gap-1 text-[#E85D04] hover:text-[#c84f03]"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
                <img src={q.dataUrl} alt={`QR Table ${q.table}`} className="w-full rounded-lg border" />
                <div className="mt-2 text-xs text-gray-500 break-all">{q.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Download All */}
        {qrCodes.length > 0 && (
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-2 bg-[#003049] text-white font-semibold px-5 py-2.5 rounded-lg shadow hover:bg-[#02253b] transition"
            >
              <Download className="w-5 h-5" />
              Install All QR
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-red-700 transition"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRPrinting;