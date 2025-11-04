import AppNavbar from "@/components/app-navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1">
      <AppNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
