/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PositionStatPair {
  pos: number; // ระดับตำแหน่ง (กรอบอัตรา)
  occ: number; // คนครอง
}

export interface AgencySummaryRow {
  id: string;
  agency: string;             // ชื่อย่อหน่วยงาน เช่น 'ตร.', 'สลก.ตร.', 'บช.น.', 'ภ.9'
  agencyFullName: string;     // ชื่อเต็มหน่วยงาน เช่น 'สำนักงานตำรวจแห่งชาติ', 'กองบัญชาการตำรวจนครบาล'
  
  // สัญญาบัตร
  pbt: PositionStatPair;      // ผบ.ตร.
  rpbt: PositionStatPair;     // รอง ผบ.ตร.
  apbt: PositionStatPair;     // ผู้ช่วย ผบ.ตร.
  pbch: PositionStatPair;     // ผบช.
  rpbch: PositionStatPair;    // รอง ผบช.
  pbg: PositionStatPair;      // ผบก.
  rpbg: PositionStatPair;     // รอง ผบก.
  pgk: PositionStatPair;      // ผกก.
  rpgk: PositionStatPair;     // รอง ผกก.
  sw: PositionStatPair;       // สว.
  rsw: PositionStatPair;      // รอง สว.
  totalCommissioned: PositionStatPair; // รวมชั้นสัญญาบัตร
  
  // ประทวน & นักเรียน
  rswStar: PositionStatPair;  // รอง สว.*
  pbm: PositionStatPair;      // ผบ.หมู่
  totalNonCommissioned: PositionStatPair; // รวมชั้นประทวน
  student: PositionStatPair;  // นักเรียน
  
  // รวมทั้งหมด
  grandTotal: PositionStatPair; // รวมทั้งหมด
  vacant: number;             // อัตราว่าง
  fillPercent: number;        // ร้อยละคนครอง
}

export const RTP_AGENCY_LIST: Array<{ code: string; fullName: string }> = [
  { code: 'ตร.', fullName: 'สำนักงานตำรวจแห่งชาติ (ส่วนกลาง)' },
  { code: 'สลก.ตร.', fullName: 'สำนักงานเลขานุการตำรวจแห่งชาติ' },
  { code: 'ตท.', fullName: 'กองการต่างประเทศ' },
  { code: 'วน.', fullName: 'กองสารนิเทศ' },
  { code: 'บ.ตร.', fullName: 'กองบินตำรวจ' },
  { code: 'สท.', fullName: 'กองสารบรรณ' },
  { code: 'สง.ก.ต.ช.', fullName: 'สำนักงานคณะกรรมการนโยบายตำรวจแห่งชาติ' },
  { code: 'สบร.(ILEA)', fullName: 'สถาบันส่งเสริมงานสอบสวน (ILEA)' },
  { code: 'สยศ.ตร.', fullName: 'สำนักงานยุทธศาสตร์ตำรวจ' },
  { code: 'สกบ.', fullName: 'สำนักงานส่งกำลังบำรุง' },
  { code: 'สกพ.', fullName: 'สำนักงานกำลังพล' },
  { code: 'สงป.', fullName: 'สำนักงานงบประมาณและการเงิน' },
  { code: 'กมค.', fullName: 'สำนักงานกฎหมายและคดี' },
  { code: 'สง.ก.ตร.', fullName: 'สำนักงานคณะกรรมการข้าราชการตำรวจ' },
  { code: 'จต.', fullName: 'สำนักงานจเรตำรวจ' },
  { code: 'สตส.', fullName: 'สำนักงานตรวจสอบภายใน' },
  { code: 'บช.น.', fullName: 'กองบัญชาการตำรวจนครบาล' },
  { code: 'ภ.1', fullName: 'ตำรวจภูธรภาค 1' },
  { code: 'ภ.2', fullName: 'ตำรวจภูธรภาค 2' },
  { code: 'ภ.3', fullName: 'ตำรวจภูธรภาค 3' },
  { code: 'ภ.4', fullName: 'ตำรวจภูธรภาค 4' },
  { code: 'ภ.5', fullName: 'ตำรวจภูธรภาค 5' },
  { code: 'ภ.6', fullName: 'ตำรวจภูธรภาค 6' },
  { code: 'ภ.7', fullName: 'ตำรวจภูธรภาค 7' },
  { code: 'ภ.8', fullName: 'ตำรวจภูธรภาค 8' },
  { code: 'ภ.9', fullName: 'ตำรวจภูธรภาค 9' },
  { code: 'บช.ก.', fullName: 'กองบัญชาการตำรวจสอบสวนกลาง' },
  { code: 'บช.ทท.', fullName: 'กองบัญชาการตำรวจท่องเที่ยว' },
  { code: 'บช.ปส.', fullName: 'กองบัญชาการตำรวจปราบปรามยาเสพติด' },
  { code: 'บช.ส.', fullName: 'กองบัญชาการตำรวจสันติบาล' },
  { code: 'สตม.', fullName: 'สำนักงานตรวจคนเข้าเมือง' },
  { code: 'บช.ตชด.', fullName: 'กองบัญชาการตำรวจตระเวนชายแดน' },
  { code: 'สพฐ.ตร.', fullName: 'สำนักงานพิสูจน์หลักฐานตำรวจ' },
  { code: 'สทส.', fullName: 'สำนักงานเทคโนโลยีสารสนเทศและการสื่อสาร' },
  { code: 'บช.สอท.', fullName: 'กองบัญชาการตำรวจสืบสวนสอบสวนอาชญากรรมทางเทคโนโลยี' },
  { code: 'บช.ศ.', fullName: 'กองบัญชาการศึกษา' },
  { code: 'รร.นรต.', fullName: 'โรงเรียนนายร้อยตำรวจ' },
  { code: 'รพ.ตร.', fullName: 'โรงพยาบาลตำรวจ' },
];

export function createEmptyAgencyRow(code: string, fullName: string, index: number): AgencySummaryRow {
  return {
    id: `agency-${index + 1}-${code}`,
    agency: code,
    agencyFullName: fullName,
    pbt: { pos: 0, occ: 0 },
    rpbt: { pos: 0, occ: 0 },
    apbt: { pos: 0, occ: 0 },
    pbch: { pos: 0, occ: 0 },
    rpbch: { pos: 0, occ: 0 },
    pbg: { pos: 0, occ: 0 },
    rpbg: { pos: 0, occ: 0 },
    pgk: { pos: 0, occ: 0 },
    rpgk: { pos: 0, occ: 0 },
    sw: { pos: 0, occ: 0 },
    rsw: { pos: 0, occ: 0 },
    totalCommissioned: { pos: 0, occ: 0 },
    rswStar: { pos: 0, occ: 0 },
    pbm: { pos: 0, occ: 0 },
    totalNonCommissioned: { pos: 0, occ: 0 },
    student: { pos: 0, occ: 0 },
    grandTotal: { pos: 0, occ: 0 },
    vacant: 0,
    fillPercent: 0,
  };
}

export function computeRowTotals(row: Omit<AgencySummaryRow, 'totalCommissioned' | 'totalNonCommissioned' | 'grandTotal' | 'vacant' | 'fillPercent'>): AgencySummaryRow {
  const commPos =
    (row.pbt?.pos || 0) +
    (row.rpbt?.pos || 0) +
    (row.apbt?.pos || 0) +
    (row.pbch?.pos || 0) +
    (row.rpbch?.pos || 0) +
    (row.pbg?.pos || 0) +
    (row.rpbg?.pos || 0) +
    (row.pgk?.pos || 0) +
    (row.rpgk?.pos || 0) +
    (row.sw?.pos || 0) +
    (row.rsw?.pos || 0);

  const commOcc =
    (row.pbt?.occ || 0) +
    (row.rpbt?.occ || 0) +
    (row.apbt?.occ || 0) +
    (row.pbch?.occ || 0) +
    (row.rpbch?.occ || 0) +
    (row.pbg?.occ || 0) +
    (row.rpbg?.occ || 0) +
    (row.pgk?.occ || 0) +
    (row.rpgk?.occ || 0) +
    (row.sw?.occ || 0) +
    (row.rsw?.occ || 0);

  const nonCommPos = (row.rswStar?.pos || 0) + (row.pbm?.pos || 0);
  const nonCommOcc = (row.rswStar?.occ || 0) + (row.pbm?.occ || 0);

  const studPos = row.student?.pos || 0;
  const studOcc = row.student?.occ || 0;

  const grandPos = commPos + nonCommPos + studPos;
  const grandOcc = commOcc + nonCommOcc + studOcc;
  const vacant = Math.max(0, grandPos - grandOcc);
  const fillPercent = grandPos > 0 ? Math.round((grandOcc / grandPos) * 1000) / 10 : 0;

  return {
    ...row,
    totalCommissioned: { pos: commPos, occ: commOcc },
    totalNonCommissioned: { pos: nonCommPos, occ: nonCommOcc },
    grandTotal: { pos: grandPos, occ: grandOcc },
    vacant,
    fillPercent,
  };
}

export function createInitialEmptyGrid(): AgencySummaryRow[] {
  return RTP_AGENCY_LIST.map((agency, index) =>
    createEmptyAgencyRow(agency.code, agency.fullName, index)
  );
}
