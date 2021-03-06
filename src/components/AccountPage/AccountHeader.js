// @flow

import React, { PureComponent } from 'react'
import styled from 'styled-components'

import type { Account } from '@ledgerhq/live-common/lib/types'

import Box from 'components/base/Box'
import Text from 'components/base/Text'
import CryptoCurrencyIcon from '../CryptoCurrencyIcon'

const CurName = styled(Text).attrs({
  ff: 'Open Sans|SemiBold',
  fontSize: 2,
})`
  text-transform: uppercase;
  letter-spacing: 1px;
`

const AccountName = styled(Text).attrs({
  color: 'dark',
  ff: 'Museo Sans',
  fontSize: 7,
})`
  line-height: 1;
`

type Props = {
  account: Account,
}

class AccountHeader extends PureComponent<Props> {
  render() {
    const { account } = this.props
    return (
      <Box horizontal align="center" flow={2}>
        <Box color={account.currency.color}>
          <CryptoCurrencyIcon currency={account.currency} size={24} />
        </Box>
        <Box>
          <CurName>{account.currency.name}</CurName>
          <AccountName>{account.name}</AccountName>
        </Box>
      </Box>
    )
  }
}

export default AccountHeader
