import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './AccountingButton.module.css';
import { Button, ButtonProps } from '@mui/material';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface Props extends ButtonProps {
  icon: IconProp;
  className?: string;
}
export const AccountingButton: React.FC<Props> = (props) => {
  const { icon, children, className, ...rest } = props;
  return (
    <Button
      variant="contained"
      {...rest}
      className={`full-height ${className} ${styles['accounting-button']}`}
    >
      <div>
        <FontAwesomeIcon icon={icon} size="4x" />

        <div>{children}</div>
      </div>
    </Button>
  );
};
