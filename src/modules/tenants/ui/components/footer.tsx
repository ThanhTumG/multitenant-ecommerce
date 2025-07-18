import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Link from "next/link";
import React from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

const Footer = () => {
  return (
    <footer className="border-t font-medium bg-white">
      <div
        className="max-w-(--breakpoint-xl) mx-auto flex gap-2 items-center
       h-full px-4 py-6 lg:px-12"
      >
        <p>Powered by</p>
        <Link
          href="/"
          className={cn("text-2xl font-semibold", poppins.className)}
        >
          funroad
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
