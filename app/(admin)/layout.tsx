// app/(admin)/admin/layout.tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import logoImg from "@/public/images/techstahr-logo.svg";
import AdminMobileNav from "@/components/AdminMobileNav";
import { AdminSidebar } from "@/components/AdminSidebar";
import AdminTopNav from "@/components/AdminTopNav";
import ClientAuthWrapper from "@/components/ClientAuthWrapper";
import ProjectSwitcher from "@/components/ProjectSwitcher";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ClientAuthWrapper redirectTo="/login">
      <SidebarProvider>
        <main className="flex w-full font-inter">
          <div className="flex flex-col">
            <SidebarTrigger
              className="sticky top-4 z-30 m-4 hidden lg:block"
              size="icon"
            />
            <AdminSidebar />
          </div>
          <div className="flex size-full flex-col">
            <div className="sticky top-0 z-30 flex items-center justify-between bg-white px-2 py-4 shadow-xl md:px-5 lg:shadow-none">
              <div className="flex items-center gap-4">
                <div className="flex items-center lg:hidden">
                  <AdminMobileNav />
                </div>
                <Image src={logoImg} className="lg:w-16" alt="logo" />
                <p className="hidden text-lg font-semibold lg:flex">Dashboard</p>
                <ProjectSwitcher />
              </div>
              <AdminTopNav />
            </div>
            <div className="h-full bg-gray-100 py-2">{children}</div>
          </div>
        </main>
      </SidebarProvider>
    </ClientAuthWrapper>
  );
}
