import React, { useState } from "react";
import { AudioRecord } from "../types";
import AudioPlayer from "./AudioPlayer";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  Users, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  Activity,
  FileText,
  Volume2,
  X
} from "lucide-react";

interface RecordsViewProps {
  records: AudioRecord[];
  onRefresh: () => void;
  onDeleteRecord: (id: string) => void;
  isLoading: boolean;
  selectedRecord: AudioRecord | null;
  setSelectedRecord: (record: AudioRecord | null) => void;
}

export default function RecordsView({
  records,
  onRefresh,
  onDeleteRecord,
  isLoading,
  selectedRecord,
  setSelectedRecord
}: RecordsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "flagged" | "review">("all");
  const [recordToDelete, setRecordToDelete] = useState<AudioRecord | null>(null);

  const filteredRecords = records.filter(r => {
    // 1. Search filter
    const matchesSearch = 
      r.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.laoTranscript.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.englishTranscript.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Status filter
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Premium Custom Deletion Confirmation Modal */}
      <AnimatePresence>
        {recordToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRecordToDelete(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              className="relative bg-zinc-950 border border-red-950/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 overflow-hidden border-t-red-500/30"
            >
              {/* Top ambient red gradient */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
              
              {/* Content Header */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-red-950/40 border border-red-800/30 flex items-center justify-center shrink-0 text-red-500 shadow-inner">
                  <AlertTriangle className="w-5.5 h-5.5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-white font-sans">
                    ຢືນຢັນການລົບຄຣິບສຽງ
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບຄຣິບສຽງນີ້? ຂໍ້ມູນ ແລະ ປະຫວັດການກວດສອບທັງໝົດຈະຖືກລົບອອກຈາກລະບົບຢ່າງຖາວອນ ແລະ ບໍ່ສາມາດກູ້ຄືນໄດ້.
                  </p>
                </div>
              </div>

              {/* Clip Details */}
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3.5 space-y-1.5">
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">ຊື່ໄຟລ໌ສຽງ (AUDIO FILE)</div>
                <div className="text-xs font-semibold text-red-400 truncate select-all">
                  {recordToDelete.fileName}
                </div>
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-zinc-900/50 text-[10px] text-zinc-500 font-sans">
                  <span>ວັນທີບັນທຶກ: {new Date(recordToDelete.createdAt).toLocaleDateString("la-LA")}</span>
                  <span>ຄວາມຍາວ: {recordToDelete.duration} ວິນາທີ</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  onClick={() => setRecordToDelete(null)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white border border-zinc-800 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>ຍົກເລີກ</span>
                </button>
                <button
                  onClick={() => {
                    onDeleteRecord(recordToDelete.id);
                    setRecordToDelete(null);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-900 hover:from-red-500 hover:to-red-800 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/50 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ຢືນຢັນລົບຂໍ້ມູນ</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            <span>ລາຍການຄຣິບສຽງທີ່ກວດສອບແລ້ວ</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            ຈັດການ, ຄົ້ນຫາ, ລົບຂໍ້ມູນ ແລະ ຟັງຄຣິບສຽງການສົນທະນາທັງໝົດໃນລະບົບ
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-300 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-red-500" : ""}`} />
          <span>ໂຫຼດຄືນໃໝ່ (Refresh)</span>
        </button>
      </div>

      {/* Active Selection Details Card */}
      {selectedRecord && (
        <div className="bg-[#101013] border-2 border-red-950/60 rounded-2xl p-5 space-y-5 shadow-2xl relative animate-fade-in">
          <button 
            onClick={() => setSelectedRecord(null)}
            className="absolute right-4 top-4 p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-400 hover:text-white rounded-lg transition"
            title="ປິດໜ້າຕ່າງນີ້"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-zinc-900 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                  selectedRecord.status === "verified"
                    ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-400"
                    : selectedRecord.status === "flagged"
                    ? "bg-amber-950/40 border-amber-800/50 text-amber-400"
                    : "bg-red-950/40 border-red-800/40 text-red-400"
                }`}>
                  {selectedRecord.status === "verified" ? "ກວດສອບຜ່ານແລ້ວ (Verified)" : selectedRecord.status === "flagged" ? "ພົບຄວາມສ່ຽງ (Flagged)" : "ລໍຖ້າກວດສອບ (Review)"}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  {new Date(selectedRecord.createdAt).toLocaleString("la-LA", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-2 truncate max-w-xl">
                {selectedRecord.fileName}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <div className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-red-500" />
                <span className="text-gray-400">ຈຳນວນຜູ້ເວົ້າ:</span>
                <span className="font-bold text-white font-mono">{selectedRecord.speakersCount}</span>
              </div>
              <div className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-900 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-red-500" />
                <span className="text-gray-400">ຄຸນນະພາບສຽງ:</span>
                <span className="font-bold text-white">{selectedRecord.callQuality}</span>
              </div>
              <div className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-900 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-red-500" />
                <span className="text-gray-400">ໂທນສຽງ:</span>
                <span className="font-bold text-white">{selectedRecord.tone}</span>
              </div>
            </div>
          </div>

          {/* Premium custom audio player widget */}
          <AudioPlayer 
            audioUrl={selectedRecord.audioUrl} 
            audioBase64={selectedRecord.audioBase64} 
            duration={selectedRecord.duration} 
            fileName={selectedRecord.fileName} 
          />

          {/* Transcript columns side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Lao transcript card */}
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 space-y-3 relative group">
              <div className="absolute right-4 top-4 text-[10px] font-bold text-red-500/60 uppercase font-mono tracking-wider">
                Lao Transcript (100% Correct)
              </div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                <span>ເນື້ອຫາການສົນທະນາ (ພາສາລາວ)</span>
              </h4>
              <p className="text-sm text-gray-200 leading-relaxed font-sans bg-zinc-900/40 p-4 rounded-xl border border-zinc-900/50 min-h-[120px] whitespace-pre-wrap select-text">
                {selectedRecord.laoTranscript}
              </p>
            </div>

            {/* English transcript card */}
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 space-y-3 relative group">
              <div className="absolute right-4 top-4 text-[10px] font-bold text-blue-500/60 uppercase font-mono tracking-wider">
                English Translation
              </div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                <span>English Transcript & Translation</span>
              </h4>
              <p className="text-sm text-gray-200 leading-relaxed font-sans bg-zinc-900/40 p-4 rounded-xl border border-zinc-900/50 min-h-[120px] whitespace-pre-wrap select-text">
                {selectedRecord.englishTranscript}
              </p>
            </div>
          </div>

          {/* Summary and Keywords bar */}
          <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-900 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                ບົດສະຫຼຸບການສົນທະນາ (Summary)
              </h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                {selectedRecord.summary}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-900">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">ຄຳສຳຄັນ:</span>
              {selectedRecord.keywords.map((kw, idx) => (
                <span 
                  key={idx} 
                  className="text-[10px] bg-red-950/20 text-red-400 border border-red-900/30 px-2.5 py-0.5 rounded-lg font-mono"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="bg-[#101013] border border-zinc-900 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Status Tab buttons */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "ທັງໝົດ" },
            { id: "verified", label: "ກວດສອບຜ່ານ" },
            { id: "flagged", label: "ພົບຄວາມສ່ຽງ" },
            { id: "review", label: "ລໍຖ້າກວດສອບ" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-red-900/30 border border-red-800/40 text-red-400"
                  : "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/40 text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input field */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="ຄົ້ນຫາຕາມຊື່ໄຟລ໌, ເນື້ອຫາ ຫຼື ຄຳສຳຄັນ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs bg-zinc-950 border border-zinc-900 rounded-xl focus:border-red-600 focus:outline-none text-white font-sans transition"
          />
        </div>
      </div>

      {/* Records table list */}
      <div className="bg-[#101013] border border-zinc-900 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950 text-gray-400 text-[11px] font-mono uppercase tracking-wider">
                <th className="py-4 px-5">ລາຍລະອຽດໄຟລ໌ (File Details)</th>
                <th className="py-4 px-4">ວັນທີບັນທຶກ (Date)</th>
                <th className="py-4 px-4 text-center">ຜູ້ເວົ້າ (Speakers)</th>
                <th className="py-4 px-4">ຄຳສຳຄັນ (Keywords)</th>
                <th className="py-4 px-4 text-center">ສະຖານະ (Status)</th>
                <th className="py-4 px-5 text-right">ຈັດການ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60 text-sm">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-600">
                    <Search className="w-8 h-8 mx-auto text-zinc-700 mb-2" />
                    <p className="text-sm font-medium">ບໍ່ພົບຂໍ້ມູນຕາມເງື່ອນໄຂ</p>
                    <p className="text-xs text-zinc-700 mt-1">ລອງປ່ຽນຕົວກັ່ນຕອງ ຫຼື ຄຳຄົ້ນຫາ</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const badgeColor = 
                    record.status === "verified"
                      ? "bg-emerald-950/30 border-emerald-800/30 text-emerald-400"
                      : record.status === "flagged"
                      ? "bg-amber-950/30 border-amber-800/40 text-amber-400"
                      : "bg-red-950/30 border-red-800/30 text-red-400";

                  const badgeText = 
                    record.status === "verified" ? "ກວດສອບຜ່ານ" : record.status === "flagged" ? "ພົບຄວາມສ່ຽງ" : "ລໍຖ້າກວດສອບ";

                  const isSelected = selectedRecord?.id === record.id;

                  return (
                    <tr 
                      key={record.id}
                      className={`hover:bg-[#150a0a]/10 transition-colors cursor-pointer group ${
                        isSelected ? "bg-[#250d0d]/20" : ""
                      }`}
                      onClick={() => setSelectedRecord(record)}
                    >
                      {/* File Details */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center border ${
                            isSelected ? "bg-red-950/40 border-red-800/40" : "bg-zinc-900 border-zinc-800"
                          }`}>
                            <Volume2 className={`w-4 h-4 ${isSelected ? "text-red-500 animate-pulse" : "text-gray-400"}`} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-white group-hover:text-red-400 transition-colors block truncate max-w-[200px]">
                              {record.fileName}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                              {record.duration} ວິນາທີ ({Math.round(record.duration / 60)}m {record.duration % 60}s)
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs text-zinc-400 font-mono">
                        {new Date(record.createdAt).toLocaleDateString("la-LA", { month: "short", day: "numeric" })} {new Date(record.createdAt).toLocaleTimeString("la-LA", { hour: "2-digit", minute: "2-digit" })}
                      </td>

                      {/* Speakers count */}
                      <td className="py-4 px-4 text-center font-mono text-xs text-white">
                        <span className="bg-zinc-950 border border-zinc-900 px-2.5 py-1 rounded-lg">
                          {record.speakersCount}
                        </span>
                      </td>

                      {/* Keywords */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {record.keywords.slice(0, 3).map((kw, i) => (
                            <span key={i} className="text-[9px] bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-4 text-center">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold ${badgeColor}`}>
                          {badgeText}
                        </span>
                      </td>

                      {/* Delete / Actions */}
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            title="ເບິ່ງລາຍລະອຽດ"
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRecordToDelete(record)}
                            title="ລົບຂໍ້ມູນ"
                            className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-950/20 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
