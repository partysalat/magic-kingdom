import { Avatar, Card, CardHeader, Grid } from '@mui/material';
import React from 'react';
import { AchievementNews, DrinkNews, News } from '../../contexts/newsContext';
import { format } from 'date-fns';
import {
  faBeer,
  faCocktail,
  faCoffee,
  faGlassWhiskey,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'animate.css';
const typeToIconMap = {
  COCKTAIL: faCocktail,
  BEER: faBeer,
  SHOT: faGlassWhiskey,
  SOFTDRINK: faCoffee,
};

type Props = {
  newsItem: News<unknown>;
};
const COLUMNS = 3;
const ANIMATION = 'animate__animated animate__backInDown';
const DrinkNewsItem = ({ newsItem }: { newsItem: DrinkNews }) => {
  return (
    <Grid item xs={12 / COLUMNS} style={{ height: '100%' }}>
      <Card className={ANIMATION}>
        <CardHeader
          avatar={
            <Avatar aria-label="Recipe">
              <FontAwesomeIcon
                icon={typeToIconMap[newsItem.payload.drink.drinkType]}
                size="1x"
              />
            </Avatar>
          }
          title={`${newsItem.payload.user.name} hat ${newsItem.payload.amount}x ${newsItem.payload.drink.name} bestellt`}
          subheader={format(new Date(newsItem.createdAt), 'dd.MM.yyyy HH:mm')}
        />
      </Card>
    </Grid>
  );
};
const AchievementNewsItem = ({ newsItem }: { newsItem: AchievementNews }) => {
  return (
    <Grid item xs={12 / COLUMNS} style={{ height: '100%' }}>
      <Card className={ANIMATION}>
        <CardHeader
          avatar={
            <Avatar
              alt={newsItem.payload.achievement.name}
              src={newsItem.payload.achievement.imagePath}
            />
          }
          title={`${newsItem.payload.user.name} hat "${newsItem.payload.achievement.name}" erreicht. (${newsItem.payload.achievement.description})`}
          subheader={format(new Date(newsItem.createdAt), 'dd.MM.yyyy HH:mm')}
        />
      </Card>
      <div>Achievement</div>
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
