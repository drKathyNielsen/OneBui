import './App.css'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import 'bootstrap/dist/css/bootstrap.min.css';

import TopNavBar from './components/TopNavBar';
import CitySideBar from './components/CitySideBar';
import Content from './components/Content';
import Footer from './components/Footer';

function App() {

  return (
    <>
      <TopNavBar />
      <Container fluid>
        <Row>
          <Col lg={2} md={3} sm={5} xs={12} className="border-end">
            <CitySideBar />
          </Col>
          <Col lg={10} md={9} sm={7} xs={12}>
            <Content />
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  )
}

export default App


