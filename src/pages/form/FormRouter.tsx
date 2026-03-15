import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import ClientForm from './ClientForm'
import DynamicFormViewer from './DynamicFormViewer'
import { Loader2 } from 'lucide-react'

export default function FormRouter() {
  const { id } = useParams<{ id: string }>()
  const [formDef, setFormDef] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || id === 'new') {
      setLoading(false)
      return
    }

    const fetchForm = async () => {
      try {
        const { data, error } = await supabase.from('forms').select('*').eq('id', id).single()
        if (!error && data) {
          setFormDef(data)
        }
      } catch (err) {
        console.error('Error fetching form:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchForm()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (formDef && formDef.schema) {
    return <DynamicFormViewer formDef={formDef} />
  }

  return <ClientForm />
}
