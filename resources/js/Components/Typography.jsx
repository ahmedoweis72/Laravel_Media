import { cn } from "@/lib/utils";

export function H1({ children, className, ...props }) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight dark-text-primary lg:text-5xl",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className, ...props }) {
  return (
    <h2
      className={cn(
        "scroll-m-20 text-3xl font-semibold tracking-tight dark-text-primary",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className, ...props }) {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight dark-text-primary",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function H4({ children, className, ...props }) {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight dark-text-primary",
        className
      )}
      {...props}
    >
      {children}
    </h4>
  );
}

export function P({ children, className, ...props }) {
  return (
    <p
      className={cn("leading-7 dark-text-secondary [&:not(:first-child)]:mt-6", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function Blockquote({ children, className, ...props }) {
  return (
    <blockquote
      className={cn(
        "mt-6 border-l-2 border-border pl-6 italic dark-text-secondary",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  );
}

export function List({ children, className, ...props }) {
  return (
    <ul
      className={cn("my-6 ml-6 list-disc dark-text-secondary [&>li]:mt-2", className)}
      {...props}
    >
      {children}
    </ul>
  );
}

export function InlineCode({ children, className, ...props }) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm dark-text-secondary",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}

export function Lead({ children, className, ...props }) {
  return (
    <p
      className={cn("text-xl dark-text-secondary", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function Large({ children, className, ...props }) {
  return (
    <div
      className={cn("text-lg font-semibold dark-text-secondary", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Small({ children, className, ...props }) {
  return (
    <small
      className={cn("text-sm font-medium leading-none dark-text-tertiary", className)}
      {...props}
    >
      {children}
    </small>
  );
}

export function Subtle({ children, className, ...props }) {
  return (
    <p
      className={cn("text-sm dark-text-tertiary", className)}
      {...props}
    >
      {children}
    </p>
  );
} 