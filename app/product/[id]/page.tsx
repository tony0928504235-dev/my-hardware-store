import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// 初始化連線
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 【新增：SEO 動態標題功能】
// 這段程式碼會讓 Google 搜尋結果直接顯示「RTX 5080...」而不是「Product Page」
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: post } = await supabase
    .from('硬體貼文') 
    .select('title')
    .eq('id', id)
    .single()

  return {
    title: `${post?.title || '硬體'} | PTT 二手行情監控站`,
    description: `查看 ${post?.title} 的最新 PTT 報價與歷史行情分析。`,
  }
}

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  
  // 1. 取得網址上的 id
  const { id } = await params
  
  // 2. 抓取資料
  const { data: post, error } = await supabase
    .from('硬體貼文')
    .select('*')
    .eq('id', id)
    .single()

  // 3. 如果找不到資料，顯示自定義的電競風除錯畫面
  if (!post) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black text-white mb-4">404 - 找不到該硬體型號</h1>
        <p className="text-slate-500 mb-10">目前網址抓到的 ID 是：<span className="text-red-500 font-mono">{id}</span></p>
        <Link href="/" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all">
          ← 返回行情總覽
        </Link>
      </div>
    )
  }

  // 4. 成功抓到資料後的「電競風格」畫面
  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 font-sans p-6 md:p-12">
      {/* 導覽列 */}
      <div className="max-w-4xl mx-auto mb-10">
        <Link href="/" className="text-blue-400 hover:text-blue-300 transition-all flex items-center gap-2 font-bold">
          ← 返回行情列表
        </Link>
      </div>

      <article className="max-w-4xl mx-auto bg-[#161b22] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/10">
        {/* 頂部發光線條 */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500" />
        
        <div className="p-8 md:p-14">
          <div className="flex items-center gap-3 mb-8">
            <span className="bg-blue-600/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase">
              {post.product_type || 'HARDWARE'}
            </span>
            <span className="text-slate-600 font-mono text-xs">SERIAL: #{id}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-tighter leading-tight italic">
            {post.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* 價格面板 */}
            <div className="bg-[#1c2128] p-10 rounded-[2rem] border border-slate-700/50 relative overflow-hidden group hover:border-blue-500/50 transition-all">
              <p className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-widest">PTT 監測行情</p>
              <p className="text-6xl font-mono font-black text-blue-500 group-hover:scale-105 transition-transform duration-500">
                {post.price}
              </p>
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            {/* 時間面板 */}
            <div className="bg-[#1c2128] p-10 rounded-[2rem] border border-slate-700/50 flex flex-col justify-center">
              <p className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-widest">數據更新時間</p>
              <p className="text-2xl font-bold text-slate-300">
                {new Date(post.created_at).toLocaleString('zh-TW')}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
              <p className="text-slate-500 text-sm leading-relaxed">
                * 本數據由 P-SEO 自動化監控系統從 PTT HardwareSale 擷取。價格為觀測當下之紀錄，實際成交價請參考原始貼文。
              </p>
            </div>
            
            <a 
              href={post.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block w-full bg-blue-600 hover:bg-blue-500 text-white text-center py-6 rounded-2xl font-black text-2xl shadow-[0_0_30px_rgba(37,99,235,0.2)] transition-all active:scale-[0.97]"
            >
              前往 PTT 原始貼文驗證 ↗
            </a>
          </div>
        </div>
      </article>
      
      <footer className="max-w-4xl mx-auto mt-12 text-center">
        <p className="text-slate-600 text-xs font-medium">
          © 2026 CSIE Tony Lin Hardware Monitoring System. All Rights Reserved.
        </p>
      </footer>
    </div>
  )
}