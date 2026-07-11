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
      className={`scroll-mt-28 text-xl font-semibold tracking-tight text-mk-ink ${className ?? ""}`}
    />
  ),
  h3: ({ children, id, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3 id={id} className="mt-6 text-lg font-semibold text-mk-ink" {...props}>
      {children}
    </h3>
  ),
  p: ({ children }: PProps) => (
    <p className="text-sm leading-relaxed text-mk-ink2">{children}</p>
  ),
  ul: ({ children }: UlProps) => (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-mk-ink2">
      {children}
    </ul>
  ),
  ol: ({ children }: OlProps) => (
    <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-mk-ink2">
      {children}
    </ol>
  ),
  li: ({ children }: LiProps) => <li>{children}</li>,
  a: ({ href, children }: AProps) => (
    <a
      href={href}
      className="font-medium text-mk-amber-deep underline decoration-blue-200 underline-offset-2 hover:text-mk-amber"
    >
      {children}
    </a>
  ),
  strong: ({ children }: StrongProps) => (
    <strong className="font-semibold text-mk-ink">{children}</strong>
  ),
  blockquote: ({ children }: BlockquoteProps) => (
    <blockquote className="border-l-4 border-mk-amber-line pl-4 text-sm italic text-mk-soft">
      {children}
    </blockquote>
  ),
  code: ({ children }: CodeProps) => (
    <code className="rounded bg-mk-tint px-1.5 py-0.5 font-mono text-xs text-mk-ink2">
      {children}
    </code>
  ),
} satisfies Record<string, (props: { children?: ReactNode }) => ReactNode>;
