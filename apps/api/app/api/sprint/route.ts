import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function GET() {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID!, serviceAccountAuth);
    await doc.loadInfo(); 

    const sheetTitle = doc.sheetsByIndex[1].title;
    const range = `'${sheetTitle}'!B9:I`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;

    const response = await serviceAccountAuth.request({ url });
    const rows = (response.data as any).values || [];

    const taskList = rows.map((row: any[]) => ({
      taskId: row[0] || '',       // Kolom B: CODE
      taskName: row[1] || '',     // Kolom C: TASK NAME
      requestor: row[2] || '',    // Kolom D: REQUESTOR
      developer: row[3] || '',    // Kolom E: Developer
      department: row[4] || '',   // Kolom F: DEPT
      status: row[5] || '',       // Kolom G: STATUS
      storyPoints: row[6] || '',  // Kolom H: STORY POINTS
      progressPoints: row[7] || '', // Kolom I: Recent of Story Point
    }));

    const cleanTaskList = taskList.filter((task: any) => {
      return task.taskId && task.taskId.includes('/');
    });

    return NextResponse.json({ 
      namaTabYangDibaca: sheetTitle, 
      dataMentah: cleanTaskList 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Terjadi error saat menarik data:", error);
    return NextResponse.json(
      { error: 'Gagal mengambil data dari Spreadsheet', details: error.message }, 
      { status: 500 }
    );
  }
}