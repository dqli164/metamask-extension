import React from 'react';

import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  TextColor,
  Display,
  FlexDirection,
  FontWeight,
  BlockSize,
  AlignItems,
  JustifyContent,
  TextVariant,
} from '../../../helpers/constants/design-system';
import {
  Modal,
  ModalOverlay,
  Text,
  Box,
  Button,
  ButtonVariant,
  ModalHeader,
  ModalContent,
} from '../../../components/component-library';

interface Props {
  onContinue: () => void;
  onNoRightNow: () => void;
  isOpen: boolean;
}

export default function SmartTransactionsModal({
  onContinue,
  onNoRightNow,
  isOpen,
}: Props) {
  const t = useI18nContext();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onContinue}
      isClosedOnOutsideClick={false}
      isClosedOnEscapeKey={false}
      className="mm-modal__custom-scrollbar"
      autoFocus={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          alignItems={AlignItems.center}
          justifyContent={JustifyContent.center}
        >
          {t('introducingSmartTransctions')}
        </ModalHeader>
        <Box
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          paddingLeft={4}
          paddingRight={4}
        >
          <Box display={Display.Flex} flexDirection={FlexDirection.Column}>
            <img
              src="./images/logo/metamask-smart-transactions.png"
              alt={t('swapSwapSwitch')}
            />
          </Box>
          <Text
            marginTop={2}
            color={TextColor.textDefault}
            variant={TextVariant.bodyMd}
            fontWeight={FontWeight.Bold}
          >
            {t('whatAreSmartTransactions')}
          </Text>
          <Text variant={TextVariant.bodyMd} marginTop={1}>
            {t('smartTransactionsDescription')}
          </Text>
          <Text variant={TextVariant.bodyMd} marginTop={5}>
            {t('smartTransactionsDescription2')}
          </Text>
          <Button
            marginTop={6}
            type="link"
            variant={ButtonVariant.Link}
            onClick={onNoRightNow}
            width={BlockSize.Full}
          >
            {t('notRightNow')}
          </Button>
          <Button
            marginTop={4}
            variant={ButtonVariant.Primary}
            onClick={onContinue}
            width={BlockSize.Full}
          >
            {t('continue')}
          </Button>
        </Box>
      </ModalContent>
    </Modal>
  );
}