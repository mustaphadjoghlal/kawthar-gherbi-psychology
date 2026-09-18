/**
 * Design system: «ملاذ هادئ» — لبنات تحرير مشتركة تجعل كل حقل في الموقع قابلاً للتعديل بالطريقة نفسها.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Eye,
  EyeOff,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
} from "lucide-react";
import { toast } from "sonner";
import { ARABIC_FONTS, ICON_OPTIONS } from "@/lib/default-content";
import type { SectionCopy } from "@/types/site";

export function Field({ label, children, className = "", hint }: { label: string; children: React.ReactNode; className?: string; hint?: string }) {
  return (
    <label className={`admin-field ${className}`}>
      <span>{label}{hint && <small className="field-hint">{hint}</small>}</span>
      {children}
    </label>
  );
}

export function TextField({ label, value, onChange, className = "", hint, dir, placeholder, type = "text" }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  hint?: string;
  dir?: "rtl" | "ltr";
  placeholder?: string;
  type?: string;
}) {
  return (
    <Field label={label} className={className} hint={hint}>
      <input type={type} dir={dir} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

export function TextArea({ label, value, onChange, rows = 3, className = "full", hint, placeholder }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <Field label={label} className={className} hint={hint}>
      <textarea rows={rows} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

export function SelectField({ label, value, onChange, options, className = "", hint }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  className?: string;
  hint?: string;
}) {
  return (
    <Field label={label} className={className} hint={hint}>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </Field>
  );
}

export function FontField(props: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return <SelectField {...props} options={ARABIC_FONTS as ReadonlyArray<{ value: string; label: string }>} />;
}

export function IconField(props: { label: string; value: string; onChange: (value: string) => void }) {
  return <SelectField {...props} options={ICON_OPTIONS as ReadonlyArray<{ value: string; label: string }>} />;
}

/** مفتاح إظهار/إخفاء أي مقطع في الموقع. */
export function VisibilityToggle({ value, onChange, label = "إظهار هذا المقطع في الموقع" }: { value: boolean; onChange: (value: boolean) => void; label?: string }) {
  return (
    <button type="button" className={`visibility-toggle ${value ? "on" : "off"}`} onClick={() => onChange(!value)} aria-pressed={value}>
      {value ? <Eye size={16} /> : <EyeOff size={16} />}
      {value ? label : "هذا المقطع مخفي عن الزوار"}
    </button>
  );
}

export function RangeField({ label, value, onChange, min, max, step, unit, hint }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  hint?: string;
}) {
  return (
    <label className="admin-range-field">
      <span><strong>{label}</strong>{hint && <small>{hint}</small>}</span>
      <span className="range-control">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} />
        <code>{value}{unit}</code>
      </span>
    </label>
  );
}

export function ColorField({ label, note, value, onChange }: { label: string; note: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="theme-color-field">
      <span><strong>{label}</strong><small>{note}</small></span>
      <span className="theme-color-control">
        <input aria-label={label} type="color" value={value} onChange={(event) => onChange(event.target.value)} />
        <code>{value.toUpperCase()}</code>
      </span>
    </label>
  );
}

export function ImageField({ label, value, onChange, uploadImage }: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  uploadImage: (file: File, onProgress?: (percent: number) => void) => Promise<string>;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const handleFile = async (file?: File) => {
    if (!file) return;
    setProgress(0);
    try {
      onChange(await uploadImage(file, setProgress));
      toast.success("تم رفع الصورة.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر رفع الصورة.");
    } finally {
      setProgress(null);
    }
  };
  return (
    <div className="admin-image-field">
      <Field label={label}>
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="رابط الصورة" dir="ltr" />
      </Field>
      <label className="upload-button">
        <ImagePlus size={16} />
        {progress === null ? "رفع صورة" : `جارٍ الرفع ${progress}%`}
        <input type="file" accept="image/*" onChange={(event) => handleFile(event.target.files?.[0])} disabled={progress !== null} />
      </label>
      {progress !== null && <div className="upload-progress"><i style={{ width: `${progress}%` }} /></div>}
      {value && <img src={value} alt="معاينة" />}
    </div>
  );
}

/** حقول ترويسة مقطع كاملة: فوق-العنوان، العنوان، الوصف، الرابط، والإظهار. */
export function SectionFields({ value, onChange, options = {} }: {
  value: SectionCopy;
  onChange: (value: SectionCopy) => void;
  options?: { titleHint?: string; descriptionHint?: string; hideCta?: boolean; hideDescription?: boolean; hideVisibility?: boolean };
}) {
  const update = (key: keyof SectionCopy, next: string | boolean) => onChange({ ...value, [key]: next });
  return (
    <div className="section-fields">
      <div className="admin-form-grid">
        <TextField label="سطر فوق العنوان" value={value.eyebrow} onChange={(next) => update("eyebrow", next)} />
        <TextField label="العنوان" value={value.title} onChange={(next) => update("title", next)} hint={options.titleHint} />
        {!options.hideDescription && (
          <TextArea label="النص التوضيحي" value={value.description} onChange={(next) => update("description", next)} hint={options.descriptionHint} />
        )}
        {!options.hideCta && (
          <>
            <TextField label="نص الزر أو الرابط" value={value.ctaLabel} onChange={(next) => update("ctaLabel", next)} hint="اتركيه فارغاً لإخفاء الزر" />
            <TextField label="وجهة الزر" value={value.ctaHref} onChange={(next) => update("ctaHref", next)} dir="ltr" placeholder="/contact" />
          </>
        )}
      </div>
      {!options.hideVisibility && <VisibilityToggle value={value.visible} onChange={(next) => update("visible", next)} />}
    </div>
  );
}

/** محرر نص غني بسيط للمقالات: عناوين، قوائم، اقتباس، وروابط. */
export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = value || "";
      isInitialized.current = true;
    }
  }, [value]);

  const exec = useCallback((command: string, argument?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const addLink = useCallback(() => {
    const url = window.prompt("أدخلي الرابط:");
    if (url) exec("createLink", url);
  }, [exec]);

  const tools = [
    { icon: Bold, title: "عريض", action: () => exec("bold") },
    { icon: Italic, title: "مائل", action: () => exec("italic") },
    { icon: Heading2, title: "عنوان رئيسي", action: () => exec("formatBlock", "<h2>") },
    { icon: Heading3, title: "عنوان فرعي", action: () => exec("formatBlock", "<h3>") },
    { icon: List, title: "قائمة نقطية", action: () => exec("insertUnorderedList") },
    { icon: ListOrdered, title: "قائمة مرقمة", action: () => exec("insertOrderedList") },
    { icon: Quote, title: "اقتباس", action: () => exec("formatBlock", "<blockquote>") },
    { icon: Link2, title: "رابط", action: addLink },
    { icon: Minus, title: "فاصل", action: () => exec("insertHorizontalRule") },
  ];

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar">
        {tools.map(({ action, icon: Icon, title }) => (
          <button key={title} type="button" title={title} aria-label={title} onClick={action}><Icon size={16} /></button>
        ))}
      </div>
      <div
        ref={editorRef}
        className="rich-editor-surface"
        contentEditable
        suppressContentEditableWarning
        onInput={() => editorRef.current && onChange(editorRef.current.innerHTML)}
        onBlur={() => editorRef.current && onChange(editorRef.current.innerHTML)}
      />
    </div>
  );
}
