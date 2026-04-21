"use client";

import React, { useEffect, useState } from "react";
import "./StarBackground.css";

export default function StarBackground() {
  const [mounted, setMounted] = useState(false);
  const [shadows, setShadows] = useState({ small: "", medium: "", big: "" });

  useEffect(() => {
    const generateStars = (n: number) => {
      let value = `${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`;
      for (let i = 2; i <= n; i++) {
          value += `, ${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`;
      }
      return value;
    };

    setShadows({
      small: generateStars(700),
      medium: generateStars(200),
      big: generateStars(100)
    });
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_bottom,_#1B2735_0%,_#090A0F_100%)] overflow-hidden" />
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_bottom,_#1B2735_0%,_#090A0F_100%)] overflow-hidden"
      style={{
        "--shadows-small": shadows.small,
        "--shadows-medium": shadows.medium,
        "--shadows-big": shadows.big,
      } as React.CSSProperties}
    >
      <div className="stars-animation w-[1px] h-[1px]" />
      <div className="stars-animation-100 w-[2px] h-[2px]" />
      <div className="stars-animation-150 w-[3px] h-[3px]" />
    </div>
  );
}
