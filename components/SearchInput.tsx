'use client'; // 標記為客戶端組件，因為我們需要處理打字跟點擊

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 這裡記錄使用者打進去的字，預設抓取網址上的 q 參數
  const [query, setQuery] = useState(searchParams.get('q') || '');

  // 當使用者按下「搜尋」或按 Enter 時觸發
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    
    if (trimmedQuery) {
      // 把網址變成 /?q=5080
      router.push(`/?q=${encodeURIComponent(trimmedQuery)}`);
    } else {
      // 如果空空的就回首頁
      router.push('/');
    }
  };

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋硬體型號 (例如: 5080, 螢幕...)"
          className="w-full bg-[#161b22] border border-slate-800 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 placeholder:text-slate-600 shadow-xl"
        />
        <button 
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold transition-all active:scale-95 shadow-lg"
        >
          搜尋
        </button>
      </div>
    </form>
  );
}