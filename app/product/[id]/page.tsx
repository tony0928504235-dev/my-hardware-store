import { createClient } from '@supabase/supabase-js'

// 初始化連線
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params
  
  // 依照 ID 去「硬體貼文」表格抓資料
  const { data: post } = await supabase
    .from('硬體貼文')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) return <div className="p-20 text-center">找不到該硬體型號。</div>

  return (
    <div className="max-w-4xl mx-auto p-10 font-sans">
      <div className="mb-10"><a href="/" className="text-blue-500">← 返回總覽</a></div>
      <article className="border border-slate-200 rounded-3xl p-8 bg-white shadow-sm">
        <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs">ID: {id}</span>
        <h1 className="text-3xl font-black mt-4 mb-6">{post.title}</h1>
        <div className="flex gap-6 mb-10">
          <div className="bg-blue-50 p-6 rounded-2xl flex-1">
            <p className="text-sm text-blue-400">當前行情</p>
            <p className="text-4xl font-mono font-bold text-blue-600">{post.price}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl flex-1">
            <p className="text-sm text-slate-400">觀測日期</p>
            <p className="text-lg font-medium">{new Date(post.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <a href={post.link} target="_blank" className="block w-full bg-slate-900 text-white text-center py-4 rounded-xl font-bold">
          前往 PTT 查看原始貼文
        </a>
      </article>
    </div>
  )
}