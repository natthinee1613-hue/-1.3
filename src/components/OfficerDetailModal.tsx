import React from 'react';
import { PoliceOfficer } from '../types/personnel';
import { PoliceEmblem } from './PoliceEmblem';
import { X, Edit2, Trash2, Phone, Mail, Building, Shield, User, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface OfficerDetailModalProps {
  officer: PoliceOfficer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (officer: PoliceOfficer) => void;
  onDelete: (officer: PoliceOfficer) => void;
}

export const OfficerDetailModal: React.FC<OfficerDetailModalProps> = ({
  officer,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !officer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Card Header with police branding */}
        <div className="relative p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-block mx-auto mb-2">
            <PoliceEmblem size={52} />
          </div>

          <div className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase font-['Chakra_Petch',sans-serif]">
            สำนักงานกำลังพล สำนักงานตำรวจแห่งชาติ
          </div>
          <h3 className="text-xl font-bold text-slate-100 mt-1 font-['Chakra_Petch',sans-serif]">
            {officer.isVacant ? (
              <span className="text-amber-400 italic">อัตราตำแหน่งว่าง</span>
            ) : (
              `${officer.rank} ${officer.firstName} ${officer.lastName}`
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ตำแหน่ง: <span className="text-slate-200 font-medium">{officer.positionTitle}</span> ({officer.positionLevel})
          </p>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[65vh]">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400">สถานะตำแหน่ง:</span>
            {officer.isVacant ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 font-medium text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                ตำแหน่งว่าง (ยังไม่มีผู้ครอง)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-medium text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                มีผู้ครองตำแหน่ง ({officer.gender === 'ชาย' ? 'ชาย' : officer.gender === 'หญิง' ? 'หญิง' : 'ไม่ระบุ'})
              </span>
            )}
          </div>

          {/* Core Information Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <div>
              <span className="text-slate-500 block text-[11px]">เลขตำแหน่ง</span>
              <span className="font-mono font-semibold text-amber-300 text-xs">
                {officer.positionNumber}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">ชั้นสัญญาบัตร/ประทวน</span>
              <span className="text-slate-200 font-medium">
                {officer.commissionType}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">กองบังคับการ (บก.)</span>
              <span className="text-slate-200 font-medium">{officer.division}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">กองกำกับการ / ฝ่าย (กก.)</span>
              <span className="text-slate-200 font-medium">{officer.subDivision}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">กลุ่มสายงาน</span>
              <span className="text-slate-200 font-medium">{officer.jobGroup}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">สายงาน</span>
              <span className="text-slate-200 font-medium">{officer.jobLine}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">ตำแหน่งควบ</span>
              <span className="text-slate-200 font-medium">{officer.concurrentPosition || '-'}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">เลื่อนไหล</span>
              <span className="text-slate-200 font-medium">{officer.fluidPromotion || '-'}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">ระดับตำแหน่งเลื่อนไหล</span>
              <span className="text-slate-200 font-medium">{officer.fluidLevel || '-'}</span>
            </div>

            <div className="col-span-2">
              <span className="text-slate-500 block text-[11px]">ทำหน้าที่</span>
              <span className="text-slate-200 font-medium">{officer.duty || '-'}</span>
            </div>
          </div>

          {/* Contact Details (if any) */}
          {(officer.phone || officer.email) && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-slate-400 font-medium block text-[11px]">ข้อมูลการติดต่อ</span>
              {officer.phone && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{officer.phone}</span>
                </div>
              )}
              {officer.email && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>{officer.email}</span>
                </div>
              )}
            </div>
          )}

          {/* Notes (if any) */}
          {officer.notes && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 font-medium block text-[11px] mb-1">หมายเหตุ</span>
              <p className="text-slate-300 text-xs leading-relaxed">{officer.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-slate-950/80 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              onDelete(officer);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-950/50 border border-rose-900/60 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            ลบตำแหน่งนี้
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
            >
              ปิด
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(officer);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              แก้ไขข้อมูล
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
