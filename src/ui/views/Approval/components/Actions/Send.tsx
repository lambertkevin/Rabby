import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { Chain } from 'background/service/openapi';
import { Result } from '@rabby-wallet/rabby-security-engine';
import { ParsedActionData, SendRequireData } from './utils';
import { formatTokenAmount, formatUsdValue } from 'ui/utils/number';
import { ellipsisTokenSymbol, getTokenSymbol } from 'ui/utils/token';
import { useRabbyDispatch } from '@/ui/store';
import { Table, Col, Row } from './components/Table';
import * as Values from './components/Values';
import LogoWithText from './components/LogoWithText';
import ViewMore from './components/ViewMore';
import { SecurityListItem } from './components/SecurityListItem';
import { SubCol, SubRow, SubTable } from './components/SubTable';

const Wrapper = styled.div`
  .header {
    margin-top: 15px;
  }
  .icon-scam-token {
    margin-left: 4px;
    width: 13px;
  }
  .icon-fake-token {
    margin-left: 4px;
    width: 13px;
  }
`;

const Send = ({
  data,
  requireData,
  chain,
  engineResults,
}: {
  data: ParsedActionData['send'];
  requireData: SendRequireData;
  chain: Chain;
  engineResults: Result[];
}) => {
  const actionData = data!;
  const dispatch = useRabbyDispatch();
  const { t } = useTranslation();

  const engineResultMap = useMemo(() => {
    const map: Record<string, Result> = {};
    engineResults.forEach((item) => {
      map[item.id] = item;
    });
    return map;
  }, [engineResults]);

  useEffect(() => {
    dispatch.securityEngine.init();
  }, []);

  return (
    <Wrapper>
      <Table>
        <Col>
          <Row isTitle>{t('page.signTx.send.sendToken')}</Row>
          <Row>
            <LogoWithText
              logo={actionData.token.logo_url}
              text={
                <>
                  {formatTokenAmount(actionData.token.amount)}{' '}
                  <Values.TokenSymbol token={actionData.token} />
                </>
              }
              logoRadius="100%"
            />
          </Row>
        </Col>
        <Col>
          <Row isTitle>{t('page.signTx.send.sendTo')}</Row>
          <Row>
            <ViewMore
              type="receiver"
              data={{
                token: actionData.token,
                address: actionData.to,
                chain,
                eoa: requireData.eoa,
                cex: requireData.cex,
                contract: requireData.contract,
                usd_value: requireData.usd_value,
                hasTransfer: requireData.hasTransfer,
                isTokenContract: requireData.isTokenContract,
                name: requireData.name,
                onTransferWhitelist: requireData.onTransferWhitelist,
              }}
            >
              <Values.Address
                id="send-contract"
                hasHover
                address={actionData.to}
                chain={chain}
              />
            </ViewMore>
          </Row>
        </Col>
        <SubTable target="send-contract">
          <SubCol>
            <SubRow isTitle>{t('page.signTx.addressNote')}</SubRow>
            <SubRow>
              <Values.AddressMemo address={actionData.to} />
            </SubRow>
          </SubCol>
          {!!requireData.name && (
            <SubCol>
              <SubRow isTitle>{t('page.signTx.protocol')} </SubRow>
              <SubRow>{requireData.name}</SubRow>
            </SubCol>
          )}
          <SecurityListItem
            engineResult={engineResultMap['1016']}
            dangerText={t('page.signTx.send.receiverIsTokenAddress')}
            id="1016"
          />
          <SecurityListItem
            engineResult={engineResultMap['1019']}
            dangerText={t('page.signTx.send.contractNotOnThisChain')}
            id="1019"
          />
          {requireData.cex && (
            <>
              <SubCol>
                <SubRow isTitle>{t('page.signTx.send.cexAddress')}</SubRow>
                <SubRow>
                  <LogoWithText
                    logo={requireData.cex.logo}
                    text={requireData.cex.name}
                    logoSize={14}
                    textStyle={{
                      fontSize: '13px',
                      lineHeight: '15px',
                      color: '#4B4D59',
                      fontWeight: 'normal',
                    }}
                  />
                </SubRow>
              </SubCol>
              <SecurityListItem
                noTitle
                engineResult={engineResultMap['1021']}
                dangerText={t('page.signTx.send.notTopupAddress')}
                id="1021"
              />
              <SecurityListItem
                noTitle
                engineResult={engineResultMap['1020']}
                dangerText={t('page.signTx.send.tokenNotSupport', [
                  ellipsisTokenSymbol(getTokenSymbol(actionData.token)),
                ])}
                id="1020"
              />
            </>
          )}
          <SecurityListItem
            title={t('page.signTx.transacted')}
            engineResult={engineResultMap['1018']}
            warningText={<Values.Transacted value={false} />}
            id="1018"
          />
          <SecurityListItem
            title={t('page.signTx.send.whitelistTitle')}
            engineResult={engineResultMap['1033']}
            safeText={t('page.signTx.send.onMyWhitelist')}
            id="1033"
          />
        </SubTable>
      </Table>
    </Wrapper>
  );
};

export default Send;
