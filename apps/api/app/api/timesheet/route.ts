import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, taskName, pic, percentage, remark } = body;

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID!, serviceAccountAuth);
    await doc.loadInfo(); 
    const sheet = doc.sheetsByTitle['TimeShit']; 

    if (!sheet) {
      return NextResponse.json({ success: false, message: 'Tab tidak ditemukan' }, { status: 404 });
    }

    
    const today = new Date();
    const dateFormatted = today.toLocaleDateString('id-ID'); // Format: DD/MM/YYYY

    await sheet.addRow({
      'Date': dateFormatted,
      'Task-id': taskId,
      'Task name': taskName,
      'PIC': pic,
      'Percentage': percentage,
      'Remark': remark,
    });

    return NextResponse.json(
      { success: true, message: 'Berhasil input timesheet' }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error insert ke Sheets:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal memproses data',
        // Tampilkan pesan error asli dari Google
        detail: error.message || error.toString() 
      }, 
      { status: 500 }
    );
  }
}