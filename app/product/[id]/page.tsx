import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { GoogleGenerativeAI } from "@google/generative-ai"

// 強制不緩存頁面，確保能即時觸發 AI 寫入邏輯
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// --- 【關鍵：解析 Slug 工具】 ---
// 因為網址現在長得像 "72-rtx-5080"，我們只拿橫槓前的 "72"
function getRealId(slug: string) {
  return slug.split('-')[0];
}

// 【SEO 動態標題】
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params
  const realId = getRealId(slug); // 解析出真正的資料庫 ID

  const { data: post } = await supabase.from('硬體貼文').select('title').eq('id', realId).single()
  return { title: `${post?.title || '硬體'} | PTT 二手行情監控站` }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params
  const realId = getRealId(slug); // 解析出真正的資料庫 ID
  
  // 3. 使用真正的 realId 抓取資料庫數據
  const { data: post } = await supabase
    .from('硬體貼文')
    .select('*')
    .eq('id', realId)
    .single()

  // --- 【AI 智慧分析邏輯：資料庫快取進化版】 ---
  let aiAnalysis = post?.ai_analysis || "正在由 Tony AI 進行深度診斷...";

  if (post && !post.ai_analysis) {
    const MODEL_ID = "gemini-3.1-flash-lite-preview";
    
    const fetchAndStoreAI = async () => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      
      try {
        console.log(`[Cache Miss] 正在為產品 #${realId} 產生持久化分析...`);
        
        const model = genAI.getGenerativeModel(
          { model: MODEL_ID },
          { apiVersion: 'v1beta' }
        );

        const prompt = `你是一位專業的電腦硬體分析師。針對這筆 PTT 交易：
        名稱：${post.title}
        價格：${post.price}
        請以「義大資工學長」的語氣，在 80 字內分析這筆交易值不值得買，並給出 CP 值建議。`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 使用 realId 更新回資料庫
        await supabase
          .from('硬體貼文')
          .update({ ai_analysis: responseText })
          .eq('id', realId);

        return responseText;
        
      } catch (e: any) {
        console.error(`[系統報錯] AI 呼叫失敗:`, e.message || e);
        return "AI 分析師目前繁忙中，請參考原始行情資訊。";
      }
    };

    aiAnalysis = await fetchAndStoreAI();
  } else if (post?.ai_analysis) {
    console.log(`[Cache Hit] 產品 #${realId} 已有快取紀錄。`);
  }

  if (!post) return <div className="min-h-screen bg-[#0b0e14] text-white flex items-center justify-center">404 - 找不到資料</div>;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto mb-10">
        <Link href="/" className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> 返回行情列表
        </Link>
      </div>

      <article className="max-w-4xl mx-auto bg-[#161b22] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500" />
        
        <div className="p-8 md:p-14">
          <div className="flex items-center gap-3 mb-8">
            <span className="bg-blue-600/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase">
              {post.product_type || 'HARDWARE'}
            </span>
            {/* 這裡顯示 realId 讓後台對帳更方便 */}
            <span className="text-slate-600 font-mono text-xs uppercase tracking-tighter">SERIAL: #{realId}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-12 italic leading-tight tracking-tighter">
            {post.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-[#1c2128] p-10 rounded-[2rem] border border-slate-700/50 relative overflow-hidden group">
              <p className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-widest">PTT 監測行情</p>
              <p className="text-6xl font-mono font-black text-blue-500 group-hover:scale-105 transition-transform duration-500">
                {post.price}
              </p>
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <div className="bg-[#1c2128] p-10 rounded-[2rem] border border-slate-700/50 flex flex-col justify-center">
              <p className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-widest">數據更新時間</p>
              <p className="text-2xl font-bold text-slate-300 font-mono">
                {new Date(post.created_at).toLocaleString('zh-TW')}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 p-8 rounded-[2rem] border border-blue-500/30 mb-10 relative overflow-hidden group">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
                <h2 className="text-blue-400 font-black uppercase text-xs tracking-widest">Tony AI 智慧診斷</h2>
             </div>
             <p className="text-xl text-slate-200 leading-relaxed font-medium italic relative z-10">
                "{aiAnalysis}"
             </p>
          </div>

          <div className="space-y-6">
            <a 
              href={post.link} 
              target="_blank" 
              className="block w-full bg-blue-600 hover:bg-blue-500 text-white text-center py-6 rounded-2xl font-black text-2xl shadow-xl transition-all active:scale-[0.98]"
            >
              前往 PTT 原始貼文驗證 ↗
            </a>
            <p className="text-slate-600 text-[10px] text-center italic">
              * 系統已實作 SEO Slugs 與資料庫快取技術。
            </p>
          </div>
        </div>
      </article>
      
      <footer className="max-w-4xl mx-auto mt-12 text-center pb-12">
        <p className="text-slate-600 text-[10px] font-mono uppercase tracking-[0.3em] opacity-30 hover:opacity-100 transition-opacity">
          © 2026 CSIE TONY LIN HARDWARE MONITORING SYSTEM.
        </p>
      </footer>
    </div>
  )
}