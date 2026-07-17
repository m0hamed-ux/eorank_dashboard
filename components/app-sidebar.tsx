"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useClerk, useUser } from "@clerk/nextjs"
import {
  BarChart3,
  Briefcase,
  ChevronsUpDown,
  CreditCard,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Quote,
  Settings,
  Swords,
} from "lucide-react"

import { cn } from "@/lib/utils"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { WorkspaceSwitcher } from "@/components/workspace-switcher"

const navMain = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Score", url: "/score", icon: Gauge },
  { title: "Citations", url: "/citations", icon: Quote },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Jobs", url: "/jobs", icon: Briefcase },
  { title: "Competitors", url: "/competitors", icon: Swords },
]

const navSecondary = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Support", url: "#", icon: LifeBuoy },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user: clerkUser } = useUser()
  const { signOut } = useClerk()

  const user = {
    name: clerkUser?.fullName ?? clerkUser?.firstName ?? "Account",
    email: clerkUser?.primaryEmailAddress?.emailAddress ?? "",
    avatar: clerkUser?.imageUrl ?? "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <div className="group/logo relative flex size-8 shrink-0 items-center justify-center">
              <a
                href="#"
                className="flex size-8 items-center justify-center overflow-hidden rounded-lg transition-opacity group-data-[collapsible=icon]:group-hover/logo:opacity-0"
              >
                <Image
                  src="/logo_main.svg"
                  alt="EORank"
                  width={32}
                  height={32}
                />
              </a>
              <SidebarTrigger className="absolute inset-0 hidden size-8 group-data-[collapsible=icon]:group-hover/logo:flex" />
            </div>
            <div className="flex flex-1 items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
              <a href="#" className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">EORank</span>
                <span className="text-xs text-muted-foreground">Dashboard</span>
              </a>
              <SidebarTrigger className="ml-auto" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
        <WorkspaceSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => {
                // Prefix match keeps parents active on detail routes
                // (/jobs/job_x highlights Jobs); exact match for "/".
                const isActive =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname === item.url ||
                      pathname.startsWith(`${item.url}/`)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      className={cn(
                        "relative",
                        !isActive && "text-muted-foreground",
                        isActive &&
                          "before:absolute before:inset-y-1 before:-left-2 before:w-0.5 before:rounded-full before:bg-primary group-data-[collapsible=icon]:before:hidden"
                      )}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navSecondary.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      className={cn(
                        "relative",
                        !isActive && "text-muted-foreground",
                        isActive &&
                          "before:absolute before:inset-y-1 before:-left-2 before:w-0.5 before:rounded-full before:bg-primary group-data-[collapsible=icon]:before:hidden"
                      )}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none text-left">
                    <span className="font-semibold">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/settings?tab=account">
                      <Settings />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/billing">
                      <CreditCard />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ redirectUrl: "/sign-in" })}
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
