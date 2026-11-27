import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background p-6">
      <Link href="/" aria-label="REHI home">
        <Image src="/icons/rehi.svg" alt="REHI Logo" width={115} height={60} />
      </Link>
      {children}
    </main>
  );
}
