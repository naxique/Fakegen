import React, { useEffect, useRef, useState } from 'react';
import { Form, DropdownButton, Dropdown, Navbar, Container, Row, Col, Button } from 'react-bootstrap';
import TableComponent from './components/TableComponent';
import { User } from './components/interfaces/user';
import formStyles from './styles/form.module.css';
import { faker } from '@faker-js/faker';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';

enum regionEnum {
  us = "en_US",
  ru = "ru",
  de = "de"
}

function App() {
  const [regionTitle, setRegionTitle] = useState("US");
  const [mistakeRate, setMistakeRate] = useState(0.25);
  const [options, setOptions] = useState({ region: regionEnum.us, 
                                           mistake: mistakeRate*100, 
                                           seed: faker.seed()});
  const [userData, setUserData] = useState<User[]>([]);
  const scrollPage = useRef(1);

  const handleRegionSelect = (key: any) => {
    setOptions({...options, region: key});
    switch (key) {
      case regionEnum.us:
        setRegionTitle("US");
        break;
      case regionEnum.ru:
        setRegionTitle("Russia");
        break;
      case regionEnum.de:
        setRegionTitle("Germany");
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
    setOptions({...options, seed: faker.seed()});
  };

  const handleSeedChange = (e: any) => {
    if (isNaN(Number(e.target.value)) || e.target.value.length > 16) return;
    setOptions({...options, seed: e.target.value});
  };

  const generateUserData = (i?: number): User => {
    faker.setLocale(options.region);
    const seed = Number(options.seed) + (i || 0);
    faker.seed(seed);
    let phoneNumberFormat = "###-###-###";
    switch (options.region) {
      case regionEnum.us:
        phoneNumberFormat = "(###) ###-####";
        break;
      case regionEnum.ru:
        phoneNumberFormat = "+7 (###) ###-##-##";
        break;
      case regionEnum.de:
        phoneNumberFormat = "0### ## ## ###";
        break;
      default:
        break;
    };
    return({
      id: faker.datatype.uuid(),
      name: makeMistake(faker.name.fullName(), seed),
      address: makeMistake(faker.address.city()+", "+faker.address.streetAddress()+", "+faker.address.buildingNumber(), seed),
      phone: makeMistake(faker.phone.number(phoneNumberFormat), seed)
    });
  };

  const generateLocaleSymbol = (): string => {
    const latinDictionary = "QWERTYUIOP[]ASDFGHJKL;'ZXCVBM,./qwertyuio+pasdfghjkl-=zxcvbnm";
    const cyrillicDictionary = "ЙЦУКЕНГШЩЗХЪ/ФЫВАПРОЛДЖЭЯЧСМИТЬБЮ.йцукенгшщзхъ-=фывапролджэ+ячсмитьбю.";
    if (options.region === regionEnum.us || options.region === regionEnum.de) {
      let i = faker.datatype.number(latinDictionary.length);
      return latinDictionary.slice(i, i+1);
    } else {
      let i = faker.datatype.number(cyrillicDictionary.length);
      return cyrillicDictionary.slice(i, i+1);
    }
  };

  const mistake = (input: string, seed: number, iterate: number = 1): string => {
    let output = input;
    for (let i = 0; i < iterate; i++) {
      faker.seed(seed+i);
      const mistakeType = faker.datatype.number({ min: 1, max: 300 });
      if (mistakeType < 100) {
        // Replace symbol
        faker.seed(seed + mistakeType * i);
        const index = faker.datatype.number({ min: 0, max: output.length });
        let buffer = output.substring(index).substring(1);
        output = output.substring(0, index).concat(generateLocaleSymbol()).concat(buffer);
      } else if (mistakeType > 100 && mistakeType < 200) {
        // Remove symbol 
        faker.seed(seed + mistakeType * i);
        const index = faker.datatype.number({ min: 0, max: output.length });
        let buffer = output.substring(index).substring(1);
        output = output.substring(0, index).concat(buffer);
      } else if (mistakeType > 200) {
        // Add symbol
        faker.seed(seed + mistakeType * i);
        const index = faker.datatype.number({ min: 0, max: output.length });
        let buffer = output.substring(index)
        output = output.substring(0, index).concat(generateLocaleSymbol()).concat(buffer);
      }
    }
    return output;
  };

  const makeMistake = (input: string, seed: number): string => {
    const mistakeChance = faker.datatype.number({ min: 1, max: 1000 });
    if (mistakeChance < 100 && mistakeChance < options.mistake) {
      return mistake(input, seed);
    } else if (mistakeChance > 100 && mistakeChance < options.mistake) {
      return mistake(input, seed, Math.floor(mistakeChance/100));
    }
    return input;
  };

  const generateUsers = (amount: number, refresh?: boolean, page?: number) => {
    let buffer: React.SetStateAction<User[]> = [];
    if (refresh) {
      setUserData([]);
    } else if (refresh === false || !refresh) {
      buffer = userData;
    }
    for (let i = 0; i < amount; i++) {
      buffer.push(generateUserData(page ? i + page*10 : i));
    }
    setUserData([...buffer]);
  }

  useBottomScrollListener(() => {
    scrollPage.current++;
    generateUsers(10, false, scrollPage.current);
  }, { offset: 20 });

  useEffect(() => {
    scrollPage.current = 1;
    generateUsers(20, true);
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
                <Dropdown.Item eventKey={regionEnum.de}>Germany</Dropdown.Item>
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
          <Col xs="3">
            <Form.Group controlId="seed" className="justify-items-center">
              <Form.Label>Seed:</Form.Label>
              <Form.Control name="seed" placeholder="16-digit number" value={options.seed} onChange={handleSeedChange}/>
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
