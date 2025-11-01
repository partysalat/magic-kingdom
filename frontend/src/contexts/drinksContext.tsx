import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {ServerStateKeysEnum} from './common';
import {toast} from 'react-toastify';


export enum DrinkType {
  COCKTAIL = 'COCKTAIL',
  COCKTAIL_DISENCHANTED = 'COCKTAIL_DISENCHANTED',
  BEER = 'BEER',
  SHOT = 'SHOT',
  SOFTDRINK = 'SOFTDRINK',
}

export interface Drink {
  PK: string;
  SK: string;
  name: string;
  type: string;
  drinkType: DrinkType;
}

export interface AddNewDrinkRequest {
  drinkType: DrinkType;
  drinkName: string;
}

export async function fetchDrinks(drinkType: DrinkType) {
  const res = await fetch(`/api/drinks/${drinkType}`);
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }
  return res.json();
}

export function useGetDrinks(drinkType: DrinkType) {
  return useQuery<Drink[], Error>(
    {
      queryKey: [ServerStateKeysEnum.Drinks, drinkType],
      queryFn: () => fetchDrinks(drinkType),
      meta:{
        error:`Error fetching drinks for DrinkType ${drinkType}`
      }
,
    }
  );
}

async function addNewDrink(
  drinkType: DrinkType,
  drinkName: string
): Promise<unknown> {
  const res = await fetch(`/api/drinks/${drinkType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({name: drinkName}),
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }
  return res;
}

export function useAddNewDrink() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, AddNewDrinkRequest>(
    (data) => addNewDrink(data.drinkType, data.drinkName),
    {
      onMutate: () => {
        toast.info('Speichere Neuen Drink ...');
      },
      onSuccess: async (data, variables) => {
        toast.info('Erfolg!');
        await queryClient.invalidateQueries([
          ServerStateKeysEnum.Drinks,
          variables.drinkType,
        ]);
      },
      onError: (e: Error) => {
        toast.error(`Fehler!: ${e.message}`);
      },
    }
  );
}
