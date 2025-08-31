"use client";

import { ParamProps } from "@/type/appNode";
import React from "react";

export default function BrowserInstanceParam({ param }: ParamProps) {
  return <p className="text-xs">{param.name}</p>;
}
