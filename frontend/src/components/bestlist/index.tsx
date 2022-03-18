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
  Typography,
} from '@mui/material';
import styles from './bestlist.module.css';
import { useIntervalScrolling } from './useIntervalScrolling';

export const Bestlist: React.FC<RouteComponentProps> = () => {
  const { data: bestlist, isLoading } = useGetUsers();
  // useIntervalScrolling({ delta: 1, ms: 1000 });
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
          <TableCell>
            <Typography variant="h6">No.</Typography>
          </TableCell>
          <TableCell>
            <Typography variant="h6">Name</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant="h6">Biere</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant="h6">Cocktails</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant="h6">Shots</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant="h6">Softdrinks</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant="h6">Achievements</Typography>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedBestlist?.map((row, index) => (
          <TableRow key={row.name}>
            <TableCell size="small">
              <Typography>{index + 1}.</Typography>
            </TableCell>
            <TableCell>
              <Typography>{row.name}</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography>{row.drinkCounts.BEER}</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography>{row.drinkCounts.COCKTAIL}</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography>{row.drinkCounts.SHOT}</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography>{row.drinkCounts.SOFTDRINK}</Typography>
            </TableCell>

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
