import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

interface PhoneVideoProps {
  src: string;
  tilt?: boolean;
}

export const PhoneVideo = ({ src, tilt = true }: PhoneVideoProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying((prev) => !prev);

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        initial={tilt ? { rotate: -6, y: 0 } : {}}
        whileHover={tilt ? { rotate: 0, y: -8, scale: 1.03 } : {}}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="relative group"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={togglePlay}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            togglePlay();
          }
        }}
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        {/* Phone frame */}
        <div className="relative h-[520px] w-[260px] rounded-[2.5rem] border border-white/20 bg-gradient-to-b from-zinc-600 via-zinc-700 to-zinc-800 p-[10px] shadow-[0_30px_80px_-20px_hsl(248_90%_66%/0.5)]">
          <div className="relative h-full w-full overflow-hidden rounded-[1.8rem] bg-black">
            {/* Cinematic blue glow overlay */}
            <div className="pointer-events-none absolute inset-0 z-[5] rounded-[1.8rem] bg-gradient-to-b from-blue-500/10 via-transparent to-blue-600/5 mix-blend-screen" />

            {/* Video */}
            <video
              ref={videoRef}
              src={src}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />

            {/* Hover overlay with play/pause button */}
            <div
              className={`absolute inset-0 z-[15] flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="size-12 rounded-full glass-strong flex items-center justify-center backdrop-blur-xl">
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-foreground fill-foreground" />
                ) : (
                  <Play className="h-5 w-5 text-foreground fill-foreground ml-0.5" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating glow */}
        <div className="absolute -inset-8 -z-10 rounded-[4rem] bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl" />
      </motion.div>
    </div>
  );
};
