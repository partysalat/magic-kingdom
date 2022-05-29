import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ButtonBase,
  Grid,
} from '@mui/material';
import { DialogComponentProps } from '../accountingButton/AccountingButtonWithDrinkDialog';
import { DrinkType, useAddNewDrink } from '../../../contexts/drinksContext';
interface Props extends DialogComponentProps {}
export const AddDrinkDialog: React.FC<Props> = ({ open, onClose }) => {
  const [selectedDrinkType, setSelectedDrinkType] = useState<DrinkType>();
  const { mutate: addNewDrink } = useAddNewDrink();
  const [drinkName, setDrinkName] = useState<string>('');
  function submit() {
    if (!selectedDrinkType || !drinkName) {
      return;
    }
    addNewDrink({ drinkType: selectedDrinkType, drinkName: drinkName });
    onClose();
    setDrinkName('');
    setSelectedDrinkType(undefined);
  }
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      scroll="paper"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>Neuer Drink</DialogTitle>
      <DialogContent className="dialog-content">
        <Grid container>
          {Object.values(DrinkType).map((drink) => (
            <Grid xs={5} item key={drink}>
              <ButtonBase
                className={`dialog-buttons ${
                  selectedDrinkType === drink && 'active'
                }`}
                onClick={() => setSelectedDrinkType(drink)}
              >
                {' '}
                {drink}
              </ButtonBase>
            </Grid>
          ))}
        </Grid>
        <form noValidate autoComplete="off">
          <TextField
            id="standard-name"
            label="Name"
            value={drinkName}
            onChange={(e) => setDrinkName(e.target.value)}
            margin="normal"
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" size="large">
          Abbrechen
        </Button>
        <Button
          size="large"
          variant="contained"
          color="primary"
          onClick={submit}
        >
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};
