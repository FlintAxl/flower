import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { countries } from 'countries-list'
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import { Box, Paper, TextField, Button, MenuItem, Typography } from '@mui/material';

const Shipping = ({ shipping, saveShippingInfo }) => {

    const countriesList = Object.values(countries)
    const [address, setAddress] = useState(shipping.address)
    const [city, setCity] = useState(shipping.city)
    const [postalCode, setPostalCode] = useState(shipping.postalCode)
    const [phoneNo, setPhoneNo] = useState(shipping.phoneNo)
    const [country, setCountry] = useState(shipping.country)
    let navigate = useNavigate();
    const submitHandler = (e) => {
        e.preventDefault()

        saveShippingInfo({ address, city, phoneNo, postalCode, country })
        navigate('/confirm')
    }

    return (
        <>
            <MetaData title={'Shipping Info'} />
            <CheckoutSteps shipping />
            <Box className="min-h-[70vh] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-purple-50 via-rose-50 to-indigo-50 dark:from-base-dark dark:via-base-soft dark:to-base-soft">
                <Paper
                    elevation={6}
                    className="w-full max-w-lg rounded-2xl bg-white/90 dark:bg-base-soft/90 border border-purple-200/60 dark:border-purple-500/30 p-8"
                >
                    <Typography
                        variant="h5"
                        component="h1"
                        className="font-semibold text-gray-900 dark:text-ink tracking-wide mb-1 text-center"
                    >
                        Shipping Info
                    </Typography>
                    <Typography
                        variant="body2"
                        className="text-center text-gray-600 dark:text-ink-muted mb-6"
                    >
                        Tell us where to send your flowers
                    </Typography>

                    <form onSubmit={submitHandler} className="space-y-5">
                        <TextField
                            id="address_field"
                            label="Address"
                            type="text"
                            fullWidth
                            variant="outlined"
                            size="medium"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />

                        <TextField
                            id="city_field"
                            label="City"
                            type="text"
                            fullWidth
                            variant="outlined"
                            size="medium"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                        />

                        <TextField
                            id="phone_field"
                            label="Phone No"
                            type="tel"
                            fullWidth
                            variant="outlined"
                            size="medium"
                            value={phoneNo}
                            onChange={(e) => setPhoneNo(e.target.value)}
                            required
                        />

                        <TextField
                            id="postal_code_field"
                            label="Postal Code"
                            type="number"
                            fullWidth
                            variant="outlined"
                            size="medium"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            required
                        />

                        <TextField
                            id="country_field"
                            label="Country"
                            select
                            fullWidth
                            variant="outlined"
                            size="medium"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                        >
                            {countriesList.map(countryObj => (
                                <MenuItem key={countryObj.name} value={countryObj.name}>
                                    {countryObj.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Button
                            id="shipping_btn"
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                borderRadius: '999px',
                                py: 1.4,
                                textTransform: 'none',
                                fontWeight: 600,
                                backgroundImage: 'linear-gradient(to right, #a855f7, #6366f1)',
                                boxShadow: '0 10px 25px rgba(88, 28, 135, 0.35)',
                                '&:hover': {
                                    backgroundImage: 'linear-gradient(to right, #9333ea, #4f46e5)',
                                    boxShadow: '0 12px 30px rgba(76, 29, 149, 0.5)'
                                }
                            }}
                        >
                            Continue
                        </Button>
                    </form>
                </Paper>
            </Box>

        </>
    )
}

export default Shipping
