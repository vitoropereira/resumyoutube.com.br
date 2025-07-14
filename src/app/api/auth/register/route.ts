import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    console.log('Registration API called');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { name, email, password } = body;

    if (!name || !email || !password) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    console.log('Creating admin client...');
    const adminClient = createAdminClient();

    // Criar usuário usando admin client para bypassing triggers
    console.log('Attempting to create user with admin client:', email);
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: name,
      },
      email_confirm: true // Auto-confirm email since we're using admin
    });

    console.log('Admin user creation result:', { user: !!authData?.user, error: authError });

    if (authError) {
      console.error('Admin auth error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (authData.user) {
      // Criar perfil na tabela users
      console.log('Creating user profile...');
      const { data: profileData, error: profileError } = await adminClient
        .from('users')
        .insert({
          id: authData.user.id,
          name,
          email,
          phone_number: null,
          subscription_status: 'inactive',
          max_channels: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the registration, just log the error
      } else {
        console.log('Profile created successfully:', profileData);
      }
    }

    return NextResponse.json({
      message: "Usuário criado com sucesso",
      user: authData.user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
