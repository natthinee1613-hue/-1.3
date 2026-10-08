import React, { useState, useRef, useEffect } from 'react';
import { PoliceOfficer, CommissionType, GenderType } from '../types/personnel';
import * as XLSX from 'xlsx';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clipboard,
  ArrowRight,
  Trash2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  officers: PoliceOfficer[];
  onImport: (newOfficers: PoliceOfficer[], mode: 'append' | 'update' | 'replace') => void;
  onResetDefault: () => void;
  onClearAllOfficers?: () => void;
  initialTab?: 'export' | 'upload' | 'paste' | 'clear' | 'reset';
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  officers,
  onImport,
  onResetDefault,
  onClearAllOfficers,
  initialTab = 'export',
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'upload' | 'paste' | 'clear' | 'reset'>(initialTab);
  const [uploadMode, setUploadMode] = useState<'update' | 'append' | 'replace'>('update');
  const [parsedPreview, setParsedPreview] = useState<PoliceOfficer[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [pasteContent, setPasteContent] = useState('');
  const [confirmWipe, setConfirmWipe] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setConfirmWipe(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // --- EXPORT FUNCTIONS ---
  const handleExportExcel = () => {
    const rows = officers.map((o) => ({
      'เลขตำแหน่ง': o.positionNumber,
      'บช.': o.bureau,
      'บก.': o.division,
      'กก.': o.subDivision,
      'กลุ่มสายงาน': o.jobGroup,
      'สายงาน': o.jobLine,
      'ทำหน้าที่': o.duty,
      'ตำแหน่งควบ': o.concurrentPosition || '-',
      'เลื่อนไหล': o.fluidPromotion || '-',
      'ระดับตำแหน่ง': o.positionLevel,
      'ตำแหน่ง': o.positionTitle,
      'ระดับตำแหน่งเลื่อนไหล': o.fluidLevel || '-',
      'สัญญาบัตร/ประทวน/นักเรียน': o.commissionType,
      'ยศ': o.isVacant ? '' : o.rank,
      'ชื่อ': o.isVacant ? '' : o.firstName,
      'สกุล': o.isVacant ? '' : o.lastName,
      'เพศ': o.isVacant ? '' : o.gender,
      'สถานะ': o.isVacant ? 'ตำแหน่งว่าง' : 'มีผู้ครองตำแหน่ง',
      'หมายเหตุ': o.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ทำเนียบกำลังพล สกพ.');
    XLSX.writeFile(workbook, `ทำเนียบกำลังพล_สกพ_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportCSV = () => {
    const headers = [
      'เลขตำแหน่ง',
      'บช.',
      'บก.',
      'กก.',
      'กลุ่มสายงาน',
      'สายงาน',
      'ทำหน้าที่',
      'ตำแหน่งควบ',
      'เลื่อนไหล',
      'ระดับตำแหน่ง',
      'ตำแหน่ง',
      'ระดับตำแหน่งเลื่อนไหล',
      'สัญญาบัตร/ประทวน/นักเรียน',
      'ยศ',
      'ชื่อ',
      'สกุล',
      'เพศ',
      'สถานะ',
    ];

    const csvRows = officers.map((o) => [
      `"${o.positionNumber}"`,
      `"${o.bureau}"`,
      `"${o.division}"`,
      `"${o.subDivision}"`,
      `"${o.jobGroup}"`,
      `"${o.jobLine}"`,
      `"${o.duty}"`,
      `"${o.concurrentPosition || '-'}"`,
      `"${o.fluidPromotion || '-'}"`,
      `"${o.positionLevel}"`,
      `"${o.positionTitle}"`,
      `"${o.fluidLevel || '-'}"`,
      `"${o.commissionType}"`,
      `"${o.isVacant ? '' : o.rank}"`,
      `"${o.isVacant ? '' : o.firstName}"`,
      `"${o.isVacant ? '' : o.lastName}"`,
      `"${o.isVacant ? '' : o.gender}"`,
      `"${o.isVacant ? 'ตำแหน่งว่าง' : 'มีผู้ครองตำแหน่ง'}"`,
    ]);

    // UTF-8 BOM for Thai language compatibility in Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ทำเนียบกำลังพล_สกพ_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(officers, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ทำเนียบกำลังพล_สกพ_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = () => {
    const sampleRows = [
      {
        'เลขตำแหน่ง': '0400 04301 0001',
        'บช.': 'สกพ.',
        'บก.': 'สกพ.',
        'กก.': 'สกพ.',
        'กลุ่มสายงาน': 'อำนวยการและสนับสนุน',
        'สายงาน': 'บริหารงานอำนวยการและสนับสนุน',
        'ทำหน้าที่': 'บริหารงานอำนวยการและสนับสนุน',
        'ตำแหน่งควบ': '-',
        'เลื่อนไหล': 'ไม่เลื่อนไหล',
        'ระดับตำแหน่ง': 'ผบช.',
        'ตำแหน่ง': 'ผบช.',
        'ระดับตำแหน่งเลื่อนไหล': '-',
        'สัญญาบัตร/ประทวน/นักเรียน': 'สัญญาบัตร',
        'ยศ': 'พล.ต.ท.',
        'ชื่อ': 'ชัยต์พจน',
        'สกุล': 'สุวรรณรักษ์',
        'เพศ': 'ชาย',
      },
      {
        'เลขตำแหน่ง': '0400 11305 0006',
        'บช.': 'สกพ.',
        'บก.': 'สกพ.',
        'กก.': 'สกพ.',
        'กลุ่มสายงาน': 'อำนวยการและสนับสนุน',
        'สายงาน': 'อำนวยการ',
        'ทำหน้าที่': 'อำนวยการ',
        'ตำแหน่งควบ': '-',
        'เลื่อนไหล': 'เลื่อนไหล',
        'ระดับตำแหน่ง': 'รอง สว.',
        'ตำแหน่ง': 'รอง สว.ประจำ',
        'ระดับตำแหน่งเลื่อนไหล': 'ผบ.หมู่ - รอง สว.',
        'สัญญาบัตร/ประทวน/นักเรียน': 'สัญญาบัตร',
        'ยศ': '',
        'ชื่อ': '',
        'สกุล': '',
        'เพศ': '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'แม่แบบนำเข้าทำเนียบกำลังพล_สกพ.xlsx');
  };

  // --- PARSE FILE LOGIC ---
  const parseRawObjects = (rawList: any[]) => {
    const results: PoliceOfficer[] = [];

    rawList.forEach((row, index) => {
      // Find matching keys flexible with Thai headers
      const pos =
        row['เลขตำแหน่ง'] ||
        row['เลขต ำแห่นง'] ||
        row['positionNumber'] ||
        row['pos'] ||
        `0400 ${String(index + 1).padStart(8, '0')}`;

      const bur = row['บช.'] || row['บช'] || row['bureau'] || 'สกพ.';
      const div = row['บก.'] || row['บก'] || row['division'] || 'สกพ.';
      const subDiv = row['กก.'] || row['กก'] || row['ฝ่าย'] || row['subDivision'] || 'สกพ.';
      const group = row['กลุ่มสายงาน'] || row['ก่ลุมสำยงำน'] || row['jobGroup'] || 'อำนวยการและสนับสนุน';
      const line = row['สายงาน'] || row['สำยงำน'] || row['jobLine'] || 'อำนวยการ';
      const duty = row['ทำหน้าที่'] || row['ท ำห่นำที่'] || row['duty'] || line;
      const concurrent = row['ตำแหน่งควบ'] || row['ควบ'] || row['concurrentPosition'] || '-';
      const fluid = row['เลื่อนไหล'] || row['fluidPromotion'] || '-';
      const level = row['ระดับตำแหน่ง'] || row['ระดับต ำแห่นง'] || row['positionLevel'] || 'สว.';
      const title = row['ตำแหน่ง'] || row['ต ำแห่นง'] || row['positionTitle'] || level;
      const fluidLvl = row['ระดับตำแหน่งเลื่อนไหล'] || row['ระดับต ำแห่นงเลื่อนไหล'] || row['fluidLevel'] || '-';

      const commRaw = row['สัญญาบัตร/ประทวน/นักเรียน'] || row['สญั ญำบัตร/ประทวน/นักเรียน'] || row['commissionType'] || '';
      let commissionType: CommissionType = 'สัญญาบัตร';
      if (commRaw.includes('ประทวน')) commissionType = 'ประทวน';
      else if (commRaw.includes('นักเรียน')) commissionType = 'นักเรียน';

      const rank = row['ยศ'] || row['rank'] || '';
      const fName = row['ชื่อ'] || row['firstName'] || '';
      const lName = row['สกุล'] || row['lastName'] || '';
      const genderRaw = row['เพศ'] || row['gender'] || '';
      const gender: GenderType = genderRaw.includes('หญิง') ? 'หญิง' : genderRaw.includes('ชาย') ? 'ชาย' : '-';

      const isVacant = !fName || fName.trim() === '-' || fName.trim() === '';

      results.push({
        id: `imported-${Date.now()}-${index}`,
        positionNumber: String(pos).trim(),
        bureau: String(bur).trim(),
        division: String(div).trim(),
        subDivision: String(subDiv).trim(),
        jobGroup: String(group).trim(),
        jobLine: String(line).trim(),
        duty: String(duty).trim(),
        concurrentPosition: String(concurrent).trim(),
        fluidPromotion: String(fluid).trim(),
        positionLevel: String(level).trim(),
        positionTitle: String(title).trim(),
        fluidLevel: String(fluidLvl).trim(),
        commissionType,
        rank: isVacant ? '-' : String(rank).trim(),
        firstName: isVacant ? '' : String(fName).trim(),
        lastName: isVacant ? '' : String(lName).trim(),
        gender: isVacant ? '-' : gender,
        isVacant,
        notes: row['หมายเหตุ'] || row['notes'] || '',
        updatedAt: new Date().toISOString(),
      });
    });

    return results;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (Array.isArray(json)) {
            const parsed = parseRawObjects(json);
            setParsedPreview(parsed);
          } else {
            setParseError('ไฟล์ JSON ต้องเป็น Array ของรายการกำลังพล');
          }
        } catch (err: any) {
          setParseError(`เกิดข้อผิดพลาดในการอ่าน JSON: ${err.message}`);
        }
      };
      reader.readAsText(file);
    } else {
      // Excel or CSV via XLSX library
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);

          if (!json || json.length === 0) {
            setParseError('ไม่พบข้อมูลในไฟล์ที่เลือก');
            return;
          }

          const parsed = parseRawObjects(json);
          setParsedPreview(parsed);
        } catch (err: any) {
          setParseError(`เกิดข้อผิดพลาดในการแปลงไฟล์: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleParsePastedText = () => {
    setParseError(null);
    if (!pasteContent.trim()) {
      setParseError('กรุณาวางข้อความตารางจาก Excel หรือข้อมูลแบบคั่นด้วย Tab / Comma');
      return;
    }

    try {
      const lines = pasteContent.trim().split('\n');
      if (lines.length < 1) {
        setParseError('ไม่พบแถวข้อมูล');
        return;
      }

      // Check delimiter (tab or comma)
      const firstLine = lines[0];
      const delimiter = firstLine.includes('\t') ? '\t' : ',';
      const headers = firstLine.split(delimiter).map((h) => h.replace(/^["']|["']$/g, '').trim());

      const rawRows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim());
        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = cols[idx] || '';
        });
        rawRows.push(rowObj);
      }

      const parsed = parseRawObjects(rawRows);
      setParsedPreview(parsed);
    } catch (err: any) {
      setParseError(`เกิดข้อผิดพลาดในการอ่านข้อมูล: ${err.message}`);
    }
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;
    onImport(parsedPreview, uploadMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100 font-['Chakra_Petch',sans-serif]">
                  ศูนย์ดาวน์โหลดและอัปเดตข้อมูลกำลังพล
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  {officers.length} อัตราในระบบ
                </span>
              </div>
              <p className="text-xs text-slate-400">
                จัดการฐานข้อมูล: ส่งออก (Export), อัปโหลดไฟล์ (Import), ลบอัตราข้อมูลทั้งหมดในระบบ และคืนค่าเริ่มต้น
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6 gap-1.5 sm:gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-2.5 sm:px-3 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'export'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            ดาวน์โหลด (Export)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-2.5 sm:px-3 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            อัปโหลดไฟล์ (Import)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-3 px-2.5 sm:px-3 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'paste'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            วางข้อความ
          </button>
          <button
            onClick={() => setActiveTab('clear')}
            className={`py-3 px-2.5 sm:px-3 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ml-auto ${
              activeTab === 'clear'
                ? 'border-rose-500 text-rose-300 font-bold bg-rose-950/30'
                : 'border-transparent text-rose-400 hover:text-rose-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            ลบอัตราข้อมูลทั้งหมด
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`py-3 px-2.5 sm:px-3 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'reset'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            คืนค่าเริ่มต้น (0 อัตรา)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="overflow-y-auto p-6 flex-1 text-xs space-y-6">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <h4 className="font-semibold text-slate-200 text-sm mb-1">
                  ส่งออกข้อมูลทำเนียบกำลังพลปัจจุบัน ({officers.length} รายการ)
                </h4>
                <p className="text-slate-400 mb-4 text-xs">
                  เลือกรูปแบบไฟล์ที่ต้องการนำไปใช้งาน รองรับทั้งการเปิดในโปรแกรม Microsoft Excel, Google Sheets หรือสำรองข้อมูลระบบ
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={handleExportExcel}
                    className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/20 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">.XLSX</span>
                    </div>
                    <div className="font-semibold text-slate-100 group-hover:text-emerald-300">
                      Excel Spreadsheet
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      จัดรูปแบบตารางภาษาไทย พร้อมเปิดใช้งานทันที
                    </div>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="p-4 rounded-xl bg-slate-900 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-950/20 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="w-6 h-6 text-blue-400" />
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded">.CSV</span>
                    </div>
                    <div className="font-semibold text-slate-100 group-hover:text-blue-300">
                      CSV File (UTF-8 BOM)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      ไฟล์ข้อความคั่นด้วยจุลภาค รองรับภาษาไทยสมบูรณ์
                    </div>
                  </button>

                  <button
                    onClick={handleExportJSON}
                    className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/20 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FileJson className="w-6 h-6 text-amber-400" />
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded">.JSON</span>
                    </div>
                    <div className="font-semibold text-slate-100 group-hover:text-amber-300">
                      JSON Backup
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      โครงสร้างข้อมูลดิบสำหรับสำรองและกู้คืน
                    </div>
                  </button>
                </div>
              </div>

              {/* Template Download */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                <div>
                  <h5 className="font-medium text-slate-200">ดาวน์โหลดแม่แบบไฟล์สำหรับนำเข้า (Template)</h5>
                  <p className="text-slate-400 text-[11px]">
                    ใช้แม่แบบนี้ในการกรอกข้อมูลกำลังพลเพื่อนำเข้ากลับสู่ระบบได้อย่างถูกต้อง
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  ดาวน์โหลด Template (.xlsx)
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-400 bg-slate-950/40 hover:bg-slate-950/70 text-center cursor-pointer transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls,.csv,.json"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-200 text-sm mb-1">
                  คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                </h4>
                <p className="text-slate-400 text-xs">
                  รองรับไฟล์ Excel (.xlsx, .xls), CSV (.csv) หรือ JSON (.json)
                </p>
              </div>

              {parseError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Mode Selection & Preview */}
              {parsedPreview.length > 0 && (
                <div className="space-y-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-slate-200">
                        อ่านข้อมูลสำเร็จ {parsedPreview.length} รายการ
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">โหมดนำเข้า:</span>
                      <select
                        value={uploadMode}
                        onChange={(e) => setUploadMode(e.target.value as any)}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300 focus:outline-none"
                      >
                        <option value="update">อัปเดตตามเลขตำแหน่ง (Update Existing)</option>
                        <option value="append">เพิ่มข้อมูลใหม่ต่อท้าย (Append)</option>
                        <option value="replace">แทนที่ข้อมูลทั้งหมด (Replace All)</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Preview Table */}
                  <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-lg">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-900 sticky top-0 text-slate-300 border-b border-slate-800">
                        <tr>
                          <th className="p-2">เลขตำแหน่ง</th>
                          <th className="p-2">บก.</th>
                          <th className="p-2">กก./ฝ่าย</th>
                          <th className="p-2">ตำแหน่ง</th>
                          <th className="p-2">ยศ ชื่อ สกุล</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {parsedPreview.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            <td className="p-2 font-mono text-amber-300">{row.positionNumber}</td>
                            <td className="p-2 text-slate-300">{row.division}</td>
                            <td className="p-2 text-slate-400">{row.subDivision}</td>
                            <td className="p-2 text-slate-300">{row.positionTitle}</td>
                            <td className="p-2 text-slate-200">
                              {row.isVacant ? (
                                <span className="text-amber-500 italic">ตำแหน่งว่าง</span>
                              ) : (
                                `${row.rank} ${row.firstName} ${row.lastName}`
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {parsedPreview.length > 10 && (
                    <div className="text-center text-slate-500 text-[10px]">
                      ...และอีก {parsedPreview.length - 10} รายการ
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>
                      ระบบจะอัปเดตจำนวนอัตราทั้งหมดและเผยแพร่ข้อมูลล่าสุดลงสู่เว็บไซต์จริงทันที
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleConfirmImport}
                      className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 rounded-lg shadow-md transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      ยืนยันนำเข้าและเผยแพร่ลงเว็บไซต์ทันที ({parsedPreview.length} อัตรา)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PASTE TEXT */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  วางข้อมูลจากตาราง Excel (คัดลอกทั้งตารางแล้ววางที่นี่)
                </label>
                <textarea
                  rows={6}
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder={`เลขตำแหน่ง\tบช.\tบก.\tกก.\tกลุ่มสายงาน\tสายงาน\tทำหน้าที่\tระดับตำแหน่ง\tตำแหน่ง\tสัญญาบัตร/ประทวน/นักเรียน\tยศ\tชื่อ\tสกุล\tเพศ\n0400 04301 0001\tสกพ.\tสกพ.\tสกพ.\tอำนวยการและสนับสนุน\tบริหารงานอำนวยการและสนับสนุน\tบริหารงานอำนวยการและสนับสนุน\tผบช.\tผบช.\tสัญญาบัตร\tพล.ต.ท.\tชัยต์พจน\tสุวรรณรักษ์\tชาย`}
                  className="w-full p-3 font-mono text-[11px] rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleParsePastedText}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  แปลงข้อมูลข้อความ
                </button>
              </div>

              {parseError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {parsedPreview.length > 0 && (
                <div className="space-y-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-semibold text-slate-200">
                      แปลงข้อมูลสำเร็จ {parsedPreview.length} รายการ
                    </span>
                    <button
                      onClick={handleConfirmImport}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ยืนยันนำเข้าและเผยแพร่ลงเว็บไซต์ ({parsedPreview.length} อัตรา)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ลบอัตราข้อมูลทั้งหมดในระบบ */}
          {activeTab === 'clear' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-800/80 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-900/60 border border-rose-700 text-rose-300 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-rose-200 font-['Chakra_Petch',sans-serif]">
                        ฟังก์ชันลบอัตราข้อมูลทั้งหมดในระบบ (ล้างข้อมูล 0 อัตรา)
                      </h4>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-900/80 text-rose-300 border border-rose-700/80 font-bold">
                        DANGER ZONE
                      </span>
                    </div>
                    <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
                      คำเตือน: การลบอัตราข้อมูลทั้งหมดจะทำการล้างข้อมูลกำลังพลทั้งหมดออกจากระบบทันที ({officers.length} อัตรา ให้กลายเป็น 0 อัตรา) เพื่อรองรับการนำเข้าโครงสร้างหรือไฟล์อัตรากำลังพลชุดใหม่ การกระทำนี้จะมีผลต่อตารางทำเนียบ แผนผังโครงสร้าง และการเผยแพร่หน้าเว็บไซต์ทันที
                    </p>
                  </div>
                </div>

                {/* Status card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                    <div className="text-[11px] text-slate-400">อัตราปัจจุบันในระบบ</div>
                    <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
                      {officers.length} <span className="text-xs font-normal">อัตรา</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                    <div className="text-[11px] text-slate-400">สัญญาบัตร</div>
                    <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                      {officers.filter((o) => o.commissionType === 'สัญญาบัตร').length} <span className="text-xs font-normal">อัตรา</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                    <div className="text-[11px] text-slate-400">ประทวน</div>
                    <div className="text-lg font-bold text-blue-400 font-mono mt-0.5">
                      {officers.filter((o) => o.commissionType === 'ประทวน').length} <span className="text-xs font-normal">อัตรา</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                    <div className="text-[11px] text-slate-400">ตำแหน่งว่าง</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                      {officers.filter((o) => o.isVacant).length} <span className="text-xs font-normal">อัตรา</span>
                    </div>
                  </div>
                </div>

                {officers.length > 0 ? (
                  <div className="space-y-4 pt-2">
                    {/* Backup recommendation */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-slate-300">
                        <span className="font-semibold text-amber-400">💡 คำแนะนำเพื่อความปลอดภัย:</span> ท่านสามารถดาวน์โหลดไฟล์สำรองข้อมูล Excel เก็บไว้ก่อนล้างระบบได้ทันที
                      </div>
                      <button
                        type="button"
                        onClick={handleExportExcel}
                        className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-700/60 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        ดาวน์โหลดสำรอง Excel ทันที
                      </button>
                    </div>

                    {/* Double confirmation checkbox */}
                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/60 border border-rose-900/70 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={confirmWipe}
                        onChange={(e) => setConfirmWipe(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-rose-500 rounded cursor-pointer shrink-0"
                      />
                      <span className="text-xs text-rose-200">
                        ข้าพเจ้าได้ตรวจสอบและยืนยันความประสงค์ที่จะ <strong>ลบอัตราข้อมูลทั้งหมดในระบบ ({officers.length} อัตรา)</strong> ให้เป็น 0 อัตรา และรับทราบว่าการกระทำนี้จะส่งผลต่อตารางและเว็บไซต์ทันที
                      </span>
                    </label>

                    {/* Action button */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        disabled={!confirmWipe}
                        onClick={() => {
                          if (
                            window.confirm(
                              `⚠️ ยืนยันครั้งสุดท้าย!\n\nคุณต้องการลบข้อมูลกำลังพลและอัตราตำแหน่งทั้งหมดในระบบจำนวน ${officers.length} อัตรา ให้กลายเป็น 0 อัตรา ใช่หรือไม่?`
                            )
                          ) {
                            if (onClearAllOfficers) {
                              onClearAllOfficers();
                            }
                            onClose();
                          }
                        }}
                        className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl shadow-lg transition-all ${
                          confirmWipe
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>ยืนยันลบอัตราข้อมูลทั้งหมดในระบบ ({officers.length} อัตรา)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
                    <div className="text-amber-400 font-semibold text-sm flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      ขณะนี้ไม่มีข้อมูลอัตรากำลังพลในระบบ (0 อัตรา)
                    </div>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      ฐานข้อมูลสะอาดหมดจดพร้อมรองรับการอัปโหลดไฟล์อัตรากำลังพลชุดใหม่ หรือสามารถคืนค่าเริ่มต้นได้ทุกเมื่อ
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        ไปที่หน้าอัปโหลดไฟล์ (Import)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onResetDefault();
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        คืนค่าเริ่มต้น (0 อัตรา)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: RESET DEFAULT */}
          {activeTab === 'reset' && (
            <div className="p-6 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-900/40 text-amber-400 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-amber-200">
                คืนค่าข้อมูลเริ่มต้นของระบบเป็น 0 อัตรา
              </h4>
              <p className="text-slate-300 max-w-md mx-auto text-xs leading-relaxed">
                การดำเนินการนี้จะรีเซ็ตระบบทำเนียบกำลังพลให้กลับสู่สถานะเริ่มต้นเป็น 0 อัตรา ฐานข้อมูลจะว่างเปล่า สะอาดหมดจด พร้อมสำหรับการนำเข้าหรือจัดทำเนียบกำลังพลชุดใหม่
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('ยืนยันคืนค่าข้อมูลทำเนียบกำลังพลเริ่มต้นให้เป็น 0 อัตรา หรือไม่?')) {
                      onResetDefault();
                      onClose();
                    }
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg transition-colors cursor-pointer"
                >
                  ยืนยันคืนค่าเริ่มต้น (0 อัตรา)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
