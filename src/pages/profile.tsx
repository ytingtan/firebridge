import Layout from '../components/Layout'
import axios from 'axios'
import dynamic from 'next/dynamic'
import { AppShell, Avatar, Badge, Button, FileButton, Group, Image, Modal, Overlay, Popover, Skeleton, Stack, Text, TextInput, Title, useMantineTheme } from '@mantine/core'
import { NotificationsProvider, showNotification } from '@mantine/notifications'
import { At, Check, Edit, FileX, Photo, X } from 'tabler-icons-react'
//import { CloudinaryContext, Image } from 'cloudinary-react'
import { EmailPasswordAuth } from 'supertokens-auth-react/recipe/emailpassword'
import Session from 'supertokens-auth-react/recipe/session'
import _ from 'lodash'
import NavBar from '../components/NavBar'
import useSWR from 'swr'
import sha1 from 'crypto-js/sha1'
import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
Session.addAxiosInterceptors(axios)

const EmailPasswordAuthNoSSR = dynamic(
  new Promise<typeof EmailPasswordAuth>((res) =>
    res(EmailPasswordAuth)
  ),
  { ssr: false }
)

const Profile = () => {
  
  const theme = useMantineTheme()

  interface User {
    name: string,
    bboId: string
  }

  interface UserRequest {
    loading: boolean,
    user: User | null
  }

  // Fetch the user client-side
  const { data, mutate } = useSWR(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/auth/sessioninfo`, (url: string) => 
    axios.get(url)
      .then(res => res.data))
  
  const [userRequest, setUserRequest] = useState<UserRequest>({
    loading: true,
    user: null,
  })

  const [hover, setHover] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(true)
  const [updateSuccess, setUpdateSuccess] = useState(true)
  const [deleteSuccess, setDeleteSuccess] = useState(true)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [nameError, setNameError] = useState('')
  const [bboIdError, setBboIdError] = useState('')
  const [debounced] = useDebouncedValue(userRequest.user?.bboId, 250)

  useEffect(() => {
    if (!file) {
      setPreview('')
      return
    }
    // create the preview
    const objectUrl = URL.createObjectURL(file!)
    setPreview(objectUrl)
 
    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  useEffect(() => {
    if (data && debounced !== data.bboId) {
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/auth/checkavailability?bbo_username=${debounced}`)
        .then(res => {
          if (res.data['available'] && res.data['exists']) {
            setBboIdError('')
          } else if (res.data['exists']) {
            setBboIdError("BBO username in use")
          } else {
            setBboIdError("BBO username does not exist")
          }
        })
    } else {
      setBboIdError('')
    }
  }, [debounced, data])

  if (data && userRequest.loading) {
    setUserRequest({
      loading: false,
      user: {
        name: data.name,
        bboId: data.bboId
      }
    })
  }

  // Server-render loading state
  if (!data || userRequest.loading) {
    return (
      <EmailPasswordAuthNoSSR>
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
          {Array(10).fill((<Skeleton height={40} mt={6} />))}
        </AppShell>
        </Layout>
      </EmailPasswordAuthNoSSR>
    )
  }

  const {name, bboId} = userRequest.user!

  const handleNameChange = (event: any) => {
    setUserRequest({...userRequest, user: {name: event.currentTarget.value, bboId: bboId}})
    if (/^[-a-zA-Z' ]+$/.test(event.currentTarget.value)) {
      setNameError('')
    } else {
      setNameError("Invalid name given")
    }
  }

  const handleBboIdChange = (event: any) => {
    setUserRequest({...userRequest, user: {name: name, bboId: event.currentTarget.value}})
  }
  
  const beforeUpload = (file: File) => {
    if (file.type.startsWith('image')) {
      setFile(file)
      setHover(false)
    } else {
      showNotification({
        autoClose: 5000,
        title: "Invalid file type",
        message: `${file.name} is not an image file`,
        color: 'red',
        icon: <FileX />
      })
    }
  }

  const cancelUpload = () => {
    setFile(null)
  }

  const handleUpload = () => {
    setUploadSuccess(false)
    const now = Date.now()
    if (data.avatar) {
      let hashStr = `public_id=${data.userId}&timestamp=${now}&upload_preset=${process.env.NEXT_PUBLIC_CLOUDINARY_PRESET}${process.env.NEXT_PUBLIC_CLOUDINARY_SECRET}`
      let hash = sha1(hashStr)
      let formData = new FormData()
      formData.append("file", file!)
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_KEY!)
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!)
      formData.append("public_id", data.userId)
      formData.append("timestamp", now.toString())
      formData.append("signature", hash.toString())
      axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        onUploadProgress: (progressEvent: ProgressEvent) => {
          console.log("progress", progressEvent)
        }
      }).then(res => {
        if (res.status === 200) {
          var version = res.data.version
          axios.post(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/auth/updateprofile`, {
            headers: {
              rid: 'emailpassword'
            },
            data: {
              'avatar': `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload/w_100,h_100,c_thumb,g_faces/v${version}/${data.userId}`
            }
          }).then(res => {
            mutate({ ...data, avatar: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload/w_100,h_100,c_thumb,g_faces/v${version}/${data.userId}` })
            setUploadSuccess(true)
            setFile(null)
            showNotification({
              autoClose: 5000,
              title: "Set new profile picture success!",
              message: `Your profile picture has been updated successfully`,
              color: 'green',
              icon: <Check />
            })
          }).catch(err => {
            setUploadSuccess(true)
            setFile(null)
            showNotification({
              autoClose: 5000,
              title: "Error setting new profile picture!",
              message: `Please try again`,
              color: 'red',
              icon: <X />
            })
            console.log(err)
          })
        }
      }).catch(err => {
        setUploadSuccess(true)
        setFile(null)
        showNotification({
          autoClose: 5000,
          title: "Error setting new profile picture!",
          message: `Please try again`,
          color: 'red',
          icon: <X />
        })
        console.log(err)
      })
    } else {
      let hashStr = `public_id=${data.userId}&timestamp=${now}&upload_preset=${process.env.NEXT_PUBLIC_CLOUDINARY_PRESET}${process.env.NEXT_PUBLIC_CLOUDINARY_SECRET}`
      let hash = sha1(hashStr)
      let formData = new FormData()
      formData.append("file", file!)
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_KEY!)
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!)
      formData.append("public_id", data.userId)
      formData.append("timestamp", now.toString())
      formData.append("signature", hash.toString())
      axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        onUploadProgress: (progressEvent: ProgressEvent) => {
          console.log("progress", progressEvent)
        }
      }).then(res => {
        if (res.status === 200) {
          var version = res.data.version
          axios.post(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/auth/updateprofile`, {
            headers: {
              rid: 'emailpassword'
            },
            data: {
              'avatar': `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload/w_100,h_100,c_thumb,g_faces/v${version}/${data.userId}`
            }
          }).then(res => {
            mutate({ ...data, avatar: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload/w_100,h_100,c_thumb,g_faces/v${version}/${data.userId}` })
            setUploadSuccess(true)
            setFile(null)
            showNotification({
              autoClose: 5000,
              title: "Set new profile picture success!",
              message: `Your profile picture has been updated successfully`,
              color: 'green',
              icon: <Check />
            })
          }).catch(err => {
            setUploadSuccess(true)
            setFile(null)
            showNotification({
              autoClose: 5000,
              title: "Error setting new profile picture!",
              message: `Please try again`,
              color: 'red',
              icon: <X />
            })
            console.log(err)
          })
        }
      }).catch(err => {
        setUploadSuccess(true)
        setFile(null)
        showNotification({
          autoClose: 5000,
          title: "Error setting new profile picture!",
          message: `Please try again`,
          color: 'red',
          icon: <X />
        })
        console.log(err)
      })
    }
  }

  const toggleDeleteModal = () => {
    setDeleteModalVisible(!deleteModalVisible)
  }

  const handleDeleteAvatar = () => {
    setDeleteSuccess(false)
    axios.post(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/auth/updateprofile`, {
      headers: {
        rid: 'emailpassword'
      },
      data: {
        'avatar': null
      }
    }).then(res => {
      if (res.status === 200) {
        mutate({ ...data, avatar: null })
        setDeleteModalVisible(false)
        setDeleteSuccess(true)
        showNotification({
          autoClose: 5000,
          title: "Delete profile picture success!",
          message: `Your profile picture has been deleted successfully`,
          color: 'green',
          icon: <Check />
        })
      }
    }).catch(err => {
      setDeleteSuccess(true)
      showNotification({
        autoClose: 5000,
        title: "Error deleting profile picture!",
        message: `Please try again`,
        color: 'red',
        icon: <X />
      })
      console.log(err)
    })
  }

  const handleUpdateProfile = () => {
    if (nameError) {
      showNotification({
        autoClose: 5000,
        title: nameError,
        message: `Please check provided name is valid`,
        color: 'red',
        icon: <X />
      })
      return
    }
    if (bboIdError) {
      showNotification({
        autoClose: 5000,
        title: bboIdError,
        message: `Please check BBO username is valid`,
        color: 'red',
        icon: <X />
      })
      return
    }
    setUpdateSuccess(false)
    axios.post(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/auth/updateprofile`, {
      headers: {
        rid: 'emailpassword'
      },
      data: {
        'name': userRequest.user!.name,
        'bbo_username': userRequest.user!.bboId
      }
    }).then(res => {
      if (res.status === 200) {
        mutate({ ...data, name: userRequest.user!.name, bboId: userRequest.user!.bboId })
        setUpdateSuccess(true)
        showNotification({
          autoClose: 5000,
          title: "Update profile success!",
          message: `Your profile has been updated successfully`,
          color: 'green',
          icon: <Check />
        })
      }
    }).catch(err => {
      setUpdateSuccess(true)
      showNotification({
        autoClose: 5000,
        title: "Error updating profile!",
        message: `Please try again`,
        color: 'red',
        icon: <X />
      })
      console.log(err)
    })
  }

  const avatar = data.avatar
    ? <Avatar radius="xl" size="xl">
        { hover &&
          <Overlay opacity={0.4} color="#000" blur={2} />
        }
        <Image src={data.avatar} radius="xl" width={84} height={84} />
      </Avatar>
    : <Avatar radius="xl" size="xl" color="cyan">
        { hover &&
          <Overlay opacity={0.6} color="#000" blur={2} />
        }
        {data.name.split(' ').map((word: string) => _.upperCase(word[0]))}
      </Avatar>

  // Once the user request finishes, show the user
  return (
    <EmailPasswordAuthNoSSR>
      <NotificationsProvider limit={5}>
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
          <h1>Your Profile!</h1>
          <TextInput mt={10} label="Your name" value={name} onChange={handleNameChange} error={nameError}/>
          <TextInput mt={10} label="Your email" placeholder={data.email} disabled />
          <TextInput mt={10} label="Your BBO username" value={bboId} onChange={handleBboIdChange} error={bboIdError} icon={<At size={14} />} />
          <Title mt={10} order={6}  style={{fontWeight: 500}}>Your avatar</Title>
          <Stack mt={10} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} align="center" justify="flex-start" spacing="xs" style={{width: 84, height: 84}}>
            { avatar }
            { hover &&
              <Popover
                width={150}
                position="bottom"
                styles={{
                  dropdown: {
                    padding: '0px'
                  }
                }}
                withArrow
                shadow="md"
              >
                <Popover.Target>
                  <Button
                    mt={-70}
                    color="white"
                    variant="outline"
                    leftIcon={<Edit size={14} />}
                    style={{
                      padding: '0px 10px',
                      zIndex: 999
                    }}
                    styles={(theme) => ({
                      root: {
                        borderColor: '#fff',
                        '&:hover': {
                          backgroundColor: theme.fn.lighten('#0006', 0.05),
                        },
                      },
                      leftIcon: {
                        marginRight: 10,
                      },
                      inner: {
                        color: '#fff'
                      }
                    })}>
                    Edit
                  </Button>
                </Popover.Target>
                <Popover.Dropdown>
                  <Stack spacing="xs">
                    <FileButton onChange={beforeUpload} accept="image/*">
                      {(props) => <Button variant="white" {...props}>Upload a photo...</Button>}
                    </FileButton>
                    {data.avatar && <Button mt={-10} color="red" onClick={toggleDeleteModal}>Delete photo...</Button>}
                  </Stack>
                </Popover.Dropdown>
              </Popover>
            }
          </Stack>
          <Button mt={25} color="green" onClick={handleUpdateProfile} loading={!updateSuccess}>
            Update profile
          </Button>
          <Modal
            opened={file !== null}
            onClose={() => { if (uploadSuccess) setFile(null) }}
            closeOnClickOutside={false}
            withCloseButton={uploadSuccess}
            overlayColor={theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2]}
            overlayOpacity={0.6}
            overlayBlur={3}
            size="sm"
            title="Set new profile picture"
          >
            <Badge
              variant="outline"
              size="lg"
              color="gray"
              radius="xs"
              sx={{ paddingRight: 3 }}
              leftSection={
                <Photo size={14} style={{marginTop: -2}} />}
              style={{textTransform: 'none'}}
            >
              <Text>{file?.name}</Text>
            </Badge>
            <Image mt={20} src={preview} withPlaceholder radius={'xl'} width={84} height={84}/>
            <Group mt={20}>
              <Button color="green" onClick={handleUpload} loading={!uploadSuccess}>Confirm</Button>
              {uploadSuccess && <Button color="red" onClick={cancelUpload}>Cancel</Button>}
            </Group>
          </Modal>
          <Modal
            opened={deleteModalVisible}
            onClose={() => { if (deleteSuccess) setDeleteModalVisible(false) }}
            closeOnClickOutside={false}
            withCloseButton={deleteSuccess}
            overlayColor={theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2]}
            overlayOpacity={0.6}
            overlayBlur={3}
            size="sm"
            title="Delete profile picture?"
          >
            <Image mt={20} src={data.avatar} withPlaceholder radius={'xl'} width={84} height={84}/>
            <Group mt={20}>
              <Button color="green" onClick={handleDeleteAvatar} loading={!deleteSuccess}>Confirm</Button>
              {deleteSuccess && <Button color="red" onClick={toggleDeleteModal}>Cancel</Button>}
            </Group>
          </Modal>
        </AppShell>
        </Layout>
      </NotificationsProvider>
    </EmailPasswordAuthNoSSR>
  )
}

export default Profile