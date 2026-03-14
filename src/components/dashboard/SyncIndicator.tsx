import { RefreshCw, CloudOff, CheckCircle2, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppStore } from '@/store/AppContext'
import { cn } from '@/lib/utils'

export function SyncIndicator() {
  const { syncStatus, lastSyncAt, syncError, syncSubmissions } = useAppStore()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={syncStatus === 'error' ? 'destructive' : 'secondary'}
          className={cn(
            'flex items-center gap-1.5 font-normal cursor-pointer transition-colors select-none',
            syncStatus !== 'error' && 'hover:bg-muted/80',
          )}
          onClick={syncSubmissions}
        >
          {syncStatus === 'syncing' ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : syncStatus === 'error' ? (
            <CloudOff className="h-3 w-3" />
          ) : (
            <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-500" />
          )}
          <span className="hidden sm:inline">
            {syncStatus === 'syncing'
              ? 'Sincronizando...'
              : syncStatus === 'error'
                ? 'Offline / Erro'
                : lastSyncAt
                  ? `Sincronizado ${formatDistanceToNow(lastSyncAt, { addSuffix: true, locale: ptBR })}`
                  : 'Sincronizado'}
          </span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start" className="max-w-[250px] p-3">
        {syncStatus === 'error' ? (
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-destructive flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Problema de Conexão
            </span>
            <span className="text-muted-foreground text-xs leading-relaxed">
              {syncError || 'Não foi possível sincronizar os dados. Verifique sua internet.'}
            </span>
          </div>
        ) : (
          <span className="text-xs leading-relaxed">
            Dados atualizados em tempo real com a nuvem. Clique para forçar a sincronização.
          </span>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
