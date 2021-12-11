import React, { useState } from 'react';
import { AccountingButton } from './AccountingButton';

export interface DialogComponentProps {
  open: boolean;
  onClose: () => void;
}

interface Props<T> extends React.ComponentProps<typeof AccountingButton> {
  dialogComponent: React.FC<T & DialogComponentProps>;
  dialogProps: T;
}

export function AccountingButtonWithDrinkDialog<T>(props: Props<T>) {
  const [isOpen, setOpen] = useState(false);

  const {
    children,
    dialogComponent: DialogComponent,
    dialogProps,
    ...rest
  } = props;
  return (
    <React.Fragment>
      <AccountingButton
        {...rest}
        onClick={() => {
          setOpen(true);
        }}
      >
        {children}
      </AccountingButton>
      <DialogComponent
        {...dialogProps}
        open={isOpen}
        onClose={() => setOpen(false)}
      />
    </React.Fragment>
  );
}
