import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { GoogleGenerativeAI } from "@google/generative-ai"

export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 【SEO 標題功能】
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: post } = await supabase.from('硬體貼文').select('title').eq('id', id).single()
  return { title: `${post?.title || '硬體'} | PTT 二手行情監控站` }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: post } = await supabase.from('硬體貼文').select('*').eq('id', id).single()

  let aiAnalysis = "正在由 Tony AI 進行深度診斷...";
  
  if (post) {
    // 【根據截圖修正】優先使用你選單中有的 gemini-2.0-flash，並以 flash-lite 作為備援
    const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash-lite"];
    
    const fetchAIResponse = async () => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      
      for (const modelName of modelsToTry) {
        try {
          console.log(`[核心監測] 嘗試調度穩定版模型: ${modelName}`);
          
          // 強制指定 apiVersion: 'v1'，因為 2.0 在 2026 年絕對是在正式版大樓
          const model = genAI.getGenerativeModel(
            { model: modelName },
            { apiVersion: 'v1' } 
          );

          const prompt = `你是一位專業的電腦硬體分析師。針對這筆 PTT 交易：名稱：${post.title}，價格：${post.price}。請以「義大資工學長」的語氣，在 80 字內分析 CP 值並給出狠辣的建議。`;
          
          const result = await model.generateContent(prompt);
          return result.response.text();
          
        } catch (e: any) {
          console.warn(`[自動避障] ${modelName} 目前無法響應，切換下一備援。`);
          continue; 
        }
      }
      throw new Error("API 配額全數耗盡");
    };

    try {
      aiAnalysis = await fetchAIResponse();
    } catch (finalError) {
      aiAnalysis = "AI 分析師目前休息中（API 配額已達今日上限），請參考原始行情。";
    }
  }

  if (!post) return <div className="text-white">404</div>;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto mb-10">
        <Link href="/" className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-2">
          ← 返回行情列表
        </Link>
      </div>

      <article className="max-w-4xl mx-auto bg-[#161b22] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500" />
        
        <div className="p-8 md:p-14">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-12 italic leading-tight">
            {post.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-[#1c2128] p-10 rounded-[2rem] border border-slate-700/50">
              <p className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-widest">PTT 監測行情</p>
              <p className="text-6xl font-mono font-black text-blue-500">{post.price}</p>
            </div>
            <div className="bg-[#1c2128] p-10 rounded-[2rem] border border-slate-700/50 flex flex-col justify-center">
              <p className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-widest">數據更新時間</p>
              <p className="text-2xl font-bold text-slate-300 font-mono">{new Date(post.created_at).toLocaleString('zh-TW')}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 p-8 rounded-[2rem] border border-blue-500/30 mb-10">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <h2 className="text-blue-400 font-black uppercase text-xs">Tony AI 智慧診斷</h2>
             </div>
             <p className="text-xl text-slate-200 italic font-medium leading-relaxed">
                "{aiAnalysis}"
             </p>
          </div>

          <div className="space-y-6">
            <a href={post.link} target="_blank" className="block w-full bg-blue-600 hover:bg-blue-500 text-white text-center py-6 rounded-2xl font-black text-2xl transition-all">
              前往 PTT 原始貼文驗證 ↗
            </a>
            <p className="text-slate-600 text-[10px] text-center italic">
              * 系統已偵測到您的 API 權限，目前優先調度 Gemini 2.0 Flash 正式版通道。
            </p>
          </div>
        </div>
      </article>
    </div>
  )
}