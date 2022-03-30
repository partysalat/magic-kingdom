import { Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import React from 'react';
import { AchievementNews, DrinkNews, News } from '../../contexts/newsContext';
import { format } from 'date-fns';
import 'animate.css';

const typeToImageMap = {
  COCKTAIL: '/images/cocktail3.jpeg',
  BEER: '/images/beer.jpeg',
  SHOT: '/images/shot.jpeg',
  SOFTDRINK: '/images/softdrink.png',
};

type Props = {
  newsItem: News<unknown>;
};
const COLUMNS = 4;
const ANIMATION = 'animate__animated animate__backInDown';
const DrinkNewsItem = ({ newsItem }: { newsItem: DrinkNews }) => {
  return (
    <Grid item xs={12 / COLUMNS} style={{ height: '100%' }}>
      <Card
        className={ANIMATION}
        style={{ backgroundColor: 'rgba(36,36,36,0.5)' }}
      >
        <CardMedia
          component="img"
          height="100"
          image={typeToImageMap[newsItem.payload.drink.drinkType]}
          alt="green iguana"
        />
        <CardContent>
          <Typography variant="body2">
            {newsItem.payload.user.name} hat {newsItem.payload.amount}x
            {newsItem.payload.drink.name} bestellt
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(new Date(newsItem.createdAt), 'dd.MM.yyyy HH:mm')}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};
const AchievementNewsItem = ({ newsItem }: { newsItem: AchievementNews }) => {
  return (
    <Grid item xs={12 / COLUMNS} style={{ height: '100%' }}>
      <Card
        className={ANIMATION}
        style={{ backgroundColor: 'rgba(36,36,36,0.5)' }}
      >
        <CardMedia
          component="img"
          height="100"
          image={newsItem.payload.achievement.image}
          alt="green iguana"
        />

        <CardContent>
          <Typography variant="body2">
            {newsItem.payload.user.name} hat "
            {newsItem.payload.achievement.name}" erreicht. (
            {newsItem.payload.achievement.description})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(new Date(newsItem.createdAt), 'dd.MM.yyyy HH:mm')}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};
export const FeedItem = ({ newsItem }: Props) => {
  if (newsItem.type === 'NEWS$DRINK') {
    return <DrinkNewsItem newsItem={newsItem as DrinkNews} />;
  } else {
    return <AchievementNewsItem newsItem={newsItem as AchievementNews} />;
  }
};
