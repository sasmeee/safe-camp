export function Hero() {
  return (
    <section className="relative -mx-4 -mt-4 overflow-hidden rounded-b-[28px] bg-forest px-5 pb-7 pt-5 text-sand lg:mx-0 lg:mt-0 lg:rounded-[28px] lg:px-12 lg:py-11">
      {/* contour lines */}
      <svg
        aria-hidden="true"
        viewBox="0 0 300 200"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="1.3"
        className="pointer-events-none absolute -right-10 -top-8 h-52 w-80 lg:-right-5 lg:-top-10 lg:h-102.5 lg:w-155"
      >
        <path d="M0 170C50 120 110 140 160 100S250 70 300 20" />
        <path d="M0 190C60 140 120 165 175 120S262 95 300 50" />
        <path d="M0 150C45 100 100 118 148 80S238 48 300 -10" />
        <path d="M20 200C80 160 135 185 190 140S270 120 300 82" />
        <path d="M-10 130C40 80 90 96 135 62S225 28 300 -30" />
      </svg>
      <h1 className="relative max-w-140 text-3xl font-bold leading-[1.1] tracking-tight lg:text-[46px] lg:leading-[1.08]">
        Point at it.
        <br className="lg:hidden" /> Know what to watch for.
      </h1>
      <p className="relative mt-2 max-w-130 text-sm leading-snug text-sand/80 lg:mt-3 lg:text-[17px] lg:leading-normal">
        Snap a photo of your campsite, a plant, a bug or an animal. Works with
        no signal.
      </p>
    </section>
  );
}
