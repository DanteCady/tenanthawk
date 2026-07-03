import type { ComponentPropsWithoutRef, ReactNode } from "react";

type HProps = ComponentPropsWithoutRef<"h2">;
type PProps = ComponentPropsWithoutRef<"p">;
type UlProps = ComponentPropsWithoutRef<"ul">;
type OlProps = ComponentPropsWithoutRef<"ol">;
type LiProps = ComponentPropsWithoutRef<"li">;
type AProps = ComponentPropsWithoutRef<"a">;
type StrongProps = ComponentPropsWithoutRef<"strong">;
type BlockquoteProps = ComponentPropsWithoutRef<"blockquote">;
type CodeProps = ComponentPropsWithoutRef<"code">;

export const mdxComponents = {
  h2: ({ className, ...props }: HProps) => (
    <h2
      {...props}
      className={`scroll-mt-28 text-xl font-semibold tracking-tight text-slate-900 ${className ?? ""}`}
    />
  ),
  h3: ({ children, id, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3 id={id} className="mt-6 text-lg font-semibold text-slate-900" {...props}>
      {children}
    </h3>
  ),
  p: ({ children }: PProps) => (
    <p className="text-sm leading-relaxed text-slate-700">{children}</p>
  ),
  ul: ({ children }: UlProps) => (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
      {children}
    </ul>
  ),
  ol: ({ children }: OlProps) => (
    <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
      {children}
    </ol>
  ),
  li: ({ children }: LiProps) => <li>{children}</li>,
  a: ({ href, children }: AProps) => (
    <a
      href={href}
      className="font-medium text-blue-700 underline decoration-blue-200 underline-offset-2 hover:text-blue-800"
    >
      {children}
    </a>
  ),
  strong: ({ children }: StrongProps) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  blockquote: ({ children }: BlockquoteProps) => (
    <blockquote className="border-l-4 border-blue-200 pl-4 text-sm italic text-slate-600">
      {children}
    </blockquote>
  ),
  code: ({ children }: CodeProps) => (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
      {children}
    </code>
  ),
} satisfies Record<string, (props: { children?: ReactNode }) => ReactNode>;
