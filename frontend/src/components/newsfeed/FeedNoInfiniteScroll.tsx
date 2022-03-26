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

export const NewsfeedNoInfiniteScroll = () => {
  const { data: items } = useGetInfiniteNews<DrinkNewsPayload>(undefined, 20);
  useWebsocketUpdate();
  return (
    <Grid container spacing={1}>
      {items?.pages.flat().map((newsItem) => (
        <FeedItem key={newsItem.newsId} newsItem={newsItem} />
      ))}
    </Grid>
  );
};
