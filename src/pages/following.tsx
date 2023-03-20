import NavBar from "../components/NavBar"
import Layout from "../components/Layout"
import dynamic from 'next/dynamic'
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword'
import { AppShell, Button, Pagination, Table, TextInput, Skeleton } from "@mantine/core"
import { useDebouncedValue } from '@mantine/hooks'
import Session from 'supertokens-auth-react/recipe/session'
import { useState, useEffect } from "react"
import React from 'react'
import { UserSearch } from "tabler-icons-react"

import _ from 'lodash'
import axios from 'axios'
import useSWR from "swr"
Session.addAxiosInterceptors(axios)

const EmailPasswordAuthNoSSR = dynamic(
  new Promise<typeof EmailPassword.EmailPasswordAuth>((res) =>
    res(EmailPassword.EmailPasswordAuth)
  ),
  { ssr: false }
)

const Following = () => {
  
  const [value, setValue] = useState('')
  const [users, setUsers] = useState<string[][]>([[]])
  const [userCount, setUserCount] = useState(0)
  const [activePage, setPage] = useState(1)
  const [unfollowUsersLoading, setUnfollowUsersLoading] = useState<boolean[]>([])
  const [unfollowUsersSuccess, setUnfollowUsersSuccess] = useState<boolean[]>([])
  const [unfollowUsersText, setUnfollowUsersText] = useState<string[]>([])
  const [hovers, setHovers] = useState<boolean[]>([])
  const [debounced] = useDebouncedValue(value, 250)

  const { data } = useSWR(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/auth/following`, (url: string) => 
    axios.get(url)
      .then(res => {
        if (res.data.following.length > 0) {
          let chunked: string[][] = _.chunk(res.data.following, 20)
          setUsers(chunked)
          setUserCount(res.data.following.length)
          setUnfollowUsersLoading(new Array(chunked[0].length).fill(false))
          setUnfollowUsersSuccess(new Array(chunked[0].length).fill(false))
          setUnfollowUsersText(new Array(chunked[0].length).fill("Unfollow"))
          setHovers(new Array(chunked[0].length).fill(false))
          return chunked
        }
        return [[]]
      }))

  useEffect(() => {
    if (data) {
      let flattened = _.flatten(data)
      let filtered = flattened.filter((user: string) => user.startsWith(debounced))
      if (filtered.length > 0) {
        let chunked: string[][] = _.chunk(filtered, 20)
        setUsers(chunked)
        setUnfollowUsersLoading(new Array(chunked[0].length).fill(false))
        setUnfollowUsersSuccess(new Array(chunked[0].length).fill(false))
        setUnfollowUsersText(new Array(chunked[0].length).fill("Unfollow"))
        setHovers(new Array(chunked[0].length).fill(false))
      } else {
        setUsers([[]])
        setUnfollowUsersLoading([])
        setUnfollowUsersSuccess([])
        setUnfollowUsersText([])
        setHovers([])
      }
    }
  }, [debounced, data])

  const toggleHover = (idx: number) => {
    setHovers(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
  }

  const onPageChange = (page: number) => {
    setPage(page)
    setUnfollowUsersLoading(new Array(users[page - 1].length).fill(false))
    setUnfollowUsersSuccess(new Array(users[page - 1].length).fill(false))
    setUnfollowUsersText(new Array(users[page - 1].length).fill("Unfollow"))
    setHovers(new Array(users[page - 1].length).fill(false))
  }

  const followApi = (user: string, idx: number) => {
    setUnfollowUsersLoading(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
    if (unfollowUsersText[idx] === "Follow") {
      axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/auth/follow`,
        {
          follow: user
        },
        {
          headers: {
            "rid": "emailpassword"
          }
        })
      .then(() => {
        setUnfollowUsersLoading(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
        setUnfollowUsersSuccess(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
        setUnfollowUsersText(state => [...state.slice(0, idx), "Followed", ...state.slice(idx + 1)])
        setTimeout(() => {
          setUnfollowUsersSuccess(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
          setUnfollowUsersText(state => [...state.slice(0, idx), "Unfollow", ...state.slice(idx + 1)])
        }, 2000)
      }).catch(err => {
        console.error(err)
      })
    } else {
      axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/auth/follow`,
        {
          unfollow: user
        },
        {
          headers: {
            "rid": "emailpassword"
          }
        })
      .then(() => {
        setUnfollowUsersLoading(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
        setUnfollowUsersSuccess(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
        setUnfollowUsersText(state => [...state.slice(0, idx), "Unfollowed", ...state.slice(idx + 1)])
        setTimeout(() => {
          setUnfollowUsersSuccess(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
          setUnfollowUsersText(state => [...state.slice(0, idx), "Follow", ...state.slice(idx + 1)])
        }, 2000)
      }).catch(err => {
        console.error(err)
      })
    }
  }

  let rows: JSX.Element[] = users[activePage - 1].map((user, idx) => (
    <tr key={user} onMouseEnter={() => toggleHover(idx)} onMouseLeave={() => toggleHover(idx)}>
      <td>{user}
        {(hovers[idx] || unfollowUsersLoading[idx] || unfollowUsersSuccess[idx]) && <Button
          color="blue"
          radius="lg"
          variant="outline"
          loading={unfollowUsersLoading[idx]}
          disabled={unfollowUsersSuccess[idx]}
          styles={{
            root: {
              float: "right"
            }
          }}
          onClick={() => followApi(user, idx)}>
          {unfollowUsersText[idx]}
        </Button>}
      </td>
    </tr>
  ))
  
  if (!data) {
    rows = new Array(20).fill((<Skeleton height={40} mt={6} />))
  }

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
          <TextInput label="Search following list" placeholder="BBO username" icon={<UserSearch size={14} />} onChange={(e) => setValue(e.currentTarget.value)}/>
          <Table fontSize="md" highlightOnHover><tbody>{rows}</tbody></Table>
          {userCount > 20 && <Pagination page={activePage} onChange={onPageChange} total={Math.ceil(userCount / 20)} />}
        </AppShell>
        </Layout>
      </div>
    </EmailPasswordAuthNoSSR>
  )  
}

export default Following