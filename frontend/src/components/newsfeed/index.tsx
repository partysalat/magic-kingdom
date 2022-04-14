import React from 'react';
import {
  DrinkNewsPayload,
  NewsListFilter,
  useGetInfiniteNews,
  useWebsocketUpdate,
} from '../../contexts/newsContext';
import {
  Button,
  Grid,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FeedItem } from './FeedItem';
type Props = {
  animation?: string;
};
export const Newsfeed = (props: Props) => {
  const {
    data: items,
    fetchNextPage,
    hasNextPage,
  } = useGetInfiniteNews<DrinkNewsPayload>(undefined, 20);
  useWebsocketUpdate();
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
        <Grid container spacing={1}>
          {items?.pages.flat().map((newsItem) => (
            <FeedItem
              key={newsItem.newsId}
              newsItem={newsItem}
              animation={props.animation}
            />
          ))}
        </Grid>
      </InfiniteScroll>
    </div>
  );
};
