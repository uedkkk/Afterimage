import { searchPhotos } from "@/lib/db/queries";
import { SearchResults } from "@/components/SearchResults";

export const revalidate = 300;

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const results = q ? await searchPhotos(q) : [];

  return (
    <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-12">
      <SearchResults initialResults={results} query={q} />
    </div>
  );
}
