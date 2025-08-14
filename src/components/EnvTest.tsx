import React from 'react';

const EnvTest = () => {
  const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const emailjsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL;

  console.log('=== TESTE DE VARIÁVEIS DE AMBIENTE ===');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'DEFINIDA' : 'UNDEFINED');
  console.log('VITE_EMAILJS_SERVICE_ID:', emailjsServiceId);
  console.log('VITE_EMAILJS_TEMPLATE_ID:', emailjsTemplateId);
  console.log('VITE_EMAILJS_PUBLIC_KEY:', emailjsPublicKey);
  console.log('VITE_CONTACT_EMAIL:', contactEmail);
  console.log('========================================');

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      left: '10px', 
      background: 'black', 
      color: 'white', 
      padding: '10px', 
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Variáveis de Ambiente:</h4>
      <p>SUPABASE_URL: {supabaseUrl || 'UNDEFINED'}</p>
      <p>SUPABASE_KEY: {supabaseKey ? 'DEFINIDA' : 'UNDEFINED'}</p>
      <p>EMAILJS_SERVICE: {emailjsServiceId || 'UNDEFINED'}</p>
      <p>EMAILJS_TEMPLATE: {emailjsTemplateId || 'UNDEFINED'}</p>
      <p>EMAILJS_PUBLIC: {emailjsPublicKey || 'UNDEFINED'}</p>
      <p>CONTACT_EMAIL: {contactEmail || 'UNDEFINED'}</p>
    </div>
  );
};

export default EnvTest;