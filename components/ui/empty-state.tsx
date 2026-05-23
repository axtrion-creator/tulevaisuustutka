export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-dashed border-[#B9C9E4] bg-[#FBFCFE] p-5">
      <p className="font-semibold text-[#0D2956]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#607089]">{text}</p>
    </div>
  );
}
