import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { redirectToAuth } from 'supertokens-auth-react/recipe/emailpassword'
import SuperTokens from 'supertokens-auth-react'
import AltLayout from '../../components/AltLayout'

const SuperTokensComponentNoSSR = dynamic(
  new Promise<typeof SuperTokens.getRoutingComponent>((res) => res(SuperTokens.getRoutingComponent)),
  { ssr: false }
)

export default function Auth() {
  useEffect(() => {
    if (SuperTokens.canHandleRoute() === false) {
      redirectToAuth()
    }
  }, [])

  return (
    <AltLayout>
      <SuperTokensComponentNoSSR />
    </AltLayout>
  )
}