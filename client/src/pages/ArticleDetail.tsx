/**
 * Design system: «ملاذ هادئ» — تجربة قراءة مريحة، ضيقة ومدروسة بعيداً عن التشتت.
 */
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { isHtmlContent, sanitizeHtml, toTextBlocks } from "@/lib/rich-text";

export default function ArticleDetail() {
  const [, params] = useRoute<{ id: string }>("/articles/:id");
  const { articles, copy } = useSiteContent();
  const page = copy.articles;
  const article = articles.find((item) => item.id === params?.id);
  const isRich = Boolean(article && isHtmlContent(article.content));
  const html = useMemo(() => (article && isRich ? sanitizeHtml(article.content) : ""), [article?.content, isRich]);

  if (!article) {
    return (
      <main className="not-found-inline">
        <div className="container">
          <p className="eyebrow"><span />{page.lead.eyebrow}</p>
          <h1>لم نعثر على هذا المقال.</h1>
          <Link href="/articles" className="button-primary">{page.backLabel} <ArrowRight size={17} /></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="article-detail">
      <div className="container article-reading-wrap">
        <Link href="/articles" className="back-link"><ArrowRight size={17} />{page.backLabel}</Link>
        <header>
          <p className="article-meta">{article.category}<span />{new Intl.DateTimeFormat("ar-TN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(article.publishedAt))}</p>
          <h1>{article.title}</h1>
          <p className="article-detail-excerpt">{article.excerpt}</p>
        </header>
        <img className="article-detail-image" src={article.coverImage} alt="" />
        {isRich ? (
          <article className="article-prose" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <article className="article-prose">
            {toTextBlocks(article.content).map((block, index) =>
              block.type === "heading" ? <h2 key={index}>{block.text}</h2> : <p key={index}>{block.text}</p>,
            )}
          </article>
        )}
        {page.endNote && <div className="article-end-note">{page.endNote}</div>}
      </div>
    </main>
  );
}
