/**
 * Synthwave Portfolio Database & LocalStorage Engine
 * Handles persistent Profile, Games, and Books collections with ADM edit capabilities
 */

const STORAGE_KEY = 'lorenzzo-portfolio';

const DEFAULT_PROFILE = {
  name: "Lorenzzo Austriquinio Accioly",
  nickname: "Lawranci",
  age: "20",
  nationality: "Brasil",
  role: "Lead Game Architect & Author",
  bio: "Forging worlds for entertainment.",
  avatar: "assets/avatar.png",
  level: "20",
  hp: "100 / 100",
  mp: "96 / 100",
  score: "994,200",
  specialClass: "Magician",
  contact: {
    youtube: "https://youtube.com/@LawranciDasGameplays",
    discord: "https://discord.gg/lord_phantomius_x",
    whatsapp: "https://wa.me/5511920182534",
    email: "mailto:lorenzzo.accioly@hotmail.com"
  }
};

const DEFAULT_GAMES = [
  {
    id: "game-1",
    title: "Onslaught",
    category: "official", // "official" | "fangame"
    categoryLabel: "Official Game",
    year: "2026",
    platform: "PC",
    rating: "5.0",
    tags: ["High-Mobility Combat & Tactical Evasion, 6-Tier Weapon Arsenal Progression, Hostile Machine Roster, Authentic PSX Retro Aesthetic Pipeline"],
    cover: "assets/GAMECOVER_ONSLAUGHT.png",
    description: "An adrenaline-fueled, high-octane retro arena shooter that thrusts you into an enclosed holographic simulation arena surrounded by rogue automated war machines. Armed initially with nothing but an energized cybernetic blade, you must outmaneuver flanking hunter units, aerial strike drones, and heavy artillery mechs to survive across 15 escalating waves of tactical combat.",
    playUrl: "https://store.steampowered.com",
    badge: "16-BIT CLASSIC"
  },
];

const DEFAULT_BOOKS = [
  {
    id: "book-1",
    title: "Nada de belo em Cassiopéia",
    category: "original", // "original" | "fanbook"
    categoryLabel: "Original Book",
    author: "Lorenzzo A. Accioly",
    year: "2026",
    pages: "480 Pages",
    tags: ["Cyberpunk", "Dystopian Sci-Fi", "Noir Mystery"],
    cover: "assets/book_cassiopeia.png",
    summary: "Faustin nasceu no Império do Solstício. Rosalinda fugiu da Federação de Cassiopéia. Na República de Auriga, os dois construíram uma vida simples numa casa azul, entre oficina, sala de aula e caminhadas ao longo do rio. Então chegam as cartas de convocação, uma para cada lado da guerra. Restam onze dias. Quando Auriga se torna o campo de batalha da Grande Guerra, o amor dos dois passa a ser a única coisa que o conflito não sabe calcular. Mas alguém está observando, e quer entender por quê.",
    readUrl: "https://amazon.com",
    badge: "BESTSELLER"
  }
];

class DataStore {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedSig = localStorage.getItem(STORAGE_KEY + '_profile_sig');
      const currentSig = JSON.stringify(DEFAULT_PROFILE);

      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.profile && parsed.games && parsed.books) {
          // Automatically sync any manual code edits in DEFAULT_PROFILE
          if (storedSig !== currentSig) {
            parsed.profile = { ...parsed.profile, ...DEFAULT_PROFILE };
            try {
              localStorage.setItem(STORAGE_KEY + '_profile_sig', currentSig);
            } catch (e) { }
            this.saveData(parsed);
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load from localStorage, falling back to defaults.", e);
    }
    const initial = {
      profile: { ...DEFAULT_PROFILE },
      games: [...DEFAULT_GAMES],
      books: [...DEFAULT_BOOKS]
    };
    try {
      localStorage.setItem(STORAGE_KEY + '_profile_sig', JSON.stringify(DEFAULT_PROFILE));
    } catch (e) { }
    this.saveData(initial);
    return initial;
  }

  saveData(data) {
    this.data = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error("LocalStorage save failed (quota exceeded or disabled):", e);
    }
  }

  getProfile() {
    return this.data.profile;
  }

  updateProfile(newProfile) {
    this.data.profile = { ...this.data.profile, ...newProfile };
    this.saveData(this.data);
    return this.data.profile;
  }

  getGames() {
    return this.data.games;
  }

  getGameById(id) {
    return this.data.games.find(g => g.id === id);
  }

  saveGame(gameData) {
    if (!gameData.id) {
      gameData.id = 'game-' + Date.now();
      this.data.games.unshift(gameData);
    } else {
      const index = this.data.games.findIndex(g => g.id === gameData.id);
      if (index !== -1) {
        this.data.games[index] = { ...this.data.games[index], ...gameData };
      } else {
        this.data.games.unshift(gameData);
      }
    }
    this.saveData(this.data);
    return gameData;
  }

  deleteGame(id) {
    this.data.games = this.data.games.filter(g => g.id !== id);
    this.saveData(this.data);
    return true;
  }

  getBooks() {
    return this.data.books;
  }

  getBookById(id) {
    return this.data.books.find(b => b.id === id);
  }

  saveBook(bookData) {
    if (!bookData.id) {
      bookData.id = 'book-' + Date.now();
      this.data.books.unshift(bookData);
    } else {
      const index = this.data.books.findIndex(b => b.id === bookData.id);
      if (index !== -1) {
        this.data.books[index] = { ...this.data.books[index], ...bookData };
      } else {
        this.data.books.unshift(bookData);
      }
    }
    this.saveData(this.data);
    return bookData;
  }

  deleteBook(id) {
    this.data.books = this.data.books.filter(b => b.id !== id);
    this.saveData(this.data);
    return true;
  }

  resetToDefaults() {
    const initial = {
      profile: JSON.parse(JSON.stringify(DEFAULT_PROFILE)),
      games: JSON.parse(JSON.stringify(DEFAULT_GAMES)),
      books: JSON.parse(JSON.stringify(DEFAULT_BOOKS))
    };
    this.saveData(initial);
    return initial;
  }

  exportJson() {
    return JSON.stringify(this.data, null, 2);
  }

  importJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile && Array.isArray(parsed.games) && Array.isArray(parsed.books)) {
        this.saveData(parsed);
        return true;
      }
    } catch (e) {
      console.error("Invalid JSON import", e);
    }
    return false;
  }
}

window.dataStore = new DataStore();
