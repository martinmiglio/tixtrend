// InfinitePageScroller.tsx
// this component is used to display paginated data in an infinite scroller.

import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

export interface InfinitePageScrollerProps {
  getPageData: (pageNumber: number) => Promise<any[]>; // function which takes a page number and returns a promise of the data for that page
  children: React.ReactNode; // the component to display for each item
  initialPage?: number; // the page to display initially
  hasMore?: boolean; // whether there are more items to display
  loader?: React.ReactNode; // the loader to display while loading more items
  className?: string; // the class name to apply to the container
  style?: React.CSSProperties; // the style to apply to the container
}

const InfinitePageScroller = ({
  getPageData,
  children,
  initialPage = 0,
  loader = <h4>Loading...</h4>,
  className = "",
  style = {},
}: InfinitePageScrollerProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setPage(initialPage);
    setItems([]);
  }, [initialPage]);

  useEffect(() => {
    const loadInitialData = async () => {
      const data = await getPageData(page);
      setItems(data);
    };
    loadInitialData();
  }, [page]);

  const loadMore = async () => {
    const data = await getPageData(page + 1);
    if (data.length === 0) {
      setHasMore(false);
      return;
    }
    setItems([...items, ...data]);
    setPage(page + 1);
  };

  return (
    <InfiniteScroll
      dataLength={items.length}
      next={loadMore}
      hasMore={hasMore}
      loader={loader}
      className={className}
      style={style}
    >
      {items.map((item) => {
        return React.cloneElement(children as React.ReactElement<any>, {
          item,
          key: JSON.stringify(item),
        });
      })}
    </InfiniteScroll>
  );
};

export default InfinitePageScroller;
