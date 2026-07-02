import React, { useState } from "react";
import { AudioRecord } from "../types";
import { 
  Play, 
  Search, 
  RefreshCw, 
  Clock, 
  FileAudio, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp,
  Radio,
  ExternalLink,
  PhoneCall
} from "lucide-react";

interface DashboardViewProps {
  records: AudioRecord[];
  onRefresh: () => void;
  isLoading: boolean;
  onSelectRecord: (record: AudioRecord) => void;
  onNavigateToVerify: () => void;
}

export default function DashboardView({ 
  records, 
  onRefresh, 
  isLoading, 
  onSelectRecord,
  onNavigateToVerify
}: DashboardViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Quick stats calculation
  const total = records.length;
  const verified = records.filter(r => r.status === "verified").length;
  const flagged = records.filter(r => r.status === "flagged").length;
  const review = records.filter(r => r.status === "review").length;
  const avgDuration = total > 0 
    ? Math.round(records.reduce((acc, r) => acc + r.duration, 0) / total) 
    : 0;

  // Filter recent recordings based on search term
  const filteredRecords = records.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      r.fileName.toLowerCase().includes(term) ||
      r.laoTranscript.toLowerCase().includes(term) ||
      r.englishTranscript.toLowerCase().includes(term) ||
      r.summary.toLowerCase().includes(term) ||
      r.keywords.some(k => k.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-br from-[#170808] to-[#0c0c0e] p-6 rounded-2xl border border-red-950/30">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-red-500 bg-red-950/40 px-2.5 py-1 rounded-full border border-red-900/40">
            TPLUS Call Center QA Automation
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight mt-2.5">
            ລະບົບກວດສອບ ຄຣິບສຽງການສົນທະນາ
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            ແປງສຽງສົນທະນາເປັນຂໍ້ຄວາມພາສາລາວ ແລະ ພາສາອັງກິດດ້ວຍ AI ລະດັບພີມ່ຽມ ຄວາມຖືກຕ້ອງສູງສຸດ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-300 hover:text-white transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-red-500" : ""}`} />
            <span>ຣີເຟຣຊ (Refresh)</span>
          </button>
          <button
            onClick={onNavigateToVerify}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30 transition cursor-pointer"
          >
            <FileAudio className="w-3.5 h-3.5 animate-pulse" />
            <span>ກວດສອບຄຣິບໃໝ່</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="bg-[#121215] border border-red-950/20 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute right-3 top-3 opacity-15 group-hover:scale-110 group-hover:opacity-25 transition-transform duration-300 text-red-500">
            <Radio className="w-12 h-12" />
          </div>
          <span className="text-xs text-gray-400 font-medium">ຄຣິບສຽງທັງໝົດ (Total Records)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white font-mono">{total}</span>
            <span className="text-xs text-red-500 font-bold font-mono">ສາຍໂທ</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-red-500" />
            <span>ອັບເດດແລ້ວໃນປະຈຸບັນ</span>
          </div>
        </div>

        {/* Verified Card */}
        <div className="bg-[#121215] border border-red-950/20 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute right-3 top-3 opacity-15 group-hover:scale-110 group-hover:opacity-25 transition-transform duration-300 text-emerald-500">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <span className="text-xs text-gray-400 font-medium">ກວດສອບຜ່ານ (Verified 100%)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">{verified}</span>
            <span className="text-xs text-emerald-500 font-bold font-mono">({total > 0 ? Math.round((verified / total) * 100) : 0}%)</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span>ຖືກຕ້ອງ ແລະ ປອດໄພ</span>
          </div>
        </div>

        {/* Flagged Card */}
        <div className="bg-[#121215] border border-red-950/20 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute right-3 top-3 opacity-15 group-hover:scale-110 group-hover:opacity-25 transition-transform duration-300 text-amber-500">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <span className="text-xs text-gray-400 font-medium">ພົບຄວາມສ່ຽງ (Flagged/Scam)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-500 font-mono">{flagged}</span>
            <span className="text-xs text-amber-500 font-bold font-mono">({total > 0 ? Math.round((flagged / total) * 100) : 0}%)</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            <span>ສາຍທີ່ຄວນກວດກາຄືນ</span>
          </div>
        </div>

        {/* Average Duration Card */}
        <div className="bg-[#121215] border border-red-950/20 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute right-3 top-3 opacity-15 group-hover:scale-110 group-hover:opacity-25 transition-transform duration-300 text-red-500">
            <Clock className="w-12 h-12" />
          </div>
          <span className="text-xs text-gray-400 font-medium">ສະເລ່ຍເວລາ (Avg. Duration)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white font-mono">{avgDuration}</span>
            <span className="text-xs text-red-400 font-bold font-mono">ວິນາທີ</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
            <PhoneCall className="w-3.5 h-3.5 text-zinc-500" />
            <span>ຄຸນນະພາບສຽງດີຫຼາຍ</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Feed & Quick Info */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Log Records Feed */}
        <div className="xl:col-span-2 bg-[#101013] border border-zinc-900 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4.5 h-4.5 text-red-500 animate-pulse" />
                <span>ລາຍການກວດສອບຫຼ້າສຸດ (Recent Audited Logs)</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                ຄົ້ນຫາ ແລະ ກັ່ນຕອງຄຣິບສຽງການສົນທະນາ Call Center ໄດ້ຢ່າງວ່ອງໄວ
              </p>
            </div>
            
            {/* Search Input bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="ຄົ້ນຫາຄຣິບສຽງ ຫຼື ເນື້ອຫາ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 w-full sm:w-60 text-xs bg-zinc-950 border border-zinc-800 rounded-xl focus:border-red-600 focus:outline-none text-white font-sans transition"
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredRecords.length === 0 ? (
              <div className="py-12 text-center text-zinc-600 border border-dashed border-zinc-900 rounded-xl">
                <Search className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
                <p className="text-sm">ບໍ່ພົບຂໍ້ມູນທີ່ທ່ານຄົ້ນຫາ</p>
                <p className="text-xs text-zinc-700 mt-1">ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ອັບໂຫຼດຄຣິບສຽງໃໝ່</p>
              </div>
            ) : (
              filteredRecords.map((record) => {
                const badgeColor = 
                  record.status === "verified" 
                    ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-400" 
                    : record.status === "flagged"
                    ? "bg-amber-950/40 border-amber-800/50 text-amber-400"
                    : "bg-red-950/40 border-red-800/40 text-red-400";

                const badgeText = 
                  record.status === "verified" 
                    ? "ກວດສອບຜ່ານ" 
                    : record.status === "flagged" 
                    ? "ພົບຄວາມສ່ຽງ" 
                    : "ລໍຖ້າກວດສອບ";

                return (
                  <div
                    key={record.id}
                    onClick={() => onSelectRecord(record)}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-zinc-950 hover:bg-[#150a0a]/40 border border-zinc-900 hover:border-red-950/30 rounded-xl transition-all duration-200 cursor-pointer group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeColor} font-bold`}>
                          {badgeText}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(record.createdAt).toLocaleTimeString("la-LA", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-[10px] text-gray-600 font-mono hidden sm:inline">
                          • {record.duration} ວິນາທີ
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                        {record.fileName}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {record.laoTranscript}
                      </p>
                    </div>

                    <div className="flex items-center gap-3.5 mt-3 sm:mt-0">
                      <div className="flex flex-wrap gap-1">
                        {record.keywords.slice(0, 2).map((kw, i) => (
                          <span key={i} className="text-[9px] bg-zinc-900 text-gray-400 px-1.5 py-0.5 rounded font-mono">
                            #{kw}
                          </span>
                        ))}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 group-hover:bg-red-950/40 flex items-center justify-center transition-colors">
                        <Play className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 fill-current" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: System Notice & Info Widget */}
        <div className="space-y-4">
          {/* Quick Upload Promotion Info Box */}
          <div className="bg-gradient-to-br from-[#1d0d0d] to-[#0f0a0a] border border-red-950/40 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-red-400 flex items-center gap-1.5">
              <PhoneCall className="w-4.5 h-4.5 text-red-500 animate-bounce" />
              <span>TPLUS Call Center 123</span>
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              ລະບົບກວດສອບສຽງການສົນທະນານີ້ ຖືກອອກແບບມາເພື່ອຍົກສູງຄຸນນະພາບການບໍລິການຂອງ Call Center 123 ໃຫ້ໄດ້ມາດຕະຖານສູງສຸດ. ໂດຍການແປງສຽງເປັນຂໍ້ຄວາມ ແລະ ກວດສອບຄວາມສ່ຽງດ້ວຍ AI.
            </p>
            <div className="border-t border-red-950/50 pt-3 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">ພາສາທີ່ຮອງຮັບ:</span>
                <span className="text-gray-300 font-semibold">ລາວ & ອັງກິດ</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">ລະດັບຄວາມຖືກຕ້ອງ:</span>
                <span className="text-emerald-400 font-semibold">100% Verbatim</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">ພັດທະນາໂດຍ:</span>
                <span className="text-red-400 font-semibold">Latsamy Phanthaboun</span>
              </div>
            </div>
            <button
              onClick={onNavigateToVerify}
              className="w-full py-2 bg-gradient-to-r from-red-600 to-red-900 hover:from-red-500 hover:to-red-800 text-white font-medium text-xs rounded-xl shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>ອັບໂຫຼດຄຣິບສຽງທົດສອບ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick tips */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">ຄຳແນະນຳໃນການໃຊ້ງານ</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>ທ່ານສາມາດອັບໂຫຼດໄຟລ໌ສຽງ MP3, WAV, M4A ທີ່ບັນທຶກຈາກຄອມພິວເຕີໄດ້ໂດຍກົງ.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>ລະບົບ AI ຈະປະມວນຜົນ ແລະ ສະແດງຜົນການວິເຄາະທັງໝົດແບບລະອຽດ.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>ກົດປຸ່ມ Refresh ດ້ານເທິງເພື່ອດຶງຂໍ້ມູນຫຼ້າສຸດຈາກຖານຂໍ້ມູນ Firebase.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
