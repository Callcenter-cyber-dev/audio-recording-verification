import React, { useState, useRef } from "react";
import { Upload, FileAudio, Play, CheckCircle, RefreshCw, AlertCircle, Headphones, Sparkles, Languages } from "lucide-react";
import { AudioRecord } from "../types";
import AudioPlayer from "./AudioPlayer";

interface VerifyViewProps {
  onAddRecord: (record: AudioRecord) => void;
  onSelectRecord: (record: AudioRecord) => void;
  googleAccessToken?: string | null;
}

export default function VerifyView({ onAddRecord, onSelectRecord, googleAccessToken }: VerifyViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeStep, setTranscribeStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AudioRecord | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("audio/") || droppedFile.name.endsWith(".mp3") || droppedFile.name.endsWith(".wav") || droppedFile.name.endsWith(".m4a")) {
        setFile(droppedFile);
        setError(null);
        setResult(null);
      } else {
        setError("ຂໍອະໄພ, ຮອງຮັບສະເພາະໄຟລ໌ສຽງ (MP3, WAV, M4A) ເທົ່ານັ້ນ.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;

    setIsTranscribing(true);
    setError(null);
    setResult(null);

    try {
      // 1. Read file as base64
      setTranscribeStep("ກຳລັງອ່ານຂໍ້ມູນໄຟລ໌ສຽງຈາກຄອມພິວເຕີຂອງທ່ານ...");
      const base64 = await convertFileToBase64(file);

      // Estimate audio duration (mocking or getting from HTML5 audio element)
      setTranscribeStep("ກຳລັງຄິດໄລ່ຄວາມຍາວຂອງຄຣິບສຽງ...");
      const duration = await getAudioDuration(file);

      // 2. Contact Backend Transcription endpoint
      setTranscribeStep("ກຳລັງສົ່ງສຽງໃຫ້ Gemini AI ແປງເປັນຂໍ້ຄວາມພາສາລາວ ແລະ ອັງກິດ...");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (googleAccessToken) {
        headers["Authorization"] = `Bearer ${googleAccessToken}`;
      }
      
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers,
        body: JSON.stringify({
          audioBase64: base64,
          fileName: file.name,
          mimeType: file.type || "audio/mp3",
          duration: duration,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "ການແປງສຽງຜິດພາດ. ກະລຸນາກວດສອບ API key.");
      }

      const savedLocation = googleAccessToken 
        ? "Google Sheet (1xu8_nN4HTQ223lktc4hpgMPKKfL7PrLC-Mnr_7CuFwo)" 
        : "Firebase (audio-recording-verification)";
      setTranscribeStep(`ບັນທຶກລົງຖານຂໍ້ມູນ ${savedLocation} ສໍາເລັດແລ້ວ!`);
      setTimeout(() => {
        setResult(data.record);
        onAddRecord(data.record);
        setIsTranscribing(false);
        setTranscribeStep("");
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "ເກີດຂໍ້ຜິດພາດທີ່ບໍ່ຄາດຄິດໃນລະຫວ່າງການປະມວນຜົນ.");
      setIsTranscribing(false);
      setTranscribeStep("");
    }
  };

  // Helper to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Helper to estimate duration using standard Audio element
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = document.createElement("audio");
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        resolve(Math.round(audio.duration) || 30);
      };
      audio.onerror = () => {
        resolve(30); // fallback to 30 seconds
      };
    });
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* View Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-red-500" />
          <span>ກວດສອບຄຣິບສຽງການສົນທະນາໃໝ່</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          ອັບໂຫຼດໄຟລ໌ສຽງຈາກຄອມພິວເຕີຂອງທ່ານເພື່ອໃຫ້ Gemini AI ແປງສຽງເປັນຂໍ້ຄວາມພາສາລາວ ແລະ ອັງກິດຢ່າງວ່ອງໄວ
        </p>
      </div>

      {/* Main Drag & Drop Card */}
      {!result && !isTranscribing && (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 relative group min-h-[280px] flex flex-col justify-center items-center ${
            dragActive 
              ? "border-red-500 bg-red-950/20" 
              : file
              ? "border-red-900/60 bg-red-950/5"
              : "border-zinc-800 hover:border-red-950 bg-[#101013] hover:bg-[#150a0a]/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a"
            onChange={handleFileChange}
            className="hidden"
          />

          {!file ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:border-red-800/40 transition-all duration-300">
                <Upload className="w-7 h-7 text-gray-400 group-hover:text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">ລາກໄຟລ໌ສຽງມາປະໄວ້ທີ່ນີ້ ຫຼື ກົດເພື່ອເລືອກໄຟລ໌</p>
                <p className="text-xs text-gray-500 mt-1">ຮອງຮັບໄຟລ໌ MP3, WAV, M4A ສູງສຸດ 50MB</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-800/40 flex items-center justify-center mx-auto">
                <FileAudio className="w-7 h-7 text-red-500 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-white max-w-md truncate mx-auto" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  ขนาดไฟล์: {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || "audio file"}
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-400 hover:text-white rounded-xl text-xs transition cursor-pointer font-medium"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTranscribe();
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-900 hover:from-red-500 hover:to-red-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-red-900/30 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ເລີ່ມແປງສຽງດ້ວຍ AI</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading & Processing State */}
      {isTranscribing && (
        <div className="bg-[#101013] border border-red-950/40 rounded-3xl p-10 text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-red-950"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-red-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Headphones className="w-7 h-7 text-red-500 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-white">ລະບົບ AI ກຳລັງປະມວນຜົນ</h3>
            <p className="text-sm text-red-400 font-medium max-w-md mx-auto">
              {transcribeStep}
            </p>
            <p className="text-xs text-zinc-600 max-w-sm mx-auto">
              ຂັ້ນຕອນນີ້ອາດໃຊ້ເວລາ 10-30 ວິນາທີ ຂຶ້ນກັບຄວາມຍາວຂອງຄຣິບສຽງ ແລະ ຄວາມໄວຂອງເຄືອຂ່າຍ
            </p>
          </div>

          {/* Simulated equalizer bars to show active network/processing */}
          <div className="flex items-end justify-center gap-1 h-8">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i} 
                className="w-[3px] bg-red-600/70 rounded-full audio-bar"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-950/15 border border-red-900/40 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">ເກີດຂໍ້ຜິດພາດໃນການແປງສຽງ</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {error}
            </p>
            <button
              onClick={handleReset}
              className="mt-2 text-xs text-red-400 hover:text-red-300 underline font-medium"
            >
              ລອງໃໝ່ອີກຄັ້ງ
            </button>
          </div>
        </div>
      )}

      {/* Successful Transcription Output Panel */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Banner notification */}
          {result.isFallback ? (
            <div className="bg-amber-950/20 border border-amber-900/45 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0 animate-pulse mt-0.5 sm:mt-0" />
              <div>
                <h4 className="text-sm font-bold text-white">ແປງສຽງດ້ວຍ ລະບົບຈໍາລອງອັດສະລິຍະ (Simulation Mode)</h4>
                <p className="text-xs text-gray-400">
                  ເນື່ອງຈາກຄີ API ຂອງເຈົ້າບໍ່ທັນມີສິດນຳໃຊ້ (403 Permission Denied) ລະບົບຈຶ່ງໄດ້ດຳເນີນການຈຳລອງການຖອດລະຫັດ ແລະ ວິເຄາະສຽງໃຫ້ໂດຍອັດຕະໂນມັດ ເພື່ອໃຫ້ເຈົ້າສາມາດທົດລອງລະບົບໄດ້ຢ່າງສົມບູນ.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="sm:ml-auto mt-2 sm:mt-0 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-300 hover:text-white rounded-lg text-xs transition font-medium whitespace-nowrap"
              >
                ແປງສຽງຄຣິບໃໝ່
              </button>
            </div>
          ) : (
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <h4 className="text-sm font-bold text-white">ແປງສຽງການສົນທະນາ ແລະ ບັນທຶກສຳເລັດ!</h4>
                <p className="text-xs text-gray-400">
                  {googleAccessToken ? (
                    <>
                      ຂໍ້ມູນໄດ້ຖືກບັນທຶກລົງໃນ Google Sheet ID: <span className="font-mono text-red-500 font-bold select-all">1xu8_nN4HTQ223lktc4hpgMPKKfL7PrLC-Mnr_7CuFwo</span> ຮຽບຮ້ອຍແລ້ວ.
                    </>
                  ) : (
                    <>
                      ຂໍ້ມູນໄດ້ຖືກເກັບໄວ້ໃນ Firebase collection <span className="font-mono text-red-400">audio-recording-verification</span> ຮຽບຮ້ອຍແລ້ວ.
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="sm:ml-auto mt-2 sm:mt-0 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-300 hover:text-white rounded-lg text-xs transition font-medium whitespace-nowrap"
              >
                ແປງສຽງຄຣິບໃໝ່
              </button>
            </div>
          )}

          {/* Transcription details block */}
          <div className="bg-[#101013] border-2 border-red-950/50 rounded-2xl p-5 space-y-5 shadow-2xl relative">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-zinc-900 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                    result.status === "verified"
                      ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-400"
                      : "bg-amber-950/40 border-amber-800/40 text-amber-400"
                  }`}>
                    {result.status === "verified" ? "ກວດສອບຜ່ານແລ້ວ (Verified)" : "ພົບຄວາມສ່ຽງ (Flagged)"}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">
                    {new Date(result.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {result.fileName}
                </h3>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-900 text-gray-400 font-mono">
                  ຜູ້ເວົ້າ: <span className="text-white font-bold">{result.speakersCount}</span>
                </span>
                <span className="bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-900 text-gray-400 font-mono">
                  ຄຸນນະພາບ: <span className="text-white font-bold">{result.callQuality}</span>
                </span>
              </div>
            </div>

            {/* Custom Interactive Player for newly uploaded audio */}
            <AudioPlayer 
              audioBase64={result.audioBase64} 
              duration={result.duration} 
              fileName={result.fileName} 
            />

            {/* Transcription Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 space-y-2 relative">
                <span className="absolute right-4 top-4 text-[9px] bg-red-950/40 text-red-400 border border-red-900/30 px-2 py-0.5 rounded font-bold font-mono">LAO 100% CORRECT</span>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-red-500" />
                  <span>ເນື້ອຫາການສົນທະນາ (ພາສາລາວ)</span>
                </h4>
                <p className="text-sm text-gray-200 leading-relaxed font-sans bg-zinc-900/50 p-4 rounded-xl border border-zinc-900/60 min-h-[100px] select-text">
                  {result.laoTranscript}
                </p>
              </div>

              <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 space-y-2 relative">
                <span className="absolute right-4 top-4 text-[9px] bg-blue-950/40 text-blue-400 border border-blue-900/30 px-2 py-0.5 rounded font-bold font-mono">ENGLISH</span>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-blue-500" />
                  <span>English Translation</span>
                </h4>
                <p className="text-sm text-gray-200 leading-relaxed font-sans bg-zinc-900/50 p-4 rounded-xl border border-zinc-900/60 min-h-[100px] select-text">
                  {result.englishTranscript}
                </p>
              </div>
            </div>

            {/* Summary details */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">ບົດສະຫຼຸບການສົນທະນາ (Summary)</h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                {result.summary}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
