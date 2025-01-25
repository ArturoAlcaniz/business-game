import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateCompany() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3100/company/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (response.ok) {
      router.push('/');
    } else {
      alert('Error al crear la empresa');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre de la empresa"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Crear empresa</button>
    </form>
  );
}