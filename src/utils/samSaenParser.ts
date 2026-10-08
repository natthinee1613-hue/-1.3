/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { PoliceOfficer, CommissionType, GenderType } from '../types/personnel';
import { SamSaenStats, ChunkUploadProgress } from '../types/samSaen';

// Bureau distribution model for nationwide ~300,000 cadre
export const SAM_SAEN_BUREAU_WEIGHTS: Array<{ code: string; name: string; quota: number }> = [
  { code: 'บช.น.', name: 'กองบัญชาการตำรวจนครบาล', quota: 26000 },
  { code: 'ภ.1', name: 'ตำรวจภูธรภาค 1', quota: 21500 },
  { code: 'ภ.2', name: 'ตำรวจภูธรภาค 2', quota: 20000 },
  { code: 'ภ.3', name: 'ตำรวจภูธรภาค 3', quota: 25000 },
  { code: 'ภ.4', name: 'ตำรวจภูธรภาค 4', quota: 24500 },
  { code: 'ภ.5', name: 'ตำรวจภูธรภาค 5', quota: 20500 },
  { code: 'ภ.6', name: 'ตำรวจภูธรภาค 6', quota: 19500 },
  { code: 'ภ.7', name: 'ตำรวจภูธรภาค 7', quota: 19000 },
  { code: 'ภ.8', name: 'ตำรวจภูธรภาค 8', quota: 18500 },
  { code: 'ภ.9', name: 'ตำรวจภูธรภาค 9', quota: 27500 },
  { code: 'บช.ก.', name: 'กองบัญชาการตำรวจสอบสวนกลาง', quota: 14500 },
  { code: 'บช.ตชด.', name: 'กองบัญชาการตำรวจตระเวนชายแดน', quota: 17500 },
  { code: 'สตม.', name: 'สำนักงานตรวจคนเข้าเมือง', quota: 7500 },
  { code: 'บช.ปส.', name: 'กองบัญชาการตำรวจปราบปรามยาเสพติด', quota: 3500 },
  { code: 'บช.ส.', name: 'กองบัญชาการตำรวจสันติบาล', quota: 3200 },
  { code: 'บช.ทท.', name: 'กองบัญชาการตำรวจท่องเที่ยว', quota: 2800 },
  { code: 'บช.สอท.', name: 'กองบัญชาการตำรวจสืบสวนสอบสวนอาชญากรรมทางเทคโนโลยี', quota: 2400 },
  { code: 'สพฐ.ตร.', name: 'สำนักงานพิสูจน์หลักฐานตำรวจ', quota: 3900 },
  { code: 'สทส.', name: 'สำนักงานเทคโนโลยีสารสนเทศและการสื่อสาร', quota: 1800 },
  { code: 'บช.ศ.', name: 'กองบัญชาการศึกษา', quota: 3100 },
  { code: 'รร.นรต.', name: 'โรงเรียนนายร้อยตำรวจ', quota: 1500 },
  { code: 'รพ.ตร.', name: 'โรงพยาบาลตำรวจ', quota: 3800 },
  { code: 'สกพ.', name: 'สำนักงานกำลังพล', quota: 1200 },
  { code: 'สกบ.', name: 'สำนักงานส่งกำลังบำรุง', quota: 1400 },
  { code: 'สงป.', name: 'สำนักงานงบประมาณและการเงิน', quota: 1100 },
  { code: 'กมค.', name: 'สำนักงานกฎหมายและคดี', quota: 900 },
  { code: 'จต.', name: 'สำนักงานจเรตำรวจ', quota: 1600 },
  { code: 'สตส.', name: 'สำนักงานตรวจสอบภายใน', quota: 800 },
  { code: 'สยศ.ตร.', name: 'สำนักงานยุทธศาสตร์ตำรวจ', quota: 900 },
  { code: 'สลก.ตร.', name: 'สำนักงานเลขานุการตำรวจแห่งชาติ', quota: 600 },
  { code: 'ตร.', name: 'สำนักงานตำรวจแห่งชาติ (ส่วนกลาง)', quota: 3800 },
];

const FIRST_NAMES_MALE = [
  'สมชาย', 'วิชาญ', 'อัครเดช', 'ธีรภัทร', 'เกียรติศักดิ์', 'สุรชัย', 'ณัฐพงษ์', 'กฤษดา',
  'ชัยวัฒน์', 'วรวุฒิ', 'พีรพล', 'อนุสรณ์', 'ธนพล', 'ปัญญา', 'ศราวุธ', 'จักรพงษ์',
  'ปฏิภาณ', 'ทศพล', 'เอกราช', 'จิรภัทร', 'พงศกร', 'ธนากร', 'วริทธิ์', 'วีรชัย'
];

const FIRST_NAMES_FEMALE = [
  'ณัฐภรณ์', 'กนกวรรณ', 'ชลธิชา', 'พิมลภัส', 'วรรณวิภา', 'ศิริพร', 'ปิยวรรณ', 'สุดารัตน์',
  'เกศรา', 'กุลธิดา', 'ธันยพร', 'พรรณทิพา', 'สุนิสา', 'อภิญญา', 'อรทัย', 'พรทิพา'
];

const LAST_NAMES = [
  'ทองสุข', 'รัตนโกสินทร์', 'บุญยืน', 'แสงสว่าง', 'มั่นคง', 'สุขเกษม', 'ศรีสวัสดิ์', 'พงษ์พันธ์',
  'วงศ์สุวรรณ', 'จันทร์โอชา', 'สิริวัฒน์', 'เกียรติขจร', 'มีทรัพย์', 'ชัยมงคล', 'เจริญผล', 'รักษ์ดี',
  'บุญประเสริฐ', 'ศิริพงษ์', 'สุขใจ', 'วิเศษศิลป์', 'ธนบดี', 'มณีรัตน์', 'รุ่งเรือง', 'พิชิตภัย'
];

const RANKS_COMMISSIONED = [
  { level: 'พล.ต.อ.', rank: 'พล.ต.อ.', title: 'ผบ.ตร./รอง ผบ.ตร./จตช.', ratio: 0.0001 },
  { level: 'พล.ต.ท.', rank: 'พล.ต.ท.', title: 'ผบช./ผู้ช่วย ผบ.ตร.', ratio: 0.0005 },
  { level: 'พล.ต.ต.', rank: 'พล.ต.ต.', title: 'ผบก./รอง ผบช.', ratio: 0.002 },
  { level: 'พ.ต.อ.', rank: 'พ.ต.อ.', title: 'ผกก./รอง ผบก.', ratio: 0.012 },
  { level: 'พ.ต.ท.', rank: 'พ.ต.ท.', title: 'รอง ผกก./สว.', ratio: 0.035 },
  { level: 'พ.ต.ต.', rank: 'พ.ต.ต.', title: 'สว.', ratio: 0.045 },
  { level: 'ร.ต.อ.', rank: 'ร.ต.อ.', title: 'รอง สว.', ratio: 0.08 },
  { level: 'ร.ต.ท.', rank: 'ร.ต.ท.', title: 'รอง สว.', ratio: 0.04 },
  { level: 'ร.ต.ต.', rank: 'ร.ต.ต.', title: 'รอง สว.', ratio: 0.03 },
];

const RANKS_NON_COMMISSIONED = [
  { level: 'รอง สว.*', rank: 'ด.ต.', title: 'รอง สว.(ท.) / ด.ต. 53 ปี', ratio: 0.12 },
  { level: 'ผบ.หมู่', rank: 'ด.ต.', title: 'ผบ.หมู่ (ด.ต.)', ratio: 0.28 },
  { level: 'ผบ.หมู่', rank: 'จ.ส.ต.', title: 'ผบ.หมู่ (จ.ส.ต.)', ratio: 0.18 },
  { level: 'ผบ.หมู่', rank: 'ส.ต.อ.', title: 'ผบ.หมู่ (ส.ต.อ.)', ratio: 0.10 },
  { level: 'ผบ.หมู่', rank: 'ส.ต.ท.', title: 'ผบ.หมู่ (ส.ต.ท.)', ratio: 0.04 },
  { level: 'ผบ.หมู่', rank: 'ส.ต.ต.', title: 'ผบ.หมู่ (ส.ต.ต.)', ratio: 0.015 },
];

/**
 * Generate synthetic realistic nationwide personnel roster for ทำเนียบสามแสน
 */
export function generateSamSaenDataset(totalCount: number = 2500): PoliceOfficer[] {
  const result: PoliceOfficer[] = [];

  for (let i = 0; i < totalCount; i++) {
    const bureauObj = SAM_SAEN_BUREAU_WEIGHTS[i % SAM_SAEN_BUREAU_WEIGHTS.length];
    const isFemale = i % 7 === 0;
    const gender: GenderType = isFemale ? 'หญิง' : 'ชาย';
    const firstList = isFemale ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE;
    const firstName = firstList[i % firstList.length];
    const lastName = LAST_NAMES[(i * 3 + 7) % LAST_NAMES.length];

    // 25% commissioned, 73% non-commissioned, 2% students
    const randType = Math.random();
    let commType: CommissionType = 'ประทวน';
    let rankInfo = RANKS_NON_COMMISSIONED[i % RANKS_NON_COMMISSIONED.length];

    if (randType < 0.26) {
      commType = 'สัญญาบัตร';
      rankInfo = RANKS_COMMISSIONED[i % RANKS_COMMISSIONED.length];
    } else if (randType > 0.98 && (bureauObj.code === 'บช.ศ.' || bureauObj.code === 'รร.นรต.')) {
      commType = 'นักเรียน';
      rankInfo = { level: 'นรต./นสต.', rank: 'นรต.', title: 'นักเรียนตำรวจ', ratio: 0.02 };
    }

    const isVacant = Math.random() < 0.18; // ~18% vacancies
    const posNum = `0${(i % 9) + 1}00 ${(10000 + (i % 90000)).toString()} ${(1000 + (i % 9000)).toString()}`;

    const jobGroupsList = ['บริหารงานและสืบสวนสอบสวน', 'ป้องกันปราบปรามและอำนวยการ', 'สอบสวน', 'เทคโนโลยีสารสนเทศ', 'สนับสนุนและบริการ'];
    const jobLinesList = ['สืบสวนและปราบปรามอาชญากรรม', 'บริหารงานอำนวยการและสนับสนุน', 'งานสอบสวนคดีอาญา', 'ป้องกันปราบปรามยาเสพติด', 'งานสืบสวนสอบสวนอาชญากรรมทางเทคโนโลยี'];
    const dutiesList = ['ปฏิบัติหน้าที่เวรตรวจและรักษาความสงบเรียบร้อย', 'งานธุรการและกำลังพล', 'งานบริการประชาชน', 'งานสืบสวนคดีสำคัญ', 'งานตรวจคนเข้าเมือง'];

    result.push({
      id: `ss-${i + 1}`,
      positionNumber: posNum,
      bureau: bureauObj.code,
      division: `กองบังคับการในสังกัด ${bureauObj.code}`,
      subDivision: `กก./สภ. ประจำ ${bureauObj.code}`,
      jobGroup: jobGroupsList[i % jobGroupsList.length],
      jobLine: jobLinesList[i % jobLinesList.length],
      duty: dutiesList[i % dutiesList.length],
      concurrentPosition: i % 11 === 0 ? 'ควบ ผกก.' : i % 17 === 0 ? 'ควบ สว.' : '-',
      fluidPromotion: i % 5 === 0 ? 'เลื่อนไหล' : i % 9 === 0 ? 'ไม่เลื่อนไหล' : 'ทั่วไป',
      positionLevel: rankInfo.level,
      positionTitle: rankInfo.title,
      fluidLevel: i % 5 === 0 ? 'สว. - รอง ผกก.' : i % 8 === 0 ? 'ผบ.หมู่ - รอง สว.' : '-',
      commissionType: commType,
      rank: isVacant ? '-' : rankInfo.rank,
      firstName: isVacant ? '' : firstName,
      lastName: isVacant ? '' : lastName,
      gender: isVacant ? '-' : gender,
      isVacant,
      phone: isVacant ? '' : `08${(10000000 + i * 137) % 90000000}`,
      updatedAt: new Date().toISOString(),
    });
  }

  return result;
}

/**
 * Calculate full analytics for ทำเนียบสามแสน
 */
export function calculateSamSaenStats(officers: PoliceOfficer[]): SamSaenStats {
  let totalPositions = officers.length;
  let totalOccupied = 0;
  let totalVacant = 0;
  let commissioned = 0;
  let nonCommissioned = 0;
  let student = 0;
  let male = 0;
  let female = 0;

  const bureauMap = new Map<string, { total: number; occupied: number; vacant: number }>();

  // Initialize bureaus
  SAM_SAEN_BUREAU_WEIGHTS.forEach((b) => {
    bureauMap.set(b.code, { total: 0, occupied: 0, vacant: 0 });
  });

  officers.forEach((o) => {
    if (o.isVacant) {
      totalVacant++;
    } else {
      totalOccupied++;
      if (o.gender === 'ชาย') male++;
      else if (o.gender === 'หญิง') female++;
    }

    if (o.commissionType === 'สัญญาบัตร') commissioned++;
    else if (o.commissionType === 'ประทวน') nonCommissioned++;
    else if (o.commissionType === 'นักเรียน') student++;

    const bCode = o.bureau || 'ตร.';
    const current = bureauMap.get(bCode) || { total: 0, occupied: 0, vacant: 0 };
    current.total++;
    if (o.isVacant) current.vacant++;
    else current.occupied++;
    bureauMap.set(bCode, current);
  });

  const fillPercentage = totalPositions > 0 ? Math.round((totalOccupied / totalPositions) * 1000) / 10 : 0;

  const bureauBreakdown = SAM_SAEN_BUREAU_WEIGHTS.map((b) => {
    const data = bureauMap.get(b.code) || { total: 0, occupied: 0, vacant: 0 };
    return {
      bureauCode: b.code,
      bureauName: b.name,
      total: data.total,
      occupied: data.occupied,
      vacant: data.vacant,
    };
  });

  return {
    totalPositions,
    totalOccupied,
    totalVacant,
    fillPercentage,
    commissioned,
    nonCommissioned,
    student,
    male,
    female,
    bureauBreakdown,
  };
}

/**
 * High-performance chunked CSV stream parser for large datasets
 */
export async function parseLargeCsvChunked(
  file: File,
  onProgress: (p: ChunkUploadProgress) => void,
  onComplete: (officers: PoliceOfficer[]) => void
): Promise<void> {
  const CHUNK_SIZE = 1024 * 512; // 512 KB chunks
  const fileSize = file.size;
  let offset = 0;
  let chunkIndex = 0;
  const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

  let leftover = '';
  const parsedOfficers: PoliceOfficer[] = [];
  let isFirstLine = true;
  let headers: string[] = [];

  const reader = new FileReader();

  function readNextChunk() {
    if (offset >= fileSize) {
      // Process remaining leftover line if any
      if (leftover.trim()) {
        const officer = parseCsvLine(leftover, headers, parsedOfficers.length + 1);
        if (officer) parsedOfficers.push(officer);
      }
      onProgress({
        isProcessing: false,
        currentChunk: totalChunks,
        totalChunks,
        processedRows: parsedOfficers.length,
        totalEstimatedRows: parsedOfficers.length,
        percentage: 100,
        statusMessage: `ประมวลผลสำเร็จครบถ้วน ${parsedOfficers.length.toLocaleString()} อัตรา`,
      });
      onComplete(parsedOfficers);
      return;
    }

    const slice = file.slice(offset, offset + CHUNK_SIZE);
    reader.readAsText(slice, 'utf-8');
  }

  reader.onload = (e) => {
    const text = (e.target?.result as string) || '';
    const fullText = leftover + text;
    const lines = fullText.split(/\r?\n/);

    // Save the last partial line for the next chunk
    leftover = lines.pop() || '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (isFirstLine) {
        headers = line.split(',').map((h) => h.replace(/^"|"$/g, '').trim());
        isFirstLine = false;
        continue;
      }

      const officer = parseCsvLine(line, headers, parsedOfficers.length + 1);
      if (officer) {
        parsedOfficers.push(officer);
      }
    }

    offset += CHUNK_SIZE;
    chunkIndex++;

    const percent = Math.min(99, Math.round((offset / fileSize) * 100));
    onProgress({
      isProcessing: true,
      currentChunk: chunkIndex,
      totalChunks,
      processedRows: parsedOfficers.length,
      totalEstimatedRows: Math.round((parsedOfficers.length / Math.max(1, percent)) * 100),
      percentage: percent,
      statusMessage: `กำลังอ่านข้อมูล Chunk ${chunkIndex}/${totalChunks} (อ่านแล้ว ${parsedOfficers.length.toLocaleString()} แถว)...`,
    });

    // Schedule next chunk with setTimeout to prevent UI freezing
    setTimeout(readNextChunk, 0);
  };

  reader.onerror = () => {
    onProgress({
      isProcessing: false,
      currentChunk: chunkIndex,
      totalChunks,
      processedRows: parsedOfficers.length,
      totalEstimatedRows: 0,
      percentage: 0,
      statusMessage: 'เกิดข้อผิดพลาดในการอ่านไฟล์',
    });
  };

  readNextChunk();
}

/**
 * Line parser for individual CSV records
 */
function parseCsvLine(line: string, headers: string[], idNum: number): PoliceOfficer | null {
  const cells = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
  if (cells.length < 3) return null;

  // Header index matching
  let posNo = '';
  let bureau = 'ตร.';
  let division = '';
  let subDivision = '';
  let jobGroup = 'อำนวยการและสนับสนุน';
  let jobLine = 'บริหารงานตำรวจ';
  let duty = 'ปฏิบัติหน้าที่ตามที่ได้รับมอบหมาย';
  let concurrentPosition = '-';
  let fluidPromotion = 'ทั่วไป';
  let posLevel = '';
  let posTitle = '';
  let fluidLevel = '-';
  let rank = '';
  let firstName = '';
  let lastName = '';
  let isVacant = false;
  let gender: GenderType = 'ชาย';
  let commType: CommissionType = 'ประทวน';

  headers.forEach((h, col) => {
    const val = cells[col] || '';
    if (h.includes('เลขตำแหน่ง') || col === 0) posNo = val;
    else if (h.includes('บช') || h.includes('กองบัญชาการ')) bureau = val;
    else if (h.includes('บก') || h.includes('กองบังคับการ')) division = val;
    else if (h.includes('กก') || h.includes('สภ') || h.includes('สถานี')) subDivision = val;
    else if (h.includes('กลุ่มสายงาน')) jobGroup = val;
    else if (h.includes('สายงาน')) jobLine = val;
    else if (h.includes('ทำหน้าที่')) duty = val;
    else if (h.includes('ตำแหน่งควบ')) concurrentPosition = val;
    else if (h.includes('เลื่อนไหล') && !h.includes('ระดับ')) fluidPromotion = val;
    else if (h.includes('ระดับตำแหน่งเลื่อนไหล')) fluidLevel = val;
    else if (h.includes('ระดับตำแหน่ง')) posLevel = val;
    else if (h.includes('ตำแหน่ง') && !h.includes('เลข') && !h.includes('ระดับ')) posTitle = val;
    else if (h.includes('สัญญาบัตร') || h.includes('ประทวน')) {
      if (val.includes('สัญญาบัตร')) commType = 'สัญญาบัตร';
      else if (val.includes('นักเรียน')) commType = 'นักเรียน';
      else commType = 'ประทวน';
    }
    else if (h.includes('ยศ')) rank = val;
    else if (h.includes('ชื่อ') && !h.includes('หน่วย')) firstName = val;
    else if (h.includes('สกุล')) lastName = val;
    else if (h.includes('สถานะ') || h.includes('ว่าง')) isVacant = val.includes('ว่าง');
    else if (h.includes('เพศ')) gender = val.includes('หญิง') ? 'หญิง' : 'ชาย';
  });

  // Fallback defaults if parsed without named headers
  if (!posNo && cells[0]) posNo = cells[0];
  if (!bureau && cells[1]) bureau = cells[1];
  if (!firstName && cells[3]) firstName = cells[3];
  if (!lastName && cells[4]) lastName = cells[4];

  if (!posLevel) posLevel = rank || 'ผบ.หมู่';
  if (!posTitle) posTitle = posLevel;

  const levelStr = `${posLevel} ${rank} ${posTitle}`;
  if (
    levelStr.includes('ผบ.ตร') ||
    levelStr.includes('ผบช') ||
    levelStr.includes('ผบก') ||
    levelStr.includes('ผกก') ||
    levelStr.includes('สว')
  ) {
    commType = 'สัญญาบัตร';
  }

  if (firstName.includes('ว่าง') || !firstName) {
    isVacant = true;
  }

  return {
    id: `csv-${idNum}`,
    positionNumber: posNo || `0000 00000 ${idNum.toString().padStart(4, '0')}`,
    bureau: bureau || 'ตร.',
    division: division || `บก.ในสังกัด ${bureau}`,
    subDivision: subDivision || `กก.ในสังกัด ${division}`,
    jobGroup: jobGroup || 'อำนวยการและสนับสนุน',
    jobLine: jobLine || 'บริหารงานตำรวจ',
    duty: duty || 'ปฏิบัติหน้าที่ตามที่ได้รับมอบหมาย',
    concurrentPosition: concurrentPosition || '-',
    fluidPromotion: fluidPromotion || 'ทั่วไป',
    positionLevel: posLevel,
    positionTitle: posTitle,
    fluidLevel: fluidLevel || '-',
    commissionType: commType,
    rank: isVacant ? '-' : rank || 'ด.ต.',
    firstName: isVacant ? '' : firstName,
    lastName: isVacant ? '' : lastName,
    gender,
    isVacant,
    updatedAt: new Date().toISOString(),
  };
}
