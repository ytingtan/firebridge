import NavBar from "../components/NavBar"
import Layout from "../components/Layout"
import dynamic from 'next/dynamic'
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword'
import useSWR from 'swr'
import axios from 'axios'
import { Tabs, Skeleton, Title, AppShell } from '@mantine/core'
import qs from 'qs'
import _ from 'lodash'

const EmailPasswordAuthNoSSR = dynamic(
  new Promise<typeof EmailPassword.EmailPasswordAuth>((res) =>
    res(EmailPassword.EmailPasswordAuth)
  ),
  { ssr: false }
)

const Tab = ({ period }: {period: string}) => {
  const statNames = ['%_3n_make', 'tricks_diff_declaring', '%_game_make', '%_slam_make', '%_grand_make',
    'tricks_diff_defence', '%_missed_game', '%_x_pen_optimal', '%_x_sac_optimal', 'avg_lead_cost',
    'avg_points_diff', 'avg_imps_diff'
  ]

  const { data } = useSWR([`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/stats/${period}`, statNames], (url: string, params: string[]) => 
    axios.get(url, {
      params: { type: params },
      paramsSerializer: params => 
        qs.stringify(params, { indices: false })
      }).then(res => res.data)
  )

  if (!data) {
    return (
      <Skeleton height={500} radius="xl" />
    )
  }

  const processDataType = (key: string, data: any) => {
    if (key.charAt(0) === '%') return (data * 100).toPrecision(3) + '%'
    return data.toPrecision(3)
  }

  const processData = (key: string, data: any) => {
    if (data.val_asc === 0) {
      return processDataType(key, data.val_desc)
    } else if (data.val_asc === 'NaN') {
      return 'Not Applicable'
    } else {
      return processDataType(key, data.val_asc)
    }
  }

  const processStatName = (name: string) => {
    let percentage = name.includes('%')
    let res = _.startCase(_.lowerCase(name))
    if (res[0] === '3') {
      return '3' + res.substring(2) + " %"
    }
    res = res.replace('Pen', 'Penalty')
    res = res.replace('Sac', 'Sacrifice')
    res = res.replace('Avg', 'Average')
    res = res.replace('Diff', 'Difference')
    if (percentage) res += ' %'
    return res
  }

  return (
    <>
      {Object.entries(data).map(([key, value]: [key: string, value: any]) => {
        return (
          <>
            <Title order={2}>{processStatName(key)}</Title>
            <p>{processData(key, value)}</p>
          </>
        )
      })}
    </>
  )
}

const Stats = ({ fallback }: { fallback: any }) => {
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
          <Title order={1}> View all statistics here.</Title>
          <Tabs defaultValue="All-Time">
            <Tabs.List grow>
              <Tabs.Tab value="All-Time">All-Time</Tabs.Tab>
              <Tabs.Tab value="Yearly">Yearly</Tabs.Tab>
              <Tabs.Tab value="Monthly">Monthly</Tabs.Tab>
              <Tabs.Tab value="Weekly">Weekly</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="All-Time">
              <Tab period="alltime" />
            </Tabs.Panel>
            <Tabs.Panel value="Yearly">
              <Tab period="yearly" />
            </Tabs.Panel>
            <Tabs.Panel value="Monthly">
              <Tab period="monthly" />
            </Tabs.Panel>
            <Tabs.Panel value="Weekly">
              <Tab period="weekly" />
            </Tabs.Panel>
          </Tabs>
        </AppShell>
        </Layout>
      </div>
    </EmailPasswordAuthNoSSR>
  )
}

export default Stats