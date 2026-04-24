import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import SearchInput from '@/components/SearchInput' // 引入你剛才建好的零件

export const revalidate = 0; // 維持不緩存，即時更新

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Next.js 15 規範：首頁組件接收 searchParams 作為 Promise
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  // 1. 解析網址傳過來的搜尋關鍵字 (?q=xxx)
  const { q: query } = await searchParams;

  // 2. 建立資料庫查詢邏輯
  let supabaseQuery = supabase
    .from('硬體貼文')
    .select('*')
    .ilike('title', '%[賣]%'); // 【核心：隱形過濾】強制只看賣家資料

  // 3. 如果使用者有打字搜尋，就增加搜尋條件
  if (query) {
    supabaseQuery = supabaseQuery.ilike('title', `%${query}%`);
  }

  const { data: posts, error } = await supabaseQuery.order('created_at', { ascending: false });

  if (error) {
    return <div className="p-20 text-center text-red-500">連線錯誤：{error.message}</div>
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        
        {/* 標題與簡介區 */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-700 to-indigo-500 bg-clip-text text-transparent tracking-tighter">
            🚀 3C 硬體價格監控站
          </h1>
          <p className="text-slate-400 font-medium">數據來源：PTT HardwareSale • 114 義大資工 林彤恩 (Tony)</p>
        </div>

        {/* 4. 放置搜尋框零件 */}
        <SearchInput />
        
        <div className="grid gap-6">
          {posts && posts.length > 0 ? (
            posts.map((post: any) => (
              <div key={post.id} className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 group relative">
                <Link href={`/product/${post.id}`} className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                    <span className="inline-block mt-2 bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">
                      {post.product_type || 'HARDWARE'}
                    </span>
                  </div>
                  <div className="shrink-0">
                    <p className="text-3xl font-black text-blue-600 font-mono tracking-tighter">{post.price}</p>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            // 5. 帥氣的查無資料提示
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-4xl mb-4">🛸</p>
              <h3 className="text-xl font-bold text-slate-800 mb-2">查無相關硬體資料</h3>
              <p className="text-slate-400 italic">
                學長，目前資料庫找不到關於「{query || ''}」的[賣]項資訊，要不要換個關鍵字？
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}