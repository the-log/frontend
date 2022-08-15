/**
 * Constructor type. Used for defining mix-ins.
 */
export type Constructor<T> = new (...args: any[]) => T;

/**
 * Custom events
 */

export const EVENTS = {
  doUpdateLoginStatus: 'doUpdateLoginStatus', // requests re-query of login status
  didUpdateLoginStatus: 'didUpdateLoginStatus', // announces login status has changed
}

/**
 * Player list from keystone
 */
export interface Player {
  espn_id: number
  name: String
  team: String
  position: Position
  positionWeight: number
  isIrEligible: Boolean
  injuryStatus: String
  positionRank: number
  overallRank: number
  seasonOutlook: String
  outlooksByWeek: JSON
  isRookie: Boolean
  fullStats: JSON
  pointsLastYear: number
  pointsThisYear: number
  pointsThisYearProj: number
  pointsThisWeekProj: number
  contract: Contract
}

export type Position = "QB" | "RB" | "WR" | "TE" | "K" | "LB" | "DE" | "DT" | "S" | "CB";

/**
 * Contract list from keystone
 */
export interface Contract {
  node_id: number
  salary: number
  years: number
  status: String
  team: Team
  player: Player
  needsAttention: Boolean
  isFranchiseTagged: Boolean
}

/**
 * Team list from keystone
 */
export interface Team {
  espn_id:number
  name: String
  logo: String
  abbreviation: String
  projectedRank:number
  playoffSeed:number
  wins:number
  losses:number
  ties:number
  pointsFor:number
  pointsAgainst:number
  percentage:number
  gamesBack:number
  streakLength:number
  streakType: String
  contractTotals: {
    salary: number
    years: number
    active: number
    dts: number
    ir: number
    waived: number
  }
  owner: User
  contracts: Contract[]
  contractsCount:number
}

/**
 * User list from keystone
 */
export interface User {
  name: String
  email: String
  password: String
  team: Team
  roles: String
}

/**
 * Bid list from keystone
 */
export interface Bid {
  team: Team
  player: Player
  salary:number
  years:number
  is_dts: Boolean
}

/**
 * AuthenticatedUser schema from keystone
 */
export interface AuthenticatedUser extends User {
}

