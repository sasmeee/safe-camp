type Props = {
  level: 0 | 1 | 2 | 3;
  onClass: string;
  offClass: string;
};

export function RiskMeter({ level, onClass, offClass }: Props) {
  if (level === 0) return null;
  return (
    <div className="flex gap-1" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-1.5 w-5.5 rounded-sm lg:h-1.75 lg:w-7 ${
            n <= level ? onClass : offClass
          }`}
        />
      ))}
    </div>
  );
}
