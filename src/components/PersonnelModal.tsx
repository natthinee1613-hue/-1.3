import React, { useState, useEffect } from 'react';
import { PoliceOfficer, CommissionType, GenderType } from '../types/personnel';
import { RTP_BUREAUS_DATA, ALL_DIVISIONS_LIST } from '../data/rtpStructure';
import { X, Save, Shield, User, AlertCircle } from 'lucide-react';

interface PersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (officer: PoliceOfficer) => void;
  initialOfficer?: PoliceOfficer | null;
  mode: 'add' | 'edit';
}

const COMMON_RANKS = [
  'พล.ต.อ.',
  'พล.ต.ท.',
  'พล.ต.ต.',
  'พ.ต.อ.',
  'พ.ต.ท.',
  'พ.ต.ต.',
  'ร.ต.อ.',
  'ร.ต.ท.',
  'ร.ต.ต.',
  'ด.ต.',
  'จ.ส.ต.',
  'ส.ต.อ.',
  'ส.ต.ท.',
  'ส.ต.ต.',
  'ว่าที่ พ.ต.ต.',
  'ว่าที่ ร.ต.อ.',
  'ว่าที่ ร.ต.ท.',
  'ว่าที่ ร.ต.ต.',
];

const COMMON_DIVISIONS = [
  'สกพ.',
  'กองอัตรากำลัง สกพ.',
  'กองทะเบียนพล สกพ.',
  'กองสวัสดิการ สกพ.',
];

const COMMON_LEVELS = [
  'ผบช.',
  'รอง ผบช.',
  'ผบก.',
  'รอง ผบก.',
  'ผกก.',
  'รอง ผกก.',
  'สว.',
  'รอง สว.',
  'ผบ.หมู่',
  'ผบ.หมู่-รอง สว.',
];

export const PersonnelModal: React.FC<PersonnelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialOfficer,
  mode,
}) => {
  const [formData, setFormData] = useState<Partial<PoliceOfficer>>({
    positionNumber: '',
    bureau: 'สกพ.',
    division: 'กองอัตรากำลัง สกพ.',
    subDivision: 'ฝ่ายอำนวยการ อต.',
    jobGroup: 'อำนวยการและสนับสนุน',
    jobLine: 'อำนวยการ',
    duty: 'อำนวยการ',
    positionLevel: 'สว.',
    positionTitle: 'สว.',
    commissionType: 'สัญญาบัตร',
    rank: 'พ.ต.ต.',
    firstName: '',
    lastName: '',
    gender: 'ชาย',
    isVacant: false,
    phone: '',
    email: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialOfficer && mode === 'edit') {
      setFormData(initialOfficer);
    } else {
      setFormData({
        positionNumber: `0400 ${Math.floor(10000 + Math.random() * 90000)} ${String(Math.floor(1 + Math.random() * 999)).padStart(4, '0')}`,
        bureau: 'สกพ.',
        division: 'กองอัตรากำลัง สกพ.',
        subDivision: 'ฝ่ายอำนวยการ อต.',
        jobGroup: 'อำนวยการและสนับสนุน',
        jobLine: 'อำนวยการ',
        duty: 'อำนวยการ',
        positionLevel: 'สว.',
        positionTitle: 'สว.',
        commissionType: 'สัญญาบัตร',
        rank: 'พ.ต.ต.',
        firstName: '',
        lastName: '',
        gender: 'ชาย',
        isVacant: false,
        phone: '',
        email: '',
        notes: '',
      });
    }
    setErrors({});
  }, [initialOfficer, mode, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.positionNumber?.trim()) errs.positionNumber = 'กรุณาระบุเลขตำแหน่ง';
    if (!formData.division?.trim()) errs.division = 'กรุณาระบุ บก. / ส่วนบังคับบัญชา';
    if (!formData.subDivision?.trim()) errs.subDivision = 'กรุณาระบุ กก. / ฝ่าย';
    if (!formData.positionLevel?.trim()) errs.positionLevel = 'กรุณาระบุระดับตำแหน่ง';

    if (!formData.isVacant) {
      if (!formData.firstName?.trim()) errs.firstName = 'กรุณาระบุชื่อ (หรือเลือกเป็นตำแหน่งว่าง)';
      if (!formData.lastName?.trim()) errs.lastName = 'กรุณาระบุนามสกุล';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const officer: PoliceOfficer = {
      id: initialOfficer?.id || `p-${Date.now()}`,
      positionNumber: formData.positionNumber || '',
      bureau: formData.bureau || 'สกพ.',
      division: formData.division || 'สกพ.',
      subDivision: formData.subDivision || '',
      jobGroup: formData.jobGroup || 'อำนวยการและสนับสนุน',
      jobLine: formData.jobLine || '',
      duty: formData.duty || formData.jobLine || '',
      positionLevel: formData.positionLevel || 'สว.',
      positionTitle: formData.positionTitle || formData.positionLevel || '',
      commissionType: (formData.commissionType as CommissionType) || 'สัญญาบัตร',
      rank: formData.isVacant ? '-' : formData.rank || '-',
      firstName: formData.isVacant ? '' : formData.firstName || '',
      lastName: formData.isVacant ? '' : formData.lastName || '',
      gender: formData.isVacant ? '-' : (formData.gender as GenderType) || '-',
      isVacant: !!formData.isVacant,
      phone: formData.phone,
      email: formData.email,
      notes: formData.notes,
      updatedAt: new Date().toISOString(),
    };

    onSave(officer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 font-['Chakra_Petch',sans-serif]">
                {mode === 'add' ? 'เพิ่มข้อมูลตำแหน่งกำลังพลใหม่' : 'แก้ไขข้อมูลตำแหน่งกำลังพล'}
              </h3>
              <p className="text-xs text-slate-400">
                สำนักงานกำลังพล (สกพ.) สำนักงานตำรวจแห่งชาติ
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1 text-xs">
          {/* Vacant toggle */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-200">สถานะตำแหน่ง</span>
              <p className="text-[11px] text-slate-400">
                เลือกเป็น "ตำแหน่งว่าง" หากยังไม่มีข้าราชการตำรวจครองตำแหน่งนี้
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVacant}
                onChange={(e) => setFormData({ ...formData, isVacant: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              <span className="ml-2 font-medium text-slate-300">
                {formData.isVacant ? 'ตำแหน่งว่าง' : 'มีผู้ครองตำแหน่ง'}
              </span>
            </label>
          </div>

          {/* Identification Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                เลขตำแหน่ง <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.positionNumber || ''}
                onChange={(e) => setFormData({ ...formData, positionNumber: e.target.value })}
                placeholder="เช่น 0400 04301 0001"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono focus:outline-none focus:border-amber-400"
              />
              {errors.positionNumber && (
                <p className="mt-1 text-rose-400 flex items-center gap-1 text-[11px]">
                  <AlertCircle className="w-3 h-3" /> {errors.positionNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                บช. (กองบัญชาการ)
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.bureau || 'สกพ.'}
                  onChange={(e) => {
                    const selectedB = e.target.value;
                    const matchedNode = RTP_BUREAUS_DATA.find((b) => b.id === selectedB || b.code === selectedB);
                    const defaultSub = matchedNode?.subDivisions[0] || '';
                    setFormData({
                      ...formData,
                      bureau: selectedB,
                      division: defaultSub ? defaultSub.replace(/\(.*?\)/g, '').trim() : formData.division,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  {RTP_BUREAUS_DATA.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Unit / Division Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                บก. (กองบังคับการ / หน่วยงาน) <span className="text-rose-400">*</span>
              </label>
              {(() => {
                const currentBureauNode = RTP_BUREAUS_DATA.find(
                  (b) => b.id === formData.bureau || b.code === formData.bureau
                );
                const bureauDivisions = currentBureauNode ? currentBureauNode.subDivisions : [];

                return (
                  <div className="space-y-1.5">
                    <select
                      value={
                        bureauDivisions.some((d) => d.includes(formData.division || '')) ||
                        COMMON_DIVISIONS.includes(formData.division || '')
                          ? formData.division
                          : 'CUSTOM'
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== 'CUSTOM') {
                          setFormData({ ...formData, division: val.replace(/\(.*?\)/g, '').trim() });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      <optgroup label={`หน่วยงาน บก./กอง ในสังกัด ${formData.bureau || 'ตร.'}`}>
                        {bureauDivisions.map((div) => {
                          const clean = div.replace(/\(.*?\)/g, '').trim();
                          return (
                            <option key={div} value={clean}>
                              {div}
                            </option>
                          );
                        })}
                      </optgroup>
                      <option value="CUSTOM">ระบุชื่อ บก. / กอง อื่นๆ กำหนดเอง...</option>
                    </select>

                    <input
                      type="text"
                      value={formData.division || ''}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      placeholder="หรือพิมพ์ชื่อ บก. / กอง ที่ต้องการ"
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                );
              })()}
              {errors.division && (
                <p className="mt-1 text-rose-400 flex items-center gap-1 text-[11px]">
                  <AlertCircle className="w-3 h-3" /> {errors.division}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                กก. / ฝ่าย / กลุ่มงาน <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.subDivision || ''}
                onChange={(e) => setFormData({ ...formData, subDivision: e.target.value })}
                placeholder="เช่น ฝ่ายอำนวยการ, ฝ่ายแต่งตั้ง, กอ.รมน.สกพ."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
              />
              {errors.subDivision && (
                <p className="mt-1 text-rose-400 flex items-center gap-1 text-[11px]">
                  <AlertCircle className="w-3 h-3" /> {errors.subDivision}
                </p>
              )}
            </div>
          </div>

          {/* Job Line & Duties */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                กลุ่มสายงาน
              </label>
              <input
                type="text"
                value={formData.jobGroup || 'อำนวยการและสนับสนุน'}
                onChange={(e) => setFormData({ ...formData, jobGroup: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                สายงาน
              </label>
              <input
                type="text"
                value={formData.jobLine || ''}
                onChange={(e) => setFormData({ ...formData, jobLine: e.target.value })}
                placeholder="เช่น อำนวยการ, ธุรการ, ทรัพยากรบุคคล"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                ทำหน้าที่
              </label>
              <input
                type="text"
                value={formData.duty || ''}
                onChange={(e) => setFormData({ ...formData, duty: e.target.value })}
                placeholder="เช่น อำนวยการ, ปฏิบัติงาน กอ.รมน."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Level & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                ระดับตำแหน่ง <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.positionLevel || ''}
                onChange={(e) => setFormData({ ...formData, positionLevel: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
              >
                {COMMON_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                ตำแหน่ง (ชื่อตำแหน่งเต็ม)
              </label>
              <input
                type="text"
                value={formData.positionTitle || ''}
                onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                placeholder="เช่น ผบช., สว., ผบ.หมู่"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                สัญญาบัตร / ประทวน / นักเรียน
              </label>
              <select
                value={formData.commissionType || 'สัญญาบัตร'}
                onChange={(e) => setFormData({ ...formData, commissionType: e.target.value as CommissionType })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="สัญญาบัตร">ชั้นสัญญาบัตร</option>
                <option value="ประทวน">ชั้นประทวน</option>
                <option value="นักเรียน">นักเรียน</option>
              </select>
            </div>
          </div>

          {/* New Fields from Official Roster: ตำแหน่งควบ, เลื่อนไหล, ระดับตำแหน่งเลื่อนไหล */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <label className="block font-medium text-slate-300 mb-1 text-xs">
                ตำแหน่งควบ
              </label>
              <input
                type="text"
                value={formData.concurrentPosition || ''}
                onChange={(e) => setFormData({ ...formData, concurrentPosition: e.target.value })}
                placeholder="เช่น ควบ ผกก., ควบ สว., -"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1 text-xs">
                เลื่อนไหล
              </label>
              <input
                type="text"
                value={formData.fluidPromotion || ''}
                onChange={(e) => setFormData({ ...formData, fluidPromotion: e.target.value })}
                placeholder="เช่น เลื่อนไหล, ไม่เลื่อนไหล, -"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1 text-xs">
                ระดับตำแหน่งเลื่อนไหล
              </label>
              <input
                type="text"
                value={formData.fluidLevel || ''}
                onChange={(e) => setFormData({ ...formData, fluidLevel: e.target.value })}
                placeholder="เช่น สว. - รอง ผกก., ผบ.หมู่ - รอง สว."
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>
          </div>

          {/* Person Details (If not vacant) */}
          {!formData.isVacant && (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-4">
              <div className="font-semibold text-amber-400 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                <User className="w-4 h-4" />
                ข้อมูลผู้ครองตำแหน่ง
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">ยศ</label>
                  <select
                    value={formData.rank || 'พ.ต.ต.'}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    {COMMON_RANKS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label className="block font-medium text-slate-300 mb-1">
                    ชื่อ <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="ชื่อจริง"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-rose-400 text-[11px]">{errors.firstName}</p>
                  )}
                </div>
                <div className="sm:col-span-1">
                  <label className="block font-medium text-slate-300 mb-1">
                    สกุล <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="นามสกุล"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-rose-400 text-[11px]">{errors.lastName}</p>
                  )}
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">เพศ</label>
                  <select
                    value={formData.gender || 'ชาย'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as GenderType })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                    <option value="-">ไม่ระบุ (-)</option>
                  </select>
                </div>
              </div>

              {/* Extra contact details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="เช่น 02-507-8000"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">อีเมลติดต่อ</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="เช่น officer@police.go.th"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">หมายเหตุเพิ่มเติม</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="หมายเหตุ คำสั่งแต่งตั้ง หรือข้อมูลเพิ่มเติม..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {mode === 'add' ? 'บันทึกข้อมูลกำลังพล' : 'บันทึกการแก้ไข'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
