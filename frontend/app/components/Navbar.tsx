//components/Navbar.tsx
"use client";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { SearchBar } from "./Searchbar";
import ThemeSwitch from "./ThemeSwitch";
function Navbar() {
  return (
    <div className="sticky top-0 z-50 w-full bg-white shadow px-4 py-2 flex items-center justify-between space-x-4">
      <NavigationMenu>
        <NavigationMenuList className="flex items-center">
          <NavigationMenuItem>
            <NavigationMenuLink href="/" className="font-bold text-lg">
              Clarifield
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="w-full max-w-md">
        <SearchBar/>
      </div>

      <div className="flex items-center space-x-4">
      <ThemeSwitch />
      </div>    
    </div>
  );
}

export default Navbar;
