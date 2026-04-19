import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  const { data: posts, error } = await supabase
    .from('硬體貼文') // 【關鍵】這裡要改成中文名稱
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-20 text-center text-red-500">連線錯誤：{error.message}</div>
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-700 to-indigo-500 bg-clip-text text-transparent tracking-tighter">
            🚀 3C 硬體價格監控站
          </h1>
          <p className="text-slate-400 font-medium">數據來源：PTT HardwareSale • 114 義大資工 林彤恩 (Tony)</p>
        </div>
        
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
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400">目前資料庫回傳為空，請確認資料表名稱是否為「硬體貼文」</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}