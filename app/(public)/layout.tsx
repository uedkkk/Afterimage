import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { IndexBar } from "@/components/IndexBar";

export const revalidate = 300;

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <IndexBar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
