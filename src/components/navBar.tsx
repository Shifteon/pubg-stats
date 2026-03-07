"use client";

import { Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import CacheRefreshButton from "./cacheRefreshButton";
import ThemeSwitcher from "./themeSwitcher";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Teams, Player } from "@/types";
import { capitalize } from "@/utils/stringUtils";

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



export const ChevronDown = ({ fill, size, height, width, ...props }: React.SVGProps<SVGSVGElement> & { size?: number | string }) => {
  return (
    <svg
      fill="none"
      height={size || height || 24}
      viewBox="0 0 24 24"
      width={size || width || 24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
    </svg>
  );
};


export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activePath = usePathname();

  const [teams, setTeams] = useState<Teams>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetch('/api/team')
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.error("Error fetching teams:", err));

    fetch('/api/player')
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch((err) => console.error("Error fetching players:", err));
  }, []);

  const menuItems = [
    {
      label: "Teams",
      items: teams.map((team) => ({
        label: team.name,
        href: `/?team=${team.teamType}`,
      })),
    },
    {
      label: "Players",
      items: players.map((player) => ({
        label: capitalize(player.name),
        href: `/player/${player.id}`,
      })),
    }
  ];

  const isActivePath = (path: string) => {
    return activePath === path;
  };



  const icons = {
    chevron: <ChevronDown fill="currentColor" size={16} />,
  };

  const navLinks = (
    <>
      <NavbarItem isActive={isActivePath("/") && !activePath.includes("?team=")}>
        <Link href="/" color={isActivePath("/") && !activePath.includes("?team=") ? "primary" : "foreground"}>
          Home
        </Link>
      </NavbarItem>
      {menuItems.map((menu) => (
        <Dropdown key={menu.label}>
          <NavbarItem>
            <DropdownTrigger>
              <Button
                disableRipple
                className="p-0 bg-transparent data-[hover=true]:bg-transparent"
                endContent={icons.chevron}
                radius="sm"
                variant="light"
              >
                {menu.label}
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu
            aria-label={`${menu.label} options`}
            className="w-[340px]"
          >
            {menu.items.map((item) => (
              <DropdownItem
                key={`${item.label}-${item.href}`}
              >
                <Link href={item.href} color={isActivePath(item.href) ? "primary" : "foreground"} className="w-full">
                  {item.label}
                </Link>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      ))}
    </>
  );

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
        {navLinks}
      </NavbarContent>

      <NavbarMenu>
        {navLinks}
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