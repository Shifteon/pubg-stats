"use client";

import { Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu } from "@heroui/react";
import CacheRefreshButton from "./cacheRefreshButton";
import ThemeSwitcher from "./themeSwitcher";
import { useState } from "react";
import { usePathname } from "next/navigation";

export const Logo = () => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={36}
      height={36}
    // Pass any props like className, height, width, etc.
    // {...props}
    >
      {/* Outer Circle Reticle (Targeting/Crosshair) */}
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Vertical and Horizontal Reticle Lines */}
      <path
        d="M16 2V30M2 16H30"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Minimal Bar Chart (Stats/Data) */}
      <rect x="7" y="19" width="4" height="6" fill="currentColor" />
      <rect x="12" y="14" width="4" height="11" fill="currentColor" />
      <rect x="17" y="9" width="4" height="16" fill="currentColor" />
      <rect x="22" y="12" width="4" height="13" fill="currentColor" />
    </svg>
  );
};


export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activePath = usePathname();

  const menuItems = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Isaac",
      href: "/player/isaac",
    },
    {
      label: "Cody",
      href: "/player/cody",
    },
    {
      label: "Ben",
      href: "/player/ben",
    },
    {
      label: "Trenton",
      href: "/player/trenton",
    },
  ];

  return (
    <Navbar
      shouldHideOnScroll
      maxWidth="xl"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link href="/" color="foreground">
            <Logo />
            <span className="ml-1">PUBG Stats</span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.label} isActive={activePath === item.href}>
            <Link href={item.href} color={activePath === item.href ? "primary" : "foreground"}>
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item) => (
          <NavbarItem key={item.label} isActive={activePath === item.href}>
            <Link href={item.href} color={activePath === item.href ? "primary" : "foreground"}>
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarMenu>

      <NavbarContent justify="end">
        <NavbarItem>
          <CacheRefreshButton />
        </NavbarItem>
        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}