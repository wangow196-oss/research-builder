"use client";

import { StoreProvider } from "@/lib/store";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { StatusBar } from "./StatusBar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <div className="flex h-full w-full">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
          <StatusBar />
        </div>
      </div>
    </StoreProvider>
  );
}
