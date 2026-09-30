import { useState } from "react";
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const submit = async () => {
    console.log("btn clicked");
    const res = await api.post("/auth/register", form);

    console.log(res.data);
    navigate("/profile");
  };

  return (
    <>
      <h1>Register</h1>

      <input
        placeholder='Name'
        onChange={(e) =>
          setForm({
            ...form,
            name: e.target.value,
          })
        }
      />

      <input
        placeholder='Email'
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value,
          })
        }
      />

      <input
        type='password'
        placeholder='Password'
        onChange={(e) =>
          setForm({
            ...form,
            password: e.target.value,
          })
        }
      />

      <button onClick={submit}>Register</button>
    </>
  );
}
