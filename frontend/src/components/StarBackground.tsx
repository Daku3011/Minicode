"use client";

import React, { useMemo } from "react";
import "./StarBackground.css";

export default function StarBackground() {
  const generateStars = (n: number) => {
    let value = `${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`;
    for (let i = 2; i <= n; i++) {
        value += `, ${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`;
    }
    return value;
  };

  const shadowsSmall = useMemo(() => generateStars(700), []);
  const shadowsMedium = useMemo(() => generateStars(200), []);
  const shadowsBig = useMemo(() => generateStars(100), []);

  return (
    <div 
      className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_bottom,_#1B2735_0%,_#090A0F_100%)] overflow-hidden"
      style={{
        "--shadows-small": shadowsSmall,
        "--shadows-medium": shadowsMedium,
        "--shadows-big": shadowsBig,
      } as React.CSSProperties}
    >
      <div className="stars-animation w-[1px] h-[1px]" />
      <div className="stars-animation-100 w-[2px] h-[2px]" />
      <div className="stars-animation-150 w-[3px] h-[3px]" />
    </div>
  );
}
