import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t bg-white py-6 md:py-0 mt-auto no-print">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} EmpresaFlow. Todos os direitos reservados.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link to="#" className="hover:underline">
            Suporte
          </Link>
          <Link to="#" className="hover:underline">
            Termos
          </Link>
        </div>
      </div>
    </footer>
  )
}
