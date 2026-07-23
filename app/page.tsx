import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <p className="text-sm font-mono uppercase tracking-wide text-accent mb-4">
          GrowMatic Recover
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance mb-4">
          Find the revenue hiding in your quotes.
        </h1>
        <p className="text-foreground-dim text-lg mb-8 text-pretty">
          Import your quote history and see, in rand, exactly how much is sitting
          unresolved — then keep watching so it never goes dark again.
        </p>
        <Link
          href="/login"
          className="inline-block bg-accent text-white px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          Run your revenue-at-risk audit
        </Link>
      </div>
    </main>
  );
}
