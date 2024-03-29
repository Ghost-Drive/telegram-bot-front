import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { createStripeSorageSub, updateWsStorage } from "../../effects/stripe";
import { sidebarSizeTransformer } from "../../utils/storage";
import {
  selectCurrentWorkspace,
  selectWorkspacePlan,
} from "../../store/reducers/workspaceSlice";

import BillingModal from "./BillingModal";

import { ReactComponent as CoinIcon } from "../../assets/coin.svg";

import s from "./style.module.css";

const DEFAULT_TARIFFS_NAMES = {
  107374182400: "100GB",
  137438953472: "128GB",
  274877906944: "256GB",
  549755813888: "512GB",
  1099511627776: "1TB",
  2199023255552: "2TB",
  5497558138880: "5TB",
  10995116277760: "10TB",
  109951162777600: "100TB",
};

const yearlyDiscount = {
  107374182400: "-50%",
  1099511627776: "-33%",
  2199023255552: "-15%",
};

export const UpgradeStoragePage = ({ tariffs }) => {
  const navigate = useNavigate();
  const ws = useSelector(selectCurrentWorkspace);
  const currentPlan = useSelector(selectWorkspacePlan) || {};
  const [duration, setDuration] = useState(1);
  const [checked, setChecked] = useState(false);
  const [plan, setPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [availableTariffs, setAvailableTariffs] = useState(null);

  const convertBytesToKibibytes = (size) => {
    return size / 1024 ** 3;
  };

  const getTariffs = (data) => {
    const storageTypes = Object.keys(data);
    const transformedObject = {};

    for (const type of storageTypes) {
      for (const node of data[type]) {
        const duration = node.duration;

        if (!transformedObject[type]) {
          transformedObject[type] = {};
        }

        if (!transformedObject[type][duration]) {
          transformedObject[type][duration] = [];
        }

        transformedObject[type][duration].push({
          value: sidebarSizeTransformer(node.storage),
          price: node.price,
          tarifStorage: node.storage,
          kibibytes: convertBytesToKibibytes(node.storage),
          priceId: node.stripe_price,
        });
      }
    }
    setAvailableTariffs(transformedObject);
  };

  useEffect(() => {
    if (tariffs) {
      getTariffs(tariffs);
    }
  }, [tariffs]);

  const onBackButtonClick = () => navigate(-1);

  const tariffList = useMemo(() => {
    if (!availableTariffs) return [];

    const filteredTariffs = availableTariffs[ws?.storage][duration].filter(
      (tf) => tf.tarifStorage > currentPlan?.storage
    );

    const choosenTariffs = currentPlan?.duration
      ? filteredTariffs
      : availableTariffs[ws?.storage][duration];
    const sortedTariffs = choosenTariffs.sort((a, b) => a.price - b.price);

    return sortedTariffs;
  }, [tariffs, availableTariffs, currentPlan?.storage, ws?.storage, duration]);

  const onPlanClick = (e) => {
    const element = e.target.closest("li");
    if (!element) return;

    const id = element.id;
    if (id === plan) {
      setPlan(null);
      return;
    }
    setPlan(id);
  };

  const Switch = () => {
    const handleChange = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setChecked(e.target.checked);
      setDuration((prev) => (prev === 1 ? 12 : 1));
    };
    return (
      <label className={s.switchWrapper}>
        <input onChange={handleChange} type="checkbox" checked={checked} />
        <span className={s.switch}>
          <span className={s.button}></span>
        </span>
      </label>
    );
  };

  const onClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const onPaymentSuccess = async () => {
    try {
      await updateWsStorage(
        subscription?.priceId,
        subscription?.subscriptionId
      );

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.warn("something wrong");
    }
  };

  const payByCreditCard = async () => {
    try {
      const sub = await createStripeSorageSub(plan);
      setSubscription(sub);
      setShowPaymentModal(true);
    } catch (error) {
      console.warn(error);
    }
  };

  const getTariffMonthlyPrice = (price) => {
    return `${(price / duration / 100).toFixed(2)}`;
  };
  const getTariffYearlyPrice = (price) => {
    return duration === 1
      ? `${((price * 12) / 100).toFixed(2)}`
      : `${(price / 100).toFixed(2)}`;
  };

  const getCurrentPlanPrice = (price) => {
    const yearlyPrice =
      currentPlan?.duration === 1
        ? `${((price * 12) / 100).toFixed(2)}`
        : `${(price / 100).toFixed(2)}`;
    const monthlyPrice = `${(price / currentPlan?.duration / 100).toFixed(2)}`;
    return { yearlyPrice, monthlyPrice };
  };

  return (
    <div className={s.wrapper}>
      <header className={s.header}>
        <button className={s.header__backBtn} onClick={onBackButtonClick}>
          Back
        </button>
        <button className={s.header__upgradeBtn}>Upgrade Storage</button>
      </header>
      <p className={s.headingText}>
        You will be charged immediately and each payment period until you change
        or cancel your plan.
      </p>
      <div className={s.currentPlanWrapper}>
        <h3 className={s.currentPlanTitle}>Curent plan</h3>
        <div className={s.upgradeOptionCard}>
          {currentPlan?.price ? (
            <>
              <span>{DEFAULT_TARIFFS_NAMES[currentPlan?.storage]}</span>
              <div>
                <p>{`$${
                  getCurrentPlanPrice(currentPlan?.price).monthlyPrice
                } per month`}</p>
                <span>{`$${
                  getCurrentPlanPrice(currentPlan?.price).yearlyPrice
                } per year`}</span>
              </div>
            </>
          ) : (
            <>
              <span>5GB</span>
              <div>
                <p>$0.00 per month</p>
                <span>free forever</span>
              </div>
            </>
          )}
        </div>
        <h3 className={s.currentPlanTitle}>Upgrade options</h3>
        <p className={s.upgradeText}>
          Your storage plan will automatically renew. You can cancel at any
          time. <a href="/">Learn more</a>
        </p>
      </div>
      <div className={s.options}>
        <div className={s.upgradeOptionsHeader}>
          <h3>Ghostdrive+</h3>
          <p>Yearly</p>
          <Switch />
        </div>
        <ul className={s.optionsList} onClick={onPlanClick}>
          {tariffList.map((tariffPlan) => (
            <li id={tariffPlan.priceId}>
              <div
                className={`${s.optionsList__card} ${
                  plan === "100GB" ? s.active : ""
                }`}>
                <span>{tariffPlan.value}</span>
                <div>
                  <p>{`$${getTariffMonthlyPrice(
                    tariffPlan.price
                  )} per month`}</p>
                  <span>
                    {`$${getTariffYearlyPrice(tariffPlan.price)} per year`}{" "}
                    {duration > 1 && (
                      <span>{yearlyDiscount[tariffPlan.tarifStorage]}</span>
                    )}
                  </span>
                </div>
                <input
                  className={s.checkbox}
                  type="checkbox"
                  checked={plan === tariffPlan.priceId}></input>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <button
        className={s.payButton}
        onClick={payByCreditCard}
        disabled={!!!plan}>
        Pay <CoinIcon />
      </button>
      {showPaymentModal && (
        <BillingModal
          isOpen={showPaymentModal}
          onClose={onClosePaymentModal}
          clientSecret={subscription?.clientSecret}
          successCallback={onPaymentSuccess}
        />
      )}
    </div>
  );
};
