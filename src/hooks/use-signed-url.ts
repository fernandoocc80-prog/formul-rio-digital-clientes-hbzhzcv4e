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
        const signMarker = '/storage/v1/object/sign/'

        if (
          value.includes(publicMarker) ||
          value.includes(authMarker) ||
          value.includes(signMarker)
        ) {
          const marker = value.includes(publicMarker)
            ? publicMarker
            : value.includes(authMarker)
              ? authMarker
              : signMarker

          const parts = value.split(marker)[1]
          if (parts) {
            bucket = parts.split('/')[0]
            let fullPath = parts.substring(bucket.length + 1)
            if (fullPath.includes('?')) fullPath = fullPath.split('?')[0]
            filePath = fullPath
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

        let decodedPath = filePath
        try {
          decodedPath = decodeURIComponent(filePath)
        } catch (e) {
          // ignore
        }

        let { data, error } = await supabase.storage.from(bucket).createSignedUrl(decodedPath, 3600)

        if (error && decodedPath !== filePath) {
          const fallback = await supabase.storage.from(bucket).createSignedUrl(filePath, 3600)
          data = fallback.data
        }

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
