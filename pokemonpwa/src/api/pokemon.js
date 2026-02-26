import axios from "axios";

const URL = `https://pokeapi.co/api/v2/pokemon?limit=151`;

export const getAllPokemonList = async () => {
  try {
    const { data } = await axios.get(URL);
    return data;
  } catch (error) {
    console.error("Error fetching Pokemon:", error);
    return { results: [] }; // Return empty array to prevent map errors
  }
};