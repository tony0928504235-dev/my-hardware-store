import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import SearchInput from '@/components/SearchInput'

export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  // 1. 獲取網址參數
  const params = await searchParams;
  const query = params.q;

  // 2. 建立最基礎的查詢 (預設抓取所有資料)
  let supabaseQuery = supabase
    .from('硬體貼文')
    .select('*');

  // 3. 【關鍵修正】只有當真的有打字搜尋時，才進行過濾
  if (query && query.trim() !== "") {
    supabaseQuery = supabaseQuery.ilike('title', `%${query}%`);
  }

  // 4. 排序並執行查詢
  const { data: posts, error } = await supabaseQuery.order('created_at', { ascending: false });

  if (error) {
    return <div className="p-20 text-center">資料庫連線失敗，請檢查 Table 名稱。</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        
        {/* 標題區 */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-3 text-blue-600 tracking-tighter">
            🚀 3C 硬體價格監控站
          </h1>
          <p className="text-slate-400">數據來源：PTT HardwareSale • 114 義大資工 林彤恩 (Tony)</p>
        </div>

        {/* 搜尋框：永遠固定在上方 */}
        <div className="mb-12">
          <SearchInput />
        </div>
        
        {/* 列表區：確保資料一定會列出來 */}
        <div className="grid gap-6">
          {query && (
            <div className="flex justify-between items-center px-4">
               <p className="text-blue-600 font-bold">🔍 正在搜尋：「{query}」</p>
               <Link href="/" className="text-xs text-slate-400 underline">清除搜尋，看全部</Link>
            </div>
          )}

          {posts && posts.length > 0 ? (
            posts.map((post: any) => (
              <div key={post.id} className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
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
                    <p className="text-3xl font-black text-blue-600 font-mono tracking-tighter">
                      {post.price || '面議'}
                    </p>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            // 只有在真的搜不到東西時才顯示
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
              <p className="text-slate-400">找不到符合「{query}」的資料。是不是爬蟲還沒抓到？</p>
              <Link href="/" className="text-blue-500 underline mt-4 block">返回顯示全部資料</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}