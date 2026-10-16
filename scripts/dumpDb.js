const { exec } = require('child_process')

const dbUrl = process.env.SOURCE_DATABASE_URL;
if (!dbUrl) {
    console.error('Dump failed!\nenv variable "SOURCE_DATABASE_URL" is unreachable or not set!');
    return;
}

const filePath = "supabase/seed.sql"

const command = `npx supabase db dump --data-only --db-url ${dbUrl} --file ${filePath}`;

console.log(`Running command: ${command}\n`);
exec(command, (error, stdout, stderr) => {
    if (error || stderr != "") {
        const message = error ? error.message : stderr;
        console.error(`Error executing dump: ${message}`);
        return;
    }
    if (stdout != "") {
        console.log(stdout);
    }

    return;
});
