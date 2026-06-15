import { useEffect, useState } from "react";
import api from "../services/api";

function RegisteredPeople() {

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {

    try {

      const response = await api.get("/cards");

      console.log(response.data);

      setCards(response.data.cards);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="page">

      <h1>Registered People</h1>

      <table className="table">

        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Age</th>
          </tr>
        </thead>

        <tbody>

          {cards.map((card, index) => (
            <tr key={index}>
              <td>{card.id}</td>
              <td>{card.userName}</td>
              <td>{card.age}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default RegisteredPeople;