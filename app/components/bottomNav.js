"use client";

import React from "react";
import Link from "next/link";

export default function BottomNav() {
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
        <a href="/">
          <img src="/images/tetha.svg" alt="Tetha logo" className="mobile-logo" />
        </a>
      </ul>
    </nav>
  );
}
