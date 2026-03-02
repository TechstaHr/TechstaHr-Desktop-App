import { AppSidebar } from "@/components/AppSidebar";
import MobileNav from "@/components/MobileNav";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import logoImg from "@/public/images/techstahr-logo.svg";
import SearchBar from "@/components/Searchbar";
import TopNav from "@/components/TopNav";
import ClientAuthWrapper from "@/components/ClientAuthWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <ClientAuthWrapper redirectTo="/login">
      <SidebarProvider>
        <main className="flex w-full font-inter">
          <div className="flex flex-col">
            <SidebarTrigger
              className="sticky top-4 z-30 m-4 hidden lg:block"
              size="icon"
            />
            <AppSidebar />
          </div>
          <div className="flex size-full flex-col">
            <div className="sticky top-0 z-30 flex items-center justify-between bg-white px-2 py-4 shadow-xl md:px-5 lg:shadow-none">
              <div className="flex items-center gap-4">
                <div className="flex items-center lg:hidden">
                  <MobileNav />
                </div>
                <Image src={logoImg} className="lg:w-12" alt="logo" />
                <SearchBar />
              </div>
              <TopNav />
            </div>
            <div
              className="h-full bg-white pb-8 pt-12"
              style={{
                boxShadow: `inset 6px 0 6px -6px rgba(0, 0, 0, 0.1),  /* Left */
                            inset 0 6px 6px -6px rgba(0, 0, 0, 0.1)   /* Top */`,
              }}
            >
              {children}
            </div>
          </div>
        </main>
      </SidebarProvider>
    </ClientAuthWrapper>
  );
}
