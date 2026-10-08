/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PoliceOfficer, CategoryBreakdownStat } from '../types/personnel';
import * as XLSX from 'xlsx';
import {
  Shield,
  Users,
  Award,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
  PieChart,
  BarChart3,
  ArrowUpRight,
  Filter,
  Search,
  Download,
  Layers,
  ArrowUpDown,
  Share2,
  SlidersHorizontal,
  ChevronRight,
  FileSpreadsheet,
  Link,
  Sparkles,
  GitBranch,
  FolderTree,
  Activity,
  Briefcase
} from 'lucide-react';

interface StatsDashboardProps {
  officers: PoliceOfficer[];
  onSelectDivisionFilter: (division: string) => void;
  onSelectSubDivisionFilter?: (subDiv: string, div?: string) => void;
  onSelectCustomFilter?: (filterType: string, value: string) => void;
  isPastelTheme?: boolean;
}

// 14 Topics matching official roster headers & user's image:
// เลขตำแหน่ง | บช. | บก. | กก. | กลุ่มสายงาน | สายงาน | ทำหน้าที่ | ตำแหน่งควบ | เลื่อนไหล | ระดับตำแหน่ง | ตำแหน่ง | ระดับตำแหน่งเลื่อนไหล | สัญญาบัตร/ประทวน/นักเรียน | ยศ | ชื่อ | สกุล | เพศ
export type TopicKey =
  | 'all'
  | 'division'
  | 'subDivision'
  | 'jobGroup'
  | 'jobLine'
  | 'duty'
  | 'concurrentPosition'
  | 'fluidPromotion'
  | 'positionLevel'
  | 'positionTitle'
  | 'fluidLevel'
  | 'commissionType'
  | 'rank'
  | 'gender'
  | 'status';

interface TopicMeta {
  key: TopicKey;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  extractor: (o: PoliceOfficer) => string;
}

const TOPICS_CONFIG: TopicMeta[] = [
  {
    key: 'division',
    label: 'บก. (กองบังคับการ / หน่วยงานหลัก)',
    shortLabel: 'บก. / หน่วยงาน',
    icon: '🏢',
    description: 'การแยกย่อยอัตรากำลังตามกองบังคับการและส่วนบังคับบัญชาหลัก',
    extractor: (o) => o.division || 'สกพ.',
  },
  {
    key: 'subDivision',
    label: 'กก. (กองกำกับการ / ฝ่าย / กลุ่มงาน)',
    shortLabel: 'กก. / ฝ่าย',
    icon: '🏛️',
    description: 'การแยกย่อยอัตรากำลังตามกองกำกับการ ฝ่าย และกลุ่มงานภายใน บก.',
    extractor: (o) => o.subDivision || 'ส่วนกลาง',
  },
  {
    key: 'jobGroup',
    label: 'กลุ่มสายงาน (Job Group)',
    shortLabel: 'กลุ่มสายงาน',
    icon: '📁',
    description: 'การแยกย่อยตามกลุ่มสายงาน (เช่น อำนวยการและสนับสนุน, ปราบปราม ฯลฯ)',
    extractor: (o) => o.jobGroup || 'ไม่ระบุกลุ่มสายงาน',
  },
  {
    key: 'jobLine',
    label: 'สายงาน (Job Line)',
    shortLabel: 'สายงาน',
    icon: '📑',
    description: 'การแยกย่อยตามสายงานวิชาชีพ (เช่น ทรัพยากรบุคคล, ธุรการ, บริหารงานอำนวยการ)',
    extractor: (o) => o.jobLine || 'ไม่ระบุสายงาน',
  },
  {
    key: 'duty',
    label: 'ทำหน้าที่ (Duty / Task)',
    shortLabel: 'ทำหน้าที่',
    icon: '🎯',
    description: 'การแยกย่อยตามหน้าที่ที่ได้รับมอบหมายจริงในการปฏิบัติราชการ',
    extractor: (o) => o.duty || o.jobLine || 'ไม่ระบุหน้าที่',
  },
  {
    key: 'concurrentPosition',
    label: 'ตำแหน่งควบ (Concurrent / Dual Position)',
    shortLabel: 'ตำแหน่งควบ',
    icon: '🔗',
    description: 'การแยกย่อยตามตำแหน่งควบ (เช่น ควบ ผกก., ควบ สว., ตำแหน่งเดี่ยว/ปกติ)',
    extractor: (o) => o.concurrentPosition || '-',
  },
  {
    key: 'fluidPromotion',
    label: 'การเลื่อนไหล (Fluid Career Promotion)',
    shortLabel: 'เลื่อนไหล',
    icon: '🌊',
    description: 'การแยกย่อยตามสถานะการเลื่อนไหลของตำแหน่ง (เลื่อนไหล / ไม่เลื่อนไหล / ทั่วไป)',
    extractor: (o) => o.fluidPromotion || '-',
  },
  {
    key: 'positionLevel',
    label: 'ระดับตำแหน่ง (Position Level)',
    shortLabel: 'ระดับตำแหน่ง',
    icon: '🎖️',
    description: 'การแยกย่อยตามระดับตำแหน่งโครงสร้าง (ผบช., รอง ผบช., ผบก., ผกก., สว., รอง สว., ผบ.หมู่)',
    extractor: (o) => o.positionLevel || 'ไม่ระบุระดับ',
  },
  {
    key: 'positionTitle',
    label: 'ตำแหน่ง (Position Title / Full Name)',
    shortLabel: 'ชื่อตำแหน่ง',
    icon: '💼',
    description: 'การแยกย่อยตามชื่อตำแหน่งเต็มในโครงสร้างทำเนียบกำลังพล',
    extractor: (o) => o.positionTitle || o.positionLevel || 'ไม่ระบุชื่อตำแหน่ง',
  },
  {
    key: 'fluidLevel',
    label: 'ระดับตำแหน่งเลื่อนไหล (Fluid Level Range)',
    shortLabel: 'ระดับเลื่อนไหล',
    icon: '📈',
    description: 'การแยกย่อยตามช่วงระดับตำแหน่งที่เปิดให้เลื่อนไหล (เช่น สว. - รอง ผกก., ผบ.หมู่ - รอง สว.)',
    extractor: (o) => o.fluidLevel || '-',
  },
  {
    key: 'commissionType',
    label: 'สัญญาบัตร / ประทวน / นักเรียน (Commission Type)',
    shortLabel: 'ชั้นสัญญาบัตร/ประทวน',
    icon: '📜',
    description: 'การแยกย่อยตามชั้นข้าราชการตำรวจ (สัญญาบัตร, ประทวน, นักเรียนตำรวจ)',
    extractor: (o) => o.commissionType || 'สัญญาบัตร',
  },
  {
    key: 'rank',
    label: 'ชั้นยศ (Police Rank)',
    shortLabel: 'ชั้นยศ',
    icon: '🏅',
    description: 'การแยกย่อยตามชั้นยศของผู้ครองตำแหน่งในปัจจุบัน',
    extractor: (o) => (o.isVacant ? 'ตำแหน่งว่าง' : o.rank || 'ไม่ระบุยศ'),
  },
  {
    key: 'gender',
    label: 'เพศ (Gender: ชาย / หญิง)',
    shortLabel: 'เพศ ชาย/หญิง',
    icon: '👥',
    description: 'การแยกย่อยสัดส่วนเพศของกำลังพลผู้ครองตำแหน่ง',
    extractor: (o) => (o.isVacant ? 'ตำแหน่งว่าง' : o.gender === 'ชาย' ? 'ชาย' : o.gender === 'หญิง' ? 'หญิง' : 'ไม่ระบุเพศ'),
  },
  {
    key: 'status',
    label: 'สถานะอัตรากำลัง (Occupancy Status)',
    shortLabel: 'มีผู้ครอง / ว่าง',
    icon: '🏷️',
    description: 'การแยกย่อยระหว่างตำแหน่งที่มีผู้ครองตำแหน่งและตำแหน่งว่างรอการบรรจุ',
    extractor: (o) => (o.isVacant ? 'ตำแหน่งว่าง' : 'มีผู้ครองตำแหน่ง'),
  },
];

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  officers,
  onSelectDivisionFilter,
  onSelectSubDivisionFilter,
  onSelectCustomFilter,
  isPastelTheme = true,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<TopicKey>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortField, setSortField] = useState<'total' | 'occupied' | 'vacant' | 'fill' | 'name'>('total');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [chartViewMode, setChartViewMode] = useState<'bar' | 'percentage'>('bar');

  // Overall Totals
  const total = officers.length;
  const occupied = officers.filter((o) => !o.isVacant).length;
  const vacant = officers.filter((o) => o.isVacant).length;
  const commissioned = officers.filter((o) => o.commissionType === 'สัญญาบัตร').length;
  const nonCommissioned = officers.filter((o) => o.commissionType === 'ประทวน').length;
  const student = officers.filter((o) => o.commissionType === 'นักเรียน').length;
  const male = officers.filter((o) => !o.isVacant && o.gender === 'ชาย').length;
  const female = officers.filter((o) => !o.isVacant && o.gender === 'หญิง').length;
  const concurrentCount = officers.filter((o) => o.concurrentPosition && o.concurrentPosition !== '-').length;
  const fluidCount = officers.filter((o) => o.fluidPromotion && o.fluidPromotion.includes('เลื่อนไหล') && !o.fluidPromotion.includes('ไม่')).length;

  const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : '0';

  // Compute breakdown stats for any extractor
  const computeStats = (extractor: (o: PoliceOfficer) => string): CategoryBreakdownStat[] => {
    const map = new Map<string, CategoryBreakdownStat>();

    officers.forEach((o) => {
      const val = extractor(o) || '-';
      const key = val.trim();

      if (!map.has(key)) {
        map.set(key, {
          key,
          label: key,
          total: 0,
          occupied: 0,
          vacant: 0,
          fillPercentage: 0,
          commissioned: 0,
          nonCommissioned: 0,
          student: 0,
          male: 0,
          female: 0,
        });
      }

      const stat = map.get(key)!;
      stat.total++;
      if (o.isVacant) {
        stat.vacant++;
      } else {
        stat.occupied++;
        if (o.gender === 'ชาย') stat.male++;
        if (o.gender === 'หญิง') stat.female++;
      }
      if (o.commissionType === 'สัญญาบัตร') stat.commissioned++;
      else if (o.commissionType === 'ประทวน') stat.nonCommissioned++;
      else if (o.commissionType === 'นักเรียน') stat.student++;
    });

    const result = Array.from(map.values()).map((s) => ({
      ...s,
      fillPercentage: s.total > 0 ? (s.occupied / s.total) * 100 : 0,
    }));

    return result;
  };

  // Pre-calculate stats for all topics
  const allTopicStats = useMemo(() => {
    const record: Partial<Record<TopicKey, CategoryBreakdownStat[]>> = {};
    TOPICS_CONFIG.forEach((t) => {
      record[t.key] = computeStats(t.extractor);
    });
    return record;
  }, [officers]);

  // Handle Export of any topic table to Excel
  const handleExportTopicTable = (meta: TopicMeta, stats: CategoryBreakdownStat[]) => {
    const rows = stats.map((s, idx) => ({
      'ลำดับ': idx + 1,
      'หัวข้อ / รายการ': s.label,
      'จำนวนกรอบอัตรา (อัตรา)': s.total,
      'สัดส่วน (%)': total > 0 ? ((s.total / total) * 100).toFixed(2) + '%' : '0%',
      'มีผู้ครองตำแหน่ง (นาย)': s.occupied,
      'ตำแหน่งว่าง (อัตรา)': s.vacant,
      '% การบรรจุครองตำแหน่ง': s.fillPercentage.toFixed(1) + '%',
      'ชั้นสัญญาบัตร (อัตรา)': s.commissioned,
      'ชั้นประทวน (อัตรา)': s.nonCommissioned,
      'ชั้นนักเรียน (อัตรา)': s.student,
      'เพศชาย (นาย)': s.male,
      'เพศหญิง (นาย)': s.female,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, meta.shortLabel);
    XLSX.writeFile(workbook, `ตารางแยกย่อย_${meta.shortLabel}_สกพ_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Filter & sort helper for stats table
  const getProcessedStats = (stats: CategoryBreakdownStat[]) => {
    let list = stats;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter((s) => s.label.toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => {
      let diff = 0;
      if (sortField === 'total') diff = a.total - b.total;
      else if (sortField === 'occupied') diff = a.occupied - b.occupied;
      else if (sortField === 'vacant') diff = a.vacant - b.vacant;
      else if (sortField === 'fill') diff = a.fillPercentage - b.fillPercentage;
      else if (sortField === 'name') diff = a.label.localeCompare(b.label, 'th');

      return sortDirection === 'desc' ? -diff : diff;
    });
  };

  // Color generator for category bars
  const getBarColor = (index: number) => {
    const palette = [
      'from-blue-600 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-500',
      'from-purple-500 to-violet-600',
      'from-rose-500 to-pink-600',
      'from-cyan-500 to-sky-600',
      'from-lime-500 to-green-600',
      'from-fuchsia-500 to-pink-600',
    ];
    return palette[index % palette.length];
  };

  // Handle click on category row to filter directory
  const handleCategoryClick = (topicKey: TopicKey, value: string) => {
    if (topicKey === 'division') {
      onSelectDivisionFilter(value);
    } else if (topicKey === 'subDivision' && onSelectSubDivisionFilter) {
      onSelectSubDivisionFilter(value);
    } else if (onSelectCustomFilter) {
      onSelectCustomFilter(topicKey, value);
    } else {
      // Default fallback: filter by division or search
      onSelectDivisionFilter('all');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Header */}
      <div
        className={`p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isPastelTheme
            ? 'bg-gradient-to-r from-blue-50/80 via-white to-amber-50/70 border-slate-200'
            : 'bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-slate-800'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 font-['Chakra_Petch',sans-serif]">
              ระบบวิเคราะห์ข้อมูลกำลังพล สกพ.
            </span>
            <span className="text-xs text-slate-500 font-mono">14 หัวข้อตามแบบรายงานทำเนียบ</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold font-['Chakra_Petch',sans-serif] text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            แผนภูมิและตารางแยกย่อยทุกองค์ประกอบ (ตามรูปแบบโครงสร้างกำลังพล)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            แสดงแผนภูมิแจกแจงสัดส่วนอัตรากำลัง พร้อมตารางแยกย่อยทุกๆ หัวข้อ: บช., บก., กก., กลุ่มสายงาน, สายงาน, ทำหน้าที่, ตำแหน่งควบ, เลื่อนไหล, ระดับตำแหน่ง, ตำแหน่ง, ระดับเลื่อนไหล, สัญญาบัตร/ประทวน, ยศ และเพศ
          </p>
        </div>

        {/* Global Action / View Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setChartViewMode(chartViewMode === 'bar' ? 'percentage' : 'bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer shadow-2xs ${
              isPastelTheme
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-850 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
            <span>แผนภูมิ: {chartViewMode === 'bar' ? 'แสดงจำนวน (คน)' : 'แสดงร้อยละ (%)'}</span>
          </button>
        </div>
      </div>

      {/* Top 7 Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total */}
        <div
          className={`p-3.5 rounded-2xl border shadow-2xs ${
            isPastelTheme
              ? 'bg-[#FEF9EE] border-[#FDE68A] text-slate-800'
              : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}
        >
          <div className="text-[11px] font-medium text-amber-800 dark:text-amber-400">กรอบอัตรากำลังรวม</div>
          <div className="text-2xl font-bold font-mono text-amber-900 dark:text-amber-300 tabular-nums">
            {total}
          </div>
          <div className="text-[10px] text-amber-700/80 dark:text-slate-500">100% ของ สกพ.</div>
        </div>

        {/* Occupied */}
        <div
          className={`p-3.5 rounded-2xl border shadow-2xs ${
            isPastelTheme
              ? 'bg-[#F2FBF7] border-[#A7F3D0] text-slate-800'
              : 'bg-slate-900 border-emerald-900/40 text-slate-100'
          }`}
        >
          <div className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400">มีผู้ครองตำแหน่ง</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300 tabular-nums">
            {occupied}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-500">บรรจุแล้ว {occupancyRate}%</div>
        </div>

        {/* Vacant */}
        <div
          className={`p-3.5 rounded-2xl border shadow-2xs ${
            isPastelTheme
              ? 'bg-[#FFFBEB] border-[#FDE68A] text-slate-800'
              : 'bg-slate-900 border-amber-900/40 text-slate-100'
          }`}
        >
          <div className="text-[11px] font-medium text-amber-800 dark:text-amber-400">ตำแหน่งว่าง</div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-300 tabular-nums">
            {vacant}
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-500">
            ว่าง {total > 0 ? ((vacant / total) * 100).toFixed(1) : 0}%
          </div>
        </div>

        {/* Commissioned */}
        <div
          className={`p-3.5 rounded-2xl border shadow-2xs ${
            isPastelTheme
              ? 'bg-[#F0F7FC] border-[#BAE6FD] text-slate-800'
              : 'bg-slate-900 border-blue-900/40 text-slate-100'
          }`}
        >
          <div className="text-[11px] font-medium text-blue-800 dark:text-blue-400">ชั้นสัญญาบัตร</div>
          <div className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-300 tabular-nums">
            {commissioned}
          </div>
          <div className="text-[10px] text-blue-600">ร.ต.ต. ขึ้นไป</div>
        </div>

        {/* Non-commissioned */}
        <div
          className={`p-3.5 rounded-2xl border shadow-2xs ${
            isPastelTheme
              ? 'bg-[#F4F6FD] border-[#C7D2FE] text-slate-800'
              : 'bg-slate-900 border-indigo-900/40 text-slate-100'
          }`}
        >
          <div className="text-[11px] font-medium text-indigo-800 dark:text-indigo-400">ชั้นประทวน</div>
          <div className="text-2xl font-bold font-mono text-indigo-700 dark:text-indigo-300 tabular-nums">
            {nonCommissioned}
          </div>
          <div className="text-[10px] text-indigo-600">ด.ต. ลงมา</div>
        </div>

        {/* Concurrent / Dual Position */}
        <div
          className={`p-3.5 rounded-2xl border shadow-2xs ${
            isPastelTheme
              ? 'bg-[#FAF5FF] border-[#E9D5FF] text-slate-800'
              : 'bg-slate-900 border-purple-900/40 text-slate-100'
          }`}
        >
          <div className="text-[11px] font-medium text-purple-800 dark:text-purple-400">ตำแหน่งควบ / เลื่อนไหล</div>
          <div className="text-2xl font-bold font-mono text-purple-700 dark:text-purple-300 tabular-nums">
            {concurrentCount} <span className="text-xs text-purple-500 font-normal">/ {fluidCount}</span>
          </div>
          <div className="text-[10px] text-purple-600">ควบ {concurrentCount} · ไหล {fluidCount}</div>
        </div>

        {/* Gender Ratio */}
        <div
          className={`p-3.5 rounded-2xl border shadow-2xs ${
            isPastelTheme
              ? 'bg-[#FFF1F2] border-[#FECDD3] text-slate-800'
              : 'bg-slate-900 border-rose-900/40 text-slate-100'
          }`}
        >
          <div className="text-[11px] font-medium text-rose-800 dark:text-rose-400">สัดส่วน ชาย : หญิง</div>
          <div className="text-xl font-bold font-mono tabular-nums mt-0.5">
            <span className="text-sky-600">{male}</span> : <span className="text-pink-600">{female}</span>
          </div>
          <div className="text-[10px] text-rose-600">
            ชาย {occupied > 0 ? ((male / occupied) * 100).toFixed(0) : 0}% / หญิง {occupied > 0 ? ((female / occupied) * 100).toFixed(0) : 0}%
          </div>
        </div>
      </div>

      {/* Topic Switcher Bar */}
      <div
        className={`p-3 rounded-2xl border shadow-sm space-y-2.5 ${
          isPastelTheme ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-['Chakra_Petch',sans-serif] text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-500" />
            เลือกหัวข้อแผนภูมิและตารางแยกย่อย (คลิกเพื่อเจาะลึกเฉพาะหัวข้อ หรือดูภาพรวมทั้งหมด):
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            ข้อมูลอัปเดตแบบเรียลไทม์ตามฐานข้อมูล
          </span>
        </div>

        {/* Tab Buttons Scrollable Grid */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => {
              setSelectedTopic('all');
              setSearchFilter('');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTopic === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-400/40'
                : isPastelTheme
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🌟</span>
            <span>แสดงทุกหัวข้อพร้อมกัน ({TOPICS_CONFIG.length} ตาราง)</span>
          </button>

          {TOPICS_CONFIG.map((t) => {
            const count = allTopicStats[t.key]?.length || 0;
            const isSelected = selectedTopic === t.key;
            return (
              <button
                key={t.key}
                onClick={() => {
                  setSelectedTopic(t.key);
                  setSearchFilter('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40 font-bold'
                    : isPastelTheme
                    ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.shortLabel}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isPastelTheme
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Topic Sections */}
      <div className="space-y-8">
        {TOPICS_CONFIG.filter((t) => selectedTopic === 'all' || selectedTopic === t.key).map((topicMeta) => {
          const rawStats = allTopicStats[topicMeta.key] || [];
          const processedStats = getProcessedStats(rawStats);
          const maxTotal = Math.max(...rawStats.map((s) => s.total), 1);
          const topicTotalPositions = rawStats.reduce((sum, s) => sum + s.total, 0);

          return (
            <div
              key={topicMeta.key}
              className={`p-5 rounded-2xl border shadow-sm space-y-4 transition-all ${
                isPastelTheme
                  ? 'bg-white border-slate-200/90'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              {/* Header for this Topic */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                    {topicMeta.icon}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-['Chakra_Petch',sans-serif] flex items-center gap-2">
                      <span>แผนภูมิและตารางแยกย่อย: {topicMeta.label}</span>
                      <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {rawStats.length} รายการ
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {topicMeta.description} (รวม {topicTotalPositions} อัตรา)
                    </p>
                  </div>
                </div>

                {/* Table search & Excel export for this topic */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleExportTopicTable(topicMeta, rawStats)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                    title={`ส่งออกตาราง ${topicMeta.shortLabel} เป็น Excel`}
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ส่งออกตารางนี้ (Excel)</span>
                  </button>
                </div>
              </div>

              {/* SECTION 1: VISUAL CHART ("แผนภูมิ") */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    แผนภูมิแท่งแสดงการกระจายตัวและสัดส่วนการครองตำแหน่ง (Visual Distribution Chart):
                  </span>
                  <span className="text-[11px] text-slate-400">
                    แถบสีเข้ม = มีผู้ครองตำแหน่ง · แถบสีอ่อน = ตำแหน่งว่าง
                  </span>
                </div>

                {/* Bars Container */}
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/40">
                  {rawStats.slice(0, 15).map((stat, idx) => {
                    const widthPercent = (stat.total / maxTotal) * 100;
                    const fillRatio = stat.total > 0 ? (stat.occupied / stat.total) * 100 : 0;
                    const shareOfAll = total > 0 ? ((stat.total / total) * 100).toFixed(1) : '0';

                    return (
                      <div key={stat.key} className="space-y-1 group">
                        <div className="flex items-center justify-between text-xs">
                          <button
                            onClick={() => handleCategoryClick(topicMeta.key, stat.key)}
                            className="font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 text-left truncate max-w-[320px] sm:max-w-md flex items-center gap-1.5 cursor-pointer"
                            title={`คลิกเพื่อกรองดูรายชื่อ "${stat.label}" ในทำเนียบ`}
                          >
                            <span className="w-4 text-[10px] text-slate-400 font-mono">{idx + 1}.</span>
                            <span>{stat.label}</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>

                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {stat.total} อัตรา
                            </span>
                            <span className="text-slate-400">({shareOfAll}%)</span>
                            <span className="text-emerald-600 font-semibold">ครอง {stat.occupied}</span>
                            {stat.vacant > 0 && (
                              <span className="text-amber-600 font-semibold">ว่าง {stat.vacant}</span>
                            )}
                          </div>
                        </div>

                        {/* Visual Bar with Occupied Fill */}
                        <div className="h-4 w-full rounded-md bg-slate-200/70 dark:bg-slate-800 overflow-hidden flex items-center p-0.5">
                          <div
                            className={`h-full rounded-sm bg-gradient-to-r ${getBarColor(idx)} transition-all duration-300 relative overflow-hidden`}
                            style={{ width: `${Math.max(widthPercent, 2)}%` }}
                          >
                            {/* Inner fill stripe showing occupied vs vacant */}
                            <div
                              className="h-full bg-white/25 absolute left-0 top-0 bottom-0"
                              style={{ width: `${fillRatio}%` }}
                              title={`มีผู้ครอง ${stat.occupied} จาก ${stat.total} (${fillRatio.toFixed(0)}%)`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {rawStats.length > 15 && (
                    <div className="text-center text-[11px] text-slate-500 pt-1">
                      (แสดงแผนภูมิ 15 รายการแรกที่มีอัตราสูงสุด · ดูครบทั้งหมด {rawStats.length} รายการในตารางด้านล่าง)
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: COMPREHENSIVE BREAKDOWN TABLE ("แยกย่อย ทุกๆ ตาราง") */}
              <div className="space-y-2 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-['Chakra_Petch',sans-serif]">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      ตารางแยกย่อยรายละเอียดฉบับเต็ม ({processedStats.length} แถว):
                    </span>
                  </div>

                  {/* Filter and sorting controls */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="ค้นหาในตารางนี้..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className={`pl-8 pr-2.5 py-1 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          isPastelTheme
                            ? 'bg-slate-50 border-slate-200 text-slate-800'
                            : 'bg-slate-950 border-slate-800 text-slate-200'
                        }`}
                      />
                    </div>

                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value as any)}
                      className={`py-1 px-2 text-xs rounded-xl border focus:outline-none ${
                        isPastelTheme
                          ? 'bg-slate-50 border-slate-200 text-slate-800'
                          : 'bg-slate-950 border-slate-800 text-slate-200'
                      }`}
                    >
                      <option value="total">เรียง: อัตรามาก-น้อย</option>
                      <option value="fill">เรียง: % ครองตำแหน่งสูงสุด</option>
                      <option value="vacant">เรียง: ตำแหน่งว่างมากสุด</option>
                      <option value="name">เรียง: ตามชื่อ ก-ฮ</option>
                    </select>

                    <button
                      onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      className={`p-1.5 rounded-xl border text-xs cursor-pointer ${
                        isPastelTheme ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
                      }`}
                      title={sortDirection === 'desc' ? 'มากไปน้อย' : 'น้อยไปมาก'}
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* The Responsive Table */}
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#F8FAFC] dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-['Chakra_Petch',sans-serif] font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-2.5 w-12 text-center">ที่</th>
                        <th className="py-2.5 px-3 min-w-[200px]">หัวข้อ / รายการ</th>
                        <th className="py-2.5 px-2.5 text-center font-mono">กรอบอัตรา</th>
                        <th className="py-2.5 px-2.5 text-center font-mono">สัดส่วน</th>
                        <th className="py-2.5 px-2.5 text-center font-mono text-emerald-700 dark:text-emerald-400">
                          ครองตำแหน่ง
                        </th>
                        <th className="py-2.5 px-2.5 text-center font-mono text-amber-700 dark:text-amber-400">
                          ตำแหน่งว่าง
                        </th>
                        <th className="py-2.5 px-3 text-center min-w-[120px]">% การบรรจุ</th>
                        <th className="py-2.5 px-2 text-center text-blue-700 dark:text-blue-400 font-mono">
                          สัญญาบัตร
                        </th>
                        <th className="py-2.5 px-2 text-center text-indigo-700 dark:text-indigo-400 font-mono">
                          ประทวน
                        </th>
                        <th className="py-2.5 px-2 text-center text-sky-700 dark:text-sky-400 font-mono">
                          ชาย
                        </th>
                        <th className="py-2.5 px-2 text-center text-pink-700 dark:text-pink-400 font-mono">
                          หญิง
                        </th>
                        <th className="py-2.5 px-3 text-center min-w-[100px]">ดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {processedStats.length === 0 ? (
                        <tr>
                          <td colSpan={12} className="py-8 text-center text-slate-400">
                            ไม่พบข้อมูลที่ตรงกับคำค้นหา
                          </td>
                        </tr>
                      ) : (
                        processedStats.map((stat, idx) => {
                          const percentStr = stat.fillPercentage.toFixed(1);
                          const shareOfRoster = total > 0 ? ((stat.total / total) * 100).toFixed(1) : '0';

                          return (
                            <tr
                              key={stat.key}
                              className="hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors"
                            >
                              <td className="py-2 px-2.5 text-center font-mono text-slate-400 text-[11px]">
                                {idx + 1}
                              </td>

                              <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">
                                <div className="flex items-center gap-1.5">
                                  <span>{stat.label}</span>
                                </div>
                              </td>

                              <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                                {stat.total}
                              </td>

                              <td className="py-2 px-2.5 text-center font-mono text-slate-500 tabular-nums text-[11px]">
                                {shareOfRoster}%
                              </td>

                              <td className="py-2 px-2.5 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                                {stat.occupied}
                              </td>

                              <td className="py-2 px-2.5 text-center font-mono font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                                {stat.vacant}
                              </td>

                              {/* % Fill with mini bar */}
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-mono">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">
                                      {percentStr}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        stat.fillPercentage >= 90
                                          ? 'bg-emerald-500'
                                          : stat.fillPercentage >= 70
                                          ? 'bg-blue-500'
                                          : 'bg-amber-500'
                                      }`}
                                      style={{ width: `${stat.fillPercentage}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              <td className="py-2 px-2 text-center font-mono text-blue-700 dark:text-blue-400 font-semibold tabular-nums">
                                {stat.commissioned}
                              </td>

                              <td className="py-2 px-2 text-center font-mono text-indigo-700 dark:text-indigo-400 font-semibold tabular-nums">
                                {stat.nonCommissioned}
                              </td>

                              <td className="py-2 px-2 text-center font-mono text-sky-700 dark:text-sky-400 font-semibold tabular-nums">
                                {stat.male}
                              </td>

                              <td className="py-2 px-2 text-center font-mono text-pink-700 dark:text-pink-400 font-semibold tabular-nums">
                                {stat.female}
                              </td>

                              <td className="py-2 px-3 text-center">
                                <button
                                  onClick={() => handleCategoryClick(topicMeta.key, stat.key)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                                  title={`กรองดูรายชื่อกำลังพลทั้งหมดในกลุ่ม "${stat.label}"`}
                                >
                                  <span>ดูรายชื่อ</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    {/* Summary Footer Row */}
                    <tfoot className="bg-[#F1F5F9] dark:bg-slate-950 border-t-2 border-slate-300 dark:border-slate-700 font-bold font-mono">
                      <tr>
                        <td colSpan={2} className="py-2.5 px-3 text-right font-['Chakra_Petch',sans-serif]">
                          รวมทั้งสิ้น ({rawStats.length} รายการ):
                        </td>
                        <td className="py-2.5 px-2.5 text-center text-slate-900 dark:text-slate-100 text-sm">
                          {topicTotalPositions}
                        </td>
                        <td className="py-2.5 px-2.5 text-center text-slate-600 text-xs">100%</td>
                        <td className="py-2.5 px-2.5 text-center text-emerald-700 dark:text-emerald-400 text-sm">
                          {rawStats.reduce((sum, s) => sum + s.occupied, 0)}
                        </td>
                        <td className="py-2.5 px-2.5 text-center text-amber-700 dark:text-amber-400 text-sm">
                          {rawStats.reduce((sum, s) => sum + s.vacant, 0)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-xs">
                          {total > 0 ? ((occupied / total) * 100).toFixed(1) : 0}% เฉลี่ย
                        </td>
                        <td className="py-2.5 px-2 text-center text-blue-700 dark:text-blue-400">
                          {rawStats.reduce((sum, s) => sum + s.commissioned, 0)}
                        </td>
                        <td className="py-2.5 px-2 text-center text-indigo-700 dark:text-indigo-400">
                          {rawStats.reduce((sum, s) => sum + s.nonCommissioned, 0)}
                        </td>
                        <td className="py-2.5 px-2 text-center text-sky-700 dark:text-sky-400">
                          {rawStats.reduce((sum, s) => sum + s.male, 0)}
                        </td>
                        <td className="py-2.5 px-2 text-center text-pink-700 dark:text-pink-400">
                          {rawStats.reduce((sum, s) => sum + s.female, 0)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-400 text-[10px]">
                          -
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
