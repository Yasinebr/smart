'use client';

import {Inter} from 'next/font/google';

import {AuthProvider} from '@/context/AuthContext';
import './globals.css';
import * as React from 'react';
import {createTheme, ThemeProvider, Theme} from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import rtlPlugin from 'stylis-plugin-rtl';
import {prefixer} from 'stylis';
import {CacheProvider} from '@emotion/react';
import createCache from '@emotion/cache'
import {CssBaseline} from "@mui/material";


const rtlCache = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

const theme = (outerTheme) =>
    createTheme({
        direction: 'rtl',
        typography: {
            fontFamily: [
                "vazir",
                'sans-serif',
            ].join(','),
        }
    });


export default function RootLayout({children}) {

    document.documentElement.setAttribute('dir', 'rtl');


    return (
        <html lang="fa" dir="rtl">
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <title>سیستم پارکینگ هوشمند</title>
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700&display=swap"
            />
        </head>
        <body className={"font-vazir"}>
        <CacheProvider value={rtlCache}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </ThemeProvider>
        </CacheProvider>

        </body>
        </html>
    );
}