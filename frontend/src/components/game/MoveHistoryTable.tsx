"use client";

import { Move } from "@/types/game";
import React from "react";

export const MoveHistoryTable = ({ moves }: { moves: Move[] }) => {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Group moves into pairs (White / Black)
  const pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    const w = moves[i];
    const b = moves[i + 1];
    pairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white:
        w?.sanNotation ||
        `${w?.fromSquare || w?.from || ""}→${w?.toSquare || w?.to || ""}`,
      black: b
        ? b.sanNotation ||
          `${b.fromSquare || b.from || ""}→${b.toSquare || b.to || ""}`
        : "",
    });
  }

  React.useEffect(() => {
    // Auto-scroll to the latest move
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [moves.length]);

  return (
    <div className="glass-card p-4 border-white/5 flex flex-col h-[280px]">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40 border-b border-white/5 pb-2 mb-3">
        Strategic Record (SAN)
      </h4>
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[9px] font-semibold uppercase text-foreground/30 tracking-wider">
              <th className="py-2 w-16">Move</th>
              <th className="py-2">White</th>
              <th className="py-2">Black</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair) => (
              <tr
                key={pair.moveNumber}
                className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all"
              >
                <td className="py-2 font-mono text-foreground/40">
                  {pair.moveNumber}.
                </td>
                <td className="py-2 font-semibold text-white/80">
                  {pair.white}
                </td>
                <td className="py-2 font-semibold text-white/80">
                  {pair.black}
                </td>
              </tr>
            ))}
            {pairs.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-8 text-center text-[10px] uppercase font-semibold text-foreground/20 tracking-wider"
                >
                  No moves played yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
