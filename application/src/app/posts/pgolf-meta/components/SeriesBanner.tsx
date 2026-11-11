const PARTS = [
  { num: 1, title: "The Exploration", href: "/posts/pgolf-meta", ready: true },
  { num: 2, title: "The 1,000-Step Oracle", href: "/posts/pgolf-oracle", ready: false },
  { num: 3, title: "Cross-Hardware Prediction", href: "/posts/pgolf-prediction", ready: false },
];

export default function SeriesBanner({ current }: { current: number }) {
  return (
    <nav className="mb-10">
      <div className="border-b border-zinc-100 pb-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-4">
          Parameter Golf Deep Dive
        </p>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {PARTS.map((p) => {
            const isCurrent = p.num === current;
            if (isCurrent) {
              return (
                <span
                  key={p.num}
                  className="text-zinc-900 font-semibold text-sm"
                >
                  Part {p.num}{" "}
                  <span className="font-normal text-zinc-500">
                    {p.title}
                  </span>
                </span>
              );
            }
            if (p.ready) {
              return (
                <a
                  key={p.num}
                  href={p.href}
                  className="text-zinc-400 text-sm hover:text-zinc-600 transition-colors"
                >
                  Part {p.num}{" "}
                  <span className="text-zinc-300">{p.title}</span>
                </a>
              );
            }
            return (
              <span key={p.num} className="text-zinc-300 text-sm">
                Part {p.num}{" "}
                <span className="text-zinc-200">{p.title}</span>
              </span>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
