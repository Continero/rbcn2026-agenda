"use client";

interface ProgressBarProps {
  progress: number; // 0 to 1
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const percent = Math.round(progress * 100);

  return (
    <div className="w-full h-2.5 bg-white-10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-linear shimmer-bar"
        style={{
          width: `${percent}%`,
          background: "linear-gradient(90deg, #00c0b5, #2ecbc2, #bbc446)",
        }}
      />
    </div>
  );
}
