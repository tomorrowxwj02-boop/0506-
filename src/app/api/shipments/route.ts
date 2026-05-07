import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { shipmentSchema } from '@/lib/validation/shipmentSchema';

export async function POST(request: NextRequest) {
  try {
    const { shipments, batchId } = await request.json();

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    for (const shipment of shipments) {
      try {
        const validated = shipmentSchema.parse(shipment);

        await prisma.shipment.create({
          data: {
            externalCode: validated.externalCode,
            senderName: validated.senderName,
            senderPhone: validated.senderPhone,
            senderAddress: validated.senderAddress,
            receiverName: validated.receiverName,
            receiverPhone: validated.receiverPhone,
            receiverAddress: validated.receiverAddress,
            weight: validated.weight,
            pieceCount: validated.pieceCount,
            temperature: validated.temperature,
            remark: validated.remark,
            batchId,
            status: 'submitted',
            submittedAt: new Date()
          }
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          externalCode: shipment.externalCode,
          error: (error as Error).message
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: '提交失败：' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const externalCode = searchParams.get('externalCode');
  const receiverName = searchParams.get('receiverName');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  const where: any = {};

  if (externalCode) {
    where.externalCode = { contains: externalCode, mode: 'insensitive' };
  }
  if (receiverName) {
    where.receiverName = { contains: receiverName, mode: 'insensitive' };
  }
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.shipment.count({ where })
  ]);

  return NextResponse.json({
    data: shipments,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  });
}
