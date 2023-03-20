import React from 'react';
import About from '../components/About';
import TopStats from '../components/TopStats';
import Layout from '../components/Layout';
import dynamic from 'next/dynamic'
import { EmailPasswordAuth } from 'supertokens-auth-react/recipe/emailpassword'

const EmailPasswordAuthNoSSR = dynamic(
  new Promise<typeof EmailPasswordAuth>((res) =>
    res(EmailPasswordAuth)
  ),
  { ssr: false }
)

/*export async function getServerSideProps(context) {
  // this runs on the backend, so we must call init on supertokens-node SDK
  supertokensNode.init(backendConfig())
  let session
  try {
    session = await Session.getSession(context.req, context.res)
  } catch (err) {
    if (err.type === Session.Error.TRY_REFRESH_TOKEN) {
      return { props: { fromSupertokens: 'needs-refresh' } }
    } else if (err.type === Session.Error.UNAUTHORISED) {
      return { props: {} }
    } else {
      throw err
    }
  }
  return {
    props: { userId: session.getUserId() },
  }
}
*/

function App() {
  return (
    <EmailPasswordAuthNoSSR requireAuth={false}>
      <Layout>
      <About />
      <TopStats />
      </Layout>
    </EmailPasswordAuthNoSSR>
  );
}

export default App;



  
