import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';

import './TopNavBar.css';

function TopNavBar() {
  return (
    <Navbar expand="lg" className="border-bottom top-nav-bar">
      <Container fluid>
        <Navbar.Brand style={{ fontFamily: 'cursive' }}>One B</Navbar.Brand>
        <Navbar.Toggle aria-controls="top-nav-menus" />
        <Navbar.Collapse id="top-nav-menus" className="justify-content-end">
          <Nav>
            <NavDropdown title="Add cities" id="add-cities-menu">
              <NavDropdown.Item disabled>Coming soon</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Account" id="account-menu">
              <NavDropdown.Item disabled>Coming soon</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default TopNavBar
