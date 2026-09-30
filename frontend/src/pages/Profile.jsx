import { useEffect, useState } from "react";

import api from "../api/axios";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await api.get("/user/profile");

      setUser(res.data.user);
    };

    fetchProfile();
  }, []);

  return (
    <>
      <h1>Profile</h1>

      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
}
