import { cn } from "@/lib/utils";
import { SquareDashedMousePointer } from "lucide-react";
import Link from "next/link";
import React from "react";

const Logo = ({
  fontSize = "text-2xl",
  iconSize = 20,
}: {
  fontSize?: string;
  iconSize?: number;
}) => {
  return (
    <Link
      href="/"
      className={cn(
        "text-2xl font-extrabold flex items-center gap-2",
        fontSize
      )}>
      <div className="rounded-xl bg-gradient-to-r from-violet-400 to-violet-600 p-2">
        <SquareDashedMousePointer size={iconSize} className="stroke-white" />
      </div>
      <div>
        <span
          className="bg-gradient-to-r from-violet-600 to-indigo-400 bg-clip-text text-transparent">
          AI
        </span>
        <span
          className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
          -
        </span>
        <span
          className="bg-gradient-to-r from-fuchsia-600 to-amber-600  bg-clip-text text-transparent">
          Workflow
        </span>
      </div>
    </Link>
  );
};

export default Logo;
