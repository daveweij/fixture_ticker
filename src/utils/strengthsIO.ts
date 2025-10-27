import type { TeamStrength } from './parse';

/**
 * Export strength values to CSV format
 * Format: Team,Attack,Defense with optional home_advantage row
 */
export function exportStrengthsToCSV(
    teamStrengths: TeamStrength[],
    editedStrengths: Record<string, { attack: number; defense: number }>,
    homeAdvantage?: number
): string {
    const lines = ['Team,Attack,Defense'];

    // Add home_advantage if provided
    if (homeAdvantage !== undefined) {
        lines.push(`home_advantage,${homeAdvantage}`);
    }

    teamStrengths.forEach(team => {
        const attack = editedStrengths[team.team]?.attack ?? team.attack;
        const defense = editedStrengths[team.team]?.defense ?? team.defense;
        lines.push(`${team.team},${attack},${defense}`);
    });

    return lines.join('\n');
}

/**
 * Trigger download of strength data as .fixture_strengths file using File System Access API
 * Falls back to regular download if API is not supported
 */
export async function downloadStrengthsFile(csvContent: string, filename: string = 'strengths.fixture_strengths'): Promise<void> {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Read file content from user selection
 */
export function readStrengthsFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            resolve(content);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
