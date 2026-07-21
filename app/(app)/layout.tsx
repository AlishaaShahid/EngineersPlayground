import { SidebarNav } from "@/components/layout/sidebar-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r">
        <div className="border-b px-4 py-4">
          <span className="text-lg font-semibold">AI-Hub</span>
        </div>
        <SidebarNav />
        <div className="mt-auto flex flex-col gap-2 border-t px-4 py-3">
          <span className="truncate text-xs text-muted-foreground">
            {user?.email}
          </span>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
