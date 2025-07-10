const { execSync } = require('child_process');          //libraries
const fs = require('fs');
const dayjs = require('dayjs');

const USER = 'letiziabanella'; //in this example i used my git hub user 
const THRESHOLD_DAYS = 30; //to check if it works i simulated an inactive branch by creating a commit with a false date in the past 
const OUTPUT_FILE = 'stale-branches.md';

(async () => {
  try {
   //getting repositories
    const repoList = execSync(`gh repo list ${USER} --limit 1000 --json name,url,isArchived,isFork`, { encoding: 'utf-8' });
    const repos = JSON.parse(repoList).filter(r => !r.isArchived && !r.isFork);

    let results = [];

    for (const repo of repos) { //loop throughh repositories
      const repoName = repo.name;
      const repoUrl = repo.url;

      console.log(`🔍 Checking ${repoName}...`);

      const tempDir = `.tmp/${repoName}.git`;       // clone the repository in bare mode 
      execSync(`git clone --bare ${repoUrl} ${tempDir}`);

      const refsOutput = execSync(`git --git-dir=${tempDir} for-each-ref --format="%(refname:short)|%(committerdate:iso8601)|%(committername)" refs/heads`, { encoding: 'utf-8' }); //extract all branches with their last commit date and author
      const branches = refsOutput.trim().split('\n').map(line => {
        const [name, date, author] = line.split('|');
        return { name, date: dayjs(date), author };
      });

      for (const branch of branches) { // process each branch
        if (['main', 'master'].includes(branch.name)) continue;

        const daysOld = dayjs().diff(branch.date, 'day');
        if (daysOld > THRESHOLD_DAYS) {
          results.push({
            repo: repoName,
            branch: branch.name,
            date: branch.date.format('YYYY-MM-DD'),
            author: branch.author
          });
        }
      }

      execSync(`rm -rf ${tempDir}`);
    }

    //Sort results
    results.sort((a, b) => {
      if (a.repo !== b.repo) return a.repo.localeCompare(b.repo);
      return dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1;
    });

//here i create the markdown table 
    const tableHeader = `| Repository Name | Branch Name | Last Commit Date | Last Commit Author |\n|-----------------|-------------|------------------|--------------------|`;
    const tableRows = results.map(r => `| ${r.repo} | ${r.branch} | ${r.date} | ${r.author} |`).join('\n');
    const output = [tableHeader, tableRows].join('\n');

    // save as md
    fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');
    //save as csv
    const CSV_FILE = 'stale-branches.csv';
const csvHeader = 'Repository Name,Branch Name,Last Commit Date,Last Commit Author\n';
const csvRows = results.map(r =>
  `"${r.repo}","${r.branch}","${r.date}","${r.author}"`
).join('\n');

fs.writeFileSync(CSV_FILE, csvHeader + csvRows, 'utf-8');
console.log(`✅ Saved to ${CSV_FILE}`);


    // stamp
    console.log('\n=== STALE BRANCHES (older than 30 days) ===\n');
    console.log(output);
    console.log(`\n✅ Saved to ${OUTPUT_FILE}`);
  } catch (err) { //errors
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
