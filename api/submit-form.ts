import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const sheetWebhookUrl = process.env.SHEET_WEBHOOK_URL;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, business_name, email, ai_role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('submissions')
      .insert([{ name, business_name, email, ai_role }]);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    // Send to Google Sheets webhook
    if (sheetWebhookUrl) {
      try {
        await fetch(sheetWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            business_name,
            email,
            ai_role,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (sheetError) {
        console.warn('Sheet webhook failed:', sheetError);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      data,
    });
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}