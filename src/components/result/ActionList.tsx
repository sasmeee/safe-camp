type Props = { title: string; items: string[]; stepClass: string };

export function ActionList({ title, items, stepClass }: Props) {
  return (
    <section className="flex flex-col gap-2.5 lg:gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </h3>
      <ol className="flex flex-col gap-2.5 lg:gap-3">
        {items.map((item, i) => (
          <li key={item} className="flex items-start gap-2.5 lg:gap-3">
            <span
              className={`flex size-6 flex-none items-center justify-center rounded-full text-[13px] font-bold lg:size-6.5 lg:text-sm ${stepClass}`}
            >
              {i + 1}
            </span>
            <span className="pt-px text-[15px] leading-snug lg:pt-0.5 lg:text-base">
              {item}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
