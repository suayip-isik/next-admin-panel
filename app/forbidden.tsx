import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">403</p>
        <h1 className="text-3xl font-semibold tracking-tight">Access denied</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          You do not have permission to access this resource.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}
