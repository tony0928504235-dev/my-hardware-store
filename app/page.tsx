import { createClient } from '@supabase/supabase-js'
import Link from 'next/link' // 【新增點 1】導入傳送門組件

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  const { data: posts } = await supabase
    .from('hardware_posts') // 這裡對齊你資料庫的名稱
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            🚀 3C 硬體價格監控站
          </h1>
          <p className="text-slate-500 font-medium">數據來源：PTT HardwareSale • 2026 CSIE Tony Lin</p>
        </div>
        
        <div className="grid gap-6">
          {posts?.map((post: any) => (
            <div key={post.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                
                {/* 【核心修改點 2】用 Link 包裹標題，讓它連向 /product/[id] */}
                <Link href={`/product/${post.id}`} className="block max-w-[75%]">
                  <h2 className="text-xl font-bold group-hover:text-blue-600 transition-colors leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-xs text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    點擊查看詳細行情分析 →
                  </p>
                </Link>

                <div className="text-right">
                  <span className="text-2xl font-black text-blue-600 font-mono block">
                    {post.price}
                  </span>
                  <span className="inline-block bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    {post.product_type}
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-xs text-slate-300 font-mono">
                  {new Date(post.created_at).toLocaleString('zh-TW')}
                </span>
                <a 
                  href={post.link} 
                  target="_blank" 
                  className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  查看原文 ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}