import React, { useState } from 'react';
import {
  CustomThemeSettings,
  BACKGROUND_PRESETS,
  TEXT_COLOR_PRESETS,
  CHART_THEME_PRESETS,
  DEFAULT_CUSTOM_THEME,
} from '../types/themeCustomization';
import { AppTheme, THEMES } from '../data/themes';
import {
  Palette,
  X,
  RotateCcw,
  Check,
  Sparkles,
  Layers,
  Type,
  Layout,
  Sun,
  Moon,
  Pipette,
  CheckCircle2,
} from 'lucide-react';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CustomThemeSettings;
  onUpdateSettings: (newSettings: CustomThemeSettings) => void;
  currentTheme: AppTheme;
  onSelectAppTheme: (themeId: string) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentTheme,
  onSelectAppTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'background' | 'text' | 'presets'>('chart');

  if (!isOpen) return null;

  const handleResetToDefault = () => {
    onUpdateSettings(DEFAULT_CUSTOM_THEME);
    onSelectAppTheme(THEMES[0].id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border-2 border-[#C5A059] bg-[#181D27] text-slate-100 shadow-2xl overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(197, 160, 89, 0.25)',
        }}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0B2545] via-[#0F2E59] to-[#0B2545] border-b border-[#C5A059]/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-1.5">
                  <span>ปรับแต่งสีและธีมระบบ</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    Live Customizer
                  </span>
                </h2>
              </div>
              <p className="text-xs text-amber-200/90 font-medium mt-0.5">
                ปรับสีธีมแผนผัง สีพื้นหลังหลัก และสีตัวอักษรได้อิสระตามต้องการ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              title="รีเซ็ตกลับเป็นค่าเริ่มต้นทางการ ตร."
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">คืนค่าเริ่มต้น</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-700/80 bg-[#141923] flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'chart'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                : 'bg-[#1E2533] text-slate-300 hover:text-white hover:bg-[#283142] border border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. สีธีมแผนผัง</span>
          </button>

          <button
            onClick={() => setActiveTab('background')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'background'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                : 'bg-[#1E2533] text-slate-300 hover:text-white hover:bg-[#283142] border border-slate-700'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>2. สีพื้นหลังหลัก</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                : 'bg-[#1E2533] text-slate-300 hover:text-white hover:bg-[#283142] border border-slate-700'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>3. สีตัวอักษร</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                : 'bg-[#1E2533] text-slate-300 hover:text-white hover:bg-[#283142] border border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>4. ธีมสำเร็จรูปทั้งระบบ</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: สีธีมแผนผัง */}
          {activeTab === 'chart' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  เลือกสไตล์สีธีมแผนผังโครงสร้าง (Org Chart Theme Preset)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  กำหนดชุดสีของการ์ด เส้นเชื่อมโยงสายการบังคับบัญชา และแถบไฮไลต์ของแต่ละกองบัญชาการ
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHART_THEME_PRESETS.map((p) => {
                  const isSelected = settings.chartThemePreset === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onUpdateSettings({
                          ...settings,
                          chartThemePreset: p.id,
                          chartAccentColor: p.accentColor,
                          chartCardBg: p.cardBg,
                        });
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-[#222B3A] shadow-md ring-1 ring-amber-400/50'
                          : 'border-slate-700/80 bg-[#1E2533] hover:border-slate-500 hover:bg-[#252E3E]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                              style={{ backgroundColor: p.accentColor }}
                            />
                            <h4 className="text-xs font-black text-slate-100">{p.name}</h4>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      {/* Palette Color Swatches Preview */}
                      <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-700/60">
                        {p.previewColors.map((hex, i) => (
                          <div
                            key={i}
                            className="flex-1 h-3 rounded-md border border-white/20 shadow-xs"
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Accent Color for Org Chart */}
              <div className="p-4 rounded-2xl border border-slate-700 bg-[#141923] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pipette className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-bold text-slate-200">
                      ปรับสีขอบและไฮไลต์แผนผังแบบกำหนดเอง (Custom Accent Color)
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-700">
                    {settings.chartAccentColor}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.chartAccentColor}
                    onChange={(e) => {
                      onUpdateSettings({
                        ...settings,
                        chartAccentColor: e.target.value,
                      });
                    }}
                    className="w-12 h-9 rounded-xl border border-slate-600 bg-transparent cursor-pointer"
                  />
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {['#C5A059', '#D4AF37', '#F59E0B', '#38BDF8', '#10B981', '#E11D48', '#8B5CF6', '#EC4899', '#94A3B8'].map(
                      (hex) => (
                        <button
                          key={hex}
                          onClick={() => {
                            onUpdateSettings({
                              ...settings,
                              chartAccentColor: hex,
                            });
                          }}
                          className={`w-7 h-7 rounded-lg border transition-transform cursor-pointer hover:scale-110 flex items-center justify-center ${
                            settings.chartAccentColor.toLowerCase() === hex.toLowerCase()
                              ? 'border-white scale-110 shadow-xs ring-2 ring-white/40'
                              : 'border-white/20'
                          }`}
                          style={{ backgroundColor: hex }}
                          title={hex}
                        >
                          {settings.chartAccentColor.toLowerCase() === hex.toLowerCase() && (
                            <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: สีพื้นหลังหลัก */}
          {activeTab === 'background' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <Layout className="w-4 h-4" />
                  เลือกสีพื้นหลังหลักของเว็บไซต์ (Main Background Color)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  เลือกจากโทนสีกรมท่า/ชาร์โคลทางการ หรือกำหนดสีพื้นหลังที่ต้องการได้แบบ Real-time
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BACKGROUND_PRESETS.map((bg) => {
                  const isSelected =
                    settings.bgType === 'preset' && settings.bgPresetId === bg.id;
                  return (
                    <div
                      key={bg.id}
                      onClick={() => {
                        onUpdateSettings({
                          ...settings,
                          bgType: 'preset',
                          bgPresetId: bg.id,
                          customBgColor: bg.hex,
                          bgIsDark: bg.isDark,
                        });
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-400 shadow-md ring-1 ring-amber-400/50'
                          : 'border-slate-700/80 hover:border-slate-500'
                      }`}
                      style={{ backgroundColor: bg.hex }}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3.5 h-3.5 rounded-full border shadow-xs ${
                                bg.isDark ? 'border-white/40' : 'border-slate-400'
                              }`}
                              style={{ backgroundColor: bg.borderHex }}
                            />
                            <h4
                              className={`text-xs font-black ${
                                bg.isDark ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              {bg.name}
                            </h4>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] mt-2 line-clamp-2 leading-relaxed ${
                            bg.isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          {bg.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            bg.isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {bg.hex}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                            bg.isDark
                              ? 'bg-white/10 text-slate-300'
                              : 'bg-black/10 text-slate-700'
                          }`}
                        >
                          {bg.isDark ? 'โหมดมืด (Dark)' : 'โหมดสว่าง (Light)'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Hex Color Picker */}
              <div className="p-4 rounded-2xl border border-slate-700 bg-[#141923] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pipette className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-bold text-slate-200">
                      กำหนดสีพื้นหลังเอง (Custom Hex Background Color)
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-700">
                    {settings.customBgColor}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.customBgColor}
                    onChange={(e) => {
                      const color = e.target.value;
                      // Detect if dark or light
                      const r = parseInt(color.slice(1, 3), 16) || 0;
                      const g = parseInt(color.slice(3, 5), 16) || 0;
                      const b = parseInt(color.slice(5, 7), 16) || 0;
                      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                      const isDark = brightness < 128;

                      onUpdateSettings({
                        ...settings,
                        bgType: 'custom',
                        customBgColor: color,
                        bgIsDark: isDark,
                      });
                    }}
                    className="w-12 h-9 rounded-xl border border-slate-600 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.customBgColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.startsWith('#') && val.length <= 7) {
                        onUpdateSettings({
                          ...settings,
                          bgType: 'custom',
                          customBgColor: val,
                        });
                      }
                    }}
                    placeholder="#181D27"
                    className="w-32 px-3 py-1.5 rounded-xl border border-slate-600 bg-slate-800 font-mono text-xs text-white"
                  />
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() =>
                        onUpdateSettings({
                          ...settings,
                          bgIsDark: !settings.bgIsDark,
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-600 bg-slate-800 text-xs font-bold text-slate-300 hover:text-white"
                    >
                      {settings.bgIsDark ? (
                        <>
                          <Moon className="w-3.5 h-3.5 text-blue-400" />
                          <span>มืด (Dark)</span>
                        </>
                      ) : (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                          <span>สว่าง (Light)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: สีตัวอักษร */}
          {activeTab === 'text' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  เลือกสีตัวอักษรและเนื้อหา (Font & Typography Color)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  ปรับสีตัวอักษรหลัก สีหัวข้อ และสีตัวอักษรรองให้อ่านง่าย คมชัดตามระดับสายตา
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEXT_COLOR_PRESETS.map((t) => {
                  const isSelected =
                    settings.textType === 'preset' &&
                    settings.customTextColor === t.hex &&
                    settings.customHeadingColor === t.headingHex;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        onUpdateSettings({
                          ...settings,
                          textType: 'preset',
                          customTextColor: t.hex,
                          customHeadingColor: t.headingHex,
                          customTextMutedColor: t.mutedHex,
                        });
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between bg-[#1E2533] ${
                        isSelected
                          ? 'border-amber-400 shadow-md ring-1 ring-amber-400/50 bg-[#252E3E]'
                          : 'border-slate-700/80 hover:border-slate-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-xs"
                              style={{ backgroundColor: t.headingHex }}
                            />
                            <h4 className="text-xs font-black text-slate-100">{t.name}</h4>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        {/* Sample Preview Text */}
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                          <div
                            className="text-xs font-black"
                            style={{ color: t.headingHex }}
                          >
                            สำนักงานตำรวจแห่งชาติ (ตร.)
                          </div>
                          <div
                            className="text-[11px] font-medium"
                            style={{ color: t.hex }}
                          >
                            {t.sampleText}
                          </div>
                          <div
                            className="text-[10px]"
                            style={{ color: t.mutedHex }}
                          >
                            รองผู้บัญชาการตำรวจแห่งชาติ · กองบังคับการ
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Font Color Pickers */}
              <div className="p-4 rounded-2xl border border-slate-700 bg-[#141923] space-y-4">
                <div className="flex items-center gap-2">
                  <Pipette className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-bold text-slate-200">
                    ปรับสีตัวอักษรแบบละเอียด (Custom Text Colors)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Primary Text */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[11px] text-slate-400 font-bold block">
                      สีตัวอักษรเนื้อหาหลัก (Body Text)
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.customTextColor}
                        onChange={(e) => {
                          onUpdateSettings({
                            ...settings,
                            textType: 'custom',
                            customTextColor: e.target.value,
                          });
                        }}
                        className="w-9 h-8 rounded-lg border border-slate-600 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-white">
                        {settings.customTextColor}
                      </span>
                    </div>
                  </div>

                  {/* Heading Text */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[11px] text-slate-400 font-bold block">
                      สีหัวข้อและชื่อตำแหน่ง (Headings)
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.customHeadingColor}
                        onChange={(e) => {
                          onUpdateSettings({
                            ...settings,
                            textType: 'custom',
                            customHeadingColor: e.target.value,
                          });
                        }}
                        className="w-9 h-8 rounded-lg border border-slate-600 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-white">
                        {settings.customHeadingColor}
                      </span>
                    </div>
                  </div>

                  {/* Muted Text */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[11px] text-slate-400 font-bold block">
                      สีข้อความรองและป้ายกำกับ (Muted)
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.customTextMutedColor}
                        onChange={(e) => {
                          onUpdateSettings({
                            ...settings,
                            textType: 'custom',
                            customTextMutedColor: e.target.value,
                          });
                        }}
                        className="w-9 h-8 rounded-lg border border-slate-600 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-white">
                        {settings.customTextMutedColor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ธีมสำเร็จรูปทั้งระบบ */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  เลือกธีมสำเร็จรูปของระบบ (Full Preset Themes)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  ชุดธีมที่ออกแบบคู่สีสมบูรณ์แบบ ทั้งแถบเมนู การ์ด ตาราง และผังองค์กร
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEMES.map((theme) => {
                  const isSelected = currentTheme.id === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => onSelectAppTheme(theme.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-[#222B3A] shadow-md ring-1 ring-amber-400/50'
                          : 'border-slate-700/80 bg-[#1E2533] hover:border-slate-500 hover:bg-[#252E3E]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-black text-slate-100">{theme.name}</h4>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {theme.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-700/60">
                        {theme.swatches.map((hex, i) => (
                          <div
                            key={i}
                            className="flex-1 h-3.5 rounded-md border border-white/20 shadow-xs"
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl border border-[#C5A059]/60 bg-gradient-to-r from-[#0B2545]/60 to-[#141A24]/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ตัวอย่างการแสดงผลแบบ Real-Time (Live Preview)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                พื้นหลัง: {settings.customBgColor} · ตัวอักษร: {settings.customTextColor}
              </span>
            </div>

            <div
              className="p-3.5 rounded-xl border-2 transition-all shadow-inner"
              style={{
                backgroundColor: settings.chartCardBg || '#1E2533',
                borderColor: settings.chartAccentColor || '#C5A059',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div
                    className="text-xs font-extrabold"
                    style={{ color: settings.customHeadingColor }}
                  >
                    กองบัญชาการตำรวจสอบสวนกลาง (บช.ก.)
                  </div>
                  <div
                    className="text-[11px] font-medium mt-0.5"
                    style={{ color: settings.customTextColor }}
                  >
                    หน่วยงานในสังกัด: 11 กองบังคับการ · กำลังพลรวม 2,450 นาย
                  </div>
                </div>
                <div
                  className="px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 border"
                  style={{
                    backgroundColor: settings.chartAccentColor,
                    borderColor: settings.chartAccentColor,
                    color: '#0F172A',
                  }}
                >
                  ฝ่ายสืบสวนสอบสวน
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#111620] border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            ✨ การตั้งค่าสีทั้งหมดจะถูกบันทึกอัตโนมัติลงในเบราว์เซอร์
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md ml-auto"
          >
            เสร็จสิ้น & บันทึก
          </button>
        </div>
      </div>
    </div>
  );
};
