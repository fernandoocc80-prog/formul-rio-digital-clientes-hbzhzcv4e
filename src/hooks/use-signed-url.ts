import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'

export const useSignedUrl = (value?: string | null) => {
  const [url, setUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const getUrl = async () => {
      if (!value) return

      if (value.startsWith('http') && !value.includes('/storage/v1/object/')) {
        if (isMounted) {
          setUrl(value)
          setLoading(false)
        }
        return
      }

      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          navigate('/login')
          return
        }

        let bucket = 'documents'
        let filePath = value

        const publicMarker = '/storage/v1/object/public/'
        const authMarker = '/storage/v1/object/authenticated/'

        if (value.includes(publicMarker) || value.includes(authMarker)) {
          const marker = value.includes(publicMarker) ? publicMarker : authMarker
          const parts = value.split(marker)[1]
          if (parts) {
            bucket = parts.split('/')[0]
            let fullPath = parts.substring(bucket.length + 1)
            if (fullPath.includes('?')) fullPath = fullPath.split('?')[0]
            filePath = decodeURIComponent(fullPath)
          }
        } else if (value.startsWith('http')) {
          if (isMounted) {
            setUrl(value)
            setLoading(false)
          }
          return
        } else {
          if (filePath.includes('?')) filePath = filePath.split('?')[0]
        }

        const { data } = await supabase.storage.from(bucket).createSignedUrl(filePath, 3600)

        if (data?.signedUrl && isMounted) {
          setUrl(data.signedUrl)
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    getUrl()

    return () => {
      isMounted = false
    }
  }, [value, navigate])

  return { url, loading }
}
