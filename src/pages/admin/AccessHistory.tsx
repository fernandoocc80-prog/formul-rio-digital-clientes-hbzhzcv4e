import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/AppContext'

export default function AccessHistory() {
  const { accessLogs, currentUser } = useAppStore()

  // Ensure data uniqueness per authenticated account to monitor account health
  const userLogs = accessLogs.filter((log) => log.userEmail === currentUser?.email)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Histórico de Acesso</h1>
        <p className="text-muted-foreground">
          Monitore os logins na sua conta para garantir a segurança.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tentativas de Login</CardTitle>
          <CardDescription>Registro das últimas sessões (sucesso e falha).</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data / Hora</TableHead>
                <TableHead className="hidden sm:table-cell">Dispositivo</TableHead>
                <TableHead>Navegador</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                userLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="font-medium">
                        {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{log.device}</TableCell>
                    <TableCell>
                      <div className="font-medium">{log.browser}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">{log.device}</div>
                    </TableCell>
                    <TableCell>
                      {log.status === 'success' ? (
                        <Badge className="bg-green-600 hover:bg-green-700">Sucesso</Badge>
                      ) : (
                        <Badge variant="destructive">Falha</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
