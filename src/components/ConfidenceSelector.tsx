"use client";

const confidenceLevels = [
  { level: 1, emoji: '😕', label: 'Forgot', color: 'from-red-400 to-rose-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-300 dark:border-red-700' },
  { level: 2, emoji: '🤔', label: 'Hard', color: 'from-orange-400 to-amber-500', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-300 dark:border-orange-700' },
  { level: 3, emoji: '😐', label: 'Okay', color: 'from-yellow-400 to-amber-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-300 dark:border-yellow-700' },
  { level: 4, emoji: '😊', label: 'Good', color: 'from-emerald-400 to-green-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-300 dark:border-emerald-700' },
  { level: 5, emoji: '🚀', label: 'Perfect', color: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-300 dark:border-indigo-700' },
];

export function ConfidenceSelector({ value, onChange, label = "Confidence Level" }: {
  value: number;
  onChange: (val: number) => void;
  label?: string;
}) {
  const selectedLevel = confidenceLevels.find(l => l.level === value);
  
  return (
    <div className="space-y-4 w-full max-w-md">
      {label && <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>}
      <div className="flex justify-center gap-3">
        {confidenceLevels.map((item) => (
          <button
            key={item.level}
            type="button"
            onClick={() => onChange(item.level)}
            className={`group relative flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all duration-300 ${
              value === item.level
                ? `${item.bg} ${item.border} scale-110 shadow-lg`
                : 'border-zinc-200 bg-white hover:border-zinc-300 hover:scale-105 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600'
            }`}
          >
            <span className={`text-3xl transition-transform duration-200 ${value === item.level ? 'scale-110' : 'group-hover:scale-110'}`}>
              {item.emoji}
            </span>
            <span className={`text-xs font-semibold transition-colors ${
              value === item.level 
                ? 'text-zinc-900 dark:text-zinc-100' 
                : 'text-zinc-400 dark:text-zinc-500'
            }`}>
              {item.label}
            </span>
            {value === item.level && (
              <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r ${item.color}`} />
            )}
          </button>
        ))}
      </div>
      {selectedLevel && (
        <div className={`text-center py-2 px-4 rounded-xl ${selectedLevel.bg} transition-all duration-300`}>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {value === 1 && "Need more practice - will review tomorrow"}
            {value === 2 && "Getting there - review in 2 days"}
            {value === 3 && "Making progress - review in 4 days"}
            {value === 4 && "Great recall - review next week"}
            {value === 5 && "Mastered! - review in 2 weeks"}
          </p>
        </div>
      )}
    </div>
  );
}
