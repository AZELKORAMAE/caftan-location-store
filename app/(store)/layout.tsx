import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { CartDrawer } from "@/components/site/CartDrawer";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Providers } from "@/components/site/Providers";
import { getCollections } from "@/lib/data";

export const revalidate = 60;

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const collections = await getCollections();
  const nav = collections.map(({ name, slug, image_url }) => ({ name, slug, image_url }));

  return (
    <Providers>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2">
        Aller au contenu
      </a>
      <AnnouncementBar />
      <Header collections={nav} />
      <main id="contenu">{children}</main>
      <Footer collections={nav} />
      <CartDrawer />
    </Providers>
  );
}
