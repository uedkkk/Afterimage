import { getAllSettings } from "@/lib/db/queries";
import { Reveal } from "@/components/Reveal";

export const revalidate = 300;

export default async function AboutPage() {
  const settings = await getAllSettings();
  const bio = settings["about.content"] ?? "用镜头书写光影的诗篇。";
  const gearRaw = settings["about.gear"] ?? "";

  const gear = gearRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [brand, ...modelParts] = line.split(/\s+/);
      return { brand, model: modelParts.join(" ") || "" };
    });

  return (
    <div className="px-4 md:px-14 py-14">
      <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] border-t border-line">
        {/* Left — title */}
        <Reveal className="lg:border-r lg:border-line lg:p-14 p-0 lg:pt-14 pt-14">
          <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-widest text-accent mb-3.5 before:content-[''] before:w-7 before:h-px before:bg-accent">
            About the Photographer
          </div>
          <h1 className="font-display text-[clamp(28px,4vw,48px)] font-semibold leading-tight tracking-tight text-balance">
            用镜头书写
            <em className="font-serif italic font-normal text-accent">光影</em>
            的诗篇
          </h1>
        </Reveal>

        {/* Right — bio + gear */}
        <Reveal className="lg:p-14 p-0 lg:pt-14 pt-7 flex flex-col justify-center">
          <p className="font-serif text-lg leading-relaxed text-dim max-w-md mb-14">
            {bio}
          </p>

          {gear.length > 0 && (
            <div className="grid grid-cols-2 gap-0 border-t border-faint">
              {gear.map((item, i) => (
                <div
                  key={i}
                  className={`py-3.5 border-b border-faint flex justify-between items-baseline ${
                    i % 2 === 0 ? "pr-3.5 border-r border-faint" : "pl-3.5"
                  }`}
                >
                  <span className="font-display text-sm font-semibold">
                    {item.brand}
                  </span>
                  <span className="font-serif italic text-[13px] text-dim">
                    {item.model}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
