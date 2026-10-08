/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppTheme } from '../data/themes';
import { PoliceOfficer } from '../types/personnel';
import { SamSaenStats, ChunkUploadProgress } from '../types/samSaen';
import {
  generateSamSaenDataset,
  calculateSamSaenStats,
  parseLargeCsvChunked,
  SAM_SAEN_BUREAU_WEIGHTS,
} from '../utils/samSaenParser';
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/storage';
import {
  Users,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Building,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info,
  Eye,
  Trash2,
  FileText,
  X,
  ExternalLink,
  PieChart,
  BarChart3,
  HardDrive,
  Database,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface SamSaenRosterSectionProps {
  currentTheme: AppTheme;
  globalOfficers: PoliceOfficer[];
  onShowToast?: (msg: string) => void;
  onSelectOfficer?: (officer: PoliceOfficer) => void;
}

const STORAGE_KEY_SAMSAEN = 'samsaen_roster_data_v1';

export const SamSaenRosterSection: React.FC<SamSaenRosterSectionProps> = ({
  currentTheme,
  globalOfficers = [],
  onShowToast = () => {},
  onSelectOfficer = () => {},
}) => {
  // Load local roster or fallback to generated sample dataset
  const [officers, setOfficers] = useState<PoliceOfficer[]>(() => {
    const saved = safeLocalStorageGet(STORAGE_KEY_SAMSAEN);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    // If global officers has data, initialize with it; otherwise generate synthetic nationwide dataset
    if (globalOfficers.length > 0) {
      return globalOfficers;
    }
    return generateSamSaenDataset(2500);
  });

  // Save to storage
  useEffect(() => {
    if (officers.length <= 15000) {
      safeLocalStorageSet(STORAGE_KEY_SAMSAEN, JSON.stringify(officers));
    }
  }, [officers]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBureau, setSelectedBureau] = useState('all');
  const [selectedCommission, setSelectedCommission] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [viewMode, setViewMode] = useState<'official_18' | 'compact'>('official_18');

  // Chunk Upload State
  const [uploadProgress, setUploadProgress] = useState<ChunkUploadProgress | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected officer for detail preview
  const [previewOfficer, setPreviewOfficer] = useState<PoliceOfficer | null>(null);

  // Compute Analytics
  const stats: SamSaenStats = useMemo(() => {
    return calculateSamSaenStats(officers);
  }, [officers]);

  // Filtered officers
  const filteredOfficers = useMemo(() => {
    return officers.filter((o) => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchName = `${o.firstName} ${o.lastName}`.toLowerCase().includes(term);
        const matchPosNo = (o.positionNumber || '').toLowerCase().includes(term);
        const matchTitle = (o.positionTitle || '').toLowerCase().includes(term);
        const matchDivision = (o.division || '').toLowerCase().includes(term);
        const matchSubDiv = (o.subDivision || '').toLowerCase().includes(term);
        const matchRank = (o.rank || '').toLowerCase().includes(term);
        if (!matchName && !matchPosNo && !matchTitle && !matchDivision && !matchSubDiv && !matchRank) {
          return false;
        }
      }

      // Bureau filter
      if (selectedBureau !== 'all' && o.bureau !== selectedBureau) {
        return false;
      }

      // Commission filter
      if (selectedCommission !== 'all' && o.commissionType !== selectedCommission) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'occupied' && o.isVacant) return false;
      if (selectedStatus === 'vacant' && !o.isVacant) return false;

      // Gender filter
      if (selectedGender !== 'all' && o.gender !== selectedGender) {
        return false;
      }

      return true;
    });
  }, [officers, searchTerm, selectedBureau, selectedCommission, selectedStatus, selectedGender]);

  // Paginated slice
  const totalPages = Math.ceil(filteredOfficers.length / pageSize) || 1;
  const paginatedOfficers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOfficers.slice(start, start + pageSize);
  }, [filteredOfficers, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBureau, selectedCommission, selectedStatus, selectedGender, pageSize]);

  // Handle Chunked File Upload
  const handleFileSelected = (file: File) => {
    if (!file) return;

    if (file.name.endsWith('.csv')) {
      setUploadProgress({
        isProcessing: true,
        currentChunk: 0,
        totalChunks: 1,
        processedRows: 0,
        totalEstimatedRows: 0,
        percentage: 0,
        statusMessage: 'กำลังเริ่มอ่านไฟล์ CSV ขนาดใหญ่แบบ Chunking...',
      });

      parseLargeCsvChunked(
        file,
        (progress) => setUploadProgress(progress),
        (newOfficers) => {
          setOfficers(newOfficers);
          setIsUploadModalOpen(false);
          setUploadProgress(null);
          onShowToast(`✅ นำเข้าข้อมูลทำเนียบสามแสนสำเร็จ ${newOfficers.length.toLocaleString()} อัตรา`);
        }
      );
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // Excel reader
      const reader = new FileReader();
      setUploadProgress({
        isProcessing: true,
        currentChunk: 1,
        totalChunks: 1,
        processedRows: 0,
        totalEstimatedRows: 0,
        percentage: 30,
        statusMessage: 'กำลังเปิดและแยกข้อมูลจากไฟล์ Excel...',
      });

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(firstSheet) as any[];

          const parsedList: PoliceOfficer[] = json.map((r, idx) => ({
            id: `xl-${idx + 1}`,
            positionNumber: String(r['เลขตำแหน่ง'] || r['เลขที่ตำแหน่ง'] || `${idx + 1}`),
            bureau: String(r['บช.'] || r['บช'] || r['กองบัญชาการ'] || 'ตร.'),
            division: String(r['บก.'] || r['บก'] || r['กองบังคับการ'] || ''),
            subDivision: String(r['กก.'] || r['กก'] || r['สภ.'] || r['สถานี'] || ''),
            jobGroup: String(r['กลุ่มสายงาน'] || 'อำนวยการและสนับสนุน'),
            jobLine: String(r['สายงาน'] || 'บริหารงานทั่วไป'),
            duty: String(r['ทำหน้าที่'] || 'ปฏิบัติราชการ'),
            concurrentPosition: String(r['ตำแหน่งควบ'] || '-'),
            fluidPromotion: String(r['เลื่อนไหล'] || 'ทั่วไป'),
            positionLevel: String(r['ระดับตำแหน่ง'] || 'ผบ.หมู่'),
            positionTitle: String(r['ตำแหน่ง'] || 'ผบ.หมู่'),
            fluidLevel: String(r['ระดับตำแหน่งเลื่อนไหล'] || '-'),
            commissionType: String(
              r['สัญญาบัตร/ประทวน/นักเรียน'] ||
              r['สัญญาบัตร/ประทวน'] ||
              ((r['ระดับตำแหน่ง'] || '').includes('สัญญาบัตร') ? 'สัญญาบัตร' : 'ประทวน')
            ) as any,
            rank: String(r['ยศ'] || 'ด.ต.'),
            firstName: String(r['ชื่อ'] || ''),
            lastName: String(r['สกุล'] || ''),
            gender: String(r['เพศ'] || 'ชาย') as any,
            isVacant: String(r['สถานะ'] || '').includes('ว่าง') || !r['ชื่อ'],
            updatedAt: new Date().toISOString(),
          }));

          setOfficers(parsedList);
          setIsUploadModalOpen(false);
          setUploadProgress(null);
          onShowToast(`✅ นำเข้าข้อมูล Excel สำเร็จ ${parsedList.length.toLocaleString()} อัตรา`);
        } catch (err: any) {
          setUploadProgress(null);
          onShowToast(`❌ ไม่สามารถอ่านไฟล์ Excel ได้: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Generate larger sample dataset
  const handleGenerateSample = (count: number) => {
    const generated = generateSamSaenDataset(count);
    setOfficers(generated);
    onShowToast(`⚡ สร้างข้อมูลโครงสร้างทำเนียบสามแสนสำเร็จ (${count.toLocaleString()} อัตรา)`);
  };

  // Export current filtered rows to Excel
  const handleExportFilteredExcel = () => {
    const exportData = filteredOfficers.map((o, idx) => ({
      'ลำดับ': idx + 1,
      'เลขตำแหน่ง': o.positionNumber,
      'บช.': o.bureau,
      'บก.': o.division,
      'กก.': o.subDivision,
      'กลุ่มสายงาน': o.jobGroup || '-',
      'สายงาน': o.jobLine || '-',
      'ทำหน้าที่': o.duty || '-',
      'ตำแหน่งควบ': o.concurrentPosition || '-',
      'เลื่อนไหล': o.fluidPromotion || 'ทั่วไป',
      'ระดับตำแหน่ง': o.positionLevel,
      'ตำแหน่ง': o.positionTitle,
      'ระดับตำแหน่งเลื่อนไหล': o.fluidLevel || '-',
      'สัญญาบัตร/ประทวน/นักเรียน': o.commissionType,
      'ยศ': o.isVacant ? '-' : o.rank,
      'ชื่อ': o.isVacant ? '(ตำแหน่งว่าง)' : o.firstName,
      'สกุล': o.isVacant ? '-' : o.lastName,
      'เพศ': o.gender,
      'สถานะ': o.isVacant ? 'ตำแหน่งว่าง' : 'มีผู้ครองตำแหน่ง',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ทำเนียบสามแสน');
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `ทำเนียบสามแสน_ตร_${dateStr}.xlsx`);
    onShowToast(`📥 ส่งออกไฟล์ Excel สำเร็จ (${exportData.length.toLocaleString()} รายการ)`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-r from-slate-950 via-[#0e1e38] to-slate-900 text-slate-100 p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-500/25 to-amber-700/35 border-2 border-amber-400/50 text-amber-300 flex items-center justify-center shadow-xl shadow-black/50 shrink-0">
              <Database className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  ฐานข้อมูลกำลังพล ตร. ทั่วประเทศ
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  ทำเนียบ 300,000 อัตรา
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40">
                  Chunked Streaming Engine
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-wide mt-1.5 font-['Prompt',sans-serif]">
                ทำเนียบสามแสน — ทะเบียนกำลังพลข้าราชการตำรวจทั่วประเทศ
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                ระบบจัดการและค้นหาข้อมูลกำลังพลทุกระดับตำแหน่ง ครอบคลุม 38 กองบัญชาการทั่วประเทศ ออกแบบพิเศษให้รองรับไฟล์ขนาดใหญ่หลักแสนแถวอย่างลื่นไหล
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Upload Big File */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-lg hover:shadow-indigo-500/25 cursor-pointer whitespace-nowrap border border-indigo-400/30"
            >
              <Upload className="w-4 h-4 text-cyan-200" />
              <span>นำเข้าไฟล์ทำเนียบ (.csv, .xlsx)</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={handleExportFilteredExcel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md hover:shadow-emerald-500/25 cursor-pointer whitespace-nowrap border border-emerald-400/30"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>ส่งออก Excel ({filteredOfficers.length.toLocaleString()})</span>
            </button>

            {/* Load Sample Generator */}
            <button
              onClick={() => handleGenerateSample(2500)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
              title="โหลดข้อมูลตัวอย่างโครงสร้างทำเนียบสามแสน 2,500 อัตรา"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>โหลดตัวอย่างโครงสร้าง</span>
            </button>
          </div>
        </div>

        {/* 2. Google Drive 403 Error Solution Guide Banner */}
        <div className="mt-5 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-amber-300 text-sm">
                  คำแนะนำกรณีไฟล์มีขนาดใหญ่เกินข้อจำกัด Google Drive (exportSizeLimitExceeded):
                </span>
                <span className="px-2 py-0.2 rounded-md bg-rose-500/20 text-rose-300 font-mono text-[10px] border border-rose-400/30">
                  Error Code 403
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                เนื่องจากไฟล์ข้อมูลทำเนียบกำลังพลสามแสนมีขนาดใหญ่มากเกินกว่าที่ Google Drive จะทำการ Export แปลงไฟล์ได้อัตโนมัติ จึงเกิดข้อผิดพลาด <code className="text-amber-300 font-mono">"This file is too large to be exported"</code>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-amber-500/20 text-[11px] text-amber-100">
                <div className="p-2 rounded-xl bg-black/30 border border-amber-500/20">
                  <span className="font-bold text-amber-300 block mb-0.5">วิธีที่ 1 (แนะนำ):</span>
                  ใน Google Drive ให้คลิกขวาที่ไฟล์ &gt; เลือก <strong>ดาวน์โหลด (Download)</strong> เพื่อบันทึกเป็นไฟล์ต้นฉบับ .xlsx หรือ .csv ลงเครื่องโดยตรง
                </div>
                <div className="p-2 rounded-xl bg-black/30 border border-amber-500/20">
                  <span className="font-bold text-amber-300 block mb-0.5">วิธีที่ 2:</span>
                  แยกบันทึกข้อมูลออกเป็นไฟล์ย่อยตามกองบัญชาการ (เช่น บช.น., ภ.1 - ภ.9) แล้วนำมาอัปโหลดทีละไฟล์
                </div>
                <div className="p-2 rounded-xl bg-black/30 border border-amber-500/20">
                  <span className="font-bold text-amber-300 block mb-0.5">วิธีที่ 3:</span>
                  ลากไฟล์ .csv หรือ .xlsx ที่ดาวน์โหลดแล้วมาวางในปุ่ม <strong>"นำเข้าไฟล์ทำเนียบ"</strong> ด้านบน ระบบจะใช้เอนจิน Chunking ประมวลผลอย่างรวดเร็ว
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Overall Stats Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[11px] block">กำลังพลในระบบปัจจุบัน</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              {stats.totalPositions.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">จากเป้าหมาย 300,000 อัตรา</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[11px] block">มีผู้ครองตำแหน่ง</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {stats.totalOccupied.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">ครอง {stats.fillPercentage}%</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[11px] block">ตำแหน่งว่าง</span>
            <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
              {stats.totalVacant.toLocaleString()}
            </span>
            <span className="text-[10px] text-rose-400/80 block mt-0.5">ว่าง {Math.round((stats.totalVacant / (stats.totalPositions || 1)) * 1000) / 10}%</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[11px] block">ชั้นสัญญาบัตร</span>
            <span className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
              {stats.commissioned.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">ร.ต.ต. ขึ้นไป</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[11px] block">ชั้นประทวน</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">
              {stats.nonCommissioned.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">ผบ.หมู่ / ด.ต. 53 ปี</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[11px] block">สัดส่วนชาย / หญิง</span>
            <span className="text-base sm:text-lg font-black text-slate-200 font-mono mt-1 block">
              ช {stats.male.toLocaleString()} / ญ {stats.female.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">ครองตำแหน่งจริง</span>
          </div>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, สกุล, เลขตำแหน่ง, ยศ, สภ., กองบังคับการ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 font-medium"
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

          {/* Bureau Filter */}
          <div>
            <select
              value={selectedBureau}
              onChange={(e) => setSelectedBureau(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 font-medium"
            >
              <option value="all">กองบัญชาการทั้งหมด (38 บช.)</option>
              {SAM_SAEN_BUREAU_WEIGHTS.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.code} — {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Commission Filter */}
          <div>
            <select
              value={selectedCommission}
              onChange={(e) => setSelectedCommission(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 font-medium"
            >
              <option value="all">ทุกชั้นสัญญาบัตร/ประทวน</option>
              <option value="สัญญาบัตร">ชั้นสัญญาบัตร (ร.ต.ต. ขึ้นไป)</option>
              <option value="ประทวน">ชั้นประทวน (ผบ.หมู่ / ด.ต.)</option>
              <option value="นักเรียน">นักเรียนตำรวจ</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 font-medium"
            >
              <option value="all">ทุกสถานะ (ครองและว่าง)</option>
              <option value="occupied">มีผู้ครองตำแหน่ง</option>
              <option value="vacant">ตำแหน่งว่าง</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span>
              พบทั้งหมด <strong className="text-slate-900 dark:text-slate-100 font-mono">{filteredOfficers.length.toLocaleString()}</strong> อัตรา
            </span>
            {(searchTerm || selectedBureau !== 'all' || selectedCommission !== 'all' || selectedStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBureau('all');
                  setSelectedCommission('all');
                  setSelectedStatus('all');
                  setSelectedGender('all');
                }}
                className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer font-medium text-[11px]"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}

            {/* View Mode Toggle Button */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-xs font-semibold">
              <button
                onClick={() => setViewMode('official_18')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'official_18'
                    ? 'bg-[#84cc16] text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="แสดงครบทุก 18 คอลัมน์ทางการตามระเบียบรายงานทำเนียบกำลังพล สกพ./ตร."
              >
                📋 ตารางทางการ 18 คอลัมน์ (สกพ./ตร.)
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'compact'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="แสดงมุมมองกระชับ เหมาะกับจอขนาดกะทัดรัด"
              >
                📱 มุมมองกระชับ
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>แสดงแถวละ:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs px-2">
                หน้า {currentPage.toLocaleString()} / {totalPages.toLocaleString()}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 z-10 shadow-md">
              {viewMode === 'official_18' ? (
                /* Official 18 Columns Header (สกพ./ตร. Specification) */
                <tr className="bg-[#84cc16] text-slate-950 font-bold border-b-2 border-[#65a30d] text-[11px] whitespace-nowrap">
                  <th className="py-2.5 px-2 text-center w-10 border-r border-[#65a30d]/50">ลำดับ</th>
                  <th className="py-2.5 px-3 border-r border-[#65a30d]/50 min-w-[130px]">เลขตำแหน่ง</th>
                  <th className="py-2.5 px-2.5 text-center border-r border-[#65a30d]/50 min-w-[70px]">บช.</th>
                  <th className="py-2.5 px-3 border-r border-[#65a30d]/50 min-w-[140px]">บก.</th>
                  <th className="py-2.5 px-3 border-r border-[#65a30d]/50 min-w-[140px]">กก.</th>
                  <th className="py-2.5 px-3 border-r border-[#65a30d]/50 min-w-[130px]">กลุ่มสายงาน</th>
                  <th className="py-2.5 px-3 border-r border-[#65a30d]/50 min-w-[130px]">สายงาน</th>
                  <th className="py-2.5 px-3 border-r border-[#65a30d]/50 min-w-[140px]">ทำหน้าที่</th>
                  <th className="py-2.5 px-2.5 text-center border-r border-[#65a30d]/50 min-w-[85px]">ตำแหน่งควบ</th>
                  <th className="py-2.5 px-2.5 text-center border-r border-[#65a30d]/50 min-w-[80px]">เลื่อนไหล</th>
                  <th className="py-2.5 px-2.5 text-center border-r border-[#65a30d]/50 min-w-[85px]">ระดับตำแหน่ง</th>
                  <th className="py-2.5 px-3 border-r border-[#65a30d]/50 min-w-[130px]">ตำแหน่ง</th>
                  <th className="py-2.5 px-2.5 text-center border-r border-[#65a30d]/50 min-w-[100px]">ระดับตำแหน่งเลื่อนไหล</th>
                  <th className="py-2.5 px-2.5 text-center border-r border-[#65a30d]/50 min-w-[110px]">สัญญาบัตร/ประทวน/นักเรียน</th>
                  <th className="py-2.5 px-2 text-center border-r border-[#65a30d]/50 min-w-[65px]">ยศ</th>
                  <th className="py-2.5 px-3 border-r border-[#65a30d]/50 min-w-[110px]">ชื่อ</th>
                  <th className="py-2.5 px-3 border-r border-[#65a30d]/50 min-w-[110px]">สกุล</th>
                  <th className="py-2.5 px-2 text-center border-r border-[#65a30d]/50 min-w-[50px]">เพศ</th>
                  <th className="py-2.5 px-2.5 text-center border-r border-[#65a30d]/50 min-w-[80px]">สถานะ</th>
                  <th className="py-2.5 px-2.5 text-center w-12">จัดการ</th>
                </tr>
              ) : (
                /* Compact View Header */
                <tr className="bg-slate-900 text-slate-200 font-bold border-b border-slate-700 text-[11px]">
                  <th className="p-3 w-12 text-center">ลำดับ</th>
                  <th className="p-3 min-w-[130px]">เลขตำแหน่ง</th>
                  <th className="p-3 min-w-[170px]">ยศ - ชื่อ - สกุล</th>
                  <th className="p-3 min-w-[90px]">บช.</th>
                  <th className="p-3 min-w-[150px]">บก. / กอง</th>
                  <th className="p-3 min-w-[150px]">กก. / สภ.</th>
                  <th className="p-3 min-w-[100px]">ระดับตำแหน่ง</th>
                  <th className="p-3 min-w-[140px]">ตำแหน่ง</th>
                  <th className="p-3 min-w-[80px] text-center">ชั้น</th>
                  <th className="p-3 min-w-[90px] text-center">สถานะ</th>
                  <th className="p-3 w-16 text-center">จัดการ</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
              {paginatedOfficers.length === 0 ? (
                <tr>
                  <td colSpan={viewMode === 'official_18' ? 20 : 11} className="p-12 text-center text-slate-400">
                    <Database className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-bold text-sm">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
                    <p className="text-xs text-slate-500 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองกองบัญชาการ</p>
                  </td>
                </tr>
              ) : (
                paginatedOfficers.map((o, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;

                  if (viewMode === 'official_18') {
                    return (
                      <tr
                        key={o.id}
                        onClick={() => setPreviewOfficer(o)}
                        className="hover:bg-amber-50/50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                      >
                        <td className="p-2 text-center font-mono text-slate-400 border-r border-slate-100 dark:border-slate-800">{globalIdx}</td>
                        <td className="p-2 font-mono font-bold text-slate-900 dark:text-slate-100 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{o.positionNumber}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap font-bold text-slate-700 dark:text-slate-300">{o.bureau}</td>
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{o.division}</td>
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{o.subDivision}</td>
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{o.jobGroup || '-'}</td>
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{o.jobLine || '-'}</td>
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{o.duty || '-'}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{o.concurrentPosition || '-'}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{o.fluidPromotion || 'ทั่วไป'}</td>
                        <td className="p-2 text-center font-mono font-medium border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{o.positionLevel}</td>
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap font-medium">{o.positionTitle}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{o.fluidLevel || '-'}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.commissionType === 'สัญญาบัตร' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' :
                            o.commissionType === 'นักเรียน' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400' :
                            'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                          }`}>
                            {o.commissionType}
                          </span>
                        </td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap font-bold text-amber-600 dark:text-amber-400">
                          {o.isVacant ? '-' : o.rank}
                        </td>
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap font-semibold">
                          {o.isVacant ? <span className="text-rose-500 italic font-normal">(ตำแหน่งว่าง)</span> : o.firstName}
                        </td>
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap font-semibold">
                          {o.isVacant ? '-' : o.lastName}
                        </td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{o.gender}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.isVacant ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {o.isVacant ? 'ว่าง' : 'ครอง'}
                          </span>
                        </td>
                        <td className="p-2 text-center whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewOfficer(o);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  // Compact View
                  return (
                    <tr
                      key={o.id}
                      onClick={() => setPreviewOfficer(o)}
                      className="hover:bg-amber-50/40 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="p-2.5 text-center font-mono text-slate-400">{globalIdx}</td>
                      <td className="p-2.5 font-mono font-medium text-slate-900 dark:text-slate-100">
                        {o.positionNumber}
                      </td>
                      <td className="p-2.5">
                        {o.isVacant ? (
                          <span className="text-rose-500 font-semibold italic">ตำแหน่งว่าง</span>
                        ) : (
                          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span className="text-amber-600 dark:text-amber-400 font-bold">{o.rank}</span>
                            <span>{o.firstName} {o.lastName}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {o.bureau}
                        </span>
                      </td>
                      <td className="p-2.5 truncate max-w-[160px]" title={o.division}>
                        {o.division}
                      </td>
                      <td className="p-2.5 truncate max-w-[160px]" title={o.subDivision}>
                        {o.subDivision}
                      </td>
                      <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">
                        {o.positionLevel}
                      </td>
                      <td className="p-2.5 truncate max-w-[150px]" title={o.positionTitle}>
                        {o.positionTitle}
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            o.commissionType === 'สัญญาบัตร'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                              : o.commissionType === 'นักเรียน'
                              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                              : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                          }`}
                        >
                          {o.commissionType}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.isVacant
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {o.isVacant ? 'ว่าง' : 'ครอง'}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewOfficer(o);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL: CHUNKED BIG FILE UPLOADER */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-blue-600 to-indigo-700 text-white flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    นำเข้าไฟล์ข้อมูลทำเนียบสามแสน (Chunked Streaming)
                  </h3>
                  <p className="text-xs text-slate-500">
                    รองรับไฟล์ขนาดใหญ่ (.csv, .xlsx) โดยแบ่งประมวลผลเป็นท่อน ไม่ทำให้หน้าจอค้าง
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!uploadProgress?.isProcessing) {
                    setIsUploadModalOpen(false);
                    setUploadProgress(null);
                  }
                }}
                disabled={uploadProgress?.isProcessing}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-indigo-400/50 dark:border-indigo-500/40 rounded-2xl text-center bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50/60 cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelected(file);
                }}
              />
              <FileSpreadsheet className="w-12 h-12 text-indigo-500 mx-auto mb-2 animate-bounce" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์ .csv / .xlsx มาวางที่นี่
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                ไฟล์ขนาด 50MB - 200MB ขึ้นไปจะถูกสตรีมประมวลผลอัตโนมัติ
              </p>
            </div>

            {/* Upload Progress Bar */}
            {uploadProgress && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {uploadProgress.statusMessage}
                  </span>
                  <span className="font-mono">{uploadProgress.percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>ประมวลผลแล้ว: {uploadProgress.processedRows.toLocaleString()} แถว</span>
                  <span>Chunk: {uploadProgress.currentChunk} / {uploadProgress.totalChunks}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={uploadProgress?.isProcessing}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer disabled:opacity-40"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: OFFICER DETAILS PREVIEW */}
      {previewOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    ข้อมูลข้าราชการตำรวจ (ทำเนียบสามแสน)
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    เลขตำแหน่ง: {previewOfficer.positionNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewOfficer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[11px] block">ชื่อ - สกุล</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {previewOfficer.isVacant ? '(ตำแหน่งว่าง)' : `${previewOfficer.rank} ${previewOfficer.firstName} ${previewOfficer.lastName}`}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  เพศ: {previewOfficer.gender} · ชั้น: {previewOfficer.commissionType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">กองบัญชาการ (บช.)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{previewOfficer.bureau}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">ระดับตำแหน่ง</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{previewOfficer.positionLevel}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2">
                  <span className="text-slate-400 text-[10px] block">กองบังคับการ (บก.)</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{previewOfficer.division}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2">
                  <span className="text-slate-400 text-[10px] block">กก. / สภ.</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{previewOfficer.subDivision}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2">
                  <span className="text-slate-400 text-[10px] block">ตำแหน่ง / หน้าที่</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {previewOfficer.positionTitle} ({previewOfficer.duty})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setPreviewOfficer(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
