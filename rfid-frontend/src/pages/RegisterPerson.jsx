import { useState } from "react";
import api from "../services/api";

function RegisterPerson() {

  const [userName, setUserName] = useState("");
  const [age, setAge] = useState("");

  const registerUser = async () => {

    try {

      const response = await api.post("/register/start", {
        userName,
        age: parseInt(age),
        timeout: 30
      });

      alert(response.data.message);

      console.log(response.data);

    } catch (error) {

      console.error(error);

      alert("Could not connect to backend");
    }
  };

  return (
    <div className="page">

      <h1>Register Person</h1>

      <div className="form-container">

        <input
          type="text"
          placeholder="Username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <button onClick={registerUser}>
          Start Registration
        </button>

      </div>

    </div>
  );
}

export default RegisterPerson;