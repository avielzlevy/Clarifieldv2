//components/Sidebar.tsx
import { Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

function CustomSidebar({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <Sidebar className="fixed top-[40px] left-0 h-[calc(100vh-72px)] w-64 z-40" />
      <main className="mt-[5px]">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}

export default CustomSidebar;
