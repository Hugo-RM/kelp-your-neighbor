"use client";

const EVENT_TYPES = ["All", "Concert", "Food","Community", "Event", "OutDoors", "Networking"];

type Props = {
  activeType: string;
  dateFrom: string;
  dateTo: string;
  onTypeChange: (type: string) => void;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
};

export default function FilterBar({
  activeType,
  dateFrom,
  dateTo,
  onTypeChange,
  onDateFromChange,
  onDateToChange,
}: Props) {
  return (
    <div className="sticky top-0 z-[1000] flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur px-4 py-3 border-b border-slate-200 shadow-sm">
      {/* Type pills */}
      <div className="flex flex-wrap gap-1.5">
        {EVENT_TYPES.map((type) => {
          const isActive = (type === "All" && activeType === "all") || activeType === type;
          return (
            <button
              key={type}
              onClick={() => onTypeChange(type === "All" ? "all" : type)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {/* Date range */}
      <div className="flex items-center gap-2 ml-auto">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 focus:border-emerald-400 focus:outline-none"
          aria-label="From date"
        />
        <span className="text-slate-400 text-xs">→</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 focus:border-emerald-400 focus:outline-none"
          aria-label="To date"
        />
      </div>
    </div>
  );
}
