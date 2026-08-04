/**
 * Chrome primitives, styled to the platform design system.
 * No raw hex, font or pixel value lives here — everything resolves through the
 * theme tokens in styles.css so one file rebrands the whole app.
 */
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "bg-surface text-foreground border border-border hover:bg-sunken",
  ghost: "text-muted hover:bg-sunken hover:text-foreground",
  danger: "bg-surface text-danger border border-border hover:bg-danger-tint",
};

export function Button({
  variant = "secondary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...rest}
      className={`inline-flex h-8 items-center justify-center gap-x-1.5 rounded-sm px-2 text-sm font-medium
        transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    />
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-border bg-surface ${className}`}>{children}</div>;
}

/** A labelled zone inside a card. Every zone after the first draws a divider. */
export function Zone({
  label,
  action,
  children,
  first = false,
}: {
  label: string;
  action?: ReactNode;
  children: ReactNode;
  first?: boolean;
}) {
  return (
    <div className={`p-5 ${first ? "" : "border-t border-border"}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Eyebrow>{label}</Eyebrow>
        {action}
      </div>
      {children}
    </div>
  );
}

/** A fact. Quiet by construction. */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-border bg-sunken px-2 py-1 text-[0.6875rem] text-muted">
      {children}
    </span>
  );
}

/** A signal. Tinted pill, normal weight — never bold. */
export function Badge({ tone, children }: { tone: "success" | "warning" | "danger"; children: ReactNode }) {
  const tones = {
    success: "bg-success-tint text-success border-success/30",
    warning: "bg-warning-tint text-warning border-warning/30",
    danger: "bg-danger-tint text-danger border-danger/30",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-[0.04em] text-muted">{label}</span>
      {children}
      {hint ? <span className="text-[0.6875rem] text-faint">{hint}</span> : null}
    </label>
  );
}

const CONTROL =
  "w-full rounded-sm border border-border bg-surface px-2.5 py-2 text-[0.8125rem] text-foreground " +
  "placeholder:text-faint focus:border-ring focus:outline-none";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${CONTROL} h-9 ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${CONTROL} ${props.className ?? ""}`} />;
}

/**
 * Borderless by design — an empty bordered box reads as a broken component.
 * The border earns its place only once there are rows to contain.
 */
export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <p className="max-w-sm text-sm text-muted">{title}</p>
      {action}
    </div>
  );
}

/** A raised white pill on a sunken track — never an ink fill. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex gap-0.5 rounded-lg bg-sunken p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-sm px-2.5 py-1 text-sm font-medium transition-colors duration-150 ${
            value === o.value
              ? "border border-border bg-surface text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              : "border border-transparent text-muted hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-[0.8125rem] text-muted">
      <span className="size-3 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden />
      {label}
    </div>
  );
}
