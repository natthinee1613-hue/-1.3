export interface CustomThemeSettings {
  // 1. Chart Theme / Palette preset & accent
  chartThemePreset: 'gold-navy' | 'midnight-navy' | 'emerald-prestige' | 'crimson-royal' | 'cyber-cyan' | 'obsidian-dark' | 'clean-light';
  chartAccentColor: string; // Hex color for borders/accents in Org Chart
  chartCardBg: string;     // Hex/tailwind for card backgrounds

  // 2. Main App Background
  bgType: 'preset' | 'custom';
  bgPresetId: string;
  customBgColor: string;
  bgIsDark: boolean;

  // 3. Text / Typography Color
  textType: 'preset' | 'custom';
  customTextColor: string;
  customTextMutedColor: string;
  customHeadingColor: string;
}

export const DEFAULT_CUSTOM_THEME: CustomThemeSettings = {
  chartThemePreset: 'gold-navy',
  chartAccentColor: '#C5A059',
  chartCardBg: '#1E2533',
  bgType: 'preset',
  bgPresetId: 'charcoal',
  customBgColor: '#181D27',
  bgIsDark: true,
  textType: 'preset',
  customTextColor: '#F8FAFC',
  customTextMutedColor: '#94A3B8',
  customHeadingColor: '#FFE066',
};

export interface BackgroundPresetOption {
  id: string;
  name: string;
  englishName: string;
  hex: string;
  isDark: boolean;
  borderHex: string;
  description: string;
}

export const BACKGROUND_PRESETS: BackgroundPresetOption[] = [
  {
    id: 'charcoal',
    name: 'ดาร์กชาร์โคล ตร.',
    englishName: 'Executive Charcoal Dark',
    hex: '#181D27',
    isDark: true,
    borderHex: '#374151',
    description: 'สีเทาเข้มชาร์โคลมาตรฐาน หรูหรา สบายตา คมชัดระดับผู้บริหาร',
  },
  {
    id: 'midnight',
    name: 'รอยัลมิดไนท์เนวี่',
    englishName: 'Royal Midnight Navy',
    hex: '#0A1220',
    isDark: true,
    borderHex: '#1E3A5F',
    description: 'สีกรมท่าเข้มลึกมิดไนท์ สง่างาม สบายตาในที่มืด',
  },
  {
    id: 'royal-blue',
    name: 'ดีพรอยัลบลู',
    englishName: 'Deep Royal Police Blue',
    hex: '#07152B',
    isDark: true,
    borderHex: '#1A365D',
    description: 'สีน้ำเงินกรมท่าเข้มตำรวจไทย ภูมิฐาน สง่างาม',
  },
  {
    id: 'slate-black',
    name: 'ดาร์กสเลทกราไฟต์',
    englishName: 'Dark Slate Graphite',
    hex: '#0F172A',
    isDark: true,
    borderHex: '#334155',
    description: 'สีเทาดำสเลทเข้มข้น โมเดิร์น คมชัดสูง',
  },
  {
    id: 'pitch-dark',
    name: 'ออบซิเดียนแบล็ค',
    englishName: 'Pure Obsidian Black',
    hex: '#080B10',
    isDark: true,
    borderHex: '#27272A',
    description: 'สีดำสนิทระดับ Deep AMOLED ประหยัดพลังงาน คมชัดที่สุด',
  },
  {
    id: 'espresso',
    name: 'วอร์มเอสเปรสโซ่',
    englishName: 'Warm Dark Espresso',
    hex: '#1C1917',
    isDark: true,
    borderHex: '#44403C',
    description: 'สีน้ำตาลเข้มเอสเปรสโซ่อบอุ่น สไตล์ไม้สักโบราณ',
  },
  {
    id: 'clean-light',
    name: 'โมเดิร์น คลีนไวท์',
    englishName: 'Modern Clean Slate Light',
    hex: '#F8FAFC',
    isDark: false,
    borderHex: '#E2E8F0',
    description: 'สีขาวสว่างพาสเทลคลีน สบายตา สะอาดตา สำหรับงานเอกสาร',
  },
  {
    id: 'antique-cream',
    name: 'งาช้างราชการ (ครีม)',
    englishName: 'Royal Antique Ivory',
    hex: '#F5EFE6',
    isDark: false,
    borderHex: '#E7DFD5',
    description: 'สีงาช้างนวลตา สไตล์ทำเนียบราชการดั้งเดิม',
  },
  {
    id: 'soft-pearl',
    name: 'ซอฟท์เพิร์ลเกรย์',
    englishName: 'Soft Pearl Gray',
    hex: '#EEF2F6',
    isDark: false,
    borderHex: '#CBD5E1',
    description: 'สีเทามุกนุ่มนวล สบายสายตา ไม่สะท้อนแสง',
  },
];

export interface TextColorPresetOption {
  id: string;
  name: string;
  hex: string;
  headingHex: string;
  mutedHex: string;
  sampleText: string;
}

export const TEXT_COLOR_PRESETS: TextColorPresetOption[] = [
  {
    id: 'white-gold',
    name: 'ขาวบริสุทธิ์ & หัวข้อทองคำเปลว (มาตรฐาน ตร.)',
    hex: '#F8FAFC',
    headingHex: '#FFE066',
    mutedHex: '#94A3B8',
    sampleText: 'ตัวอักษรสีขาวสว่าง คมชัดสูง สบายตา',
  },
  {
    id: 'bright-gold',
    name: 'ทองอร่าม & อำพันรอยัล (Royal Gold)',
    hex: '#FEF08A',
    headingHex: '#F59E0B',
    mutedHex: '#D97706',
    sampleText: 'โทนสีทองอำพัน สง่างาม หรูหรา เกียรติยศ',
  },
  {
    id: 'ice-cyan',
    name: 'ฟ้าไอซ์บลู & ไซอัน (Ice Sky Blue)',
    hex: '#E0F2FE',
    headingHex: '#38BDF8',
    mutedHex: '#7DD3FC',
    sampleText: 'โทนฟ้าสว่าง ดิจิทัล ทันสมัย สดใส',
  },
  {
    id: 'emerald-mint',
    name: 'เขียวมรกต & มิ้นต์สดชื่น (Emerald Mint)',
    hex: '#ECFDF5',
    headingHex: '#34D399',
    mutedHex: '#6EE7B7',
    sampleText: 'โทนเขียวมรกตนวลตา สบายสายตา ผ่อนคลาย',
  },
  {
    id: 'warm-cream',
    name: 'ครีมนวลตา & วานิลลา (Warm Vanilla Cream)',
    hex: '#FFFBEB',
    headingHex: '#FBBF24',
    mutedHex: '#FDE68A',
    sampleText: 'โทนครีมอบอุ่น นุ่มนวล ละมุนสายตา',
  },
  {
    id: 'classic-dark',
    name: 'สเลทดำเข้ม (สำหรับพื้นหลังสีสว่าง)',
    hex: '#0F172A',
    headingHex: '#1E3A8A',
    mutedHex: '#475569',
    sampleText: 'สีดำสเลทเข้ม คมชัด สำหรับธีมพื้นหลังสว่าง',
  },
];

export interface ChartThemePresetOption {
  id: 'gold-navy' | 'midnight-navy' | 'emerald-prestige' | 'crimson-royal' | 'cyber-cyan' | 'obsidian-dark' | 'clean-light';
  name: string;
  englishName: string;
  description: string;
  accentColor: string;
  cardBg: string;
  badgeBg: string;
  borderStyle: string;
  connectorColor: string;
  previewColors: string[];
}

export const CHART_THEME_PRESETS: ChartThemePresetOption[] = [
  {
    id: 'gold-navy',
    name: 'ทองคำเปลวราชการ & กรมท่า (Royal Gold & Navy)',
    englishName: 'Official Police Royal Gold & Navy',
    description: 'ขอบการ์ดสีทองคำเปลว (#C5A059) พร้อมการ์ดสีกรมท่า/เทาเข้มระดับผู้บริหาร',
    accentColor: '#C5A059',
    cardBg: '#1E2533',
    badgeBg: '#F59E0B',
    borderStyle: 'border-[#C5A059]',
    connectorColor: '#C5A059',
    previewColors: ['#0B2545', '#1E2533', '#C5A059', '#FFE066'],
  },
  {
    id: 'midnight-navy',
    name: 'รอยัล มิดไนท์บลู (Midnight Navy Blue)',
    englishName: 'Royal Midnight Navy High Tech',
    description: 'ขอบการ์ดสีฟ้าไอซ์บลู (#38BDF8) การ์ดกรมท่ามิดไนท์ หรูหราทันสมัย',
    accentColor: '#38BDF8',
    cardBg: '#0F1E36',
    badgeBg: '#0284C7',
    borderStyle: 'border-[#38BDF8]',
    connectorColor: '#38BDF8',
    previewColors: ['#060B14', '#0F1E36', '#38BDF8', '#7DD3FC'],
  },
  {
    id: 'emerald-prestige',
    name: 'เขียวมรกตเกียรติยศ (Emerald Prestige)',
    englishName: 'Emerald Jade Police Prestige',
    description: 'ขอบการ์ดสีเขียวมรกตประกาย (#10B981) การ์ดเขียวเข้มพรีเมียม สบายสายตา',
    accentColor: '#10B981',
    cardBg: '#062C22',
    badgeBg: '#059669',
    borderStyle: 'border-[#10B981]',
    connectorColor: '#10B981',
    previewColors: ['#021B14', '#062C22', '#10B981', '#6EE7B7'],
  },
  {
    id: 'crimson-royal',
    name: 'แดงเลือดหมูภูมิฐาน (Crimson Royal)',
    englishName: 'Royal Crimson & Bronze',
    description: 'ขอบการ์ดสีทองแดง-ชมพูกุหลาบ (#E11D48) การ์ดแดงเข้มเบอร์กันดี ภูมิฐานเข้มแข็ง',
    accentColor: '#E11D48',
    cardBg: '#2D0E17',
    badgeBg: '#BE123C',
    borderStyle: 'border-[#E11D48]',
    connectorColor: '#E11D48',
    previewColors: ['#1C060C', '#2D0E17', '#E11D48', '#FDA4AF'],
  },
  {
    id: 'cyber-cyan',
    name: 'ไซเบอร์ นีออนไซอัน (Cyber Digital Cyan)',
    englishName: 'Cyber High-Tech Cyan & Indigo',
    description: 'ขอบการ์ดสีนีออนไซอันเรืองแสง (#06B6D4) สไตล์ศูนย์เทคโนโลยีสารสนเทศตำรวจ',
    accentColor: '#06B6D4',
    cardBg: '#0C2033',
    badgeBg: '#0891B2',
    borderStyle: 'border-[#06B6D4]',
    connectorColor: '#06B6D4',
    previewColors: ['#05111B', '#0C2033', '#06B6D4', '#67E8F9'],
  },
  {
    id: 'obsidian-dark',
    name: 'ออบซิเดียน สเตนเลส (Obsidian Stealth)',
    englishName: 'Minimalist Stealth Obsidian',
    description: 'ขอบการ์ดสีเงินสเตนเลสไททาเนียม (#94A3B8) การ์ดดำด้าน คมชัด เรียบหรูสูงสุด',
    accentColor: '#94A3B8',
    cardBg: '#181D27',
    badgeBg: '#475569',
    borderStyle: 'border-[#94A3B8]',
    connectorColor: '#94A3B8',
    previewColors: ['#0A0D14', '#181D27', '#94A3B8', '#E2E8F0'],
  },
  {
    id: 'clean-light',
    name: 'โมเดิร์น ซิลเวอร์ ไวท์ (Modern Light Silver)',
    englishName: 'Clean Light Office Silver',
    description: 'สำหรับการใช้งานในที่แสงสว่างจ้า การ์ดสีขาวสว่าง ขอบสีเทาเงินคมชัด',
    accentColor: '#3B82F6',
    cardBg: '#FFFFFF',
    badgeBg: '#2563EB',
    borderStyle: 'border-blue-300',
    connectorColor: '#3B82F6',
    previewColors: ['#F8FAFC', '#FFFFFF', '#3B82F6', '#93C5FD'],
  },
];
