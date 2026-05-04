import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Blog CMS</h1>
      <p>Welcome to the Lisa Galea blog admin interface.</p>
      <Link href="/admin">Go to Admin Panel</Link>
    </main>
  )
}
