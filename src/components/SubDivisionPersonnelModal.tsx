import React, { useState } from 'react';
import { PoliceOfficer } from '../types/personnel';
import { AppTheme } from '../data/themes';
import { PoliceEmblem } from './PoliceEmblem';
import * as XLSX from 'xlsx';
import {
  X,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Download,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Shield,
  Search,
  Filter
} from 'lucide-react';

interface SubDivisionPersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  divisionId: string;
  divisionName: string;
  subDivName: string;
  subDivLabel: string;
  officers: PoliceOfficer[];
  onViewOfficer: (officer: PoliceOfficer) => void;
  onEditOfficer: (officer: PoliceOfficer) => void;
  onDeleteOfficer: (officer: PoliceOfficer) => void;
  onAddOfficerToSubDiv: (division: string, subDiv: string) => void;
  onOpenInMainTable: (division: string, subDiv: string) => void;
  currentTheme: AppTheme;
}

export const SubDivisionPersonnelModal: React.FC<SubDivisionPersonnelModalProps> = ({
  isOpen,
  onClose,
  divisionId,
  divisionName,
  subDivName,
  subDivLabel,
  officers,
  onViewOfficer,
  onEditOfficer,
  onDeleteOfficer,
  onAddOfficerToSubDiv,
  onOpenInMainTable,
  currentTheme,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Filter officers strictly belonging to this division & subDivision
  // Exact match guarantees count is 100% identical to the number displayed on the chart
  const subDivOfficers =
    subDivName === '__ALL__'
      ? officers.filter((o) => o.division === divisionId)
      : officers.filter(
          (o) => o.division === divisionId && o.subDivision.trim() === subDivName.trim()
        );

  const searchedOfficers = subDivOfficers.filter((o) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    const fullName = `${o.rank} ${o.firstName} ${o.lastName}`.toLowerCase();
    return (
      fullName.includes(q) ||
      o.positionNumber.toLowerCase().includes(q) ||
      o.positionTitle.toLowerCase().includes(q) ||
      o.duty.toLowerCase().includes(q) ||
      o.jobLine.toLowerCase().includes(q)
    );
  });

  const totalCount = subDivOfficers.length;
  const occupiedCount = subDivOfficers.filter((o) => !o.isVacant).length;
  const vacantCount = subDivOfficers.filter((o) => o.isVacant).length;
  const commissionedCount = subDivOfficers.filter((o) => o.commissionType === 'สัญญาบัตร').length;
  const nonCommissionedCount = subDivOfficers.filter((o) => o.commissionType === 'ประทวน').length;

  const handleExportThisSubDiv = () => {
    const rows = subDivOfficers.map((o) => ({
      'เลขตำแหน่ง': o.positionNumber,
      'บช.': o.bureau,
      'บก.': o.division,
      'กก./ฝ่าย': o.subDivision,
      'ระดับตำแหน่ง': o.positionLevel,
      'ตำแหน่ง': o.positionTitle,
      'สัญญาบัตร/ประทวน': o.commissionType,
      'ยศ': o.isVacant ? '' : o.rank,
      'ชื่อ': o.isVacant ? '' : o.firstName,
      'สกุล': o.isVacant ? '' : o.lastName,
      'เพศ': o.isVacant ? '' : o.gender,
      'สถานะ': o.isVacant ? 'ตำแหน่งว่าง' : 'มีผู้ครองตำแหน่ง',
      'สายงาน': o.jobLine,
      'หน้าที่': o.duty,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    const sheetName = (subDivName === '__ALL__' ? divisionId : subDivName).slice(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `กำลังพล_${sheetName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl border rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-colors ${
          currentTheme.isDark
            ? 'bg-slate-900 border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header Ribbon */}
        <div
          className={`p-5 border-b flex flex-wrap items-center justify-between gap-3 ${
            currentTheme.isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-[#F8FAFC] border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs border ${
                currentTheme.isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <PoliceEmblem size={34} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    currentTheme.isDark
                      ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {divisionName.replace(' สกพ.', '')}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    currentTheme.isDark
                      ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  ตรงตามผัง: {totalCount} อัตรา
                </span>
              </div>
              <h3 className={`text-base sm:text-lg font-bold font-['Chakra_Petch',sans-serif] mt-0.5 ${currentTheme.textMain}`}>
                {subDivLabel}
              </h3>
              <p className={`text-[11px] ${currentTheme.textMuted}`}>
                แสดงเฉพาะรายชื่อของฝ่ายนี้ตามจำนวนจริง โดยไม่กระทบหรือสับเปลี่ยนข้อมูลในตารางอื่น
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportThisSubDiv}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer shadow-2xs ${
                currentTheme.isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              title="ดาวน์โหลดเฉพาะฝ่ายนี้เป็นไฟล์ Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>ส่งออก Excel ({totalCount})</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenInMainTable(divisionId, subDivName);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors cursor-pointer shadow-2xs"
              title="เปิดตารางใหญ่พร้อมตัวกรองเฉพาะฝ่ายนี้"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>เปิดในตารางรวม</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Breakdown Summary Counters (Strictly matching this sub-division) */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-4 border-b text-xs ${
            currentTheme.isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-[#FAFBFD] border-slate-200'
          }`}
        >
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
            <span className={`text-[10px] block ${currentTheme.textMuted}`}>กรอบอัตรากำลัง</span>
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
              {totalCount}
            </span>
            <span className={`text-[10px] block ${currentTheme.textMuted}`}>อัตราตามผัง</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 text-center shadow-2xs">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">ครองตำแหน่ง</span>
            <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
              {occupiedCount}
            </span>
            <span className={`text-[10px] block ${currentTheme.textMuted}`}>มีตัวตนปฏิบัติงาน</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 text-center shadow-2xs">
            <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-semibold">ตำแหน่งว่าง</span>
            <span className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400 tabular-nums">
              {vacantCount}
            </span>
            <span className={`text-[10px] block ${currentTheme.textMuted}`}>รอการบรรจุ</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 text-center shadow-2xs">
            <span className="text-[10px] text-blue-700 dark:text-blue-400 block font-semibold">สัญญาบัตร</span>
            <span className="text-xl font-bold font-mono text-blue-700 dark:text-blue-400 tabular-nums">
              {commissionedCount}
            </span>
            <span className={`text-[10px] block ${currentTheme.textMuted}`}>นายตำรวจ</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 text-center shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[10px] text-indigo-700 dark:text-indigo-400 block font-semibold">ประทวน</span>
            <span className="text-xl font-bold font-mono text-indigo-700 dark:text-indigo-400 tabular-nums">
              {nonCommissionedCount}
            </span>
            <span className={`text-[10px] block ${currentTheme.textMuted}`}>ชั้นประทวน</span>
          </div>
        </div>

        {/* Search & Add Ribbon inside Modal */}
        <div className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อ-สกุล, เลขตำแหน่ง, ยศ, ตำแหน่งในฝ่ายนี้..."
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                currentTheme.isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-amber-400'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white'
              }`}
            />
          </div>

          <button
            onClick={() => {
              onAddOfficerToSubDiv(divisionId, subDivName);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มตำแหน่งในฝ่ายนี้</span>
          </button>
        </div>

        {/* Table Content with Top Edge Running Light */}
        <div className="overflow-y-auto p-4 pt-0 flex-1">
          <div
            className={`border rounded-2xl overflow-hidden shadow-xs relative ${
              currentTheme.isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-white'
            }`}
          >
            {/* Top Running Laser Light Beam along table header edge */}
            <div className="relative h-1.5 w-full overflow-hidden bg-slate-200/50 dark:bg-slate-800/80">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${
                  currentTheme.isDark ? 'from-amber-600 via-amber-400 to-amber-600' : 'from-blue-600 via-sky-400 to-blue-600'
                }`}
              />
              <div
                className={`absolute inset-0 w-1/2 -skew-x-12 animate-stream-light pointer-events-none ${
                  currentTheme.isDark
                    ? 'bg-gradient-to-r from-transparent via-[#FFE500] to-transparent shadow-[0_0_12px_#FFE500]'
                    : 'bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_10px_rgba(255,255,255,0.9)]'
                }`}
              />
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className={`border-b font-bold font-['Chakra_Petch',sans-serif] ${
                    currentTheme.isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-300'
                      : 'bg-[#F8FAFC] border-slate-200 text-slate-700'
                  }`}
                >
                  <th className="py-2.5 px-3 w-10 text-center">ลำดับ</th>
                  <th className="py-2.5 px-3 min-w-[130px]">เลขตำแหน่ง</th>
                  <th className="py-2.5 px-2 min-w-[70px]">ระดับ</th>
                  <th className="py-2.5 px-3 min-w-[100px]">ตำแหน่ง</th>
                  <th className="py-2.5 px-2 min-w-[75px]">สัญญาบัตร</th>
                  <th className="py-2.5 px-3 min-w-[180px]">ยศ - ชื่อ - สกุล</th>
                  <th className="py-2.5 px-2 min-w-[50px] text-center">เพศ</th>
                  <th className="py-2.5 px-3 min-w-[90px] text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${currentTheme.isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                {searchedOfficers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      ไม่พบข้อมูลกำลังพลในฝ่ายนี้ที่ตรงกับการค้นหา
                    </td>
                  </tr>
                ) : (
                  searchedOfficers.map((officer, index) => (
                    <tr
                      key={officer.id}
                      className={`transition-colors ${
                        officer.isVacant
                          ? currentTheme.isDark
                            ? 'bg-amber-950/15 hover:bg-slate-850'
                            : 'bg-amber-50/60 hover:bg-amber-100/40'
                          : currentTheme.isDark
                          ? 'hover:bg-slate-850'
                          : 'hover:bg-blue-50/50'
                      }`}
                    >
                      {/* Index */}
                      <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* เลขตำแหน่ง */}
                      <td className={`py-2 px-3 font-mono font-bold whitespace-nowrap ${
                        currentTheme.isDark ? 'text-amber-300' : 'text-blue-900'
                      }`}>
                        {officer.positionNumber}
                      </td>

                      {/* ระดับ */}
                      <td className="py-2 px-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            currentTheme.isDark
                              ? 'bg-slate-800 border border-slate-700 text-slate-200'
                              : 'bg-slate-100 border border-slate-200 text-slate-800'
                          }`}
                        >
                          {officer.positionLevel}
                        </span>
                      </td>

                      {/* ตำแหน่ง */}
                      <td className="py-2 px-3 text-[11px] font-medium">
                        {officer.positionTitle}
                      </td>

                      {/* สัญญาบัตร / ประทวน */}
                      <td className="py-2 px-2">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            officer.commissionType === 'สัญญาบัตร'
                              ? currentTheme.isDark
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                              : currentTheme.isDark
                              ? 'bg-slate-800 text-slate-300 border border-slate-700'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {officer.commissionType}
                        </span>
                      </td>

                      {/* ยศ ชื่อ สกุล */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        {officer.isVacant ? (
                          <span className="text-amber-600 dark:text-amber-400 italic font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            ตำแหน่งว่าง
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold ${currentTheme.isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                              {officer.rank}
                            </span>
                            <span className="font-semibold">{officer.firstName}</span>
                            <span>{officer.lastName}</span>
                          </div>
                        )}
                      </td>

                      {/* เพศ */}
                      <td className="py-2 px-2 text-center text-[11px] font-semibold">
                        {officer.gender === 'ชาย' ? (
                          <span className="text-sky-600">ชาย</span>
                        ) : officer.gender === 'หญิง' ? (
                          <span className="text-pink-600">หญิง</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewOfficer(officer)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="ดูรายละเอียดข้อมูลกำลังพล"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditOfficer(officer)}
                            className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="แก้ไขข้อมูล (Edit)"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteOfficer(officer)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="ลบข้อมูล (Delete)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Footer */}
        <div
          className={`p-3.5 px-6 border-t flex flex-wrap items-center justify-between text-xs ${
            currentTheme.isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-[#F8FAFC] border-slate-200 text-slate-600'
          }`}
        >
          <div>
            <span>แสดงตามกรอบฝ่ายนี้ </span>
            <strong className={`font-mono font-bold ${currentTheme.textMain}`}>
              {searchedOfficers.length}
            </strong>
            <span> จาก {totalCount} อัตรา (ตรงตามจำนวนที่คลิกเลือกในผัง ไม่กระทบตารางอื่น)</span>
          </div>

          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl font-semibold border transition-colors cursor-pointer ${
              currentTheme.isDark
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
