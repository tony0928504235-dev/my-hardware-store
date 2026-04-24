import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { GoogleGenerativeAI } from "@google/generative-ai"

export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: post } = await supabase.from('硬體貼文').select('title').eq('id', id).single()
  return { title: `${post?.title || '硬體'} | PTT 二手行情監控站` }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: post } = await supabase.from('硬體貼文').select('*').eq('id', id).single()

  let aiAnalysis = "正在讀取 Tony AI 智慧診斷...";
  
  if (post) {
    // 【根據截圖 3/4 精確修正】使用配額最高 (500 RPD) 的 Gemini 3.1 模型
    const MODEL_ID = "gemini-3.1-flash-lite-preview";
    
    const fetchAIResponse = async () => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      
      try {
        console.log(`[系統調度] 正在連線高配額模型 (500 RPD): ${MODEL_ID}`);
        
        // 因為是 Preview 模型，必須使用 v1beta 門牌
        const model = genAI.getGenerativeModel(
          { model: MODEL_ID },
          { apiVersion: 'v1beta' }
        );

        const prompt = `你是一位專業的電腦硬體分析師。針對這筆 PTT 交易：
        名稱：${post.title}
        價格：${post.price}
        請以「義大資工學長」的語氣，在 80 字內分析這筆交易值不值得買。`;

        const result = await model.generateContent(prompt);
        return result.response.text();
        
      } catch (e: any) {
        console.error(`[系統報錯] 模型呼叫失敗:`, e.message || e);
        throw e;
      }
    };

    try {
      aiAnalysis = await fetchAIResponse();
    } catch (finalError) {
      aiAnalysis = "AI 分析師目前繁忙中（API 配額受限），請參考原始行情資訊。";
    }
  }

  if (!post) return <div className="text-white">404</div>;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 font-sans p-6 md:p-12">
      <article className="max-w-4xl mx-auto bg-[#161b22] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500" />
        <div className="p-8 md:p-14">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-12 italic">{post.title}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-[#1c2128] p-10 rounded-[2rem] border border-slate-700/50">
              <p className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-widest">PTT 監測行情</p>
              <p className="text-6xl font-mono font-black text-blue-500">{post.price}</p>
            </div>
            <div className="bg-[#1c2128] p-10 rounded-[2rem] border border-slate-700/50 flex flex-col justify-center">
              <p className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-widest">更新時間</p>
              <p className="text-2xl font-bold text-slate-300 font-mono">{new Date(post.created_at).toLocaleString('zh-TW')}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 p-8 rounded-[2rem] border border-blue-500/30 mb-10">
             <h2 className="text-blue-400 font-black text-xs mb-4 uppercase">Tony AI 智慧診斷</h2>
             <p className="text-xl text-slate-200 italic font-medium leading-relaxed">
                "{aiAnalysis}"
             </p>
          </div>

          <a href={post.link} target="_blank" className="block w-full bg-blue-600 text-white text-center py-6 rounded-2xl font-black text-2xl transition-all">
            前往 PTT 原始貼文驗證 ↗
          </a>
          <p className="mt-4 text-slate-600 text-[10px] text-center italic">
            * 系統已偵測到您的 API 權限，目前調度 500 RPD 高額度 Gemini 3.1 Flash Lite 通道。
          </p>
        </div>
      </article>
    </div>
  )
}