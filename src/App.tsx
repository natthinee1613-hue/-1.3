/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PoliceOfficer } from './types/personnel';
import { INITIAL_PERSONNEL } from './data/initialPersonnel';
import { THEMES, AppTheme } from './data/themes';
import { DirectoryCover } from './components/DirectoryCover';
import { DirectoryTable } from './components/DirectoryTable';
import { StatsDashboard } from './components/StatsDashboard';
import { OrgChart } from './components/OrgChart';
import { PersonnelModal } from './components/PersonnelModal';
import { ImportExportModal } from './components/ImportExportModal';
import { OfficerDetailModal } from './components/OfficerDetailModal';
import { DivisionsDirectoryTable } from './components/DivisionsDirectoryTable';
import { OfficialOrdersSection } from './components/OfficialOrdersSection';
import { ThaiKanokPattern } from './components/ThaiKanokPattern';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { RtpSummaryGridTable } from './components/RtpSummaryGridTable';
import { SamSaenRosterSection } from './components/SamSaenRosterSection';
import {
  CustomThemeSettings,
  DEFAULT_CUSTOM_THEME,
} from './types/themeCustomization';
import {
  BookOpen,
  Users,
  BarChart3,
  Network,
  Plus,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building,
  Building2,
  Globe,
  Radio,
  FileText,
  Palette,
  Table,
  Database,
} from 'lucide-react';

import {
  saveOfficersToCache,
  loadOfficersFromCache,
  clearOfficersCache,
  purgeLegacyLocalStorage,
  safeLocalStorageSet,
  safeLocalStorageGet,
} from './utils/storage';

export default function App() {
  // Purge legacy bloated keys immediately on initialization
  purgeLegacyLocalStorage();

  const [officers, setOfficers] = useState<PoliceOfficer[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(null);

  // Sync with live published roster from server on load, falling back to IndexedDB cache
  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      // 1. Try loading cached data from IndexedDB first for instant UI response
      try {
        const cached = await loadOfficersFromCache();
        if (isMounted && cached && cached.length > 0) {
          setOfficers(cached);
        }
      } catch (e) {
        // Ignored
      }

      // 2. Fetch live data from server (single source of truth)
      try {
        const res = await fetch('/api/officers');
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data)) {
            setOfficers(json.data);
            saveOfficersToCache(json.data);
            setLastPublishedAt(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
          }
        }
      } catch (err) {
        console.warn('Roster live sync warning:', err);
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper function to persist & publish roster live to server
  const publishToLiveServer = async (rosterToPublish: PoliceOfficer[], notify = false) => {
    try {
      setIsPublishing(true);
      // Asynchronously update IndexedDB cache
      saveOfficersToCache(rosterToPublish);

      const res = await fetch('/api/officers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officers: rosterToPublish,
          publishedBy: 'ผู้ดูแลระบบ สกพ.',
        }),
      });
      if (res.ok) {
        setLastPublishedAt(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
        if (rosterToPublish.length === 0) {
          showToast(`🟢 อัปเดตและเผยแพร่สถานะระบบว่างเปล่า (0 อัตรา) ลงเว็บไซต์เรียบร้อย`);
        } else {
          showToast(`🟢 เผยแพร่ข้อมูลล่าสุด ${rosterToPublish.length} อัตรา ลงเว็บไซต์เรียบร้อยแล้ว`);
        }
      }
    } catch (e) {
      console.warn('Publish to live server failed:', e);
    } finally {
      setIsPublishing(false);
    }
  };

  // Active Theme & Custom Appearance Settings (Persisted to storage)
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    return safeLocalStorageGet('police_app_theme_id') || THEMES[0].id;
  });

  const [customThemeSettings, setCustomThemeSettings] = useState<CustomThemeSettings>(() => {
    const saved = safeLocalStorageGet('police_app_custom_theme_config');
    if (saved) {
      try {
        return JSON.parse(saved) as CustomThemeSettings;
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_CUSTOM_THEME;
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const handleUpdateCustomThemeSettings = (newSettings: CustomThemeSettings) => {
    setCustomThemeSettings(newSettings);
    safeLocalStorageSet('police_app_custom_theme_config', JSON.stringify(newSettings));
  };

  const handleSelectAppTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    safeLocalStorageSet('police_app_theme_id', themeId);
    const matched = THEMES.find((t) => t.id === themeId);
    if (matched) {
      showToast(`เปลี่ยนธีมระบบเป็น "${matched.name}" เรียบร้อย`);
    }
  };

  const currentTheme: AppTheme = THEMES.find((t) => t.id === selectedThemeId) || THEMES[0];
  const isPastelTheme = !customThemeSettings.bgIsDark;

  const [activeView, setActiveView] = useState<'directory' | 'breakdown' | 'orgChart' | 'divisions' | 'orders' | 'rtpGrid' | 'samSaen'>('orgChart');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [subDivisionFilter, setSubDivisionFilter] = useState('all');

  // Modals state
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [personnelModalMode, setPersonnelModalMode] = useState<'add' | 'edit'>('add');
  const [selectedOfficerForEdit, setSelectedOfficerForEdit] = useState<PoliceOfficer | null>(null);

  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [importExportInitialTab, setImportExportInitialTab] = useState<'export' | 'upload' | 'paste' | 'clear' | 'reset'>('export');
  const [selectedOfficerForView, setSelectedOfficerForView] = useState<PoliceOfficer | null>(null);

  const handleOpenImportExport = (tab: 'export' | 'upload' | 'paste' | 'clear' | 'reset' = 'export') => {
    setImportExportInitialTab(tab);
    setIsImportExportOpen(true);
  };

  const handleClearAllOfficers = async () => {
    try {
      setIsPublishing(true);
      await fetch('/api/officers/clear', { method: 'POST' });
    } catch (e) {
      console.warn('Clear server error:', e);
    } finally {
      setIsPublishing(false);
    }
    setOfficers([]);
    clearOfficersCache();
    setLastPublishedAt(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
    showToast('ลบอัตราข้อมูลทั้งหมดในระบบเรียบร้อยแล้ว (0 อัตรา)');
  };

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };



  // CRUD Operations with Auto-Live Publish to Website
  const handleSaveOfficer = (officer: PoliceOfficer) => {
    setOfficers((prev) => {
      const existsIndex = prev.findIndex((o) => o.id === officer.id);
      let updated: PoliceOfficer[];
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = officer;
        showToast(`บันทึกการแก้ไขตำแหน่งเลขที่ ${officer.positionNumber} สำเร็จ`);
      } else {
        showToast(`เพิ่มข้อมูลกำลังพล ${officer.positionNumber} เรียบร้อยแล้ว`);
        updated = [officer, ...prev];
      }
      publishToLiveServer(updated);
      return updated;
    });
  };

  const handleDeleteOfficer = (officer: PoliceOfficer) => {
    if (
      window.confirm(
        `ยืนยันการลบข้อมูลตำแหน่งเลขที่ ${officer.positionNumber} (${
          officer.isVacant ? 'ตำแหน่งว่าง' : `${officer.rank} ${officer.firstName} ${officer.lastName}`
        }) หรือไม่?`
      )
    ) {
      setOfficers((prev) => {
        const updated = prev.filter((o) => o.id !== officer.id);
        publishToLiveServer(updated);
        return updated;
      });
      showToast(`ลบตำแหน่งเลขที่ ${officer.positionNumber} เรียบร้อยแล้ว`);
    }
  };

  const handleDeleteMultiple = (ids: string[]) => {
    setOfficers((prev) => {
      const updated = prev.filter((o) => !ids.includes(o.id));
      publishToLiveServer(updated);
      return updated;
    });
    showToast(`ลบข้อมูลกำลังพลที่เลือกจำนวน ${ids.length} รายการเรียบร้อยแล้ว`);
  };

  const handleImport = (newOfficers: PoliceOfficer[], mode: 'append' | 'update' | 'replace') => {
    let updatedList: PoliceOfficer[] = [];

    if (mode === 'replace') {
      updatedList = newOfficers;
      showToast(`แทนที่และเผยแพร่ข้อมูลกำลังพล ${newOfficers.length} อัตรา ล่าสุดสู่เว็บไซต์เรียบร้อย`);
    } else if (mode === 'append') {
      updatedList = [...officers, ...newOfficers];
      showToast(`เพิ่มและเผยแพร่ข้อมูลใหม่ ${newOfficers.length} อัตรา สู่เว็บไซต์เรียบร้อย`);
    } else if (mode === 'update') {
      const map = new Map(officers.map((o) => [o.positionNumber, o]));
      let updatedCount = 0;
      let addedCount = 0;

      newOfficers.forEach((o) => {
        if (map.has(o.positionNumber)) {
          map.set(o.positionNumber, { ...map.get(o.positionNumber)!, ...o });
          updatedCount++;
        } else {
          map.set(o.positionNumber, o);
          addedCount++;
        }
      });

      updatedList = Array.from(map.values());
      showToast(`อัปเดตข้อมูล ${updatedCount} รายการ และเพิ่มใหม่ ${addedCount} รายการ (เผยแพร่รวม ${updatedList.length} อัตรา)`);
    }

    setOfficers(updatedList);
    publishToLiveServer(updatedList);
  };

  const handleResetDefault = async () => {
    try {
      await fetch('/api/officers/reset', { method: 'POST' });
    } catch (e) {}
    setOfficers([]);
    clearOfficersCache();
    publishToLiveServer([]);
    showToast('คืนค่าข้อมูลทำเนียบกำลังพลเริ่มต้นเป็น 0 อัตรา เรียบร้อยแล้ว');
  };

  const handleSelectDivisionFromCover = (div: string) => {
    setDivisionFilter(div);
    setSubDivisionFilter('all');
    setActiveView('directory');
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-['Prompt',sans-serif] transition-colors duration-200 ${
        currentTheme.bgApp
      } ${currentTheme.textMain}`}
      style={{
        backgroundColor: customThemeSettings.customBgColor || undefined,
        color: customThemeSettings.customTextColor || undefined,
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl animate-bounce text-xs border ${
            currentTheme.isDark
              ? 'bg-slate-900 border-amber-500/50 text-slate-100'
              : 'bg-white border-blue-500/80 text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Contract (Dignified Navy Header) */}
      <header
        className={`sticky top-0 z-40 w-full backdrop-blur-md border-b print:hidden transition-colors ${
          currentTheme.headerBg
        } ${currentTheme.headerBorder}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Navigation Links */}
          <div className="flex items-center gap-4 lg:gap-6 min-w-0">
            <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 text-xs font-semibold">
              <button
                onClick={() => setActiveView('orgChart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  activeView === 'orgChart' ? currentTheme.navActive : currentTheme.navInactive
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                แผนผังโครงสร้าง
              </button>

              <button
                onClick={() => setActiveView('divisions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  activeView === 'divisions' ? currentTheme.navActive : currentTheme.navInactive
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                ตาราง บก. / กอง
              </button>

              <button
                onClick={() => {
                  setDivisionFilter('all');
                  setSubDivisionFilter('all');
                  setActiveView('directory');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  activeView === 'directory' ? currentTheme.navActive : currentTheme.navInactive
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                ทำเนียบกำลังพล
                <span
                  className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30"
                >
                  {officers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveView('breakdown')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  activeView === 'breakdown' ? currentTheme.navActive : currentTheme.navInactive
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                แยกย่อยองค์ประกอบ
              </button>

              <button
                onClick={() => setActiveView('orders')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  activeView === 'orders' ? currentTheme.navActive : currentTheme.navInactive
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-red-400" />
                <span>คำสั่งและประกาศ</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              </button>

              <button
                onClick={() => setActiveView('rtpGrid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  activeView === 'rtpGrid' ? currentTheme.navActive : currentTheme.navInactive
                }`}
              >
                <Table className="w-3.5 h-3.5 text-amber-400" />
                <span>ตารางอัตรากำลัง ตร.</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  ใหม่
                </span>
              </button>

              <button
                onClick={() => setActiveView('samSaen')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  activeView === 'samSaen' ? currentTheme.navActive : currentTheme.navInactive
                }`}
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>ทำเนียบสามแสน</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  300K
                </span>
              </button>
            </nav>
          </div>

          {/* Zone 3: Primary Action buttons & Status */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme & Color Customizer Button */}
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs text-amber-300 bg-amber-400/15 hover:bg-amber-400/25 border-[#C5A059] hover:border-amber-400"
              title="ปรับแต่งสีธีมแผนผัง สีพื้นหลังหลัก และสีตัวอักษร"
            >
              <Palette className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">สี & ธีม</span>
            </button>

            {/* Live Published Status & One-Click Publish Button */}
            <button
              onClick={() => publishToLiveServer(officers)}
              disabled={isPublishing}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                isPublishing
                  ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900'
              }`}
              title="สถานะข้อมูลบนเว็บไซต์: เผยแพร่แล้ว สามารถกดเพื่อเผยแพร่ข้อมูลกำลังพลล่าสุดลงสู่เว็บไซต์จริงได้ทันที"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block shrink-0" />
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-['Prompt',sans-serif] whitespace-nowrap hidden lg:inline">
                {isPublishing ? 'กำลังเผยแพร่...' : `เผยแพร่แล้ว (${officers.length} อัตรา)`}
              </span>
              <span className="font-['Prompt',sans-serif] whitespace-nowrap lg:hidden">
                {isPublishing ? '...' : `${officers.length}`}
              </span>
            </button>

            <button
              onClick={() => handleOpenImportExport('export')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer shadow-2xs text-slate-200 bg-white/10 hover:bg-white/20 border-white/20"
              title="ศูนย์ดาวน์โหลดและอัปเดตข้อมูลกำลังพล (ส่งออก / อัปโหลด / ล้างข้อมูล)"
            >
              <Upload className="w-3.5 h-3.5 text-blue-300" />
              <span>อัปเดต / ส่งออก</span>
            </button>

            <button
              onClick={() => {
                setSelectedOfficerForEdit(null);
                setPersonnelModalMode('add');
                setIsPersonnelModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-slate-950" />
              <span>เพิ่มกำลังพล</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div
          className={`flex md:hidden border-t px-2 py-1.5 overflow-x-auto gap-1 text-[11px] ${
            currentTheme.isDark ? 'bg-slate-950 border-slate-800' : 'bg-[#F8FAFC] border-slate-200'
          }`}
        >
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="px-2.5 py-1 rounded-lg whitespace-nowrap font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1"
          >
            <Palette className="w-3 h-3" />
            <span>สี & ธีม</span>
          </button>
          <button
            onClick={() => setActiveView('orgChart')}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium ${
              activeView === 'orgChart' ? 'font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'text-slate-500'
            }`}
          >
            แผนผังโครงสร้าง
          </button>
          <button
            onClick={() => setActiveView('divisions')}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium ${
              activeView === 'divisions' ? 'font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'text-slate-500'
            }`}
          >
            ตาราง บก./กอง
          </button>
          <button
            onClick={() => {
              setDivisionFilter('all');
              setSubDivisionFilter('all');
              setActiveView('directory');
            }}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium ${
              activeView === 'directory' ? 'font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'text-slate-500'
            }`}
          >
            ทำเนียบกำลังพล ({officers.length})
          </button>
          <button
            onClick={() => setActiveView('breakdown')}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium ${
              activeView === 'breakdown' ? 'font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'text-slate-500'
            }`}
          >
            แยกย่อยองค์ประกอบ
          </button>
          <button
            onClick={() => setActiveView('orders')}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium flex items-center gap-1 ${
              activeView === 'orders' ? 'font-bold bg-red-500/20 text-red-700 dark:text-red-400' : 'text-slate-500'
            }`}
          >
            <FileText className="w-3 h-3 text-red-500" />
            คำสั่ง/ประกาศ
          </button>
          <button
            onClick={() => setActiveView('rtpGrid')}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium flex items-center gap-1 ${
              activeView === 'rtpGrid' ? 'font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'text-slate-500'
            }`}
          >
            <Table className="w-3 h-3 text-amber-500" />
            ตารางอัตรากำลัง ตร.
          </button>
          <button
            onClick={() => setActiveView('samSaen')}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium flex items-center gap-1 ${
              activeView === 'samSaen' ? 'font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'text-slate-500'
            }`}
          >
            <Database className="w-3 h-3 text-amber-500" />
            ทำเนียบสามแสน
          </button>
          <button
            onClick={() => handleOpenImportExport('export')}
            className="px-2.5 py-1 rounded-lg whitespace-nowrap text-blue-600 font-bold"
          >
            อัปเดต/ส่งออก
          </button>
          <button
            onClick={() => publishToLiveServer(officers)}
            disabled={isPublishing}
            className="px-2.5 py-1 rounded-lg whitespace-nowrap text-emerald-600 font-bold flex items-center gap-1"
          >
            <Globe className="w-3 h-3" />
            {isPublishing ? 'เผยแพร่...' : `เผยแพร่ (${officers.length})`}
          </button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeView === 'orgChart' && (
          <OrgChart
            officers={officers}
            onSelectSubDivision={(div, sub) => {
              setDivisionFilter(div);
              setSubDivisionFilter(sub);
              setActiveView('directory');
            }}
            onViewOfficer={(officer) => setSelectedOfficerForView(officer)}
            onEditOfficer={(officer) => {
              setSelectedOfficerForEdit(officer);
              setPersonnelModalMode('edit');
              setIsPersonnelModalOpen(true);
            }}
            onDeleteOfficer={handleDeleteOfficer}
            onAddOfficerToSubDiv={(div, sub) => {
              setSelectedOfficerForEdit({
                id: `p-${Date.now()}`,
                positionNumber: '',
                bureau: 'สกพ.',
                division: div,
                subDivision: sub === '__ALL__' ? (div === 'สกพ.' ? 'สกพ.' : div) : sub,
                jobGroup: 'อำนวยการและสนับสนุน',
                jobLine: '',
                duty: '',
                positionLevel: 'สว.',
                positionTitle: '',
                commissionType: 'สัญญาบัตร',
                rank: 'พ.ต.ท.',
                firstName: '',
                lastName: '',
                gender: 'ชาย',
                isVacant: false,
              });
              setPersonnelModalMode('add');
              setIsPersonnelModalOpen(true);
            }}
            currentTheme={currentTheme}
            customThemeSettings={customThemeSettings}
            onOpenThemeCustomizer={() => setIsThemeModalOpen(true)}
          />
        )}

        {activeView === 'divisions' && (
          <DivisionsDirectoryTable
            officers={officers}
            onOpenDivisionDetail={(sub, bureau) => {
              const clean = sub.replace(/\(.*?\)/g, '').trim();
              setDivisionFilter(clean);
              setSubDivisionFilter('all');
              setActiveView('directory');
            }}
            onAddOfficerToDivision={(div, sub) => {
              setSelectedOfficerForEdit({
                id: `p-${Date.now()}`,
                positionNumber: '',
                bureau: 'สกพ.',
                division: div,
                subDivision: sub === '__ALL__' ? (div === 'สกพ.' ? 'สกพ.' : div) : sub,
                jobGroup: 'อำนวยการและสนับสนุน',
                jobLine: '',
                duty: '',
                positionLevel: 'สว.',
                positionTitle: '',
                commissionType: 'สัญญาบัตร',
                rank: 'พ.ต.ท.',
                firstName: '',
                lastName: '',
                gender: 'ชาย',
                isVacant: false,
              });
              setPersonnelModalMode('add');
              setIsPersonnelModalOpen(true);
            }}
            onOpenInMainTable={(targetDiv) => {
              setDivisionFilter(targetDiv);
              setSubDivisionFilter('all');
              setActiveView('directory');
            }}
            currentTheme={currentTheme}
          />
        )}

        {activeView === 'directory' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-lg font-bold font-['Chakra_Petch',sans-serif] ${currentTheme.textMain}`}>
                  ระบบทะเบียนและทำเนียบกำลังพล สกพ.
                </h2>
                <p className={`text-xs ${currentTheme.textMuted}`}>
                  ตรวจสอบ ค้นหา แก้ไข ลบ อัปโหลด และส่งออกข้อมูลอัตรากำลังพลครบทุกหน่วยงาน · ธีม: {currentTheme.name}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenImportExport('export')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer shadow-2xs ${
                    currentTheme.isDark
                      ? 'text-slate-300 bg-slate-900 hover:bg-slate-800 border-slate-700'
                      : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-300'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  ดาวน์โหลดรายงาน
                </button>
              </div>
            </div>

            <DirectoryTable
              officers={officers}
              onAddOfficer={() => {
                setSelectedOfficerForEdit(null);
                setPersonnelModalMode('add');
                setIsPersonnelModalOpen(true);
              }}
              onEditOfficer={(officer) => {
                setSelectedOfficerForEdit(officer);
                setPersonnelModalMode('edit');
                setIsPersonnelModalOpen(true);
              }}
              onDeleteOfficer={handleDeleteOfficer}
              onDeleteMultiple={handleDeleteMultiple}
              onOpenImportExport={(tab) => handleOpenImportExport(tab || 'export')}
              onClearAllOfficers={handleClearAllOfficers}
              onViewOfficer={(officer) => setSelectedOfficerForView(officer)}
              initialDivisionFilter={divisionFilter}
              initialSubDivisionFilter={subDivisionFilter}
              onClearFilters={() => {
                setDivisionFilter('all');
                setSubDivisionFilter('all');
              }}
              isPastelTheme={isPastelTheme}
            />
          </div>
        )}

        {activeView === 'breakdown' && (
          <StatsDashboard
            officers={officers}
            onSelectDivisionFilter={(div) => {
              setDivisionFilter(div);
              setSubDivisionFilter('all');
              setActiveView('directory');
            }}
            onSelectSubDivisionFilter={(sub, div) => {
              if (div) setDivisionFilter(div);
              setSubDivisionFilter(sub);
              setActiveView('directory');
            }}
            onSelectCustomFilter={(filterType, val) => {
              if (filterType === 'division') {
                setDivisionFilter(val);
                setSubDivisionFilter('all');
              } else if (filterType === 'subDivision') {
                setSubDivisionFilter(val);
              }
              setActiveView('directory');
            }}
            isPastelTheme={isPastelTheme}
          />
        )}

        {activeView === 'orders' && (
          <OfficialOrdersSection
            currentTheme={currentTheme}
            onShowToast={showToast}
          />
        )}

        {activeView === 'rtpGrid' && (
          <RtpSummaryGridTable
            currentTheme={currentTheme}
            officers={officers}
            onShowToast={showToast}
          />
        )}

        {activeView === 'samSaen' && (
          <SamSaenRosterSection
            currentTheme={currentTheme}
            globalOfficers={officers}
            onShowToast={showToast}
            onSelectOfficer={(officer) => setSelectedOfficerForView(officer)}
          />
        )}
      </main>

      {/* Modals */}
      <PersonnelModal
        isOpen={isPersonnelModalOpen}
        onClose={() => setIsPersonnelModalOpen(false)}
        onSave={handleSaveOfficer}
        initialOfficer={selectedOfficerForEdit}
        mode={personnelModalMode}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        officers={officers}
        onImport={handleImport}
        onResetDefault={handleResetDefault}
        onClearAllOfficers={handleClearAllOfficers}
        initialTab={importExportInitialTab}
      />

      <OfficerDetailModal
        isOpen={!!selectedOfficerForView}
        officer={selectedOfficerForView}
        onClose={() => setSelectedOfficerForView(null)}
        onEdit={(officer) => {
          setSelectedOfficerForEdit(officer);
          setPersonnelModalMode('edit');
          setIsPersonnelModalOpen(true);
        }}
        onDelete={handleDeleteOfficer}
      />

      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        settings={customThemeSettings}
        onUpdateSettings={handleUpdateCustomThemeSettings}
        currentTheme={currentTheme}
        onSelectAppTheme={handleSelectAppTheme}
      />

      {/* Footer */}
      <footer
        className={`border-t py-6 text-center text-xs print:hidden ${
          currentTheme.isDark
            ? 'bg-slate-950 border-slate-900 text-slate-500'
            : 'bg-white border-slate-200 text-slate-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${currentTheme.textMain}`}>
              ทำเนียบกำลังพล สำนักงานกำลังพล สำนักงานตำรวจแห่งชาติ (สกพ.)
            </span>
          </div>
          <div>
            <span>ประจำปีงบประมาณ พ.ศ. ๒๕๖๙ · ธีม: {currentTheme.name}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
