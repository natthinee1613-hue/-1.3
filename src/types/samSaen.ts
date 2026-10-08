/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PoliceOfficer } from './personnel';

export interface SamSaenStats {
  totalPositions: number;     // กรอบอัตราตำแหน่งทั้งหมด (เป้าหมาย ~300,000)
  totalOccupied: number;      // ผู้ครองตำแหน่ง
  totalVacant: number;        // ตำแหน่งว่าง
  fillPercentage: number;     // % การครอง
  commissioned: number;       // สัญญาบัตร
  nonCommissioned: number;    // ประทวน
  student: number;            // นักเรียน
  male: number;               // ชาย
  female: number;             // หญิง
  bureauBreakdown: Array<{
    bureauCode: string;
    bureauName: string;
    total: number;
    occupied: number;
    vacant: number;
  }>;
}

export interface ChunkUploadProgress {
  isProcessing: boolean;
  currentChunk: number;
  totalChunks: number;
  processedRows: number;
  totalEstimatedRows: number;
  percentage: number;
  statusMessage: string;
}
