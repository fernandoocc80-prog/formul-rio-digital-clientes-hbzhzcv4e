CREATE TABLE IF NOT EXISTS public.form_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + interval '30 days',
    UNIQUE (user_id, form_id)
);

ALTER TABLE public.form_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own drafts" ON public.form_drafts
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Update sample form to include validation rules
UPDATE forms SET schema = '{
    "sections": [
      {
        "id": "s1",
        "title": "Informações Iniciais",
        "questions": [
          { "id": "q1", "type": "text", "label": "Qual é o seu nome?", "required": true, "validation": { "maxLength": 100 } },
          { "id": "q2", "type": "choice", "label": "Você possui veículo próprio?", "options": ["Sim", "Não"], "logic": { "if": "Sim", "goTo": "s_veiculo" }, "required": true }
        ]
      },
      {
        "id": "s_veiculo",
        "title": "Detalhes do Veículo",
        "questions": [
          { "id": "q3", "type": "text", "label": "Qual é o modelo do veículo?", "required": true },
          { "id": "q_ano", "type": "text", "label": "Qual é o ano do veículo?" }
        ]
      },
      {
        "id": "s2",
        "title": "Finalização",
        "questions": [
          { "id": "q4", "type": "textarea", "label": "Comentários adicionais sobre sua mobilidade diária" },
          { "id": "q5", "type": "text", "label": "E-mail de contato", "required": true, "validation": { "email": true } }
        ]
      }
    ]
  }'::jsonb
WHERE id = '00000000-0000-0000-0000-000000000002';
