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
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
        <a href="/">
          <img src="/images/tetha.svg" alt="Tetha logo" className="mobile-logo" />
        </a>
      </ul>
    </nav>
  );
}
