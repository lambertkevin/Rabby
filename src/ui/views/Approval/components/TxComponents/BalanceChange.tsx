import React from 'react';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import { CHAINS_ENUM } from 'consts';
import {
  BalanceChange as IBalanceChange,
  TokenItem,
} from 'background/service/openapi';
import { formatAmount } from 'ui/utils/number';
import useBalanceChange from '@/ui/hooks/useBalanceChange';
import { Table, Col, Row } from '../Actions/components/Table';
import LogoWithText from '../Actions/components/LogoWithText';
import * as Values from '../Actions/components/Values';
import { ReactComponent as RcIconAlert } from 'ui/assets/sign/tx/alert-currentcolor.svg';
import { formatNumber, formatUsdValue } from 'ui/utils/number';
import { getTokenSymbol } from '@/ui/utils/token';
import { useRabbyDispatch } from 'ui/store';
import ThemeIcon from '@/ui/component/ThemeMode/ThemeIcon';
import styled from 'styled-components';

const HeadlineStyled = styled.div`
  font-size: 13px;
  line-height: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  color: var(--r-neutral-title-1, #f7fafc);
`;

const NFTBalanceChange = ({
  data,
  type,
}: {
  data: IBalanceChange;
  type: 'receive' | 'send';
}) => {
  const { t } = useTranslation();
  const {
    hasReceives,
    receiveNftList,
    hasTransferedOut,
    sendNftList,
  } = React.useMemo(() => {
    const sendNftList = data.send_nft_list.slice(0);
    const countSendNft = sendNftList.reduce(
      (accu, item) => accu + (item.amount || 0),
      0
    );
    const hasTransferedOut = sendNftList.length > 0;

    const receiveNftList = data.receive_nft_list.slice(0);
    const countReceives = receiveNftList.reduce(
      (accu, item) => accu + (item.amount || 0),
      0
    );
    const hasReceives = receiveNftList.length > 0;

    return {
      hasReceives,
      countReceives,
      receiveNftList,
      hasTransferedOut,
      countSendNft,
      sendNftList,
    };
  }, [data]);

  if (type === 'receive' && hasReceives) {
    return (
      <Col>
        <Row isTitle>{t('page.signTx.nftIn')}</Row>
        <div className="flex-1 overflow-hidden">
          {receiveNftList.map((item) => (
            <Row
              className="has-bottom-border"
              key={`${item.id}-${item.inner_id}`}
            >
              <div className="flex">
                <span
                  className="flex-1 overflow-hidden whitespace-nowrap overflow-ellipsis"
                  title={item.collection ? item.collection.name : item.name}
                >
                  <span className="text-green">+ {item.amount}</span>{' '}
                  {item.collection ? item.collection.name : item.name}
                </span>
                <Values.TokenLabel
                  isFake={item.collection?.is_verified === false}
                  isScam={
                    item.collection?.is_verified !== false &&
                    !!item.collection?.is_suspicious
                  }
                />
              </div>
            </Row>
          ))}
        </div>
      </Col>
    );
  }
  if (type === 'send' && hasTransferedOut) {
    return (
      <Col>
        <Row isTitle>{t('page.signTx.balanceChange.nftOut')}</Row>
        <div className="flex-1 overflow-hidden">
          {sendNftList.map((item) => (
            <Row
              className="has-bottom-border"
              key={`${item.id}-${item.inner_id}`}
            >
              <div className="flex">
                <span
                  className="flex-1 overflow-hidden whitespace-nowrap overflow-ellipsis"
                  title={item.collection ? item.collection.name : item.name}
                >
                  <span className="text-red-forbidden">- {item.amount}</span>{' '}
                  {item.collection ? item.collection.name : item.name}
                </span>
                <Values.TokenLabel
                  isFake={item.collection?.is_verified === false}
                  isScam={
                    item.collection?.is_verified !== false &&
                    !!item.collection?.is_suspicious
                  }
                />
              </div>
            </Row>
          ))}
        </div>
      </Col>
    );
  }
  return null;
};

const BalanceChange = ({
  data,
  version,
}: {
  data: IBalanceChange;
  isSupport?: boolean;
  isGnosis?: boolean;
  chainEnum?: CHAINS_ENUM;
  version: 'v0' | 'v1' | 'v2';
}) => {
  const dispatch = useRabbyDispatch();
  const { t } = useTranslation();

  const isSuccess = data.success;

  const { hasTokenChange, hasNFTChange } = useBalanceChange({
    balance_change: data,
  });

  const hasChange = hasNFTChange || hasTokenChange;

  const {
    receiveTokenList,
    sendTokenList,
    showUsdValueDiff,
  } = React.useMemo(() => {
    const receiveTokenList = data.receive_token_list;
    const sendTokenList = data.send_token_list;
    const showUsdValueDiff =
      data.receive_nft_list.length <= 0 &&
      data.send_nft_list.length <= 0 &&
      (data.send_token_list.length > 0 || data.receive_token_list.length > 0);
    return {
      receiveTokenList,
      sendTokenList,
      showUsdValueDiff,
    };
  }, [data]);

  const handleClickToken = (t: TokenItem) => {
    dispatch.sign.openTokenDetailPopup(t);
  };

  if (version === 'v0') {
    return (
      <div className="token-balance-change mt-10 pb-10">
        <HeadlineStyled className="mb-0">
          {t('page.signTx.balanceChange.notSupport')}
        </HeadlineStyled>
      </div>
    );
  }

  if (version === 'v1' && data.error) {
    return (
      <div className="token-balance-change">
        <HeadlineStyled>
          {isSuccess
            ? t('page.signTx.balanceChange.successTitle')
            : t('page.signTx.balanceChange.failedTitle')}
        </HeadlineStyled>
        <div className="token-balance-change-content">
          <Table>
            <Col>
              <Row>
                <span className="text-13 text-r-neutral-title-1 font-medium">
                  {t('page.signTx.balanceChange.errorTitle')}
                </span>
              </Row>
            </Col>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="token-balance-change">
      <HeadlineStyled>
        <span>{t('page.signTx.balanceChange.successTitle')}</span>
        {showUsdValueDiff && (
          <span className="flex-1 whitespace-nowrap overflow-hidden overflow-ellipsis text-r-title-1 text-right text-13 font-normal">
            {`${data.usd_value_change >= 0 ? '+' : '-'} $${formatNumber(
              Math.abs(data.usd_value_change)
            )}`}
          </span>
        )}
      </HeadlineStyled>
      <div className="token-balance-change-content">
        <Table>
          {!hasChange && isSuccess && (
            <Col>
              <Row>
                <span className="text-13 font-normal text-r-neutral-title-1">
                  {t('page.signTx.balanceChange.noBalanceChange')}
                </span>
              </Row>
            </Col>
          )}
          {data.error && (
            <Col>
              <Row className="text-13 font-medium flex whitespace-pre-wrap text-left">
                <ThemeIcon
                  src={RcIconAlert}
                  className="w-[16px] flex-shrink-0 mr-4 text-r-neutral-foot top-[2px] relative"
                />
                {t('page.signTx.balanceChange.failedTitle')} ({data.error.msg} #
                {data.error.code})
              </Row>
            </Col>
          )}
          {sendTokenList?.map((token) => (
            <Col key={token.id}>
              <Row isTitle>
                <LogoWithText
                  logo={token.logo_url}
                  text={
                    <>
                      <span className="text-red-forbidden">
                        - {formatAmount(token.amount)}
                      </span>{' '}
                      <span
                        onClick={() => handleClickToken(token)}
                        className="hover:underline cursor-pointer"
                      >
                        {getTokenSymbol(token)}
                      </span>
                    </>
                  }
                  logoRadius="100%"
                  icon={
                    <Values.TokenLabel
                      isFake={token.is_verified === false}
                      isScam={
                        token.is_verified !== false && !!token.is_suspicious
                      }
                    />
                  }
                />
              </Row>
              <Row className="text-r-neutral-body text-13 font-normal">
                ≈{' '}
                {formatUsdValue(
                  new BigNumber(token.amount).times(token.price).toFixed()
                )}
              </Row>
            </Col>
          ))}
          {receiveTokenList?.map((token) => (
            <Col key={token.id}>
              <Row isTitle>
                <LogoWithText
                  logo={token.logo_url}
                  text={
                    <>
                      <span className="text-green">
                        + {formatAmount(token.amount)}
                      </span>{' '}
                      <span
                        onClick={() => handleClickToken(token)}
                        className="hover:underline cursor-pointer"
                      >
                        {getTokenSymbol(token)}
                      </span>
                    </>
                  }
                  logoRadius="100%"
                  icon={
                    <Values.TokenLabel
                      isFake={token.is_verified === false}
                      isScam={
                        token.is_verified !== false && !!token.is_suspicious
                      }
                    />
                  }
                />
              </Row>

              <Row className="text-r-neutral-body text-13 font-normal">
                ≈{' '}
                {formatUsdValue(
                  new BigNumber(token.amount).times(token.price).toFixed()
                )}
              </Row>
            </Col>
          ))}
          <NFTBalanceChange type="send" data={data}></NFTBalanceChange>
          <NFTBalanceChange type="receive" data={data}></NFTBalanceChange>
        </Table>
      </div>
    </div>
  );
};

export default BalanceChange;
