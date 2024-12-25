
import {
  Box,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
} from '@chakra-ui/react'
import { values } from 'lodash'

const steps = [
  { title: 'ZCAWP', description: 'WIP ไม้ระแนงSCG 117.4x305x0.8 MS' },
  { title: 'ZCAWP', description: 'WIP ไม้ระแนงSCG 7.5x300x0.8 PK/CM' },
  { title: 'ZCA', description: 'ไม้ระแนง_SCG ลบมุม 7.5x300x0.8 ซีเมนต์' },
]

export default function Flow() {
  const { activeStep } = useSteps({
    index: 3,
    count: steps.length,
  })

  return (
    <Stepper size='lg' colorScheme='yellow' index={activeStep}>
      {steps.map((step, index) => (
        <Step key={index}>
          <StepIndicator>

          </StepIndicator>

          <Box flexShrink='0'>
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>{step.description}</StepDescription>
          </Box>

          <StepSeparator />
        </Step>
      ))}
    </Stepper>
  )
}

