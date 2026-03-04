import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Create Prisma client with MariaDB adapter
function createPrismaClient() {
  const url = new URL(process.env.DATABASE_URL!);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
  });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

// Dummy users for seeding
const dummyUsers = [
  {
    name: "Admin NexusBite",
    email: "admin@nexusbite.com",
    password: "admin123",
    role: "ADMIN" as const,
    isApproved: true,
    balance: 0,
  },
  {
    name: "Budi Santoso",
    email: "budi@smkn40-jkt.sch.id",
    password: "siswa123",
    role: "SISWA" as const,
    isApproved: true,
    balance: 50000,
  },
  {
    name: "Siti Rahayu",
    email: "siti@smkn40-jkt.sch.id",
    password: "siswa123",
    role: "SISWA" as const,
    isApproved: true,
    balance: 75000,
  },
  {
    name: "Pak Joko - Warung Sederhana",
    email: "joko.penjual@gmail.com",
    password: "penjual123",
    role: "PENJUAL" as const,
    isApproved: true, // Sudah disetujui admin
    balance: 500000,
  },
  {
    name: "Bu Siti - Kantin Berkah",
    email: "siti.penjual@gmail.com",
    password: "penjual123",
    role: "PENJUAL" as const,
    isApproved: true, // Sudah disetujui admin
    balance: 750000,
  },
  {
    name: "Calon Penjual - Pending",
    email: "pending.penjual@gmail.com",
    password: "penjual123",
    role: "PENJUAL" as const,
    isApproved: false, // Belum disetujui admin
    balance: 0,
  },
];

// Dummy menus for seeding - will be assigned to sellers
const dummyMenus = [
  // Menu untuk Pak Joko - Warung Sederhana
  {
    name: "Nasi Goreng Spesial",
    description: "Nasi goreng dengan telur, ayam, dan sayuran segar. Disajikan dengan kerupuk dan acar.",
    price: 15000,
    status: "AVAILABLE" as const,
    sellerEmail: "joko.penjual@gmail.com",
  },
  {
    name: "Mie Ayam Bakso",
    description: "Mie ayam dengan bakso sapi pilihan, disajikan dengan kuah kaldu gurih.",
    price: 12000,
    status: "AVAILABLE" as const,
    sellerEmail: "joko.penjual@gmail.com",
  },
  {
    name: "Ayam Geprek",
    description: "Ayam goreng crispy dengan sambal geprek pedas level 1-5.",
    price: 18000,
    status: "AVAILABLE" as const,
    sellerEmail: "joko.penjual@gmail.com",
  },
  {
    name: "Es Teh Manis",
    description: "Teh manis dingin segar, cocok untuk menemani makan siang.",
    price: 5000,
    status: "AVAILABLE" as const,
    sellerEmail: "joko.penjual@gmail.com",
  },
  // Menu untuk Bu Siti - Kantin Berkah
  {
    name: "Soto Ayam",
    description: "Soto ayam dengan kuah kuning khas Jawa, dilengkapi nasi dan emping.",
    price: 14000,
    status: "AVAILABLE" as const,
    sellerEmail: "siti.penjual@gmail.com",
  },
  {
    name: "Jus Alpukat",
    description: "Jus alpukat segar dengan susu coklat.",
    price: 10000,
    status: "OUT_OF_STOCK" as const,
    sellerEmail: "siti.penjual@gmail.com",
  },
  {
    name: "Bakso Urat",
    description: "Bakso urat sapi dengan mie, bihun, dan tahu. Kuah kaldu sapi gurih.",
    price: 15000,
    status: "AVAILABLE" as const,
    sellerEmail: "siti.penjual@gmail.com",
  },
  {
    name: "Nasi Uduk Komplit",
    description: "Nasi uduk dengan ayam goreng, tempe orek, dan sambal.",
    price: 16000,
    status: "AVAILABLE" as const,
    sellerEmail: "siti.penjual@gmail.com",
  },
];

async function main() {
  console.log("🌱 Starting seed...\n");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Existing data cleared\n");

  // Seed users and store them for menu assignment
  console.log("👥 Seeding users...");
  const createdUsers: { [email: string]: string } = {};
  
  for (const user of dummyUsers) {
    const hashedPwd = await bcrypt.hash(user.password, 12);
    const created = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPwd,
        role: user.role as any,
        isApproved: user.isApproved,
        balance: user.balance,
      },
    });
    createdUsers[user.email] = created.id;
    const status = user.isApproved ? "✅" : "⏳";
    console.log(`   ${status} Created ${user.role}: ${user.email}${!user.isApproved ? " (pending)" : ""}`);
  }
  console.log("");

  // Seed menus with seller assignment
  console.log("🍽️  Seeding menus...");
  for (const menu of dummyMenus) {
    const sellerId = createdUsers[menu.sellerEmail];
    if (!sellerId) {
      console.log(`   ⚠️ Skipped menu "${menu.name}" - seller not found`);
      continue;
    }
    await prisma.menu.create({
      data: {
        name: menu.name,
        description: menu.description,
        price: menu.price,
        status: menu.status,
        sellerId: sellerId,
      },
    });
    console.log(`   ✅ Created menu: ${menu.name} (by ${menu.sellerEmail.split("@")[0]})`);
  }
  console.log("");

  // Print summary
  console.log("═".repeat(60));
  console.log("📋 SEED SUMMARY");
  console.log("═".repeat(60));
  console.log("\n👥 AKUN DUMMY (Password untuk login):\n");
  console.log("┌──────────────────────────────────────────────────────────────────────┐");
  console.log("│ ROLE      │ EMAIL                      │ PASSWORD    │ STATUS    │");
  console.log("├──────────────────────────────────────────────────────────────────────┤");
  console.log("│ ADMIN     │ admin@nexusbite.com        │ admin123    │ ✅ Active │");
  console.log("│ SISWA     │ budi@smkn40-jkt.sch.id     │ siswa123    │ ✅ Active │");
  console.log("│ SISWA     │ siti@smkn40-jkt.sch.id     │ siswa123    │ ✅ Active │");
  console.log("│ PENJUAL   │ joko.penjual@gmail.com     │ penjual123  │ ✅ Active │");
  console.log("│ PENJUAL   │ siti.penjual@gmail.com     │ penjual123  │ ✅ Active │");
  console.log("│ PENJUAL   │ pending.penjual@gmail.com  │ penjual123  │ ⏳ Pending│");
  console.log("└──────────────────────────────────────────────────────────────────────┘");
  console.log("\n✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
