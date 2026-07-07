import { getPublishedStories } from "@/lib/db/queries";
import { StoryCard } from "@/components/StoryCard";
import { Reveal } from "@/components/Reveal";

export const revalidate = 300;

export default async function StoriesPage() {
  const stories = await getPublishedStories();

  return (
    <div className="px-6 md:px-12 py-12">
      <Reveal>
        <header className="mb-12 pb-8 border-b border-ink">
          <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.04em] text-slate mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
            Stories
          </div>
          <h1 className="text-[clamp(28px,4vw,48px)] font-medium tracking-[-0.02em]">
            影像故事
          </h1>
        </header>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {stories.map((story, index) => (
          <Reveal key={story.id} delay={index * 50}>
            <StoryCard story={story} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
