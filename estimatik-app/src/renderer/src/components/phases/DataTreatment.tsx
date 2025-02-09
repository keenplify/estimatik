import { Box, Button, Step, StepContent, StepLabel, Stepper, Typography } from '@mui/material'
import { useState } from 'react'
import CorrelationMatrix from '../treatments/CorrelationMatrix'
import RegressionAnalysis from '../treatments/RegressionAnalysis'
import { usePhaseStore } from '@renderer/stores/phase'
import { useDataStore } from '@renderer/stores/data'

const steps = [
  {
    label: 'Correlation Matrix',
    description: `A correlation matrix is a table displaying the pairwise correlation coefficients (R) between variables, where
R≥±0.8 indicates a strong correlation, serving as a key indicator for variable selection in stepwise regression.`
  },
  {
    label: 'Stepwise Regression',
    description: `Stepwise regression is a variable selection method that iteratively adds or removes predictors based on statistical criteria, aiming to identify the combination with the highest adjusted R-squared and lowest Akaike's Information Criterion (AIC) for use in ANN modeling. `
  }
]

export default function DataTreatment() {
  const [activeStep, setActiveStep] = useState(0)
  const { setPhase, phase } = usePhaseStore()
  const { bestCandidateFields } = useDataStore()

  const handleNext = () => {
    if (activeStep == steps.length - 1) {
      setPhase(phase + 1)
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  return (
    <div className="flex gap-2">
      <Box sx={{ width: 400 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={
                  index === steps.length - 1 ? (
                    <Typography variant="caption">Last step</Typography>
                  ) : null
                }
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <Typography>{step.description}</Typography>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                    disabled={steps.length - 1 == index && bestCandidateFields.length == 0}
                  >
                    {index === steps.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button disabled={index === 0} onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>
      <div className="grow flex flex-col">
        {activeStep == 0 && <CorrelationMatrix />}
        {activeStep == 1 && <RegressionAnalysis />}
      </div>
    </div>
  )
}
