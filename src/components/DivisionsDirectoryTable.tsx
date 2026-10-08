/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PoliceOfficer } from '../types/personnel';
import { AppTheme } from '../data/themes';
import {
  RTP_BUREAUS_DATA,
  getAllDivisionsFlat,
  DivisionItem,
  PoliceBureauNode,
  PoliceGroup,
  getOfficersForDivision
} from '../data/rtpStructure';
import * as XLSX from 'xlsx';
import {
  Building2,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  ExternalLink,
  Users,
  UserCheck,
  UserX,
  RotateCcw,
  Sparkles,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FileSpreadsheet,
  BarChart3
} from 'lucide-react';

interface DivisionsDirectoryTableProps {
  officers: PoliceOfficer[];
  onOpenDivisionDetail: (divisionRawName: string, bureau: PoliceBureauNode) => void;
  onAddOfficerToDivision: (division: string, subDiv: string) => void;
  onOpenInMainTable: (division: string) => void;
  currentTheme: AppTheme;
}

// Position tiers helper
const STANDARD_POSITION_TIERS = [
  { key: 'commander', label: 'ผบก. / ผบช.', matches: ['ผบช.', 'ผบก.', 'ผู้บัญชาการ', 'ผู้บังคับการ'] },
  { key: 'deputy_commander', label: 'รอง ผบก. / รอง ผบช.', matches: ['รอง ผบช.', 'รอง ผบก.', 'รองผู้บัญชาการ', 'รองผู้บังคับการ'] },
  { key: 'superintendent', label: 'ผกก.', matches: ['ผกก.', 'ผู้กำกับการ'] },
  { key: 'deputy_superintendent', label: 'รอง ผกก.', matches: ['รอง ผกก.', 'รองผู้กำกับการ'] },
  { key: 'inspector', label: 'สว.', matches: ['สว.', 'สารวัตร'] },
  { key: 'sub_inspector', label: 'รอง สว.', matches: ['รอง สว.', 'รองสารวัตร'] },
  { key: 'squad_leader', label: 'ผบ.หมู่ (ประทวน)', matches: ['ผบ.หมู่', 'ผู้บังคับหมู่', 'ด.ต.', 'จ.ส.ต.', 'ส.ต.อ.', 'ส.ต.ท.', 'ส.ต.ต.'] },
  { key: 'other', label: 'ตำแหน่งอื่นๆ / ทั่วไป', matches: [] }
];

export const DivisionsDirectoryTable: React.FC<DivisionsDirectoryTableProps> = ({
  officers,
  onOpenDivisionDetail,
  onAddOfficerToDivision,
  onOpenInMainTable,
  currentTheme,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBureau, setSelectedBureau] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<PoliceGroup>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'has_officers' | 'has_vacant' | 'empty'>('all');
  const [sortField, setSortField] = useState<'bureau' | 'name' | 'total' | 'occupied' | 'vacant' | 'fillRate'>('bureau');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // View Mode: 'agencies' (สรุปราย บก./กอง) | 'ranks_all' (แจกแจงทุกแถวระดับตำแหน่ง) | 'subdivs_all' (แจกแจงทุกแถวฝ่าย/กก.)
  const [viewMode, setViewMode] = useState<'agencies' | 'ranks_all' | 'subdivs_all'>('agencies');

  // Expanded rows set (Division IDs)
  const [expandedDivIds, setExpandedDivIds] = useState<Set<string>>(new Set());

  // Custom division addition state
  const [isAddCustomDivOpen, setIsAddCustomDivOpen] = useState(false);
  const [customBureauCode, setCustomBureauCode] = useState('สกพ.');
  const [customDivName, setCustomDivName] = useState('');
  const [customDivAcronym, setCustomDivAcronym] = useState('');
  const [customDivList, setCustomDivList] = useState<DivisionItem[]>([]);

  // Base list of all divisions
  const allDivisions = useMemo(() => {
    const list = getAllDivisionsFlat();
    return [...list, ...customDivList];
  }, [customDivList]);

  // Bureau Map for fast lookup
  const bureauMap = useMemo(() => {
    const map = new Map<string, PoliceBureauNode>();
    RTP_BUREAUS_DATA.forEach((b) => {
      map.set(b.id, b);
      map.set(b.code, b);
    });
    return map;
  }, []);

  // Compute officer stats for each division
  const divisionsWithStats = useMemo(() => {
    return allDivisions.map((div) => {
      const parentBureau = bureauMap.get(div.bureauId) || RTP_BUREAUS_DATA[0];
      const { officers: matchedOffs, matchedDivisionName } = getOfficersForDivision(
        div.displayName,
        parentBureau,
        officers
      );

      // "ระตำแหน่งรวมทุกๆแถวของหน่วยงานนั้นๆรวมทั้งตำแหน่งว่าง"
      const total = matchedOffs.length;

      // "ส่วนคนครอง รวมแค่คนที่ครองอยู่ ของหน่วยงานนั้นๆ"
      const occupied = matchedOffs.filter((o) => !o.isVacant).length;

      // ตำแหน่งว่าง
      const vacant = matchedOffs.filter((o) => o.isVacant).length;

      // อัตราการครองตำแหน่ง (%)
      const fillRateNum = total > 0 ? (occupied / total) * 100 : 0;
      const fillRate = total > 0 ? fillRateNum.toFixed(1) : '0';

      // สัญญาบัตร / ประทวน breakdown
      const commissionedTotal = matchedOffs.filter((o) => o.commissionType === 'สัญญาบัตร').length;
      const commissionedOccupied = matchedOffs.filter((o) => o.commissionType === 'สัญญาบัตร' && !o.isVacant).length;
      const commissionedVacant = matchedOffs.filter((o) => o.commissionType === 'สัญญาบัตร' && o.isVacant).length;

      const nonCommissionedTotal = matchedOffs.filter((o) => o.commissionType === 'ประทวน').length;
      const nonCommissionedOccupied = matchedOffs.filter((o) => o.commissionType === 'ประทวน' && !o.isVacant).length;
      const nonCommissionedVacant = matchedOffs.filter((o) => o.commissionType === 'ประทวน' && o.isVacant).length;

      // แจกแจงทุกแถวระดับตำแหน่ง (Position / Rank Tiers)
      const rankRows = STANDARD_POSITION_TIERS.map((tier) => {
        const tierOffs = matchedOffs.filter((o) => {
          if (tier.key === 'other') {
            const isMatchedBefore = STANDARD_POSITION_TIERS.slice(0, -1).some((t) =>
              t.matches.some((m) => o.positionLevel?.includes(m) || o.positionTitle?.includes(m) || o.rank?.includes(m))
            );
            return !isMatchedBefore;
          }
          return tier.matches.some(
            (m) => o.positionLevel?.includes(m) || o.positionTitle?.includes(m) || o.rank?.includes(m)
          );
        });

        const tierTotal = tierOffs.length;
        const tierOccupied = tierOffs.filter((o) => !o.isVacant).length;
        const tierVacant = tierOffs.filter((o) => o.isVacant).length;
        const tierFillRate = tierTotal > 0 ? ((tierOccupied / tierTotal) * 100).toFixed(1) : '0';

        return {
          key: tier.key,
          label: tier.label,
          total: tierTotal,
          occupied: tierOccupied,
          vacant: tierVacant,
          fillRate: tierFillRate,
          officers: tierOffs,
        };
      });

      // แจกแจงทุกแถวฝ่าย / กก. / หน่วยงานย่อย (Sub-division breakdown)
      const subDivMap = new Map<string, PoliceOfficer[]>();
      matchedOffs.forEach((o) => {
        const sub = o.subDivision?.trim() || 'ฝ่ายอำนวยการ/ทั่วไป';
        if (!subDivMap.has(sub)) subDivMap.set(sub, []);
        subDivMap.get(sub)!.push(o);
      });

      const subDivRows = Array.from(subDivMap.entries()).map(([subName, subOffs]) => {
        const subTotal = subOffs.length;
        const subOccupied = subOffs.filter((o) => !o.isVacant).length;
        const subVacant = subOffs.filter((o) => o.isVacant).length;
        const subFillRate = subTotal > 0 ? ((subOccupied / subTotal) * 100).toFixed(1) : '0';

        return {
          subName,
          total: subTotal,
          occupied: subOccupied,
          vacant: subVacant,
          fillRate: subFillRate,
          officers: subOffs,
        };
      });

      return {
        ...div,
        parentBureau,
        matchedDivisionName,
        total,
        occupied,
        vacant,
        fillRate,
        fillRateNum,
        commissionedTotal,
        commissionedOccupied,
        commissionedVacant,
        nonCommissionedTotal,
        nonCommissionedOccupied,
        nonCommissionedVacant,
        rankRows,
        subDivRows,
        officers: matchedOffs,
      };
    });
  }, [allDivisions, bureauMap, officers]);

  // Overall Global Statistics across all rows
  const globalSummary = useMemo(() => {
    let grandTotalPositions = 0; // ตำแหน่งรวมทุกๆ แถว รวมทั้งตำแหน่งว่าง
    let grandTotalOccupied = 0;  // คนครอง รวมแค่คนที่ครองอยู่
    let grandTotalVacant = 0;    // ตำแหน่งว่าง

    divisionsWithStats.forEach((d) => {
      grandTotalPositions += d.total;
      grandTotalOccupied += d.occupied;
      grandTotalVacant += d.vacant;
    });

    const averageFillRate =
      grandTotalPositions > 0
        ? ((grandTotalOccupied / grandTotalPositions) * 100).toFixed(1)
        : '0';

    return {
      grandTotalPositions,
      grandTotalOccupied,
      grandTotalVacant,
      averageFillRate,
      activeAgenciesCount: divisionsWithStats.filter((d) => d.total > 0).length,
    };
  }, [divisionsWithStats]);

  // Filtered & Sorted Divisions
  const filteredDivisions = useMemo(() => {
    return divisionsWithStats
      .filter((d) => {
        // Group filter
        if (selectedGroup !== 'all' && d.group !== selectedGroup) return false;

        // Bureau filter
        if (selectedBureau !== 'all' && d.bureauId !== selectedBureau && d.bureauCode !== selectedBureau) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;

        // Status filter
        if (statusFilter === 'has_officers' && d.total === 0) return false;
        if (statusFilter === 'has_vacant' && d.vacant === 0) return false;
        if (statusFilter === 'empty' && d.total > 0) return false;

        // Search text
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const match =
            d.name.toLowerCase().includes(q) ||
            d.shortName.toLowerCase().includes(q) ||
            d.displayName.toLowerCase().includes(q) ||
            d.bureauCode.toLowerCase().includes(q) ||
            d.bureauName.toLowerCase().includes(q) ||
            d.category.toLowerCase().includes(q) ||
            d.jurisdiction.toLowerCase().includes(q);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'bureau') {
          diff = a.bureauCode.localeCompare(b.bureauCode, 'th');
          if (diff === 0) diff = a.name.localeCompare(b.name, 'th');
        } else if (sortField === 'name') {
          diff = a.name.localeCompare(b.name, 'th');
        } else if (sortField === 'total') {
          diff = a.total - b.total;
        } else if (sortField === 'occupied') {
          diff = a.occupied - b.occupied;
        } else if (sortField === 'vacant') {
          diff = a.vacant - b.vacant;
        } else if (sortField === 'fillRate') {
          diff = a.fillRateNum - b.fillRateNum;
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [
    divisionsWithStats,
    selectedGroup,
    selectedBureau,
    selectedCategory,
    statusFilter,
    searchTerm,
    sortField,
    sortOrder,
  ]);

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedDivIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAllRows = () => {
    const allIds = new Set(filteredDivisions.map((d) => d.id));
    setExpandedDivIds(allIds);
  };

  const collapseAllRows = () => {
    setExpandedDivIds(new Set());
  };

  // Export to Excel according to user specification
  const handleExportExcel = () => {
    // Sheet 1: Master Agency Table
    const agencyRows = filteredDivisions.map((d, index) => ({
      'ลำดับ': index + 1,
      'บช. ต้นสังกัด': d.bureauCode,
      'ชื่อกองบัญชาการ': d.bureauName,
      'ชื่อหน่วยงาน (บก. / กอง)': d.name,
      'ตัวย่อ': d.shortName,
      'กลุ่มภารกิจ': d.category,
      'ตำแหน่งรวม (รวมทั้งตำแหน่งว่าง)': d.total,
      'คนครอง (รวมแค่คนที่ครองอยู่)': d.occupied,
      'ตำแหน่งว่าง': d.vacant,
      'ร้อยละการครองตำแหน่ง (%)': `${d.fillRate}%`,
      'สัญญาบัตร - ตำแหน่งรวม': d.commissionedTotal,
      'สัญญาบัตร - คนครอง': d.commissionedOccupied,
      'สัญญาบัตร - ว่าง': d.commissionedVacant,
      'ประทวน - ตำแหน่งรวม': d.nonCommissionedTotal,
      'ประทวน - คนครอง': d.nonCommissionedOccupied,
      'ประทวน - ว่าง': d.nonCommissionedVacant,
      'พื้นที่รับผิดชอบ': d.jurisdiction,
    }));

    // Sheet 2: Every Position Tier Row
    const positionTierRows: Array<{
      'บช.': string;
      'หน่วยงาน (บก./กอง)': string;
      'แถวระดับตำแหน่ง': string;
      'ตำแหน่งรวม (รวมทั้งตำแหน่งว่าง)': number;
      'คนครอง (รวมแค่คนที่ครองอยู่)': number;
      'ตำแหน่งว่าง': number;
      'ร้อยละการครอง (%)': string;
    }> = [];

    filteredDivisions.forEach((d) => {
      d.rankRows.forEach((r) => {
        positionTierRows.push({
          'บช.': d.bureauCode,
          'หน่วยงาน (บก./กอง)': d.name,
          'แถวระดับตำแหน่ง': r.label,
          'ตำแหน่งรวม (รวมทั้งตำแหน่งว่าง)': r.total,
          'คนครอง (รวมแค่คนที่ครองอยู่)': r.occupied,
          'ตำแหน่งว่าง': r.vacant,
          'ร้อยละการครอง (%)': `${r.fillRate}%`,
        });
      });
    });

    // Sheet 3: Every Sub-division Row
    const subDivExcelRows: Array<{
      'บช.': string;
      'หน่วยงาน (บก./กอง)': string;
      'แถวฝ่าย/กก.': string;
      'ตำแหน่งรวม (รวมทั้งตำแหน่งว่าง)': number;
      'คนครอง (รวมแค่คนที่ครองอยู่)': number;
      'ตำแหน่งว่าง': number;
      'ร้อยละการครอง (%)': string;
    }> = [];

    filteredDivisions.forEach((d) => {
      d.subDivRows.forEach((s) => {
        subDivExcelRows.push({
          'บช.': d.bureauCode,
          'หน่วยงาน (บก./กอง)': d.name,
          'แถวฝ่าย/กก.': s.subName,
          'ตำแหน่งรวม (รวมทั้งตำแหน่งว่าง)': s.total,
          'คนครอง (รวมแค่คนที่ครองอยู่)': s.occupied,
          'ตำแหน่งว่าง': s.vacant,
          'ร้อยละการครอง (%)': `${s.fillRate}%`,
        });
      });
    });

    const workbook = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(agencyRows);
    XLSX.utils.book_append_sheet(workbook, ws1, 'ตารางตำแหน่งและคนครอง');

    const ws2 = XLSX.utils.json_to_sheet(positionTierRows);
    XLSX.utils.book_append_sheet(workbook, ws2, 'แจกแจงทุกแถวระดับตำแหน่ง');

    if (subDivExcelRows.length > 0) {
      const ws3 = XLSX.utils.json_to_sheet(subDivExcelRows);
      XLSX.utils.book_append_sheet(workbook, ws3, 'แจกแจงทุกแถวฝ่ายและกก');
    }

    XLSX.writeFile(
      workbook,
      `ตารางตำแหน่งรวมและคนครอง_ตร_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const handleAddCustomDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDivName.trim()) return;

    const parent = bureauMap.get(customBureauCode) || RTP_BUREAUS_DATA[0];
    const acronym = customDivAcronym.trim() || customDivName.trim();
    const displayName = `${customDivName.trim()} (${acronym})`;

    const newDiv: DivisionItem = {
      id: `${parent.id}-${Date.now()}`,
      bureauId: parent.id,
      bureauCode: parent.code,
      bureauName: parent.fullName,
      name: customDivName.trim(),
      shortName: acronym,
      displayName,
      group: parent.group,
      category: 'หน่วยงานเฉพาะ/เพิ่มเติม',
      jurisdiction: parent.jurisdiction,
      description: `${customDivName.trim()} สังกัด ${parent.fullName}`,
    };

    setCustomDivList((prev) => [...prev, newDiv]);
    setCustomDivName('');
    setCustomDivAcronym('');
    setIsAddCustomDivOpen(false);
  };

  return (
    <div className="space-y-5 animate-fadeIn font-['Prompt',sans-serif]">
      {/* 1. Header Card with Accurate Statistics Banner */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          currentTheme.isDark
            ? 'bg-[#15120B] border-[#382E17] text-[#FFFDF7] shadow-xl'
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-md'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 flex items-center justify-center p-2.5 shadow-md shadow-amber-500/20 text-slate-950 shrink-0 border border-amber-300/60">
              <Building2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className={`text-lg sm:text-xl font-bold tracking-wide ${
                    currentTheme.isDark ? 'text-amber-300' : 'text-slate-900'
                  }`}
                >
                  ตารางตำแหน่งรวมและคนครองตามโครงสร้างหน่วยงาน ตร.
                </h2>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    currentTheme.isDark
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}
                >
                  {filteredDivisions.length} / {divisionsWithStats.length} หน่วยงาน
                </span>
              </div>
              <p
                className={`text-xs mt-1 ${
                  currentTheme.isDark ? 'text-amber-100/70' : 'text-slate-500'
                }`}
              >
                ระบุตำแหน่งรวมทุกแถวของหน่วยงาน (รวมทั้งตำแหน่งว่าง) · คนครองรวมเฉพาะคนที่ครองอยู่จริง · แสดงตำแหน่งว่างและร้อยละการครอง
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportExcel}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                currentTheme.isDark
                  ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
              title="ส่งออกตารางตำแหน่งรวมและคนครองทั้งหมดเป็น Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>ส่งออก Excel</span>
            </button>

            <button
              onClick={() => setIsAddCustomDivOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer shadow-sm"
              title="เพิ่มหน่วยงานระดับ บก./กอง พิเศษ"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่ม บก./กอง</span>
            </button>
          </div>
        </div>

        {/* 2. Top Summary KPI Cards: Exact user requested metrics */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Card 1: หน่วยงานทั้งหมด */}
          <div
            className={`p-3 rounded-xl border text-center transition-all ${
              currentTheme.isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mb-1">
              <Building2 className="w-3 h-3 text-amber-400" />
              <span>หน่วยงานทั้งหมด</span>
            </div>
            <div className="text-lg font-bold text-amber-400 font-mono">
              {filteredDivisions.length}{' '}
              <span className="text-xs font-normal text-slate-400 font-sans">บก./กอง</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              มีกำลังพล {globalSummary.activeAgenciesCount} หน่วย
            </div>
          </div>

          {/* Card 2: ตำแหน่งรวม (รวมทั้งตำแหน่งว่าง) */}
          <div
            className={`p-3 rounded-xl border text-center transition-all ${
              currentTheme.isDark
                ? 'bg-blue-950/25 border-blue-900/40 text-blue-300'
                : 'bg-blue-50/80 border-blue-200 text-blue-900'
            }`}
          >
            <div className="text-[11px] opacity-80 flex items-center justify-center gap-1 mb-1">
              <Layers className="w-3 h-3 text-blue-400" />
              <span className="font-semibold">ตำแหน่งรวม (รวมว่าง)</span>
            </div>
            <div className="text-lg font-bold font-mono">
              {globalSummary.grandTotalPositions}{' '}
              <span className="text-xs font-normal opacity-70 font-sans">ตำแหน่ง</span>
            </div>
            <div className="text-[10px] opacity-70 mt-0.5">
              กรอบอัตรากำลังพลรวมทุกแถว
            </div>
          </div>

          {/* Card 3: คนครอง (รวมแค่คนที่ครองอยู่) */}
          <div
            className={`p-3 rounded-xl border text-center transition-all ${
              currentTheme.isDark
                ? 'bg-emerald-950/25 border-emerald-900/40 text-emerald-300'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="text-[11px] opacity-80 flex items-center justify-center gap-1 mb-1">
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span className="font-semibold">คนครอง (คนที่ครองอยู่)</span>
            </div>
            <div className="text-lg font-bold font-mono">
              {globalSummary.grandTotalOccupied}{' '}
              <span className="text-xs font-normal opacity-70 font-sans">นาย</span>
            </div>
            <div className="text-[10px] opacity-70 mt-0.5">
              ข้าราชการตำรวจที่มีตัวครองอยู่
            </div>
          </div>

          {/* Card 4: ตำแหน่งว่าง */}
          <div
            className={`p-3 rounded-xl border text-center transition-all ${
              currentTheme.isDark
                ? 'bg-rose-950/25 border-rose-900/40 text-rose-300'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            <div className="text-[11px] opacity-80 flex items-center justify-center gap-1 mb-1">
              <UserX className="w-3 h-3 text-rose-400" />
              <span className="font-semibold">ตำแหน่งว่าง</span>
            </div>
            <div className="text-lg font-bold font-mono">
              {globalSummary.grandTotalVacant}{' '}
              <span className="text-xs font-normal opacity-70 font-sans">อัตรา</span>
            </div>
            <div className="text-[10px] opacity-70 mt-0.5">
              ตำแหน่งที่ยังไม่มีผู้ครอง
            </div>
          </div>

          {/* Card 5: ร้อยละการครอง (%) */}
          <div
            className={`p-3 rounded-xl border text-center col-span-2 sm:col-span-1 transition-all ${
              currentTheme.isDark
                ? 'bg-amber-950/25 border-amber-900/40 text-amber-300'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            <div className="text-[11px] opacity-80 flex items-center justify-center gap-1 mb-1">
              <BarChart3 className="w-3 h-3 text-amber-400" />
              <span className="font-semibold">% การครองเฉลี่ย</span>
            </div>
            <div className="text-lg font-bold font-mono">
              {globalSummary.averageFillRate}%
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Number(globalSummary.averageFillRate))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. Filter Controls & Search */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อ บก., กอง, ตัวย่อ, บช. หรือภารกิจ..."
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border outline-hidden transition-all ${
                currentTheme.isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 focus:border-amber-500'
                  : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter by Bureau */}
          <div>
            <select
              value={selectedBureau}
              onChange={(e) => setSelectedBureau(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded-xl border outline-hidden transition-all ${
                currentTheme.isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">ทุก บช. ({RTP_BUREAUS_DATA.length} กองบัญชาการ)</option>
              {RTP_BUREAUS_DATA.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} - {b.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Group */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value as PoliceGroup)}
              className={`w-full px-2.5 py-1.5 text-xs rounded-xl border outline-hidden transition-all ${
                currentTheme.isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">ทุกกลุ่มสายงาน</option>
              <option value="command_support">อำนวยการและสนับสนุน</option>
              <option value="area_commands">ป้องกันปราบปรามพื้นที่ (บช.น./ภ.1-9)</option>
              <option value="specialized">สืบสวนและเฉพาะกิจ (CIB/สอท./สตม.)</option>
              <option value="education">การศึกษาและฝึกอบรม</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`w-full px-2.5 py-1.5 text-xs rounded-xl border outline-hidden transition-all ${
                currentTheme.isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="has_officers">มีอัตรากำลังในระบบ ({globalSummary.activeAgenciesCount})</option>
              <option value="has_vacant">มีตำแหน่งว่าง</option>
              <option value="empty">ยังไม่มีอัตรากำลัง ({divisionsWithStats.length - globalSummary.activeAgenciesCount})</option>
            </select>
          </div>
        </div>

        {/* 4. Table View Mode Tabs & Quick Expand/Collapse */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('agencies')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'agencies'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              🏢 ตารางสรุปรายหน่วยงาน (บก./กอง)
            </button>
            <button
              onClick={() => setViewMode('ranks_all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'ranks_all'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              📊 แจกแจงทุกแถวตามระดับตำแหน่ง (ทุกหน่วยงาน)
            </button>
            <button
              onClick={() => setViewMode('subdivs_all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'subdivs_all'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              📂 แจกแจงทุกแถวฝ่ายและ กก.
            </button>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'agencies' && (
              <>
                <button
                  onClick={expandAllRows}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-amber-400 text-[11px] transition-colors"
                >
                  ขยายทุกแถว
                </button>
                <button
                  onClick={collapseAllRows}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-amber-400 text-[11px] transition-colors"
                >
                  ย่อทุกแถว
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 5. Main Table: Strictly specifying Position Total including Vacant and Occupied */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-lg transition-all ${
          currentTheme.isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="overflow-x-auto">
          {viewMode === 'agencies' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className={`border-b ${
                    currentTheme.isDark
                      ? 'bg-slate-800/90 text-slate-300 border-slate-700/80'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <th className="py-3 px-3 w-10 text-center font-bold">ลำดับ</th>
                  <th
                    onClick={() => {
                      if (sortField === 'bureau') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortField('bureau');
                        setSortOrder('asc');
                      }
                    }}
                    className="py-3 px-3 font-bold cursor-pointer hover:text-amber-500 whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>บช. ต้นสังกัด</span>
                      {sortField === 'bureau' && (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                    </div>
                  </th>
                  <th
                    onClick={() => {
                      if (sortField === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortField('name');
                        setSortOrder('asc');
                      }
                    }}
                    className="py-3 px-3 font-bold cursor-pointer hover:text-amber-500 whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>ชื่อหน่วยงาน (บก. / กอง)</span>
                      {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                    </div>
                  </th>
                  <th className="py-3 px-3 font-bold whitespace-nowrap hidden lg:table-cell">กลุ่มภารกิจ</th>

                  {/* ตำแหน่งรวมทุกๆ แถว รวมทั้งตำแหน่งว่าง */}
                  <th
                    onClick={() => {
                      if (sortField === 'total') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortField('total');
                        setSortOrder('desc');
                      }
                    }}
                    className="py-3 px-3 text-center font-bold cursor-pointer bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 whitespace-nowrap border-x border-blue-500/20"
                    title="ตำแหน่งรวมทุกๆแถวของหน่วยงานนั้นๆ รวมทั้งตำแหน่งว่าง"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>ตำแหน่งรวม (รวมว่าง)</span>
                      {sortField === 'total' && (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                    </div>
                  </th>

                  {/* คนครอง รวมแค่คนที่ครองอยู่ ของหน่วยงานนั้นๆ */}
                  <th
                    onClick={() => {
                      if (sortField === 'occupied') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortField('occupied');
                        setSortOrder('desc');
                      }
                    }}
                    className="py-3 px-3 text-center font-bold cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 whitespace-nowrap border-r border-emerald-500/20"
                    title="คนครอง รวมแค่คนที่ครองอยู่ ของหน่วยงานนั้นๆ"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>คนครอง (คนที่ครองอยู่)</span>
                      {sortField === 'occupied' && (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                    </div>
                  </th>

                  {/* ตำแหน่งว่าง */}
                  <th
                    onClick={() => {
                      if (sortField === 'vacant') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortField('vacant');
                        setSortOrder('desc');
                      }
                    }}
                    className="py-3 px-3 text-center font-bold cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 whitespace-nowrap border-r border-rose-500/20"
                    title="จำนวนตำแหน่งว่างที่ยังไม่มีผู้ครอง"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>ตำแหน่งว่าง</span>
                      {sortField === 'vacant' && (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                    </div>
                  </th>

                  {/* ร้อยละการครองตำแหน่ง */}
                  <th
                    onClick={() => {
                      if (sortField === 'fillRate') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortField('fillRate');
                        setSortOrder('desc');
                      }
                    }}
                    className="py-3 px-3 text-center font-bold cursor-pointer hover:text-amber-500 whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>% ครอง</span>
                      {sortField === 'fillRate' && (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                    </div>
                  </th>

                  {/* การจัดการ / แจกแจงทุกแถว */}
                  <th className="py-3 px-3 text-right font-bold whitespace-nowrap">แถวแจกแจง / การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredDivisions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-2">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-sm">ไม่พบหน่วยงาน บก./กอง ที่ตรงกับเงื่อนไขการค้นหา</p>
                      <p className="text-xs mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองเป็น "ทุก บช."</p>
                    </td>
                  </tr>
                ) : (
                  filteredDivisions.map((div, idx) => {
                    const isExpanded = expandedDivIds.has(div.id);
                    const hasOfficers = div.total > 0;

                    return (
                      <React.Fragment key={div.id}>
                        <tr
                          className={`transition-colors group ${
                            isExpanded
                              ? currentTheme.isDark
                                ? 'bg-amber-950/20'
                                : 'bg-amber-50/50'
                              : hasOfficers
                              ? currentTheme.isDark
                                ? 'bg-slate-900/60 hover:bg-slate-850'
                                : 'bg-white hover:bg-slate-50'
                              : currentTheme.isDark
                              ? 'hover:bg-slate-800/40 opacity-80'
                              : 'hover:bg-slate-50 opacity-80'
                          }`}
                        >
                          {/* Index */}
                          <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>

                          {/* Bureau */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-lg border font-mono ${div.parentBureau.badgeColor}`}
                            >
                              {div.bureauCode}
                            </span>
                          </td>

                          {/* Division Name & Expand Toggle */}
                          <td className="py-3 px-3 min-w-[200px]">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleRowExpansion(div.id)}
                                className="p-1 rounded-md hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                                title={isExpanded ? 'ย่อรายละเอียดทุกแถว' : 'ขยายดูทุกแถวของหน่วยงานนี้'}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-amber-500" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                                  {div.name}
                                </span>
                                <span className="ml-2 font-mono text-[11px] text-amber-500 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                                  {div.shortName}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Mission Category */}
                          <td className="py-3 px-3 whitespace-nowrap hidden lg:table-cell">
                            <span className="text-[11px] px-2 py-0.5 rounded-full border bg-slate-500/10 text-slate-400 border-slate-500/20">
                              {div.category}
                            </span>
                          </td>

                          {/* ตำแหน่งรวมทุกๆ แถว รวมทั้งตำแหน่งว่าง */}
                          <td className="py-3 px-3 text-center whitespace-nowrap bg-blue-500/5 border-x border-blue-500/20">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 font-bold font-mono text-xs border border-blue-500/30">
                              {div.total} อัตรา
                            </span>
                          </td>

                          {/* คนครอง รวมแค่คนที่ครองอยู่ ของหน่วยงานนั้นๆ */}
                          <td className="py-3 px-3 text-center whitespace-nowrap bg-emerald-500/5 border-r border-emerald-500/20">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold font-mono text-xs border border-emerald-500/30">
                              {div.occupied} นาย
                            </span>
                          </td>

                          {/* ตำแหน่งว่าง */}
                          <td className="py-3 px-3 text-center whitespace-nowrap bg-rose-500/5 border-r border-rose-500/20">
                            {div.vacant > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 font-bold font-mono text-xs border border-rose-500/30 animate-pulse">
                                {div.vacant} ว่าง
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-mono">-</span>
                            )}
                          </td>

                          {/* % ครอง */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="inline-flex flex-col items-center">
                              <span className="font-mono font-bold text-xs">
                                {div.fillRate}%
                              </span>
                              <div className="w-12 bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-1">
                                <div
                                  className={`h-full rounded-full ${
                                    div.fillRateNum >= 90
                                      ? 'bg-emerald-500'
                                      : div.fillRateNum >= 75
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${Math.min(100, div.fillRateNum)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => toggleRowExpansion(div.id)}
                                className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                                  isExpanded
                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                    : 'border-slate-300 dark:border-slate-700 hover:border-amber-400 text-slate-300'
                                }`}
                                title="เปิดดูตารางแจกแจงทุกแถวของหน่วยงานนี้"
                              >
                                <Layers className="w-3 h-3 text-amber-400" />
                                <span>{isExpanded ? 'ซ่อนแถว' : 'แจกแจงทุกแถว'}</span>
                              </button>

                              <button
                                onClick={() => onOpenDivisionDetail(div.displayName, div.parentBureau)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-[11px] transition-colors cursor-pointer shadow-2xs"
                                title="เปิดดูรายชื่อและจัดการกำลังพลใน บก./กอง นี้"
                              >
                                <Eye className="w-3 h-3" />
                                <span>ทำเนียบ</span>
                              </button>

                              <button
                                onClick={() => onAddOfficerToDivision(div.matchedDivisionName || div.name, '__ALL__')}
                                className={`p-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                                  currentTheme.isDark
                                    ? 'border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200'
                                    : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                                }`}
                                title="เพิ่มกำลังพลใน บก. นี้"
                              >
                                <Plus className="w-3.5 h-3.5 text-amber-500" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Row Drawer: Showing "ทุกๆ แถวของหน่วยงานนั้นๆ" */}
                        {isExpanded && (
                          <tr className="bg-slate-950/40 border-b border-amber-500/30">
                            <td colSpan={9} className="p-4 sm:p-5">
                              <div
                                className={`rounded-xl border p-4 ${
                                  currentTheme.isDark
                                    ? 'bg-slate-950/80 border-slate-800'
                                    : 'bg-white border-slate-200 shadow-inner'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-amber-400 text-sm">
                                      📊 รายละเอียดทุกแถวของหน่วยงาน: {div.name} ({div.shortName})
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      สังกัด {div.parentBureau.fullName}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-xs font-mono">
                                    <span className="text-blue-400 font-bold">
                                      ตำแหน่งรวม {div.total} อัตรา
                                    </span>
                                    <span>·</span>
                                    <span className="text-emerald-400 font-bold">
                                      คนครอง {div.occupied} นาย
                                    </span>
                                    <span>·</span>
                                    <span className="text-rose-400 font-bold">
                                      ว่าง {div.vacant} อัตรา
                                    </span>
                                  </div>
                                </div>

                                {/* Position Level Rows Table */}
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                                      <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                                      <span>แจกแจงทุกแถวตามระดับตำแหน่ง (ตำแหน่งรวม vs คนครอง):</span>
                                    </h4>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs text-left border-collapse">
                                        <thead>
                                          <tr className="border-b border-slate-800 text-[11px] text-slate-400 bg-slate-900/80">
                                            <th className="py-2 px-3">แถวระดับตำแหน่ง</th>
                                            <th className="py-2 px-3 text-center text-blue-400">ตำแหน่งรวม (รวมทั้งว่าง)</th>
                                            <th className="py-2 px-3 text-center text-emerald-400">คนครอง (รวมแค่คนที่ครองอยู่)</th>
                                            <th className="py-2 px-3 text-center text-rose-400">ตำแหน่งว่าง</th>
                                            <th className="py-2 px-3 text-center">% ครอง</th>
                                            <th className="py-2 px-3">รายชื่อผู้ครองตำแหน่ง / สถานะ</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                          {div.rankRows.map((tier) => (
                                            <tr
                                              key={tier.key}
                                              className={`hover:bg-slate-800/40 ${
                                                tier.total > 0 ? '' : 'opacity-60'
                                              }`}
                                            >
                                              <td className="py-2 px-3 font-semibold text-slate-200">
                                                {tier.label}
                                              </td>
                                              <td className="py-2 px-3 text-center font-mono font-bold text-blue-400 bg-blue-500/5">
                                                {tier.total} อัตรา
                                              </td>
                                              <td className="py-2 px-3 text-center font-mono font-bold text-emerald-400 bg-emerald-500/5">
                                                {tier.occupied} นาย
                                              </td>
                                              <td className="py-2 px-3 text-center font-mono text-rose-400 bg-rose-500/5">
                                                {tier.vacant > 0 ? `${tier.vacant} ว่าง` : '-'}
                                              </td>
                                              <td className="py-2 px-3 text-center font-mono">
                                                {tier.fillRate}%
                                              </td>
                                              <td className="py-2 px-3">
                                                {tier.officers.length > 0 ? (
                                                  <div className="flex flex-wrap gap-1 max-w-md">
                                                    {tier.officers.slice(0, 4).map((o) => (
                                                      <span
                                                        key={o.id}
                                                        className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                                                          o.isVacant
                                                            ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                                                            : 'bg-slate-800 text-slate-200 border-slate-700'
                                                        }`}
                                                      >
                                                        {o.isVacant ? '📭 ตำแหน่งว่าง' : `${o.rank} ${o.firstName}`}
                                                      </span>
                                                    ))}
                                                    {tier.officers.length > 4 && (
                                                      <span className="text-[10px] text-slate-400 self-center">
                                                        +{tier.officers.length - 4} ท่าน
                                                      </span>
                                                    )}
                                                  </div>
                                                ) : (
                                                  <span className="text-[11px] text-slate-500 italic">ไม่มีข้อมูลในระดับนี้</span>
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                  {/* Sub-divisions rows if present */}
                                  {div.subDivRows.length > 0 && (
                                    <div className="pt-3 border-t border-slate-800">
                                      <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                                        <span>แจกแจงทุกแถวตามฝ่าย / กก. / กลุ่มงาน:</span>
                                      </h4>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                        {div.subDivRows.map((s) => (
                                          <div
                                            key={s.subName}
                                            className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs flex items-center justify-between"
                                          >
                                            <div className="truncate mr-2 font-medium text-slate-200" title={s.subName}>
                                              {s.subName}
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                                              <span className="text-blue-400 font-bold" title="ตำแหน่งรวม">
                                                {s.total} รวม
                                              </span>
                                              <span>/</span>
                                              <span className="text-emerald-400 font-bold" title="คนครอง">
                                                {s.occupied} ครอง
                                              </span>
                                              {s.vacant > 0 && (
                                                <>
                                                  <span>/</span>
                                                  <span className="text-rose-400 font-bold" title="ว่าง">
                                                    {s.vacant} ว่าง
                                                  </span>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* Mode 2: Expanded All Position Tiers Rows View */}
          {viewMode === 'ranks_all' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className={`border-b ${
                    currentTheme.isDark
                      ? 'bg-slate-800/90 text-slate-300 border-slate-700/80'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <th className="py-3 px-3 w-10 text-center font-bold">ลำดับ</th>
                  <th className="py-3 px-3 font-bold whitespace-nowrap">บช.</th>
                  <th className="py-3 px-3 font-bold whitespace-nowrap">หน่วยงาน (บก./กอง)</th>
                  <th className="py-3 px-3 font-bold whitespace-nowrap">แถวระดับตำแหน่ง</th>
                  <th className="py-3 px-3 text-center font-bold text-blue-400 bg-blue-500/10 border-x border-blue-500/20 whitespace-nowrap">
                    ตำแหน่งรวม (รวมทั้งตำแหน่งว่าง)
                  </th>
                  <th className="py-3 px-3 text-center font-bold text-emerald-400 bg-emerald-500/10 border-r border-emerald-500/20 whitespace-nowrap">
                    คนครอง (รวมแค่คนที่ครองอยู่)
                  </th>
                  <th className="py-3 px-3 text-center font-bold text-rose-400 bg-rose-500/10 border-r border-rose-500/20 whitespace-nowrap">
                    ตำแหน่งว่าง
                  </th>
                  <th className="py-3 px-3 text-center font-bold whitespace-nowrap">% ครอง</th>
                  <th className="py-3 px-3 text-right font-bold whitespace-nowrap">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredDivisions.flatMap((div, dIdx) =>
                  div.rankRows.map((tier, tIdx) => {
                    const rowKey = `${div.id}-${tier.key}`;
                    const hasData = tier.total > 0;

                    return (
                      <tr
                        key={rowKey}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          hasData ? '' : 'opacity-60'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {dIdx + 1}.{tIdx + 1}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-amber-400">
                          {div.bureauCode}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-200">
                          {div.name}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-slate-100">
                          {tier.label}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-400 bg-blue-500/5 border-x border-blue-500/20 whitespace-nowrap">
                          {tier.total} อัตรา
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-400 bg-emerald-500/5 border-r border-emerald-500/20 whitespace-nowrap">
                          {tier.occupied} นาย
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-rose-400 bg-rose-500/5 border-r border-rose-500/20 whitespace-nowrap">
                          {tier.vacant > 0 ? `${tier.vacant} ว่าง` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono whitespace-nowrap">
                          {tier.fillRate}%
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => onOpenDivisionDetail(div.displayName, div.parentBureau)}
                            className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-[10px]"
                          >
                            ดูรายชื่อ
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* Mode 3: Expanded Sub-Divisions Rows View */}
          {viewMode === 'subdivs_all' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className={`border-b ${
                    currentTheme.isDark
                      ? 'bg-slate-800/90 text-slate-300 border-slate-700/80'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <th className="py-3 px-3 w-10 text-center font-bold">ลำดับ</th>
                  <th className="py-3 px-3 font-bold whitespace-nowrap">บช.</th>
                  <th className="py-3 px-3 font-bold whitespace-nowrap">หน่วยงาน (บก./กอง)</th>
                  <th className="py-3 px-3 font-bold whitespace-nowrap">แถวฝ่าย / กก.</th>
                  <th className="py-3 px-3 text-center font-bold text-blue-400 bg-blue-500/10 border-x border-blue-500/20 whitespace-nowrap">
                    ตำแหน่งรวม (รวมทั้งตำแหน่งว่าง)
                  </th>
                  <th className="py-3 px-3 text-center font-bold text-emerald-400 bg-emerald-500/10 border-r border-emerald-500/20 whitespace-nowrap">
                    คนครอง (รวมแค่คนที่ครองอยู่)
                  </th>
                  <th className="py-3 px-3 text-center font-bold text-rose-400 bg-rose-500/10 border-r border-rose-500/20 whitespace-nowrap">
                    ตำแหน่งว่าง
                  </th>
                  <th className="py-3 px-3 text-center font-bold whitespace-nowrap">% ครอง</th>
                  <th className="py-3 px-3 text-right font-bold whitespace-nowrap">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredDivisions.flatMap((div, dIdx) =>
                  div.subDivRows.map((sub, sIdx) => (
                    <tr key={`${div.id}-${sub.subName}`} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {dIdx + 1}.{sIdx + 1}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-amber-400">
                        {div.bureauCode}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-200">
                        {div.name}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-slate-100">
                        {sub.subName}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-400 bg-blue-500/5 border-x border-blue-500/20 whitespace-nowrap">
                        {sub.total} อัตรา
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-400 bg-emerald-500/5 border-r border-emerald-500/20 whitespace-nowrap">
                        {sub.occupied} นาย
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-rose-400 bg-rose-500/5 border-r border-rose-500/20 whitespace-nowrap">
                        {sub.vacant > 0 ? `${sub.vacant} ว่าง` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono whitespace-nowrap">
                        {sub.fillRate}%
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onOpenDivisionDetail(div.displayName, div.parentBureau)}
                          className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-[10px]"
                        >
                          ดูรายชื่อ
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer */}
        <div
          className={`p-3.5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
            currentTheme.isDark
              ? 'bg-slate-850 border-slate-800 text-slate-400'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          <div>
            แสดง <span className="font-bold text-amber-500">{filteredDivisions.length}</span> จากทั้งหมด{' '}
            <span className="font-bold">{divisionsWithStats.length}</span> หน่วยงานระดับ บก. / กอง ในสังกัด ตร.
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-blue-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              ตำแหน่งรวม: {globalSummary.grandTotalPositions}
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              คนครอง: {globalSummary.grandTotalOccupied}
            </span>
            <span className="flex items-center gap-1 text-rose-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              ตำแหน่งว่าง: {globalSummary.grandTotalVacant}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Add Custom Division Modal */}
      {isAddCustomDivOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden p-5 ${
              currentTheme.isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base">เพิ่มหน่วยงานระดับ บก. / กอง ใหม่</h3>
              </div>
              <button
                onClick={() => setIsAddCustomDivOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomDivision} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">
                  สังกัด บช. (กองบัญชาการ) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={customBureauCode}
                  onChange={(e) => setCustomBureauCode(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border outline-hidden ${
                    currentTheme.isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  {RTP_BUREAUS_DATA.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">
                  ชื่อหน่วยงานระดับ บก. / กอง <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customDivName}
                  onChange={(e) => setCustomDivName(e.target.value)}
                  placeholder="เช่น กองบังคับการปฏิบัติการพิเศษ"
                  className={`w-full px-3 py-2 rounded-xl border outline-hidden ${
                    currentTheme.isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">
                  ตัวย่อหน่วยงาน (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={customDivAcronym}
                  onChange={(e) => setCustomDivAcronym(e.target.value)}
                  placeholder="เช่น บก.ปพ."
                  className={`w-full px-3 py-2 rounded-xl border outline-hidden ${
                    currentTheme.isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCustomDivOpen(false)}
                  className={`px-4 py-2 rounded-xl border font-semibold ${
                    currentTheme.isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  บันทึกหน่วยงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
