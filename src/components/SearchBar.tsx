"use client";

import { Search, X } from 'lucide-react';

export function SearchBar({ value, onChange, placeholder = "Search knowledge..." }: { 
  value: string; 
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-zinc-400" />
      </div>
      <input
        type="text"
        className="block w-full rounded-full border border-zinc-200 bg-white py-2 pl-10 pr-10 text-sm placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:placeholder:text-zinc-400"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
