import { WhoAmI } from "@/components/about/whoami";
import { AskAditya } from "@/components/assistant/ask-aditya";
import { Contact } from "@/components/contact/contact";
import { Experience } from "@/components/experience/timeline";
import { Hero } from "@/components/hero/hero";
import { Impact } from "@/components/impact/impact";
import { Lab } from "@/components/lab/lab";
import { CurrentlyBuilding } from "@/components/now/currently-building";
import { Work } from "@/components/projects/work";
import { Publications } from "@/components/publications/publications";
import { StackExe } from "@/components/stack/stack-exe";

export default function Home() {
  return (
    <>
      <Hero />
      <Impact />
      <WhoAmI />
      <Experience />
      <Work />
      <Lab />
      <StackExe />
      <Publications />
      <AskAditya />
      <CurrentlyBuilding />
      <Contact />
    </>
  );
}
