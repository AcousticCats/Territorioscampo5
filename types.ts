
export enum TerritoryStatus {
  Available = "Available",
  Occupied = "Occupied",
  Returned = "Returned" // Used for history logs mainly
}

export interface Territory {
  id: number;
  name: string; // e.g., "1", "25"
  status: TerritoryStatus;
  publisherName?: string; // Stores the name directly for history
  publisherId?: string;   // Links to the User ID
  lastWorked?: string;
  imageUrl: string;
  googleMapsLink?: string;
  observations: string;
  drawingData?: string; // Base64 string of the canvas drawing
}

export interface HistoryLog {
  id: string;
  territoryName: string;
  publisherName: string;
  action: 'Saiu' | 'Devolvido';
  date: string; // DD/MM/YYYY
  timestamp: number;
}

export interface Congregation {
  id: string;
  name: string;
  territoryCount: number;
  adminId: string; // ID do usuário mestre
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'publisher';
  joinedAt: string;
}

export type NavigationTab = 'territories' | 'map' | 'reports' | 'settings';
