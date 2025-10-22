import BlankEventInfoItem from "@/components/event/BlankEventInfoItem";

/**
 * Skeleton loading state for event search results
 * Shows 20 blank items to match the page size
 */
const EventSearchSkeleton = () => {
  return (
    <div className="w-full">
      {Array.from({ length: 20 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: These are just skeletons
        <div className="my-2" key={index}>
          <BlankEventInfoItem />
        </div>
      ))}
      <div className="mt-4 flex justify-center">
        <div className="h-10 w-64 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
};

export default EventSearchSkeleton;
