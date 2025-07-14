import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    // Get all tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')

    if (tablesError) {
      return NextResponse.json({ error: 'Failed to fetch tables', details: tablesError }, { status: 500 })
    }

    // Get structure for each table
    const schema: any = {}
    
    for (const table of tables || []) {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', table.table_name)
        .order('ordinal_position')

      if (!columnsError) {
        schema[table.table_name] = columns
      }
    }

    return NextResponse.json({
      tables: tables?.map(t => t.table_name) || [],
      schema
    })
  } catch (error) {
    console.error('Error fetching schema:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}