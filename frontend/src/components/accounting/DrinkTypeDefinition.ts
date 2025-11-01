import { DrinkType } from '../../contexts/drinksContext';
import type { ButtonProps } from '@mui/material';
import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import {
  faBeer,
  faCocktail,
  faCoffee,
  faGlassMartini as cocktailDisenchantedIcon,
  faGlassWhiskey,
} from '@fortawesome/free-solid-svg-icons';

export type DrinkTypeDefinition = {
  drinkType: DrinkType;
  color: ButtonProps['color'];
  icon: IconDefinition;
  title: string;
};
export const DRINK_TYPE_DEFINITIONS: DrinkTypeDefinition[] = [
  { drinkType: DrinkType.BEER, color: 'primary', icon: faBeer, title: 'Bier' },
  {
    drinkType: DrinkType.COCKTAIL,
    color: 'secondary',
    icon: faCocktail,
    title: 'Cocktail',
  },
  {
    drinkType: DrinkType.COCKTAIL_DISENCHANTED,
    color: 'info',
    icon: cocktailDisenchantedIcon,
    title: 'Alkfreie Cocktails',
  },
  {
    drinkType: DrinkType.SHOT,
    color: 'success',
    icon: faGlassWhiskey,
    title: 'Shots',
  },
  {
    drinkType: DrinkType.SOFTDRINK,
    color: 'primary',
    icon: faCoffee,
    title: 'Softdrinks',
  },
];
