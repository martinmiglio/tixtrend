import { useRouter } from "@tanstack/react-router";
import { Button } from "@tixtrend/ui/components/button";
import { Card } from "@tixtrend/ui/components/card";

export function NotFoundComponent() {
  const router = useRouter();

  const handleGoHome = () => {
    router.navigate({ to: "/", search: { keyword: "", page: 1 } });
  };

  const handleSearchEvents = () => {
    router.navigate({ to: "/", search: { keyword: "", page: 1 } });
  };

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-4">
          <div className="space-y-2 text-center">
            <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
            <h2 className="text-2xl font-bold">Page not found</h2>
            <p className="text-sm text-muted-foreground">
              The page or event you&apos;re looking for doesn&apos;t exist or
              may have been removed.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleSearchEvents}
              className="flex-1"
              variant="default"
            >
              Search Events
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
