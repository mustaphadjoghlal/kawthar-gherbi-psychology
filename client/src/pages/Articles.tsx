/**
 * Design system: «ملاذ هادئ» — مقالات تحريرية بخطوط تنفس ومسافات قراءة سخية.
 */
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { PageLead } from "@/components/PageLead";
import { useSiteContent } from "@/contexts/SiteContentContext";

export default function Articles() {
  const { articles } = useSiteContent();
  return (
    <main>
      <PageLead eyebrow="المقالات" title="قراءات ترافقك في اليوم العادي." description="محتوى توعوي بسيط يفتح أسئلة صغيرة حول العناية النفسية والعلاقات والتوازن اليومي." />
      <section className="articles-list-section"><div className="container articles-list">{articles.map((article, index) => <article key={article.id} className={`article-list-item article-list-${index + 1}`}><Link href={`/articles/${article.id}`} className="article-list-image"><img src={article.coverImage} alt="" /></Link><div className="article-list-body"><p className="article-meta">{article.category}<span />{new Intl.DateTimeFormat("ar-TN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(article.publishedAt))}</p><h2><Link href={`/articles/${article.id}`}>{article.title}</Link></h2><p>{article.excerpt}</p><Link href={`/articles/${article.id}`} className="text-action">تابعي القراءة <ArrowLeft size={17} /></Link></div></article>)}</div></section>
    </main>
  );
}
