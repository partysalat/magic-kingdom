import * as React from 'react';
import { DrinkType } from './drinksContext';
import { useMutation, useQuery } from 'react-query';
import { ServerStateKeysEnum } from './common';
import { toast } from 'react-toastify';

type Sound = string;

function getHost() {
  return window.location.host.split(':')[0];
}

const SOUND_HOST =
  getHost() === 'localhost' ? 'http://bra:5002' : `http://${getHost()}:5002`;
async function fetchSounds() {
  const res = await fetch(SOUND_HOST);
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }
  return res.json();
}

export function useGetSounds() {
  return useQuery<Sound[], Error>(ServerStateKeysEnum.Sound, fetchSounds, {
    onError: (e) => {
      toast.error(`Error fetching sound files: ${e.message}`);
    },
  });
}
async function playSound(sound: string) {
  const res = await fetch(`${SOUND_HOST}/${sound}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }
}

export function usePlaySound() {
  return useMutation<void, Error, Sound>((data) => playSound(data), {
    onMutate: () => {
      toast.info('Spiele Sound ...');
    },
    onError: (e: Error) => {
      toast.error(`Fehler!: ${e.message}`);
    },
  });
}
