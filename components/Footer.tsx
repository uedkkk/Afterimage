import { getAllSettings } from "@/lib/db/queries";

export async function Footer() {
  const settings = await getAllSettings();
  const title = settings["site.title"] ?? "Afterimage";

  return (
    <footer className="border-t border-line px-4 md:px-14 py-14 grid grid-cols-[1fr_auto_1fr] items-center gap-7">
      <div className="text-[12px] text-dim">
        © {new Date().getFullYear()} {title}
      </div>
      <div className="font-display text-2xl font-semibold tracking-tight text-center">
        After
        <em className="font-serif italic font-normal text-accent">image</em>
      </div>
      <div className="text-[12px] text-dim text-right">
        <a href="https://instagram.com" className="hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">Instagram</a>
        {" · "}
        <a href="https://github.com" className="hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </footer>
  );
}
