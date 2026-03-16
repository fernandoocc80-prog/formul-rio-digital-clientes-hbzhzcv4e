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

        if (value.includes('/storage/v1/object/public/')) {
          const urlObj = new URL(value)
          const pathParts = urlObj.pathname.split('/storage/v1/object/public/')[1]
          if (pathParts) {
            bucket = pathParts.split('/')[0]
            filePath = decodeURIComponent(pathParts.substring(bucket.length + 1))
          }
        } else if (value.includes('/storage/v1/object/authenticated/')) {
          const urlObj = new URL(value)
          const pathParts = urlObj.pathname.split('/storage/v1/object/authenticated/')[1]
          if (pathParts) {
            bucket = pathParts.split('/')[0]
            filePath = decodeURIComponent(pathParts.substring(bucket.length + 1))
          }
        } else if (value.startsWith('http')) {
          if (isMounted) setUrl(value)
          return
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
