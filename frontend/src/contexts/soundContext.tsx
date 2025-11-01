import {useMutation, useQuery} from '@tanstack/react-query';
import {ServerStateKeysEnum} from './common';
import {toast} from 'react-toastify';

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
  return useQuery<Sound[], Error>({
    queryKey: [ServerStateKeysEnum.Sound],
    queryFn: fetchSounds,
    meta: {
        error:`Error fetching sound files`
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
  return useMutation<void, Error, Sound>({
    mutationFn: (data) => playSound(data),
    onMutate: () => {
      toast.info('Spiele Sound ...');
    },
    onError: (e: Error) => {
      toast.error(`Fehler!: ${e.message}`);
    },
  });
}
