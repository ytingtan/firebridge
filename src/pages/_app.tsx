import '../App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../index.css'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { MantineProvider } from '@mantine/core'
import React, { useEffect } from 'react'
import SuperTokensReact from 'supertokens-auth-react'
import { useRouter } from 'next/router'
import Session from 'supertokens-auth-react/recipe/session'
import { redirectToAuth } from 'supertokens-auth-react/recipe/emailpassword'
import { frontendConfig } from '../config/frontendConfig'

if (typeof window !== 'undefined') {
  SuperTokensReact.init(frontendConfig())
}

export default function MyApp(props: AppProps) {
    const { Component, pageProps } = props;

    const router = useRouter()

    useEffect(() => {
      async function doRefresh() {
        if (pageProps.fromSupertokens === 'needs-refresh') {
          if (await Session.attemptRefreshingSession()) {
            router.reload()
          } else {
            // user has been logged out
            redirectToAuth()
          }
        }
      }
      doRefresh()
    }, [pageProps.fromSupertokens, router])

    if (pageProps.fromSupertokens === 'needs-refresh') {
      return null
    }
      
    return (
        <>
            <Head>
                <title>Page title</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
            </Head>
            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                /** Put your mantine theme override here */
                colorScheme: 'light',
                }}
            >
                <Component {...pageProps} />
            </MantineProvider>
        </>
    )
}