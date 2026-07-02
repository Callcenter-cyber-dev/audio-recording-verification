import React from "react";
import { Settings, ShieldCheck, Database, Key, PhoneCall, Heart, Cpu } from "lucide-react";

export default function SettingsView() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-red-500" />
          <span>ຕັ້ງຄ່າ & ຂໍ້ມູນລະບົບ</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          ລາຍລະອຽດສະເພາະທາງດ້ານເຕັກນິກ, ຄໍາແນະນໍາການເຊື່ອມຕໍ່ Firebase ແລະ ຂໍ້ມູນຜູ້ພັດທະນາລະບົບ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Firebase & Storage Details */}
        <div className="bg-[#101013] border border-zinc-900 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4.5 h-4.5 text-red-500" />
            <span>ການເຊື່ອມຕໍ່ຖານຂໍ້ມູນ Firebase</span>
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            ລະບົບນີ້ບັນທຶກ ແລະ ດຶງຂໍ້ມູນການກວດສອບຄຣິບສຽງຈາກຖານຂໍ້ມູນ <span className="text-red-400 font-bold">Cloud Firestore</span> ໂດຍເກັບໄວ້ໃນ Collection ທີ່ມີຊື່ວ່າ:
          </p>
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 font-mono text-xs text-red-400 font-bold select-all text-center">
            audio-recording-verification
          </div>
          <p className="text-xs text-zinc-500 leading-normal">
            * ໝາຍເຫດ: ລະບົບມີລະບົບເກັບຂໍ້ມູນສຳຮອງໃນຕົວ (In-Memory & Local Storage Fallback) ທີ່ຈະເຮັດວຽກໂດຍອັດຕະໂນມັດ ຫາກຖານຂໍ້ມູນຫຼັກຍັງບໍ່ໄດ້ເປີດໃຊ້ງານ ຫຼື ບໍ່ທັນຍອມຮັບຂໍ້ຕົກລົງໃນ Firebase Console.
          </p>
        </div>

        {/* Gemini AI API Credentials */}
        <div className="bg-[#101013] border border-zinc-900 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4.5 h-4.5 text-red-500" />
            <span>ຄວາມປອດໄພຂອງຄີ API</span>
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            ຄຣິບສຽງທັງໝົດຈະຖືກສົ່ງໄປປະມວນຜົນຜ່ານ <span className="text-white font-semibold">Gemini 3.5 Flash Model</span> ທີ່ເຊີເວີຝັ່ງຫຼັງ (Backend) ເທົ່ານັ້ນ. ໂດຍບໍ່ມີການເປີດເຜີຍ API Key ໃຫ້ກັບບຣາວເຊີ ເພື່ອຄວາມປອດໄພສູງສຸດຂອງຂໍ້ມູນ.
          </p>
          <div className="p-3 bg-red-950/25 border border-red-900/35 rounded-xl">
            <p className="text-[11px] text-red-300 leading-normal font-medium">
              ທ່ານສາມາດກຳນົດ ແລະ ປ່ຽນແປງ API Key ໄດ້ທີ່ແຖບ <span className="font-bold">Settings &gt; Secrets</span> ຂອງ Google AI Studio. ລະບົບຈະໂຫຼດຄີມາໃຊ້ງານໂດຍອັດຕະໂນມັດ.
            </p>
          </div>
        </div>

        {/* System Specs and Architecture */}
        <div className="bg-[#101013] border border-zinc-900 rounded-2xl p-5 space-y-4 md:col-span-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4.5 h-4.5 text-red-500" />
            <span>ສະເປັກທາງດ້ານເຕັກນິກຂອງລະບົບ (System Architecture)</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-center">
              <span className="text-[10px] text-gray-500 block">ເຕັກໂນໂລຊີຫຼັກ</span>
              <span className="text-xs font-bold text-white block mt-1">React + Vite</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-center">
              <span className="text-[10px] text-gray-500 block">ລະບົບປະມວນຜົນ</span>
              <span className="text-xs font-bold text-white block mt-1">Node Express</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-center">
              <span className="text-[10px] text-gray-500 block">ໂມເດວ AI ຫຼັກ</span>
              <span className="text-xs font-bold text-white block mt-1">Gemini 3.5 Flash</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-center">
              <span className="text-[10px] text-gray-500 block">ຕົກແຕ່ງໜ້າຈໍ</span>
              <span className="text-xs font-bold text-white block mt-1">Tailwind CSS v4</span>
            </div>
          </div>
        </div>

        {/* Support & Development Credits */}
        <div className="bg-gradient-to-br from-[#1b0a0a] to-[#0d0c0f] border border-red-950/45 rounded-3xl p-6 md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/40">
              <PhoneCall className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">TPLUS Call Center 123</h3>
              <p className="text-xs text-red-400 font-bold font-mono">DEVELOPED BY LATSAMY PHANTHABOUN</p>
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed pt-1">
            ລະບົບນີ້ພັດທະນາຂຶ້ນໂດຍມີຈຸດປະສົງເພື່ອເພີ່ມທະວີຄວາມວ່ອງໄວ ແລະ ຄວາມຖືກຕ້ອງໃນການກວດສອບຄຸນນະພາບການໃຫ້ບໍລິການ ແລະ ການບັນທຶກສຽງສົນທະນາຂອງພະນັກງານ TPLUS Call Center 123. ດ້ວຍການນຳໃຊ້ລະບົບ AI ທັນສະໄໝ ປະສິດທິພາບສູງ ປອດໄພ ແລະ ດູດີຢ່າງມືອາຊີບ.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500 border-t border-red-950/40 pt-4">
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
            <span>Copyright 2026, TPLUS Call Center 123. All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
