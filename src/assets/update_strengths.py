# Load team_strengths.csv
def scale(val, min_val, max_val):
    # Scale to range 10 (max) to 1 (min)
    if max_val == min_val:
        return 10  # Avoid division by zero

    return int(round(1 + (val - min_val) * 9 / (max_val - min_val)))


new_lines = []
rows = []
with open("src/assets/team_strengths.csv", mode="r") as file:
    header = file.readline().strip().split(",")
    print(header)
    for line in file:
        team, attack, defense = line.strip().split(",")
        rows.append((team, float(attack), float(defense)))

# Find min/max for attack and defense
attacks = [row[1] for row in rows[:-1]]
defenses = [row[2] for row in rows[:-1]]
min_attack, max_attack = min(attacks), max(attacks)
min_defense, max_defense = max(defenses), min(defenses)

new_lines = [header]
for team, attack, defense in rows:
    new_attack = scale(attack, min_attack, max_attack)
    new_defense = scale(defense, min_defense, max_defense)
    new_lines.append([team, str(new_attack), str(new_defense)])

# Write updated strengths back to team_strengths.csv
with open("src/assets/new_team_strengths.csv", mode="w") as file:
    for line in new_lines:
        file.write(",".join(line) + "\n")
