import React from 'react';
import { useGetUsers, UserDrinkCounts } from '../../contexts/usersContext';
import {
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  faBeer,
  faCocktail,
  faCoffee,
  faGlassMartini,
  faGlassWhiskey,
} from '@fortawesome/free-solid-svg-icons';

import styles from './bestlist.module.css';
import { useIntervalScrolling } from './useIntervalScrolling';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
  withAutoScroll?: boolean;
  withStickyHeader?: boolean;
};
export const Bestlist: React.FC<Props> = (props) => {
  const { data: bestlist, isLoading } = useGetUsers();

  useIntervalScrolling({
    delta: 1,
    ms: 1000,
    enabled: !!props.withAutoScroll,
  });
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
            align="center"
            padding="normal"
            sx={{ borderColor: 'text.secondary' }}
          >
            <Typography variant="subtitle2">
              <FontAwesomeIcon icon={faBeer} size="1x" />{' '}
            </Typography>
          </TableCell>
          <TableCell
            className={`${props.withStickyHeader && styles['th']}`}
            size="small"
            align="center"
            padding="normal"
            sx={{ borderColor: 'text.secondary' }}
          >
            <Typography variant="subtitle2">
              <FontAwesomeIcon icon={faCocktail} size="1x" />
            </Typography>
          </TableCell>
          <TableCell
            className={`${props.withStickyHeader && styles['th']}`}
            size="small"
            align="center"
            padding="normal"
            sx={{ borderColor: 'text.secondary' }}
          >
            <Typography variant="subtitle2">
              <FontAwesomeIcon icon={faGlassMartini} size="1x" />
            </Typography>
          </TableCell>
          <TableCell
            className={`${props.withStickyHeader && styles['th']}`}
            size="small"
            align="center"
            padding="normal"
            sx={{ borderColor: 'text.secondary' }}
          >
            <Typography variant="subtitle2">
              <FontAwesomeIcon icon={faGlassWhiskey} size="1x" />
            </Typography>
          </TableCell>
          <TableCell
            className={`${props.withStickyHeader && styles['th']}`}
            size="small"
            align="center"
            padding="normal"
            sx={{ borderColor: 'text.secondary' }}
          >
            <Typography variant="subtitle2">
              <FontAwesomeIcon icon={faCoffee} size="1x" />
            </Typography>
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
            <TableCell
              size="small"
              align="center"
              padding="none"
              sx={{ border: 0 }}
            >
              <Typography>{row.drinkCounts.BEER}</Typography>
            </TableCell>
            <TableCell
              size="small"
              align="center"
              padding="none"
              sx={{ border: 0 }}
            >
              <Typography>{row.drinkCounts.COCKTAIL}</Typography>
            </TableCell>
            <TableCell
              size="small"
              align="center"
              padding="none"
              sx={{ border: 0 }}
            >
              <Typography>{row.drinkCounts.COCKTAIL_DISENCHANTED}</Typography>
            </TableCell>
            <TableCell
              size="small"
              align="center"
              padding="none"
              sx={{ border: 0 }}
            >
              <Typography>{row.drinkCounts.SHOT}</Typography>
            </TableCell>
            <TableCell
              size="small"
              align="center"
              padding="none"
              sx={{ border: 0 }}
            >
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
    Number.parseFloat(drinkCount.COCKTAIL_DISENCHANTED || '0') +
    Number.parseFloat(drinkCount.SOFTDRINK || '0')
  );
}
