import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, pin } = body;

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID!, serviceAccountAuth);
    await doc.loadInfo(); 

    const sheet = doc.sheetsByTitle['Users']; 
    
    if (!sheet) {
      return NextResponse.json(
        { success: false, message: 'Tab "Users" tidak ditemukan di Spreadsheet' }, 
        { status: 500 }
      );
    }
    const rows = await sheet.getRows();

    const userFound = rows.find(row => row.get('username') === username);

    if (!userFound) {
      return NextResponse.json(
        { success: false, message: 'Username tidak ditemukan' }, 
        { status: 404 }
      );
    }

    if (userFound.get('pin') === pin) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Login berhasil!',
          data: { 
            username: userFound.get('username'),
            department: userFound.get('department')
        }
        }, 
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'Password salah' }, 
        { status: 401 }
      );
    }
    
  } catch (error: any) {
    console.error("Terjadi error saat autentikasi:", error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses login', details: error.message }, 
      { status: 500 }
    );
  }
}