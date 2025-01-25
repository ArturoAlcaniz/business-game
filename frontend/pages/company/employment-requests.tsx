import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function EmploymentRequests() {
  const [requests, setRequests] = useState([]);
  const router = useRouter();
  const { companyId } = router.query;

  interface EmploymentRequest {
    id: number;
    username: string;
    studyLevel: number;
    salary: number;
  }

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/company/employment-requests/${companyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        alert('Error al obtener las solicitudes');
      }
    };

    if (companyId) fetchRequests();
  }, [companyId]);

  const handleAccept = async (requestId: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `http://localhost:3001/company/accept-employment-request/${requestId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.ok) {
      alert('Solicitud aceptada');
      router.reload();
    } else {
      alert('Error al aceptar la solicitud');
    }
  };

  const handleReject = async (requestId: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `http://localhost:3001/company/reject-employment-request/${requestId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.ok) {
      alert('Solicitud rechazada');
      router.reload();
    } else {
      alert('Error al rechazar la solicitud');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '20px' }}>Solicitudes de Empleo</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {requests.map((request: EmploymentRequest) => (
          <li
            key={request.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f9f9f9',
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>{request.username}</h3>
              <p style={{ margin: '5px 0', color: '#555' }}>
                Nivel de estudios: {request.studyLevel}
              </p>
              <p style={{ margin: '5px 0', color: '#555' }}>Salario: ${request.salary}</p>
            </div>
            <div>
              <button
                onClick={() => handleAccept(request.id)}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px',
                }}
              >
                Aceptar
              </button>
              <button
                onClick={() => handleReject(request.id)}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Rechazar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}