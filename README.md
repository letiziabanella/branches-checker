## Project name
Branches-checker
## Objective:
Build a Node.js script to identify all stale branches (no commits in the last 30 days) across multiple repositories within a GitHub organization.
## Features
1. Scans all repositories within a specified GitHub organization.
2. Lists all non-default branches, excluding main and master.
3. Retrieves the date and author of the most recent commit for each branch.
4. Filters branches where the most recent commit is older than 30 days.
5. Sorts the output by:
  Repository name (A–Z)
  Last commit date (oldest first)
6.Prints results to the console for quick review.
7.Saves the output as a .md (Markdown) file in the project directory.
