import { Nav, Navbar, Container } from 'react-bootstrap';
import headerImg from '../public/img/header-black-removebg-preview.png';
import Image from 'next/image'
import Link from 'next/link'
import { Menu, ActionIcon, Group, Avatar, Text } from '@mantine/core';
import { Dots, Settings, Logout } from 'tabler-icons-react';
import { useRouter } from 'next/router';
import { signOut } from "supertokens-auth-react/recipe/emailpassword"
import Session, { useSessionContext } from 'supertokens-auth-react/recipe/session'
import useSWR, { useSWRConfig } from 'swr'
import axios from 'axios'
import _ from 'lodash'
Session.addAxiosInterceptors(axios)

export default function Header(props: any) {
  return (
    <header>
        <NavigationBar/>
    </header>
  );
}

function NavigationBar() {

  const router = useRouter()
  const { doesSessionExist } = useSessionContext()
  const { mutate } = useSWRConfig()


  const logout = async () => {
    await signOut()
    mutate(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/auth/sessioninfo`)
    mutate(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/boards/alltime`)
    router.push('/')
  }

  const { data } = useSWR(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/auth/sessioninfo`, (url: string) => 
    axios.get(url).then(res => res.data))

  return (
    <div className="App">
    <Navbar collapseOnSelect expand="lg" bg="light" variant="light">
      <Container>
        <Navbar.Brand><Link href="/">
          <a><Image src={headerImg} height='60rem' width='170rem' alt="Logo" /></a>
        </Link></Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Link href="/#about"><a className='nav-link'>About</a></Link>
            <Link href="/#leaderboard"><a className='nav-link'>Leaderboard</a></Link>
            {doesSessionExist && <Link href="/profile"><a className='nav-link'>Profile</a></Link>}
          </Nav>
          {doesSessionExist ?
            <Menu width={250} withArrow position="bottom-end" transition="pop">
              <Menu.Target>
                <ActionIcon>
                  <Dots size={16} strokeWidth={1.5} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item>
                  { data
                    ? <Group>
                        { data.avatar ?
                          <Avatar
                            radius="xl"
                            src={data.avatar}
                          />
                          :
                          <Avatar
                            radius="xl"
                            color="cyan"
                          >{data.name.split(' ').map((word: string) => _.upperCase(word[0]))}
                          </Avatar>
                        }
                        <div>
                          <Text weight={500}>{data.name}</Text>
                          <Text size="xs" color="dimmed">
                            {data.email}
                          </Text>
                        </div>
                      </Group>
                    : 'Loading...'
                  }
                </Menu.Item>
                <Menu.Item onClick={() => router.push('/profile')} icon={<Settings size={14} />}>Account settings</Menu.Item>
                <Menu.Item onClick={logout} icon={<Logout size={14} />}>Logout</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            :
            <Nav>
              <Link href="/auth">
                <a className='nav-link'>Log In</a>
              </Link>
              <Link href="/auth">
                <a className='nav-link'>Sign Up</a>
              </Link>
            </Nav>
          }
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </div>
  );
}