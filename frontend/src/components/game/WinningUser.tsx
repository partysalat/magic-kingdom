import React, { useState } from 'react';
import {
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from '@mui/material';
import { useGetUsers, User } from '../../contexts/usersContext';

export function WinningUser({
  open,
  onNext,
}: {
  open: boolean;
  onNext: (user: User) => unknown;
}) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { isLoading: isLoadingUsers, data: users } = useGetUsers();
  function selectUser(user: User) {
    setSelectedUser(user);
  }
  if (isLoadingUsers || !users) {
    return <div>Loading ...</div>;
  }
  function isSelected(userId: string) {
    return selectedUser?.SK === userId;
  }
  return (
    <Dialog
      fullWidth
      maxWidth="xl"
      scroll="paper"
      open={open}
      onClose={() => {}}
      aria-labelledby="max-width-dialog-title"
    >
      <DialogTitle id="max-width-dialog-title">Wer bist du?</DialogTitle>
      <DialogContent className="dialog-content">
        <Grid container spacing={4}>
          {users.map((user) => {
            return (
              <Grid xs={3} item key={user.SK}>
                <div className="dialog-button-wrapper">
                  <ButtonBase
                    className={`dialog-buttons ${
                      isSelected(user.SK) && 'active'
                    }`}
                    onClick={() => selectUser(user)}
                  >
                    {user.name}
                  </ButtonBase>
                </div>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          size="large"
          variant="contained"
          color="secondary"
          onClick={() => selectedUser && onNext(selectedUser)}
        >
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}
