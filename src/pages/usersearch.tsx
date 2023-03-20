import NavBar from "../components/NavBar"
import Layout from "../components/Layout"
import dynamic from 'next/dynamic'
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword'
import { AppShell, Button, Pagination, Table, TextInput, Skeleton } from "@mantine/core"
import { useDebouncedValue } from '@mantine/hooks'
import Session from 'supertokens-auth-react/recipe/session'
import { useState, useEffect, useCallback } from "react"
import React from 'react'
import { UserSearch } from 'tabler-icons-react'

import axios from 'axios'
Session.addAxiosInterceptors(axios)

const EmailPasswordAuthNoSSR = dynamic(
  new Promise<typeof EmailPassword.EmailPasswordAuth>((res) =>
    res(EmailPassword.EmailPasswordAuth)
  ),
  { ssr: false }
)

const UserSearchPage = () => {
  const [value, setValue] = useState('')
  const [users, setUsers] = useState<string[]>([])
  const [userCount, setUserCount] = useState(0)
  const [error, setError] = useState(false)
  const [activePage, setPage] = useState(1)
  const [followUsersLoading, setFollowUsersLoading] = useState<boolean[]>([])
  const [followUsersSuccess, setFollowUsersSuccess] = useState<boolean[]>([])
  const [followUsersText, setFollowUsersText] = useState<string[]>([])
  const [hovers, setHovers] = useState<boolean[]>([])
  const [debounced] = useDebouncedValue(value, 250)

  const getUsers = useCallback((offset: number) => {
    setUserCount(-1)
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/auth/users?query=${debounced}&offset=${offset}`)
      .then(res => {
        setUsers(res.data.users)
        setUserCount(res.data.user_count)
        setFollowUsersLoading(new Array(res.data.users.length).fill(false))
        setFollowUsersSuccess(new Array(res.data.users.length).fill(false))
        setFollowUsersText(new Array(res.data.users.length).fill("Follow"))
        setHovers(new Array(res.data.users.length).fill(false))
        if (error) setError(false)
      })
      .catch(err => {
        console.error(err)
        setError(true)
      })
  }, [debounced, error])

  useEffect(() => {
    setUsers([])
    setFollowUsersLoading([])
    setFollowUsersSuccess([])
    setFollowUsersText([])
    setUserCount(0)
    setHovers([])
    if (debounced !== '') getUsers(0)
  }, [debounced, error, getUsers])

  if (error) {
    setUsers([])
    setFollowUsersLoading([])
    setFollowUsersSuccess([])
    setFollowUsersText([])
    setUserCount(0)
    setHovers([])
    if (value !== '') getUsers(0)
    setError(false)
  }

  const toggleHover = (idx: number) => {
    setHovers(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
  }

  const onPageChange = (page: number) => {
    setPage(page)
    setUsers([])
    setFollowUsersLoading([])
    setFollowUsersSuccess([])
    setFollowUsersText([])
    setHovers([])
    if (value !== '') getUsers((page - 1) * 20)
  }

  const followApi = (user: string, idx: number) => {
    setFollowUsersLoading(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
    if (followUsersText[idx] === "Follow") {
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
        setFollowUsersLoading(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
        setFollowUsersSuccess(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
        setFollowUsersText(state => [...state.slice(0, idx), "Followed", ...state.slice(idx + 1)])
        setTimeout(() => {
          setFollowUsersSuccess(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
          setFollowUsersText(state => [...state.slice(0, idx), "Unfollow", ...state.slice(idx + 1)])
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
        setFollowUsersLoading(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
        setFollowUsersSuccess(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
        setFollowUsersText(state => [...state.slice(0, idx), "Unfollowed", ...state.slice(idx + 1)])
        setTimeout(() => {
          setFollowUsersSuccess(state => [...state.slice(0, idx), !state[idx], ...state.slice(idx + 1)])
          setFollowUsersText(state => [...state.slice(0, idx), "Follow", ...state.slice(idx + 1)])
        }, 2000)
      }).catch(err => {
        console.error(err)
      })
    }
  }
  
  let rows = users.map((user, idx) => (
    <tr key={user} onMouseEnter={() => toggleHover(idx)} onMouseLeave={() => toggleHover(idx)}>
      <td>{user}
        {(hovers[idx] || followUsersLoading[idx] || followUsersSuccess[idx]) && <Button
          color="blue"
          radius="lg"
          variant="outline"
          loading={followUsersLoading[idx]}
          disabled={followUsersSuccess[idx]}
          styles={{
            root: {
              float: "right"
            }
          }}
          onClick={() => followApi(user, idx)}>
          {followUsersText[idx]}
        </Button>}
      </td>
    </tr>
  ))

  if (rows.length === 0 && userCount === -1) {
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
          <TextInput label="User Search" placeholder="BBO username" icon={<UserSearch size={14} />} onChange={(e) => setValue(e.currentTarget.value)}/>
          <Table fontSize="md" highlightOnHover><tbody>{rows}</tbody></Table>
          {userCount > 20 && <Pagination page={activePage} onChange={onPageChange} total={Math.ceil(userCount / 20)} />}
        </AppShell>
        </Layout>
      </div>
    </EmailPasswordAuthNoSSR>
  )  
}

export default UserSearchPage