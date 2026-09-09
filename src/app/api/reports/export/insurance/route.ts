import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ReportService } from '@/features/reports/services/report.service';
import { errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';

function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const office = searchParams.get('office') || undefined;
    const insuranceType = searchParams.get('insuranceType') || undefined;

    const policies = await ReportService.getInsuranceForExport(startDate, endDate, office, insuranceType);

    const headers = [
      'Contribution Date',
      'Official Name',
      'Designation',
      'Official Office',
      'Office of Indexing',
      'Insurance Type',
      'Sum Assured (INR)',
      'Initial Premium (INR)',
      'Remarks',
      'Logged By',
    ];

    const rows = [headers.join(',')];

    for (const p of policies) {
      const official = p.officialId as { name?: string; designation?: string; office?: string } | null;
      const creator = p.createdBy as { name?: string; email?: string } | null;

      const dateStr = p.contributionDate ? new Date(p.contributionDate).toISOString().split('T')[0] : '';

      const row = [
        escapeCsvField(dateStr),
        escapeCsvField(official?.name || 'N/A'),
        escapeCsvField(official?.designation || ''),
        escapeCsvField(official?.office || ''),
        escapeCsvField(p.officeOfIndexing || ''),
        escapeCsvField(p.insuranceType || ''),
        p.sumAssured || 0,
        p.initialPremium || 0,
        escapeCsvField(p.remarks || ''),
        escapeCsvField(creator?.name || creator?.email || ''),
      ];

      rows.push(row.join(','));
    }

    const csvContent = rows.join('\r\n');
    const filename = `postal_insurance_policies_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    return errorResponse((error as Error).message, 500);
  }
}
