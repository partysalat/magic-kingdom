import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { FadeOutLayer } from '../components/fadeOutLayer';
import { Bestlist } from '../components/bestlist';
import styles from './MirrorLayout.module.css';
type Props = {};
export const MirrorLayout: React.FC<Props & RouteComponentProps> = (props) => {
  return (
    <div className={styles['mirror-layout']}>
      <Bestlist withAutoScroll={true} />
      <FadeOutLayer />
    </div>
  );
};
