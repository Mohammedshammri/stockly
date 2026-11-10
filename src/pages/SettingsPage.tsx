import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Store,
  Database,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building,
  DollarSign,
  Percent,
  Sliders,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetDemoData,
    exportData,
    importData,
    products,
    sales,
    showToast,
  } = useStore();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [defaultThreshold, setDefaultThreshold] = useState(settings.defaultLowStockThreshold);
  const [businessAddress, setBusinessAddress] = useState(settings.businessAddress);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);

  const [importJsonText, setImportJsonText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: storeName.trim(),
      currencySymbol,
      taxRate: Number(taxRate),
      defaultLowStockThreshold: Number(defaultThreshold),
      businessAddress: businessAddress.trim(),
      phone: phone.trim(),
      email: email.trim(),
    });
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to restore the pristine 16 sample products, 18 sales records, and movement history?'
      )
    ) {
      resetDemoData();
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportData();
    const dataUri = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `Stockly_Store_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Downloaded full store database backup', 'success');
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) {
      showToast('Please paste valid JSON data to import', 'error');
      return;
    }
    const ok = importData(importJsonText);
    if (ok) {
      setImportJsonText('');
      setShowImportArea(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h3 className="text-base font-bold text-slate-900">Store Settings & Configuration</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure store profile metadata, tax calculations, and database backup controls.
        </p>
      </div>

      {/* Store Profile Form */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Store className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-slate-900">Store Information & Tax Rates</h4>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Estimated Sales Tax Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
                <span className="absolute right-3 top-2 text-slate-400 font-mono">%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Low Stock Safety Threshold (Units)
              </label>
              <input
                type="number"
                min="1"
                value={defaultThreshold}
                onChange={(e) => setDefaultThreshold(parseInt(e.target.value, 10) || 10)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Business Address</label>
            <input
              type="text"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              Save Store Profile
            </button>
          </div>
        </form>
      </div>

      {/* Database & Persistence Status Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-slate-900">
            Database & Persistence Status
          </h4>
        </div>

        <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/90 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-950 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Active Storage: Browser LocalStorage (Local Demo Persistence)</span>
            </div>
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Active & Saved
            </span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            All your inventory changes, product creations, stock movements, and POS checkout transactions are stored directly in your browser's persistent storage. Refreshing or reopening the app retains all {products.length} products and {sales.length} sales.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-slate-600">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Cloud Database Integration (Firebase / Cloud SQL): Unconfigured</span>
          </div>
          <p className="leading-relaxed">
            This demo application currently operates strictly in local demo mode. No remote Firebase or cloud database is connected or syncing in the background. If cloud persistence is configured in the environment in the future, records can be synced to cloud Firestore.
          </p>
        </div>
      </div>

      {/* Demo Data Management & Backup */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sliders className="w-4 h-4 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-900">Data Backup & Demo Store Reset</h4>
        </div>

        <p className="text-slate-600">
          Export your entire store database to a portable JSON backup file, import previous backups, or restore the sample environment anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Download JSON Backup */}
          <button
            onClick={handleDownloadBackup}
            className="px-3.5 py-2 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download Database JSON Backup</span>
          </button>

          {/* Import JSON Backup */}
          <button
            onClick={() => setShowImportArea(!showImportArea)}
            className="px-3.5 py-2 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import Data Backup</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={handleResetData}
            className="px-3.5 py-2 font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Store Data</span>
          </button>
        </div>

        {/* Import JSON Textarea */}
        {showImportArea && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mt-3 animate-in fade-in">
            <label className="block font-semibold text-slate-700">
              Paste JSON Data Backup Below:
            </label>
            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste previously exported JSON dump here..."
              className="w-full p-2.5 font-mono text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportArea(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                className="px-4 py-1.5 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Validate & Import
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
