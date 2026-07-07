import { getAllSettings } from "@/lib/db/queries";

export async function Footer() {
  const settings = await getAllSettings();
  const title = settings["site.title"] ?? "Afterimage";
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white px-6 md:px-12 pt-16 pb-12 mt-32">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[clamp(28px,3.5vw,42px)] font-medium tracking-[-0.02em] leading-[1.2] mb-12 max-w-2xl">
          光影不灭，残像永存。
          <br />
          期待与你分享下一个瞬间。
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-[0.04em] text-white/50 mb-4">
              导航
            </h4>
            <Link href="/">作品集</Link>
            <Link href="/stories">影像故事</Link>
            <Link href="/about">关于</Link>
            <Link href="/search">搜索</Link>
          </div>
          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-[0.04em] text-white/50 mb-4">
              分类
            </h4>
            <Link href="/category/travel">旅行</Link>
            <Link href="/category/city">城市</Link>
            <Link href="/category/street">街拍</Link>
            <Link href="/category/portrait">人像</Link>
          </div>
          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-[0.04em] text-white/50 mb-4">
              资源
            </h4>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              Instagram ↗
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
            <a href="/rss">RSS ↗</a>
          </div>
          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-[0.04em] text-white/50 mb-4">
              关于
            </h4>
            <span className="block text-white text-[14px] font-450 py-1.5">
              {title}
            </span>
            <span className="block text-white text-[14px] font-450 py-1.5">
              光影的残像
            </span>
          </div>
        </div>
        <div className="border-t border-white/15 pt-6 flex justify-between items-center gap-6 flex-wrap">
          <span className="text-[20px] font-semibold tracking-[-0.02em]">
            After
            <em className="italic font-450 text-white/60">image</em>
          </span>
          <span className="text-[13px] font-450 text-white/50">
            © {year} {title} · 光影的残像
          </span>
          <div className="flex gap-4">
            <SocialLink label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </SocialLink>
            <SocialLink label="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33s1.7.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48C19.13 20.17 22 16.42 22 12c0-5.52-4.48-10-10-10z" />
              </svg>
            </SocialLink>
            <SocialLink label="X">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </SocialLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Link({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="block text-white text-[14px] font-450 py-1.5 no-underline transition-colors duration-300 hover:text-white/70 cursor-pointer"
    >
      {children}
    </a>
  );
}

function SocialLink({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white transition-all duration-300 hover:bg-white hover:text-ink hover:border-white cursor-pointer"
    >
      {children}
    </a>
  );
}
