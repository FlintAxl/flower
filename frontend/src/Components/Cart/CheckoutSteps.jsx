import React from 'react'
import { Box, Stepper, Step, StepLabel } from '@mui/material'

const CheckoutSteps = ({ shipping, confirmOrder, payment }) => {
    const steps = ['Shipping', 'Confirm Order', 'Payment']

    let activeStep = 0
    if (payment) {
        activeStep = 2
    } else if (confirmOrder) {
        activeStep = 1
    } else {
        activeStep = 0
    }

    return (
        <Box className="max-w-3xl mx-auto mt-8 mb-6 px-4">
            <Stepper
                alternativeLabel
                activeStep={activeStep}
                sx={{
                    '& .MuiStepIcon-root': {
                        color: 'rgba(148, 163, 184, 0.6)'
                    },
                    '& .MuiStepIcon-root.Mui-active': {
                        color: '#a855f7'
                    },
                    '& .MuiStepIcon-root.Mui-completed': {
                        color: '#4f46e5'
                    },
                    '& .MuiStepLabel-label': {
                        color: '#6b7280',
                        fontWeight: 500
                    },
                    '& .MuiStepLabel-label.Mui-active': {
                        color: '#111827'
                    }
                }}
           >
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    )
}

export default CheckoutSteps