/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PoliceOfficer } from '../types/personnel';
import { AppTheme } from '../data/themes';
import { CustomThemeSettings } from '../types/themeCustomization';
import { PoliceEmblem } from './PoliceEmblem';
import { ThaiKanokPattern } from './ThaiKanokPattern';
import {
  Shield,
  Building2,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Eye,
  Edit2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  LayoutGrid,
  BarChart3,
  Layers,
  ArrowRight,
  UserCheck,
  UserX,
  Compass,
  Briefcase,
  GraduationCap,
  Scale,
  Crosshair,
  Radio,
  FileText,
  MapPin,
  Sparkles,
  Info,
  X,
  Filter,
  Palette
} from 'lucide-react';

interface OrgChartProps {
  officers: PoliceOfficer[];
  onSelectSubDivision: (division: string, subDiv: string) => void;
  onViewOfficer: (officer: PoliceOfficer) => void;
  onEditOfficer?: (officer: PoliceOfficer) => void;
  onDeleteOfficer?: (officer: PoliceOfficer) => void;
  onAddOfficerToSubDiv?: (division: string, subDiv: string) => void;
  currentTheme: AppTheme;
  customThemeSettings?: CustomThemeSettings;
  onOpenThemeCustomizer?: () => void;
}

import {
  PoliceGroup,
  PoliceBureauNode,
  RTP_BUREAUS_DATA,
  getOfficersForDivision,
} from '../data/rtpStructure';
import { DivisionsDirectoryTable } from './DivisionsDirectoryTable';

export type { PoliceGroup, PoliceBureauNode };
export { getOfficersForDivision };

const RTP_BUREAUS = RTP_BUREAUS_DATA;

export const OrgChart: React.FC<OrgChartProps> = ({
  officers,
  onSelectSubDivision,
  onViewOfficer,
  onEditOfficer = () => {},
  onDeleteOfficer = () => {},
  onAddOfficerToSubDiv = () => {},
  currentTheme,
  customThemeSettings,
  onOpenThemeCustomizer,
}) => {
  // Navigation & Filtering State
  const [selectedGroup, setSelectedGroup] = useState<PoliceGroup>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewLayout, setViewLayout] = useState<'hierarchy' | 'cards' | 'divisions_table'>('hierarchy');

  // Modal State for Parent Bureau (บช.)
  const [selectedBureauModal, setSelectedBureauModal] = useState<PoliceBureauNode | null>(null);

  // Modal State for Subordinate Division (บก. / กอง ในสังกัด)
  const [selectedDivisionModal, setSelectedDivisionModal] = useState<{
    divisionRawName: string;
    bureau: PoliceBureauNode;
    matchedDivisionName: string;
  } | null>(null);

  // Filter inside the Division Detail Modal
  const [divisionModalSearch, setDivisionModalSearch] = useState('');
  const [divisionModalStatus, setDivisionModalStatus] = useState<'all' | 'occupied' | 'vacant'>('all');
  const [bureauModalSubSearch, setBureauModalSubSearch] = useState('');

  // Group Personnel Mapping (Counts how many officers in the uploaded roster map to which Bureau)
  const rosterMapping = useMemo(() => {
    const map: Record<string, { total: number; occupied: number; vacant: number; officers: PoliceOfficer[] }> = {};

    // Initialize map for all bureaus
    RTP_BUREAUS.forEach((b) => {
      map[b.id] = { total: 0, occupied: 0, vacant: 0, officers: [] };
    });

    // Count officers from the active database
    officers.forEach((officer) => {
      const bCode = officer.bureau?.trim() || 'สกพ.';
      let matchedBureauId = 'สกพ.'; // Default fallback

      const directMatch = RTP_BUREAUS.find(
        (b) => b.id === bCode || b.code === bCode || b.fullName.includes(bCode) || bCode.includes(b.code)
      );

      if (directMatch) {
        matchedBureauId = directMatch.id;
      }

      if (!map[matchedBureauId]) {
        map[matchedBureauId] = { total: 0, occupied: 0, vacant: 0, officers: [] };
      }

      map[matchedBureauId].total += 1;
      if (officer.isVacant) {
        map[matchedBureauId].vacant += 1;
      } else {
        map[matchedBureauId].occupied += 1;
      }
      map[matchedBureauId].officers.push(officer);
    });

    return map;
  }, [officers]);

  // Filtered Bureaus
  const filteredBureaus = useMemo(() => {
    return RTP_BUREAUS.filter((bureau) => {
      // Group filter
      if (selectedGroup !== 'all' && bureau.group !== selectedGroup) {
        return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesCode = bureau.code.toLowerCase().includes(q);
        const matchesName = bureau.fullName.toLowerCase().includes(q);
        const matchesJurisdiction = bureau.jurisdiction.toLowerCase().includes(q);
        const matchesDesc = bureau.description.toLowerCase().includes(q);
        const matchesSub = bureau.subDivisions.some((s) => s.toLowerCase().includes(q));

        return matchesCode || matchesName || matchesJurisdiction || matchesDesc || matchesSub;
      }

      return true;
    });
  }, [selectedGroup, searchTerm]);

  // Open division modal handler
  const handleOpenDivisionDetail = (divRawName: string, bureau: PoliceBureauNode) => {
    const { matchedDivisionName } = getOfficersForDivision(divRawName, bureau, officers);
    setSelectedDivisionModal({
      divisionRawName: divRawName,
      bureau,
      matchedDivisionName,
    });
    setDivisionModalSearch('');
    setDivisionModalStatus('all');
  };

  // Current officers for selected division modal
  const activeDivisionData = useMemo(() => {
    if (!selectedDivisionModal) return null;
    const { matchedDivisionName, officers: matchedOffs, cleanName } = getOfficersForDivision(
      selectedDivisionModal.divisionRawName,
      selectedDivisionModal.bureau,
      officers
    );

    const filtered = matchedOffs.filter((o) => {
      if (divisionModalStatus === 'occupied' && o.isVacant) return false;
      if (divisionModalStatus === 'vacant' && !o.isVacant) return false;

      if (divisionModalSearch.trim()) {
        const q = divisionModalSearch.toLowerCase().trim();
        const fullName = `${o.rank} ${o.firstName} ${o.lastName}`.toLowerCase();
        return (
          fullName.includes(q) ||
          o.positionNumber?.toLowerCase().includes(q) ||
          o.positionTitle?.toLowerCase().includes(q) ||
          o.duty?.toLowerCase().includes(q) ||
          o.subDivision?.toLowerCase().includes(q) ||
          o.positionLevel?.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const total = matchedOffs.length;
    const occupied = matchedOffs.filter((o) => !o.isVacant).length;
    const vacant = matchedOffs.filter((o) => o.isVacant).length;
    const rate = total > 0 ? ((occupied / total) * 100).toFixed(0) : '0';

    return {
      rawName: selectedDivisionModal.divisionRawName,
      cleanName,
      matchedDivisionName,
      bureau: selectedDivisionModal.bureau,
      total,
      occupied,
      vacant,
      rate,
      allOfficers: matchedOffs,
      filteredOfficers: filtered,
    };
  }, [selectedDivisionModal, officers, divisionModalSearch, divisionModalStatus]);

  // Top Apex Metrics
  const totalBureausCount = RTP_BUREAUS.length;
  const commandSupportCount = RTP_BUREAUS.filter((b) => b.group === 'command_support').length;
  const areaCount = RTP_BUREAUS.filter((b) => b.group === 'area_commands').length;
  const specCount = RTP_BUREAUS.filter((b) => b.group === 'specialized').length;
  const eduCount = RTP_BUREAUS.filter((b) => b.group === 'education').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Card - Royal Thai Police Organization (สำนักงานตำรวจแห่งชาติ ตร.) matching User Reference */}
      <div className="rounded-2xl border-2 border-[#C5A059] bg-gradient-to-r from-[#0B2545] via-[#0D2E56] to-[#071930] text-white p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle Royal Thai Kanok Background */}
        <ThaiKanokPattern opacity={0.12} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Brand & Crest Info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#143765] to-[#081C36] border-2 border-[#D4AF37] flex items-center justify-center p-2 shadow-lg shadow-black/40 shrink-0">
              <PoliceEmblem className="w-10 h-10 text-amber-300 filter drop-shadow-md" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                  <span className="gold-shimmer-text">สำนักงานตำรวจแห่งชาติ (ตร.)</span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm mt-0.5 text-[#FFE066] font-bold drop-shadow-xs">
                ระบบบริหารจัดการทรัพยากรบุคคล
              </p>
              <p className="text-xs mt-1 text-slate-200 font-medium">
                โครงสร้างองค์กร และการบริหารกำลังพลแบบรวมศูนย์ - คลิกเลือกหน่วยงานเพื่อดูรายละเอียด
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar - Executive Dark Charcoal & Gold Palette */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="px-3.5 py-2.5 rounded-xl border border-[#C5A059]/70 bg-gradient-to-b from-[#222B3A] to-[#171E2A] text-center shadow-xs">
              <div className="text-[11px] text-slate-200 font-black whitespace-nowrap">ฝ่ายอำนวยการและสนับสนุน</div>
              <div className="text-base font-black text-amber-300 font-mono mt-0.5">11 บช.</div>
              <div className="text-xs mt-1 flex justify-center text-amber-400 font-extrabold">🏛️ 📋</div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl border border-[#C5A059]/70 bg-gradient-to-b from-[#222B3A] to-[#171E2A] text-center shadow-xs">
              <div className="text-[11px] text-slate-200 font-black whitespace-nowrap">ฝ่ายปฏิบัติการ</div>
              <div className="text-base font-black text-amber-300 font-mono mt-0.5">10 บช.</div>
              <div className="text-xs mt-1 flex justify-center text-blue-400 font-extrabold">🛡️ 👮</div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl border border-[#C5A059]/70 bg-gradient-to-b from-[#222B3A] to-[#171E2A] text-center shadow-xs">
              <div className="text-[11px] text-slate-200 font-black whitespace-nowrap">ฝ่ายสอบสวนและสืบสวน</div>
              <div className="text-base font-black text-amber-300 font-mono mt-0.5">7 บช.</div>
              <div className="text-xs mt-1 flex justify-center text-emerald-400 font-extrabold">🔍 ⚖️</div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl border border-[#C5A059]/70 bg-gradient-to-b from-[#222B3A] to-[#171E2A] text-center shadow-xs">
              <div className="text-[11px] text-slate-200 font-black whitespace-nowrap">สถาบันการศึกษาและวิจัย</div>
              <div className="text-base font-black text-amber-300 font-mono mt-0.5">2 หน่วย</div>
              <div className="text-xs mt-1 flex justify-center text-purple-400 font-extrabold">🎓 📚</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls & Filter Bar - Dark Slate Gray & Gold Theme */}
      <div className="p-3 rounded-2xl border border-[#374151] bg-[#1E2533] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* 4 Pillars Filter Tabs matching Reference */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              selectedGroup === 'all'
                ? 'bg-[#0B2545] text-[#FFE066] border border-amber-400/90 shadow-xs ring-1 ring-amber-400/50'
                : 'bg-[#283142] text-slate-200 border border-[#3E4A5E] hover:border-amber-400 hover:bg-[#313C4F] font-extrabold'
            }`}
          >
            ทั้งหมด (32)
          </button>
          <button
            onClick={() => setSelectedGroup('command_support')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedGroup === 'command_support'
                ? 'bg-[#0B2545] text-[#FFE066] border border-amber-400/90 shadow-xs ring-1 ring-amber-400/50'
                : 'bg-[#283142] text-slate-200 border border-[#3E4A5E] hover:border-amber-400 hover:bg-[#313C4F] font-extrabold'
            }`}
          >
            <span>🛡️</span>
            ฝ่ายอำนวยการและสนับสนุน (11)
          </button>
          <button
            onClick={() => setSelectedGroup('area_commands')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedGroup === 'area_commands'
                ? 'bg-[#0B2545] text-[#FFE066] border border-amber-400/90 shadow-xs ring-1 ring-amber-400/50'
                : 'bg-[#283142] text-slate-200 border border-[#3E4A5E] hover:border-amber-400 hover:bg-[#313C4F] font-extrabold'
            }`}
          >
            <span>🎖️</span>
            ฝ่ายปฏิบัติการ (10)
          </button>
          <button
            onClick={() => setSelectedGroup('specialized')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedGroup === 'specialized'
                ? 'bg-[#0B2545] text-[#FFE066] border border-amber-400/90 shadow-xs ring-1 ring-amber-400/50'
                : 'bg-[#283142] text-slate-200 border border-[#3E4A5E] hover:border-amber-400 hover:bg-[#313C4F] font-extrabold'
            }`}
          >
            <span>🔍</span>
            ฝ่ายสอบสวนและสืบสวน (7)
          </button>
        </div>

        {/* Search Box & Layout Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหากองบัญชาการ, บก./กอง..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-bold rounded-xl border border-[#3E4A5E] bg-[#171D28] text-slate-100 placeholder-slate-400 focus:border-[#C5A059] focus:ring-1 focus:ring-amber-400/30 outline-hidden transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Layout Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#111620] border border-[#C5A059] text-[11px] gap-0.5 shrink-0 shadow-2xs">
            <button
              onClick={() => setViewLayout('hierarchy')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-black ${
                viewLayout === 'hierarchy'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white font-bold'
              }`}
              title="ผังสายบังคับบัญชาแบบต้นไม้ (Hierarchy Tree)"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ผังโครงสร้าง</span>
            </button>
            <button
              onClick={() => setViewLayout('cards')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-black ${
                viewLayout === 'cards'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white font-bold'
              }`}
              title="การ์ดดัชนีหน่วยงานทั้งหมด (Grid Cards)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">การ์ด บช.</span>
            </button>
            <button
              onClick={() => setViewLayout('divisions_table')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-black ${
                viewLayout === 'divisions_table'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white font-bold'
              }`}
              title="ตารางหน่วยงานระดับกองบังคับการ (บก. / กอง) ในสังกัด แต่ละ บช."
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>ตาราง บก./กอง</span>
            </button>
          </div>

          {/* Quick Theme Customizer Button */}
          {onOpenThemeCustomizer && (
            <button
              onClick={onOpenThemeCustomizer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C5A059] bg-gradient-to-r from-amber-500/15 via-[#222938] to-amber-500/15 hover:from-amber-500/30 hover:to-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-black transition-all cursor-pointer shadow-2xs shrink-0"
              title="ปรับแต่งสีธีมแผนผัง สีพื้นหลังหลัก และสีตัวอักษร"
            >
              <Palette className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">สีธีมแผนผัง</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. MAIN BODY: DIVISIONS TABLE OR (LEADERSHIP + HIERARCHY / CARDS) */}
      {viewLayout === 'divisions_table' ? (
        <DivisionsDirectoryTable
          officers={officers}
          onOpenDivisionDetail={(sub, bureau) => handleOpenDivisionDetail(sub, bureau)}
          onAddOfficerToDivision={(div, sub) => onAddOfficerToSubDiv(div, sub)}
          onOpenInMainTable={(targetDiv) => onSelectSubDivision(targetDiv, '__ALL__')}
          currentTheme={currentTheme}
        />
      ) : (
        <>
          {/* TOP LEADERSHIP NODE: ผู้บัญชาการตำรวจแห่งชาติ (ผบ.ตร.) Matching Reference Image */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 my-2">
            {/* Left Hierarchy Stack Pills */}
            <div className="hidden xl:flex flex-col gap-2.5 items-end">
              <div className="px-4 py-1.5 rounded-xl border-2 border-[#C5A059] bg-[#222938] text-amber-300 font-black text-xs shadow-xs text-center min-w-[105px]">
                ผบ.ตร.
              </div>
              <div className="px-4 py-1.5 rounded-xl border border-[#C5A059]/70 bg-[#222938] text-slate-200 font-bold text-xs shadow-xs text-center min-w-[105px]">
                รอง ตร.
              </div>
              <div className="px-4 py-1.5 rounded-xl border border-[#C5A059]/70 bg-[#222938] text-slate-200 font-bold text-xs shadow-xs text-center min-w-[105px]">
                ผู้ช่วย ตร.
              </div>
              <div className="px-4 py-1.5 rounded-xl border border-[#C5A059]/70 bg-[#222938] text-slate-200 font-bold text-xs shadow-xs text-center min-w-[105px]">
                ตราง ผบ.ตร.
              </div>
            </div>

            {/* Tree Line Connector */}
            <div className="hidden xl:flex items-center text-[#C5A059]">
              <div className="w-8 h-0.5 bg-[#C5A059]" />
              <div className="w-2.5 h-2.5 rotate-45 border-t border-r border-[#C5A059] bg-[#222938]" />
            </div>

            {/* Central Main Leadership Card (Navy Top Header + Dark Charcoal Lower Section) */}
            <div className="w-full max-w-2xl rounded-2xl border-2 border-[#C5A059] bg-[#1E2533] shadow-lg overflow-hidden">
              {/* Card Navy Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0B2545] via-[#0D2E56] to-[#071930] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
                <ThaiKanokPattern opacity={0.1} />

                <div className="relative z-10 max-w-xl">
                  <h2 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                    ผู้บัญชาการตำรวจแห่งชาติ (ผบ.ตร.)
                  </h2>
                  <p className="text-xs text-[#FFE066] font-semibold mt-1 leading-relaxed">
                    เป็น "ผู้นำตำรวจของทุกคน" โดยยึดหลักความยุติธรรม ไม่แบ่งแยกภูมิภาคหรือสถาบัน และมุ่งเน้นผลสัมฤทธิ์ของงานเป็นสำคัญ
                  </p>
                </div>

                {/* Roster Badge */}
                <div className="relative z-10 self-start sm:self-auto shrink-0">
                  <div className="px-3 py-1.5 rounded-xl border border-white/30 bg-white/10 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <Users className="w-3.5 h-3.5 text-[#FFE066]" />
                    <span className="text-slate-100">กำลังพลโปรแกรม:</span>
                    <span className="font-black text-[#FFE066] font-mono">{officers.length.toLocaleString()} นาย</span>
                  </div>
                </div>
              </div>

              {/* Lower 3-Tier Leadership Badges in Dark Charcoal Slate */}
              <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#1E2533]">
                <div className="p-3 rounded-xl border-2 border-[#D4AF37] bg-gradient-to-b from-[#283142] to-[#1C2330] flex flex-col justify-center shadow-xs">
                  <div className="text-xs font-black text-slate-100 truncate">ผู้บัญชาการตำรวจแห่งชาติ</div>
                  <div className="text-[11px] text-amber-300 font-extrabold truncate mt-0.5">พล.ต.อ. (ผู้บัญชาการ)</div>
                </div>

                <div className="p-3 rounded-xl border border-[#C5A059] bg-gradient-to-b from-[#283142] to-[#1C2330] flex flex-col justify-center shadow-xs">
                  <div className="text-xs font-black text-slate-100 truncate">รอง ผบ.ตร. / จตช.</div>
                  <div className="text-[11px] text-amber-300 font-extrabold truncate mt-0.5">พล.ต.อ. (คุมงาน 6 ด้านหลัก)</div>
                </div>

                <div className="p-3 rounded-xl border border-[#C5A059] bg-gradient-to-b from-[#283142] to-[#1C2330] flex flex-col justify-center shadow-xs">
                  <div className="text-xs font-black text-slate-100 truncate">ผู้ช่วย ผบ.ตร.</div>
                  <div className="text-[11px] text-amber-300 font-extrabold truncate mt-0.5">พล.ต.ท. (กำกับการปฏิบัติการ)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tree Line Connector to Pillars */}
          <div className="flex flex-col items-center my-1">
            <div className="w-0.5 h-4 bg-[#C5A059]" />
            <div className="w-32 h-0.5 rounded-full bg-[#C5A059]" />
            <div className="w-0.5 h-3 bg-[#C5A059]" />
          </div>

          {/* 4. MAIN BODY: 4 PILLARS OR CARDS VIEW */}
          {viewLayout === 'hierarchy' ? (
        <div className="space-y-8">
          {/* Section A: ส่วนอำนวยการและสนับสนุน */}
          {(selectedGroup === 'all' || selectedGroup === 'command_support') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#374151]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
                  <h3 className="text-sm sm:text-base font-black flex items-center gap-2 text-slate-100">
                    🏛️ ส่วนบังคับบัญชา อำนวยการ และสนับสนุน
                  </h3>
                  <span className="text-xs font-mono text-amber-400 font-black">
                    ({filteredBureaus.filter((b) => b.group === 'command_support').length} หน่วยงาน)
                  </span>
                </div>
                <span className="text-xs hidden sm:inline text-slate-400 font-medium">
                  คลิกที่ชื่อ บก./กอง ด้านล่างการ์ด เพื่อเปิดดูรายชื่อและข้อมูลกำลังพลได้ทันที
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredBureaus
                  .filter((b) => b.group === 'command_support')
                  .map((bureau) => (
                    <BureauCard
                      key={bureau.id}
                      bureau={bureau}
                      rosterStats={rosterMapping[bureau.id]}
                      officers={officers}
                      currentTheme={currentTheme}
                      onOpenDetail={() => setSelectedBureauModal(bureau)}
                      onOpenDivisionDetail={(sub) => handleOpenDivisionDetail(sub, bureau)}
                      onSelectSubDivision={onSelectSubDivision}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Section B: ส่วนป้องกันและปราบปรามพื้นที่ (บช.น. และ ภ.1 - ภ.9) */}
          {(selectedGroup === 'all' || selectedGroup === 'area_commands') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#374151]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shadow-xs" />
                  <h3 className="text-sm sm:text-base font-black flex items-center gap-2 text-slate-100">
                    🎖️ ส่วนปฏิบัติการพื้นที่ / ป้องกันและปราบปรามอาชญากรรม
                  </h3>
                  <span className="text-xs font-mono text-blue-400 font-black">
                    ({filteredBureaus.filter((b) => b.group === 'area_commands').length} กองบัญชาการ)
                  </span>
                </div>
                <span className="text-xs hidden sm:inline text-slate-400 font-medium">บช.น. (กทม.) และ ภ.1 - ภ.9 ครอบคลุม 76 จังหวัด</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredBureaus
                  .filter((b) => b.group === 'area_commands')
                  .map((bureau) => (
                    <BureauCard
                      key={bureau.id}
                      bureau={bureau}
                      rosterStats={rosterMapping[bureau.id]}
                      officers={officers}
                      currentTheme={currentTheme}
                      onOpenDetail={() => setSelectedBureauModal(bureau)}
                      onOpenDivisionDetail={(sub) => handleOpenDivisionDetail(sub, bureau)}
                      onSelectSubDivision={onSelectSubDivision}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Section C: ส่วนสืบสวน ปราบปรามเฉพาะทาง และความมั่นคง */}
          {(selectedGroup === 'all' || selectedGroup === 'specialized') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#374151]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
                  <h3 className="text-sm sm:text-base font-black flex items-center gap-2 text-slate-100">
                    🔍 ส่วนสืบสวน ปราบปรามเฉพาะทาง และความมั่นคง
                  </h3>
                  <span className="text-xs font-mono text-emerald-400 font-black">
                    ({filteredBureaus.filter((b) => b.group === 'specialized').length} กองบัญชาการ)
                  </span>
                </div>
                <span className="text-xs hidden sm:inline text-slate-400 font-medium">สอบสวนกลาง (CIB), ไซเบอร์ (สอท.), ตรวจคนเข้าเมือง (สตม.) ฯลฯ</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredBureaus
                  .filter((b) => b.group === 'specialized')
                  .map((bureau) => (
                    <BureauCard
                      key={bureau.id}
                      bureau={bureau}
                      rosterStats={rosterMapping[bureau.id]}
                      officers={officers}
                      currentTheme={currentTheme}
                      onOpenDetail={() => setSelectedBureauModal(bureau)}
                      onOpenDivisionDetail={(sub) => handleOpenDivisionDetail(sub, bureau)}
                      onSelectSubDivision={onSelectSubDivision}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Section D: ส่วนการศึกษาและฝึกอบรม */}
          {(selectedGroup === 'all' || selectedGroup === 'education') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#374151]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500 shadow-xs" />
                  <h3 className="text-sm sm:text-base font-black flex items-center gap-2 text-slate-100">
                    🎓 ส่วนการศึกษาและการฝึกอบรม
                  </h3>
                  <span className="text-xs font-mono text-purple-400 font-black">
                    ({filteredBureaus.filter((b) => b.group === 'education').length} สถาบัน)
                  </span>
                </div>
                <span className="text-xs hidden sm:inline text-slate-400 font-medium">กองบัญชาการศึกษา (บช.ศ.) และโรงเรียนนายร้อยตำรวจ (รร.นรต.)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredBureaus
                  .filter((b) => b.group === 'education')
                  .map((bureau) => (
                    <BureauCard
                      key={bureau.id}
                      bureau={bureau}
                      rosterStats={rosterMapping[bureau.id]}
                      officers={officers}
                      currentTheme={currentTheme}
                      onOpenDetail={() => setSelectedBureauModal(bureau)}
                      onOpenDivisionDetail={(sub) => handleOpenDivisionDetail(sub, bureau)}
                      onSelectSubDivision={onSelectSubDivision}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Dense Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredBureaus.map((bureau) => (
            <BureauCard
              key={bureau.id}
              bureau={bureau}
              rosterStats={rosterMapping[bureau.id]}
              officers={officers}
              currentTheme={currentTheme}
              onOpenDetail={() => setSelectedBureauModal(bureau)}
              onOpenDivisionDetail={(sub) => handleOpenDivisionDetail(sub, bureau)}
              onSelectSubDivision={onSelectSubDivision}
            />
          ))}
        </div>
      )}
    </>
  )}

      {/* 5. Bureau Detail Modal (แสดงรายละเอียดภารกิจ & โครงสร้าง บก. ในสังกัด แบบคลิกได้) */}
      {selectedBureauModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
              currentTheme.isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 ${selectedBureauModal.badgeColor}`}
                >
                  {selectedBureauModal.code}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold truncate">{selectedBureauModal.fullName}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {selectedBureauModal.groupName}
                    </span>
                  </div>
                  <p className="text-xs text-amber-500 font-semibold truncate mt-0.5">
                    {selectedBureauModal.headTitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedBureauModal(null)}
                className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {/* Mission & Jurisdiction */}
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  currentTheme.isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <span className="font-bold text-slate-400 block mb-0.5">ภารกิจและหน้าที่รับผิดชอบ:</span>
                  <p className="leading-relaxed">{selectedBureauModal.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-400 block mb-0.5">พื้นที่ / ขอบเขตความรับผิดชอบ:</span>
                  <p className="text-amber-500 font-medium">{selectedBureauModal.jurisdiction}</p>
                </div>
              </div>

              {/* Subordinate Divisions (บก./กอง ในสังกัด) - CLICKABLE BOXES! */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>หน่วยงานระดับกองบังคับการ (บก. / กอง) ในสังกัด</span>
                    <span className="text-amber-500 font-normal font-mono">
                      ({selectedBureauModal.subDivisions.length} หน่วยงาน)
                    </span>
                  </h4>
                  <span className="text-[11px] text-amber-500 font-semibold animate-pulse">
                    👈 คลิกที่กล่องหน่วยงานเพื่อดูข้อมูล
                  </span>
                </div>

                {selectedBureauModal.subDivisions.length > 4 && (
                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={bureauModalSubSearch}
                      onChange={(e) => setBureauModalSubSearch(e.target.value)}
                      placeholder="ค้นหา บก. / กอง ในสังกัดนี้..."
                      className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border outline-hidden transition-all ${
                        currentTheme.isDark
                          ? 'bg-slate-800/80 border-slate-700 text-slate-200 focus:border-amber-500'
                          : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
                      }`}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedBureauModal.subDivisions
                    .filter((sub) => !bureauModalSubSearch.trim() || sub.toLowerCase().includes(bureauModalSubSearch.toLowerCase().trim()))
                    .map((sub, idx) => {
                    const { officers: subOffs } = getOfficersForDivision(sub, selectedBureauModal, officers);
                    const occupied = subOffs.filter((o) => !o.isVacant).length;
                    const vacant = subOffs.filter((o) => o.isVacant).length;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleOpenDivisionDetail(sub, selectedBureauModal)}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer group flex items-center justify-between gap-2 shadow-2xs hover:shadow-md ${
                          subOffs.length > 0
                            ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500 hover:bg-emerald-500/10'
                            : currentTheme.isDark
                            ? 'border-slate-800 bg-slate-800/40 hover:border-amber-500/60 hover:bg-slate-800/80'
                            : 'border-slate-200 bg-slate-50 hover:border-amber-500/60 hover:bg-amber-50/50'
                        }`}
                      >
                        <div className="min-w-0 flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                              subOffs.length > 0
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                            }`}
                          >
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition-colors truncate">
                              {sub}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                              {subOffs.length > 0 ? (
                                <span className="text-emerald-500 font-medium">
                                  {subOffs.length} อัตรา (ครอง {occupied} / ว่าง {vacant})
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">คลิกเปิดดู / จัดการกำลังพล</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500 font-semibold text-[11px] group-hover:translate-x-1 transition-transform shrink-0">
                          <span>ดูข้อมูล</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Roster Match Info */}
              {rosterMapping[selectedBureauModal.id] && rosterMapping[selectedBureauModal.id].total > 0 && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    currentTheme.isDark
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      มีข้อมูลกำลังพลของหน่วยงานนี้ในระบบ ({selectedBureauModal.fullName})
                    </div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      รวมทั้งหมด {rosterMapping[selectedBureauModal.id].total} อัตรา (มีผู้ครอง {rosterMapping[selectedBureauModal.id].occupied} / ตำแหน่งว่าง {rosterMapping[selectedBureauModal.id].vacant})
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBureauModal(null);
                      onSelectSubDivision(selectedBureauModal.id, '__ALL__');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer shrink-0 shadow-sm"
                  >
                    เปิดดูในตารางรวม
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/80">
              <span className="text-[11px] text-slate-400">
                คลิกกล่องกองบังคับการ (บก.) ด้านบนเพื่อดูรายละเอียดรายหน่วย
              </span>
              <button
                onClick={() => setSelectedBureauModal(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                  currentTheme.isDark
                    ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                    : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SUBORDINATE DIVISION DETAIL MODAL (หน้าต่างข้อมูลกำลังพลประจำกองบังคับการ บก./กอง) */}
      {activeDivisionData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
              currentTheme.isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-amber-500/15 via-transparent to-transparent">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shrink-0 font-bold text-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold truncate">
                      {activeDivisionData.rawName}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                      ระดับ บก./กอง
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    สังกัด: <span className="text-amber-500 font-semibold">{activeDivisionData.bureau.fullName} ({activeDivisionData.bureau.code})</span> · สำนักงานตำรวจแห่งชาติ (ตร.)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDivisionModal(null)}
                className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Bar */}
            <div className="px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-850 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium">กรอบอัตรา:</span>
                  <span className="font-bold text-amber-500 font-mono text-sm">{activeDivisionData.total} นาย</span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-emerald-500 font-medium flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> ครอง:
                  </span>
                  <span className="font-bold text-emerald-500 font-mono text-sm">{activeDivisionData.occupied}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-rose-500 font-medium flex items-center gap-1">
                    <UserX className="w-3.5 h-3.5" /> ว่าง:
                  </span>
                  <span className="font-bold text-rose-500 font-mono text-sm">{activeDivisionData.vacant}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-indigo-400 font-medium">ความพร้อมบรรจุ:</span>
                  <span className="font-bold text-indigo-400 font-mono text-sm">{activeDivisionData.rate}%</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const targetDiv = activeDivisionData.matchedDivisionName || activeDivisionData.cleanName;
                    setSelectedDivisionModal(null);
                    if (selectedBureauModal) setSelectedBureauModal(null);
                    onSelectSubDivision(targetDiv, '__ALL__');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  เปิดในตารางหลัก
                </button>

                <button
                  onClick={() => {
                    const targetDiv = activeDivisionData.matchedDivisionName || activeDivisionData.cleanName;
                    onAddOfficerToSubDiv(targetDiv, '__ALL__');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  เพิ่มกำลังพลใน บก. นี้
                </button>
              </div>
            </div>

            {/* Filter Controls within Division */}
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={divisionModalSearch}
                  onChange={(e) => setDivisionModalSearch(e.target.value)}
                  placeholder="ค้นหาชื่อ, ยศ, เลขตำแหน่ง, กก./ฝ่าย..."
                  className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border outline-hidden transition-all ${
                    currentTheme.isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200 focus:border-amber-500'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
                  }`}
                />
              </div>

              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] self-start sm:self-auto">
                <button
                  onClick={() => setDivisionModalStatus('all')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    divisionModalStatus === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ทั้งหมด ({activeDivisionData.total})
                </button>
                <button
                  onClick={() => setDivisionModalStatus('occupied')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    divisionModalStatus === 'occupied'
                      ? 'bg-emerald-500 text-white font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ครอง ({activeDivisionData.occupied})
                </button>
                <button
                  onClick={() => setDivisionModalStatus('vacant')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    divisionModalStatus === 'vacant'
                      ? 'bg-rose-500 text-white font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ว่าง ({activeDivisionData.vacant})
                </button>
              </div>
            </div>

            {/* Officer List or Empty State */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {activeDivisionData.total === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-3">
                    <Users className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    ยังไม่มีข้อมูลกำลังพลของ {activeDivisionData.rawName} ในฐานข้อมูล
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                    คุณสามารถเพิ่มข้าราชการตำรวจรายใหม่ลงในสังกัดนี้ หรือนำเข้าไฟล์ Excel/CSV เพื่อบันทึกเข้าสู่ระบบได้ทันที
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => {
                        const targetDiv = activeDivisionData.matchedDivisionName || activeDivisionData.cleanName;
                        onAddOfficerToSubDiv(targetDiv, '__ALL__');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      เพิ่มกำลังพลในหน่วยนี้ทันที
                    </button>
                  </div>
                </div>
              ) : activeDivisionData.filteredOfficers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  ไม่พบกำลังพลที่ตรงกับเงื่อนไขการค้นหา "{divisionModalSearch}"
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="col-span-3">เลขตำแหน่ง</div>
                    <div className="col-span-4">ยศ - ชื่อ - สกุล / ตำแหน่ง</div>
                    <div className="col-span-3">กองกำกับการ / ฝ่าย</div>
                    <div className="col-span-2 text-right">การจัดการ</div>
                  </div>

                  {activeDivisionData.filteredOfficers.map((officer) => (
                    <div
                      key={officer.id}
                      className={`p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-center ${
                        currentTheme.isDark
                          ? 'bg-slate-800/40 border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/80'
                          : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/30'
                      }`}
                    >
                      {/* Position Number */}
                      <div className="sm:col-span-3 flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-amber-500">
                          {officer.positionNumber || '-'}
                        </span>
                        {officer.isVacant ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            ว่าง
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ครอง
                          </span>
                        )}
                      </div>

                      {/* Rank & Name & Title */}
                      <div className="sm:col-span-4 min-w-0">
                        <div className="text-xs font-bold truncate">
                          {officer.isVacant ? (
                            <span className="text-rose-400 font-semibold">(ตำแหน่งว่าง)</span>
                          ) : (
                            `${officer.rank} ${officer.firstName} ${officer.lastName}`
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {officer.positionTitle || officer.positionLevel || '-'}
                        </div>
                      </div>

                      {/* SubDivision */}
                      <div className="sm:col-span-3 text-xs text-slate-400 truncate">
                        {officer.subDivision || '-'}
                      </div>

                      {/* Actions */}
                      <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewOfficer(officer)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            currentTheme.isDark
                              ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                          title="ดูรายละเอียดข้าราชการตำรวจ"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-500" />
                        </button>

                        <button
                          onClick={() => onEditOfficer(officer)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            currentTheme.isDark
                              ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                          title="แก้ไขข้อมูล"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/80">
              <span className="text-xs text-slate-400">
                แสดงกำลังพล {activeDivisionData.filteredOfficers.length} จาก {activeDivisionData.total} อัตรา
              </span>
              <button
                onClick={() => setSelectedDivisionModal(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                  currentTheme.isDark
                    ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                    : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact & Clean Bureau Card Component with Direct Clickable Divisions
interface BureauCardProps {
  bureau: PoliceBureauNode;
  rosterStats?: { total: number; occupied: number; vacant: number };
  officers: PoliceOfficer[];
  currentTheme: AppTheme;
  customThemeSettings?: CustomThemeSettings;
  onOpenDetail: () => void;
  onOpenDivisionDetail: (divisionRawName: string) => void;
  onSelectSubDivision: (div: string, sub: string) => void;
}

// Visual illustration mapping for each Bureau matching reference image
const getBureauIllustration = (bureauCode: string) => {
  switch (bureauCode) {
    case 'สกพ.':
      return { emoji: '👥 📚', label: 'กำลังพล', bg: 'bg-amber-50 border-amber-200 text-amber-900' };
    case 'สงป.':
      return { emoji: '🧮 💵', label: 'งบประมาณ', bg: 'bg-emerald-50 border-emerald-200 text-emerald-900' };
    case 'สยศ.ตร.':
      return { emoji: '🧭 📐', label: 'ยุทธศาสตร์', bg: 'bg-blue-50 border-blue-200 text-blue-900' };
    case 'สง.ก.ตร.':
      return { emoji: '⚖️ 📜', label: 'ก.ตร.', bg: 'bg-amber-50 border-amber-200 text-amber-900' };
    case 'สตส.':
      return { emoji: '📋 🔍', label: 'ตรวจสอบ', bg: 'bg-purple-50 border-purple-200 text-purple-900' };
    case 'สทส.':
      return { emoji: '💻 📡', label: 'เทคโนโลยี', bg: 'bg-cyan-50 border-cyan-200 text-cyan-900' };
    case 'สกาน.':
      return { emoji: '⚖️ 🏛️', label: 'กฎหมาย', bg: 'bg-indigo-50 border-indigo-200 text-indigo-900' };
    case 'สพฐ.ตร.':
      return { emoji: '🔬 🔍', label: 'พิสูจน์หลักฐาน', bg: 'bg-rose-50 border-rose-200 text-rose-900' };
    case 'รพ.ตร.':
      return { emoji: '🏥 🩺', label: 'โรงพยาบาล ตร.', bg: 'bg-red-50 border-red-200 text-red-900' };
    case 'บช.ก.':
      return { emoji: '🕵️‍♂️ 🚔', label: 'สอบสวนกลาง', bg: 'bg-yellow-50 border-yellow-300 text-yellow-950' };
    case 'บช.สอท.':
      return { emoji: '🔒 💻', label: 'ไซเบอร์', bg: 'bg-blue-50 border-blue-200 text-blue-900' };
    case 'สตม.':
      return { emoji: '🛂 🌐', label: 'ตรวจคนเข้าเมือง', bg: 'bg-emerald-50 border-emerald-200 text-emerald-900' };
    case 'บช.ปส.':
      return { emoji: '🚫 📦', label: 'ปราบปรามยาเสพติด', bg: 'bg-orange-50 border-orange-200 text-orange-900' };
    case 'บช.ตชด.':
      return { emoji: '⛰️ 🛡️', label: 'ตชด.', bg: 'bg-stone-50 border-stone-300 text-stone-900' };
    case 'บช.ศ.':
    case 'รร.นรต.':
      return { emoji: '🎓 🏛️', label: 'การศึกษา', bg: 'bg-purple-50 border-purple-200 text-purple-900' };
    default:
      return { emoji: '🛡️ 👮', label: 'ปฏิบัติการ', bg: 'bg-blue-50 border-blue-200 text-blue-900' };
  }
};

const BureauCard: React.FC<BureauCardProps> = ({
  bureau,
  rosterStats,
  officers,
  currentTheme,
  onOpenDetail,
  onOpenDivisionDetail,
  onSelectSubDivision,
}) => {
  const hasRosterData = rosterStats && rosterStats.total > 0;
  const illustration = getBureauIllustration(bureau.code);

  return (
    <div
      onClick={onOpenDetail}
      className="rounded-2xl border border-[#374151] bg-[#222938] hover:bg-[#283144] p-4 transition-all duration-200 cursor-pointer group flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-[#C5A059] hover:-translate-y-0.5"
    >
      <div>
        {/* Card Header: Code, Category, and Top-Right Illustration Icon */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-lg border border-[#C5A059] bg-[#2C3547] text-amber-300 font-mono tracking-wide shadow-2xs">
                {bureau.code}
              </span>
              <span className="text-[11px] text-amber-400 font-bold truncate">{bureau.groupName}</span>
            </div>
          </div>

          {/* Top-Right Illustration Icon matching reference image */}
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center text-base shadow-2xs shrink-0 ${illustration.bg}`}
            title={illustration.label}
          >
            <span>{illustration.emoji}</span>
          </div>
        </div>

        {/* Bureau Full Name */}
        <h4 className="text-sm sm:text-base font-black text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
          {bureau.fullName}
        </h4>

        {/* Head Officer Title */}
        <div className="text-xs text-amber-300/90 font-bold truncate mt-0.5">
          {bureau.headTitle}
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 leading-relaxed font-normal">
          {bureau.description}
        </p>

        {/* Subordinate Divisions (บก./กอง) Direct Clickable Pills */}
        <div className="mt-3 pt-2.5 border-t border-[#374151] bg-[#1A202C] p-2.5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-200 font-black mb-1.5">
            <span>หน่วยงานในสังกัด:</span>
            <span className="font-mono text-amber-400 font-black">{bureau.subDivisions.length} บก.</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {bureau.subDivisions.slice(0, 4).map((sub, idx) => {
              const { officers: subOffs } = getOfficersForDivision(sub, bureau, officers);
              const cleanSubName = sub.replace(/\(.*?\)/g, '').trim();

              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDivisionDetail(sub);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                    subOffs.length > 0
                      ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200 hover:bg-emerald-900 font-black'
                      : 'bg-[#252E3E] border-[#3B475B] text-slate-200 hover:bg-[#323D50] hover:text-white hover:border-[#C5A059]'
                  }`}
                  title={`คลิกเพื่อดูข้อมูล ${sub}`}
                >
                  <span className="truncate max-w-[130px]">{cleanSubName}</span>
                  {subOffs.length > 0 && (
                    <span className="font-mono font-black text-[9px] px-1 rounded-full bg-emerald-600 text-white">
                      {subOffs.length}
                    </span>
                  )}
                </button>
              );
            })}

            {bureau.subDivisions.length > 4 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetail();
                }}
                className="text-[11px] px-2 py-1 rounded-lg border border-[#C5A059]/60 bg-[#283142] text-amber-300 hover:bg-[#323E54] font-black transition-colors cursor-pointer shadow-2xs"
                title="ดูหน่วยงานในสังกัดทั้งหมด"
              >
                +{bureau.subDivisions.length - 4} บก.
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Jurisdiction & Action */}
      <div className="mt-3.5 pt-2.5 border-t border-[#374151] flex items-center justify-between text-xs">
        <span className="text-slate-400 font-semibold truncate max-w-[160px]">
          ทั่วประเทศ ({bureau.code})
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail();
          }}
          className="px-3 py-1 rounded-lg border border-[#C5A059] bg-[#2C3547] text-amber-300 font-bold flex items-center gap-1 hover:bg-[#384359] shadow-2xs transition-all shrink-0 cursor-pointer"
        >
          <span>ดูทั้งหน่วย</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
        </button>
      </div>
    </div>
  );
};
