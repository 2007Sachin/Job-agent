export function PageHeader({ title, lede, action }: { title: string; lede?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl md:text-5xl">{title}</h1>
        {lede && <p className="mt-3 max-w-[68ch] text-muted">{lede}</p>}
      </div>
      {action}
    </header>
  );
}
