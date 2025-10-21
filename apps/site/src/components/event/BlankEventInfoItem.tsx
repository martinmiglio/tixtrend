import { Card, CardHeader } from "@tixtrend/ui/components/card";
import { Skeleton } from "@tixtrend/ui/components/skeleton";

const BlankEventInfoItem = () => {
  return (
    <Card className="overflow-hidden">
      <div className="flex w-full flex-col items-center justify-center sm:flex-row">
        <div className="flex-initial px-0 sm:px-5">
          <Skeleton className="h-[169px] w-[300px] rounded-lg" />
        </div>
        <div className="flex-1">
          <CardHeader>
            <Skeleton className="mb-2 mt-2 h-10 w-full max-w-96" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-6 w-64" />
            </div>
          </CardHeader>
        </div>
      </div>
    </Card>
  );
};

export default BlankEventInfoItem;
