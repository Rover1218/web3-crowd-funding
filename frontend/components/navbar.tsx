"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full">
      <div className="flex h-16 items-center px-4">
        <div className="flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">CryptoLaunch</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/" ? "text-foreground" : "text-foreground/60",
              )}
            >
              Home
            </Link>
            <Link
              href="/projects"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith("/projects") ? "text-foreground" : "text-foreground/60",
              )}
            >
              Projects
            </Link>
            <Link
              href="/create-campaign"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith("/create-campaign") ? "text-foreground" : "text-foreground/60",
              )}
            >
              Create Campaign
            </Link>
            <Link
              href="/profile"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith("/profile") ? "text-foreground" : "text-foreground/60",
              )}
            >
              Profile
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
        </div>
      </div>
    </nav>
  )
}

