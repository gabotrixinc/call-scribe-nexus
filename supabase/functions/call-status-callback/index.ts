
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // For GET requests (webhook validation)
    if (req.method === 'GET') {
      return new Response('Twilio Status Callback Endpoint Active', {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }
    
    // Parse form data from Twilio callback
    const formData = await req.formData();
    const callSid = formData.get('CallSid');
    const callStatus = formData.get('CallStatus');
    const direction = formData.get('Direction');
    const duration = formData.get('CallDuration');
    
    console.log(`Recibido callback de Twilio: CallSid=${callSid}, Status=${callStatus}, Direction=${direction}`);
    
    // Connect to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Find the call in the database
    const { data: callData, error: callError } = await supabase
      .from('calls')
      .select()
      .eq('twilio_call_sid', callSid)
      .maybeSingle();
    
    if (callError) {
      console.error('Error retrieving call from database:', callError);
    }
    
    // Update call status if found
    if (callData) {
      let updateData = {};
      
      if (callStatus === 'completed' || callStatus === 'busy' || callStatus === 'no-answer' || callStatus === 'failed' || callStatus === 'canceled') {
        updateData = {
          status: 'completed',
          end_time: new Date().toISOString(),
          duration: duration ? parseInt(duration.toString(), 10) : null
        };
      } else if (callStatus === 'in-progress') {
        updateData = {
          status: 'active'
        };
      }
      
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('calls')
          .update(updateData)
          .eq('id', callData.id);
        
        if (updateError) {
          console.error('Error updating call status:', updateError);
        } else {
          console.log(`Call ${callData.id} updated with status: ${callStatus}`);
        }
      }
    } else {
      console.log(`No call found with Twilio SID: ${callSid}`);
    }
    
    // Return success response to Twilio
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    );
  } catch (error) {
    console.error('Error processing callback:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
