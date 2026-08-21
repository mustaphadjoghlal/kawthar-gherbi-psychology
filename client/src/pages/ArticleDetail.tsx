/**
 * Design system: «ملاذ هادئ» — تجربة قراءة مريحة، ضيقة ومدروسة بعيداً عن التشتت.
 */
import { ArrowRight } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useSiteContent } from "@/contexts/SiteContentContext";

export default function ArticleDetail() {
  const [, params] = useRoute<{ id: string }>("/articles/:id");
  const { articles } = useSiteContent();
  const article = articles.find((item) => item.id === params?.id);
  if (!article) return <main className="not-found-inline"><div className="container"><p className="eyebrow"><span />المقالات</p><h1>لم نعثر على هذا المقال.</h1><Link href="/articles" className="button-primary">العودة إلى المقالات <ArrowRight size={17} /></Link></div></main>;
  const blocks = article.content.split("\n\n");
  return (
    <main className="article-detail">
      <div className="container article-reading-wrap"><Link href="/articles" className="back-link"><ArrowRight size={17} />كل المقالات</Link><header><p className="article-meta">{article.category}<span />{new Intl.DateTimeFormat("ar-TN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(article.publishedAt))}</p><h1>{article.title}</h1><p className="article-detail-excerpt">{article.excerpt}</p></header><img className="article-detail-image" src={article.coverImage} alt="" /><article className="article-prose">{blocks.map((block, index) => block.startsWith("## ") ? <h2 key={index}>{block.replace("## ", "")}</h2> : <p key={index}>{block}</p>)}</article><div className="article-end-note">هذا المحتوى توعوي عام ولا يُعد تشخيصاً أو بديلاً عن استشارة مختصة.</div></div>
    </main>
  );
}
