import { cn } from "@/lib/utils";

const controlClasses =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600";

export function Input({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return <input className={cn(controlClasses, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return <textarea className={cn(controlClasses, className)} {...props} />;
}

export function Select({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return <select className={cn(controlClasses, "bg-white", className)} {...props} />;
}

export function Label({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-1 block text-sm font-medium text-gray-700", className)}
      {...props}
    />
  );
}

export function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}
