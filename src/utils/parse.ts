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
  const lines = csv.trim().split(/\r?\n/);
  let homeAdvantage = 0;
  const strengths: TeamStrength[] = [];
  lines.slice(1).forEach(line => {
    if (!line) return;
    const cells = line.split(',');
    if (cells[0] === 'home_advantage') {
      homeAdvantage = parseFloat(cells[1]);
    } else {
      strengths.push({
        team: cells[0],
        attack: Math.round(parseFloat(cells[1]) * 100) / 100,
        defense: Math.round(parseFloat(cells[2]) * 100) / 100,
      });
    }
  });
  return { strengths, homeAdvantage };
}

export { parseFixturesCSV, parseStrengthsCSV };
export type { FixtureRow, TeamStrength };
