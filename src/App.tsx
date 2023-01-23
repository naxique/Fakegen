import React, { useEffect, useState } from 'react';
import { Form, DropdownButton, Dropdown, Navbar, Container, Row, Col, Button } from 'react-bootstrap';
import TableComponent from './components/TableComponent';
import { User } from './components/interfaces/user'
import formStyles from './styles/form.module.css'
import { faker } from '@faker-js/faker'

enum regionEnum {
  us = "en_US",
  ru = "ru",
  ja = "ja"
}

function App() {
  const [regionTitle, setRegionTitle] = useState("US");
  const [mistakeRate, setMistakeRate] = useState(0.25);
  const [options, setOptions] = useState({ region: regionEnum.us, 
                                           mistake: mistakeRate*100, 
                                           seed: faker.datatype.string()});
  const [userData, setUserData] = useState<User[]>([]);

  const handleRegionSelect = (key: any) => {
    setOptions({...options, region: key});
    switch (key) {
      case regionEnum.us:
        setRegionTitle("US");
        break;
      case regionEnum.ru:
        setRegionTitle("Russia");
        break;
      case regionEnum.ja:
        setRegionTitle("Japan");
        break;
      default:
        setRegionTitle("US");
        break;
    }
  };

  const handleMistakeRateChange = (e: any)  => {
    setMistakeRate(e.target.value);
    setOptions({...options, mistake: e.target.value*100});
  };

  const handleCustomMistakeRateChange = (e: any) => {
    if (e.target.value > 1000) return;
    setMistakeRate(e.target.value/100);
    setOptions({...options, mistake: e.target.value});
  }

  const generateRandomSeed = () => {
    setOptions({...options, seed: faker.datatype.string()});
  };

  const handleSeedChange = (e: any) => {
    setOptions({...options, seed: e.target.value});
  };

  const generateUserData = (): User => {
    faker.setLocale(options.region);  
    faker.seed(Number(options.seed));
    let phoneNumberFormat = "###-###-###";
    switch (options.region) {
      case regionEnum.us:
        phoneNumberFormat = "(###) ###-####";
        break;
      case regionEnum.ru:
        phoneNumberFormat = "+7 (###) ###-##-##";
        break;
      case regionEnum.ja:
        phoneNumberFormat = "(0#) ####-####";
        break;
      default:
        break;
    };
    return({
      id: faker.datatype.uuid(),
      name: faker.name.fullName(),
      address: faker.address.city()+", "+faker.address.streetAddress()+", "+faker.address.buildingNumber(),
      phone: faker.phone.number(phoneNumberFormat)
    });
    // TODO: mistakes
  };

  const generateUsers = (count: number) => {
    setUserData([]);
    let buffer = [];
    for (let i = 0; i < count; i++) {
      buffer.push(generateUserData());
    }
    setUserData(buffer);
  }
  
  useEffect(() => {
    generateUsers(20);
  }, [options]);

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>Random User Generator</Navbar.Brand>
        </Container>
      </Navbar>
      <Form className={formStyles.form}>
        <Row className="align-items-center justify-content-center">
          <Col xs="2">
            <Form.Group controlId="region">
              <Form.Label>Region:</Form.Label>
              <DropdownButton title={regionTitle} id="dropdown-basic-button" onSelect={handleRegionSelect}>
                <Dropdown.Item eventKey={regionEnum.us}>US</Dropdown.Item>        
                <Dropdown.Item eventKey={regionEnum.ru}>Russia</Dropdown.Item>
                <Dropdown.Item eventKey={regionEnum.ja}>Japan</Dropdown.Item>
              </DropdownButton>
            </Form.Group>
          </Col>
          <Col xs="3">
            <Form.Group controlId="mistake">
              <Form.Label>Mistake rate: {mistakeRate} </Form.Label>
              <Form.Range defaultValue={mistakeRate} min='0' max='10' step='0.25'
                          onChange={handleMistakeRateChange}/>
              <Form.Control name="mistakeInput" value={options.mistake} onChange={handleCustomMistakeRateChange}/>
            </Form.Group>
          </Col>
          <Col xs="2">
            <Form.Group controlId="seed" className="justify-items-center">
              <Form.Label>Seed:</Form.Label>
              <Form.Control name="seed" value={options.seed} onChange={handleSeedChange}/>
              <Button className={formStyles.seedButton} onClick={() => generateRandomSeed()}>Random seed</Button>
            </Form.Group>
          </Col>
        </Row>
      </Form>

      <TableComponent users={userData} />
    </div>
  );
}

export default App;
