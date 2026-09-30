import { useEffect, useState } from "react";

import api from "../api/axios";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const loadSessions = async () => {
      const res = await api.get("/auth/sessions");

      setSessions(res.data.sessions);
    };

    loadSessions();
  }, []);

  return (
    <>
      <h1>Sessions</h1>

      {sessions.map((session) => (
        <div key={session._id}>
          <p>{session.userAgent}</p>
        </div>
      ))}
    </>
  );
}
