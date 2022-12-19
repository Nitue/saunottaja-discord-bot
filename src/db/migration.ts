import {Client} from "pg";
import fs from "fs";
import path from "path";
import {log} from "../logs/logging";

const CHANGELOGS_PATH = "../resources/db/";

export default async function migrate(client: Client) {
    const migratedFiles = await getMigratedFiles(client);

    const filesToMigrate = getFilesToMigrate()
        .filter(file => migratedFiles.find(migratedFile => migratedFile === file) == undefined);

    const databaseMigrationScript = buildMigrationScript(filesToMigrate);

    if (databaseMigrationScript.length === 0) {
        return;
    }

    try {
        await client.query('BEGIN');
        const migrationResult = await client.query(databaseMigrationScript);
        await registerMigratedFiles(client, filesToMigrate);
        await client.query('COMMIT');
        return migrationResult;
    } catch (err) {
        log.error('Migration failed:', err);
        return client.query("ROLLBACK").then(() => log.info('Rollback finished'));
    }
}

function getMigratedFiles(client: Client): Promise<string[]> {
    return client.query("SELECT file FROM migration")
        .then(result => result.rows.map(row => row.file))
        .catch(err => {
            if (err.message === 'relation "migration" does not exist') {
                log.info("No migration log. Assume it's first migration.");
            }
            return [];
        });
}

function getFilesToMigrate(): string[] {
    return fs.readdirSync(path.resolve(__dirname, CHANGELOGS_PATH))
        .sort(prefixSort);
}

function buildMigrationScript(files: string[]): string {
    return files
        .map(file => fs.readFileSync(path.resolve(__dirname, CHANGELOGS_PATH, file)).toString())
        .reduce((sum, current) => sum + current, "");
}

function registerMigratedFiles(client: Client, files: string[]) {
    return Promise.all(files.map(file => client.query({
        text: "INSERT INTO migration (file) VALUES ($1)",
        values: [file]
    })));
}

function prefixSort(a: string, b: string) {
    return getChangelogFilePrefix(a) - getChangelogFilePrefix(b);
}

function getChangelogFilePrefix(file: string): number {
    const prefix = file.split('-').shift();
    if (!prefix) {
        throw new Error(`Could not get prefix for changelog: ${file}`);
    }
    return parseInt(prefix);
}
