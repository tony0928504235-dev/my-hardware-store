import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// 初始化 Supabase 連線
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  // 抓取硬體貼文資料，按時間排序
  const { data: posts } = await supabase
    .from('hardware_posts') 
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        
        {/* 標題區 */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-700 to-indigo-500 bg-clip-text text-transparent tracking-tighter">
            🚀 3C 硬體價格監控站
          </h1>
          <p className="text-slate-400 font-medium">
            數據來源：PTT HardwareSale • <span className="text-slate-600">114 義大資工 林彤恩 (Tony)</span>
          </p>
        </div>
        
        {/* 列表區 */}
        <div className="grid gap-6">
          {posts && posts.length > 0 ? (
            posts.map((post: any) => (
              <div 
                key={post.id} 
                className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
              >
                {/* 背景裝飾 (點綴用) */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors" />

                <div className="relative flex flex-col md:flex-row justify-between items-start gap-4">
                  
                  {/* 左側：標題與連結 */}
                  <div className="flex-1">
                    <Link href={`/product/${post.id}`} className="block group/link">
                      <h2 className="text-xl font-bold text-slate-800 group-hover/link:text-blue-600 transition-colors leading-snug">
                        {post.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">
                          {post.product_type || 'HARDWARE'}
                        </span>
                        <span className="text-xs text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                          點擊分析行情 →
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* 右側：價格 */}
                  <div className="text-left md:text-right shrink-0">
                    <p className="text-3xl font-black text-blue-600 font-mono tracking-tighter">
                      {post.price}
                    </p>
                    <p className="text-[10px] text-slate-300 font-mono mt-1">
                      {new Date(post.created_at).toLocaleString('zh-TW')}
                    </p>
                  </div>
                </div>
                
                {/* 底部按鈕區 */}
                <div className="mt-6 pt-5 border-t border-slate-50 flex justify-end gap-3 relative">
                  <a 
                    href={post.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
                  >
                    查看 PTT 原文 ↗
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400">目前倉庫空空的，快去跑爬蟲抓資料吧！</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}