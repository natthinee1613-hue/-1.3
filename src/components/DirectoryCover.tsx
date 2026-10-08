import React from 'react';
import { PoliceEmblem } from './PoliceEmblem';
import { PoliceOfficer } from '../types/personnel';
import { AppTheme } from '../data/themes';
import {
  BookOpen,
  Printer,
  Shield,
  Users,
  Award,
  ChevronRight,
  Building2,
  Sparkles,
  FileText,
  FileSpreadsheet,
  Network,
  CheckCircle,
  ExternalLink,
  Briefcase,
  FileCheck,
  HeartHandshake,
  Landmark,
  Scale
} from 'lucide-react';

interface DirectoryCoverProps {
  officers: PoliceOfficer[];
  onOpenDirectory: () => void;
  onOpenManagement: () => void;
  onSelectDivision: (division: string) => void;
  isPastelTheme?: boolean;
  currentTheme?: AppTheme;
}

export const DirectoryCover: React.FC<DirectoryCoverProps> = ({
  officers,
  onOpenDirectory,
  onOpenManagement,
  onSelectDivision,
  isPastelTheme = true,
  currentTheme,
}) => {
  // Theme check
  const isDark = currentTheme ? currentTheme.isDark : !isPastelTheme;
  const isBatman = currentTheme?.id === 'batman-dark-knight';

  // Find commanders
  const commander = officers.find((o) => o.positionLevel === 'ผบช.');
  const deputyCommanders = officers.filter((o) => o.positionLevel === 'รอง ผบช.');
  const divisionCommanders = officers.filter((o) => o.positionLevel === 'ผบก.');

  const totalPositions = officers.length;
  const occupiedCount = officers.filter((o) => !o.isVacant).length;
  const vacantCount = officers.filter((o) => o.isVacant).length;
  const commissionedCount = officers.filter((o) => o.commissionType === 'สัญญาบัตร').length;
  const nonCommissionedCount = officers.filter((o) => o.commissionType === 'ประทวน').length;

  const skpOfficers = officers.filter((o) => o.division === 'สกพ.');
  const otOfficers = officers.filter((o) => o.division === 'กองอัตรากำลัง สกพ.');
  const tpOfficers = officers.filter((o) => o.division === 'กองทะเบียนพล สกพ.');
  const skOfficers = officers.filter((o) => o.division === 'กองสวัสดิการ สกพ.');

  const handlePrintCover = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Action & Navigation Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl border shadow-md transition-all print:hidden ${
          isDark
            ? 'bg-[#0E0E14]/95 border-[#272736] text-slate-100'
            : 'bg-white/95 border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs border ${
              isBatman
                ? 'bg-[#151520] border-[#FFE500]/50 text-[#FFE500]'
                : isDark
                ? 'bg-slate-900 border-slate-800 text-amber-400'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isBatman
                    ? 'bg-[#FFE500]/15 text-[#FFE500] border-[#FFE500]/40'
                    : isDark
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                เอกสารทางการ สำนักงานตำรวจแห่งชาติ
              </span>
            </div>
            <h2 className={`text-base font-bold font-['Chakra_Petch',sans-serif] mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              ปกเอกสารสายบังคับบัญชา สกพ.
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrintCover}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-xs ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
          >
            <Printer className="w-4 h-4 text-amber-500" />
            <span>พิมพ์หน้าปก (A4)</span>
          </button>

          <button
            type="button"
            onClick={onOpenDirectory}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md ${
              isBatman
                ? 'bg-[#FFE500] text-slate-950 hover:bg-[#FACC15] shadow-[0_0_15px_rgba(255,229,0,0.35)]'
                : isDark
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white hover:from-blue-800 hover:to-indigo-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>เข้าสู่ทำเนียบกำลังพล ({totalPositions} อัตรา) &rarr;</span>
          </button>
        </div>
      </div>

      {/* Official Executive Directory Cover Page (Styled for Professional A4 Government Document) */}
      <div
        className={`relative mx-auto max-w-[900px] rounded-3xl border-4 p-8 sm:p-14 md:p-16 shadow-2xl overflow-hidden print:p-8 print:border-amber-600 print:shadow-none print:max-w-none transition-all ${
          isBatman
            ? 'bg-gradient-to-b from-[#0F0F16] via-[#0A0A0E] to-[#050508] border-[#FFE500]/60 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.8)]'
            : isDark
            ? 'bg-gradient-to-b from-slate-950 via-[#0B132B] to-slate-950 border-amber-500/40 text-slate-100 shadow-2xl'
            : 'bg-gradient-to-b from-[#FFFDF8] via-[#FAF6ED] to-[#F3EBDD] border-[#C59B27] text-slate-900 shadow-xl'
        }`}
      >
        {/* Double-Line Government Filigree Gold Border */}
        <div
          className={`absolute inset-3 sm:inset-4 border-2 rounded-2xl pointer-events-none ${
            isBatman ? 'border-[#FFE500]/30' : isDark ? 'border-amber-500/25' : 'border-[#C59B27]/40'
          }`}
        />
        <div
          className={`absolute inset-5 sm:inset-7 border border-dashed rounded-xl pointer-events-none ${
            isBatman ? 'border-[#FFE500]/20' : isDark ? 'border-amber-500/15' : 'border-[#C59B27]/25'
          }`}
        />

        {/* Four Prestige Gold Corner Ornaments */}
        <div className={`absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 pointer-events-none ${isBatman ? 'border-[#FFE500]' : 'border-amber-500'}`} />
        <div className={`absolute top-5 right-5 w-10 h-10 border-t-2 border-r-2 pointer-events-none ${isBatman ? 'border-[#FFE500]' : 'border-amber-500'}`} />
        <div className={`absolute bottom-5 left-5 w-10 h-10 border-b-2 border-l-2 pointer-events-none ${isBatman ? 'border-[#FFE500]' : 'border-amber-500'}`} />
        <div className={`absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 pointer-events-none ${isBatman ? 'border-[#FFE500]' : 'border-amber-500'}`} />

        {/* Ambient Radial Glow Behind Emblem */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-0 animate-pulse" />

        {/* Official Document Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Header Institution Classification */}
          <div className="space-y-1.5 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-[11px] font-bold tracking-widest uppercase font-['Chakra_Petch',sans-serif]">
              <Scale className="w-3.5 h-3.5" />
              <span>สำนักงานกำลังพล (สกพ.)</span>
            </div>
            <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
          </div>

          {/* Central Official Golden Police Emblem */}
          <div className="mb-8 transform hover:scale-105 transition-transform duration-300 drop-shadow-[0_12px_30px_rgba(212,175,55,0.35)]">
            <PoliceEmblem size={145} />
          </div>

          {/* Prestige Official Titles */}
          <div className="space-y-3 mb-8 max-w-2xl">
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-['Chakra_Petch',sans-serif] ${
                isBatman
                  ? 'text-[#FFE500] drop-shadow-[0_2px_12px_rgba(255,229,0,0.4)]'
                  : isDark
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100'
                  : 'text-[#1E293B] drop-shadow-xs'
              }`}
            >
              สายบังคับบัญชา
            </h1>

            <div className="flex items-center justify-center gap-3 pt-1">
              <span className={`h-0.5 w-14 ${isBatman ? 'bg-[#FFE500]' : 'bg-amber-500'}`} />
              <h2
                className={`text-2xl sm:text-3xl font-bold font-['Chakra_Petch',sans-serif] ${
                  isBatman ? 'text-slate-100' : isDark ? 'text-amber-300' : 'text-[#854D0E]'
                }`}
              >
                สำนักงานกำลังพล (สกพ.)
              </h2>
              <span className={`h-0.5 w-14 ${isBatman ? 'bg-[#FFE500]' : 'bg-amber-500'}`} />
            </div>

            <p className={`text-base sm:text-lg font-semibold tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              สำนักงานตำรวจแห่งชาติ
            </p>
          </div>

          {/* Fiscal Year & Document Registry Ribbon */}
          <div
            className={`inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full font-['Chakra_Petch',sans-serif] text-sm md:text-base font-bold mb-10 shadow-md border ${
              isBatman
                ? 'bg-[#FFE500] text-slate-950 border-[#FFE500] shadow-[0_0_20px_rgba(255,229,0,0.3)]'
                : isDark
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-[#FEF3C7] border-[#E5C158] text-[#78350F]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>ประจำปีงบประมาณ พ.ศ. ๒๕๖๙ (Fiscal Year 2026)</span>
          </div>

          {/* Commander in Chief Executive Showcase */}
          {commander && (
            <div
              className={`w-full max-w-xl mx-auto mb-8 p-6 rounded-3xl border-2 shadow-xl text-center relative overflow-hidden transition-all ${
                isBatman
                  ? 'bg-gradient-to-b from-[#1C1C28] via-[#12121A] to-[#0A0A0E] border-[#FFE500]/80 ring-2 ring-[#FFE500]/30'
                  : isDark
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-amber-400/80 shadow-amber-950/30'
                  : 'bg-gradient-to-b from-white via-[#FFFDF5] to-[#FEF7E6] border-[#E5C158]'
              }`}
            >
              <div
                className={`text-xs uppercase tracking-widest font-black mb-2 ${
                  isBatman ? 'text-[#FFE500]' : isDark ? 'text-amber-400' : 'text-[#854D0E]'
                }`}
              >
                ผู้บัญชาการ สำนักงานกำลังพล (ผบช.สกพ.)
              </div>
              <div
                className={`text-2xl sm:text-3xl font-black font-['Chakra_Petch',sans-serif] ${
                  isBatman ? 'text-slate-100' : isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                {commander.rank} {commander.firstName} {commander.lastName}
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                ผู้บังคับบัญชาสูงสุด สำนักงานกำลังพล สำนักงานตำรวจแห่งชาติ
              </p>
            </div>
          )}

          {/* Deputy Commanders Showcase (รอง ผบช.สกพ.) */}
          {deputyCommanders.length > 0 && (
            <div className="w-full max-w-3xl mb-8">
              <div
                className={`text-xs uppercase tracking-widest font-bold mb-3 ${
                  isBatman ? 'text-[#FFE500]' : isDark ? 'text-slate-400' : 'text-[#1E3A8A]'
                }`}
              >
                รองผู้บัญชาการ สำนักงานกำลังพล (รอง ผบช.สกพ. ๓ ท่าน)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {deputyCommanders.map((dep, idx) => (
                  <div
                    key={dep.id}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      isBatman
                        ? 'bg-[#12121A] border-[#2A2A3C] hover:border-[#FFE500]'
                        : isDark
                        ? 'bg-slate-900/70 border-slate-800 hover:border-amber-500/50'
                        : 'bg-white/90 border-[#DBEAFE] hover:border-[#60A5FA] shadow-2xs'
                    }`}
                  >
                    <div className={`text-[11px] font-bold mb-1 ${isBatman ? 'text-[#FFE500]' : isDark ? 'text-amber-400' : 'text-[#2563EB]'}`}>
                      รอง ผบช.สกพ. ({idx + 1})
                    </div>
                    <div className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {dep.rank} {dep.firstName}
                    </div>
                    <div className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {dep.lastName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4 Key Official Divisions Structure (๔ หน่วยงานหลักในสังกัด สกพ.) */}
          <div className="w-full max-w-3xl mb-8">
            <div
              className={`text-xs uppercase tracking-widest font-bold mb-3 ${
                isBatman ? 'text-[#FFE500]' : isDark ? 'text-slate-400' : 'text-slate-700'
              }`}
            >
              ๔ ส่วนราชการหลักในสังกัด สำนักงานกำลังพล
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'สกพ.',
                  name: 'ส่วนบังคับบัญชา / ฝอ.',
                  count: skpOfficers.length,
                  occupied: skpOfficers.filter((o) => !o.isVacant).length,
                  icon: Shield,
                  color: isBatman ? 'text-[#FFE500]' : 'text-blue-500',
                  badge: isBatman ? 'bg-[#FFE500]/15 text-[#FFE500]' : 'bg-blue-100 text-blue-800',
                },
                {
                  id: 'กองอัตรากำลัง สกพ.',
                  name: 'กองอัตรากำลัง (อต.)',
                  count: otOfficers.length,
                  occupied: otOfficers.filter((o) => !o.isVacant).length,
                  icon: Briefcase,
                  color: isBatman ? 'text-[#34D399]' : 'text-emerald-500',
                  badge: isBatman ? 'bg-[#10B981]/15 text-[#34D399]' : 'bg-emerald-100 text-emerald-800',
                },
                {
                  id: 'กองทะเบียนพล สกพ.',
                  name: 'กองทะเบียนพล (ทพ.)',
                  count: tpOfficers.length,
                  occupied: tpOfficers.filter((o) => !o.isVacant).length,
                  icon: FileCheck,
                  color: isBatman ? 'text-[#38BDF8]' : 'text-indigo-500',
                  badge: isBatman ? 'bg-[#38BDF8]/15 text-[#38BDF8]' : 'bg-indigo-100 text-indigo-800',
                },
                {
                  id: 'กองสวัสดิการ สกพ.',
                  name: 'กองสวัสดิการ (สก.)',
                  count: skOfficers.length,
                  occupied: skOfficers.filter((o) => !o.isVacant).length,
                  icon: HeartHandshake,
                  color: isBatman ? 'text-[#FB7185]' : 'text-rose-500',
                  badge: isBatman ? 'bg-[#F43F5E]/15 text-[#FB7185]' : 'bg-rose-100 text-rose-800',
                },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectDivision(item.id)}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer group flex flex-col justify-between ${
                      isBatman
                        ? 'bg-[#12121A] border-[#2A2A3C] hover:border-[#FFE500] hover:scale-[1.02]'
                        : isDark
                        ? 'bg-slate-900/60 border-slate-800 hover:border-amber-400 hover:scale-[1.02]'
                        : 'bg-white/90 border-slate-200 hover:border-amber-500 hover:bg-[#FEF9EE] hover:scale-[1.02] shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-center mb-1.5">
                        <ItemIcon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div className={`text-xs font-bold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        {item.name}
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px]">
                      <span className={item.badge + ' px-2 py-0.5 rounded-full font-mono font-bold'}>
                        {item.count} อัตรา
                      </span>
                      <span className="text-amber-500 font-semibold group-hover:underline">
                        ดูรายชื่อ &rarr;
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Executive Manpower Statistics */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl border-t border-b py-5 mb-8 ${
              isBatman ? 'border-[#262635]' : isDark ? 'border-slate-800' : 'border-slate-300'
            }`}
          >
            <div className="text-center">
              <div className={`text-2xl sm:text-3xl font-black font-mono tabular-nums ${isBatman ? 'text-[#FFE500]' : isDark ? 'text-amber-300' : 'text-[#854D0E]'}`}>
                {totalPositions}
              </div>
              <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                กรอบอัตรากำลังทั้งหมด
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl sm:text-3xl font-black font-mono tabular-nums ${isBatman ? 'text-[#34D399]' : isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                {occupiedCount}
              </div>
              <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                มีผู้ครองตำแหน่ง ({totalPositions > 0 ? Math.round((occupiedCount / totalPositions) * 100) : 0}%)
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl sm:text-3xl font-black font-mono tabular-nums ${isBatman ? 'text-[#38BDF8]' : isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                {commissionedCount}
              </div>
              <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                ชั้นสัญญาบัตร
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl sm:text-3xl font-black font-mono tabular-nums ${isBatman ? 'text-[#FB7185]' : isDark ? 'text-rose-400' : 'text-indigo-700'}`}>
                {nonCommissionedCount}
              </div>
              <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                ชั้นประทวน
              </div>
            </div>
          </div>

          {/* Official Government Address & Registry Footer */}
          <div className={`text-xs font-['Sarabun',sans-serif] space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <p className="font-bold">ฝ่ายอำนวยการ สำนักงานกำลังพล อาคาร ๕ ชั้น ๗ สำนักงานตำรวจแห่งชาติ</p>
            <p>ถนนพระรามที่ ๑ แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร ๑๐๓๓๐</p>
            <p className="text-[11px] opacity-75">โทรศัพท์ ๐-๒๒๐๕-๒๓๗๖-๗ · จัดทำขึ้นเพื่อการบริหารจัดการข้อมูลกำลังพลภายในหน่วยงาน</p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards into Org Chart & Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[900px] mx-auto print:hidden">
        <div
          onClick={onOpenManagement}
          className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group shadow-md flex items-center justify-between ${
            isBatman
              ? 'bg-[#111117] border-[#FFE500]/50 hover:border-[#FFE500] hover:shadow-[0_0_20px_rgba(255,229,0,0.2)]'
              : isDark
              ? 'bg-slate-900 border-slate-800 hover:border-amber-400'
              : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-lg'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isBatman ? 'bg-[#FFE500]/15 text-[#FFE500]' : 'bg-blue-500/10 text-blue-600'}`}>
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-base font-bold font-['Chakra_Petch',sans-serif] ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                เปิดดูแผนผังโครงสร้างสายบังคับบัญชา
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                คลิกเพื่อดูผังองค์กรแบบ Interactive Tree View และจัดสรรกำลังพล
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </div>

        <div
          onClick={onOpenDirectory}
          className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group shadow-md flex items-center justify-between ${
            isBatman
              ? 'bg-[#111117] border-[#FFE500]/50 hover:border-[#FFE500] hover:shadow-[0_0_20px_rgba(255,229,0,0.2)]'
              : isDark
              ? 'bg-slate-900 border-slate-800 hover:border-amber-400'
              : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-lg'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isBatman ? 'bg-[#FFE500]/15 text-[#FFE500]' : 'bg-emerald-500/10 text-emerald-600'}`}>
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-base font-bold font-['Chakra_Petch',sans-serif] ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                เปิดดูตารางทำเนียบกำลังพล ({totalPositions} อัตรา)
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                ค้นหา คัดกรอง แก้ไข นำเข้าและดาวน์โหลดไฟล์ Excel / PDF
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
