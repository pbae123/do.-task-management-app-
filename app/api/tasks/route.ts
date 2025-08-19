import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/tasks
export async function GET() {
  const tasks = await prisma.task.findMany();
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { content, x, y, pageId } = body;

  // Validate request body
  if (!content || typeof x !== 'number' || typeof y !== 'number' || !pageId) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  // 🔧 Upsert the page (create it if it doesn't exist)
  await prisma.page.upsert({
    where: { id: pageId },
    update: {}, // no update needed if it exists
    create: { id: pageId, name: pageId }, // or give it a default name
  });

  // ✅ Now safely create the task
  const task = await prisma.task.create({
    data: { content, x, y, pageId },
  });

  return NextResponse.json(task);
}


// PATCH /api/tasks
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  // Allow empty string; only treat "missing" as undefined
  const body = await req.json().catch(() => ({}));
  const { content, x, y } = body as {
    content?: string; // may be empty ""
    x?: number;
    y?: number;
  };

  // Build update payload only with provided fields
  const data: Record<string, unknown> = {};
  if (content !== undefined) data.content = content;
  if (x !== undefined) data.x = x;
  if (y !== undefined) data.y = y;

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: 'Nothing to update' },
      { status: 400 }
    );
  }

  try {
    const task = await prisma.task.update({
      where: { id },
      data,
    });
    return NextResponse.json(task);
  } catch (e) {
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    );
  }
}


// DELETE /api/tasks?id=abc123
export async function DELETE(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get('id');

  if (!taskId) {
    return NextResponse.json({ error: 'Missing task ID' }, { status: 400 });
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return NextResponse.json({ success: true });
}

