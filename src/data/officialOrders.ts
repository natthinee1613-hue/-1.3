/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PoliceOfficialOrder {
  id: string;
  orderNumber: string;
  title: string;
  category: 'appointment' | 'announcement' | 'regulation' | 'transfer' | 'award';
  categoryLabel: string;
  issuer: string;
  signedDate: string;
  effectiveDate?: string;
  description: string;
  fileSize: string;
  pagesCount: number;
  tags: string[];
  pdfUrl?: string;
  downloadCount: number;
  urgency?: 'normal' | 'urgent' | 'critical';
}

export const INITIAL_OFFICIAL_ORDERS: PoliceOfficialOrder[] = [
  {
    id: 'ord-124-2569',
    orderNumber: 'คำสั่ง ตร. ที่ 124/2569',
    title: 'เรื่อง แต่งตั้งข้าราชการตำรวจชั้นสัญญาบัตร ประจำปีวาระ พ.ศ. 2569',
    category: 'appointment',
    categoryLabel: 'คำสั่งแต่งตั้ง ตร.',
    issuer: 'สำนักงานตำรวจแห่งชาติ',
    signedDate: '1 ตุลาคม 2569',
    effectiveDate: '1 ตุลาคม 2569',
    description: 'การแต่งตั้งโยกย้ายและเลื่อนตำแหน่งข้าราชการตำรวจระดับ รอง ผบก. ถึง สว. ประจำปีงบประมาณ พ.ศ. 2569 ตามมติ ก.ตร.',
    fileSize: '4.8 MB',
    pagesCount: 42,
    tags: ['แต่งตั้ง', 'สัญญาบัตร', 'วาระ 2569', 'ก.ตร.'],
    downloadCount: 1420,
    urgency: 'critical',
  },
  {
    id: 'ann-45-2569',
    orderNumber: 'ประกาศ สกพ. ที่ 45/2569',
    title: 'เรื่อง รายชื่อข้าราชการตำรวจที่ผ่านการฝึกอบรมระดับสารวัตรขึ้นไปประจำไตรมาส 3',
    category: 'announcement',
    categoryLabel: 'ประกาศ สกพ.',
    issuer: 'สำนักงานกำลังพล (สกพ.)',
    signedDate: '28 กันยายน 2569',
    effectiveDate: '1 ตุลาคม 2569',
    description: 'ประกาศรายชื่อผู้สำเร็จการฝึกอบรมหลักสูตรฝ่ายอำนวยการตำรวจและสารวัตร เพื่อประกอบการพิจารณาแต่งตั้งเลื่อนตำแหน่งสูงขึ้น',
    fileSize: '1.9 MB',
    pagesCount: 18,
    tags: ['ฝึกอบรม', 'ระดับสารวัตร', 'ไตรมาส 3', 'สกพ.'],
    downloadCount: 890,
    urgency: 'normal',
  },
  {
    id: 'ord-118-2569',
    orderNumber: 'คำสั่ง ตร. ที่ 118/2569',
    title: 'เรื่อง กำหนดกรอบอัตรากำลังและโครงสร้างการแบ่งส่วนราชการภายใน บช.สอท. (บก.สอท.6)',
    category: 'regulation',
    categoryLabel: 'โครงสร้าง/อัตรากำลัง',
    issuer: 'สำนักงานตำรวจแห่งชาติ',
    signedDate: '15 กันยายน 2569',
    effectiveDate: '1 ตุลาคม 2569',
    description: 'การจัดตั้งกองบังคับการสืบสวนสอบสวนอาชญากรรมทางเทคโนโลยี 6 (บก.สอท.6) เพื่อขยายเขตอำนาจการปฏิบัติการปราบปรามอาชญากรรมออนไลน์',
    fileSize: '2.4 MB',
    pagesCount: 12,
    tags: ['บช.สอท.', 'โครงสร้างหน่วยงาน', 'อัตรากำลัง', 'ไซเบอร์'],
    downloadCount: 650,
    urgency: 'urgent',
  },
  {
    id: 'ann-38-2569',
    orderNumber: 'ประกาศ ตร. ที่ 38/2569',
    title: 'เรื่อง แนวทางการประเมินผลการปฏิบัติราชการและตัวชี้วัดความพร้อมของกำลังพล ประจำปี พ.ศ. 2570',
    category: 'announcement',
    categoryLabel: 'แนวปฏิบัติ ตร.',
    issuer: 'สำนักงานกำลังพล (สกพ.)',
    signedDate: '10 กันยายน 2569',
    effectiveDate: '1 ตุลาคม 2569',
    description: 'หลักเกณฑ์และวิธีการประเมินประสิทธิภาพการปฏิบัติงานของข้าราชการตำรวจทุกระดับชั้นตาม พ.ร.บ.ตำรวจแห่งชาติ พ.ศ. 2565',
    fileSize: '3.1 MB',
    pagesCount: 24,
    tags: ['การประเมินผล', 'ตัวชี้วัด', 'สกพ.', 'พ.ร.บ.ตำรวจ'],
    downloadCount: 1120,
    urgency: 'normal',
  },
  {
    id: 'ord-95-2569',
    orderNumber: 'คำสั่ง ตร. ที่ 95/2569',
    title: 'เรื่อง มอบหมายหน้าที่ความรับผิดชอบ รอง ผบ.ตร. และ ผู้ช่วย ผบ.ตร. ประจำปีงบประมาณ 2569',
    category: 'appointment',
    categoryLabel: 'การมอบหมายหน้าที่',
    issuer: 'สำนักงานตำรวจแห่งชาติ',
    signedDate: '1 กันยายน 2569',
    effectiveDate: '1 ตุลาคม 2569',
    description: 'การแบ่งมอบหมายหน้าที่และสายงานการบังคับบัญชา 6 ด้านหลัก (บริหาร, ปราบปราม, สืบสวน, กฎหมาย, มั่นคง, การศึกษา) ให้แก่ผู้บังคับบัญชาระดับสูง',
    fileSize: '1.2 MB',
    pagesCount: 8,
    tags: ['รอง ผบ.ตร.', 'ผู้ช่วย ผบ.ตร.', 'สายงาน 6 ด้าน', 'บริหาร ตร.'],
    downloadCount: 2350,
    urgency: 'critical',
  },
];
