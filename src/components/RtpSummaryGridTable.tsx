/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppTheme } from '../data/themes';
import { PoliceOfficer } from '../types/personnel';
import {
  AgencySummaryRow,
  createInitialEmptyGrid,
  computeRowTotals,
  RTP_AGENCY_LIST,
} from '../types/rtpSummary';
import {
  exportRtpSummaryToExcel,
  exportRtpSummaryToCSV,
  parseRtpSummaryCSV,
  calculateSummaryTotals,
  syncFromPersonnelRoster,
} from '../utils/rtpSummaryExporter';
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/storage';
import {
  Table,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Edit3,
  Check,
  Search,
  Sparkles,
  Clipboard,
  Trash2,
  HelpCircle,
  Building2,
  Users,
  ShieldAlert,
  ArrowUpDown,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react';

interface RtpSummaryGridTableProps {
  currentTheme: AppTheme;
  officers?: PoliceOfficer[];
  onShowToast?: (msg: string) => void;
}

const STORAGE_KEY = 'rtp_agency_summary_grid_v1';

export const RtpSummaryGridTable: React.FC<RtpSummaryGridTableProps> = ({
  currentTheme,
  officers = [],
  onShowToast = () => {},
}) => {
  // Load persisted grid or create initial empty grid
  const [rows, setRows] = useState<AgencySummaryRow[]>(() => {
    const saved = safeLocalStorageGet(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === RTP_AGENCY_LIST.length) {
          return parsed;
        }
      } catch (e) {
        // Fallback
      }
    }
    return createInitialEmptyGrid();
  });

  // Save to localStorage on change
  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvInputText, setCsvInputText] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase().trim();
    return rows.filter(
      (r) =>
        r.agency.toLowerCase().includes(term) ||
        r.agencyFullName.toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  // Overall totals
  const totals = useMemo(() => {
    return calculateSummaryTotals(rows);
  }, [rows]);

  // Handle cell edit
  const handleCellChange = (
    rowIndex: number,
    field: keyof Omit<AgencySummaryRow, 'id' | 'agency' | 'agencyFullName' | 'totalCommissioned' | 'totalNonCommissioned' | 'grandTotal' | 'vacant' | 'fillPercent'>,
    subField: 'pos' | 'occ',
    val: string
  ) => {
    const numericVal = parseInt(val, 10);
    const safeVal = isNaN(numericVal) ? 0 : Math.max(0, numericVal);

    setRows((prev) => {
      const updated = [...prev];
      const target = { ...updated[rowIndex] };
      target[field] = {
        ...target[field],
        [subField]: safeVal,
      };
      updated[rowIndex] = computeRowTotals(target);
      return updated;
    });
  };

  // Reset all to empty
  const handleResetToEmpty = () => {
    const emptyGrid = createInitialEmptyGrid();
    setRows(emptyGrid);
    safeLocalStorageSet(STORAGE_KEY, JSON.stringify(emptyGrid));
    setIsResetConfirmOpen(false);
    onShowToast('🔄 ล้างข้อมูลทั้งหมดเป็นตารางเปล่าเรียบร้อยแล้ว');
  };

  // Auto-fill from officers roster in system
  const handleAutoFillFromRoster = () => {
    if (!officers || officers.length === 0) {
      onShowToast('⚠️ ไม่พบข้อมูลกำลังพลในระบบ (ทำเนียบกำลังพลว่างเปล่า)');
      return;
    }
    const populated = syncFromPersonnelRoster(officers);
    setRows(populated);
    onShowToast(`⚡ ดึงข้อมูลอัตโนมัติจากทำเนียบกำลังพล ${officers.length} อัตรา สำเร็จแล้ว`);
  };

  // Export Excel
  const handleExportExcel = () => {
    exportRtpSummaryToExcel(rows);
    onShowToast('📥 ดาวน์โหลดไฟล์ Excel (.xlsx) ตารางอัตรากำลัง ตร. เรียบร้อยแล้ว');
  };

  // Copy CSV to Clipboard
  const handleCopyCSV = () => {
    const csv = exportRtpSummaryToCSV(rows);
    navigator.clipboard.writeText(csv);
    onShowToast('📋 คัดลอกรูปแบบ CSV ตารางเปล่า/ข้อมูล ลงคลิปบอร์ดแล้ว');
  };

  // Import CSV text
  const handleImportCSV = () => {
    if (!csvInputText.trim()) return;
    const parsed = parseRtpSummaryCSV(csvInputText);
    if (parsed.length > 0) {
      setRows(parsed);
      setIsImportModalOpen(false);
      setCsvInputText('');
      onShowToast('✅ นำเข้าข้อมูล CSV สำเร็จเรียบร้อยแล้ว');
    } else {
      onShowToast('❌ ไม่สามารถอ่านรูปแบบ CSV ได้ โปรดตรวจสอบข้อความ');
    }
  };

  // Column definitions for clean rendering
  const POSITION_COLUMNS: Array<{
    key: keyof Omit<AgencySummaryRow, 'id' | 'agency' | 'agencyFullName' | 'totalCommissioned' | 'totalNonCommissioned' | 'grandTotal' | 'vacant' | 'fillPercent'>;
    label: string;
    isSummary?: boolean;
    headerBg?: string;
  }> = [
    { key: 'pbt', label: 'ผบ.ตร.' },
    { key: 'rpbt', label: 'รอง ผบ.ตร.' },
    { key: 'apbt', label: 'ผู้ช่วย ผบ.ตร.' },
    { key: 'pbch', label: 'ผบช.' },
    { key: 'rpbch', label: 'รอง ผบช.' },
    { key: 'pbg', label: 'ผบก.' },
    { key: 'rpbg', label: 'รอง ผบก.' },
    { key: 'pgk', label: 'ผกก.' },
    { key: 'rpgk', label: 'รอง ผกก.' },
    { key: 'sw', label: 'สว.' },
    { key: 'rsw', label: 'รอง สว.' },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Top Banner */}
      <div className="rounded-3xl border-2 border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 text-slate-100 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-amber-500/20 to-amber-700/30 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-lg shadow-black/40 shrink-0">
              <Table className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  สำนักงานตำรวจแห่งชาติ (ตร.)
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  38 หน่วยงานหลัก + สรุปผลรวม
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide mt-1 font-['Prompt',sans-serif]">
                ตารางอัตรากำลังพล จำแนกตามหน่วยงานและระดับตำแหน่ง
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                ระดับตำแหน่งและคนครองครบทุกระดับ (ผบ.ตร. ถึง ผบ.หมู่ และนักเรียน) · รองรับแก้ไขตัวเลข ส่งออก Excel และคำนวณสูตรอัตโนมัติ
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Toggle Edit Mode */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer whitespace-nowrap border ${
                isEditMode
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/20 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="เปิด/ปิด โหมดแก้ไขตัวเลขในตารางแบบสเปรดชีต"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditMode ? 'บันทึกตัวเลข' : 'แก้ไขตัวเลขในตาราง'}</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md hover:shadow-emerald-500/25 cursor-pointer whitespace-nowrap border border-emerald-400/30"
              title="ดาวน์โหลดตารางเป็นไฟล์ Excel (.xlsx) พร้อมจัดรูปแบบหัวตาราง"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>ส่งออก Excel (.xlsx)</span>
            </button>

            {/* Import / Paste CSV */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-md cursor-pointer whitespace-nowrap border border-blue-400/30"
              title="นำเข้าหรือวางข้อมูล CSV ลงในตาราง"
            >
              <Upload className="w-4 h-4" />
              <span>นำเข้า / วาง CSV</span>
            </button>

            {/* Auto Fill from System Roster */}
            {officers.length > 0 && (
              <button
                onClick={handleAutoFillFromRoster}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white font-bold text-xs transition-all shadow-md cursor-pointer whitespace-nowrap border border-purple-400/30"
                title="ดึงข้อมูลจากทำเนียบกำลังพลในระบบมาคำนวณลงตารางนี้อัตโนมัติ"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>ดึงจากระบบ ({officers.length})</span>
              </button>
            )}

            {/* Reset to Empty */}
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="p-2.5 rounded-xl bg-rose-900/50 hover:bg-rose-800 text-rose-300 border border-rose-700/50 text-xs cursor-pointer"
              title="ล้างข้อมูลทั้งหมดให้เป็นตารางเปล่า (0)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Highlight Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-700/60 text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[11px] block">กรอบอัตราตำแหน่งรวม</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              {totals.grandTotal.pos.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">ตำแหน่งทั่วประเทศ</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[11px] block">มีผู้ครองตำแหน่งรวม</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {totals.grandTotal.occ.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">คนครองในระบบ</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[11px] block">อัตราว่างรวม</span>
            <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
              {totals.vacant.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">ตำแหน่งว่าง</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[11px] block">ร้อยละการครองตำแหน่ง</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">
              {totals.fillPercent}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">ของกรอบอัตราทั้งหมด</span>
          </div>
        </div>
      </div>

      {/* 3. Search and Quick Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหน่วยงาน (เช่น ภ.9, บช.น., สกพ.)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-amber-500 font-medium text-slate-800 dark:text-slate-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={handleCopyCSV}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
          >
            <Clipboard className="w-3.5 h-3.5 text-blue-500" />
            <span>คัดลอกข้อความ CSV</span>
          </button>

          <span className="text-[11px] text-slate-400">
            แสดง {filteredRows.length} จาก 38 หน่วยงาน
          </span>
        </div>
      </div>

      {/* 4. Master Data Grid Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full text-xs text-left border-collapse border-spacing-0">
            {/* Double-layer Header */}
            <thead className="sticky top-0 z-20 shadow-md">
              {/* Row 1: Position Names */}
              <tr className="bg-slate-850 text-slate-200 font-bold border-b border-slate-700 text-center">
                <th
                  rowSpan={2}
                  className="sticky left-0 z-30 bg-slate-900 border-r border-slate-700 p-3 min-w-[140px] text-left text-amber-300 font-black shadow-md"
                >
                  หน่วยงาน
                </th>

                {/* Individual Commissioned Ranks */}
                {POSITION_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    colSpan={2}
                    className="p-2 border-r border-slate-700 min-w-[110px] text-center"
                  >
                    {col.label}
                  </th>
                ))}

                {/* Subtotal Commissioned */}
                <th
                  colSpan={2}
                  className="p-2 border-r border-amber-600/50 bg-amber-950/40 text-amber-300 font-black min-w-[120px] text-center"
                >
                  รวมชั้นสัญญาบัตร
                </th>

                {/* Non-commissioned Ranks */}
                <th colSpan={2} className="p-2 border-r border-slate-700 min-w-[110px] text-center">
                  รอง สว.*
                </th>
                <th colSpan={2} className="p-2 border-r border-slate-700 min-w-[110px] text-center">
                  ผบ.หมู่
                </th>

                {/* Subtotal Non-commissioned */}
                <th
                  colSpan={2}
                  className="p-2 border-r border-indigo-600/50 bg-indigo-950/40 text-indigo-300 font-black min-w-[120px] text-center"
                >
                  รวมชั้นประทวน
                </th>

                {/* Student */}
                <th colSpan={2} className="p-2 border-r border-slate-700 min-w-[100px] text-center">
                  นักเรียน
                </th>

                {/* Grand Total */}
                <th
                  colSpan={2}
                  className="p-2 border-r border-emerald-600/50 bg-emerald-950/40 text-emerald-300 font-black min-w-[130px] text-center"
                >
                  รวมทั้งหมด
                </th>

                {/* Vacant & % */}
                <th
                  rowSpan={2}
                  className="p-2 border-r border-slate-700 bg-rose-950/30 text-rose-300 font-bold min-w-[70px] text-center"
                >
                  อัตราว่าง
                </th>
                <th
                  rowSpan={2}
                  className="p-2 bg-cyan-950/30 text-cyan-300 font-bold min-w-[70px] text-center"
                >
                  % ครอง
                </th>
              </tr>

              {/* Row 2: Sub-columns (ระดับตำแหน่ง / คนครอง) */}
              <tr className="bg-slate-800 text-[11px] font-semibold text-slate-300 border-b border-slate-700 text-center">
                {/* 11 commissioned */}
                {POSITION_COLUMNS.map((col) => (
                  <React.Fragment key={`sub-${col.key}`}>
                    <th className="py-1.5 px-2 border-r border-slate-700/60 font-medium">ระดับตำแหน่ง</th>
                    <th className="py-1.5 px-2 border-r border-slate-700 font-medium text-emerald-300">คนครอง</th>
                  </React.Fragment>
                ))}

                {/* Subtotal Commissioned */}
                <th className="py-1.5 px-2 border-r border-amber-600/40 bg-amber-950/30 font-bold text-amber-200">ระดับตำแหน่ง</th>
                <th className="py-1.5 px-2 border-r border-amber-600/40 bg-amber-950/30 font-bold text-amber-200">คนครอง</th>

                {/* Non-commissioned (รอง สว.* & ผบ.หมู่) */}
                <th className="py-1.5 px-2 border-r border-slate-700/60 font-medium">ระดับตำแหน่ง</th>
                <th className="py-1.5 px-2 border-r border-slate-700 font-medium text-emerald-300">คนครอง</th>
                <th className="py-1.5 px-2 border-r border-slate-700/60 font-medium">ระดับตำแหน่ง</th>
                <th className="py-1.5 px-2 border-r border-slate-700 font-medium text-emerald-300">คนครอง</th>

                {/* Subtotal Non-commissioned */}
                <th className="py-1.5 px-2 border-r border-indigo-600/40 bg-indigo-950/30 font-bold text-indigo-200">ระดับตำแหน่ง</th>
                <th className="py-1.5 px-2 border-r border-indigo-600/40 bg-indigo-950/30 font-bold text-indigo-200">คนครอง</th>

                {/* Student */}
                <th className="py-1.5 px-2 border-r border-slate-700/60 font-medium">ระดับตำแหน่ง</th>
                <th className="py-1.5 px-2 border-r border-slate-700 font-medium text-emerald-300">คนครอง</th>

                {/* Grand Total */}
                <th className="py-1.5 px-2 border-r border-emerald-600/40 bg-emerald-950/30 font-bold text-emerald-200">ระดับตำแหน่ง</th>
                <th className="py-1.5 px-2 border-r border-emerald-600/40 bg-emerald-950/30 font-bold text-emerald-200">คนครอง</th>
              </tr>
            </thead>

            {/* Table Body: 38 Agencies */}
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]">
              {filteredRows.map((r, rIdx) => {
                const originalIndex = rows.findIndex((item) => item.id === r.id);

                return (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    {/* Sticky Agency Name */}
                    <td className="sticky left-0 z-10 p-2.5 font-sans font-bold bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{r.agency}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal block truncate max-w-[140px]" title={r.agencyFullName}>
                        {r.agencyFullName}
                      </span>
                    </td>

                    {/* 11 Commissioned Ranks */}
                    {POSITION_COLUMNS.map((col) => {
                      const pair = r[col.key];

                      return (
                        <React.Fragment key={`${r.id}-${col.key}`}>
                          <td className="p-1.5 text-center border-r border-slate-100 dark:border-slate-800/60">
                            {isEditMode ? (
                              <input
                                type="number"
                                min="0"
                                value={pair.pos === 0 ? '' : pair.pos}
                                onChange={(e) =>
                                  handleCellChange(originalIndex, col.key, 'pos', e.target.value)
                                }
                                placeholder="0"
                                className="w-12 text-center py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px] focus:outline-hidden focus:border-amber-500"
                              />
                            ) : (
                              <span>{pair.pos === 0 ? '-' : pair.pos.toLocaleString()}</span>
                            )}
                          </td>
                          <td className="p-1.5 text-center border-r border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold">
                            {isEditMode ? (
                              <input
                                type="number"
                                min="0"
                                value={pair.occ === 0 ? '' : pair.occ}
                                onChange={(e) =>
                                  handleCellChange(originalIndex, col.key, 'occ', e.target.value)
                                }
                                placeholder="0"
                                className="w-12 text-center py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 focus:outline-hidden focus:border-emerald-500"
                              />
                            ) : (
                              <span>{pair.occ === 0 ? '-' : pair.occ.toLocaleString()}</span>
                            )}
                          </td>
                        </React.Fragment>
                      );
                    })}

                    {/* Total Commissioned (Auto-Calculated) */}
                    <td className="p-2 text-center border-r border-slate-200 dark:border-slate-800 font-bold text-amber-700 dark:text-amber-300 bg-amber-50/40 dark:bg-amber-950/20">
                      {r.totalCommissioned.pos === 0 ? '-' : r.totalCommissioned.pos.toLocaleString()}
                    </td>
                    <td className="p-2 text-center border-r border-slate-200 dark:border-slate-800 font-bold text-amber-600 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/20">
                      {r.totalCommissioned.occ === 0 ? '-' : r.totalCommissioned.occ.toLocaleString()}
                    </td>

                    {/* รอง สว.* */}
                    <td className="p-1.5 text-center border-r border-slate-100 dark:border-slate-800/60">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={r.rswStar.pos === 0 ? '' : r.rswStar.pos}
                          onChange={(e) =>
                            handleCellChange(originalIndex, 'rswStar', 'pos', e.target.value)
                          }
                          placeholder="0"
                          className="w-12 text-center py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px] focus:outline-hidden focus:border-amber-500"
                        />
                      ) : (
                        <span>{r.rswStar.pos === 0 ? '-' : r.rswStar.pos.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="p-1.5 text-center border-r border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={r.rswStar.occ === 0 ? '' : r.rswStar.occ}
                          onChange={(e) =>
                            handleCellChange(originalIndex, 'rswStar', 'occ', e.target.value)
                          }
                          placeholder="0"
                          className="w-12 text-center py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 focus:outline-hidden focus:border-emerald-500"
                        />
                      ) : (
                        <span>{r.rswStar.occ === 0 ? '-' : r.rswStar.occ.toLocaleString()}</span>
                      )}
                    </td>

                    {/* ผบ.หมู่ */}
                    <td className="p-1.5 text-center border-r border-slate-100 dark:border-slate-800/60">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={r.pbm.pos === 0 ? '' : r.pbm.pos}
                          onChange={(e) =>
                            handleCellChange(originalIndex, 'pbm', 'pos', e.target.value)
                          }
                          placeholder="0"
                          className="w-12 text-center py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px] focus:outline-hidden focus:border-amber-500"
                        />
                      ) : (
                        <span>{r.pbm.pos === 0 ? '-' : r.pbm.pos.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="p-1.5 text-center border-r border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={r.pbm.occ === 0 ? '' : r.pbm.occ}
                          onChange={(e) =>
                            handleCellChange(originalIndex, 'pbm', 'occ', e.target.value)
                          }
                          placeholder="0"
                          className="w-12 text-center py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 focus:outline-hidden focus:border-emerald-500"
                        />
                      ) : (
                        <span>{r.pbm.occ === 0 ? '-' : r.pbm.occ.toLocaleString()}</span>
                      )}
                    </td>

                    {/* Total Non-commissioned (Auto-Calculated) */}
                    <td className="p-2 text-center border-r border-slate-200 dark:border-slate-800 font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/40 dark:bg-indigo-950/20">
                      {r.totalNonCommissioned.pos === 0 ? '-' : r.totalNonCommissioned.pos.toLocaleString()}
                    </td>
                    <td className="p-2 text-center border-r border-slate-200 dark:border-slate-800 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20">
                      {r.totalNonCommissioned.occ === 0 ? '-' : r.totalNonCommissioned.occ.toLocaleString()}
                    </td>

                    {/* นักเรียน */}
                    <td className="p-1.5 text-center border-r border-slate-100 dark:border-slate-800/60">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={r.student.pos === 0 ? '' : r.student.pos}
                          onChange={(e) =>
                            handleCellChange(originalIndex, 'student', 'pos', e.target.value)
                          }
                          placeholder="0"
                          className="w-12 text-center py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px] focus:outline-hidden focus:border-amber-500"
                        />
                      ) : (
                        <span>{r.student.pos === 0 ? '-' : r.student.pos.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="p-1.5 text-center border-r border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={r.student.occ === 0 ? '' : r.student.occ}
                          onChange={(e) =>
                            handleCellChange(originalIndex, 'student', 'occ', e.target.value)
                          }
                          placeholder="0"
                          className="w-12 text-center py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 focus:outline-hidden focus:border-emerald-500"
                        />
                      ) : (
                        <span>{r.student.occ === 0 ? '-' : r.student.occ.toLocaleString()}</span>
                      )}
                    </td>

                    {/* Grand Total */}
                    <td className="p-2 text-center border-r border-slate-200 dark:border-slate-800 font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                      {r.grandTotal.pos === 0 ? '-' : r.grandTotal.pos.toLocaleString()}
                    </td>
                    <td className="p-2 text-center border-r border-slate-200 dark:border-slate-800 font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                      {r.grandTotal.occ === 0 ? '-' : r.grandTotal.occ.toLocaleString()}
                    </td>

                    {/* Vacant & % */}
                    <td className="p-2 text-center border-r border-slate-200 dark:border-slate-800 text-rose-500 font-medium">
                      {r.vacant === 0 ? '-' : r.vacant.toLocaleString()}
                    </td>
                    <td className="p-2 text-center font-bold text-cyan-700 dark:text-cyan-400">
                      {r.grandTotal.pos > 0 ? `${r.fillPercent}%` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Grand Total Row (Row 39: รวม) */}
            <tfoot className="sticky bottom-0 z-20 bg-slate-900 text-white font-mono text-xs border-t-2 border-amber-500 shadow-xl">
              <tr className="font-bold">
                <td className="sticky left-0 z-30 bg-slate-950 p-3 font-sans font-black text-amber-400 border-r border-slate-700 shadow-md">
                  รวม (ทั้งหมด)
                </td>

                {/* 11 Commissioned Ranks */}
                {POSITION_COLUMNS.map((col) => {
                  const pair = totals[col.key];
                  return (
                    <React.Fragment key={`tot-${col.key}`}>
                      <td className="p-2 text-center border-r border-slate-800 text-slate-200">
                        {pair.pos.toLocaleString()}
                      </td>
                      <td className="p-2 text-center border-r border-slate-700 text-emerald-400">
                        {pair.occ.toLocaleString()}
                      </td>
                    </React.Fragment>
                  );
                })}

                {/* Total Commissioned */}
                <td className="p-2 text-center border-r border-amber-600 bg-amber-950/60 font-black text-amber-300">
                  {totals.totalCommissioned.pos.toLocaleString()}
                </td>
                <td className="p-2 text-center border-r border-amber-600 bg-amber-950/60 font-black text-amber-300">
                  {totals.totalCommissioned.occ.toLocaleString()}
                </td>

                {/* Non-commissioned */}
                <td className="p-2 text-center border-r border-slate-800 text-slate-200">
                  {totals.rswStar.pos.toLocaleString()}
                </td>
                <td className="p-2 text-center border-r border-slate-700 text-emerald-400">
                  {totals.rswStar.occ.toLocaleString()}
                </td>
                <td className="p-2 text-center border-r border-slate-800 text-slate-200">
                  {totals.pbm.pos.toLocaleString()}
                </td>
                <td className="p-2 text-center border-r border-slate-700 text-emerald-400">
                  {totals.pbm.occ.toLocaleString()}
                </td>

                {/* Total Non-commissioned */}
                <td className="p-2 text-center border-r border-indigo-600 bg-indigo-950/60 font-black text-indigo-300">
                  {totals.totalNonCommissioned.pos.toLocaleString()}
                </td>
                <td className="p-2 text-center border-r border-indigo-600 bg-indigo-950/60 font-black text-indigo-300">
                  {totals.totalNonCommissioned.occ.toLocaleString()}
                </td>

                {/* Student */}
                <td className="p-2 text-center border-r border-slate-800 text-slate-200">
                  {totals.student.pos.toLocaleString()}
                </td>
                <td className="p-2 text-center border-r border-slate-700 text-emerald-400">
                  {totals.student.occ.toLocaleString()}
                </td>

                {/* Grand Total */}
                <td className="p-2 text-center border-r border-emerald-600 bg-emerald-950/60 font-black text-emerald-300 text-sm">
                  {totals.grandTotal.pos.toLocaleString()}
                </td>
                <td className="p-2 text-center border-r border-emerald-600 bg-emerald-950/60 font-black text-emerald-300 text-sm">
                  {totals.grandTotal.occ.toLocaleString()}
                </td>

                {/* Vacant & % */}
                <td className="p-2 text-center border-r border-slate-800 text-rose-400 font-bold">
                  {totals.vacant.toLocaleString()}
                </td>
                <td className="p-2 text-center text-cyan-300 font-black">
                  {totals.fillPercent}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 5. MODAL: IMPORT / PASTE CSV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50 dark:from-blue-950/40 via-transparent to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    นำเข้าข้อมูลตารางอัตรากำลัง ตร. ด้วย CSV
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    วางข้อความ CSV ที่มี 38 หน่วยงานเพื่ออัปเดตตัวเลขในตารางทันที
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  วางข้อความ CSV ของคุณด้านล่าง:
                </label>
                <textarea
                  rows={10}
                  value={csvInputText}
                  onChange={(e) => setCsvInputText(e.target.value)}
                  placeholder="หน่วยงาน,ผบ.ตร.,,รอง ผบ.ตร.,,...&#10;ตร.,,,,,...&#10;บช.น.,,,,,..."
                  className="w-full p-3 font-mono text-[11px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-[11px]">
                💡 เคล็ดลับ: ระบบจะค้นหาแถวตามชื่อย่อหน่วยงาน เช่น ตร., บช.น., ภ.1 - ภ.9 และอัปเดตเฉพาะหน่วยงานที่ตรงกัน
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-950/50">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleImportCSV}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md cursor-pointer transition-colors"
              >
                นำเข้าข้อมูลลงตาราง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: RESET CONFIRM */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  ยืนยันล้างข้อมูลเป็นตารางเปล่า?
                </h3>
                <p className="text-xs text-slate-500">
                  ตัวเลขทั้ง 38 หน่วยงานจะถูกรีเซ็ตเป็น 0 (ตารางว่างเปล่า)
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              การกระทำนี้จะล้างตัวเลขในทุกช่องของทั้ง 38 หน่วยงาน เพื่อให้ได้ตารางเปล่าตามที่ต้องการ คุณสามารถนำเข้าข้อมูลใหม่ได้ทุกเมื่อ
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleResetToEmpty}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md cursor-pointer transition-colors"
              >
                ยืนยันล้างเป็นตารางเปล่า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
