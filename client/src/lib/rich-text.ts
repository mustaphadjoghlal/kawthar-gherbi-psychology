/**
 * Design system: «ملاذ هادئ» — أدوات صغيرة للمحتوى الغني المكتوب من لوحة الإدارة.
 */

/** يميّز المحتوى المكتوب بمحرر النصوص الغني عن النص البسيط المفصول بأسطر. */
export const isHtmlContent = (content: string) => /<\/?(p|h[1-6]|ul|ol|li|blockquote|br|strong|em|a|div|hr)\b/i.test(content);

/**
 * ينظّف HTML القادم من المحرر قبل عرضه: يزيل السكربتات وإطارات التضمين
 * ومعالِجات الأحداث وروابط javascript:، ويبقي على تنسيق النص.
 */
export function sanitizeHtml(html: string) {
  if (typeof window === "undefined") return html;
  const template = document.createElement("template");
  template.innerHTML = html;
  template.content.querySelectorAll("script, style, iframe, object, embed, form, input, link, meta").forEach((node) => node.remove());
  template.content.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith("on")) element.removeAttribute(attribute.name);
      if ((name === "href" || name === "src") && value.startsWith("javascript:")) element.removeAttribute(attribute.name);
    });
    if (element.tagName === "A") {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noreferrer noopener");
    }
  });
  return template.innerHTML;
}

/** يحوّل النص البسيط إلى كتل: «## عنوان» أو فقرة. */
export function toTextBlocks(content: string) {
  return content
    .split("\n\n")
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => (block.startsWith("## ") ? { type: "heading" as const, text: block.replace("## ", "") } : { type: "paragraph" as const, text: block }));
}
