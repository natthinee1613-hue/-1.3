/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PoliceOfficialOrder } from '../data/officialOrders';

/**
 * Trigger immediate client-side file download in browser
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate official Thai Police Order HTML document for downloading as .doc / .html
 */
export function generateOfficialOrderDocumentHTML(order: PoliceOfficialOrder): string {
  const now = new Date();
  const timestampStr = now.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) + ` เวลา ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`;

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>${order.orderNumber} - ${order.title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&family=Prompt:wght@400;600;700&display=swap');
  @page {
    size: A4;
    margin: 2.5cm 2cm 2cm 2cm;
  }
  body {
    font-family: 'Sarabun', 'TH Sarabun PSK', 'Prompt', sans-serif;
    color: #1a1a1a;
    background-color: #ffffff;
    line-height: 1.6;
    margin: 0;
    padding: 30px;
  }
  .doc-container {
    max-width: 800px;
    margin: 0 auto;
    border: 1px solid #dcdcdc;
    padding: 40px 50px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    background: #fff;
    position: relative;
  }
  .header-emblem {
    text-align: center;
    margin-bottom: 20px;
  }
  .header-emblem svg {
    width: 70px;
    height: 70px;
    fill: #991b1b;
  }
  .doc-title-main {
    text-align: center;
    font-size: 20pt;
    font-weight: 800;
    color: #0f1e36;
    margin: 0 0 5px 0;
  }
  .doc-subtitle {
    text-align: center;
    font-size: 14pt;
    font-weight: 700;
    color: #b91c1c;
    margin: 0 0 15px 0;
  }
  .doc-header-info {
    text-align: center;
    font-size: 12pt;
    font-weight: 600;
    color: #4b5563;
    border-bottom: 2px solid #b91c1c;
    padding-bottom: 15px;
    margin-bottom: 25px;
  }
  .meta-grid {
    display: table;
    width: 100%;
    margin-bottom: 25px;
    background: #f8fafc;
    padding: 12px 15px;
    border-radius: 8px;
    border-left: 4px solid #0f1e36;
    font-size: 11pt;
  }
  .meta-row {
    display: table-row;
  }
  .meta-label {
    display: table-cell;
    width: 25%;
    font-weight: 700;
    color: #4b5563;
    padding: 4px 0;
  }
  .meta-value {
    display: table-cell;
    width: 75%;
    font-weight: 600;
    color: #111827;
    padding: 4px 0;
  }
  .content-section {
    font-size: 12pt;
    text-align: justify;
    text-justify: inter-cluster;
    line-height: 1.8;
    margin-bottom: 30px;
  }
  .content-title {
    font-weight: 700;
    font-size: 13pt;
    color: #0f1e36;
    margin-bottom: 8px;
  }
  .content-body {
    text-indent: 2.5cm;
    margin-bottom: 15px;
    color: #1f2937;
  }
  .signature-zone {
    float: right;
    width: 320px;
    text-align: center;
    margin-top: 40px;
    page-break-inside: avoid;
  }
  .sign-line {
    border-bottom: 1px dashed #6b7280;
    width: 200px;
    margin: 30px auto 10px auto;
  }
  .sign-rank {
    font-size: 11pt;
    font-weight: 700;
    color: #111827;
  }
  .sign-pos {
    font-size: 10.5pt;
    color: #4b5563;
  }
  .clear {
    clear: both;
  }
  .footer-stamp {
    margin-top: 40px;
    padding-top: 15px;
    border-top: 1px solid #e5e7eb;
    font-size: 9pt;
    color: #6b7280;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-35deg);
    font-size: 55pt;
    font-weight: 900;
    color: rgba(185, 28, 28, 0.04);
    pointer-events: none;
    white-space: nowrap;
    z-index: 0;
  }
  @media print {
    body { padding: 0; }
    .doc-container { border: none; box-shadow: none; padding: 0; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
<div class="no-print" style="max-width: 800px; margin: 0 auto 15px auto; display: flex; justify-content: space-between; align-items: center; background: #0f1e36; color: #fff; padding: 10px 20px; border-radius: 8px;">
  <span style="font-size: 11pt; font-weight: 600;">📄 ระบบดาวน์โหลดเอกสารคำสั่งอิเล็กทรอนิกส์ ตร. (Real-Time Download)</span>
  <button onclick="window.print()" style="background: #eab308; color: #000; border: none; padding: 6px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ พิมพ์ / บันทึกเป็น PDF</button>
</div>

<div class="doc-container">
  <div class="watermark">สำนักงานตำรวจแห่งชาติ</div>

  <div class="header-emblem">
    <svg viewBox="0 0 24 24">
      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 4.5c1.93 0 3.5 1.57 3.5 3.5S13.93 13.5 12 13.5 8.5 11.93 8.5 10 10.07 6.5 12 6.5zM12 19c-2.43 0-4.63-1.04-6.19-2.73 1.54-1.89 3.73-3.27 6.19-3.27 2.46 0 4.65 1.38 6.19 3.27C16.63 17.96 14.43 19 12 19z"/>
    </svg>
  </div>

  <div class="doc-title-main">${order.issuer}</div>
  <div class="doc-subtitle">${order.orderNumber}</div>
  <div class="doc-header-info">${order.title}</div>

  <div class="meta-grid">
    <div class="meta-row">
      <div class="meta-label">ประเภทเอกสาร:</div>
      <div class="meta-value">${order.categoryLabel}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">หน่วยงานผู้ออก:</div>
      <div class="meta-value">${order.issuer}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">วันที่ลงนาม:</div>
      <div class="meta-value">${order.signedDate}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">วันที่มีผลบังคับใช้:</div>
      <div class="meta-value">${order.effectiveDate || order.signedDate}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">ระดับความเร่งด่วน:</div>
      <div class="meta-value" style="color: ${order.urgency === 'critical' ? '#b91c1c' : '#111827'}; font-weight: bold;">
        ${order.urgency === 'critical' ? '🔴 ด่วนที่สุด' : order.urgency === 'urgent' ? '🟠 ด่วนมาก' : '🟢 ปกติ'}
      </div>
    </div>
  </div>

  <div class="content-section">
    <div class="content-title">ข้อความและสาระสำคัญแห่งคำสั่ง:</div>
    <div class="content-body">
      ${order.description}
    </div>
    <div class="content-body">
      เพื่อให้การบริหารงานบุคคล การจัดสรรอัตรากำลัง และการปฏิบัติราชการของสำนักงานตำรวจแห่งชาติ เป็นไปด้วยความเรียบร้อย มีประสิทธิภาพ บรรลุตามวัตถุประสงค์ของทางราชการ และเกิดประโยชน์สูงสุดแก่ประชาชนและประเทศชาติ
    </div>
    <div class="content-body">
      ทั้งนี้ ตั้งแต่วันที่ ${order.effectiveDate || order.signedDate} เป็นต้นไป จนกว่าจะมีคำสั่งเปลี่ยนแปลง
    </div>
  </div>

  <div class="signature-zone">
    <div style="font-size: 11pt; color: #4b5563;">สั่ง ณ วันที่ ${order.signedDate}</div>
    <div class="sign-line"></div>
    <div class="sign-rank">( ลงนามผู้มีอำนาจสั่งการ )</div>
    <div class="sign-pos">${order.issuer}</div>
  </div>

  <div class="clear"></div>

  <div class="footer-stamp">
    <div>ระบบสารบรรณและบัญชาการกำลังพล (สกพ. ตร.) · รหัสอ้างอิง: ${order.id}</div>
    <div>ดาวน์โหลดข้อมูลเมื่อ: ${timestampStr}</div>
  </div>
</div>
</body>
</html>`;
}

/**
 * Real-time direct download of a single order as formatted official document (.html / .doc)
 */
export function downloadSingleOrderOfficialDoc(order: PoliceOfficialOrder): void {
  const htmlContent = generateOfficialOrderDocumentHTML(order);
  const sanitizedNumber = order.orderNumber.replace(/[\/\\:*?"<>|]/g, '_');
  const filename = `${sanitizedNumber}_เอกสารคำสั่ง.html`;
  triggerFileDownload(htmlContent, filename, 'text/html;charset=utf-8');
}

/**
 * Open print-ready printable document in a new popup window
 */
export function printOrSaveOrderDocument(order: PoliceOfficialOrder): void {
  const htmlContent = generateOfficialOrderDocumentHTML(order);
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  } else {
    // Fallback if popup blocked
    downloadSingleOrderOfficialDoc(order);
  }
}

/**
 * Real-time export of all orders to CSV with UTF-8 BOM for Microsoft Excel compatibility
 */
export function exportOrdersListToCSV(orders: PoliceOfficialOrder[]): void {
  const headers = [
    'ลำดับ',
    'เลขที่คำสั่ง/ประกาศ',
    'ชื่อเรื่อง/ประกาศ',
    'ประเภท',
    'หน่วยงานผู้ออก',
    'วันที่ลงนาม',
    'วันที่มีผล',
    'ระดับความเร่งด่วน',
    'จำนวนหน้า',
    'ขนาดไฟล์',
    'ดาวน์โหลดแล้ว (ครั้ง)',
    'รายละเอียดสาระสำคัญ',
    'คำค้นหา (Tags)',
  ];

  const rows = orders.map((o, index) => {
    const urgencyLabel = o.urgency === 'critical' ? 'ด่วนที่สุด' : o.urgency === 'urgent' ? 'ด่วนมาก' : 'ปกติ';
    const escape = (val: string | number | undefined) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      index + 1,
      escape(o.orderNumber),
      escape(o.title),
      escape(o.categoryLabel),
      escape(o.issuer),
      escape(o.signedDate),
      escape(o.effectiveDate || o.signedDate),
      escape(urgencyLabel),
      o.pagesCount,
      escape(o.fileSize),
      o.downloadCount,
      escape(o.description),
      escape(o.tags.join(', ')),
    ].join(',');
  });

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  triggerFileDownload(csvContent, `รายการคำสั่งแต่งตั้งและประกาศ_ตร_${dateStr}.csv`, 'text/csv;charset=utf-8');
}

/**
 * Real-time export of all orders to Excel HTML Workbook (.xls)
 */
export function exportOrdersListToExcel(orders: PoliceOfficialOrder[]): void {
  const now = new Date();
  const timestampStr = now.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) + ` เวลา ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`;

  const rowsHtml = orders
    .map(
      (o, i) => `
    <tr>
      <td style="text-align: center;">${i + 1}</td>
      <td style="font-weight: bold; color: #b91c1c;">${o.orderNumber}</td>
      <td>${o.title}</td>
      <td>${o.categoryLabel}</td>
      <td>${o.issuer}</td>
      <td style="text-align: center;">${o.signedDate}</td>
      <td style="text-align: center;">${o.effectiveDate || o.signedDate}</td>
      <td style="text-align: center; font-weight: bold; color: ${
        o.urgency === 'critical' ? '#b91c1c' : o.urgency === 'urgent' ? '#d97706' : '#15803d'
      };">${o.urgency === 'critical' ? 'ด่วนที่สุด' : o.urgency === 'urgent' ? 'ด่วนมาก' : 'ปกติ'}</td>
      <td style="text-align: center;">${o.pagesCount}</td>
      <td style="text-align: center;">${o.fileSize}</td>
      <td style="text-align: center;">${o.downloadCount.toLocaleString()}</td>
      <td>${o.description}</td>
    </tr>`
    )
    .join('');

  const excelContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>รายการคำสั่ง ตร.</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Sarabun', Tahoma, sans-serif; font-size: 11pt; }
        th { background-color: #0F1E36; color: #FFE066; font-weight: bold; text-align: center; padding: 10px; border: 1px solid #1E3A5F; }
        td { padding: 6px 8px; border: 1px solid #E2E8F0; }
        .header-title { font-size: 16pt; font-weight: bold; color: #0F1E36; text-align: center; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="12" class="header-title">ทะเบียนคุมคำสั่งแต่งตั้งและประกาศ สำนักงานตำรวจแห่งชาติ (สกพ.)</td>
        </tr>
        <tr>
          <td colspan="12" style="text-align: center; color: #64748B; font-size: 10pt;">ข้อมูลส่งออก ณ วันที่: ${timestampStr} · ทั้งหมด ${orders.length} ฉบับ</td>
        </tr>
        <tr><td colspan="12"></td></tr>
        <tr>
          <th>ลำดับ</th>
          <th>เลขที่คำสั่ง / ประกาศ</th>
          <th>ชื่อเรื่อง / เรื่อง</th>
          <th>ประเภท</th>
          <th>หน่วยงานผู้ออก</th>
          <th>วันที่ลงนาม</th>
          <th>วันที่มีผลบังคับใช้</th>
          <th>ความเร่งด่วน</th>
          <th>จำนวนหน้า</th>
          <th>ขนาดไฟล์</th>
          <th>สถิติดาวน์โหลด</th>
          <th>สาระสำคัญ</th>
        </tr>
        ${rowsHtml}
      </table>
    </body>
    </html>
  `;

  const dateStr = now.toISOString().slice(0, 10);
  triggerFileDownload(excelContent, `ทะเบียนคุมคำสั่ง_ตร_${dateStr}.xls`, 'application/vnd.ms-excel;charset=utf-8');
}

/**
 * Real-time export of all orders as JSON
 */
export function exportOrdersListToJSON(orders: PoliceOfficialOrder[]): void {
  const jsonContent = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      totalOrders: orders.length,
      organization: 'สำนักงานกำลังพล สำนักงานตำรวจแห่งชาติ (สกพ.)',
      orders,
    },
    null,
    2
  );
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerFileDownload(jsonContent, `ข้อมูลคำสั่งและประกาศ_ตร_${dateStr}.json`, 'application/json;charset=utf-8');
}
