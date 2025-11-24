
import { Territory, TerritoryStatus } from './types';

export const INITIAL_TERRITORIES: Territory[] = Array.from({ length: 25 }, (_, i) => {
  const id = i + 1;
  // Mock some data to look like the screenshots
  const isOccupied = [1, 3, 4, 12].includes(id);
  const hasObservations = [2, 5, 12].includes(id); // Some territories have notes
  
  return {
    id,
    name: `${id}`,
    status: isOccupied ? TerritoryStatus.Occupied : TerritoryStatus.Available,
    publisherName: isOccupied ? ["João Silva", "Maria Souza", "Pedro Costa", "Ana Lima"][i % 4] : undefined,
    lastWorked: isOccupied ? "25/07/2024" : "20/06/2024",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsRoyV-6L8kxFoEsrUSmx3Au_MN5xTTTFP8KSk0b3fWX9Mjw2rNUqWSMPyeHFuJyAwWit1vxR0HfTJxFs5UCgxe0nJh-KV9bLBRRo2bNMM4faR2XdOGH2-Y8J_Ppt2YadBNh9Dgq03XqUUhfM5K1HwCLBeXLY1-PMWxDuXYK2v5P5JhHHG4A2mJ25XorXwWoMHTYn4PMEjrklr2D3gXOrEOfd1g_c5myqV-IM0FGZ1SxqvShlnqvaLFb4vkP3k9IrZZlpg0qZU-ZI",
    googleMapsLink: "https://www.google.com/maps",
    observations: hasObservations ? "Cuidado com o cachorro na casa nº 3. Morador trabalha à noite, evitar bater cedo." : ""
  };
});
