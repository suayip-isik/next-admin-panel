import { ThemeToggle } from "@/shared/components/theme-toggle";
import { LocaleSwitcher } from "@/shared/components/locale-switcher";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-end gap-2 px-6 border-b">
        <LocaleSwitcher />
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
