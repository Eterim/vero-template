import { Navigate, useParams } from 'react-router-dom'
import { DocsLayout } from './DocsLayout'
import { findDoc } from './content'

export default function DocPage() {
  const { slug = 'introducao' } = useParams()
  const doc = findDoc(slug)
  if (!doc) return <Navigate to="/docs" replace />
  return <DocsLayout key={slug}>{doc.render()}</DocsLayout>
}
