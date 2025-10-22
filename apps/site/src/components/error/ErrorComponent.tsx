import { useRouter } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@tixtrend/ui/components/button";
import { Card } from "@tixtrend/ui/components/card";

export function ErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.invalidate();
  };

  const handleGoHome = () => {
    router.navigate({ to: "/", search: { keyword: "", page: 1 } });
  };

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-4">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-destructive">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground">
              We encountered an error while loading this page.
            </p>
          </div>

          {error?.message && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-mono text-muted-foreground">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleRefresh}
              className="flex-1"
              variant="default"
            >
              Refresh Page
            </Button>
            <Button onClick={handleGoHome} className="flex-1" variant="outline">
              Go Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
