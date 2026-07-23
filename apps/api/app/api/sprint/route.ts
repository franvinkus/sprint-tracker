import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

function getAuth() {
  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function GET() {
  try {

    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID!, getAuth());
    await doc.loadInfo(); 

    const sheetTitle = 'TASK LIST';
    const range = `'${sheetTitle}'!B9:V`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;

    const response = await getAuth().request({ url });
    const rows = (response.data as any).values || [];

    const taskList = rows.map((row: any[]) => ({
      code: row[0] || '',                 // Column 1: CODE
      reporter: row[1] || '',             // Column 2: Reporter / Requestor
      developer: row[2] || '',            // Column 3: Developer
      taskName: row[3] || '',             // Column 4: TASK NAME
      subjectMail: row[4] || '',          // Column 5: Subject Mail / Description
      supportTicket: row[5] || '',        // Column 6: Support Ticket
      module: row[6] || '',               // Column 7: Module
      subModule: row[7] ? row[7].split(',').map((item: string) => item.trim()) : [],            // Column 8: Sub Module
      kompleksitas: row[8] || '',         // Column 9: Kompleksitas
      issueCategory: row[9] || '',        // Column 10: Issue Category
      status: row[10] || '',              // Column 11: STATUS
      submissionDate: row[11] || '',      // Column 12: Submission Date
      completionTarget: row[12] || '',    // Column 13: Completion Target
      actualStart: row[13] || '',         // Column 14: Actual Start
      actualCompletion: row[14] || '',    // Column 15: Actual Completion
      holdDate: row[15] || '',            // Column 16: Hold Date
      holdDuration: row[16] || '',        // Column 17: Hold Duration (Days)
      sla: row[17] || '',                 // Column 18: SLA
      taskAging: row[18] || '',           // Column 19: TASK AGING
      channelSource: row[19] || '',       // Column 20: Channel Source
      remark: row[20] || '',              // Column 21: REMARK / KNOWLEDGE BASE
    }));

    const cleanTaskList = taskList.filter((task: any) => {
      return task.code && (task.code.includes('/') || task.code.includes('-'));
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const range = `'TASK LIST'!B9:V`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SPREADSHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

    const rowData = [
      '',
      body.code || '',                     // Column B: CODE
      body.reporter || '',                 // Column C: Reporter
      body.assignee || body.developer || '', // Column D: Developer (bisa dari assignee modal)
      body.title || body.task || body.taskName || '',                 // Column E: TASK NAME
      body.description || body.subjectMail || '', // Column F: Subject / Description
      body.supportTicket || '',            // Column G: Support Ticket
      body.module || '',                   // Column H: Module
      body.subModule || '',                // Column I: Sub Module
      body.kompleksitas || '',             // Column J: Kompleksitas
      body.issueCategory || '',            // Column K: Issue Category
      body.status || 'TO DO',              // Column L: STATUS
      body.submissionDate || '',           // Column M: Submission Date
      body.completionTarget || '',         // Column N: Completion Target
      body.actualStart || '',              // Column O: Actual Start
      body.actualCompletion || '',         // Column P: Actual Completion
      body.holdDate || '',                 // Column Q: Hold Date
      body.holdDuration || '',             // Column R: Hold Duration
      body.slaStatus || body.sla || '',    // Column S: SLA
      body.taskAging || '',                // Column T: TASK AGING
      body.channelSource || '',            // Column U: Channel Source
      body.remark || ''                    // Column V: REMARK
    ];

    await getAuth().request({
      url,
      method: 'POST',
      data: {
        values: [rowData]
      }
    });

    return NextResponse.json({ 
      status: 'Success',
      message: 'Task baru berhasil ditambahkan' 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Terjadi error saat menambah data:", error);
    return NextResponse.json(
      { error: 'Gagal menambah data ke Spreadsheet', details: error.message }, 
      { status: 500 }
    );
  }
}