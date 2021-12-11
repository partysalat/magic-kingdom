import * as React from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { ServerStateKeysEnum } from './common';
import { Drink } from './drinksContext';
import { User } from './usersContext';

export type DrinkNews = News<DrinkNewsPayload>;
export type AchievementNews = News<AchievementNewsPayload>;
export enum NewsListFilter {
  DRINK = 'NEWS$DRINK',
  ACHIEVEMENT = 'NEWS$ACHIEVEMENT',
}

export interface AddDrinkToUsersRequest {
  drinkId: string;
  users: { userId: string; amount: number }[];
}
async function addDrinkForUsers(data: AddDrinkToUsersRequest) {
  await fetch('/api/users', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export function useAddDrinksForUsers() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, AddDrinkToUsersRequest>(
    (data) => addDrinkForUsers(data),
    {
      onMutate: () => {
        toast.info('Speichere Buchung ...');
      },
      onSuccess: async () => {
        toast.info('Erfolg!');
        await queryClient.invalidateQueries([
          ServerStateKeysEnum.News,
          NewsListFilter.DRINK,
        ]);
      },
      onError: (e: Error) => {
        toast.error(`Fehler!: ${e.message}`);
      },
    }
  );
}

interface DrinkNewsPayload {
  amount: number;
  user: User;
  drink: Drink;
}
interface AchievementNewsPayload {
  user: User;
  achievement: Record<string, unknown>;
}
export interface News<T> {
  party: string;
  newsId: string;
  type: 'NEWS$DRINK' | 'NEWS$ACHIEVEMENT';
  payload: T;
  createdAt: '2021-11-25T20:09:27.844789+01:00';
}
async function fetchNews(params: {
  lastNewsId: string;
  limit: number;
  filter?: NewsListFilter;
}) {
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`);
  const res = await fetch(`/api/news?${queryParams.join('&')}`);
  return res.json();
}

export function useGetInfiniteNews(
  filter?: NewsListFilter,
  limit: number = 20,
  enabled = true
) {
  return useInfiniteQuery<DrinkNews[], Error>(
    [ServerStateKeysEnum.News, filter],
    (params) => {
      return fetchNews({ lastNewsId: params.pageParam, limit, filter });
    },
    {
      enabled,
      getNextPageParam: (lastPage) => {
        return lastPage[lastPage.length - 1]?.newsId;
      },
      onError: (e) => {
        toast.error(`Error fetching news: ${e.message}`);
      },
    }
  );
}
async function removeNews(newsId: string) {
  await fetch(`/api/news/${encodeURIComponent(newsId)}`, {
    method: 'DELETE',
  });
}

export function useRemoveNews() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>((newsId) => removeNews(newsId), {
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        ServerStateKeysEnum.News,
        NewsListFilter.DRINK,
      ]);
    },
  });
}
