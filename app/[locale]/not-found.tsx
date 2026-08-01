import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center bg-ink text-paper">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10">
        <p className="eyebrow opacity-60">404</p>
        <h1 className="h1 mt-4">This page does not exist.</h1>
        <Link
          href="/"
          className="mt-8 btn bg-aqua text-ink"
        >
          iPlant
        </Link>
      </div>
    </div>
  );
}
