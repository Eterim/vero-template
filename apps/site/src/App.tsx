import { useEffect } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { Logo } from './components/Logo'
import { GithubIcon } from './components/GithubIcon'
import { LINKS } from './lib/links'
import Home from './pages/Home'
import Templates from './pages/Templates'
import TemplateDetail from './pages/TemplateDetail'
import DocPage from './pages/docs/DocPage'
import ComponentsIndex from './pages/docs/ComponentsIndex'
import ComponentPage from './pages/docs/ComponentPage'

/** Ao mudar de página vai para o topo; com #âncora, vai à secção. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function Nav() {
  const link = 'px-2 py-2 transition-colors hover:text-white'
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900 bg-black/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label="Vero Template - início"><Logo /></Link>
        <div className="flex items-center gap-1 text-sm font-semibold text-zinc-400 sm:gap-6">
          <Link to="/componentes" className={`hidden sm:block ${link}`}>Componentes</Link>
          <Link to="/templates" className={link}>Templates</Link>
          <Link to="/#como-funciona" className={`hidden md:block ${link}`}>Como funciona</Link>
          <Link to="/docs" className={`hidden md:block ${link}`}>Documentação</Link>
          <a href={LINKS.github} aria-label="GitHub" title="GitHub" className="p-2 transition-colors hover:text-white"><GithubIcon className="size-[18px]" /></a>
        </div>
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-zinc-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo />
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex gap-5 font-semibold text-zinc-400">
            <a href={LINKS.github} className="hover:text-white">GitHub</a>
            <a href={LINKS.npm} className="hover:text-white">npm</a>
            <Link to="/docs" className="hover:text-white">Documentação</Link>
          </div>
          <p>Open source, licença MIT. Feito pelo <a href="https://vero.ao" className="font-semibold text-zinc-200 hover:text-white">Vero</a>.</p>
        </div>
      </div>
    </footer>
  )
}

function OldTemplateLink() {
  const { slug } = useParams()
  return <Navigate to={`/templates/${slug ?? ''}`} replace />
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollManager />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/templates/:slug" element={<TemplateDetail />} />
          {/* Endereços antigos (/modelos) continuam a funcionar. */}
          <Route path="/modelos" element={<Navigate to="/templates" replace />} />
          <Route path="/modelos/:slug" element={<OldTemplateLink />} />
          <Route path="/docs" element={<DocPage />} />
          <Route path="/docs/:slug" element={<DocPage />} />
          <Route path="/componentes" element={<ComponentsIndex />} />
          <Route path="/componentes/:slug" element={<ComponentPage />} />
          <Route path="*" element={<TemplateDetail />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
