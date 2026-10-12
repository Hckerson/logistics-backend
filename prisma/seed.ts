import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import {
    Prisma,
    UserRole,
    PrismaClient,
    UserAccountStatus,
} from '../generated/prisma/client';
import { DOCUMENTS, documentInput } from './seed-data/documents';
import { FACILITIES, facilityInput } from './seed-data/facilities';
import { SEED_LOADS, loadInput, stopTypesAt } from './seed-data/loads';
import { NOTIFICATIONS, notificationInput } from './seed-data/notifications';
import { ORGANIZATIONS } from './seed-data/organizations';
import { TRACKING_LINKS, trackingLinkInput } from './seed-data/tracking-links';
import { trackingAddresses } from './seed-data/tracking-tokens';
import { SEED_USERS, userInput } from './seed-data/users';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEEDED_TABLES = [
    'User',
    'Organization',
    'Membership',
    'Facility',
    'Load',
    'Stop',
    'Charge',
    'Position',
    'LoadEvent',
    'TrackingLink',
    'Document',
    'Notification',
];

async function sqlRollback() {
    console.error('\n🔄 Rolling back database...');
    try {
        const tables = SEEDED_TABLES.map((table) => `"${table}"`).join(', ');
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
        console.error('✓ Database rolled back successfully');
    } catch (error) {
        console.error('❌ Rollback failed:', error);
        console.error('Manual cleanup required. Run: npx prisma migrate reset');
    }
}

function buildUser(overrides: Partial<Prisma.UserCreateInput>) {
    return {
        fullName: faker.person.fullName(),
        email: faker.internet.email(),
        passwordHash: bcrypt.hashSync('password123', 10),
        avatar: faker.image.avatar(),
        bio: faker.lorem.sentence(),
        phoneNumber: faker.phone.number(),
        role: UserRole.USER,
        status: faker.helpers.enumValue(UserAccountStatus),
        lastActive: faker.date.recent(),
        ...overrides,
    } satisfies Prisma.UserCreateInput;
}

async function seedFreight(now: number) {
    await prisma.organization.createMany({
        data: Object.values(ORGANIZATIONS),
    });

    for (const user of Object.values(SEED_USERS)) {
        await prisma.user.create({ data: userInput(user) });
    }

    await prisma.facility.createMany({
        data: Object.values(FACILITIES).map((facility) =>
            facilityInput(facility, stopTypesAt(facility.id)),
        ),
    });

    for (const load of SEED_LOADS) {
        await prisma.load.create({ data: loadInput(load, now) });
    }

    const links = TRACKING_LINKS.map((link) => trackingLinkInput(link, now));
    await prisma.trackingLink.createMany({ data: links });

    await prisma.document.createMany({
        data: DOCUMENTS.map((document, index) =>
            documentInput(document, index, now),
        ),
    });

    await prisma.notification.createMany({
        data: NOTIFICATIONS.map((notification) =>
            notificationInput(notification, now),
        ),
    });

    return links;
}

async function main() {
    try {
        console.log('Seeding database...');

        await prisma.user.create({
            data: buildUser({
                fullName: 'Admin User',
                email: 'admin@example.com',
                role: UserRole.ADMIN,
                status: UserAccountStatus.ACTIVE,
            }),
        });

        for (let i = 0; i < 20; i++) {
            await prisma.user.create({ data: buildUser({}) });
        }

        const links = await seedFreight(Date.now());

        console.log('\nTracking links:');
        for (const line of trackingAddresses(links)) {
            console.log(`  ${line}`);
        }

        console.log('\n✅ Database seeding completed successfully!');
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        await sqlRollback();
        process.exit(1);
    }
}

main()
    .catch((err) => {
        console.error('Unexpected error:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
