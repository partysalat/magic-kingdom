import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Game } from '../components/game';

type Props = { component?: React.ReactElement };
export const MainLayout: React.FC<Props & RouteComponentProps> = ({
  component,
}) => {
  return (
    <div>
      <Game />
    </div>
  );
};
