import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  selectAllWorkspaces,
  selectCurrentWorkspace,
  selectTotalWsCount
} from '../../store/reducers/workspaceSlice';
import {
  getIsWorkspaceSelected,
  setIsWorkspaceSelected,
  switchWorkspace
} from '../../effects/workspaceEffects';

import GhostLoader from '../../components/ghostLoader';

import { ReactComponent as UploadIcon } from '../../assets/upload.svg';
import { ReactComponent as UpgradeIcon } from '../../assets/upgrade.svg';
import { ReactComponent as GhostIcon } from '../../assets/ghost.svg';
import { ReactComponent as ArrowIcon } from '../../assets/arrow_right.svg';
import { ReactComponent as HardDriveIcon } from '../../assets/hard_drive.svg';
import { ReactComponent as MoneyIcon } from '../../assets/money.svg';
import { ReactComponent as RefIcon } from '../../assets/ref.svg';
import uploadLogo from '../../assets/upload_logo.png';

import style from './style.module.css';

export const StartPage = ({ onClose }) => {
  const totalWsCount = useSelector(selectTotalWsCount);
  const allWorkspaces = useSelector(selectAllWorkspaces);
  const currentWorkspace = useSelector(selectCurrentWorkspace);
  const navigate = useNavigate();
  const isWsSelected = getIsWorkspaceSelected();

  const handleWsSelection = async (ws) => {
    await switchWorkspace(ws.workspace.id).then(() => {
      setIsWorkspaceSelected(true);
      window.location.assign(window.location.origin);
    });
  };

  const workspaceslist = useMemo(() => {
    if (allWorkspaces) {
      return allWorkspaces.map((ws) => (
        <li className={style.options__item} key={ws.workspace.id}>
          <button
            onClick={() => {
              handleWsSelection(ws);
            }}
            className={`${style.options__item__button} ${style.workspaceOptionButton}`}>
            <HardDriveIcon /> {ws.workspace.name}{' '}
            <ArrowIcon className={style.arrowIcon} />
          </button>
        </li>
      ));
    }
  }, [allWorkspaces]);

  const optionslist = (
    <>
      <li className={style.options__item}>
        <button
          onClick={() => {
            navigate('/file-upload');
          }}
          className={`${style.options__item__button} ${style.uploadOptionButton}`}>
          <UploadIcon /> Upload File <ArrowIcon className={style.arrowIcon} />
        </button>
      </li>
      <li className={style.options__item}>
        <button
          onClick={() => {
            navigate('/ghostdrive-upload');
          }}
          className={`${style.options__item__button} ${style.uploadOptionButton}`}>
          <GhostIcon /> From Ghostdrive{' '}
          <ArrowIcon className={style.arrowIcon} />
        </button>
      </li>
      <li className={style.options__item}>
        <button
          onClick={() => {
            navigate('/upgrade');
          }}
          className={`${style.options__item__button} ${style.uploadOptionButton}`}>
          <UpgradeIcon /> Upgrade Storage{' '}
          <ArrowIcon className={style.arrowIcon} />
        </button>
      </li>
      <li className={style.options__item}>
        <button
          onClick={() => {
            navigate('/balance');
          }}
          className={`${style.options__item__button} ${style.uploadOptionButton}`}>
          <MoneyIcon /> Point Balance
          <ArrowIcon className={style.arrowIcon} />
        </button>
      </li>
      <li className={style.options__item}>
        <button
          onClick={() => {
            navigate('/ref');
          }}
          className={`${style.options__item__button} ${style.uploadOptionButton}`}>
          <RefIcon /> Referral System
          <ArrowIcon className={style.arrowIcon} />
        </button>
      </li>
    </>
  );

  if (!allWorkspaces && !currentWorkspace) {
    return (
      <div className={style.home_container}>
        <GhostLoader />
      </div>
    );
  }

  return (
    <div className={`${style.container} ${style.uploadContainer}`}>
      <header className={style.header}>
        <button className={style.header__cancelBtn} onClick={onClose}>
          Cancel
        </button>
        <h2
          className={`${style.uploadContainer__title} ${style.centeredTitle}`}>
          GhostDrive
        </h2>
      </header>
      <section className={style.wrapper}>
        <div className={style.wrapper__content}>
          <img src={uploadLogo} alt="logo" width={93} height={93} />
          <h2 className={style.wrapper__content__title}>
            Advanced File System
          </h2>
          <p className={style.wrapper__content__description}>
            No more data duplication; everything is on the p2p network in web3.
          </p>
        </div>
        <ul className={style.options}>
          {totalWsCount > 1 && !isWsSelected ? workspaceslist : optionslist}
        </ul>
      </section>
    </div>
  );
};