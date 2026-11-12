import 'dotenv/config';
import readline from 'node:readline';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from '@node-rs/argon2';

const MIN_LENGTH = 12;

/** Asks a question. With `hidden`, nothing is shown while typing. */
function ask(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    if (hidden) {
      const internal = rl as unknown as { _writeToOutput: (text: string) => void };
      const original = internal._writeToOutput.bind(rl);
      internal._writeToOutput = (text: string) => {
        if (!muted) original(text); // the question itself is shown; the typed characters are not
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer);
    });
    muted = hidden;
  });
}

async function main() {
  const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? '').trim();
  if (!email) {
    throw new Error('No email found. Pass it as an argument or set ADMIN_EMAIL in .env.');
  }

  const first = await ask(`New password for ${email}: `, true);
  if (first.length < MIN_LENGTH) throw new Error(`The password must be at least ${MIN_LENGTH} characters.`);
  const second = await ask('Type it again to confirm: ', true);
  if (first !== second) throw new Error('The two passwords do not match. Nothing was changed.');

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  try {
    const admin = await prisma.adminUser.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true },
    });
    if (!admin) throw new Error('No admin account with that email. Nothing was changed.');

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        passwordHash: await hash(first),
        tokenVersion: { increment: 1 }, // signs out every session that is open right now
      },
    });
    console.log('Password updated. All existing admin sessions have been signed out.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Something went wrong.');
  process.exit(1);
});