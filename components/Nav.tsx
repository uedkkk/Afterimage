import Link from "next/link";

export function Nav() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-white rounded-pill px-8 py-3 flex items-center gap-12 shadow-nav">
      <Link
        href="/"
        className="text-[18px] font-semibold tracking-[-0.02em] no-underline text-ink whitespace-nowrap"
      >
        After
        <em className="italic font-450 text-charcoal">image</em>
      </Link>
      <div className="hidden md:flex gap-10 items-center">
        <Link
          href="/"
          className="text-ink no-underline text-[15px] font-medium tracking-[-0.01em] transition-colors duration-300 hover:text-charcoal"
        >
          作品
        </Link>
        <Link
          href="/stories"
          className="text-ink no-underline text-[15px] font-medium tracking-[-0.01em] transition-colors duration-300 hover:text-charcoal"
        >
          故事
        </Link>
        <Link
          href="/about"
          className="text-ink no-underline text-[15px] font-medium tracking-[-0.01em] transition-colors duration-300 hover:text-charcoal"
        >
          关于
        </Link>
      </div>
      <Link
        href="/search"
        className="w-10 h-10 rounded-full border border-ink flex items-center justify-center text-ink transition-all duration-300 hover:bg-ink hover:text-canvas no-underline"
        aria-label="搜索作品"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </Link>
    </nav>
  );
}
