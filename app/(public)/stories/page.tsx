import { getPublishedStories } from "@/lib/db/queries";
import { StoryCard } from "@/components/StoryCard";
import { Reveal } from "@/components/Reveal";

export const revalidate = 300;

export default async function StoriesPage() {
  const stories = await getPublishedStories();

  return (
    <div className="px-14 py-14">
      <Reveal>
        <header className="mb-10 pb-7 border-b border-line">
          <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-widest text-accent mb-3 before:content-[''] before:w-7 before:h-px before:bg-accent">
            Stories
          </div>
          <h1 className="font-display text-[clamp(28px,4vw,48px)] font-semibold tracking-tight">
            照片故事
          </h1>
        </header>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {stories.map((story, index) => (
          <Reveal key={story.id} delay={index * 50}>
            <StoryCard story={story} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
