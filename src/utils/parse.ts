type FixtureRow = {
  team: string;
  fixtures: string[];
};

type TeamStrength = {
  team: string;
  attack: number;
  defense: number;
};


function parseFixturesCSV(csv: string): FixtureRow[] {
  const lines = csv.trim().split(/\r?\n/);
  return lines.map(line => {
    const cells = line.split(',');
    return {
      team: cells[0],
      fixtures: cells.slice(1),
    };
  });
}

function parseStrengthsCSV(csv: string): { strengths: TeamStrength[]; homeAdvantage: number } {
  // Validate file size (max 100KB for a strengths file)
  if (csv.length > 100_000) {
    throw new Error('File too large. Maximum size is 100KB.');
  }

  const lines = csv.trim().split(/\r?\n/);

  // Limit number of lines (reasonable max is ~30 teams)
  if (lines.length > 50) {
    throw new Error('File has too many lines. Maximum is 50.');
  }

  let homeAdvantage = 0;
  const strengths: TeamStrength[] = [];

  lines.slice(1).forEach(line => {
    if (!line) return;
    const cells = line.split(',');

    // Check for home_advantage row first
    if (cells[0].trim() === 'home_advantage') {
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

export { parseFixturesCSV, parseStrengthsCSV };
export type { FixtureRow, TeamStrength };
