import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const revalidate = 300;

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <main className="pt-24">{children}</main>
      <Footer />
    </>
  );
}
