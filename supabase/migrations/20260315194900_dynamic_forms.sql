ALTER TABLE forms ADD COLUMN IF NOT EXISTS schema JSONB;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS settings JSONB;

-- Update existing form
UPDATE forms SET 
  settings = '{"themeColor": "#2563eb", "title": "Abertura de Empresa"}'::jsonb 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Insert dynamic form sample
INSERT INTO forms (id, title, description, schema, settings) VALUES (
  '00000000-0000-0000-0000-000000000002', 
  'Pesquisa de Mobilidade', 
  'Formulário dinâmico com lógica',
  '{
    "sections": [
      {
        "id": "s1",
        "title": "Informações Iniciais",
        "questions": [
          { "id": "q1", "type": "text", "label": "Qual é o seu nome?" },
          { "id": "q2", "type": "choice", "label": "Você possui veículo próprio?", "options": ["Sim", "Não"], "logic": { "if": "Sim", "goTo": "s_veiculo" } }
        ]
      },
      {
        "id": "s_veiculo",
        "title": "Detalhes do Veículo",
        "questions": [
          { "id": "q3", "type": "text", "label": "Qual é o modelo do veículo?" },
          { "id": "q_ano", "type": "text", "label": "Qual é o ano do veículo?" }
        ]
      },
      {
        "id": "s2",
        "title": "Finalização",
        "questions": [
          { "id": "q4", "type": "textarea", "label": "Comentários adicionais sobre sua mobilidade diária" }
        ]
      }
    ]
  }'::jsonb,
  '{"themeColor": "#16a34a", "title": "Pesquisa de Mobilidade"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
