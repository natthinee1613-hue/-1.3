/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { PoliceOfficialOrder, INITIAL_OFFICIAL_ORDERS } from '../data/officialOrders';
import { AppTheme } from '../data/themes';
import { PoliceEmblem } from './PoliceEmblem';
import {
  downloadSingleOrderOfficialDoc,
  printOrSaveOrderDocument,
  exportOrdersListToCSV,
  exportOrdersListToExcel,
  exportOrdersListToJSON,
} from '../utils/orderDownloader';
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/storage';
import {
  FileText,
  Search,
  Download,
  Calendar,
  Filter,
  Plus,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Printer,
  X,
  Share2,
  Clock,
  Building,
  Tag,
  FileSpreadsheet,
  FileCode,
  FileCheck2,
  Sparkles,
  ChevronDown,
  Globe,
  ShieldCheck,
  Radio,
  Layers,
  ArrowRight
} from 'lucide-react';

interface OfficialOrdersSectionProps {
  currentTheme: AppTheme;
  onShowToast?: (msg: string) => void;
}

export const OfficialOrdersSection: React.FC<OfficialOrdersSectionProps> = ({
  currentTheme,
  onShowToast = () => {},
}) => {
  // Load persisted orders or fallback to INITIAL_OFFICIAL_ORDERS
  const [orders, setOrders] = useState<PoliceOfficialOrder[]>(() => {
    const saved = safeLocalStorageGet('police_app_orders_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_OFFICIAL_ORDERS;
  });

  // Persist orders whenever they change
  useEffect(() => {
    safeLocalStorageSet('police_app_orders_data', JSON.stringify(orders));
  }, [orders]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOrderForView, setSelectedOrderForView] = useState<PoliceOfficialOrder | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // New order modal state
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [newOrderNumber, setNewOrderNumber] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'appointment' | 'announcement' | 'regulation' | 'transfer' | 'award'>('appointment');
  const [newSignedDate, setNewSignedDate] = useState(
    new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
  );
  const [newDescription, setNewDescription] = useState('');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesCat = selectedCategory === 'all' || order.category === selectedCategory;
      if (!matchesCat) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesNum = order.orderNumber.toLowerCase().includes(q);
        const matchesTitle = order.title.toLowerCase().includes(q);
        const matchesDesc = order.description.toLowerCase().includes(q);
        const matchesIssuer = order.issuer.toLowerCase().includes(q);
        const matchesDate = order.signedDate.toLowerCase().includes(q);
        const matchesTag = order.tags.some((t) => t.toLowerCase().includes(q));

        return matchesNum || matchesTitle || matchesDesc || matchesIssuer || matchesDate || matchesTag;
      }

      return true;
    });
  }, [orders, searchTerm, selectedCategory]);

  // Real-time direct download of official document
  const handleRealtimeDownloadDoc = (order: PoliceOfficialOrder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // 1. Increment download count in real-time
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, downloadCount: o.downloadCount + 1 } : o))
    );

    // 2. Trigger real-time browser download of official formatted document
    downloadSingleOrderOfficialDoc(order);

    // 3. User feedback
    onShowToast(`📥 ดาวน์โหลดเอกสาร "${order.orderNumber}" สำเร็จเรียบร้อย`);
  };

  // Real-time print or PDF dialog
  const handleRealtimePrintOrPdf = (order: PoliceOfficialOrder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, downloadCount: o.downloadCount + 1 } : o))
    );

    printOrSaveOrderDocument(order);
    onShowToast(`🖨️ เปิดหน้าต่างพิมพ์ / บันทึก PDF เอกสาร "${order.orderNumber}"`);
  };

  // Real-time batch export functions
  const handleExportAllCSV = () => {
    exportOrdersListToCSV(filteredOrders);
    setIsExportMenuOpen(false);
    onShowToast(`📥 ดาวน์โหลดตารางคำสั่งทั้งหมด ${filteredOrders.length} ฉบับ (CSV/Excel) เรียบร้อย`);
  };

  const handleExportAllExcel = () => {
    exportOrdersListToExcel(filteredOrders);
    setIsExportMenuOpen(false);
    onShowToast(`📥 ดาวน์โหลดตารางคำสั่งทั้งหมด ${filteredOrders.length} ฉบับ (Excel .xls) เรียบร้อย`);
  };

  const handleExportAllJSON = () => {
    exportOrdersListToJSON(filteredOrders);
    setIsExportMenuOpen(false);
    onShowToast(`📥 ส่งออกข้อมูลคำสั่งทั้งหมด ${filteredOrders.length} ฉบับ (JSON) เรียบร้อย`);
  };

  const handleAddOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderNumber.trim() || !newTitle.trim()) {
      alert('กรุณากรอกเลขที่คำสั่งและชื่อเรื่อง');
      return;
    }

    const categoryLabels: Record<string, string> = {
      appointment: 'คำสั่งแต่งตั้ง ตร.',
      announcement: 'ประกาศ สกพ.',
      regulation: 'โครงสร้าง/อัตรากำลัง',
      transfer: 'การโยกย้ายกำลังพล',
      award: 'ประกาศเกียรติคุณ',
    };

    const newOrder: PoliceOfficialOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNumber.trim(),
      title: newTitle.trim(),
      category: newCategory,
      categoryLabel: categoryLabels[newCategory] || 'คำสั่ง ตร.',
      issuer: newCategory === 'announcement' ? 'สำนักงานกำลังพล (สกพ.)' : 'สำนักงานตำรวจแห่งชาติ',
      signedDate: newSignedDate,
      effectiveDate: newSignedDate,
      description: newDescription.trim() || 'คำสั่งและประกาศราชการอย่างเป็นทางการของสำนักงานตำรวจแห่งชาติ',
      fileSize: '2.1 MB',
      pagesCount: 14,
      tags: ['คำสั่งล่าสุด', 'ตร.', 'สกพ.'],
      downloadCount: 1,
      urgency: 'normal',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setIsAddOrderModalOpen(false);
    setNewOrderNumber('');
    setNewTitle('');
    setNewDescription('');
    onShowToast(`✅ เพิ่มคำสั่ง "${newOrder.orderNumber}" เข้าสู่ระบบเรียบร้อย`);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 0. Direct Download Connection Banner (https://human.police.go.th/home/) */}
      <div className="rounded-2xl border-2 border-emerald-500/70 bg-gradient-to-r from-[#041A14] via-[#072B20] to-[#0A1A2F] text-slate-100 p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-emerald-500 to-teal-700 border-2 border-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-950/60 shrink-0">
              <Download className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-black text-white tracking-wide flex items-center gap-1.5">
                  <span>ศูนย์ดาวน์โหลดข้อมูลคำสั่งแต่งตั้งและประกาศ สกพ. ตร.</span>
                </h4>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  ดาวน์โหลดใน https://human.police.go.th/home/
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
                สามารถคลิกลิงก์ดาวน์โหลดข้อมูลคำสั่งแต่งตั้ง บัญชีรายชื่อ และประกาศราชการในเว็บไซต์ สำนักงานกำลังพล ได้โดยตรง (<span className="font-mono font-bold text-amber-300">https://human.police.go.th/home/</span>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 z-10 flex-wrap">
            {/* Primary Direct Download Link Button into human.police.go.th */}
            <a
              href="https://human.police.go.th/home/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-900/40 cursor-pointer whitespace-nowrap"
              title="คลิกเพื่อดาวน์โหลดข้อมูลในเว็บไซต์ human.police.go.th โดยตรง"
            >
              <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>ลิงก์ดาวน์โหลดใน human.police.go.th ได้เลย</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
            </a>

            {/* Link to Main Police Portal */}
            <a
              href="https://royalthaipolice.go.th/th/main"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E2533] hover:bg-[#283142] border border-[#3E4A5E] text-slate-200 hover:text-white font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
              title="เปิดเว็บไซต์หลัก ตร. (royalthaipolice.go.th)"
            >
              <span>royalthaipolice.go.th</span>
              <ExternalLink className="w-3 h-3 text-amber-400" />
            </a>
          </div>
        </div>

        {/* Quick Shortcut Pills for Direct Download Categories in human.police.go.th */}
        <div className="mt-3.5 pt-3 border-t border-emerald-500/30 flex items-center gap-2 flex-wrap text-[11px]">
          <span className="text-emerald-300 font-bold flex items-center gap-1">
            <span>⚡ ลิงก์ดาวน์โหลดด่วน:</span>
          </span>
          <a
            href="https://human.police.go.th/home/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 font-medium flex items-center gap-1 transition-colors"
          >
            <span>📁 บัญชีคำสั่งแต่งตั้งข้าราชการตำรวจ (PDF)</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </a>
          <a
            href="https://human.police.go.th/home/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 font-medium flex items-center gap-1 transition-colors"
          >
            <span>📋 ประกาศ สกพ. และการประเมินผล</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </a>
          <a
            href="https://human.police.go.th/home/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 font-medium flex items-center gap-1 transition-colors"
          >
            <span>📊 กรอบโครงสร้างและอัตรากำลัง</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* 1. Header and Search bar container */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-red-600 to-red-800 text-white flex items-center justify-center shadow-md shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 font-['Prompt',sans-serif]">
              <span>รายการคำสั่งแต่งตั้งและประกาศล่าสุด</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 font-mono">
                {filteredOrders.length} ฉบับ
              </span>
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ศูนย์รวบรวมคำสั่งแต่งตั้งโยกย้าย ประกาศ และกรอบอัตรากำลัง ตร. — ลิงก์ดาวน์โหลดข้อมูลใน human.police.go.th ได้เลย
            </p>
          </div>
        </div>

        {/* Search & Real-time Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเลขที่คำสั่ง, เรื่อง, หน่วยงาน..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-red-500 outline-hidden transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Direct Download Link to human.police.go.th */}
          <a
            href="https://human.police.go.th/home/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
            title="ดาวน์โหลดข้อมูลใน human.police.go.th ได้เลย"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ดาวน์โหลดใน human.police</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Real-time Export Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              title="ดาวน์โหลดและส่งออกข้อมูลทั้งหมดแบบเรียลไทม์"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>ส่งออก ({filteredOrders.length})</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 shadow-xl py-2 z-30 animate-fadeIn text-xs">
                <div className="px-3 py-1.5 font-bold text-slate-400 border-b border-slate-100 dark:border-slate-750 text-[10px] uppercase">
                  เลือกรูปแบบดาวน์โหลดเรียลไทม์
                </div>
                <button
                  onClick={handleExportAllExcel}
                  className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="font-bold">ดาวน์โหลด Excel (.xls)</div>
                    <div className="text-[10px] text-slate-400">ตารางข้อมูลพร้อมสูตรและสีทางการ</div>
                  </div>
                </button>
                <button
                  onClick={handleExportAllCSV}
                  className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="font-bold">ดาวน์โหลด CSV (.csv)</div>
                    <div className="text-[10px] text-slate-400">ไฟล์ UTF-8 สำหรับเปิดใน Excel</div>
                  </div>
                </button>
                <button
                  onClick={handleExportAllJSON}
                  className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="font-bold">ส่งออก JSON (.json)</div>
                    <div className="text-[10px] text-slate-400">โครงสร้างข้อมูลดิบเชิงระบบ</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Add Order Button */}
          <button
            onClick={() => setIsAddOrderModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            title="เพิ่มคำสั่ง / ประกาศใหม่"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">เพิ่มคำสั่ง</span>
          </button>
        </div>
      </div>

      {/* 2. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-[#0F1E36] text-amber-300 shadow-xs border border-amber-400/40'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          ทั้งหมด ({orders.length})
        </button>
        <button
          onClick={() => setSelectedCategory('appointment')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedCategory === 'appointment'
              ? 'bg-red-700 text-white shadow-xs border border-red-500'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          คำสั่งแต่งตั้ง ตร.
        </button>
        <button
          onClick={() => setSelectedCategory('announcement')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedCategory === 'announcement'
              ? 'bg-blue-700 text-white shadow-xs border border-blue-500'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          ประกาศ สกพ.
        </button>
        <button
          onClick={() => setSelectedCategory('regulation')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedCategory === 'regulation'
              ? 'bg-amber-700 text-white shadow-xs border border-amber-500'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          โครงสร้างและอัตรากำลัง
        </button>
      </div>

      {/* 3. Table Responsive Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0F1E36] text-white border-b border-[#1E3A5F]">
              <tr>
                <th scope="col" className="py-3 px-4 font-semibold whitespace-nowrap" style={{ width: '18%' }}>
                  เลขที่คำสั่ง
                </th>
                <th scope="col" className="py-3 px-4 font-semibold" style={{ width: '36%' }}>
                  ชื่อเรื่อง / ประกาศ
                </th>
                <th scope="col" className="py-3 px-4 font-semibold whitespace-nowrap" style={{ width: '18%' }}>
                  วันที่ลงนาม / มีผล
                </th>
                <th scope="col" className="py-3 px-4 font-semibold text-center whitespace-nowrap" style={{ width: '28%' }}>
                  ดาวน์โหลดใน human.police.go.th
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    ไม่พบรายการคำสั่งหรือประกาศที่ตรงกับคำค้นหา "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrderForView(order)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    {/* Order Number */}
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{order.orderNumber}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {order.urgency === 'critical' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                            ด่วนที่สุด
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {order.downloadCount.toLocaleString()} ครั้ง
                        </span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-100">
                      <div className="font-semibold text-xs leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {order.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {order.description}
                      </div>
                    </td>

                    {/* Signed Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{order.signedDate}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {order.pagesCount} หน้า · {order.fileSize}
                      </div>
                    </td>

                    {/* Direct Download in human.police.go.th & Action Buttons */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Direct Download in human.police.go.th Link */}
                        <a
                          href="https://human.police.go.th/home/"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            setOrders((prev) =>
                              prev.map((o) => (o.id === order.id ? { ...o, downloadCount: o.downloadCount + 1 } : o))
                            );
                            onShowToast(`📥 เปิดลิงก์ดาวน์โหลดเอกสาร ${order.orderNumber} ใน human.police.go.th`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl border border-emerald-400 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer whitespace-nowrap"
                          title={`คลิกลิงก์เพื่อดาวน์โหลดเอกสาร ${order.orderNumber} ใน human.police.go.th ได้เลย`}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>ดาวน์โหลดใน สกพ.</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {/* Local electronic doc download */}
                        <button
                          onClick={(e) => handleRealtimeDownloadDoc(order, e)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
                          title="ดาวน์โหลดไฟล์สำเนาอิเล็กทรอนิกส์ (.html/Word)"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          <span>สำเนา</span>
                        </button>

                        {/* Print / PDF */}
                        <button
                          onClick={(e) => handleRealtimePrintOrPdf(order, e)}
                          className="inline-flex items-center gap-1 p-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                          title="พิมพ์ / บันทึกเป็น PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Document Preview Modal */}
      {selectedOrderForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-50 dark:from-red-950/40 via-transparent to-transparent">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 font-mono">
                      {selectedOrderForView.orderNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {selectedOrderForView.categoryLabel}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                    {selectedOrderForView.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForView(null)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Official Document Preview Simulation */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* Direct Download in human.police.go.th Link Banner */}
              <div className="p-4 rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-emerald-950 dark:text-emerald-200 font-bold">
                  <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-black">ลิงก์ดาวน์โหลดข้อมูลใน human.police.go.th โดยตรง</div>
                    <div className="text-[11px] font-normal text-emerald-800 dark:text-emerald-300 opacity-90">
                      คลิกเพื่อเปิดดาวน์โหลดเอกสารต้นฉบับในเว็บไซต์ สำนักงานกำลังพล
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="https://human.police.go.th/home/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>ดาวน์โหลดใน human.police.go.th</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Official Document Sheet */}
              <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 shadow-inner space-y-4 text-center">
                {/* Emblem / Garuda Header */}
                <div className="flex flex-col items-center justify-center pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="w-12 h-12 text-amber-500 mb-1 flex items-center justify-center">
                    <PoliceEmblem className="w-10 h-10 text-[#0F1E36] dark:text-amber-400" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedOrderForView.issuer}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    เอกสารราชการอิเล็กทรอนิกส์ · ระบบสารบรรณ สำนักงานกำลังพล (human.police.go.th)
                  </div>
                </div>

                {/* Content Details */}
                <div className="text-left space-y-3 pt-2">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">เลขที่เอกสาร:</span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                      {selectedOrderForView.orderNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-400 block">เรื่อง:</span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {selectedOrderForView.title}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-400 block">สาระสำคัญ / รายละเอียดคำสั่ง:</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      {selectedOrderForView.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[11px] text-slate-400 block">วันที่ลงนาม:</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {selectedOrderForView.signedDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">มีผลบังคับใช้:</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {selectedOrderForView.effectiveDate || selectedOrderForView.signedDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs text-slate-400">
                สถิติดาวน์โหลด: {selectedOrderForView.downloadCount.toLocaleString()} ครั้ง
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Direct Download Link in human.police.go.th */}
                <a
                  href="https://human.police.go.th/home/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดใน human.police.go.th ได้เลย</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleRealtimePrintOrPdf(selectedOrderForView)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์ / PDF</span>
                </button>

                <button
                  onClick={() => handleRealtimeDownloadDoc(selectedOrderForView)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>สำเนาอิเล็กทรอนิกส์</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add New Order Modal */}
      {isAddOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-50 dark:from-red-950/40 via-transparent to-transparent">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-600" />
                <span>บันทึกคำสั่งและประกาศใหม่</span>
              </h3>
              <button
                onClick={() => setIsAddOrderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOrderSubmit} className="p-4 sm:p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  เลขที่คำสั่ง / ประกาศ *
                </label>
                <input
                  type="text"
                  required
                  value={newOrderNumber}
                  onChange={(e) => setNewOrderNumber(e.target.value)}
                  placeholder="เช่น คำสั่ง ตร. ที่ 125/2569 หรือ ประกาศ สกพ. ที่ 46/2569"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-hidden focus:border-red-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ชื่อเรื่อง / เรื่องประกาศ *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น เรื่อง แต่งตั้งโยกย้ายข้าราชการตำรวจชั้นสัญญาบัตร..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-hidden focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ประเภท</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-hidden focus:border-red-500 cursor-pointer"
                  >
                    <option value="appointment">คำสั่งแต่งตั้ง ตร.</option>
                    <option value="announcement">ประกาศ สกพ.</option>
                    <option value="regulation">โครงสร้าง/อัตรากำลัง</option>
                    <option value="transfer">การโยกย้ายกำลังพล</option>
                    <option value="award">ประกาศเกียรติคุณ</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">วันที่ลงนาม</label>
                  <input
                    type="text"
                    value={newSignedDate}
                    onChange={(e) => setNewSignedDate(e.target.value)}
                    placeholder="เช่น 1 ตุลาคม 2569"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  สาระสำคัญ / รายละเอียดคำสั่ง
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="ระบุสาระสำคัญ ขอบเขต และผลการบังคับใช้..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-hidden focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer shadow-xs transition-colors"
                >
                  บันทึกคำสั่ง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
