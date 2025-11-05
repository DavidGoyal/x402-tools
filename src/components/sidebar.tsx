"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { HiXMark } from "react-icons/hi2";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const tools = [{ id: "ipfs", name: "IPFS Tool", icon: "📦" }];
  const pathname = usePathname();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isOpen && onClose) {
      // Close after a short delay to allow navigation
      const timer = setTimeout(() => {
        onClose();
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Only close when pathname changes, not when isOpen/onClose change

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static top-0 left-0 h-full bg-[#141414] border-r-2 border-cyan-600/50 shadow-xl flex flex-col p-6 overflow-y-auto z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64`}
      >
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden mb-4 self-end text-cyan-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        )}
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
    </>
  );
}
