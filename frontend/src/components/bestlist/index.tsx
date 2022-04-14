import React, { ReactElement, useRef } from 'react';
import { RouteComponentProps } from '@reach/router';
import { useGetUsers, UserDrinkCounts } from '../../contexts/usersContext';
import {
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import styles from './bestlist.module.css';
import { useIntervalScrolling } from './useIntervalScrolling';
import { useWebsocketUpdate } from '../../contexts/newsContext';
type Props = {
  withAutoScroll?: boolean;
  withStickyHeader?: boolean;
};
export const Bestlist: React.FC<Props & RouteComponentProps> = (props) => {
  const { data: bestlist, isLoading } = useGetUsers();

  useIntervalScrolling({
    delta: 1,
    ms: 1000,
    enabled: !!props.withAutoScroll,
  });
  useWebsocketUpdate();
  if (isLoading) {
    return <div>Loading ...</div>;
  }
  const sortedBestlist = bestlist?.sort((user1, user2) => {
    return drinkCount(user1.drinkCounts) > drinkCount(user2.drinkCounts)
      ? -1
      : 1;
  });

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell
            className={`${props.withStickyHeader && styles['th']}`}
            size="small"
            padding="none"
            sx={{ borderColor: 'text.secondary' }}
          />
          <TableCell
            className={`${props.withStickyHeader && styles['th']}`}
            size="small"
            sx={{ borderColor: 'text.secondary' }}
          >
            <Typography variant="subtitle2">Name</Typography>
          </TableCell>
          <TableCell
            className={`${props.withStickyHeader && styles['th']}`}
            size="small"
            align="right"
            sx={{ borderColor: 'text.secondary' }}
          >
            <Typography variant="subtitle2">Biere</Typography>
          </TableCell>
          <TableCell
            className={`${props.withStickyHeader && styles['th']}`}
            size="small"
            align="right"
            sx={{ borderColor: 'text.secondary' }}
          >
            <Typography variant="subtitle2">Cocktails</Typography>
          </TableCell>
          <TableCell
            className={`${props.withStickyHeader && styles['th']}`}
            size="small"
            align="right"
            sx={{ borderColor: 'text.secondary' }}
          >
            <Typography variant="subtitle2">Shots</Typography>
          </TableCell>
          <TableCell
            className={`${props.withStickyHeader && styles['th']}`}
            size="small"
            align="right"
            sx={{ borderColor: 'text.secondary' }}
          >
            <Typography variant="subtitle2">Softdrinks</Typography>
          </TableCell>
          <TableCell
            className={`${props.withStickyHeader && styles['th']}`}
            size="small"
            align="right"
            sx={{ borderColor: 'text.secondary' }}
          >
            <Typography variant="subtitle2">Achievements</Typography>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody className={styles['tbody']}>
        {sortedBestlist?.map((row, index) => (
          <TableRow key={row.name}>
            <TableCell size="small" padding="none" sx={{ border: 0 }}>
              <Typography variant="subtitle2">{index + 1}.</Typography>
            </TableCell>
            <TableCell size="small" sx={{ border: 0 }}>
              <Typography>{row.name}</Typography>
            </TableCell>
            <TableCell size="small" align="right" sx={{ border: 0 }}>
              <Typography>{row.drinkCounts.BEER}</Typography>
            </TableCell>
            <TableCell size="small" align="right" sx={{ border: 0 }}>
              <Typography>{row.drinkCounts.COCKTAIL}</Typography>
            </TableCell>
            <TableCell size="small" align="right" sx={{ border: 0 }}>
              <Typography>{row.drinkCounts.SHOT}</Typography>
            </TableCell>
            <TableCell size="small" align="right" sx={{ border: 0 }}>
              <Typography>{row.drinkCounts.SOFTDRINK}</Typography>
            </TableCell>

            <TableCell size="small" align="right" sx={{ border: 0 }}>
              {row.achievements.map((payload) => (
                <Tooltip
                  key={payload.id}
                  title={`${payload.name}: ${payload.description}`}
                >
                  <Avatar
                    alt={payload.name}
                    src={payload.image}
                    className={`${styles['avatar-small']} animated jackInTheBox`}
                  />
                </Tooltip>
              ))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    // <div>
    //   {sortedBestlist?.map((user) => {
    //     return (
    //       <Grid container key={user.name}>
    //         <Grid item>{user.name}</Grid>
    //         <Grid item>{user.drinkCounts.BEER}</Grid>
    //       </Grid>
    //     );
    //   })}
    // </div>
  );
};
function drinkCount(drinkCount: UserDrinkCounts) {
  return (
    Number.parseFloat(drinkCount.BEER || '0') +
    Number.parseFloat(drinkCount.COCKTAIL || '0') +
    Number.parseFloat(drinkCount.SOFTDRINK || '0')
  );
}
