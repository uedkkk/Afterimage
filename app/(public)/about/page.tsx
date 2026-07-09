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
    <div className="px-6 md:px-12 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
        {/* Left — title */}
        <Reveal>
          <div className="relative">
            <div className="absolute -top-10 -left-16 text-[120px] font-medium tracking-[-0.02em] text-ghost leading-none pointer-events-none select-none">
              About
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.04em] text-slate mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
                About the Photographer
              </div>
              <h1 className="text-[clamp(28px,4vw,52px)] font-medium leading-[1.1] tracking-[-0.02em] text-balance">
                用镜头书写
                <br />
                光影的诗篇
              </h1>
            </div>
          </div>
        </Reveal>

        {/* Right — bio + gear */}
        <Reveal>
          <div className="flex flex-col justify-center">
            <p className="text-[16px] font-450 leading-relaxed text-granite max-w-md mb-8">
              {bio}
            </p>

            {gear.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {gear.map((item, i) => (
                  <div
                    key={i}
                    className="bg-lifted rounded-button p-5 flex flex-col gap-1"
                  >
                    <span className="text-[15px] font-medium text-ink">
                      {item.brand}
                    </span>
                    <span className="text-[13px] font-450 text-slate">
                      {item.model}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
