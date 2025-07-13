import { NextRequest, NextResponse } from 'next/server'
import { getChannelInfo } from '@/lib/youtube'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL é obrigatória' },
        { status: 400 }
      )
    }

    const channelInfo = await getChannelInfo(url)

    if (!channelInfo) {
      return NextResponse.json(
        { error: 'Canal não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(channelInfo)
  } catch (error) {
    console.error('Error fetching channel info:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}