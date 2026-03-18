"use client";

import { useEffect } from "react";

export default function Providers({ children }) {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.min.js");
  }, []);

  return children;
}
