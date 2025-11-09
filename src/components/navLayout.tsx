"use client";

import { Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem } from "@heroui/react";
import { usePathname } from "next/navigation";
import ThemeSwitcher from "./themeSwitcher";

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

const menuItems = [
  {
    name: "Home",
    url: "/",
  },
  {
    name: "Settings",
    url: "/settings",
  },
];

export default function NavLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
    <Navbar
      shouldHideOnScroll
      maxWidth="xl"
    >
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link href="/" color="foreground">
            <Logo />
            <span className="ml-1">PUBG Stats</span>
          </Link>
        </NavbarBrand>
        {/* <NavbarContent justify="start">
          {menuItems.map((item, index) => (
            <NavbarItem key={index} isActive={pathname === item.url}>
              <Link color={pathname === item.url ? "primary" : "foreground"} href={item.url}>
                {item.name}
              </Link>
            </NavbarItem>
          ))
          }
        </NavbarContent> */}
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
      </NavbarContent>
      {/* <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={index} isActive={pathname === item.url}>
            <Link href={item.url}>
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))
        }
      </NavbarMenu> */}
    </Navbar>
    {children}
    </>
  );
}