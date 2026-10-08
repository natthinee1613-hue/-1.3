/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import {
  AgencySummaryRow,
  RTP_AGENCY_LIST,
  computeRowTotals,
  createEmptyAgencyRow,
} from '../types/rtpSummary';
import { PoliceOfficer } from '../types/personnel';

/**
 * Export table to exact CSV format matching user's specification
 */
export function exportRtpSummaryToCSV(rows: AgencySummaryRow[]): string {
  const line1 = ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,';
  const line2 =
    'หน่วยงาน,ผบ.ตร.,,รอง ผบ.ตร.,,ผู้ช่วย ผบ.ตร.,,ผบช.,,รอง ผบช.,,ผบก.,,รอง ผบก.,,ผกก.,,รอง ผกก.,,สว.,,รอง สว.,,รวมชั้นสัญญาบัตร,,รอง สว.*,,ผบ.หมู่,,รวมชั้นประทวน,,นักเรียน,,รวมทั้งหมด,';
  const line3 =
    ',ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ,ระดับตำแหน่ง,คนครอง ';

  const agencyLines = rows.map((r) => {
    const cells = [
      r.agency,
      r.pbt.pos || '',
      r.pbt.occ || '',
      r.rpbt.pos || '',
      r.rpbt.occ || '',
      r.apbt.pos || '',
      r.apbt.occ || '',
      r.pbch.pos || '',
      r.pbch.occ || '',
      r.rpbch.pos || '',
      r.rpbch.occ || '',
      r.pbg.pos || '',
      r.pbg.occ || '',
      r.rpbg.pos || '',
      r.rpbg.occ || '',
      r.pgk.pos || '',
      r.pgk.occ || '',
      r.rpgk.pos || '',
      r.rpgk.occ || '',
      r.sw.pos || '',
      r.sw.occ || '',
      r.rsw.pos || '',
      r.rsw.occ || '',
      r.totalCommissioned.pos || '',
      r.totalCommissioned.occ || '',
      r.rswStar.pos || '',
      r.rswStar.occ || '',
      r.pbm.pos || '',
      r.pbm.occ || '',
      r.totalNonCommissioned.pos || '',
      r.totalNonCommissioned.occ || '',
      r.student.pos || '',
      r.student.occ || '',
      r.grandTotal.pos || '',
      r.grandTotal.occ || '',
    ];
    return cells.join(',');
  });

  // Calculate totals
  const totals = calculateSummaryTotals(rows);
  const totalLine = [
    'รวม',
    totals.pbt.pos || '',
    totals.pbt.occ || '',
    totals.rpbt.pos || '',
    totals.rpbt.occ || '',
    totals.apbt.pos || '',
    totals.apbt.occ || '',
    totals.pbch.pos || '',
    totals.pbch.occ || '',
    totals.rpbch.pos || '',
    totals.rpbch.occ || '',
    totals.pbg.pos || '',
    totals.pbg.occ || '',
    totals.rpbg.pos || '',
    totals.rpbg.occ || '',
    totals.pgk.pos || '',
    totals.pgk.occ || '',
    totals.rpgk.pos || '',
    totals.rpgk.occ || '',
    totals.sw.pos || '',
    totals.sw.occ || '',
    totals.rsw.pos || '',
    totals.rsw.occ || '',
    totals.totalCommissioned.pos || '',
    totals.totalCommissioned.occ || '',
    totals.rswStar.pos || '',
    totals.rswStar.occ || '',
    totals.pbm.pos || '',
    totals.pbm.occ || '',
    totals.totalNonCommissioned.pos || '',
    totals.totalNonCommissioned.occ || '',
    totals.student.pos || '',
    totals.student.occ || '',
    totals.grandTotal.pos || '',
    totals.grandTotal.occ || '',
  ].join(',');

  return [line1, line2, line3, ...agencyLines, totalLine].join('\n');
}

/**
 * Calculate totals for all columns
 */
export function calculateSummaryTotals(rows: AgencySummaryRow[]) {
  const t = {
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

  rows.forEach((r) => {
    t.pbt.pos += r.pbt.pos || 0;
    t.pbt.occ += r.pbt.occ || 0;
    t.rpbt.pos += r.rpbt.pos || 0;
    t.rpbt.occ += r.rpbt.occ || 0;
    t.apbt.pos += r.apbt.pos || 0;
    t.apbt.occ += r.apbt.occ || 0;
    t.pbch.pos += r.pbch.pos || 0;
    t.pbch.occ += r.pbch.occ || 0;
    t.rpbch.pos += r.rpbch.pos || 0;
    t.rpbch.occ += r.rpbch.occ || 0;
    t.pbg.pos += r.pbg.pos || 0;
    t.pbg.occ += r.pbg.occ || 0;
    t.rpbg.pos += r.rpbg.pos || 0;
    t.rpbg.occ += r.rpbg.occ || 0;
    t.pgk.pos += r.pgk.pos || 0;
    t.pgk.occ += r.pgk.occ || 0;
    t.rpgk.pos += r.rpgk.pos || 0;
    t.rpgk.occ += r.rpgk.occ || 0;
    t.sw.pos += r.sw.pos || 0;
    t.sw.occ += r.sw.occ || 0;
    t.rsw.pos += r.rsw.pos || 0;
    t.rsw.occ += r.rsw.occ || 0;
    t.totalCommissioned.pos += r.totalCommissioned.pos || 0;
    t.totalCommissioned.occ += r.totalCommissioned.occ || 0;
    t.rswStar.pos += r.rswStar.pos || 0;
    t.rswStar.occ += r.rswStar.occ || 0;
    t.pbm.pos += r.pbm.pos || 0;
    t.pbm.occ += r.pbm.occ || 0;
    t.totalNonCommissioned.pos += r.totalNonCommissioned.pos || 0;
    t.totalNonCommissioned.occ += r.totalNonCommissioned.occ || 0;
    t.student.pos += r.student.pos || 0;
    t.student.occ += r.student.occ || 0;
    t.grandTotal.pos += r.grandTotal.pos || 0;
    t.grandTotal.occ += r.grandTotal.occ || 0;
  });

  t.vacant = Math.max(0, t.grandTotal.pos - t.grandTotal.occ);
  t.fillPercent = t.grandTotal.pos > 0 ? Math.round((t.grandTotal.occ / t.grandTotal.pos) * 1000) / 10 : 0;

  return t;
}

/**
 * Export to Excel workbook with formatted sheet
 */
export function exportRtpSummaryToExcel(rows: AgencySummaryRow[]) {
  const wb = XLSX.utils.book_new();

  // Multi-tier headers
  const headerRow1 = [
    'หน่วยงาน',
    'ผบ.ตร.', '',
    'รอง ผบ.ตร.', '',
    'ผู้ช่วย ผบ.ตร.', '',
    'ผบช.', '',
    'รอง ผบช.', '',
    'ผบก.', '',
    'รอง ผบก.', '',
    'ผกก.', '',
    'รอง ผกก.', '',
    'สว.', '',
    'รอง สว.', '',
    'รวมชั้นสัญญาบัตร', '',
    'รอง สว.*', '',
    'ผบ.หมู่', '',
    'รวมชั้นประทวน', '',
    'นักเรียน', '',
    'รวมทั้งหมด', '',
    'อัตราว่าง',
    '% ครอง',
  ];

  const headerRow2 = [
    '',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    'ระดับตำแหน่ง', 'คนครอง',
    '',
    '',
  ];

  const dataRows = rows.map((r) => [
    r.agency,
    r.pbt.pos, r.pbt.occ,
    r.rpbt.pos, r.rpbt.occ,
    r.apbt.pos, r.apbt.occ,
    r.pbch.pos, r.pbch.occ,
    r.rpbch.pos, r.rpbch.occ,
    r.pbg.pos, r.pbg.occ,
    r.rpbg.pos, r.rpbg.occ,
    r.pgk.pos, r.pgk.occ,
    r.rpgk.pos, r.rpgk.occ,
    r.sw.pos, r.sw.occ,
    r.rsw.pos, r.rsw.occ,
    r.totalCommissioned.pos, r.totalCommissioned.occ,
    r.rswStar.pos, r.rswStar.occ,
    r.pbm.pos, r.pbm.occ,
    r.totalNonCommissioned.pos, r.totalNonCommissioned.occ,
    r.student.pos, r.student.occ,
    r.grandTotal.pos, r.grandTotal.occ,
    r.vacant,
    `${r.fillPercent}%`,
  ]);

  const totals = calculateSummaryTotals(rows);
  const totalRow = [
    'รวมทั้งหมด',
    totals.pbt.pos, totals.pbt.occ,
    totals.rpbt.pos, totals.rpbt.occ,
    totals.apbt.pos, totals.apbt.occ,
    totals.pbch.pos, totals.pbch.occ,
    totals.rpbch.pos, totals.rpbch.occ,
    totals.pbg.pos, totals.pbg.occ,
    totals.rpbg.pos, totals.rpbg.occ,
    totals.pgk.pos, totals.pgk.occ,
    totals.rpgk.pos, totals.rpgk.occ,
    totals.sw.pos, totals.sw.occ,
    totals.rsw.pos, totals.rsw.occ,
    totals.totalCommissioned.pos, totals.totalCommissioned.occ,
    totals.rswStar.pos, totals.rswStar.occ,
    totals.pbm.pos, totals.pbm.occ,
    totals.totalNonCommissioned.pos, totals.totalNonCommissioned.occ,
    totals.student.pos, totals.student.occ,
    totals.grandTotal.pos, totals.grandTotal.occ,
    totals.vacant,
    `${totals.fillPercent}%`,
  ];

  const fullSheetData = [headerRow1, headerRow2, ...dataRows, totalRow];
  const ws = XLSX.utils.aoa_to_sheet(fullSheetData);

  // Merge header cells (e.g. ผบ.ตร. covers 2 columns)
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // หน่วยงาน
    { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } }, // ผบ.ตร.
    { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } }, // รอง ผบ.ตร.
    { s: { r: 0, c: 5 }, e: { r: 0, c: 6 } }, // ผู้ช่วย ผบ.ตร.
    { s: { r: 0, c: 7 }, e: { r: 0, c: 8 } }, // ผบช.
    { s: { r: 0, c: 9 }, e: { r: 0, c: 10 } }, // รอง ผบช.
    { s: { r: 0, c: 11 }, e: { r: 0, c: 12 } }, // ผบก.
    { s: { r: 0, c: 13 }, e: { r: 0, c: 14 } }, // รอง ผบก.
    { s: { r: 0, c: 15 }, e: { r: 0, c: 16 } }, // ผกก.
    { s: { r: 0, c: 17 }, e: { r: 0, c: 18 } }, // รอง ผกก.
    { s: { r: 0, c: 19 }, e: { r: 0, c: 20 } }, // สว.
    { s: { r: 0, c: 21 }, e: { r: 0, c: 22 } }, // รอง สว.
    { s: { r: 0, c: 23 }, e: { r: 0, c: 24 } }, // รวมชั้นสัญญาบัตร
    { s: { r: 0, c: 25 }, e: { r: 0, c: 26 } }, // รอง สว.*
    { s: { r: 0, c: 27 }, e: { r: 0, c: 28 } }, // ผบ.หมู่
    { s: { r: 0, c: 29 }, e: { r: 0, c: 30 } }, // รวมชั้นประทวน
    { s: { r: 0, c: 31 }, e: { r: 0, c: 32 } }, // นักเรียน
    { s: { r: 0, c: 33 }, e: { r: 0, c: 34 } }, // รวมทั้งหมด
    { s: { r: 0, c: 35 }, e: { r: 1, c: 35 } }, // อัตราว่าง
    { s: { r: 0, c: 36 }, e: { r: 1, c: 36 } }, // % ครอง
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'ตารางอัตรากำลัง ตร.');
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `ตารางอัตรากำลัง_ตร_ภาพรวม_${dateStr}.xlsx`);
}

/**
 * Parse CSV text into AgencySummaryRow[]
 */
export function parseRtpSummaryCSV(csvText: string): AgencySummaryRow[] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 3) return [];

  // Match rows by agency name in column 0
  const agencyMap = new Map<string, number[]>();

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
    if (parts.length < 2) continue;
    const agencyName = parts[0];
    if (agencyName === 'หน่วยงาน' || agencyName === 'รวม' || agencyName === '') continue;

    const nums = parts.slice(1).map((val) => {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    });

    agencyMap.set(agencyName, nums);
  }

  return RTP_AGENCY_LIST.map((agency, index) => {
    const raw = createEmptyAgencyRow(agency.code, agency.fullName, index);
    const nums = agencyMap.get(agency.code) || agencyMap.get(agency.code.replace('.', '')) || [];

    if (nums.length >= 22) {
      raw.pbt = { pos: nums[0] || 0, occ: nums[1] || 0 };
      raw.rpbt = { pos: nums[2] || 0, occ: nums[3] || 0 };
      raw.apbt = { pos: nums[4] || 0, occ: nums[5] || 0 };
      raw.pbch = { pos: nums[6] || 0, occ: nums[7] || 0 };
      raw.rpbch = { pos: nums[8] || 0, occ: nums[9] || 0 };
      raw.pbg = { pos: nums[10] || 0, occ: nums[11] || 0 };
      raw.rpbg = { pos: nums[12] || 0, occ: nums[13] || 0 };
      raw.pgk = { pos: nums[14] || 0, occ: nums[15] || 0 };
      raw.rpgk = { pos: nums[16] || 0, occ: nums[17] || 0 };
      raw.sw = { pos: nums[18] || 0, occ: nums[19] || 0 };
      raw.rsw = { pos: nums[20] || 0, occ: nums[21] || 0 };
      raw.rswStar = { pos: nums[24] || 0, occ: nums[25] || 0 };
      raw.pbm = { pos: nums[26] || 0, occ: nums[27] || 0 };
      raw.student = { pos: nums[30] || 0, occ: nums[31] || 0 };
    }

    return computeRowTotals(raw);
  });
}

/**
 * Smart automatic aggregation from loaded officers roster into this grid
 */
export function syncFromPersonnelRoster(officers: PoliceOfficer[]): AgencySummaryRow[] {
  // Initialize empty rows
  const rows = RTP_AGENCY_LIST.map((agency, index) =>
    createEmptyAgencyRow(agency.code, agency.fullName, index)
  );

  if (!officers || officers.length === 0) {
    return rows;
  }

  // Helper to find agency row index
  const findRowIndex = (bureau: string, division: string) => {
    const cleanB = (bureau || '').trim().replace(/\s+/g, '');
    const cleanD = (division || '').trim().replace(/\s+/g, '');

    for (let i = 0; i < RTP_AGENCY_LIST.length; i++) {
      const code = RTP_AGENCY_LIST[i].code.replace(/\s+/g, '');
      const full = RTP_AGENCY_LIST[i].fullName.replace(/\s+/g, '');
      if (
        cleanB === code ||
        cleanB === full ||
        cleanB.includes(code) ||
        cleanD === code ||
        cleanD.includes(code)
      ) {
        return i;
      }
    }
    // Default fallback to agency 0 ('ตร.')
    return 0;
  };

  officers.forEach((o) => {
    const idx = findRowIndex(o.bureau, o.division);
    const target = rows[idx];
    const isOcc = !o.isVacant;

    const pos = (o.positionLevel || o.positionTitle || o.rank || '').trim();

    if (pos.includes('ผบ.ตร') && !pos.includes('รอง') && !pos.includes('ช่วย')) {
      target.pbt.pos += 1;
      if (isOcc) target.pbt.occ += 1;
    } else if (pos.includes('รอง ผบ.ตร')) {
      target.rpbt.pos += 1;
      if (isOcc) target.rpbt.occ += 1;
    } else if (pos.includes('ผู้ช่วย ผบ.ตร')) {
      target.apbt.pos += 1;
      if (isOcc) target.apbt.occ += 1;
    } else if (pos.includes('ผบช') && !pos.includes('รอง')) {
      target.pbch.pos += 1;
      if (isOcc) target.pbch.occ += 1;
    } else if (pos.includes('รอง ผบช')) {
      target.rpbch.pos += 1;
      if (isOcc) target.rpbch.occ += 1;
    } else if (pos.includes('ผบก') && !pos.includes('รอง')) {
      target.pbg.pos += 1;
      if (isOcc) target.pbg.occ += 1;
    } else if (pos.includes('รอง ผบก')) {
      target.rpbg.pos += 1;
      if (isOcc) target.rpbg.occ += 1;
    } else if (pos.includes('ผกก') && !pos.includes('รอง')) {
      target.pgk.pos += 1;
      if (isOcc) target.pgk.occ += 1;
    } else if (pos.includes('รอง ผกก')) {
      target.rpgk.pos += 1;
      if (isOcc) target.rpgk.occ += 1;
    } else if (pos.includes('สว') && !pos.includes('รอง')) {
      target.sw.pos += 1;
      if (isOcc) target.sw.occ += 1;
    } else if (pos.includes('53') || pos.includes('ด.ต.53') || pos.includes('รอง สว.*') || pos.includes('ท.')) {
      target.rswStar.pos += 1;
      if (isOcc) target.rswStar.occ += 1;
    } else if (pos.includes('รอง สว')) {
      target.rsw.pos += 1;
      if (isOcc) target.rsw.occ += 1;
    } else if (pos.includes('ผบ.หมู่')) {
      target.pbm.pos += 1;
      if (isOcc) target.pbm.occ += 1;
    } else if (o.commissionType === 'นักเรียน' || pos.includes('นรต') || pos.includes('นักเรียน')) {
      target.student.pos += 1;
      if (isOcc) target.student.occ += 1;
    } else if (o.commissionType === 'สัญญาบัตร') {
      target.rsw.pos += 1;
      if (isOcc) target.rsw.occ += 1;
    } else {
      target.pbm.pos += 1;
      if (isOcc) target.pbm.occ += 1;
    }
  });

  return rows.map((r) => computeRowTotals(r));
}
