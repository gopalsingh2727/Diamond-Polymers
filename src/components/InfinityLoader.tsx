import { useEffect, useState } from "react";

interface InfinityLoaderProps {
  onLoadComplete?: () => void;
  minDuration?: number;
}

export function InfinityLoader({ onLoadComplete, minDuration = 2000 }: InfinityLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, minDuration / 50);

    const timer = setTimeout(() => {
      if (onLoadComplete) {
        onLoadComplete();
      }
    }, minDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onLoadComplete, minDuration]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#030712] flex items-center justify-center">
      {/* Animated background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] bg-[#FF6B35]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] bg-[#FFA500]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Centered content container */}
      <div className="flex flex-col items-center justify-center w-full px-4">
        {/* Eagle Head Logo - Side Profile Attitude */}
        <div className="mb-8">
          <svg
            width="180"
            height="180"
            viewBox="0 0 180 180"
            className="mx-auto block eagle-logo"
          >
            {/* Eagle Head - Side Profile */}
            <path
              d="M50 90
                 C50 50 80 20 120 25
                 C140 28 155 40 160 60
                 C162 70 158 80 150 85
                 L140 88
                 C145 92 148 98 145 105
                 C142 112 135 115 125 112
                 L115 108
                 C110 115 100 118 90 115
                 C75 110 60 100 50 90"
              fill="url(#fireGradient)"
            />

            {/* White Head (Bald Eagle style) */}
            <path
              d="M60 85
                 C60 55 85 30 115 32
                 C135 34 150 45 154 62
                 C156 72 152 80 145 84
                 L135 86
                 C130 82 120 80 110 82
                 C95 85 75 85 60 85"
              fill="#FFF"
              opacity="0.9"
            />

            {/* Fierce Eye */}
            <circle cx="105" cy="55" r="8" fill="#000" />
            <circle cx="103" cy="52" r="3" fill="#FFF" />

            {/* Eye ridge - Angry look */}
            <path d="M90 45 C100 42 110 45 115 50" stroke="#8B4513" strokeWidth="4" fill="none" />

            {/* Hooked Beak - Eagle Signature */}
            <path
              d="M145 84
                 C155 82 165 88 168 95
                 C170 100 168 108 162 112
                 C155 118 145 118 140 112
                 L135 105
                 C140 100 142 92 145 84"
              fill="#FFD700"
            />

            {/* Beak detail */}
            <path
              d="M150 95
                 C158 93 164 98 165 105
                 C166 110 162 115 155 115
                 L148 110"
              fill="#CC8800"
            />

            {/* Neck feathers */}
            <path
              d="M90 115
                 C100 120 110 118 115 108
                 L110 125
                 C100 135 85 135 75 125
                 C65 115 60 105 60 95"
              fill="url(#fireGradient)"
            />

            {/* Fire effect around */}
            <path
              d="M55 120 Q45 135 55 150 Q50 135 65 125 Z"
              fill="#FF6B35"
              className="flame flame-1"
            />
            <path
              d="M75 130 Q65 148 78 158 Q70 145 85 135 Z"
              fill="#FFA500"
              className="flame flame-2"
            />
            <path
              d="M95 128 Q88 145 98 155 Q90 140 105 132 Z"
              fill="#FF6B35"
              className="flame flame-3"
            />

            <defs>
              <linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#FF6B35" />
                <stop offset="50%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Brand text */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF6B35] via-[#FFA500] to-[#FF6B35] bg-clip-text text-transparent mb-2">
            27 Manufacturing
          </h1>
          <p className="text-white/60 text-sm">Loading Application...</p>
        </div>

        {/* Progress bar */}
        <div className="w-40 sm:w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFA500] rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading text */}
        <p className="text-white/40 text-xs mt-3">
          {progress}%
        </p>
      </div>

      <style>{`
        .eagle-logo {
          filter: drop-shadow(0 0 30px rgba(255, 107, 53, 0.8));
          animation: eagleGlow 2.5s ease-in-out infinite;
        }

        .flame {
          animation: flameFlicker 0.5s ease-in-out infinite alternate;
        }

        .flame-1 {
          animation-delay: 0s;
        }

        .flame-2 {
          animation-delay: 0.15s;
        }

        .flame-3 {
          animation-delay: 0.3s;
        }

        @keyframes eagleGlow {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(255, 107, 53, 0.6));
            transform: scaleX(-1) scale(1);
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(255, 107, 53, 0.9)) drop-shadow(0 0 60px rgba(255, 165, 0, 0.5));
            transform: scaleX(-1) scale(1.02);
          }
        }

        @keyframes flameFlicker {
          0% {
            opacity: 0.6;
            transform: translateY(0) scaleY(1);
          }
          100% {
            opacity: 1;
            transform: translateY(-10px) scaleY(1.4);
          }
        }
      `}</style>
    </div>
  );
}
