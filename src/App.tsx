import './App.css'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {


  return (
    <>
      <Container fluid >
          <Row lg={6} md={6} sm={6} xs={12}>
            <Col  >
              1 of 2 ab
            </Col>
            <Col  >
              2 of 2
            </Col>
          </Row>
      </Container>

    </>
  )
}

export default App


