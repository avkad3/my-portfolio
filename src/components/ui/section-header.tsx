import { RevealLines } from "./reveal";

export function SectionHeader({ index, kicker, title, aside }: { index: string; kicker: string; title: readonly string[]; aside?: React.ReactNode }) {
  return (
    <header className="mb-14 grid gap-8 border-t border-line pt-6 md:mb-20 md:grid-cols-12">
      <div className="flex items-center gap-4 md:col-span-3 md:items-start">
        <span className="section-index">{index}</span>
        <span className="label">{kicker}</span>
      </div>
      <h2 className="text-huge font-medium md:col-span-9">
        <RevealLines lines={title} />
      </h2>
      {aside ? <div className="md:col-span-9 md:col-start-4">{aside}</div> : null}
    </header>
  );
}
