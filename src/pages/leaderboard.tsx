import Layout from "../components/Layout"
import dynamic from 'next/dynamic'
import { EmailPasswordAuth } from 'supertokens-auth-react/recipe/emailpassword'

const EmailPasswordAuthNoSSR = dynamic(
  new Promise<typeof EmailPasswordAuth>((res) =>
    res(EmailPasswordAuth)
  ),
  { ssr: false }
)

const Leaderboard = () => {
  return (
    <EmailPasswordAuthNoSSR requireAuth={false}>
      <Layout>
        
      </Layout>
    </EmailPasswordAuthNoSSR>
  )
}

export default Leaderboard