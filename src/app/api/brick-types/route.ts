import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const types = await prisma.brickType.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(types);
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, unit, basePrice, image } = await req.json();
    const type = await prisma.brickType.create({
      data: { name, description, unit, basePrice: parseFloat(basePrice), image },
    });
    return NextResponse.json(type, { status: 201 });
  } catch (error) {
    console.error("Create brick type error:", error);
    return NextResponse.json({ error: "Failed to create brick type" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, description, unit, basePrice, image } = await req.json();
    const type = await prisma.brickType.update({
      where: { id },
      data: { name, description, unit, basePrice: parseFloat(basePrice), image },
    });
    return NextResponse.json(type);
  } catch (error) {
    console.error("Update brick type error:", error);
    return NextResponse.json({ error: "Failed to update brick type" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    await prisma.brickType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete brick type error:", error);
    return NextResponse.json({ error: "Failed to delete brick type" }, { status: 500 });
  }
}
