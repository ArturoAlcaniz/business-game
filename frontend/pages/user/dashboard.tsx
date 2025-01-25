import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();

  const handleAddDailyMoney = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3100/user/add-daily-money', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      alert('Dinero diario añadido');
    } else {
      alert('Error al añadir dinero');
    }
  };

  const handleUpdateStudyLevel = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3100/user/update-study-level', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      alert('Nivel de estudios actualizado');
    } else {
      alert('Error al actualizar el nivel de estudios');
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleAddDailyMoney}>Obtener dinero diario</button>
      <button onClick={handleUpdateStudyLevel}>Actualizar nivel de estudios</button>
    </div>
  );
}