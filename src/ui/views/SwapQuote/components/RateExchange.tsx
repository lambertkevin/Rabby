import { TokenItem } from '@/background/service/openapi';
import { getTokenSymbol } from '@/ui/component';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useToggle } from 'react-use';
import { ReactComponent as IconTransform } from '@/ui/assets/swap/transform.svg';
import React from 'react';
import clsx from 'clsx';

type RateExchangeProps = {
  payAmount: string | number;
  receiveAmount: string | number;
  payToken: TokenItem;
  receiveToken: TokenItem;
  className?: string;
  iconClassName?: string;
};
export const RateExchange = ({
  payAmount,
  receiveAmount,
  payToken,
  receiveToken,
  className,
  iconClassName,
}: RateExchangeProps) => {
  const [on, toggle] = useToggle(false);

  const exchangeDisplay = useMemo(() => {
    const t1 = {
      num: new BigNumber(payAmount),
      symbol: getTokenSymbol(payToken),
    };
    const t2 = {
      num: new BigNumber(receiveAmount),
      symbol: getTokenSymbol(receiveToken),
    };

    let n1 = t1,
      n2 = t2;
    if (on) {
      n1 = t2;
      n2 = t1;
    }

    const v = n2.num.div(n1.num);

    return `1 ${n1.symbol} = ${v.toFixed(2, BigNumber.ROUND_FLOOR)} ${
      n2.symbol
    } `;
  }, [on, payAmount, payToken, receiveToken]);
  return (
    <div
      className={clsx(
        'flex items-center text-13 text-gray-subTitle ',
        className
      )}
    >
      <span>{exchangeDisplay}</span>
      <IconTransform
        className={clsx('cursor-pointer ml-2', iconClassName)}
        onClick={toggle}
      />
    </div>
  );
};

export default RateExchange;
