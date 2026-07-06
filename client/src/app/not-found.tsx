import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 flex-col space-y-4">
      <h2 className="text-4xl font-bold">404 - Not Found</h2>
      <p className="text-slate-400">Could not find requested resource</p>
      <Link href="/" className="text-indigo-400 hover:text-indigo-300 transition-colors">
        Return Home
      </Link>
    </div>
  );
}
