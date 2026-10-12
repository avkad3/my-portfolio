"use client";

import dynamic from "next/dynamic";
import { RcaePlayground } from "@/components/lab/rcae-playground";
import { AsciiPreview } from "./ascii-preview";
import { FingerprintDemo } from "./fingerprint-demo";
import { OrderFlow } from "./order-flow";

const ph = () => <div className="panel dot-bg h-[480px]" />;
const DependencyGraph = dynamic(() => import("./dependency-graph"), { ssr: false, loading: ph });
const PriceChart = dynamic(() => import("./price-chart"), { ssr: false, loading: ph });

/** Interactive centrepiece for a case study, where one exists. */
export function CaseVisual({ slug }: { slug: string }) {
  switch (slug) {
    case "pycodeatlas":
      return <DependencyGraph />;
    case "cmpis":
      return <PriceChart />;
    case "mini-order-fulfillment":
      return <OrderFlow />;
    case "maps-competitor-intelligence":
      return <FingerprintDemo />;
    case "rcae-reservations":
      return <RcaePlayground />;
    case "ascii-lab":
      return (
        <div className="panel grid min-h-[360px] place-items-center bg-black p-4">
          <AsciiPreview />
        </div>
      );
    default:
      return null;
  }
}
