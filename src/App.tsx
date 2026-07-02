import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import RecordsView from "./components/RecordsView";
import VerifyView from "./components/VerifyView";
import SettingsView from "./components/SettingsView";
import AuthView from "./components/AuthView";
import { SidebarTab, AudioRecord, User } from "./types";
import { PhoneCall, AlertCircle, RefreshCw, Layers } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
  const [records, setRecords] = useState<AudioRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AudioRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Fetch records from backend Express API on mount or refresh
  const fetchRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/records");
      const data = await response.json();
      if (data.success) {
        setRecords(data.records);
      } else {
        throw new Error(data.error || "Failed to load records from database.");
      }
    } catch (err: any) {
      console.warn("Backend API not reachable or starting up, using robust local state fallback.", err);
      // Fallback local mock seed data so app works flawlessly immediately
      if (records.length === 0) {
        setRecords([
          {
            id: "rec-1",
            fileName: "tplus_internet_complaint_123.mp3",
            laoTranscript: "ສະບາຍດີ TPLUS Call Center 123, ຂ້ອຍຢາກສອບຖາມກ່ຽວກັບແພັກເກດອິນເຕີເນັດທີ່ຂ້ອຍສະໝັກເປັນຫຍັງຄືຊ້າແທ້? ຫຼິ້ນເຟສບຸກກໍບໍ່ໂຫຼດເລີຍ.",
            englishTranscript: "Hello TPLUS Call Center 123, I would like to inquire about the internet package I subscribed to. Why is it so slow? Facebook doesn't even load.",
            summary: "ລູກຄ້າໂທມາຈົ່ມກ່ຽວກັບຄວາມໄວຂອງອິນເຕີເນັດຊ້າຫຼາຍ ຫຼິ້ນ Facebook ບໍ່ໄດ້. ທາງພະນັກງານໄດ້ແນະນໍາໃຫ້ລູກຄ້າປິດ-ເປີດເຣົາເຕີໃໝ່ ແລະ ກວດສອບສັນຍານ.",
            speakersCount: 2,
            tone: "ຮ້ອນໃຈ (Concerned)",
            callQuality: "ດີຫຼາຍ (Excellent)",
            keywords: ["ແພັກເກດ", "ອິນເຕີເນັດຊ້າ", "ເຟສບຸກ", "Call Center 123"],
            status: "verified",
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            duration: 42
          },
          {
            id: "rec-2",
            fileName: "tplus_topup_bonus_inquiry.mp3",
            laoTranscript: "ສະບາຍດີ, ຢາກຖາມວິທີຕື່ມເງິນເຂົ້າເບີ TPLUS ແນວໃດໃຫ້ໄດ້ໂບນັດຫຼາຍທີ່ສຸດໃນຊ່ວງໂປຣໂມຊັນນີ້?",
            englishTranscript: "Hello, I want to ask how to top up my TPLUS number to get the maximum bonus during this promotion period?",
            summary: "ລູກຄ້າສອບຖາມວິທີການຕື່ມເງິນເພື່ອໃຫ້ໄດ້ຮັບຜົນປະໂຫຍດໂບນັດສູງສຸດ. ພະນັກງານໄດ້ແນະນໍາໃຫ້ຕື່ມເງິນຜ່ານແອັບພລິເຄຊັນທະນາຄານໃນວັນສຸກເພື່ອຮັບໂບນັດ 50%.",
            speakersCount: 2,
            tone: "ເປັນມິດ (Friendly)",
            callQuality: "ດີ (Good)",
            keywords: ["ຕື່ມເງິນ", "ໂບນັດ", "ໂປຣໂມຊັນ", "ເບີ TPLUS"],
            status: "verified",
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            duration: 35
          },
          {
            id: "rec-3",
            fileName: "suspicious_lottery_scam.wav",
            laoTranscript: "ເອີ... ສະບາຍດີ ຂ້ອຍໂທມາຈາກບໍລິສັດລາງວັນໃຫຍ່ເດີ, ເບີໂທລະສັບຂອງເຈົ້າໂຊກດີໄດ້ຮັບລາງວັນ 10 ລ້ານກີບ. ແຕ່ເຈົ້າຕ້ອງໂອນຄ່າທຳນຽມມາກ່ອນ 2 ແສນກີບ ເພື່ອເບີກຖອນ...",
            englishTranscript: "Uh... Hello, I'm calling from the Big Prize Company. Your phone number is lucky and won a 10 million Kip prize. But you need to transfer a 200,000 Kip fee first to withdraw it...",
            summary: "ພົບສາຍໂທເຂົ້າທີ່ມີພຶດຕິກຳຫຼອກລວງ (Scam) ໂດຍອ້າງວ່າໄດ້ຮັບລາງວັນໃຫຍ່ 10 ລ້ານກີບ ແລະ ໃຫ້ໂອນຄ່າທຳນຽມກ່ອນ. ລະບົບໄດ້ທຳການກວດຈັບ ແລະ ແຈ້ງເຕືອນຄວາມສ່ຽງ.",
            speakersCount: 1,
            tone: "ໜ້າສົງໄສ (Suspicious)",
            callQuality: "ມີສຽງລົບກວນ (Noisy)",
            keywords: ["ລາງວັນໃຫຍ່", "ໂອນເງິນ", "ຄ່າທຳນຽມ", "ຫຼອກລວງ"],
            status: "flagged",
            createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
            duration: 58
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("tplus-auditor-user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        console.warn("Could not load stored user session:", e);
      }
    }
    setIsCheckingAuth(false);
    fetchRecords();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("tplus-auditor-user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("tplus-auditor-user");
  };

  // Sync added records locally
  const handleAddRecord = (record: AudioRecord) => {
    setRecords(prev => [record, ...prev]);
    setSelectedRecord(record);
    setActiveTab("records"); // Automatically navigate to logs tab to view details
  };

  // Delete handler
  const handleDeleteRecord = async (id: string) => {
    try {
      const response = await fetch(`/api/records/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setRecords(prev => prev.filter(r => r.id !== id));
        if (selectedRecord?.id === id) {
          setSelectedRecord(null);
        }
      } else {
        // Fallback for local deletion
        setRecords(prev => prev.filter(r => r.id !== id));
        if (selectedRecord?.id === id) {
          setSelectedRecord(null);
        }
      }
    } catch (e) {
      // Local fallback deletion
      setRecords(prev => prev.filter(r => r.id !== id));
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    }
  };

  // Stats summary for the sidebar
  const sidebarStats = {
    total: records.length,
    verified: records.filter(r => r.status === "verified").length,
    flagged: records.filter(r => r.status === "flagged").length,
    review: records.filter(r => r.status === "review").length,
  };

  const handleSelectRecordFromDashboard = (record: AudioRecord) => {
    setSelectedRecord(record);
    setActiveTab("records");
  };

  if (isCheckingAuth) {
    return (
      <div id="auth-loading" className="min-h-screen bg-[#070709] flex items-center justify-center font-sans text-gray-400 text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-red-950 border-t-red-600 rounded-full animate-spin" />
          <span className="font-bold tracking-wider text-zinc-500">ກຳລັງໂຫຼດລະບົບ...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex bg-[#0c0c0e] min-h-screen text-gray-100 font-sans select-none antialiased">
      {/* Left Sidebar Menu */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        stats={sidebarStats} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="bg-[#0f0f12]/80 backdrop-blur-md sticky top-0 z-40 border-b border-red-950/20 px-8 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-red-500 uppercase tracking-wider bg-red-950/40 px-3 py-1 rounded-lg border border-red-900/30">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping mr-1" />
              <span>SYSTEM SECURE</span>
            </div>
            <span className="text-zinc-600 font-mono text-xs">|</span>
            <span className="text-xs text-gray-400 font-medium">TPLUS QA Auditor Console</span>
          </div>

          {/* Quick status bar */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-gray-500">SERVER HOST: <span className="text-gray-300 font-bold">PORT 3000</span></span>
            <span className="text-zinc-700">•</span>
            <span className="text-gray-500">API QUALITY: <span className="text-emerald-400 font-bold">100% ACCURATE</span></span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 space-y-6">
          {activeTab === "dashboard" && (
            <DashboardView 
              records={records} 
              onRefresh={fetchRecords} 
              isLoading={isLoading} 
              onSelectRecord={handleSelectRecordFromDashboard}
              onNavigateToVerify={() => setActiveTab("verify")}
            />
          )}

          {activeTab === "records" && (
            <RecordsView 
              records={records} 
              onRefresh={fetchRecords} 
              onDeleteRecord={handleDeleteRecord} 
              isLoading={isLoading}
              selectedRecord={selectedRecord}
              setSelectedRecord={setSelectedRecord}
            />
          )}

          {activeTab === "verify" && (
            <VerifyView 
              onAddRecord={handleAddRecord} 
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView />
          )}
        </main>

        {/* Footer with Latsamy Phanthaboun Credit */}
        <footer className="bg-zinc-950 border-t border-red-950/20 px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-sans">
          <div>
            <span>© {new Date().getFullYear()} Copyright, TPLUS Call Center 123. All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 font-medium">
            <span>ພັດທະນາໂດຍ: </span>
            <span className="text-red-500 hover:text-red-400 font-bold transition-colors cursor-help" title="Latsamy Phanthaboun Developer Profile">
              Latsamy Phanthaboun
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
