import React from 'react';
import { AchievementNews, DrinkNews, News } from '../../contexts/newsContext';

type Props = {
  newsItem: News<unknown>;
};
const DrinkNewsItem = (props: { newsItem: DrinkNews }) => {
  return <div>Drink</div>;
};
const AchievementNewsItem = (props: { newsItem: AchievementNews }) => {
  return <div>Achievement</div>;
};
export const FeedItem = ({ newsItem }: Props) => {
  if (newsItem.type === 'NEWS$DRINK') {
    return <DrinkNewsItem newsItem={newsItem as DrinkNews} />;
  } else {
    return <AchievementNewsItem newsItem={newsItem as AchievementNews} />;
  }
};
