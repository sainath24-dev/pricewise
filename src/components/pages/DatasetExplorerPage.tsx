/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { useApp } from '../../store/appContext';

export const DatasetExplorerPage: React.FC = () => {
  const {
    dataset,
    engineeredDataset,
    dataReport,
    datasetName,
    loadDataset,
    resetToDemoDataset,
    formatCurrency,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const filteredRecords = dataset.filter((rec) => {
    const matchesSearch =
      rec.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || rec.category === selectedCategory;
    const matchesSeason = selectedSeason === 'All' || rec.season === selectedSeason;
    return matchesSearch && matchesCategory && matchesSeason;
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setNoticeMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setUploadError('Invalid file format. Please upload a valid CSV file (.csv).');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setUploadError('The uploaded CSV file is empty.');
          return;
        }

        const rawRows = results.data as Record<string, any>[];
        loadDataset(rawRows, file.name);
        setNoticeMessage(`Loaded and validated ${rawRows.length} records from ${file.name}.`);
        setCurrentPage(1);
      },
      error: (err) => {
        setUploadError(`CSV parsing failed: ${err.message}`);
      },
    });
  };

  const handleExportData = () => {
    // Export full processed dataset containing demand, stock, competitor, and engineered features
    const dataToExport = engineeredDataset.length > 0 ? engineeredDataset : dataset;
    const csvStr = Papa.unparse(dataToExport);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pricewise_processed_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNoticeMessage(`Exported ${dataToExport.length} processed records with demand, stock & pricing features.`);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Toast Notice */}
      {noticeMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-[12px] bg-[#101114] px-4 py-3 text-xs font-semibold text-white shadow-xl">
          {noticeMessage}
        </div>
      )}

      {/* Upload and Control Header */}
      <div className="kraken-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-[-0.5px] text-[#101114]">
                Product Sales Dataset
              </h2>
              <span className="badge-neutral font-mono text-[11px]">
                {datasetName}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#686b82]">
              {dataset.length} verified records with engineered demand-to-stock and competitor price ratio features.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-outlined text-xs py-2 px-3.5 cursor-pointer"
            >
              Upload CSV
            </button>

            {/* Prominent Export Data Button */}
            <button
              onClick={handleExportData}
              className="btn-primary text-xs py-2 px-4 font-semibold cursor-pointer shadow-[0_2px_8px_rgba(113,50,245,0.25)]"
              title="Download processed dataset with demand, stock, and pricing features"
            >
              Export Data
            </button>

            <button
              onClick={() => {
                resetToDemoDataset();
                setNoticeMessage('Reset to canonical demonstration dataset (1,200 records).');
                setTimeout(() => setNoticeMessage(null), 3000);
              }}
              className="btn-subtle text-xs py-2 px-3.5 cursor-pointer"
            >
              Reset Demo Data
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mt-4 rounded-[10px] border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {uploadError}
          </div>
        )}
      </div>

      {/* Dataset Filter & Search Toolbar */}
      <div className="kraken-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by product name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-[10px] border border-[#dedee5] bg-white px-3 py-2 text-xs text-[#101114] placeholder:text-[#9497a9] focus:border-[#00D4A4] focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#686b82]">
              <span className="font-semibold">Category:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-[8px] border border-[#dedee5] bg-white px-2.5 py-1.5 text-xs text-[#101114] focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Categories ({dataset.length})</option>
              {dataReport.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 text-xs text-[#686b82]">
              <span className="font-semibold">Season:</span>
            </div>
            <select
              value={selectedSeason}
              onChange={(e) => {
                setSelectedSeason(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-[8px] border border-[#dedee5] bg-white px-2.5 py-1.5 text-xs text-[#101114] focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Seasons</option>
              <option value="Festival">Festival</option>
              <option value="Peak">Peak</option>
              <option value="Normal">Normal</option>
              <option value="Clearance">Clearance</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-[12px] border border-[#dedee5]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#dedee5] bg-white text-[#686b82] font-semibold">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Current Price</th>
                <th className="py-3 px-3">Target Price</th>
                <th className="py-3 px-3">Competitor Price</th>
                <th className="py-3 px-3">Demand</th>
                <th className="py-3 px-3">Stock</th>
                <th className="py-3 px-3">Season</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dedee5]">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#9497a9]">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-[rgba(0,212,164,0.04)] transition-colors">
                    <td className="py-3 px-3 font-mono text-[#686b82]">{r.date}</td>
                    <td className="py-3 px-3 font-semibold text-[#101114] max-w-[200px] truncate">
                      {r.product_name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="badge-neutral">{r.category}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#101114]">
                      {formatCurrency(r.current_price)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#00D4A4]">
                      {formatCurrency(r.target_price)}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#686b82]">
                      {formatCurrency(r.competitor_price)}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className="font-bold text-[#101114]">{r.demand}/100</span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className={r.stock_available <= 5 ? 'text-rose-700 font-bold' : 'text-[#101114]'}>
                        {r.stock_available} units
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#686b82]">{r.season}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between text-xs text-[#686b82]">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length}{' '}
            records
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-[8px] border border-[#dedee5] px-3 py-1 font-semibold disabled:opacity-40 hover:bg-[#dedee5]/30 cursor-pointer"
            >
              Previous
            </button>
            <span className="flex items-center px-2 font-mono font-semibold text-[#101114]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-[8px] border border-[#dedee5] px-3 py-1 font-semibold disabled:opacity-40 hover:bg-[#dedee5]/30 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
