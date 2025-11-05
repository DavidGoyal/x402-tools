"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex h-[calc(100vh-76px)] sm:h-[calc(100vh-80px)] w-full overflow-hidden">
        {!isHomePage && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
        <div className="flex-1 w-full overflow-hidden lg:ml-0">
          {children}
        </div>
      </div>
    </>
  );
}

