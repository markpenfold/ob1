"use client";

import { useEffect, useRef } from "react";
import ob1Sketch from "@/sketches/ob1Sketch";

export default function P5Canvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    let p5Instance;

    import("p5").then((p5Module) => {
      const p5 = p5Module.default;
      p5Instance = new p5(ob1Sketch, containerRef.current);
    });

    return () => {
      if (p5Instance) p5Instance.remove();
    };
  }, []);

  return <div ref={containerRef} />;
}
