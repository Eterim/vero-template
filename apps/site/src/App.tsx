import { useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { Logo } from './components/Logo'
import Home from './pages/Home'
import Templates from './pages/Templates'
import TemplateDetail from './pages/TemplateDetail'

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
          <Link to="/#componentes" className={`hidden sm:block ${link}`}>Componentes</Link>
          <Link to="/modelos" className={link}>Modelos</Link>
          <Link to="/#como-funciona" className={`hidden md:block ${link}`}>Como funciona</Link>
          <span className="hidden px-2 py-2 text-zinc-700 md:block" title="Com a versão 0.1">Documentação</span>
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
        <p>Open source, licença MIT. Feito pelo <a href="https://vero.ao" className="font-semibold text-zinc-200 hover:text-white">Vero</a>.</p>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/modelos" element={<Templates />} />
          <Route path="/modelos/:slug" element={<TemplateDetail />} />
          <Route path="*" element={<TemplateDetail />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
