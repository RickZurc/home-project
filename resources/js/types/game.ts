// Player stats and game state types

export type PlayerStatus = 'okay' | 'hospital' | 'jail' | 'traveling';

export type Player = {
    id: number;
    name: string;
    level: number;
    experience: number;
    experienceForNextLevel: number;
    experienceProgress: number;

    // Bars
    health: number;
    maxHealth: number;
    energy: number;
    maxEnergy: number;
    nerve: number;
    maxNerve: number;
    happiness: number;
    maxHappiness: number;

    // Combat stats
    strength: number;
    speed: number;
    defense: number;
    dexterity: number;
    battleStats: number;

    // Economy
    wallet: number;
    bank: number;
    points: number;

    // Status
    status: PlayerStatus;
    statusUntil: string | null;
    isAvailable: boolean;

    // Statistics
    attacksWon: number;
    attacksLost: number;
    defendsWon: number;
    defendsLost: number;
    crimesCommitted: number;

    // Faction
    faction: FactionBasic | null;
    factionRole: string | null;
};

export type PlayerBasic = {
    id: number;
    name: string;
    level: number;
    status?: PlayerStatus;
    faction?: FactionBasic | null;
};

export type FactionBasic = {
    id: number;
    name: string;
    tag: string;
};

export type Faction = FactionBasic & {
    description: string | null;
    level: number;
    respect: number;
    treasury: number;
    maxMembers: number;
    territoriesControlled: number;
    atWar: boolean;
    warTarget: FactionBasic | null;
    leader: PlayerBasic;
    members: PlayerBasic[];
    membersCount: number;
};

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'weapon' | 'armor' | 'consumable' | 'booster' | 'special';

export type Item = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: ItemType;
    subtype: string | null;
    damage: number;
    accuracy: number;
    armor: number;
    effects: Record<string, unknown> | null;
    basePrice: number;
    marketPrice: number;
    levelRequired: number;
    tradeable: boolean;
    consumable: boolean;
    rarity: ItemRarity;
};

export type InventoryItem = {
    id: number;
    userId: number;
    itemId: number;
    quantity: number;
    equipped: boolean;
    usesRemaining: number | null;
    item: Item;
};

export type Crime = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    nerveCost: number;
    levelRequired: number;
    successRate: number;
    moneyRange: [number, number];
    expRange: [number, number];
    canAttempt: boolean;
    isLocked?: boolean;
    levelsUntilUnlock?: number;
};

export type CrimeResult = {
    success: boolean;
    crimeSuccess: boolean;
    roll: number;
    successRate: number;
    rewards: {
        money: number;
        experience: number;
        item: string | null;
    } | null;
    penalty: {
        jailTime: number;
        hospitalTime: number;
    } | null;
    message: string;
};

export type CombatTurn = {
    turn: number;
    phase: 'attack' | 'counter' | 'escape';
    attacker?: string;
    defender?: string;
    damage: number;
    critical: boolean;
    dodged: boolean;
    escaped?: boolean;
    remainingHealth: number;
    attackerHp?: number;
    defenderHp?: number;
    type?: 'normal' | 'critical' | 'miss';
    message?: string;
};

export type CombatResult = {
    success: boolean;
    result: 'win' | 'lose' | 'stalemate' | 'escape';
    winner: 'attacker' | 'defender' | null;
    summary: {
        turns: number;
        attackerDamage: number;
        defenderDamage: number;
        moneyStolen: number;
        experienceGained: number;
        respectGained: number;
        attackerHospitalTime: number;
        defenderHospitalTime: number;
    };
    log: CombatTurn[];
};

export type CombatLog = {
    id: number;
    attackerId: number;
    defenderId: number;
    winnerId: number | null;
    result: 'win' | 'lose' | 'stalemate' | 'escape';
    attackerDamageDealt: number;
    defenderDamageDealt: number;
    turns: number;
    moneyStolen: number;
    respectGained: number;
    experienceGained: number;
    log: CombatTurn[];
    createdAt: string;
    attacker: PlayerBasic;
    defender: PlayerBasic;
};

export type MarketListing = {
    id: number;
    sellerId: number;
    itemId: number;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
    status: 'active' | 'sold' | 'cancelled' | 'expired';
    expiresAt: string | null;
    item: Item;
    seller: PlayerBasic;
};

export type Transaction = {
    id: number;
    userId: number;
    type: string;
    currency: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string | null;
    createdAt: string;
};

export type GymActivity = {
    id: number;
    statTrained?: 'strength' | 'speed' | 'defense' | 'dexterity';
    stat_trained?: 'strength' | 'speed' | 'defense' | 'dexterity';
    energySpent?: number;
    energy_spent?: number;
    statGained?: number;
    stat_gained?: number;
    statBefore?: number;
    stat_before?: number;
    statAfter?: number;
    stat_after?: number;
    createdAt?: string;
    created_at?: string;
};

export type CrimeLog = {
    id: number;
    success: boolean;
    nerveSpent?: number;
    nerve_spent?: number;
    moneyGained?: number;
    money_gained?: number;
    experienceGained?: number;
    experience_gained?: number;
    jailTime?: number;
    jail_time?: number;
    hospitalTime?: number;
    hospital_time?: number;
    message?: string;
    createdAt?: string;
    created_at?: string;
    crime?: {
        id: number;
        name: string;
    };
};
