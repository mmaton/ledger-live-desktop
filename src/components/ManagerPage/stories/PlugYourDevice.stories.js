// @flow

import React from 'react'

import { storiesOf } from '@storybook/react'

import Box from 'components/base/Box'
import PlugYourDevice from '../PlugYourDevice'

const stories = storiesOf('Components', module)

stories.add('PlugYourDevice', () => (
  <Box bg="lightGrey" p={6}>
    <PlugYourDevice />
  </Box>
))
