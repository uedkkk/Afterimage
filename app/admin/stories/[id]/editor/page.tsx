interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function StoryEditorPage({ params }: EditorPageProps) {
  const { id } = await params;

  return (
    <iframe
      src={`/koenig-editor.html?id=${encodeURIComponent(id)}`}
      style={{ width: "100vw", height: "100vh", border: "none", display: "block" }}
      title="故事编辑器"
    />
  );
}
