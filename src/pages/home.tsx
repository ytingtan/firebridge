import NavBar from "../components/NavBar"
import Layout from "../components/Layout"
import dynamic from 'next/dynamic'
import { EmailPasswordAuth } from 'supertokens-auth-react/recipe/emailpassword'
import { AppShell } from "@mantine/core"

const EmailPasswordAuthNoSSR = dynamic(
  new Promise<typeof EmailPasswordAuth>((res) =>
    res(EmailPasswordAuth)
  ),
  { ssr: false }
)

const Home = () => {
  return (
    <EmailPasswordAuthNoSSR>
      <div> 
        <Layout> 
        <AppShell
          padding="md"
          fixed={false}
          navbar={<NavBar />}
          styles={(theme) => ({
            main: {
              backgroundColor:
                theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
            },
          })}
        >
        </AppShell>
        </Layout>
      </div>
    </EmailPasswordAuthNoSSR>
  )
}

export default Home