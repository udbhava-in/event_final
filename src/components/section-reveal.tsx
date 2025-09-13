"use client";

import type React from "react";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SectionReveal(
  { children }: { children: React.ReactNode },
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
      },
    });
    tl.fromTo(
      el,
      { opacity: 0, y: 20, filter: "blur(6px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power2.out",
      },
    );
    return () => {
      tl.kill();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
