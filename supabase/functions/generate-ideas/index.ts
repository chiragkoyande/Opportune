import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { opportunity } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { title, organization, description, type, tags, prize, location } = opportunity;

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'internship') {
      systemPrompt = 'You are a career coach helping students prepare for internship interviews. Provide specific, actionable advice.';
      userPrompt = `Generate 4 specific interview prep tips for this internship opportunity:
      
Title: ${title}
Company: ${organization}
Description: ${description}
Location: ${location || 'Not specified'}
Tags: ${tags?.join(', ') || 'General'}

Provide tips that are specific to this company and role. Include:
1. A tip about researching the company
2. A technical preparation tip
3. A behavioral/soft skills tip
4. A unique tip based on the role/company

Format: Return ONLY a JSON array of 4 strings, each being a concise tip (max 100 characters each). No markdown, no explanation.
Example: ["Tip 1", "Tip 2", "Tip 3", "Tip 4"]`;
    } else if (type === 'hackathon') {
      systemPrompt = 'You are a hackathon mentor helping participants come up with innovative project ideas. Be creative and practical.';
      userPrompt = `Generate 4 unique project ideas for this hackathon:
      
Title: ${title}
Organizer: ${organization}
Description: ${description}
Prize: ${prize || 'Not specified'}
Tags/Themes: ${tags?.join(', ') || 'General'}

Create innovative, feasible project ideas that:
1. Align with the hackathon theme/tags
2. Could realistically be built in a hackathon timeframe
3. Would impress judges
4. Solve real problems

Format: Return ONLY a JSON array of 4 strings, each being a concise project idea (max 100 characters each). No markdown, no explanation.
Example: ["Project idea 1", "Project idea 2", "Project idea 3", "Project idea 4"]`;
    } else {
      systemPrompt = 'You are a competitive programming coach helping participants prepare for coding contests. Provide strategic advice.';
      userPrompt = `Generate 4 specific tips for this coding contest:
      
Title: ${title}
Platform: ${organization}
Description: ${description}
Prize: ${prize || 'Not specified'}
Tags: ${tags?.join(', ') || 'General'}

Provide strategic tips specific to this contest/platform:
1. A tip about the contest format/platform
2. A problem-solving strategy tip
3. A time management tip
4. A tip about practice resources

Format: Return ONLY a JSON array of 4 strings, each being a concise tip (max 100 characters each). No markdown, no explanation.
Example: ["Tip 1", "Tip 2", "Tip 3", "Tip 4"]`;
    }

    console.log('Generating ideas for:', title, 'Type:', type);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response:', content);

    // Parse the JSON array from the response
    let ideas: string[];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        ideas = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response, using fallback:', parseError);
      // Fallback to splitting by newlines if JSON parsing fails
      ideas = content.split('\n').filter((line: string) => line.trim()).slice(0, 4);
    }

    return new Response(JSON.stringify({ ideas }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in generate-ideas function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
