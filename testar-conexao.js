/**
 * Script para testar a conexão com o banco de dados
 * Execute: node testar-conexao.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testarConexao() {
  console.log('🔍 Testando conexão com o banco de dados...\n');
  
  // Mostra a URL (sem mostrar a senha completa)
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ ERRO: DATABASE_URL não encontrada no .env');
    process.exit(1);
  }
  
  // Mascara a senha na URL para mostrar
  const urlMascarada = dbUrl.replace(/:([^:@]+)@/, ':***@');
  console.log('📋 URL de conexão:', urlMascarada);
  console.log('');
  
  const prisma = new PrismaClient();
  
  try {
    console.log('⏳ Tentando conectar...');
    
    // Tenta fazer uma query simples
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testa uma query
    const resultado = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query de teste executada:', resultado);
    
    // Verifica se as tabelas existem
    const tabelas = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('\n📊 Tabelas encontradas:');
    tabelas.forEach(t => console.log(`   - ${t.table_name}`));
    
    console.log('\n🎉 Tudo funcionando! A conexão está OK.');
    
  } catch (error) {
    console.error('\n❌ ERRO na conexão:');
    console.error('Código:', error.code);
    console.error('Mensagem:', error.message);
    
    if (error.code === 'P1001') {
      console.error('\n💡 Dica: O servidor não está acessível. Verifique:');
      console.error('   1. Se o projeto está ACTIVE no Supabase');
      console.error('   2. Se a URL está correta');
      console.error('   3. Se há restrições de IP/firewall');
    } else if (error.code === 'P1000') {
      console.error('\n💡 Dica: Credenciais inválidas. Verifique:');
      console.error('   1. Se a senha está correta');
      console.error('   2. Se a senha não tem caracteres especiais que precisam ser codificados');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testarConexao();
