import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { FadeOutLayer } from '../components/fadeOutLayer';
import styles from './MirrorLayout.module.css';

type Props = { component: React.ReactElement; top?: boolean; bottom?: boolean };
export const MirrorLayout: React.FC<Props & RouteComponentProps> = ({
  component,
  top = true,
  bottom = true,
}) => {
  return (
    <div
      className={`${top && styles['mirror-layout-top']} ${
        bottom && styles['mirror-layout-bottom']
      }`}
    >
      {component}
      <FadeOutLayer top={top} bottom={bottom} />
    </div>
  );
};
