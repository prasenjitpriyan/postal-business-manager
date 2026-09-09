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

    const contributions = await ReportService.getContributionsForExport(startDate, endDate, office);

    const headers = [
      'Contribution Date',
      'Official Name',
      'Designation',
      'Official Office',
      'Contribute Office',
      'Account Type',
      'Accounts Opened',
      'Remarks',
      'Logged By',
    ];

    const rows = [headers.join(',')];

    for (const c of contributions) {
      const official = c.officialId as { name?: string; designation?: string; office?: string } | null;
      const creator = c.createdBy as { name?: string; email?: string } | null;

      const dateStr = c.contributionDate ? new Date(c.contributionDate).toISOString().split('T')[0] : '';

      const row = [
        escapeCsvField(dateStr),
        escapeCsvField(official?.name || 'N/A'),
        escapeCsvField(official?.designation || ''),
        escapeCsvField(official?.office || ''),
        escapeCsvField(c.contributeOffice || ''),
        escapeCsvField(c.accountType || ''),
        c.accountsOpened || 0,
        escapeCsvField(c.remarks || ''),
        escapeCsvField(creator?.name || creator?.email || ''),
      ];

      rows.push(row.join(','));
    }

    const csvContent = rows.join('\r\n');
    const filename = `postal_account_contributions_${new Date().toISOString().split('T')[0]}.csv`;

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
