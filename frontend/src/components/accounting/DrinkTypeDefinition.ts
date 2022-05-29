import { DrinkType } from '../../contexts/drinksContext';
import { ButtonProps } from '@mui/material';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import {
  faBeer,
  faCocktail,
  faCoffee,
  faCube,
  faGlassWhiskey,
} from '@fortawesome/free-solid-svg-icons';

export type DrinkTypeDefinition = {
  drinkType: DrinkType;
  color: ButtonProps['color'];
  icon: IconDefinition;
};
export const DRINK_TYPE_DEFINITIONS: DrinkTypeDefinition[] = [
  { drinkType: DrinkType.BEER, color: 'primary', icon: faBeer },
  { drinkType: DrinkType.COCKTAIL, color: 'secondary', icon: faCocktail },
  {
    drinkType: DrinkType.COCKTAIL_DISENCHANTED,
    color: 'info',
    icon: faCube,
  },
  { drinkType: DrinkType.SHOT, color: 'success', icon: faGlassWhiskey },
  { drinkType: DrinkType.SOFTDRINK, color: 'primary', icon: faCoffee },
];
