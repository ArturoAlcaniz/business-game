import { useState } from 'react';
import { useRouter } from 'next/router';

export default function RequestEmployment() {
  const [companyId, setCompanyId] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3100/company/request-employment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId: parseInt(companyId) }),
      });

      if (response.ok) {
        alert('Solicitud enviada');
        router.push('/');
      } else {
        const data = await response.json();
        setError(data.message || 'Error al enviar la solicitud');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '20px' }}>Solicitar Empleo</h1>
      {error && (
        <div
          style={{
            color: 'red',
            backgroundColor: '#ffe6e6',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            ID de la empresa:
          </label>
          <input
            type="number"
            placeholder="ID de la empresa"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Solicitar empleo
        </button>
      </form>
    </div>
  );
}