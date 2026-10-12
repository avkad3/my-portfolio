import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-os flex min-h-[80svh] flex-col justify-center pt-16">
      <p className="font-mono text-sm text-accent">$ cd ./requested-page</p>
      <p className="mt-2 font-mono text-sm text-danger">bash: cd: no such file or directory (404)</p>
      <h1 className="mt-10 text-giant font-medium">
        SIGNAL
        <br />
        LOST.
      </h1>
      <Link href="/" className="btn-ghost mt-12 self-start">
        Return to ADITYA.OS
      </Link>
    </section>
  );
}
