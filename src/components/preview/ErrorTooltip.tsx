'use client';

interface ErrorTooltipProps {
  error: string | null;
  children: React.ReactNode;
}

export function ErrorTooltip({ error, children }: ErrorTooltipProps) {
  if (!error) return <>{children}</>;

  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
        {error}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-600" />
      </div>
    </div>
  );
}
