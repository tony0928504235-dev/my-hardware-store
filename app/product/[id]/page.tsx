import { createClient } from '@supabase/supabase-js'

// 初始化連線
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 注意：Next.js 15 的 params 必須宣告為 Promise
export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  
  // 1. 關鍵步驟：必須先 await 才能拿到網址上的 id
  const { id } = await params
  
  // 2. 依照 ID 去「硬體貼文」表格抓資料
  const { data: post, error } = await supabase
    .from('硬體貼文')
    .select('*')
    .eq('id', id)
    .single()

  // 3. 如果找不到資料，顯示除錯資訊
  if (!post) {
    return (
      <div className="p-20 text-center font-sans">
        <h1 className="text-xl mb-4">找不到該硬體型號</h1>
        <p className="text-slate-400">目前網址抓到的 ID 是：<span className="text-red-500 font-mono">{id}</span></p>
        <div className="mt-10"><a href="/" className="text-blue-500 underline">← 返回總覽</a></div>
      </div>
    )
  }

  // 4. 成功抓到資料後的畫面
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 font-sans">
      <div className="mb-10">
        <a href="/" className="text-blue-500 hover:underline">← 返回總覽</a>
      </div>
      
      <article className="border border-slate-200 rounded-3xl p-8 bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
            ID: {id}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 text-sm">{post.product_type || '硬體組件'}</span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <p className="text-sm text-blue-500 mb-1">PTT 監測行情</p>
            <p className="text-4xl font-mono font-bold text-blue-600">{post.price}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">數據更新日期</p>
            <p className="text-lg font-bold text-slate-700">
              {new Date(post.created_at).toLocaleDateString('zh-TW')}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 mt-4">
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            * 本數據自動由 PTT HardwareSale 板塊擷取。價格為觀測當下之紀錄，實際成交價請點擊下方按鈕前往原始貼文確認。
          </p>
          <a 
            href={post.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full bg-slate-900 text-white text-center py-4 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg"
          >
            前往 PTT 查看原始貼文驗證價格
          </a>
        </div>
      </article>
    </div>
  )
}