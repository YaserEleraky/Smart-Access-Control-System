import { registeredPeople } from "../data/mockData";

function Dashboard() {
  return (
    <div className="page">

      <h1>RFID Dashboard</h1>

      <div className="cards">

        <div className="card">
          <h3>Total Cards</h3>
          <p>{registeredPeople.length}</p>
        </div>

        <div className="card">
          <h3>Backend Status</h3>
          <p>🟢 Online</p>
        </div>

        <div className="card">
          <h3>ESP32 Status</h3>
          <p>🟡 Waiting</p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;