import React, { useState } from 'react';
import {
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Slider,
} from '@mui/material';
import './DrinkDialog.css';
import { DialogComponentProps } from '../accountingButton/AccountingButtonWithDrinkDialog';
import {
  Drink,
  DrinkType,
  useGetDrinks,
} from '../../../contexts/drinksContext';
import { useGetUsers, User } from '../../../contexts/usersContext';
import { useAddDrinksForUsers } from '../../../contexts/newsContext';

enum PAGES {
  DRINKS = 'DRINKS',
  USERS = 'USERS',
}
interface Props extends DialogComponentProps {
  drinkType: DrinkType;
}

function DrinksPage({
  drinks,
  nextPage,
}: {
  drinks: Drink[];
  nextPage: (drink: Drink) => unknown;
}) {
  return (
    <Grid container spacing={8}>
      {drinks.map((drink) => (
        <Grid xs={3} item key={drink.SK}>
          <ButtonBase
            className="dialog-buttons"
            onClick={() => nextPage(drink)}
          >
            {drink.name}
          </ButtonBase>
        </Grid>
      ))}
    </Grid>
  );
}
type SelectedUser = {
  userId: string;
  amount: number;
};
function UsersPage({
  users,
  selectedUsers,
  setSelectedUsers,
}: {
  users: User[];
  selectedUsers: SelectedUser[];
  setSelectedUsers: (users: SelectedUser[]) => unknown;
}) {
  function isSelected(userId: string) {
    return selectedUsers.find((selectedUser) => selectedUser.userId === userId);
  }
  function selectUser(userId: string) {
    isSelected(userId)
      ? setSelectedUsers(selectedUsers.filter((item) => item.userId !== userId))
      : setSelectedUsers([...selectedUsers, { userId, amount: 1 }]);
  }
  function updateAmountFor(userId: string, amount: number) {
    console.log('On change');
    setSelectedUsers(
      selectedUsers.map((user) => {
        if (user.userId !== userId) {
          return user;
        }
        return {
          ...user,
          amount,
        };
      })
    );
  }
  return (
    <Grid container spacing={4}>
      {users.map((user) => {
        const selectedUser = isSelected(user.SK);
        return (
          <Grid xs={3} item key={user.SK}>
            <div className="dialog-button-wrapper">
              <ButtonBase
                className={`dialog-buttons ${selectedUser && 'active'}`}
                onClick={() => selectUser(user.SK)}
              >
                {' '}
                {user.name} {selectedUser ? `(${selectedUser.amount})` : ''}
              </ButtonBase>
              {selectedUser && (
                <Slider
                  className="dialog-slider"
                  value={selectedUser.amount}
                  min={1}
                  max={20}
                  step={1}
                  onChange={(event, amount) => {
                    if (selectedUser.amount !== amount) {
                      updateAmountFor(user.SK, amount as number);
                    }
                  }}
                />
              )}
            </div>
          </Grid>
        );
      })}
    </Grid>
  );
}

export const DrinkDialog: React.FC<Props> = ({ open, onClose, drinkType }) => {
  let pageContent;
  const { isLoading: isLoadingUsers, data: users } = useGetUsers();
  const { isLoading: isLoadingDrinks, data: drinks } = useGetDrinks(drinkType);
  const { mutate: addDrinksForUser } = useAddDrinksForUsers();
  const [page, setPage] = useState(PAGES.DRINKS);
  const [selectedDrink, setSelectedDrink] = useState<Drink>();
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  if (isLoadingUsers && isLoadingDrinks) {
    return <div>Loading...</div>;
  }
  if (page === PAGES.DRINKS) {
    pageContent = (
      <DrinksPage
        drinks={drinks || []}
        nextPage={(drink) => {
          setSelectedDrink(drink);
          setPage(PAGES.USERS);
        }}
      />
    );
  } else {
    pageContent = (
      <UsersPage
        users={users || []}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
      />
    );
  }

  function submit() {
    if (!selectedDrink || !selectedUsers) {
      return;
    }
    addDrinksForUser({ drinkId: selectedDrink.SK, users: selectedUsers });
    onClose();
    setPage(PAGES.DRINKS);
    setSelectedUsers([]);
    setSelectedDrink(undefined);
  }
  return (
    <Dialog
      fullWidth
      maxWidth="xl"
      scroll="paper"
      open={open}
      onClose={onClose}
      aria-labelledby="max-width-dialog-title"
    >
      <DialogTitle id="max-width-dialog-title">
        Neue Bestellung von {!selectedDrink && `${drinkType}`}{' '}
        {selectedDrink && `${selectedDrink.name}`}
      </DialogTitle>
      <DialogContent className="dialog-content">{pageContent}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" size="large">
          Abbrechen
        </Button>
        {page === PAGES.USERS && (
          <Button
            size="large"
            variant="contained"
            color="secondary"
            onClick={() => setPage(PAGES.DRINKS)}
          >
            Zurück
          </Button>
        )}
        {page === PAGES.USERS && (
          <Button
            size="large"
            variant="contained"
            color="primary"
            onClick={submit}
          >
            Ok
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
