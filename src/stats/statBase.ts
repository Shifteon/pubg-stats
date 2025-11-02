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
  PERCENTAGE_OF_DATA_TO_REMOVE, 
  TEAM_LINE_NAME, 
  TEAM_LOWERCASE, 
  TEAM_STROKE_COLOR, 
  TRENTON_LINE_NAME, 
  TRENTON_LOWERCASE,
  TRENTON_STROKE_COLOR
} from "@/constants";

export interface ChartOptions {
  color: string;
  key: string;
  displayName: string;
}

export interface StatData {
  chartOptions: ChartOptions[];
  data: Record<string, number>[];
};

export abstract class StatBase {
  public statDisplayName: string;
  public chartType: string;
  protected statName: string;
  protected statsByTeam: Map<string, StatData>;


  constructor(statName: string, displayName: string, chartType: string) {
    this.statName = statName;
    this.statsByTeam = new Map<string, StatData>();
    this.statDisplayName = displayName;
    this.chartType = chartType;
  }
  
  public abstract getStats(team: string): Promise<StatData | null>;

  protected async fetchData(team: string): Promise<{ statArray: Record<string, string>[] } | null> {
    try {
      const results = await fetch(`/api/stats?team=${team}&stat=${this.statName}`);
      if (!results.ok) {
        return null;
      }

      const json: { statArray: Record<string, string>[] } = await results.json();
      
      return json;
  } catch (error) {
      console.log(error);
      return null;
    }
  }

  protected async getStatData(team: string, keysToKeep: string[], shouldFilter = true) {
    const teamData = this.statsByTeam.get(team);
    if (!teamData || teamData.data.length === 0) {
      const json = await this.fetchData(team);
      if (!json) {
        return null;
      }
      const preparedData = this.prepareData(json.statArray, keysToKeep, shouldFilter);
      if (preparedData) {
        this.statsByTeam.set(team, preparedData);
      }
      return preparedData;
    }
    return teamData;
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
    if (lowercaseKey.includes("win_rate")) {
      return "Win Rate";
    }
    return "unkown";
  }

  protected prepareData(statArray: Record<string, string>[], keysToKeep: string[], shouldFilter: boolean): StatData {
    const keys = Object.keys(statArray[0]);
    const chartOptions: ChartOptions[] = [];
    for (const key of keys) {
      if (!statArray[0][key] || statArray[0][key] === "nan" || !keysToKeep.includes(key)) {
        continue;
      }
      chartOptions.push({
        color: this.getStrokeColor(key),
        key,
        displayName: this.getDisplayName(key),
      });
    }

    const rawData: Record<string, number>[] = [];

    let gameIndex = 1;
    for (const stat of statArray) {
      const keys = Object.keys(stat);
      const rawObject: Record<string, number> = {};
      for (const key of keys) {
        if (!stat[key] || stat[key] === "nan" || !keysToKeep.includes(key)) {
          continue;
        }
        rawObject[key] = Number(stat[key]);
      }
      rawData.push({...rawObject, gameIndex});
      gameIndex++;
    }

    if (!shouldFilter) {
      return {
        chartOptions,
        data: rawData,
      };
    }
    // remove some of the data to nomralize it
    const startIndex = Math.ceil(rawData.length * PERCENTAGE_OF_DATA_TO_REMOVE);
    const filteredData = rawData.slice(startIndex);

    return {
      chartOptions,
      data: filteredData,
    };
  }
}
