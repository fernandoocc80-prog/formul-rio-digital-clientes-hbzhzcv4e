import { useState } from 'react'
import { Shield, KeyRound, Laptop, Smartphone, Trash2, SmartphoneNfc } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/store/AppContext'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

export default function Settings() {
  const { currentUser, sessions, currentSessionId, changePassword, toggle2FA, disconnectSession } =
    useAppStore()
  const { toast } = useToast()

  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) {
      toast({
        title: 'Senhas não conferem',
        description: 'A nova senha e a confirmação devem ser idênticas.',
        variant: 'destructive',
      })
      return
    }
    if (newPass.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A nova senha deve ter no mínimo 6 caracteres.',
        variant: 'destructive',
      })
      return
    }
    const success = changePassword(currentPass, newPass)
    if (success) {
      toast({
        title: 'Senha alterada com sucesso!',
        description: 'Sua credencial de acesso foi atualizada.',
      })
      setCurrentPass('')
      setNewPass('')
      setConfirmPass('')
    } else {
      toast({
        title: 'Ação não permitida',
        description: 'A senha atual informada está incorreta.',
        variant: 'destructive',
      })
    }
  }

  const userSessions = sessions.filter((s) => s.userId === currentUser?.id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Configurações da Conta</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências de segurança e dispositivos conectados.
        </p>
      </div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" /> Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <KeyRound className="h-5 w-5 text-primary" /> Alterar Senha
              </CardTitle>
              <CardDescription>
                Atualize sua senha de acesso periodicamente para manter sua conta protegida.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPass">Senha Atual</Label>
                  <Input
                    id="currentPass"
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPass">Nova Senha</Label>
                  <Input
                    id="newPass"
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPass">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPass"
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto mt-2">
                  Atualizar Senha
                </Button>
              </form>
            </CardContent>
          </Card>

          {currentUser?.role === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <SmartphoneNfc className="h-5 w-5 text-primary" /> Autenticação em Duas Etapas
                  (2FA)
                </CardTitle>
                <CardDescription>
                  Adicione uma camada extra de segurança para contas administrativas altamente
                  privilegiadas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border rounded-lg bg-slate-50/50 gap-4">
                  <div className="space-y-1 pr-4">
                    <Label className="text-base font-semibold">Habilitar Token de Segurança</Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Ao ativar este recurso, você precisará inserir um código de verificação sempre
                      que fizer login em um novo dispositivo.
                    </p>
                  </div>
                  <Switch
                    checked={currentUser.twoFactorEnabled || false}
                    onCheckedChange={(checked) => {
                      toggle2FA(checked)
                      toast({
                        title: checked ? '2FA Habilitado' : '2FA Desabilitado',
                        description: checked
                          ? 'O login agora exige verificação em duas etapas.'
                          : 'A verificação adicional foi removida.',
                      })
                    }}
                    className="shrink-0"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Laptop className="h-5 w-5 text-primary" /> Dispositivos Conectados
              </CardTitle>
              <CardDescription>
                Lista de sessões ativas na sua conta. Desconecte remotamente os dispositivos que
                você não reconhece ou não utiliza mais.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userSessions.map((session) => {
                  const isCurrent = session.id === currentSessionId
                  return (
                    <div
                      key={session.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:border-primary/30 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-100 rounded-full shrink-0">
                          {session.device === 'Mobile' ? (
                            <Smartphone className="h-6 w-6 text-slate-600" />
                          ) : (
                            <Laptop className="h-6 w-6 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2 flex-wrap text-slate-800">
                            {session.device} - {session.browser}
                            {isCurrent && (
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-2 py-0.5"
                              >
                                Sessão Atual
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Último acesso: {new Date(session.lastActive).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      {!isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 sm:w-auto w-full"
                          onClick={() => {
                            disconnectSession(session.id)
                            toast({
                              title: 'Sessão encerrada remotamente',
                              description: 'O dispositivo foi desconectado com sucesso.',
                            })
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Desconectar
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
