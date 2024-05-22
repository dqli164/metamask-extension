import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { addNewAccount, setAccountLabel } from '../../../store/actions';
import { CreateAccount } from '..';

export const CreateEthAccount = ({ onActionComplete }) => {
  const t = useI18nContext();
  const dispatch = useDispatch();

  const onCreateAccount = async (name) => {
    const newAccountAddress = await dispatch(addNewAccount());
    if (name) {
      dispatch(setAccountLabel(newAccountAddress, name));
    }
    onActionComplete(true);
  };

  const getNextAvailableAccountName = async (accounts) => {
    const newAccountNumber = Object.keys(accounts).length + 1;
    return t('newAccountNumberName', [newAccountNumber]);
  };

  return (
    <CreateAccount
      onActionComplete={onActionComplete}
      onCreateAccount={onCreateAccount}
      getNextAvailableAccountName={getNextAvailableAccountName}
    ></CreateAccount>
  );
};

CreateEthAccount.propTypes = {
  /**
   * Executes when the Create button is clicked
   */
  onActionComplete: PropTypes.func.isRequired,
};
