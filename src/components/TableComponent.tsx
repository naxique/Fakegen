import { Table } from "react-bootstrap";
import styles from "../styles/table.module.css"
import { User } from "./interfaces/user";

interface TableProps {
  users: User[]
}

const TableComponent = ({ users }: TableProps) => {
  // TODO: infinite scrolling
  return (
    <>
      <Table className={ styles.tableStyle } striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>Name</th>
            <th>Address</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => {
            return (
              <tr key={ i }>
                <td>{ i+1 }</td>
                <td>{ user.id }</td>
                <td>{ user.name }</td>
                <td>{ user.address }</td>
                <td>{ user.phone }</td>
              </tr>
            );
          })}
          <tr key="">
          </tr>
        </tbody>
      </Table>
    </>
  );
}

export default TableComponent;