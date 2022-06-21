import React from 'react';
import {
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from '@mui/material';
import styles from './SoundBoardDialog.module.css';
import { DialogComponentProps } from '../accountingButton/AccountingButtonWithDrinkDialog';
import { useGetSounds, usePlaySound } from '../../../contexts/soundContext';

export const SoundBoardDialog = ({ open, onClose }: DialogComponentProps) => {
  const { data: sounds } = useGetSounds();
  const { mutate: playSound } = usePlaySound();
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      scroll="paper"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>Spiele Sound</DialogTitle>
      <DialogContent className={styles['dialog-content']}>
        <Grid container spacing={1}>
          {(sounds || [])
            .sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1))
            .map((sound) => {
              return (
                <Grid xs={3} item key={sound}>
                  <div className="dialog-button-wrapper">
                    <ButtonBase
                      className={`dialog-buttons`}
                      onClick={() => playSound(sound)}
                    >
                      {sound.replace('.mp3', '')}
                    </ButtonBase>
                  </div>
                </Grid>
              );
            })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" size="large">
          Schließen
        </Button>
      </DialogActions>
    </Dialog>
  );
};
