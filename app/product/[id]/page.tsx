import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { GoogleGenerativeAI } from "@google/generative-ai"

// 1. 設定：強制不緩存，確保資料即時 (SSR 模式)
export const revalidate = 0;

// 2. 初始化 Supabase 連線
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 【SEO 動態標題功能】
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
  const { id } = await params
  
  // 3. 抓取資料庫數據
  const { data: post, error } = await supabase
    .from('硬體貼文')
    .select('*')
    .eq('id', id)
    .single()

  // --- 【AI 智慧分析邏輯開始】 ---
  let aiAnalysis = "正在讀取 AI 行情分析數據...";
  
  if (post) {
    try {
      // 在函數內部初始化 AI，確保環境變數 process.env 100% 讀取成功
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      
      // 【修正重點】：將型號改為 2.5 版本，解決之前的 404 問題
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `你是一位專業的電腦硬體分析師。針對這筆 PTT 二手交易：
      名稱：${post.title}
      價格：${post.price}
      請以「義大資工學長」的語氣，在 80 字內分析這筆交易值不值得買，並給出建議。重點放在 CP 值。`;

      const result = await model.generateContent(prompt);
      aiAnalysis = result.response.text();
      
    } catch (e) {
      // 這裡保留 Log，讓我們能在 Vercel Logs 監控是否有其他異常（如地區限制）
      console.error("AI 運作報錯紀錄：", e);
      aiAnalysis = "AI 分析師目前離線（可能是型號維護中），請參考原始報價資訊。";
    }
  }
  // --- 【AI 智慧分析邏輯結束】 ---

  // 4. 找不到資料的錯誤畫面
  if (!post) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center p-6 text-center font-sans">
        <h1 className="text-3xl font-black text-white mb-4 text-red-500">404 - 找不到該硬體型號</h1>
        <p className="text-slate-500 mb-10 tracking-widest font-mono">SERIAL_ID: {id}</p>
        <Link href="/" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-500 transition-all">
          ← 返回行情總覽
        </Link>
      </div>
    )
  }

  // 5. 成功渲染 ROG 電競風格畫面
  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 font-sans p-6 md:p-12">
      {/* 返回按鈕 */}
      <div className="max-w-4xl mx-auto mb-10">
        <Link href="/" className="text-blue-400 hover:text-blue-300 transition-all flex items-center gap-2 font-bold group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> 返回行情列表
        </Link>
      </div>

      <article className="max-w-4xl mx-auto bg-[#161b22] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/10">
        {/* 頂部發光線條 */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500" />
        
        <div className="p-8 md:p-14">
          {/* 頂部資訊列 */}
          <div className="flex items-center gap-3 mb-8">
            <span className="bg-blue-600/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase">
              {post.product_type || 'HARDWARE'}
            </span>
            <span className="text-slate-600 font-mono text-xs uppercase tracking-tighter">SERIAL: #{id}</span>
          </div>

          {/* 產品標題 */}
          <h1 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-tighter leading-tight italic">
            {post.title}
          </h1>

          {/* 數據面板 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* 價格 */}
            <div className="bg-[#1c2128] p-10 rounded-[2rem] border border-slate-700/50 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-500">
              <p className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-widest">PTT 監測行情</p>
              <p className="text-6xl font-mono font-black text-blue-500 group-hover:scale-105 transition-transform duration-500">
                {post.price}
              </p>
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            {/* 時間 */}
            <div className="bg-[#1c2128] p-10 rounded-[2rem] border border-slate-700/50 flex flex-col justify-center">
              <p className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-widest">數據更新時間</p>
              <p className="text-2xl font-bold text-slate-300 font-mono">
                {new Date(post.created_at).toLocaleString('zh-TW')}
              </p>
            </div>
          </div>

          {/* --- Tony AI 分析區塊 --- */}
          <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 p-8 rounded-[2rem] border border-blue-500/30 mb-10 relative overflow-hidden group">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
                <h2 className="text-blue-400 font-black uppercase text-xs tracking-widest">Tony AI 智慧診斷</h2>
             </div>
             <p className="text-xl text-slate-200 leading-relaxed font-medium italic relative z-10">
                "{aiAnalysis}"
             </p>
             {/* 裝飾背光效果 */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-blue-500/10 transition-all duration-700" />
          </div>

          {/* 操作區 */}
          <div className="space-y-6 text-center">
            <a 
              href={post.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block w-full bg-blue-600 hover:bg-blue-500 text-white text-center py-6 rounded-2xl font-black text-2xl shadow-[0_0_40px_rgba(37,99,235,0.15)] transition-all active:scale-[0.98]"
            >
              前往 PTT 原始貼文驗證 ↗
            </a>
            
            <p className="text-slate-600 text-xs leading-relaxed italic px-4">
              * 本數據由 P-SEO 自動化監控系統擷取自 PTT HardwareSale。AI 分析由 Gemini 2.5 Flash 驅動，僅供行情參考。
            </p>
          </div>
        </div>
      </article>
      
      {/* 頁尾 */}
      <footer className="max-w-4xl mx-auto mt-12 text-center pb-12">
        <p className="text-slate-600 text-[10px] font-mono uppercase tracking-[0.3em] opacity-50 hover:opacity-100 transition-opacity">
          © 2026 CSIE TONY LIN HARDWARE MONITORING SYSTEM. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  )
}