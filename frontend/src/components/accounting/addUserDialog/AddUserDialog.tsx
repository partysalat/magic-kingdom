import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import styles from './AddUserDialog.module.css';
import { DialogComponentProps } from '../accountingButton/AccountingButtonWithDrinkDialog';
import { useAddNewUser } from '../../../contexts/usersContext';

export const AddUserDialog = ({ open, onClose }: DialogComponentProps) => {
  const [newUser, setNewUser] = useState<string>('');
  const { mutate: addNewUser } = useAddNewUser();
  function submit() {
    if (!newUser) {
      return;
    }
    addNewUser({ userName: newUser });
    onClose();
    setNewUser('');
  }
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      scroll="paper"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>Neuer Trinker</DialogTitle>
      <DialogContent className={styles['dialog-content']}>
        <form noValidate autoComplete="off">
          <TextField
            id="standard-name"
            label="Name"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            margin="normal"
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" size="large">
          Abbrechen
        </Button>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={submit}
        >
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};
