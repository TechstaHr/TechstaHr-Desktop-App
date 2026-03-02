"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { sidebarLinks } from "@/constants";
import Link from "next/link";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", query);
  };

  const handleOpenModal = () => setIsModalOpen(true);

  return (
    <>
      <div className="relative">
        <Button
          type="button"
          onClick={handleOpenModal}
          className="h-6 w-6 rounded-sm bg-gray-300 p-2 lg:hidden"
          aria-label="Open search modal"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Desktop search input stays visible */}
        <div
          onClick={handleOpenModal}
          className="hidden h-9 w-[300px] items-center gap-2 rounded-sm border p-2 lg:flex xl:w-[400px]"
        >
          <button>
            <Search className="h-4 w-4" stroke="#71717A" />
          </button>
          <p className="text-xs">Search...</p>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="hide-scrollbar w-full max-w-lg rounded-lg p-4 shadow-xl">
          <div className="flex items-center gap-2 border-b pb-2">
            <Search className="h-4 w-4" stroke="#71717A" />
            <Input
              type="text"
              placeholder="Search tasks, projects, issues..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="flex-1 border-none pl-0 shadow-none focus-visible:outline-none focus-visible:ring-0"
            />
          </div>

          <div className="mt-4 max-h-[400px] space-y-4 overflow-y-auto">
            <section>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                Quick Links
              </h4>
              <ul className="space-y-1">
                {sidebarLinks.map((link) => (
                  <Link href={link.route}>
                    <li
                      key={link.label}
                      className="cursor-pointer rounded p-2 text-sm hover:bg-gray-100"
                    >
                      {link.label}
                    </li>
                  </Link>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                Tasks
              </h4>
              <ul className="space-y-1">
                {["Fix bug #123", "Update onboarding docs"].map((task) => (
                  <li
                    key={task}
                    className="cursor-pointer rounded p-2 text-sm hover:bg-gray-100"
                  >
                    {task}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                Projects
              </h4>
              <ul className="space-y-1">
                {["Website Redesign", "Marketing Campaign"].map((project) => (
                  <li
                    key={project}
                    className="cursor-pointer rounded p-2 text-sm hover:bg-gray-100"
                  >
                    {project}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                Issues
              </h4>
              <ul className="space-y-1">
                {["Login error", "Broken link"].map((issue) => (
                  <li
                    key={issue}
                    className="cursor-pointer rounded p-2 text-sm hover:bg-gray-100"
                  >
                    {issue}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
