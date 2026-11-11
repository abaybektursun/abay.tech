interface Props {
  children: React.ReactNode;
  caption?: string;
}

export default function ChartFigure({ children, caption }: Props) {
  return (
    <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5 mt-8">
      {children}
      {caption && (
        <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
