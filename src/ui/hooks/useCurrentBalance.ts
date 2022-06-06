import { useEffect, useState } from 'react';
import { useWallet, useWalletRequest } from 'ui/utils';

import type { ChainWithBalance } from 'background/service/openapi';

import { CHAINS } from 'consts';

interface DisplayChainWithWhiteLogo extends ChainWithBalance {
  logo?: string;
  whiteLogo?: string;
}

const formatChain = (item: ChainWithBalance): DisplayChainWithWhiteLogo => {
  const chainsArray = Object.values(CHAINS);
  const chain = chainsArray.find((chain) => chain.id === item.community_id);

  return {
    ...item,
    logo: chain?.logo || item.logo_url,
    whiteLogo: chain?.whiteLogo,
  };
};

export default function useCurrentBalance(
  account: string | undefined,
  update = false,
  noNeedBalance = false
) {
  const wallet = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [success, setSuccess] = useState(true);
  let isCanceled = false;
  const [chainBalances, setChainBalances] = useState<
    DisplayChainWithWhiteLogo[]
  >([]);

  const [getAddressBalance] = useWalletRequest(wallet.getAddressBalance, {
    onSuccess({ total_usd_value, chain_list }) {
      if (isCanceled) return;
      setBalance(total_usd_value);
      setSuccess(true);
      setChainBalances(
        chain_list.filter((item) => item.usd_value > 0).map(formatChain)
      );
    },
    onError() {
      setSuccess(false);
    },
  });

  const getCurrentBalance = async () => {
    if (!account || noNeedBalance) return;
    const cacheData = await wallet.getAddressCacheBalance(account);
    if (cacheData) {
      setBalance(cacheData.total_usd_value);
      if (update) {
        getAddressBalance(account.toLowerCase());
      }
    } else {
      getAddressBalance(account.toLowerCase());
    }
  };

  useEffect(() => {
    getCurrentBalance();
    if (!noNeedBalance) {
      wallet.getAddressCacheBalance(account).then((cache) => {
        setChainBalances(
          cache
            ? cache.chain_list
                .filter((item) => item.usd_value > 0)
                .map(formatChain)
            : []
        );
      });
    }
    return () => {
      isCanceled = true;
    };
  }, [account]);
  return [balance, chainBalances, getAddressBalance, success] as const;
}
