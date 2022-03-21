import React, { useRef } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemIcon,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from '@mui/material';

import { faBasketballBall } from '@fortawesome/free-solid-svg-icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './RevertDialog.module.css';
import { DialogComponentProps } from '../accountingButton/AccountingButtonWithDrinkDialog';
import { DrinkType } from '../../../contexts/drinksContext';
import { DRINK_TYPE_DEFINITIONS } from '../DrinkTypeDefinition';
import {
  NewsListFilter,
  useGetInfiniteNews,
  DrinkNews,
  useRemoveNews,
  DrinkNewsPayload,
} from '../../../contexts/newsContext';

interface Props extends DialogComponentProps {}
export const RevertDialog: React.FC<Props> = ({ open, onClose }) => {
  const { mutate: removeNews } = useRemoveNews();
  function remove(item: DrinkNews) {
    removeNews(item.newsId);
  }
  const ref = useRef(null);
  const {
    data: items,
    fetchNextPage,
    hasNextPage,
  } = useGetInfiniteNews<DrinkNewsPayload>(NewsListFilter.DRINK, 50, open);
  function getDrinkIcon(drinkType: DrinkType) {
    return (
      DRINK_TYPE_DEFINITIONS.find((def) => def.drinkType === drinkType)?.icon ||
      faBasketballBall
    );
  }
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      scroll="paper"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>Rückgängig</DialogTitle>
      <DialogContent className={styles['dialog-content']}>
        <List
          dense
          ref={ref}
          style={{ height: 300, overflow: 'auto' }}
          id={'revertDialogList'}
        >
          <InfiniteScroll
            dataLength={items?.pages.flat().length || 0} //This is important field to render the next data
            next={() => fetchNextPage()}
            hasMore={!!hasNextPage}
            loader={<h4>Loading...</h4>}
            scrollableTarget={'revertDialogList'}
            endMessage={
              <p style={{ textAlign: 'center' }}>
                <b>Yay! You have seen it all</b>
              </p>
            }
          >
            {items?.pages.flat().map((newsItem) => (
              <ListItem key={newsItem.newsId}>
                <ListItemIcon>
                  <FontAwesomeIcon
                    icon={getDrinkIcon(newsItem.payload?.drink?.drinkType)}
                    size="2x"
                    style={{ width: '75px' }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={`${newsItem.payload.amount}x ${newsItem.payload.drink.name}`}
                  secondary={`${newsItem.payload.user.name}`}
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={(e) => {
                      //@ts-ignore
                      e.target.innerText = '...';
                      remove(newsItem);
                    }}
                  >
                    X
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </InfiniteScroll>
        </List>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={onClose}
          size="large"
        >
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};
