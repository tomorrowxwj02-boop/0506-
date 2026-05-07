import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const signature = request.nextUrl.searchParams.get('signature');

    if (signature) {
      const template = await prisma.templateMapping.findUnique({
        where: { templateSignature: signature }
      });
      if (template) {
        return NextResponse.json({
          ...template,
          columnMapping: template.columnMapping ? JSON.parse(template.columnMapping) : {}
        });
      }
      return NextResponse.json({ columnMapping: {} });
    }

    const templates = await prisma.templateMapping.findMany({
      orderBy: { useCount: 'desc' }
    });
    return NextResponse.json(templates.map(t => ({
      ...t,
      columnMapping: t.columnMapping ? JSON.parse(t.columnMapping) : {}
    })));
  } catch (error) {
    console.error('API/templates GET error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { signature, mappingName, columnMapping } = await request.json();

    const template = await prisma.templateMapping.upsert({
      where: { templateSignature: signature },
      update: {
        columnMapping: JSON.stringify(columnMapping),
        useCount: { increment: 1 },
        updatedAt: new Date()
      },
      create: {
        templateSignature: signature,
        mappingName,
        columnMapping: JSON.stringify(columnMapping)
      }
    });

    return NextResponse.json({
      ...template,
      columnMapping: JSON.parse(template.columnMapping)
    });
  } catch (error) {
    console.error('API/templates POST error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
