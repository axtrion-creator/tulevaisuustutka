import { clsx } from "clsx";

export function Badge({
  children,
  tone = "default"
}: {
  children: React.ReactNode;
  tone?: "default" | "accent" | "neutral" | "risk";
}) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-md px-2.5 py-1 text-xs font-semibold",
        tone === "default" && "bg-[#EEF3FB] text-[#0D2956]",
        tone === "accent" && "bg-[#E8F7EF] text-[#17633A]",
        tone === "neutral" && "bg-[#F2F4F7] text-[#40516D]",
        tone === "risk" && "bg-[#FBEAEA] text-[#8F1D1D]"
      )}
    >
      {children}
    </span>
  );
}
