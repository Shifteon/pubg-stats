import { 
  BEN_LINE_NAME, 
  BEN_LOWERCASE, 
  BEN_STROKE_COLOR, 
  CODY_LINE_NAME, 
  CODY_LOWERCASE, 
  CODY_STROKE_COLOR, 
  DEFAULT_STROKE_COLOR, 
  ISAAC_LINE_NAME, 
  ISAAC_LOWERCASE, 
  ISAAC_STROKE_COLOR, 
  TEAM_LINE_NAME, 
  TEAM_LOWERCASE, 
  TEAM_STROKE_COLOR, 
  TRENTON_LINE_NAME, 
  TRENTON_LOWERCASE,
  TRENTON_STROKE_COLOR
} from "@/constants";

export interface StatData {
  value: string;
  color: string;
  key: string;
  displayName: string;
  gameIndex: number;
};


export interface Stat {
  data: StatData[];
  displayName: string;
}

export abstract class StatBase {
  protected statData: Stat;
  protected team: string;
  protected statName: string;
  protected chartType: string;


  constructor(team: string, statName: string, displayName: string, chartType: string) {
    this.team = team;
    this.statName = statName;
    this.statData = {
      data: [],
      displayName,
    };
    this.chartType = chartType;
  }
  
  public async getData(): Promise<Stat> {
    if (this.statData.data.length === 0) {
      await this.fetchData();
    }
    return this.statData;
  }

  protected async fetchData() {
    try {
      const results = await fetch(`/api/stats?team=${this.team}&stat=${this.statName}`);
      if (!results.ok) {
        return null;
      }

      const json = await results.json();
      this.prepareData(json.frontendStatArray);
      return this.statData;
  } catch (error) {
      console.log(error);
      return null;
    }
  }

  protected getStrokeColor(key: string) {
    const lowercaseKey = key.toLowerCase();
    if (lowercaseKey.includes(ISAAC_LOWERCASE)) {
      return ISAAC_STROKE_COLOR;
    }
    if (lowercaseKey.includes(CODY_LOWERCASE)) {
      return CODY_STROKE_COLOR;
    }
    if (lowercaseKey.includes(BEN_LOWERCASE)) {
      return BEN_STROKE_COLOR;
    }
    if (lowercaseKey.includes(TRENTON_LOWERCASE)) {
      return TRENTON_STROKE_COLOR;
    }
    if (lowercaseKey.includes(TEAM_LOWERCASE)) {
      return TEAM_STROKE_COLOR;
    }
    return DEFAULT_STROKE_COLOR;
  }

  protected getDisplayName(key: string) {
    const lowercaseKey = key.toLowerCase();
    if (lowercaseKey.includes(ISAAC_LOWERCASE)) {
      return ISAAC_LINE_NAME;
    }
    if (lowercaseKey.includes(CODY_LOWERCASE)) {
      return CODY_LINE_NAME;
    }
    if (lowercaseKey.includes(BEN_LOWERCASE)) {
      return BEN_LINE_NAME;
    }
    if (lowercaseKey.includes(TRENTON_LOWERCASE)) {
      return TRENTON_LINE_NAME;
    }
    if (lowercaseKey.includes(TEAM_LOWERCASE)) {
      return TEAM_LINE_NAME;
    }
    return "unkown";
  }

  protected prepareData(statArray: Record<string, string>[]) {
    for (const stat of statArray) {
      const keys = Object.keys(stat);
      let gameIndex = 1;
      for (const key of keys) {
        if (!stat[key] || stat[key] === "nan") {
          continue;
        }
        this.statData.data.push({
          value: Number(stat[key]).toFixed(2),
          color: this.getStrokeColor(key),
          displayName: this.getDisplayName(key),
          key,
          gameIndex,
        });
      }
      gameIndex++;
    }
  }
}
