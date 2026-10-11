import Image from "next/image";

const REPO = "https://github.com/sasmeee/safe-camp";
const CHALLENGE = "https://dev.to/challenges/hacktoberfest-week1-2026-10-05";

const LINK =
  "inline-flex h-9 items-center justify-center rounded-full border border-line px-3 transition-colors hover:bg-moss focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

import GitHubLogo from "@/../public/github.svg";
import HacktoberfestLogo from "@/../public/hacktoberfest-2026.svg";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-5 text-center lg:justify-between lg:px-6 lg:text-left">
        <p className="text-sm text-muted">
          Open source (MIT). Runs on your device. Photos never leave it.
        </p>
        <nav
          aria-label="Project links"
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="SafeCamp on GitHub"
            className={LINK}
          >
            <Image
              src={GitHubLogo}
              alt="GitHub"
              width={20}
              height={20}
              className="h-4 w-auto"
            />
          </a>
          <a
            href={CHALLENGE}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Hacktoberfest challenge on DEV"
            className={LINK}
          >
            <Image
              src={HacktoberfestLogo}
              alt="Hacktoberfest"
              width={80}
              height={20}
              className="h-3.5 w-auto"
            />
          </a>
        </nav>
      </div>
    </footer>
  );
}
