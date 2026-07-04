import React from "react";
import { SidebarTab, User } from "../types";
import { 
  LayoutDashboard, 
  ListMusic, 
  FileAudio, 
  Settings, 
  PhoneCall, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  LogOut,
  UserCheck,
  Mic
} from "lucide-react";

interface SidebarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  stats: {
    total: number;
    verified: number;
    flagged: number;
    review: number;
  };
  currentUser: User | null;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, stats, currentUser, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "dashboard" as SidebarTab, label: "ແຜງຄວບຄຸມ (Dashboard)", icon: LayoutDashboard },
    { id: "records" as SidebarTab, label: "ລາຍການກວດສອບ (Records)", icon: ListMusic },
    { id: "verify" as SidebarTab, label: "ກວດສອບສຽງໃໝ່ (Verify Audio)", icon: FileAudio },
    { id: "meeting" as SidebarTab, label: "ບັນທຶກສຽງກອງປະຊຸມ (Meeting)", icon: Mic },
    { id: "settings" as SidebarTab, label: "ຕັ້ງຄ່າ & ຂໍ້ມູນ (Settings)", icon: Settings },
  ];

  return (
    <aside className="w-80 bg-[#0f0f12] border-r border-red-950/40 flex flex-col h-screen sticky top-0 text-gray-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-red-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-900/30">
            <PhoneCall className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
              TPLUS Call Center
            </h1>
            <p className="text-[11px] font-mono text-red-500 font-bold tracking-wider uppercase">
              Auditor System 123
            </p>
          </div>
        </div>
        <div className="mt-4 px-3 py-2 bg-red-950/20 border border-red-900/20 rounded-lg">
          <p className="text-[11px] text-red-200 leading-normal">
            <span className="font-bold">ຊື່ລະບົບ:</span> ລະບົບກວດສອບ ຄຣິບສຽງການສົນທະນາ
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-mono uppercase text-gray-500 tracking-widest font-bold">
          ເມນູຫຼັກ
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-red-950/40 to-red-900/20 border border-red-800/40 text-white shadow-md shadow-red-950/30"
                  : "hover:bg-red-950/10 hover:text-red-400 border border-transparent"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 transition-transform duration-300 ${isActive ? "text-red-500 scale-110" : "text-gray-400"}`} />
              <span>{item.label}</span>
              {item.id === "verify" && (
                <span className="ml-auto flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>
          );
        })}

        {/* Quick System Status Card */}
        <div className="mt-8 pt-6 border-t border-red-950/30">
          <div className="px-3 mb-3 text-[10px] font-mono uppercase text-gray-500 tracking-widest font-bold">
            ສະຖິຕິລະບົບ
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/40">
              <span className="text-[10px] text-gray-400 block">ທັງໝົດ</span>
              <span className="text-sm font-bold text-white font-mono flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-blue-400" /> {stats.total}
              </span>
            </div>
            <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/40">
              <span className="text-[10px] text-gray-400 block">ຜ່ານການກວດ</span>
              <span className="text-sm font-bold text-white font-mono flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {stats.verified}
              </span>
            </div>
            <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/40">
              <span className="text-[10px] text-gray-400 block">ພົບຄວາມສ່ຽງ</span>
              <span className="text-sm font-bold text-white font-mono flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> {stats.flagged}
              </span>
            </div>
            <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/40">
              <span className="text-[10px] text-gray-400 block">ລໍຖ້າກວດສອບ</span>
              <span className="text-sm font-bold text-white font-mono flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-red-400 animate-spin" /> {stats.review}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* User Profile Info & Logout */}
      {currentUser && (
        <div className="p-4 border-t border-red-950/30 bg-[#09090b]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-900/80 flex items-center justify-center shrink-0">
              <UserCheck className="w-4.5 h-4.5 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">
                {currentUser.displayName}
              </h4>
              <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                {currentUser.role}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="w-8 h-8 rounded-lg hover:bg-red-950/40 border border-transparent hover:border-red-900/30 flex items-center justify-center text-zinc-400 hover:text-red-400 transition cursor-pointer shrink-0"
              title="ອອກຈາກລະບົບ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer Creator Widget */}
      <div className="p-4 border-t border-red-950/40 bg-zinc-950/60">
        <div className="text-center">
          <p className="text-[11px] text-gray-400">
            TPLUS Call Center 123
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            ພັດທະນາໂດຍ: <span className="text-red-400 font-medium">Latsamy Phanthaboun</span>
          </p>
          <div className="mt-2 text-[8px] font-mono text-gray-600 bg-black/40 py-1 rounded border border-zinc-900">
            VERSION 1.0.0 (PREMIUM)
          </div>
        </div>
      </div>
    </aside>
  );
}
