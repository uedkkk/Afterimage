import Link from "next/link";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-bg/88 backdrop-blur-md border-b border-line h-14 px-4 md:px-14 flex items-center justify-between">
      <Link
        href="/"
        className="font-display text-[17px] font-semibold tracking-tight no-underline text-ink flex items-center gap-1.5"
      >
        After
        <em className="font-serif italic font-normal text-accent">image</em>
      </Link>
      <div className="hidden md:flex gap-0 absolute left-1/2 -translate-x-1/2">
        <Link
          href="/"
          className="text-ink no-underline text-[13px] font-medium px-4 py-1 transition-colors relative group"
        >
          作品
          <span className="absolute -bottom-0.5 left-4 right-4 h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </Link>
        <Link
          href="/stories"
          className="text-ink no-underline text-[13px] font-medium px-4 py-1 transition-colors relative group"
        >
          故事
          <span className="absolute -bottom-0.5 left-4 right-4 h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </Link>
        <Link
          href="/about"
          className="text-ink no-underline text-[13px] font-medium px-4 py-1 transition-colors relative group"
        >
          关于
          <span className="absolute -bottom-0.5 left-4 right-4 h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </Link>
      </div>
      <div className="flex items-center gap-2.5">
        <Link
          href="/search"
          className="border border-faint px-2.5 py-1.5 text-[12px] text-dim hover:border-ink hover:text-ink transition-colors flex items-center gap-1.5 no-underline"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          搜索
        </Link>
      </div>
    </nav>
  );
}
