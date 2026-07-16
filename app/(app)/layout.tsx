import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { PageTitle } from "@/components/page-title";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Access boundary: auth + completed onboarding required.
  // Reads live user metadata so it's never stale, unlike session claims.
  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated) {
    return redirectToSignIn();
  }

  const user = await currentUser();

  if (!user?.publicMetadata?.onboardingComplete) {
    redirect("/onboarding");
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <PageTitle />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
