import React from 'react';

import Grid from '@mui/material/Grid';
import {
  faCartPlus,
  faSave,
  faUserPlus,
  faBackward,
} from '@fortawesome/free-solid-svg-icons';
import 'react-toastify/dist/ReactToastify.css';
import styles from './index.module.css';
import { toast, ToastContainer } from 'react-toastify';
import { RouteComponentProps } from '@reach/router';
import { AccountingButtonWithDrinkDialog } from './accountingButton/AccountingButtonWithDrinkDialog';
import { DrinkDialog } from './drinkDialog/DrinkDialog';
import { AddDrinkDialog } from './addDrinkDialog/AddDrinkDialog';
import { AddUserDialog } from './addUserDialog/AddUserDialog';
import { AccountingButton } from './accountingButton/AccountingButton';
import { DRINK_TYPE_DEFINITIONS } from './DrinkTypeDefinition';
import { RevertDialog } from './revertDialog/RevertDialog';

export const Accounting: React.FC<RouteComponentProps> = () => {
  return (
    <div>
      <Grid container className={styles['grid-container']} spacing={4}>
        {DRINK_TYPE_DEFINITIONS.map(({ drinkType, color, icon }) => (
          <Grid item xs={3} key={drinkType}>
            <AccountingButtonWithDrinkDialog
              icon={icon}
              color={color}
              dialogProps={{ drinkType }}
              dialogComponent={DrinkDialog}
            >
              {drinkType}
            </AccountingButtonWithDrinkDialog>
          </Grid>
        ))}
        <Grid item xs={3}>
          <AccountingButtonWithDrinkDialog
            icon={faCartPlus}
            color="warning"
            dialogProps={{}}
            dialogComponent={AddDrinkDialog}
          >
            Neuer Drink
          </AccountingButtonWithDrinkDialog>
        </Grid>
        <Grid item xs={3}>
          <AccountingButtonWithDrinkDialog
            icon={faUserPlus}
            color="success"
            dialogProps={{}}
            dialogComponent={AddUserDialog}
          >
            Neuer Trinker
          </AccountingButtonWithDrinkDialog>
        </Grid>
        <Grid item xs={3}>
          <AccountingButtonWithDrinkDialog
            icon={faBackward}
            color="error"
            dialogProps={{}}
            dialogComponent={RevertDialog}
          >
            Rückgangig
          </AccountingButtonWithDrinkDialog>
        </Grid>

        <Grid item xs={3}>
          <a
            href="/api/news/csv"
            target="_blank"
            style={{ textDecoration: 'none' }}
          >
            <AccountingButton icon={faSave}>Download Bestlist</AccountingButton>
          </a>
        </Grid>
      </Grid>
      <ToastContainer
        position={toast.POSITION.BOTTOM_CENTER}
        hideProgressBar
        newestOnTop
      />
    </div>
  );
};
