import React, { useEffect } from 'react';
import {
  useTonAddress,
  useTonConnectModal,
  // useTonConnectUI,
  useTonWallet
} from '@tonconnect/ui-react';
import { saveUserWallet } from '../../effects/userEffects';

import { ReactComponent as PlusIcon } from '../../assets/plusIcon.svg';
import style from './style.module.scss';

export const ConnectTonWalletButton = ({ openDisconnectModal }) => {
  const address = useTonAddress(true);
  const { open } = useTonConnectModal();
  const wallet = useTonWallet();
  // const [tonConnectUI] = useTonConnectUI();
  // const [tonProof, setTonProof] = useState();
  //
  // useEffect(() => {
  //   (async () => {
  //     if (!wallet) {
  //       tonConnectUI.setConnectRequestParameters({
  //         state: 'ready',
  //         value: {
  //           tonProof: `Welcome to Neyra Network. Your ID for this signature request is`
  //         }
  //       });
  //     } else {
  //       tonConnectUI.setConnectRequestParameters({ state: 'loading' });
  //     }
  //   })();
  // }, [wallet, tonConnectUI]);

  // useEffect(
  //   () =>
  //     tonConnectUI.onStatusChange((wallet) => {
  //       console.log({ onStatusChange: wallet });
  //       if (
  //         wallet?.connectItems?.tonProof &&
  //         'proof' in wallet?.connectItems.tonProof
  //       ) {
  //         setTonProof(wallet?.connectItems.tonProof);
  //       }
  //     }),
  //   [tonConnectUI]
  // );

  useEffect(() => {
    if (address && wallet) {
      // if (address && tonProof && wallet) {
      (async () => {
        const res = await saveUserWallet({
          // tonProof,
          account: {
            ...wallet?.account,
            uiAddress: address
          }
        });
        console.log({ res });
      })();
    }
  }, [address, wallet]);
  // }, [address, tonProof, wallet]);

  return (
    <div className={style.wrapper}>
      {address.length ? (
        <p
          className={style.address}
          onClick={() => {
            openDisconnectModal(true);
          }}>
          {address.slice(0, 3) + '...' + address.slice(-6)}
        </p>
      ) : (
        <button className={style.connect} onClick={open}>
          <PlusIcon />
          <h2 className={style.header__title_new}>Wallet</h2>
        </button>
      )}
    </div>
  );
};
