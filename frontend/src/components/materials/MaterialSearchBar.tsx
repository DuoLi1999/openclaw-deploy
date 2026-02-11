import { useState } from "react";
import { Search, Sparkles, Loader2 } from "lucide-react";

interface MaterialSearchBarProps {
  onSearch: (query: string) => void;
  onAISearch: (query: string) => void;
  isSearching?: boolean;
  placeholder?: string;
}

export function MaterialSearchBar({
  onSearch,
  onAISearch,
  isSearching = false,
  placeholder = "搜索素材...",
}: MaterialSearchBarProps) {
  const [query, setQuery] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch(query);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder={placeholder}
        />
      </div>
      <button
        onClick={() => onAISearch(query)}
        disabled={!query.trim() || isSearching}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSearching ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        AI 搜索
      </button>
    </div>
  );
}
