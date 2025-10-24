import { AVERAGE_KILLS_STAT_NAME, STATS_FILE_MAP } from "@/constants";
import { AveragesArray, StatArray, StatName, TeamName } from "@/types";
import { head } from "@vercel/blob";

function buildBlobPath(stat: StatName, team: TeamName): string {
  return `stats/${team}/${STATS_FILE_MAP[stat]}`;
}

async function getBlobUrl(path: string): Promise<string | null> {
  try {
    const blobData = await head(path);
    return blobData.url;
  } catch (error) {
    // failed to get blob url
    console.error(error);
    console.error("Failed to get blob from path: ", path);
    return null;
  }
}

async function fetchBlob(blobUrl: string) {
  try {
    const blobResponse = await fetch(blobUrl);
    if (!blobResponse.ok) {
      return null;
    }
    const json = await blobResponse.json();
    return json;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getStatArray(stat: StatName, team: TeamName): Promise<StatArray | null> {
  const path = buildBlobPath(stat, team);
  const blobUrl = await getBlobUrl(path);
  if (!blobUrl) {
    return null;
  }

  // this result is always an array because we store json arrays
  const jsonArray = await fetchBlob(blobUrl);
  if (jsonArray) {
    return jsonArray as StatArray;
  }
  return null;
}
