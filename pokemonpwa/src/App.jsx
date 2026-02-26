import React, { useEffect, useState } from 'react';
import { getAllPokemonList } from './api/pokemon';

const App = () => {
  const [pokemonData, setPokemonData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getAllPokemonList();
      setPokemonData(data?.results || []);
    }
    fetchData();
  }, []);

  return (
    <div
      style={{
        marginTop: '40px',
        justifyContent: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        width: '90%',
        margin: 'auto',
      }}
    >
      {pokemonData.map((poke, i) => (
        <div
          key={`${poke.name}-${i}`}
          style={{
            width: '320px',
            height: '380px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            margin: '15px',
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ padding: '10px' }}>
            <p style={{ fontWeight: 'bold', textTransform: 'capitalize', fontSize: '1.2rem' }}>
              {poke.name}
            </p>
          </div>
          <img
            style={{ height: '250px', width: '250px', objectFit: 'contain' }}
            alt={poke.name}
            src={`https://img.pokemondb.net/artwork/large/${poke.name}.jpg`}
          />
        </div>
      ))}
    </div>
  );
};

export default App;