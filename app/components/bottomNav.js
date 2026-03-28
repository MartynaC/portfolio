"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BottomNav() {
  const router = useRouter();
  return (
    <nav className="bottom-nav d-md-none">
      <ul>
        <li>
          <Link href="/?view=projects">Projects</Link>
        </li>
        <li>
          <Link href="/?view=about">About</Link>
        </li>
        <li>
          <Link href="/?view=contact">Contact</Link>
        </li>
        <img
          src="/images/tetha.svg"
          alt="Tetha logo"
          className="mobile-logo"
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/")}
        />
      </ul>
    </nav>
  );
}
