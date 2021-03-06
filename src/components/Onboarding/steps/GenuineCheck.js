// @flow

import React, { PureComponent, Fragment } from 'react'
import { shell } from 'electron'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { radii, colors } from 'styles/theme'

import type { T } from 'types/common'

import { updateGenuineCheck } from 'reducers/onboarding'

import Box, { Card } from 'components/base/Box'
import Button from 'components/base/Button'
import RadioGroup from 'components/base/RadioGroup'
import GenuineCheckModal from 'components/GenuineCheckModal'

import IconLedgerNanoError from 'icons/illustrations/LedgerNanoError'
import IconLedgerBlueError from 'icons/illustrations/LedgerBlueError'
import IconCheck from 'icons/Check'

import { Title, Description, IconOptionRow } from '../helperComponents'

import type { StepProps } from '..'
import OnboardingFooter from '../OnboardingFooter'

const mapDispatchToProps = { updateGenuineCheck }

type State = {
  cachedPinStepButton: string,
  cachedRecoveryStepButton: string,
  isGenuineCheckModalOpened: boolean,
}

const INITIAL_STATE = {
  cachedPinStepButton: '',
  cachedRecoveryStepButton: '',
  isGenuineCheckModalOpened: false,
}

class GenuineCheck extends PureComponent<StepProps, State> {
  state = {
    ...INITIAL_STATE,
    cachedPinStepButton: this.props.onboarding.genuine.pinStepPass ? 'yes' : '',
    cachedRecoveryStepButton: this.props.onboarding.genuine.recoveryStepPass ? 'yes' : '',
  }

  getButtonLabel() {
    const { t } = this.props
    return [
      {
        label: t('common:yes'),
        key: 'yes',
        pass: true,
      },
      {
        label: t('common:no'),
        key: 'no',
        pass: false,
      },
    ]
  }

  handleButtonPass = (item: Object, step: string) => {
    this.props.updateGenuineCheck({ [`${step}`]: item.pass })
    if (step === 'pinStepPass') {
      this.setState({ cachedPinStepButton: item.key })
    } else {
      this.setState({ cachedRecoveryStepButton: item.key })
    }

    if (!item.pass) {
      this.setState(INITIAL_STATE)
      this.props.updateGenuineCheck({
        isGenuineFail: true,
        recoveryStepPass: false,
        pinStepPass: false,
        isDeviceGenuine: false,
      })
    }
  }

  handleOpenGenuineCheckModal = () => this.setState({ isGenuineCheckModalOpened: true })
  handleCloseGenuineCheckModal = () => this.setState({ isGenuineCheckModalOpened: false })

  handleGenuineCheck = async isGenuine => {
    await new Promise(r => setTimeout(r, 1e3)) // let's wait a bit before closing modal
    this.handleCloseGenuineCheckModal()
    this.props.updateGenuineCheck({
      isDeviceGenuine: isGenuine,
    })
  }

  redoGenuineCheck = () => {
    this.props.updateGenuineCheck({ isGenuineFail: false })
  }

  contactSupport = () => {
    const contactSupportUrl =
      'https://support.ledgerwallet.com/hc/en-us/requests/new?ticket_form_id=248165'
    shell.openExternal(contactSupportUrl)
  }

  renderGenuineFail = () => (
    <GenuineCheckFail
      redoGenuineCheck={this.redoGenuineCheck}
      contactSupport={this.contactSupport}
      t={this.props.t}
      isLedgerNano={this.props.onboarding.isLedgerNano}
    />
  )

  render() {
    const { nextStep, prevStep, t, onboarding } = this.props
    const { genuine } = onboarding
    const { cachedPinStepButton, cachedRecoveryStepButton, isGenuineCheckModalOpened } = this.state

    if (genuine.isGenuineFail) {
      return this.renderGenuineFail()
    }

    return (
      <Box sticky pt={50}>
        <Box grow alignItems="center" justifyContent="center">
          <Title>{t('onboarding:genuineCheck.title')}</Title>
          <Description>{t('onboarding:genuineCheck.desc')}</Description>
          <Box mt={5}>
            <CardWrapper>
              <Box justify="center">
                <Box horizontal>
                  <IconOptionRow>1.</IconOptionRow>
                  <CardTitle>{t('onboarding:genuineCheck.steps.step1.title')}</CardTitle>
                </Box>
              </Box>
              <Box justify="center">
                <RadioGroup
                  items={this.getButtonLabel()}
                  activeKey={cachedPinStepButton}
                  onChange={item => this.handleButtonPass(item, 'pinStepPass')}
                />
              </Box>
            </CardWrapper>
          </Box>
          <Box mt={3}>
            <CardWrapper isDisabled={!genuine.pinStepPass}>
              <Box justify="center">
                <Box horizontal>
                  <IconOptionRow>2.</IconOptionRow>
                  <CardTitle>{t('onboarding:genuineCheck.steps.step2.title')}</CardTitle>
                </Box>
              </Box>
              <Box justify="center">
                <RadioGroup
                  items={this.getButtonLabel()}
                  activeKey={cachedRecoveryStepButton}
                  onChange={item => this.handleButtonPass(item, 'recoveryStepPass')}
                />
              </Box>
            </CardWrapper>
          </Box>
          <Box mt={3}>
            <CardWrapper isDisabled={!genuine.recoveryStepPass}>
              <Box justify="center">
                <Box horizontal>
                  <IconOptionRow>3.</IconOptionRow>
                  <CardTitle>{t('onboarding:genuineCheck.steps.step3.title')}</CardTitle>
                </Box>
              </Box>
              <Box justify="center">
                {genuine.isDeviceGenuine ? (
                  <Box horizontal align="center" flow={1} color={colors.wallet}>
                    <IconCheck size={16} />
                    <GenuineSuccessText>
                      {t('onboarding:genuineCheck.isGenuinePassed')}
                    </GenuineSuccessText>
                  </Box>
                ) : (
                  <Button
                    primary
                    disabled={!genuine.recoveryStepPass}
                    onClick={this.handleOpenGenuineCheckModal}
                  >
                    {t('onboarding:genuineCheck.buttons.genuineCheck')}
                  </Button>
                )}
              </Box>
            </CardWrapper>
          </Box>
        </Box>
        <OnboardingFooter
          horizontal
          align="center"
          flow={2}
          t={t}
          nextStep={nextStep}
          prevStep={prevStep}
          isContinueDisabled={!genuine.isDeviceGenuine}
        />
        <GenuineCheckModal
          isOpened={isGenuineCheckModalOpened}
          onClose={this.handleCloseGenuineCheckModal}
          onGenuineCheck={this.handleGenuineCheck}
        />
      </Box>
    )
  }
}

export default connect(
  null,
  mapDispatchToProps,
)(GenuineCheck)

// TODO extract to a separate file
export function GenuineCheckFail({
  redoGenuineCheck,
  contactSupport,
  isLedgerNano,
  t,
}: {
  redoGenuineCheck: () => void,
  contactSupport: () => void,
  isLedgerNano: boolean | null,
  t: T,
}) {
  return (
    <Box sticky pt={50}>
      <Box grow alignItems="center" justifyContent="center">
        {isLedgerNano ? (
          <Fragment>
            <Title>{t('onboarding:genuineCheck.errorPage.ledgerNano.title')}</Title>
            <Description>{t('onboarding:genuineCheck.errorPage.ledgerNano.desc')}</Description>
            <Box style={{ width: 550 }} mt={5} ml={100}>
              <IconLedgerNanoError />
            </Box>
          </Fragment>
        ) : (
          <Fragment>
            <Title>{t('onboarding:genuineCheck.errorPage.ledgerBlue.title')}</Title>
            <Description pb={5}>
              {t('onboarding:genuineCheck.errorPage.ledgerBlue.desc')}
            </Description>
            <Box alignItems="center">
              <IconLedgerBlueError />
            </Box>
          </Fragment>
        )}
      </Box>
      <Wrapper horizontal>
        <Button
          padded
          outline
          onClick={() => {
            redoGenuineCheck()
          }}
        >
          {t('common:back')}
        </Button>
        <Button
          padded
          danger
          onClick={() => {
            contactSupport()
          }}
          ml="auto"
        >
          {t('onboarding:genuineCheck.buttons.contactSupport')}
        </Button>
      </Wrapper>
    </Box>
  )
}
export const GenuineSuccessText = styled(Box).attrs({
  ff: 'Open Sans|Regular',
  fontSize: 4,
})``
export const CardTitle = styled(Box).attrs({
  ff: 'Open Sans|SemiBold',
  fontSize: 4,
  textAlign: 'left',
  pl: 2,
})``

const Wrapper = styled(Box).attrs({
  px: 5,
  py: 3,
})`
  border-top: 2px solid ${p => p.theme.colors.lightGrey};
  border-bottom-left-radius: ${radii[1]}px;
  border-bottom-right-radius: ${radii[1]}px;
`
const CardWrapper = styled(Card).attrs({
  horizontal: true,
  p: 5,
  justify: 'space-between',
})`
  width: 580px;
  height: 74px;
  border: ${p => `1px ${p.isDisabled ? 'dashed' : 'solid'} ${p.theme.colors.fog}`};
  pointer-events: ${p => (p.isDisabled ? 'none' : 'auto')};
  background-color: ${p => (p.isDisabled ? p.theme.colors.lightGrey : p.theme.colors.white)};
  opacity: ${p => (p.isDisabled ? 0.7 : 1)};
`
