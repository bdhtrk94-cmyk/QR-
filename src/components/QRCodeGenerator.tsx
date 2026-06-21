"use client";

import { useRef, useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { toPng, toBlob } from "html-to-image";
import { useTheme } from "next-themes";
import {
  Download,
  Copy,
  Moon,
  Sun,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Monitor,
  Scan,
  Plus,
  Trash2,
  Printer
} from "lucide-react";

type FontSize = "small" | "medium" | "large";
type TextAlign = "left" | "center" | "right";

interface QRCodeData {
  id: string;
  url: string;
  customText: string;
  fontSize: FontSize;
  textAlign: TextAlign;
  isRTL: boolean;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function QRCodeGenerator() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([
    {
      id: generateId(),
      url: "https://testflight.apple.com/join/3QQq9MgD",
      customText: "",
      fontSize: "medium",
      textAlign: "center",
      isRTL: false,
    },
  ]);

  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-detect Arabic characters to suggest RTL on specific items
  const updateQRCode = (id: string, field: keyof QRCodeData, value: any) => {
    setQrCodes((prev) =>
      prev.map((qr) => {
        if (qr.id === id) {
          const updated = { ...qr, [field]: value };
          // Auto RTL check if customText is being updated
          if (field === "customText") {
            const isArabic = /[\u0600-\u06FF]/.test(value as string);
            if (isArabic) updated.isRTL = true;
          }
          return updated;
        }
        return qr;
      })
    );
  };

  const addQRCode = () => {
    setQrCodes((prev) => [
      ...prev,
      {
        id: generateId(),
        url: "",
        customText: "",
        fontSize: "medium",
        textAlign: "center",
        isRTL: false,
      },
    ]);
  };

  const removeQRCode = (id: string) => {
    if (qrCodes.length === 1) return; // Prevent removing the last one
    setQrCodes((prev) => prev.filter((qr) => qr.id !== id));
  };

  const handleExport = async () => {
    if (exportRef.current) {
      try {
        const dataUrl = await toPng(exportRef.current, {
          quality: 1,
          pixelRatio: 3,
        });
        const link = document.createElement("a");
        link.download = "qr-codes.png";
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Error exporting image", err);
      }
    }
  };

  const handleCopy = async () => {
    if (exportRef.current) {
      try {
        const blob = await toBlob(exportRef.current, {
          quality: 1,
          pixelRatio: 3,
        });
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          alert("Image copied to clipboard!");
        }
      } catch (err) {
        console.error("Error copying image", err);
        alert("Failed to copy image. Your browser might not support this feature.");
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getFontSizeClass = (size: FontSize) => {
    switch (size) {
      case "small":
        return "text-xs";
      case "large":
        return "text-xl";
      case "medium":
      default:
        return "text-base";
    }
  };

  const getTextAlignClass = (align: TextAlign) => {
    switch (align) {
      case "left":
        return "text-left";
      case "right":
        return "text-right";
      case "center":
      default:
        return "text-center";
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 flex flex-col transition-colors duration-300 print:bg-white print:p-0">
      <header className="max-w-7xl w-full mx-auto flex justify-between items-center mb-10 print:hidden">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Modern QR Gen
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme("light")}
            className={`p-2 rounded-full transition-colors ${
              theme === "light"
                ? "bg-slate-200 dark:bg-slate-800"
                : "hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
            title="Light Mode"
          >
            <Sun className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`p-2 rounded-full transition-colors ${
              theme === "dark"
                ? "bg-slate-200 dark:bg-slate-800"
                : "hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
            title="Dark Mode"
          >
            <Moon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTheme("system")}
            className={`p-2 rounded-full transition-colors ${
              theme === "system"
                ? "bg-slate-200 dark:bg-slate-800"
                : "hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
            title="System Theme"
          >
            <Monitor className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-10 print:flex-col print:max-w-none print:w-full">
        {/* Controls Section (Hidden during print) */}
        <div className="flex-1 space-y-6 print:hidden h-max">
          {qrCodes.map((qr, index) => (
            <div
              key={qr.id}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8 relative"
            >
              {/* Delete button */}
              {qrCodes.length > 1 && (
                <button
                  onClick={() => removeQRCode(qr.id)}
                  className="absolute top-6 right-6 p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full transition-colors"
                  title="Remove this QR Code"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                  {index + 1}
                </div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  QR Settings
                </h2>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Target URL
                </label>
                <input
                  type="url"
                  value={qr.url}
                  onChange={(e) => updateQRCode(qr.id, "url", e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Custom Text Below QR
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      RTL
                    </span>
                    <button
                      onClick={() => updateQRCode(qr.id, "isRTL", !qr.isRTL)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        qr.isRTL ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          qr.isRTL ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <textarea
                  value={qr.customText}
                  onChange={(e) =>
                    updateQRCode(qr.id, "customText", e.target.value)
                  }
                  placeholder="Enter text here (Supports Arabic & English)"
                  rows={3}
                  dir={qr.isRTL ? "rtl" : "ltr"}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Text Size
                  </label>
                  <div className="flex bg-slate-100 dark:bg-slate-950 rounded-lg p-1">
                    {(["small", "medium", "large"] as FontSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => updateQRCode(qr.id, "fontSize", size)}
                        className={`flex-1 py-2 text-sm rounded-md capitalize transition-colors ${
                          qr.fontSize === size
                            ? "bg-white dark:bg-slate-800 shadow-sm font-medium text-indigo-600 dark:text-indigo-400"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Alignment
                  </label>
                  <div className="flex bg-slate-100 dark:bg-slate-950 rounded-lg p-1">
                    <button
                      onClick={() => updateQRCode(qr.id, "textAlign", "left")}
                      className={`flex-1 py-2 flex justify-center items-center rounded-md transition-colors ${
                        qr.textAlign === "left"
                          ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateQRCode(qr.id, "textAlign", "center")}
                      className={`flex-1 py-2 flex justify-center items-center rounded-md transition-colors ${
                        qr.textAlign === "center"
                          ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateQRCode(qr.id, "textAlign", "right")}
                      className={`flex-1 py-2 flex justify-center items-center rounded-md transition-colors ${
                        qr.textAlign === "right"
                          ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addQRCode}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold rounded-2xl hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Another QR Code</span>
          </button>
        </div>

        {/* Preview Section */}
        <div className="flex-1 flex flex-col items-center justify-start space-y-8 print:space-y-0 print:block print:m-0 print:p-0">
          <div className="relative group w-full print:static">
            {/* The exportable unified container */}
            <div
              ref={exportRef}
              className="flex flex-wrap items-center justify-center gap-8 p-8 print:flex print:flex-col print:items-center print:gap-4 print:p-0 print:m-0"
            >
              {qrCodes.map((qr) => (
                <div key={qr.id} className="flex flex-col items-center justify-center gap-6 print:gap-2 print:break-inside-avoid print:border-2 print:border-dashed print:border-slate-300 print:p-4 print:rounded-3xl print:w-[80%] mx-auto relative">
                  {/* Subtle Cut-out indicator */}
                  <div className="hidden print:block absolute -top-3 bg-white px-2 text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                    Cut Here
                  </div>
                  {/* QR Code Box */}
                  <div className="bg-white p-6 print:p-2 rounded-[2rem] print:rounded-xl shadow-2xl shadow-black/10 ring-1 ring-slate-900/5 print:shadow-none print:ring-0 print:border-2 print:border-slate-200 flex items-center justify-center w-max">
                    <div style={{ width: 290, height: 290 }} className="print:w-[160px] print:h-[160px]">
                      <QRCode
                        value={qr.url || "https://example.com"}
                        size={256}
                        fgColor="#0f172a"
                        bgColor="#ffffff"
                        level="Q"
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                  </div>

                  {/* Text Pill Box */}
                  {qr.customText && (
                    <div
                      dir={qr.isRTL ? "rtl" : "ltr"}
                      className={`w-max min-w-[340px] print:min-w-0 max-w-[500px] print:max-w-full bg-slate-100 print:bg-transparent rounded-2xl print:rounded-xl flex items-start gap-4 print:gap-2 p-5 print:p-3 font-arabic border border-slate-200 print:border-2 print:border-slate-200 shadow-xl shadow-black/5 print:shadow-none`}
                    >
                      <Scan className="w-6 h-6 print:w-4 print:h-4 text-slate-700 print:text-slate-500 flex-shrink-0 mt-0.5" />
                      <div
                        className={`text-slate-800 font-semibold w-full whitespace-pre-wrap print:text-xs ${getFontSizeClass(
                          qr.fontSize
                        )} ${getTextAlignClass(qr.textAlign)}`}
                      >
                        {qr.customText}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Hover Actions (Hidden during print) */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 print:hidden z-10">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-transform hover:scale-105"
              >
                <Printer className="w-4 h-4" />
                <span>Print All</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span>Export All as PNG</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-full shadow-lg transition-transform hover:scale-105"
              >
                <Copy className="w-4 h-4" />
                <span>Copy All</span>
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 print:hidden">
            Hover over the QR codes to print, export or copy them all together
          </p>
        </div>
      </main>
    </div>
  );
}
