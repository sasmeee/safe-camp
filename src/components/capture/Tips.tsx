import { Icon, type IconName } from "../ui/Icon";

const ITEMS: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "sun",
    title: "Good light",
    desc: "Dark photos get flagged. Retake in brighter light.",
  },
  {
    icon: "focus",
    title: "Hold steady",
    desc: "Blurry photos get flagged. Steadier focus helps.",
  },
  {
    icon: "crosshair",
    title: "One subject",
    desc: "Fill the frame with one plant, bug or animal.",
  },
];

const LABEL = "text-xs font-semibold uppercase tracking-wider text-muted";

export function Tips() {
  return (
    <>
      {/* phone: three small cards */}
      <section className="flex flex-col gap-2 lg:hidden">
        <h2 className={LABEL}>For a better read</h2>
        <ul className="grid grid-cols-3 gap-2">
          {ITEMS.map((item) => (
            <li
              key={item.title}
              className="flex flex-col items-center gap-2 rounded-[14px] border border-line bg-white px-2 py-3 text-center text-[12.5px] font-medium leading-tight"
            >
              <Icon name={item.icon} size={22} />
              {item.title}
            </li>
          ))}
        </ul>
      </section>

      {/* desktop: side panel */}
      <section className="hidden flex-col gap-4.5 rounded-3xl border border-line bg-white p-6 lg:flex">
        <div>
          <h2 className="mb-1 text-xl font-bold tracking-tight">
            Your result shows here
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Pick a photo and SafeCamp tells you what it spotted and what to do
            next.
          </p>
        </div>
        <h3 className={LABEL}>For a better read</h3>
        <ul className="flex flex-col gap-4.5">
          {ITEMS.map((item) => (
            <li key={item.title} className="flex items-start gap-3.5">
              <span className="flex size-10 flex-none items-center justify-center rounded-xl bg-moss">
                <Icon name={item.icon} size={22} />
              </span>
              <div>
                <p className="text-[15px] font-semibold">{item.title}</p>
                <p className="text-sm leading-snug text-muted">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-auto border-t border-line pt-3.5 text-[13px] text-muted">
          Runs on this device. Photos stay with you.
        </p>
      </section>
    </>
  );
}
