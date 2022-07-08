import * as React from 'react';
import { useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { ServerStateKeysEnum } from './common';
import { Drink } from './drinksContext';
import { User } from './usersContext';
import useWebSocket from 'react-use-websocket';

export interface DrinkNews extends News<DrinkNewsPayload> {}
export interface AchievementNews extends News<AchievementNewsPayload> {}

export enum NewsListFilter {
  DRINK = 'NEWS$DRINK',
  ACHIEVEMENT = 'NEWS$ACHIEVEMENT',
}

export interface AddDrinkToUsersRequest {
  drinkId: string;
  users: { userId: string; amount: number }[];
}

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface CreateGameAchievementRequest {
  difficulty: Difficulty;
  userId: string;
}
async function createGameAchievement(
  data: CreateGameAchievementRequest
): Promise<unknown> {
  const res = await fetch('/api/achievement/game', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }

  return res.ok;
}
export function useCreateGameAchievement() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, CreateGameAchievementRequest>(
    (data) => createGameAchievement(data),
    {
      onMutate: () => {
        toast.info('Speichere Achievement ...');
      },
      onSuccess: async () => {
        toast.info('Erfolg!');
      },
      onError: (e: Error) => {
        toast.error(`Fehler!: ${e.message}`);
      },
    }
  );
}

async function addDrinkForUsers(
  data: AddDrinkToUsersRequest
): Promise<unknown> {
  const res = await fetch('/api/users', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }

  return res.ok;
}

export function useAddDrinksForUsers() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, AddDrinkToUsersRequest>(
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

export interface DrinkNewsPayload {
  amount: number;
  user: User;
  drink: Drink;
}

export interface AchievementNewsPayload {
  user: User;
  achievement: Achievement;
}
export interface Achievement {
  id: string;
  name: string;
  description: string;
  image: string;
}
export interface News<T> {
  party: string;
  newsId: string;
  type: 'NEWS$DRINK' | 'NEWS$ACHIEVEMENT';
  pushType?: 'REMOVE';
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
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }
  return res.json();
}

export function useGetInfiniteNews<
  T = DrinkNewsPayload | AchievementNewsPayload
>(filter?: NewsListFilter, limit: number = 20, enabled = true) {
  return useInfiniteQuery<News<T>[], Error>(
    [ServerStateKeysEnum.News, filter].filter(Boolean),
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
  const res = await fetch(`/api/news/${encodeURIComponent(newsId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }
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

const WebsocketContext = React.createContext<MessageEvent | null>(null);
export function WebSocketProvider(props: Record<string, unknown>) {
  const { lastMessage } = useWebSocket(
    `ws://${window.location.hostname}:8080/api/ws`,
    {
      onOpen: () => console.log('opened'),
      //Will attempt to reconnect on all close events, such as server shutting down
      shouldReconnect: (closeEvent) => true,
    }
  );
  const queryClient = useQueryClient();
  useEffect(() => {
    if (lastMessage === null) {
      return;
    }
    queryClient.invalidateQueries(ServerStateKeysEnum.Users);
    const newItem = JSON.parse(lastMessage!.data) as News<unknown>;
    if (newItem.pushType === 'REMOVE') {
      queryClient.invalidateQueries(ServerStateKeysEnum.News);
    } else {
      queryClient.setQueryData([ServerStateKeysEnum.News], (data) => {
        if (
          // @ts-ignore
          data?.pages &&
          // @ts-ignore
          !data?.pages.flat().find((item) => item.newsId === newItem.newsId)
        ) {
          // @ts-ignore
          data?.pages?.[0]?.unshift(newItem);
        }

        return {
          // @ts-ignore
          pages: data?.pages,
          // @ts-ignore
          pageParams: data?.pageParams,
        };
      });
    }
  }, [lastMessage, queryClient]);
  return <WebsocketContext.Provider value={lastMessage} {...props} />;
}
