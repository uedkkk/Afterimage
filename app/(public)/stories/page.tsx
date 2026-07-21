import { getPublishedStories } from "@/lib/db/queries";
import { StoryCard } from "@/components/StoryCard";
import { Reveal } from "@/components/Reveal";

export const revalidate = 300;

export default async function StoriesPage() {
  const stories = await getPublishedStories();

  return (
    <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-12">
      <Reveal>
        <header className="pb-6 border-b border-[rgba(0,0,0,0.08)] mb-11">
          <div className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.04em] text-slate mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
            Stories
          </div>
          <h1 className="text-[clamp(28px,4vw,48px)] font-medium tracking-[-0.02em] leading-[1.1]">
            影像故事
          </h1>
        </header>
      </Reveal>

      <div className="story-grid">
        {stories.map((story, index) => (
          <Reveal key={story.id} delay={index * 50}>
            <StoryCard story={story} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
