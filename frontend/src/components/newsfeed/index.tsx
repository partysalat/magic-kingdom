import React from 'react';
import {
  DrinkNewsPayload,
  NewsListFilter,
  useGetInfiniteNews,
} from '../../contexts/newsContext';
import {
  Button,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InfiniteScroll from 'react-infinite-scroll-component';

export const Newsfeed = () => {
  const {
    data: items,
    fetchNextPage,
    hasNextPage,
  } = useGetInfiniteNews<DrinkNewsPayload>(undefined, 20);

  return (
    <div id={'newsfeed'} style={{ height: 300, overflow: 'auto' }}>
      <InfiniteScroll
        dataLength={items?.pages.flat().length || 0} //This is important field to render the next data
        next={() => fetchNextPage()}
        hasMore={!!hasNextPage}
        loader={<h4>Loading...</h4>}
        scrollableTarget={'newsfeed'}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        {items?.pages.flat().map((newsItem) => (
          <div key={newsItem.newsId}>{JSON.stringify(newsItem)}</div>
        ))}
      </InfiniteScroll>
    </div>
  );
};
