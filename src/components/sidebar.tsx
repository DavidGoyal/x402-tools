"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const tools = [{ id: "ipfs", name: "IPFS Tool", icon: "📦" }];
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-[#141414] border-r-2 border-cyan-600/50 shadow-xl flex flex-col p-6 overflow-y-auto">
      <nav className="space-y-2">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/${tool.id}`}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              pathname === `/${tool.id}`
                ? "bg-linear-to-r from-cyan-600 to-cyan-700 text-white shadow-lg transform scale-105"
                : "text-cyan-200 hover:bg-[#1f1f1f] hover:text-white"
            }`}
          >
            <span className="text-xl">{tool.icon}</span>
            <span className="font-medium">{tool.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
