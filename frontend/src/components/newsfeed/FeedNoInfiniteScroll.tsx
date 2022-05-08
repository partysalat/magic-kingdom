import React from 'react';
import {
  DrinkNewsPayload,
  useGetInfiniteNews,
} from '../../contexts/newsContext';
import { Grid } from '@mui/material';
import { FeedItem } from './FeedItem';

export const NewsfeedNoInfiniteScroll = () => {
  const { data: items } = useGetInfiniteNews<DrinkNewsPayload>(undefined, 20);
  return (
    <Grid container spacing={1}>
      {items?.pages.flat().map((newsItem) => (
        <FeedItem key={newsItem.newsId} newsItem={newsItem} columns={3} />
      ))}
    </Grid>
  );
};
