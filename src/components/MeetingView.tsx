import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  Square, 
  Trash2, 
  Sparkles, 
  Clock, 
  FileSpreadsheet, 
  Languages, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Download, 
  Play, 
  Volume2,
  ListCollapse,
  Activity,
  UserCheck,
  RotateCcw
} from "lucide-react";
import { MeetingRecord } from "../types";
import { db } from "../utils/auth";
import { collection, getDocs, query, orderBy, doc, setDoc, deleteDoc } from "firebase/firestore";

interface MeetingViewProps {
  googleAccessToken: string | null;
}

export default function MeetingView({ googleAccessToken }: MeetingViewProps) {
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [topic, setTopic] = useState("");
  
  // Real-time speech transcription state
  const [realtimeLaoText, setRealtimeLaoText] = useState("");
  const [realtimeEngText, setRealtimeEngText] = useState("");
  const [activeSpeechLang, setActiveSpeechLang] = useState<"lo" | "en">("lo");
  
  // Final transcription result from Gemini
  const [result, setResult] = useState<MeetingRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Fetch meeting records
  const fetchMeetings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // If no Google Sheet token is present, load from Firestore "audio-recording-verification-meetings"
      if (!googleAccessToken) {
        try {
          const q = query(collection(db, "audio-recording-verification-meetings"), orderBy("createdAt", "desc"));
          const querySnapshot = await getDocs(q);
          const fbMeetings: MeetingRecord[] = [];
          querySnapshot.forEach((docSnap) => {
            fbMeetings.push({ id: docSnap.id, ...docSnap.data() } as MeetingRecord);
          });
          
          if (fbMeetings.length > 0) {
            setMeetings(fbMeetings);
            setIsLoading(false);
            return;
          }
        } catch (fbErr: any) {
          console.warn("Failed to load meetings from Cloud Firestore, falling back to local memory:", fbErr.message);
        }
      }

      const headers: HeadersInit = {};
      if (googleAccessToken) {
        headers["Authorization"] = `Bearer ${googleAccessToken}`;
      }
      const response = await fetch("/api/meetings", { headers });
      const data = await response.json();
      if (data.success) {
        setMeetings(data.records);
      } else {
        throw new Error(data.error || "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນບັນທຶກກອງປະຊຸມໄດ້");
      }
    } catch (err: any) {
      console.warn("Failed to fetch meetings from API, utilizing state fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [googleAccessToken]);

  // Handle seconds timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Format time (MM:SS)
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Start Real-Time speech transcription & audio capture
  const startRecording = async () => {
    setError(null);
    setResult(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);
    setRealtimeLaoText("");
    setRealtimeEngText("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine recorder support
      let options = {};
      if (MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/webm" };
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        options = { mimeType: "audio/mp4" };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        processAudioAndTranscript();
      };

      mediaRecorder.start(200); // chunk every 200ms
      setIsRecording(true);

      // Try browser Web Speech API for real-time visual feedback
      startWebSpeechRecognition();

    } catch (err: any) {
      console.error("Microphone access failed", err);
      setError("ບໍ່ສາມາດເຂົ້າເຖິງໄມໂຄຣໂຟນຂອງທ່ານໄດ້. ກະລຸນາອະນຸຍາດສິດການໃຊ້ງານໄມ.");
    }
  };

  // Browser real-time speech recognizer
  const startWebSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech Recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      // Select appropriate speech locale
      recognition.lang = activeSpeechLang === "lo" ? "lo-LA" : "en-US";

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const fullText = finalTranscript || interimTranscript;
        if (activeSpeechLang === "lo") {
          setRealtimeLaoText(fullText);
          // Simple client-side pseudo-translation for dynamic real-time English feel
          if (fullText && finalTranscript) {
            translateRealtimeText(fullText, "en");
          }
        } else {
          setRealtimeEngText(fullText);
          if (fullText && finalTranscript) {
            translateRealtimeText(fullText, "lo");
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition issue:", event.error);
      };

      recognition.onend = () => {
        if (isRecording) {
          try {
            recognition.start(); // restart if still recording
          } catch (e) {}
        }
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Could not initiate Speech Recognition:", e);
    }
  };

  // Helper: Simulates translation of real-time speech triggers
  const translateRealtimeText = async (text: string, targetLang: string) => {
    // Just a quick placeholder so that something loads instantly while speaking
    // Real complete transcription and translations will be done by Gemini AI on stop
    if (targetLang === "en") {
      setRealtimeEngText(prev => prev || "Translating real-time... " + text.slice(0, 10));
    } else {
      setRealtimeLaoText(prev => prev || "ກຳລັງແປຄຳເວົ້າ... " + text.slice(0, 10));
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
    }
  };

  // Process the recorded audio and send to Gemini
  const processAudioAndTranscript = async () => {
    setIsProcessing(true);
    setError(null);
    setProcessingStep("ກຳລັງກວດສອບຄວາມຍາວ ແລະ ປະມວນຜົນໄຟລ໌ສຽງ...");

    try {
      // Create blob from audio chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const duration = recordingSeconds;

      // Convert audio blob to base64
      setProcessingStep("ກຳລັງແປງໄຟລ໌ສຽງກອງປະຊຸມເປັນ Base64...");
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        setProcessingStep("ກຳລັງສົ່ງຂໍ້ມູນໃຫ້ Gemini AI ຖອດສຽງ ແລະ ແປພາສາລາວ-ອັງກິດ...");
        
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (googleAccessToken) {
          headers["Authorization"] = `Bearer ${googleAccessToken}`;
        }

        const response = await fetch("/api/transcribe-meeting", {
          method: "POST",
          headers,
          body: JSON.stringify({
            audioBase64: base64data,
            topic: topic.trim() || "ກອງປະຊຸມປຶກສາຫາລືທົ່ວໄປ",
            duration: duration || 10,
            mimeType: "audio/webm"
          })
        });

        const data = await response.json();
        if (data.success) {
          // If no Google Sheet token is present, save to Firestore "audio-recording-verification-meetings"
          if (!googleAccessToken) {
            try {
              await setDoc(doc(db, "audio-recording-verification-meetings", data.record.id), data.record);
            } catch (fbErr: any) {
              console.warn("Failed to save meeting to Cloud Firestore:", fbErr.message);
            }
          }

          setResult(data.record);
          setMeetings(prev => [data.record, ...prev]);
          setTopic("");
          setProcessingStep(googleAccessToken ? "ບັນທຶກລົງຊີດ 'ບັນທຶກສຽງກອງປະຊຸມ' ຮຽບຮ້ອຍແລ້ວ!" : "ບັນທຶກລົງຖານຂໍ້ມູນ Firebase ຮຽບຮ້ອຍແລ້ວ!");
          
          setTimeout(() => {
            setIsProcessing(false);
            setProcessingStep("");
          }, 1500);
        } else {
          throw new Error(data.error || "ການປະມວນຜົນຜິດພາດ");
        }
      };

    } catch (err: any) {
      console.error(err);
      setError(err.message || "ເກີດຂໍ້ຜິດພາດໃນການຖອດສຽງກອງປະຊຸມ");
      setIsProcessing(false);
    }
  };

  // Handle deletion of a meeting record
  const handleDeleteMeeting = async (id: string) => {
    if (!confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບບັນທຶກກອງປະຊຸມນີ້?")) return;
    
    try {
      // If no Google Sheet token is present, delete from Cloud Firestore
      if (!googleAccessToken) {
        try {
          await deleteDoc(doc(db, "audio-recording-verification-meetings", id));
        } catch (fbErr: any) {
          console.warn("Failed to delete meeting from Firestore:", fbErr.message);
        }
      }

      const headers: HeadersInit = {};
      if (googleAccessToken) {
        headers["Authorization"] = `Bearer ${googleAccessToken}`;
      }
      const response = await fetch(`/api/meetings/${id}`, {
        method: "DELETE",
        headers
      });
      if (response.ok) {
        setMeetings(prev => prev.filter(m => m.id !== id));
        if (result?.id === id) setResult(null);
      }
    } catch (err) {
      console.error("Failed to delete meeting note:", err);
      // fallback delete
      setMeetings(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleResetForm = () => {
    setResult(null);
    setError(null);
    setRealtimeLaoText("");
    setRealtimeEngText("");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Mic className="w-6 h-6 text-red-500 animate-pulse" />
            <span>ບັນທຶກສຽງກອງປະຊຸມ (Meeting Voice Notes)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            ບັນທຶກສຽງປະຊຸມ ແລະ ຖອດສຽງອອກມາເປັນພາສາລາວ ແລະ ອັງກິດແບບລຽວທາມ ພ້ອມບັນທຶກລົງໃນ Google Sheet <span className="text-red-400 font-bold">"ບັນທຶກສຽງກອງປະຊຸມ"</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border ${
            googleAccessToken 
              ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-400" 
              : "bg-red-950/20 border-red-900/20 text-red-400"
          }`}>
            <FileSpreadsheet className="w-4 h-4" />
            {googleAccessToken ? "ເຊື່ອມຕໍ່ Google Sheets ແລ້ວ" : "ບັນທຶກໃນ Firebase ໂໝດທົດລອງ"}
          </span>
        </div>
      </div>

      {/* Main Recorder Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Active recording panel */}
        <div className="lg:col-span-7 bg-[#101013] border border-red-950/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/5 rounded-full blur-3xl -z-10" />

          {/* Meeting Title Input */}
          {!isRecording && !result && !isProcessing && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                ຫົວຂໍ້ກອງປະຊຸມ (Meeting Topic)
              </label>
              <input
                type="text"
                placeholder="ປ້ອນຫົວຂໍ້ກອງປະຊຸມ (ເຊັ່ນ: ປະຊຸມປະຈໍາເດືອນ, ປຶກສາຫາລືເຕັກນິກ...)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 focus:border-red-800 focus:ring-1 focus:ring-red-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 transition"
              />
            </div>
          )}

          {/* Recorder Controls */}
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-5">
            {isRecording ? (
              <>
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Decorative pinging ripples */}
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-600/10 animate-ping opacity-75" />
                  <span className="absolute inline-flex h-[80%] w-[80%] rounded-full bg-red-600/20 animate-pulse" />
                  <button
                    onClick={stopRecording}
                    className="relative w-20 h-20 bg-gradient-to-br from-red-600 to-red-900 hover:from-red-500 hover:to-red-800 rounded-full flex items-center justify-center shadow-lg shadow-red-900/40 text-white cursor-pointer group transition-all duration-300"
                  >
                    <Square className="w-7 h-7 text-white fill-white group-hover:scale-95 transition" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-bold font-mono text-white tracking-widest flex items-center gap-2 justify-center">
                    <Clock className="w-5 h-5 text-red-500 animate-spin" />
                    <span>{formatTime(recordingSeconds)}</span>
                  </div>
                  <p className="text-xs text-red-400 font-medium animate-pulse">
                    ກຳລັງບັນທຶກສຽງກອງປະຊຸມ...
                  </p>
                </div>

                {/* Real-time language selector */}
                <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-900 flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500 px-2 font-mono">Real-time Speech Lang:</span>
                  <button
                    onClick={() => {
                      setActiveSpeechLang("lo");
                      if (isRecording) {
                        try {
                          speechRecognitionRef.current?.stop();
                        } catch (e) {}
                      }
                    }}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      activeSpeechLang === "lo" 
                        ? "bg-red-950/50 border border-red-800/40 text-red-400" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    ພາສາລາວ
                  </button>
                  <button
                    onClick={() => {
                      setActiveSpeechLang("en");
                      if (isRecording) {
                        try {
                          speechRecognitionRef.current?.stop();
                        } catch (e) {}
                      }
                    }}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      activeSpeechLang === "en" 
                        ? "bg-blue-950/50 border border-blue-800/40 text-blue-400" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    English
                  </button>
                </div>

                {/* Aesthetic waveform visualizer */}
                <div className="flex items-end justify-center gap-1.5 h-10 w-full max-w-sm pt-2">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-[3px] bg-red-600 rounded-full animate-audio-wave"
                      style={{ 
                        animationDelay: `${i * 0.08}s`,
                        height: `${Math.floor(Math.random() * 32) + 8}px`
                      }}
                    />
                  ))}
                </div>
              </>
            ) : result ? (
              <div className="space-y-4 w-full">
                <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">ຖອດສຽງກອງປະຊຸມສຳເລັດແລ້ວ!</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    ຂໍ້ມູນໄດ້ຖືກປະມວນຜົນ ແລະ ບັນທຶກລົງໃນ Google Sheets ຂອງລະບົບຮຽບຮ້ອຍແລ້ວ
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={handleResetForm}
                    className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-xl text-xs font-semibold text-gray-300 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ບັນທຶກສຽງກອງປະຊຸມໃຫມ່</span>
                  </button>
                </div>
              </div>
            ) : isProcessing ? (
              <div className="space-y-5 py-6">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-red-950"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-red-600 animate-spin"></div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Gemini AI ກຳລັງປະມວນຜົນ</h4>
                  <p className="text-xs text-red-400 font-mono mt-1.5 animate-pulse">
                    {processingStep}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <button
                  onClick={startRecording}
                  disabled={isProcessing}
                  className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-900 hover:from-red-500 hover:to-red-800 rounded-full flex items-center justify-center shadow-lg shadow-red-900/40 border-2 border-red-950 hover:scale-105 transition duration-300 group cursor-pointer"
                >
                  <Mic className="w-9 h-9 text-white group-hover:scale-110 transition duration-300" />
                </button>
                <div>
                  <h4 className="text-sm font-bold text-white">ກົດປຸ່ມເພື່ອເລີ່ມບັນທຶກສຽງປະຊຸມ</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    ລະບົບຈະທຳການແປງຄຳເວົ້າຂອງທ່ານເປັນພາສາລາວ ແລະ ພາສາອັງກິດແບບລຽວທາມ ແລະ ໃຊ້ Gemini AI ສ້າງບົດສະຫຼຸບກອງປະຊຸມໃຫ້ໂດຍອັດຕະໂນມັດ
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Real-time transcription preview screen (SpeechToText Box) */}
          {(isRecording || realtimeLaoText || realtimeEngText) && (
            <div className="bg-zinc-950 rounded-2xl border border-zinc-900 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <h5 className="text-xs font-bold text-gray-400 flex items-center gap-1.5 uppercase font-mono">
                  <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span>Real-time Transcription Box (ແບບລຽວທາມ)</span>
                </h5>
                <span className="text-[10px] font-mono bg-zinc-900 px-2 py-0.5 rounded text-gray-500">
                  WEB SPEECH API
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-red-500 uppercase font-bold tracking-wider block">ພາສາລາວ (LAO)</span>
                  <div className="bg-[#101013] border border-zinc-900 rounded-lg p-3 min-h-[80px] max-h-[160px] overflow-y-auto text-xs text-gray-300 leading-relaxed font-sans">
                    {realtimeLaoText || (isRecording && activeSpeechLang === "lo" ? "ກຳລັງຟັງ ແລະ ຖອດສຽງ..." : "ບໍ່ມີຂໍ້ມູນ")}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-blue-500 uppercase font-bold tracking-wider block">ENGLISH</span>
                  <div className="bg-[#101013] border border-zinc-900 rounded-lg p-3 min-h-[80px] max-h-[160px] overflow-y-auto text-xs text-gray-300 leading-relaxed font-sans">
                    {realtimeEngText || (isRecording && activeSpeechLang === "en" ? "Listening & transcribing..." : "No speech detected yet")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error messages block */}
          {error && (
            <div className="bg-red-950/15 border border-red-900/40 rounded-2xl p-4.5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">ຂໍ້ຜິດພາດໃນການບັນທຶກສຽງ</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Active / Completed result display */}
        <div className="lg:col-span-5 flex flex-col h-full justify-start space-y-6">
          {result ? (
            <div className="bg-[#101013] border-2 border-red-950/50 rounded-3xl p-6 space-y-6 shadow-2xl relative animate-fade-in">
              <div className="flex items-center justify-between border-b border-zinc-950 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/30 text-emerald-400">
                    SAVED SUCCESS
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1 max-w-[200px] truncate" title={result.topic}>
                    {result.topic}
                  </h4>
                </div>
                <span className="text-xs text-zinc-500 font-mono">
                  {formatTime(result.duration)}
                </span>
              </div>

              {/* Side by side transcripts */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-red-400 font-bold tracking-wider block">ເນື້ອຫາພາສາລາວ (LAO TRANSCRIPT):</span>
                  <p className="text-xs text-gray-300 leading-relaxed bg-zinc-950 p-3 rounded-xl border border-zinc-900 max-h-[140px] overflow-y-auto font-sans select-text">
                    {result.laoTranscript}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-blue-400 font-bold tracking-wider block">ENGLISH TRANSCRIPT:</span>
                  <p className="text-xs text-gray-300 leading-relaxed bg-zinc-950 p-3 rounded-xl border border-zinc-900 max-h-[140px] overflow-y-auto font-sans select-text">
                    {result.englishTranscript}
                  </p>
                </div>

                <div className="space-y-1.5 border-t border-zinc-900 pt-3">
                  <span className="text-[10px] font-mono text-amber-500 font-bold tracking-wider block">ບົດສະຫຼຸບກອງປະຊຸມ & ຂໍ້ຕົກລົງ (SUMMARY):</span>
                  <div className="text-xs text-gray-300 leading-relaxed bg-zinc-950 p-3 rounded-xl border border-zinc-900 max-h-[180px] overflow-y-auto font-sans whitespace-pre-line select-text">
                    {result.summary}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#101013]/60 border border-zinc-900 rounded-3xl p-6 flex flex-col items-center justify-center text-center py-16 h-full min-h-[300px] text-gray-500">
              <Languages className="w-12 h-12 text-zinc-800 mb-4" />
              <p className="text-sm font-semibold text-zinc-400">ລໍຖ້າການບັນທຶກສຽງກອງປະຊຸມ</p>
              <p className="text-xs text-zinc-600 max-w-xs mt-1">
                ເລີ່ມຕົ້ນບັນທຶກສຽງກອງປະຊຸມຢູ່ເບື້ອງຊ້າຍ ຫຼັງຈາກສິ້ນສຸດການບັນທຶກ, ບົດສະຫຼຸບ ແລະ ບົດຖອດສຽງຈະປະກົດຢູ່ບ່ອນນີ້.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Meeting Records Log */}
      <div className="bg-[#101013] border border-red-950/30 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="text-red-500 w-4.5 h-4.5" />
              <span>ປະຫວັດການບັນທຶກກອງປະຊຸມ (Meeting Logs)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              ລາຍການກອງປະຊຸມທັງໝົດທີ່ຖືກບັນທຶກໄວ້ໃນຊີດ "ບັນທຶກສຽງກອງປະຊຸມ"
            </p>
          </div>
          <button
            onClick={fetchMeetings}
            disabled={isLoading}
            className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-lg text-xs font-semibold text-gray-300 transition shrink-0 flex items-center gap-1.5"
          >
            {isLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
            ) : (
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            )}
            <span>ໂຫຼດຂໍ້ມູນຄືນໃໝ່</span>
          </button>
        </div>

        {isLoading && meetings.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs font-mono">
            <span className="w-6 h-6 border-2 border-zinc-800 border-t-red-600 rounded-full animate-spin inline-block mb-2" />
            <p>ກຳລັງດຶງຂໍ້ມູນບັນທຶກກອງປະຊຸມ...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs">
            <p>ບໍ່ພົບຂໍ້ມູນປະຫວັດການບັນທຶກກອງປະຊຸມ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">ວັນທີ & ເວລາ</th>
                  <th className="py-3 px-4 font-bold">ຫົວຂໍ້ປະຊຸມ</th>
                  <th className="py-3 px-4 font-bold">ຄວາມຍາວສຽງ</th>
                  <th className="py-3 px-4 font-bold">ເນື້ອຫາ (Lao / English)</th>
                  <th className="py-3 px-4 font-bold">ບົດສະຫຼຸບ & ຂໍ້ຕົກລົງ</th>
                  <th className="py-3 px-4 font-bold text-center">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/65 text-xs text-gray-300">
                {meetings.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-zinc-950/40 transition">
                    <td className="py-4 px-4 font-mono text-zinc-400 whitespace-nowrap">
                      {new Date(meeting.createdAt).toLocaleString("lo-LA", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                      })}
                    </td>
                    <td className="py-4 px-4 font-bold text-white max-w-[200px] truncate" title={meeting.topic}>
                      {meeting.topic}
                    </td>
                    <td className="py-4 px-4 font-mono text-red-500 font-bold whitespace-nowrap">
                      {formatTime(meeting.duration)}
                    </td>
                    <td className="py-4 px-4 max-w-[280px]">
                      <div className="space-y-1">
                        <p className="text-gray-300 line-clamp-2 leading-relaxed" title={meeting.laoTranscript}>
                          <span className="text-[9px] font-mono font-bold bg-red-950/30 text-red-400 border border-red-900/20 px-1 py-0.2 rounded mr-1">LAO</span>
                          {meeting.laoTranscript}
                        </p>
                        <p className="text-zinc-500 line-clamp-2 leading-relaxed" title={meeting.englishTranscript}>
                          <span className="text-[9px] font-mono font-bold bg-zinc-900 text-zinc-400 border border-zinc-800 px-1 py-0.2 rounded mr-1">ENG</span>
                          {meeting.englishTranscript}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-[280px]">
                      <div className="text-zinc-400 line-clamp-3 whitespace-pre-line leading-relaxed" title={meeting.summary}>
                        {meeting.summary}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setResult(meeting);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition cursor-pointer"
                          title="ເບິ່ງລາຍລະອຽດ"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          className="p-1.5 rounded-lg hover:bg-red-950/30 text-zinc-500 hover:text-red-500 transition cursor-pointer"
                          title="ລຶບບັນທຶກ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
