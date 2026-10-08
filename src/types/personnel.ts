export type CommissionType = 'สัญญาบัตร' | 'ประทวน' | 'นักเรียน';

export type GenderType = 'ชาย' | 'หญิง' | '-';

export interface PoliceOfficer {
  id: string;
  positionNumber: string; // เลขตำแหน่ง เช่น 0400 04301 0001
  bureau: string;         // บช. เช่น สกพ.
  division: string;       // บก. เช่น สกพ., กองอัตรากำลัง สกพ., กองทะเบียนพล สกพ., กองสวัสดิการ สกพ.
  subDivision: string;    // กก. / ฝ่าย เช่น กอ.รมน.สกพ., ฝ่ายอำนวยการ, ฝ่ายแต่งตั้ง
  jobGroup: string;       // กลุ่มสายงาน เช่น อำนวยการและสนับสนุน, สำรองราชการ
  jobLine: string;        // สายงาน เช่น บริหารงานอำนวยการและสนับสนุน, ทรัพยากรบุคคล, ธุรการ, ดุริยางคศิลป์
  duty: string;           // ทำหน้าที่ เช่น บริหารงานอำนวยการและสนับสนุน, ปฏิบัติงาน กอ.รมน., ธุรการ
  concurrentPosition?: string; // ตำแหน่งควบ เช่น ควบ ผกก., ควบ สว., -
  fluidPromotion?: string;     // เลื่อนไหล เช่น เลื่อนไหล, ไม่เลื่อนไหล, ทั่วไป
  positionLevel: string;  // ระดับตำแหน่ง เช่น ผบช., รอง ผบช., ผบก., รอง ผบก., ผกก., รอง ผกก., สว., รอง สว., ผบ.หมู่
  positionTitle: string;  // ตำแหน่ง เช่น ผบช., รอง ผบช., ผกก., สว., นว.(สบ 2), รอง สว., ผบ.หมู่
  fluidLevel?: string;    // ระดับตำแหน่งเลื่อนไหล เช่น สว. - รอง ผกก., ผบ.หมู่ - รอง สว.
  commissionType: CommissionType; // สัญญาบัตร / ประทวน / นักเรียน
  rank: string;           // ยศ เช่น พล.ต.ท., พล.ต.ต., พ.ต.อ., พ.ต.ท., พ.ต.ต., ร.ต.อ., ร.ต.ท., ร.ต.ต., ด.ต., จ.ส.ต., ส.ต.อ., ส.ต.ท., ส.ต.ต.
  firstName: string;      // ชื่อ
  lastName: string;       // สกุล
  gender: GenderType;     // เพศ
  isVacant: boolean;      // ตำแหน่งว่าง
  phone?: string;
  email?: string;
  notes?: string;
  updatedAt?: string;
}

export interface DivisionStat {
  division: string;
  total: number;
  occupied: number;
  vacant: number;
  commissioned: number;
  nonCommissioned: number;
  male: number;
  female: number;
}

export interface CategoryBreakdownStat {
  key: string;            // รหัส / ค่า (เช่น 'อำนวยการและสนับสนุน', 'ควบ ผกก.')
  label: string;          // ป้ายชื่อแสดงผล
  total: number;          // กรอบอัตราทั้งหมด
  occupied: number;       // มีผู้ครองตำแหน่ง
  vacant: number;         // ตำแหน่งว่าง
  fillPercentage: number; // % การครองตำแหน่ง
  commissioned: number;   // สัญญาบัตร
  nonCommissioned: number;// ประทวน
  student: number;        // นักเรียน
  male: number;           // ชาย
  female: number;         // หญิง
  subCount?: number;      // จำนวนหน่วยงานย่อยที่เกี่ยวข้อง
}
