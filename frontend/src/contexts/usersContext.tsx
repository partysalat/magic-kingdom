import * as React from 'react';
import { AddNewDrinkRequest, DrinkType } from './drinksContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ServerStateKeysEnum } from './common';
import { toast } from 'react-toastify';

export type UserDrinkCounts = {
  [key in DrinkType]: string;
};
type Achievement = {
  id: number;
  name: string;
  description: string;
  image: string;
};
export interface User {
  PK: string;
  SK: string;
  name: string;
  type: string;
  drinkCounts: UserDrinkCounts;
  achievements: Achievement[];
}

async function fetchUsers() {
  const res = await fetch('/api/users');
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }
  return res.json();
}

export function useGetUsers() {
  return useQuery<User[], Error>(ServerStateKeysEnum.Users, fetchUsers, {
    onError: (e) => {
      toast.error(`Error fetching users: ${e.message}`);
    },
  });
}
interface AddNewUserRequest {
  userName: string;
}
async function addNewUser(userName: string) {
  const res = await fetch(`/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: userName }),
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }
}

export function useAddNewUser() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, AddNewUserRequest>(
    (data) => addNewUser(data.userName),
    {
      onMutate: () => {
        toast.info('Speichere Neuen User ...');
      },
      onSuccess: async (data, variables) => {
        toast.info('Erfolg!');
        await queryClient.invalidateQueries(ServerStateKeysEnum.Users);
      },
      onError: (e: Error) => {
        toast.error(`Fehler!: ${e.message}`);
      },
    }
  );
}
