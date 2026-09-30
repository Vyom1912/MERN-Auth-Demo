import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    console.log(res.data);
    navigate("/profile");
  };

  return (
    <>
      <h1>Login</h1>

      <input placeholder='Email' onChange={(e) => setEmail(e.target.value)} />

      <input
        type='password'
        placeholder='Password'
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login}>Login</button>
    </>
  );
}
