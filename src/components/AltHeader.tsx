import { Nav, Navbar, Container } from 'react-bootstrap';
import headerImg from '../public/img/header-black-removebg-preview.png';
import Image from 'next/image'
import Link from 'next/link'

export default function AltHeader(props: any) {
  return (
    <header>
        <NavigationBar/>
    </header>
  );
}

function NavigationBar() {

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
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </div>
  );
}