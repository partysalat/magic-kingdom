import React from 'react';
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
} from '@mui/material';
import styles from './bestlist.module.css';
import { useIntervalScrolling } from './useIntervalScrolling';

export const Bestlist: React.FC<RouteComponentProps> = () => {
  const { data: bestlist, isLoading } = useGetUsers();
  useIntervalScrolling({ delta: 100, ms: 1000 });
  if (isLoading) {
    return <div>Loading ...</div>;
  }
  const sortedBestlist = bestlist?.sort((user1, user2) => {
    return drinkCount(user1.drinkCounts) > drinkCount(user2.drinkCounts)
      ? 1
      : -1;
  });
  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>No.</TableCell>
            <TableCell>Name</TableCell>
            <TableCell align="right">Biere</TableCell>
            <TableCell align="right">Cocktails</TableCell>
            <TableCell align="right">Shots</TableCell>
            <TableCell align="right">Softdrinks</TableCell>
            <TableCell align="right">Achievements</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedBestlist?.map((row, index) => (
            <TableRow key={row.name}>
              <TableCell>{index + 1}.</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell align="right">{row.drinkCounts.BEER}</TableCell>
              <TableCell align="right">{row.drinkCounts.COCKTAIL}</TableCell>
              <TableCell align="right">{row.drinkCounts.SHOT}</TableCell>
              <TableCell align="right">{row.drinkCounts.SOFTDRINK}</TableCell>

              <TableCell align="right">
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
    </Paper>
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
  return drinkCount.BEER + drinkCount.COCKTAIL + drinkCount.SOFTDRINK;
}
