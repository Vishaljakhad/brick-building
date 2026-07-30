import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@test.com",
      password,
      role: "ADMIN",
      phone: "+91 9876543210",
      address: "Admin Office, Dhaka",
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@test.com" },
    update: {},
    create: {
      name: "Rahim Bhata Malik",
      email: "owner@test.com",
      password,
      role: "OWNER",
      phone: "+91 9876543211",
      address: "Bhata Office, Savar, Dhaka",
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: "owner2@test.com" },
    update: {},
    create: {
      name: "Karim Bricks",
      email: "owner2@test.com",
      password,
      role: "OWNER",
      phone: "+91 9876543212",
      address: "Mirpur, Dhaka",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      name: "Shahid Builder",
      email: "customer@test.com",
      password,
      role: "CUSTOMER",
      phone: "+91 9876543213",
      address: "Uttara, Dhaka",
    },
  });

  const standardBrick = await prisma.brickType.upsert({
    where: { id: "standard-brick" },
    update: {},
    create: {
      id: "standard-brick",
      name: "Standard Red Brick",
      description: "Traditional clay-fired red brick, standard size 9x4x3 inches",
      unit: "pieces",
      basePrice: 8,
    },
  });

  const hollowBrick = await prisma.brickType.upsert({
    where: { id: "hollow-brick" },
    update: {},
    create: {
      id: "hollow-brick",
      name: "Hollow Brick",
      description: "Lightweight hollow brick, good for thermal insulation",
      unit: "pieces",
      basePrice: 12,
    },
  });

  const flyAshBrick = await prisma.brickType.upsert({
    where: { id: "flyash-brick" },
    update: {},
    create: {
      id: "flyash-brick",
      name: "Fly Ash Brick",
      description: "Eco-friendly brick made from fly ash, cement and sand",
      unit: "pieces",
      basePrice: 6,
    },
  });

  const concreteBlock = await prisma.brickType.upsert({
    where: { id: "concrete-block" },
    update: {},
    create: {
      id: "concrete-block",
      name: "Concrete Block",
      description: "Solid concrete block for foundation and heavy construction",
      unit: "pieces",
      basePrice: 25,
    },
  });

  const bhata1 = await prisma.bhata.upsert({
    where: { id: "bhata-1" },
    update: {},
    create: {
      id: "bhata-1",
      name: "Rahim Bhata & Brothers",
      ownerId: owner.id,
      address: "Savar EPZ Road, Savar, Dhaka",
      latitude: 23.858,
      longitude: 90.267,
      phone: "+91 9876543211",
      description:
        "Family-owned brick kiln since 1995. We produce high-quality red bricks using traditional methods with modern quality control. Serving Dhaka and surrounding areas.",
      isActive: true,
    },
  });

  const bhata2 = await prisma.bhata.upsert({
    where: { id: "bhata-2" },
    update: {},
    create: {
      id: "bhata-2",
      name: "Karim Bricks & Tiles",
      ownerId: owner2.id,
      address: "Mirpur 12, Dhaka",
      latitude: 23.822,
      longitude: 90.369,
      phone: "+91 9876543212",
      description:
        "Modern brick manufacturing facility with automated production lines. Specializing in fly ash bricks and concrete blocks. Environmentally conscious manufacturing.",
      isActive: true,
    },
  });

  // Set prices for bhata1
  const prices = [
    { bhataId: bhata1.id, brickTypeId: standardBrick.id, price: 8, stock: 50000 },
    { bhataId: bhata1.id, brickTypeId: hollowBrick.id, price: 13, stock: 20000 },
    { bhataId: bhata1.id, brickTypeId: flyAshBrick.id, price: 6.5, stock: 30000 },
    { bhataId: bhata2.id, brickTypeId: standardBrick.id, price: 8.5, stock: 60000 },
    { bhataId: bhata2.id, brickTypeId: flyAshBrick.id, price: 6, stock: 50000 },
    { bhataId: bhata2.id, brickTypeId: concreteBlock.id, price: 28, stock: 10000 },
  ];

  for (const p of prices) {
    await prisma.brickPrice.upsert({
      where: {
        bhataId_brickTypeId: { bhataId: p.bhataId, brickTypeId: p.brickTypeId },
      },
      update: { price: p.price, stock: p.stock },
      create: p,
    });
  }

  // Sample order
  await prisma.order.upsert({
    where: { id: "sample-order-1" },
    update: {},
    create: {
      id: "sample-order-1",
      orderNumber: "BRK-SAMPLE-001",
      customerId: customer.id,
      bhataId: bhata1.id,
      status: "DELIVERED",
      totalAmount: 40000,
      paymentMethod: "COD",
      paymentStatus: "PAID",
      deliveryAddress: "House 12, Road 5, Uttara, Dhaka",
      deliveryLatitude: 23.875,
      deliveryLongitude: 90.379,
      truckCapacity: "Medium Truck (6-wheel)",
      items: {
        create: [
          {
            brickTypeId: standardBrick.id,
            quantity: 5000,
            unitPrice: 8,
          },
        ],
      },
    },
  });

  console.log("Database seeded successfully!");
  console.log("---");
  console.log("Demo Accounts:");
  console.log("  Admin:    admin@test.com / password123");
  console.log("  Owner:    owner@test.com / password123");
  console.log("  Owner 2:  owner2@test.com / password123");
  console.log("  Customer: customer@test.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
