import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, RotateCcw, VolumeX, Radio, Maximize2 } from "lucide-react";
import { playSimulatedTelecomAudio, stopSimulatedTelecomAudio } from "../utils/audioSynth";

interface AudioPlayerProps {
  audioUrl?: string;
  audioBase64?: string;
  duration: number;
  fileName: string;
}

export default function AudioPlayer({ audioUrl, audioBase64, duration, fileName }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Re-create Blob URL from Base64 if needed
  const [playableUrl, setPlayableUrl] = useState<string>("");

  useEffect(() => {
    if (audioBase64) {
      try {
        const binary = atob(audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        // standard default to audio/mp3
        const blob = new Blob([bytes], { type: "audio/mp3" });
        const url = URL.createObjectURL(blob);
        setPlayableUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch (e) {
        console.error("Error decoding base64 audio", e);
      }
    } else if (audioUrl) {
      setPlayableUrl(audioUrl);
    } else {
      setPlayableUrl("");
    }
  }, [audioUrl, audioBase64]);

  // Clean up on unmount or file change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    stopSimulatedTelecomAudio();
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [playableUrl]);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (playableUrl && audioRef.current) {
        audioRef.current.pause();
      } else {
        stopSimulatedTelecomAudio();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } else {
      // Play
      setIsPlaying(true);
      if (playableUrl && audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.play().catch(err => {
          console.warn("Audio play failed, falling back to simulation:", err);
          playSimulatedTelecomAudio();
        });
      } else {
        // Fallback or Simulated Seed Audio
        playSimulatedTelecomAudio();
      }

      // Progress Tracker
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            // Reached the end
            setIsPlaying(false);
            stopSimulatedTelecomAudio();
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleReset = () => {
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (playableUrl && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Soundwave visualization columns based on filename lengths or random seed
  const totalBars = 36;
  const bars = Array.from({ length: totalBars }).map((_, i) => {
    const seed = (fileName.charCodeAt(i % fileName.length) || 10) * (i + 1);
    const minHeight = 4;
    const maxHeight = 34;
    const computedHeight = minHeight + (seed % (maxHeight - minHeight));
    return computedHeight;
  });

  return (
    <div className="bg-zinc-950/80 border border-red-950/40 rounded-xl p-5 shadow-lg shadow-red-950/10">
      {/* Hidden native audio tag if real audio is loaded */}
      {playableUrl && (
        <audio
          ref={audioRef}
          src={playableUrl}
          className="hidden"
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
            if (timerRef.current) clearInterval(timerRef.current);
          }}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Playback Controls & Info */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleTogglePlay}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
              isPlaying
                ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                : "bg-zinc-800 hover:bg-red-900 text-red-500 hover:text-white"
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleReset}
            title="ເປີດຄືນໃໝ່"
            className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div>
            <div className="text-sm font-medium text-white max-w-xs truncate" title={fileName}>
              {fileName}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{playableUrl ? "ສຽງຈິງ (Uploaded File)" : "ສຽງຈໍາລອງ (Simulated Stream)"}</span>
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse ml-1" />
            </div>
          </div>
        </div>

        {/* Visual equalizer wave */}
        <div className="flex-1 flex items-end justify-center gap-[3px] px-4 h-12 overflow-hidden">
          {bars.map((height, index) => {
            const isBarActive = isPlaying && (currentTime % 3 !== 0 || index % 2 === 0);
            return (
              <div
                key={index}
                className={`w-[4px] rounded-t-full transition-all duration-300 ${
                  isBarActive 
                    ? "bg-red-600" 
                    : "bg-zinc-800"
                }`}
                style={{
                  height: isBarActive ? undefined : `${height}px`,
                  animation: isBarActive ? `wave ${0.6 + (index % 5) * 0.15}s ease-in-out infinite alternate` : undefined,
                  opacity: isBarActive ? 1 : 0.4
                }}
              />
            );
          })}
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2.5">
          <button onClick={toggleMute} className="text-gray-400 hover:text-white transition">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const val = Number(e.target.value);
              setVolume(val);
              setIsMuted(false);
              if (audioRef.current) {
                audioRef.current.volume = val;
              }
            }}
            className="w-18 accent-red-600 bg-zinc-800 rounded-lg cursor-pointer h-1"
          />
          <div className="text-xs font-mono text-gray-400 min-w-16 text-right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* Seek track bar */}
      <div className="mt-4 flex items-center gap-2">
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleProgressChange}
          className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
        />
      </div>
    </div>
  );
}
