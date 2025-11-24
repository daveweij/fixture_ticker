type FixtureRow = {
  team: string;
  fixtures: string[];
};

type TeamStrength = {
  team: string;
  attack: number;
  defense: number;
};

type GameweekDate = {
  gameweek: number;
  startDate: Date;
  endDate: Date;
};

function parseFixturesCSV(csv: string): FixtureRow[] {
  const lines = csv.trim().split(/\r?\n/);
  return lines.map((line) => {
    const cells = line.split(",");
    return {
      team: cells[0],
      fixtures: cells.slice(1),
    };
  });
}

function parseStrengthsCSV(csv: string): {
  strengths: TeamStrength[];
  homeAdvantage: number;
} {
  // Validate file size (max 100KB for a strengths file)
  if (csv.length > 100_000) {
    throw new Error("File too large. Maximum size is 100KB.");
  }

  const lines = csv.trim().split(/\r?\n/);

  // Limit number of lines (reasonable max is ~30 teams)
  if (lines.length > 50) {
    throw new Error("File has too many lines. Maximum is 50.");
  }

  let homeAdvantage = 0;
  const strengths: TeamStrength[] = [];

  lines.slice(1).forEach((line) => {
    if (!line) return;
    const cells = line.split(",");

    // Check for home_advantage row first
    if (cells[0].trim() === "home_advantage") {
      homeAdvantage = parseFloat(cells[1]);
      return; // Skip to next line
    }

    // Process team strength
    const team = cells[0].trim();

    if (team.length > 100) {
      return; // Skip overly long team names
    }

    const attack = Math.round(parseFloat(cells[1]) * 100) / 100;
    const defense = Math.round(parseFloat(cells[2]) * 100) / 100;

    const areValidValues = !isNaN(attack) && !isNaN(defense);

    // Validate numeric ranges (reasonable strength values)
    if (team && areValidValues) {
      strengths.push({
        team,
        attack,
        defense,
      });
    }
  });

  return { strengths, homeAdvantage };
}

function parseGameweekDatesCSV(csv: string): GameweekDate[] {
  const lines = csv.trim().split(/\r?\n/);
  const gameweekDates: GameweekDate[] = [];

  // Skip header line
  lines.slice(1).forEach((line) => {
    if (!line) return;
    const cells = line.split(",");

    const gameweek = parseInt(cells[0].trim());
    const startDate = new Date(cells[1].trim());
    const endDate = new Date(cells[2].trim());

    // Normalize dates to start of day
    endDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    if (
      !isNaN(gameweek) &&
      !isNaN(startDate.getTime()) &&
      !isNaN(endDate.getTime())
    ) {
      gameweekDates.push({ gameweek, startDate, endDate });
    }
  });

  return gameweekDates;
}

/**
 * Filters gameweeks to show only those that haven't fully completed yet.
 * Returns the starting gameweek index (0-based) to begin displaying.
 * A gameweek is considered fully played once the day after its end date arrives.
 *
 * @param gameweekDates - Array of gameweek date information
 * @param currentDate - Current date (defaults to now)
 * @returns The first gameweek index to display
 */
function getStartingGameweek(
  gameweekDates: GameweekDate[],
  currentDate: Date = new Date()
): number {
  // Normalize current date to start of day for comparison
  currentDate.setHours(0, 0, 0, 0);

  // Find the first gameweek where end date is >= current date (still playable)
  for (let i = 0; i < gameweekDates.length; i++) {
    if (gameweekDates[i].endDate >= currentDate) {
      return gameweekDates[i].gameweek - 1; // Convert to 0-based index
    }
  }

  // If all gameweeks have passed, return the last gameweek
  return gameweekDates.length > 0
    ? gameweekDates[gameweekDates.length - 1].gameweek - 1
    : 0;
}

export {
  parseFixturesCSV,
  parseStrengthsCSV,
  parseGameweekDatesCSV,
  getStartingGameweek,
};
export type { FixtureRow, TeamStrength, GameweekDate };
