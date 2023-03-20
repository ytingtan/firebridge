import { Navbar, ThemeIcon, UnstyledButton, Group, Text } from '@mantine/core'
import { ChartBar, Database, Home, Friends, UserSearch } from 'tabler-icons-react'
import { useRouter } from 'next/router'

export default function NavBar() {    
  return (
    <SecondNavigationBar />
  );
}

interface MainLinkProps {
  icon: React.ReactNode
  color: string
  label: string
  href: string
}

function MainLink({ icon, color, label, href }: MainLinkProps) {
  const router = useRouter()
  return (
    <UnstyledButton
      sx={(theme) => ({
        display: 'block',
        width: '100%',
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

        '&:hover': {
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        },
      })}
      onClick={(e: any) => router.push(href)}
    >
      <Group>
        <ThemeIcon color={color} variant="light">
          {icon}
        </ThemeIcon>

        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  )
}

const data = [
  { icon: <Home size={16} />, color: 'orange', label: 'Home', href: '/home' },
  { icon: <Friends size={16} />, color: 'cyan', label: 'Following', href: '/following' },
  { icon: <Database size={16} />, color: 'grape', label: 'Boards', href: '/boards' },
  { icon: <ChartBar size={16} />, color: 'indigo', label: 'Statistics', href: '/stats' },
  { icon: <UserSearch size={16} />, color: 'teal', label: 'User Search', href: '/usersearch' },
]

function SecondNavigationBar() {
  return (
    <div className="App">
    <Navbar height={600} p="xs" width={{ base: 200 }}>
      <Navbar.Section grow>
        <div>
          {data.map((link) => <MainLink {...link} key={link.label} />)}
        </div>
      </Navbar.Section>
    </Navbar>
    </div>
  );
}