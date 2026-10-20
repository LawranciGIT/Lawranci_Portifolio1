/**
 * Synthwave Portfolio Database & LocalStorage Engine
 * Handles persistent Profile, Games, and Books collections with ADM edit capabilities
 */

const STORAGE_KEY = 'synthwave_portfolio_master_v2';

const DEFAULT_PROFILE = {
  name: "Lorenzzo Austriquinio Accioly",
  nickname: "Lawranci",
  age: "20",
  nationality: "Brasil",
  role: "Lead Game Architect & Author",
  bio: "Forging worlds for entertainment.",
  avatar: "assets/avatar2.png",
  level: "20",
  hp: "100 / 100",
  mp: "96 / 100",
  score: "994,200",
  specialClass: "Magician",
  contact: {
    youtube: "https://youtube.com/@LawranciDasGameplays",
    discord: "https://discord.gg/synthwave-haven",
    whatsapp: "https://wa.me/5511920182534",
    email: "mailto:lorenzzo.accioly@hotmail.com"
  }
};

const DEFAULT_GAMES = [
  {
    id: "game-1",
    title: "Cyber Racer Ultimate: The Outrun Challenge",
    category: "official", // "official" | "fangame"
    categoryLabel: "Official Game",
    year: "1996 / Remastered 2024",
    platform: "PC / Steam / Mega Drive",
    rating: "5.0",
    tags: ["Arcade Racing", "Synthwave", "Outrun 90s"],
    cover: "assets/game_racer.jpg",
    description: "An adrenaline-fueled retro racing experience featuring turbocharged 90s supercars drifting down infinite neon wireframe highways. Experience responsive drifting physics, dynamic police pursuits, and a killer analog synthesizer soundtrack.",
    playUrl: "https://store.steampowered.com",
    badge: "16-BIT CLASSIC"
  },
  {
    id: "game-2",
    title: "Galactic Phantom: Neon Fury",
    category: "official",
    categoryLabel: "Official Game",
    year: "1998 / Remastered 2025",
    platform: "PC-98 / Steam / Switch",
    rating: "4.9",
    tags: ["Shmup", "Bullet Hell", "Space Action"],
    cover: "assets/game_space.jpg",
    description: "Vertical arcade shooter set in the neon asteroid belt of Saturn. Command the experimental FX-99 fighter ship against cosmic dreadnoughts, bullet cascades, and synth boss encounters with authentic FM synth audio.",
    playUrl: "https://store.steampowered.com",
    badge: "PC-98 EDITION"
  },
  {
    id: "game-3",
    title: "Cyber Ninja: Neon Shadows",
    category: "fangame",
    categoryLabel: "Fangame",
    year: "1995 / Fan Revival 2024",
    platform: "Sega Genesis / Mega Drive ROM",
    rating: "4.8",
    tags: ["16-Bit Action", "Hack & Slash", "Fangame"],
    cover: "assets/game_ninja.jpg",
    description: "A high-octane 16-bit tribute to retro side-scrolling ninja classics. Leap between illuminated cyber-skyscrapers, deflect laser projectiles with your hyper-frequency blade, and take down the Shinobi Syndicate.",
    playUrl: "https://itch.io",
    badge: "GENESIS TRIBUTE"
  },
  {
    id: "game-4",
    title: "Mega Synth: Zero Protocol",
    category: "fangame",
    categoryLabel: "Fangame",
    year: "1997 / Fan Edition",
    platform: "Retro Arcade / ROM",
    rating: "4.9",
    tags: ["Run & Gun", "Platformer", "Fan Tribute"],
    cover: "assets/game_megasynth.jpg",
    description: "A fan-created love letter to classic blue-bomber run-and-gun platformers, reimagined with outrun color palettes, responsive wall-jumps, dynamic weapon switching, and chiptune synth metal.",
    playUrl: "https://itch.io",
    badge: "ARCADE EDITION"
  }
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
    summary: "In the sprawling vertical megacity of New Kyoto, neural detective Jason Vance uncovers an illegal synthetic consciousness buried within the mainframe of Megacorp Industries. A thrilling noir novel of corporate espionage, cybernetic morality, and neon-lit street rebellion.",
    readUrl: "https://amazon.com",
    badge: "BESTSELLER"
  },
  {
    id: "book-2",
    title: "Synth Saga: Zero",
    category: "original",
    categoryLabel: "Original Book",
    author: "Alex 'CyberViper' Sterling",
    year: "1999",
    pages: "360 Pages",
    tags: ["Anime Sci-Fi", "Mecha", "Cyberpunk Saga"],
    cover: "assets/book_synthsaga.jpg",
    summary: "Volume 1 of the renowned Cybernetic Chronicles. Follow mercenary pilot Leo Akiyama as she navigates the holographic underbelly of Neo-Tokyo, armed with an experimental plasma katana and an enigmatic bio-chip that could reset humanity's future.",
    readUrl: "https://amazon.com",
    badge: "ORIGINAL SAGA"
  },
  {
    id: "book-3",
    title: "Neon Genesis Tribute // Fan Archive",
    category: "fanbook",
    categoryLabel: "Fanbook",
    author: "Alex Sterling & Community",
    year: "1999 / Collector Print",
    pages: "220 Pages (Full Color)",
    tags: ["Artbook", "Mecha Tribute", "Fan Lore"],
    cover: "assets/book_eva_tribute.jpg",
    summary: "An expansive, commemorative fan artbook and retrospective tribute celebrating 90s biomechanical mecha sagas. Features in-depth lore analyses, unreleased concept sketches, holographic battle scenes, and reflective author essays.",
    readUrl: "https://gumroad.com",
    badge: "FAN ARTBOOK"
  },
  {
    id: "book-4",
    title: "Chrono Drift: The 1999 Paradox",
    category: "fanbook",
    categoryLabel: "Fanbook",
    author: "Alex Sterling",
    year: "1998 / Fanfic Compendium",
    pages: "310 Pages",
    tags: ["Time Travel", "RPG Fanfic", "Retro Tribute"],
    cover: "assets/book_synthsaga.jpg",
    summary: "An unauthorized tribute novel expanding on classic time-hopping RPG universes. When a temporal ripple threatens to erase the golden era of 1999, a renegade team of net-runners and chronomancers jump across shattered neon timelines.",
    readUrl: "https://archiveofourown.org",
    badge: "FAN NOVEL"
  }
];

class DataStore {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.profile && parsed.games && parsed.books) {
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
