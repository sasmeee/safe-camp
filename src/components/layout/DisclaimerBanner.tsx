import { Icon } from "../ui/Icon";

export function DisclaimerBanner() {
  return (
    <div className="flex gap-2.5 rounded-xl border border-warn-line bg-warn-bg px-3 py-2.5 text-[13px] leading-snug text-warn-ink lg:px-4 lg:py-3 lg:text-sm">
      <Icon name="info" size={18} className="mt-px flex-none" />
      <p>Visual guidance only. Check the whole site and follow local guidance.</p>
    </div>
  );
}